from fastapi import APIRouter, Depends
from neo4j import Session

from app.core.database import get_session
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.modules.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.modules.users.models import UserCreate, UserPublic
from app.modules.users.repository import create_user, get_user_by_email
from app.shared.exceptions import EmailAlreadyRegisteredError, InvalidCredentialsError

router = APIRouter(prefix="/auth", tags=["auth"])

DependsSession = Depends(get_session)

@router.post("/register", response_model=UserPublic, status_code=201)
def register(payload: UserCreate, session: Session = DependsSession) -> UserPublic:
    if get_user_by_email(session, payload.email) is not None:
        raise EmailAlreadyRegisteredError()

    user = create_user(session, payload.email, hash_password(payload.password))
    return UserPublic(id=user.id, email=user.email)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = DependsSession) -> TokenResponse:
    user = get_user_by_email(session, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise InvalidCredentialsError()

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)
