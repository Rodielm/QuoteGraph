import math

from fastapi import APIRouter, Depends, Query, status
from neo4j import Session

from app.core.database import get_session
from app.dependencies import get_current_user
from app.modules.quotes.favorites_repository import (
    add_favorite,
    is_favorited,
    quote_exists,
    remove_favorite,
)
from app.modules.quotes.models import FavoriteStatus, QuoteListResponse
from app.modules.quotes.repository import count_quotes, list_quotes
from app.modules.users.models import UserPublic
from app.shared.exceptions import QuoteNotFoundError

router = APIRouter(prefix="/quotes", tags=["quotes"])

DependsSession = Depends(get_session)
DependsCurrentUser = Depends(get_current_user)


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


@router.put("/{quote_id}/favorite", response_model=FavoriteStatus, status_code=status.HTTP_200_OK)
def favorite_quote(
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> FavoriteStatus:
    if not quote_exists(session, quote_id):
        raise QuoteNotFoundError()
    add_favorite(session, user_id=current_user.id, quote_id=quote_id)
    return FavoriteStatus(isFavorited=True)


@router.delete("/{quote_id}/favorite", response_model=FavoriteStatus)
def unfavorite_quote(
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> FavoriteStatus:
    if not quote_exists(session, quote_id):
        raise QuoteNotFoundError()
    remove_favorite(session, user_id=current_user.id, quote_id=quote_id)
    return FavoriteStatus(isFavorited=False)


@router.get("/{quote_id}/favorite", response_model=FavoriteStatus)
def get_favorite_status(
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> FavoriteStatus:
    if not quote_exists(session, quote_id):
        raise QuoteNotFoundError()
    return FavoriteStatus(isFavorited=is_favorited(session, user_id=current_user.id, quote_id=quote_id))
