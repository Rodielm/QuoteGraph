from neo4j import Session

from app.modules.quotes.models import AuthorSummary, QuotePublic


def _build_match_clause(author_slug: str | None, tag: str | None, q: str | None) -> tuple[str, dict]:
    clauses = ["(a:Author)-[:WROTE]->(quote:Quote)"]
    params: dict = {}

    if tag is not None:
        clauses[0] = "(a:Author)-[:WROTE]->(quote:Quote)-[:HAS_TOPIC]->(:Topic {name: $tag})"
        params["tag"] = tag

    where_parts = []
    if author_slug is not None:
        where_parts.append("a.slug = $author_slug")
        params["author_slug"] = author_slug
    if q is not None:
        where_parts.append("toLower(quote.text) CONTAINS toLower($q)")
        params["q"] = q

    where_clause = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""
    match_clause = f"MATCH {clauses[0]} {where_clause}"
    return match_clause, params


def to_quote_public(record) -> QuotePublic:
    return QuotePublic(
        id=record["id"],
        text=record["text"],
        author=AuthorSummary(name=record["author_name"], slug=record["author_slug"]),
        tags=record["tags"],
    )


def count_quotes(
    session: Session, author_slug: str | None, tag: str | None, q: str | None
) -> int:
    match_clause, params = _build_match_clause(author_slug, tag, q)
    result = session.run(f"{match_clause} RETURN count(quote) AS total", **params)
    return result.single()["total"]


def list_quotes(
    session: Session,
    page: int,
    limit: int,
    author_slug: str | None,
    tag: str | None,
    q: str | None,
) -> list[QuotePublic]:
    match_clause, params = _build_match_clause(author_slug, tag, q)
    params["skip"] = (page - 1) * limit
    params["limit"] = limit

    query = f"""
    {match_clause}
    OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(t:Topic)
    WITH quote, a, collect(t.name) AS tags
    RETURN quote.id AS id, quote.text AS text, a.name AS author_name, a.slug AS author_slug, tags
    ORDER BY quote.id
    SKIP $skip LIMIT $limit
    """
    result = session.run(query, **params)
    return [_to_quote_public(record) for record in result]
