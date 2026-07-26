from neo4j import Session

from app.modules.quotes.models import QuotePublic
from app.modules.quotes.repository import to_quote_public


def quote_exists(session: Session, quote_id: str) -> bool:
    result = session.run("MATCH (q:Quote {id: $quote_id}) RETURN q.id AS id", quote_id=quote_id)
    return result.single() is not None


def add_favorite(session: Session, user_id: str, quote_id: str) -> None:
    session.run(
        """
        MATCH (u:User {id: $user_id}), (q:Quote {id: $quote_id})
        MERGE (u)-[:SAVED]->(q)
        """,
        user_id=user_id,
        quote_id=quote_id,
    )


def remove_favorite(session: Session, user_id: str, quote_id: str) -> None:
    session.run(
        """
        MATCH (u:User {id: $user_id})-[r:SAVED]->(q:Quote {id: $quote_id})
        DELETE r
        """,
        user_id=user_id,
        quote_id=quote_id,
    )


def is_favorited(session: Session, user_id: str, quote_id: str) -> bool:
    result = session.run(
        """
        MATCH (u:User {id: $user_id})-[:SAVED]->(q:Quote {id: $quote_id})
        RETURN q.id AS id
        """,
        user_id=user_id,
        quote_id=quote_id,
    )
    return result.single() is not None


def list_favorite_quotes(session: Session, user_id: str) -> list[QuotePublic]:
    query = """
    MATCH (u:User {id: $user_id})-[:SAVED]->(quote:Quote)<-[:WROTE]-(a:Author)
    OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(t:Topic)
    WITH quote, a, collect(t.name) AS tags
    RETURN quote.id AS id, quote.text AS text, a.name AS author_name, a.slug AS author_slug, tags
    ORDER BY quote.id
    """
    result = session.run(query, user_id=user_id)
    return [to_quote_public(record) for record in result]
