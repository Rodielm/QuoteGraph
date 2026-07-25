from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from neo4j import Session

from app.core.database import get_session
from app.modules.auth.security import decode_access_token
from app.modules.users.models import UserPublic
from app.modules.users.repository import get_user_by_email
from app.shared.exceptions import InvalidTokenError

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(_oauth2_scheme),
    session: Session = Depends(get_session),
) -> UserPublic:
    user_id = decode_access_token(token)
    if user_id is None:
        raise InvalidTokenError()

    record = session.run(
        "MATCH (u:User {id: $id}) RETURN u.id AS id, u.email AS email", id=user_id
    ).single()
    if record is None:
        raise InvalidTokenError()

    return UserPublic(**record)
