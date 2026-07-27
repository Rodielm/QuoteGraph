from fastapi import APIRouter, Depends, status
from neo4j import Session

from app.core.database import get_session
from app.dependencies import get_current_user
from app.modules.collections.models import (
    CollectionCreate,
    CollectionDetail,
    CollectionPublic,
    CollectionUpdate,
)
from app.modules.collections.repository import (
    add_quote_to_collection,
    create_collection,
    delete_collection,
    get_collection_detail,
    get_owned_collection,
    list_collections,
    remove_quote_from_collection,
    rename_collection,
)
from app.modules.quotes.favorites_repository import quote_exists
from app.modules.users.models import UserPublic
from app.shared.exceptions import CollectionNotFoundError, QuoteNotFoundError

router = APIRouter(prefix="/collections", tags=["collections"])

DependsSession = Depends(get_session)
DependsCurrentUser = Depends(get_current_user)


def _require_owned_collection(session: Session, user_id: str, collection_id: str) -> None:
    if get_owned_collection(session, user_id, collection_id) is None:
        raise CollectionNotFoundError()


@router.post("", response_model=CollectionPublic, status_code=status.HTTP_201_CREATED)
def create_my_collection(
    payload: CollectionCreate,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> CollectionPublic:
    return create_collection(session, user_id=current_user.id, name=payload.name)


@router.get("", response_model=list[CollectionPublic])
def get_my_collections(
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> list[CollectionPublic]:
    return list_collections(session, user_id=current_user.id)


@router.get("/{collection_id}", response_model=CollectionDetail)
def get_my_collection(
    collection_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> CollectionDetail:
    _require_owned_collection(session, current_user.id, collection_id)
    return get_collection_detail(session, collection_id)


@router.put("/{collection_id}", response_model=CollectionPublic)
def rename_my_collection(
    collection_id: str,
    payload: CollectionUpdate,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> CollectionPublic:
    _require_owned_collection(session, current_user.id, collection_id)
    rename_collection(session, collection_id, payload.name)
    detail = get_collection_detail(session, collection_id)
    return CollectionPublic(id=detail.id, name=detail.name, quoteCount=len(detail.quotes))


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_collection(
    collection_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> None:
    _require_owned_collection(session, current_user.id, collection_id)
    delete_collection(session, collection_id)


@router.put("/{collection_id}/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_quote(
    collection_id: str,
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> None:
    _require_owned_collection(session, current_user.id, collection_id)
    if not quote_exists(session, quote_id):
        raise QuoteNotFoundError()
    add_quote_to_collection(session, collection_id, quote_id)


@router.delete("/{collection_id}/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_quote(
    collection_id: str,
    quote_id: str,
    current_user: UserPublic = DependsCurrentUser,
    session: Session = DependsSession,
) -> None:
    _require_owned_collection(session, current_user.id, collection_id)
    remove_quote_from_collection(session, collection_id, quote_id)
