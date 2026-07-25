import uuid

from neo4j import Session

from app.modules.users.models import UserInDB


def get_user_by_email(session: Session, email: str) -> UserInDB | None:
    record = session.run(
        "MATCH (u:User {email: $email}) RETURN u.id AS id, u.email AS email, u.hashed_password AS hashed_password",
        email=email,
    ).single()
    if record is None:
        return None
    return UserInDB(**record)


def create_user(session: Session, email: str, hashed_password: str) -> UserInDB:
    user_id = str(uuid.uuid4())
    session.run(
        "CREATE (u:User {id: $id, email: $email, hashed_password: $hashed_password})",
        id=user_id,
        email=email,
        hashed_password=hashed_password,
    )
    return UserInDB(id=user_id, email=email, hashed_password=hashed_password)
