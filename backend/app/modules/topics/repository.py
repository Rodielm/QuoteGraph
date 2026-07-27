from neo4j import Session

from app.modules.topics.models import TopicPublic


def list_topics(session: Session) -> list[TopicPublic]:
    result = session.run(
        """
        MATCH (t:Topic)
        OPTIONAL MATCH (t)<-[:HAS_TOPIC]-(q:Quote)
        RETURN t.name AS name, count(q) AS quoteCount
        ORDER BY quoteCount DESC, t.name ASC
        """
    )
    return [TopicPublic(**record) for record in result]
