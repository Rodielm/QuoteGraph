from fastapi import APIRouter, Depends
from neo4j import Session

from app.core.database import get_session
from app.modules.topics.models import TopicPublic
from app.modules.topics.repository import list_topics

router = APIRouter(prefix="/topics", tags=["topics"])

DependsSession = Depends(get_session)


@router.get("", response_model=list[TopicPublic])
def get_topics(session: Session = DependsSession) -> list[TopicPublic]:
    return list_topics(session)
