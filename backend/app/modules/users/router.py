from fastapi import APIRouter, Depends
from neo4j import Session

from app.core.database import get_session
from app.dependencies import get_current_user
from app.modules.quotes.favorites_repository import list_favorite_quotes
from app.modules.quotes.models import QuotePublic
from app.modules.reflections.models import ReflectedQuote
from app.modules.reflections.repository import list_reflections
from app.modules.users.models import UserPublic

router = APIRouter(prefix="/users", tags=["users"])
DependsCurrentUser = Depends(get_current_user)
DependsSession = Depends(get_session)


@router.get("/me", response_model=UserPublic)
def read_current_user(current_user: UserPublic = DependsCurrentUser) -> UserPublic:
    return current_user


@router.get("/me/favorites", response_model=list[QuotePublic])
def read_current_user_favorites(
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> list[QuotePublic]:
    return list_favorite_quotes(session, user_id=current_user.id)


@router.get("/me/reflections", response_model=list[ReflectedQuote])
def read_current_user_reflections(
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> list[ReflectedQuote]:
    return list_reflections(session, user_id=current_user.id)
