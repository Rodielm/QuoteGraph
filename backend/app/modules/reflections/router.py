from fastapi import APIRouter, Depends, status
from neo4j import Session

from app.core.database import get_session
from app.dependencies import get_current_user
from app.modules.quotes.favorites_repository import quote_exists
from app.modules.reflections.models import ReflectionCreate, ReflectionPublic
from app.modules.reflections.repository import delete_reflection, get_reflection, upsert_reflection
from app.modules.users.models import UserPublic
from app.shared.exceptions import QuoteNotFoundError

router = APIRouter(prefix="/quotes/{quote_id}/reflection", tags=["reflections"])

DependsSession = Depends(get_session)
DependsCurrentUser = Depends(get_current_user)


@router.get("", response_model=ReflectionPublic | None)
def get_my_reflection(
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> ReflectionPublic | None:
    return get_reflection(session, user_id=current_user.id, quote_id=quote_id)


@router.put("", response_model=ReflectionPublic)
def save_my_reflection(
    quote_id: str,
    payload: ReflectionCreate,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> ReflectionPublic:
    if not quote_exists(session, quote_id):
        raise QuoteNotFoundError()
    return upsert_reflection(session, user_id=current_user.id, quote_id=quote_id, text=payload.text)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_reflection(
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> None:
    delete_reflection(session, user_id=current_user.id, quote_id=quote_id)
