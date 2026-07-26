import math

from fastapi import APIRouter, Depends, Query
from neo4j import Session

from app.core.database import get_session
from app.modules.quotes.models import QuoteListResponse
from app.modules.quotes.repository import count_quotes, list_quotes

router = APIRouter(prefix="/quotes", tags=["quotes"])

DependsSession = Depends(get_session)


@router.get("", response_model=QuoteListResponse)
def get_quotes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=150),
    author: str | None = Query(default=None, description="Filter by author slug"),
    tag: str | None = Query(default=None, description="Filter by topic name"),
    q: str | None = Query(default=None, description="Search within quote text"),
    session: Session = DependsSession,
) -> QuoteListResponse:
    total_count = count_quotes(session, author_slug=author, tag=tag, q=q)
    items = list_quotes(session, page=page, limit=limit, author_slug=author, tag=tag, q=q)
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 0

    return QuoteListResponse(
        items=items,
        page=page,
        limit=limit,
        totalCount=total_count,
        totalPages=total_pages,
    )
