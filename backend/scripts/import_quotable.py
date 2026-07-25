"""Seed Neo4j with quotes from the Quotable API (https://github.com/lukePeavey/quotable).

Usage (from the backend/ directory):
    uv run python -m scripts.import_quotable [--pages N] [--limit N]
"""

import argparse
import sys
import uuid

import httpx
from pydantic import BaseModel

from app.core.database import get_driver

# NOTE: Using http instead of https as a temporary workaround —
# api.quotable.io's TLS certificate is currently expired server-side
# (confirmed 2026-07-25, not a local/client issue). Revert to https
# once the provider renews it.
QUOTABLE_BASE_URL = "http://api.quotable.io"


class QuotableQuote(BaseModel):
    id: str
    content: str
    author: str
    authorSlug: str
    tags: list[str]


class QuotableResponse(BaseModel):
    page: int
    totalPages: int
    results: list[QuotableQuote]


def fetch_page(client: httpx.Client, page: int, limit: int) -> QuotableResponse:
    response = client.get("/quotes", params={"page": page, "limit": limit})
    response.raise_for_status()
    data = response.json()
    data["results"] = [
        {**r, "id": r["_id"]} for r in data["results"]
    ]
    return QuotableResponse(**data)


def import_quote(session, quote: QuotableQuote) -> None:
    session.run(
        """
        MERGE (q:Quote {externalId: $external_id})
        ON CREATE SET q.id = $id, q.text = $text, q.source = "quotable"

        MERGE (a:Author {slug: $author_slug})
        ON CREATE SET a.name = $author
        MERGE (a)-[:WROTE]->(q)

        WITH q
        UNWIND $tags AS tag_name
        MERGE (t:Topic {name: tag_name})
        MERGE (q)-[:HAS_TOPIC]->(t)
        """,
        external_id=quote.id,
        id=str(uuid.uuid4()),
        text=quote.content,
        author=quote.author,
        author_slug=quote.authorSlug,
        tags=quote.tags,
    )


def run(pages: int, limit: int) -> None:
    driver = get_driver()
    imported = 0

    with httpx.Client(base_url=QUOTABLE_BASE_URL, timeout=10.0) as client, driver.session() as session:
        for page in range(1, pages + 1):
            data = fetch_page(client, page=page, limit=limit)
            for quote in data.results:
                import_quote(session, quote)
                imported += 1
            print(f"page {page}/{data.totalPages}: {len(data.results)} quotes imported")

            if page >= data.totalPages:
                break

    print(f"done. {imported} quotes processed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pages", type=int, default=5, help="number of pages to fetch")
    parser.add_argument("--limit", type=int, default=20, help="quotes per page (max 150)")
    args = parser.parse_args()

    try:
        run(pages=args.pages, limit=args.limit)
    except httpx.HTTPStatusError as exc:
        print(f"Quotable API error: {exc.response.status_code} {exc.response.text}", file=sys.stderr)
        sys.exit(1)
