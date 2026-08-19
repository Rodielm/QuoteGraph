from neo4j import Session

from app.modules.quotes.repository import to_quote_public
from app.modules.reflections.models import ReflectedQuote, ReflectionPublic


def _to_reflection_public(record) -> ReflectionPublic:
    return ReflectionPublic(
        text=record["text"],
        createdAt=record["createdAt"].iso_format(),
        updatedAt=record["updatedAt"].iso_format(),
    )


def upsert_reflection(session: Session, user_id: str, quote_id: str, text: str) -> ReflectionPublic:
    result = session.run(
        """
        MATCH (u:User {id: $user_id}), (q:Quote {id: $quote_id})
        MERGE (u)-[:WROTE]->(r:Reflection)-[:ABOUT]->(q)
        ON CREATE SET r.text = $text, r.createdAt = datetime(), r.updatedAt = datetime()
        ON MATCH SET r.text = $text, r.updatedAt = datetime()
        RETURN r.text AS text, r.createdAt AS createdAt, r.updatedAt AS updatedAt
        """,
        user_id=user_id,
        quote_id=quote_id,
        text=text,
    )
    return _to_reflection_public(result.single())


def get_reflection(session: Session, user_id: str, quote_id: str) -> ReflectionPublic | None:
    result = session.run(
        """
        MATCH (u:User {id: $user_id})-[:WROTE]->(r:Reflection)-[:ABOUT]->(q:Quote {id: $quote_id})
        RETURN r.text AS text, r.createdAt AS createdAt, r.updatedAt AS updatedAt
        """,
        user_id=user_id,
        quote_id=quote_id,
    )
    record = result.single()
    return _to_reflection_public(record) if record else None


def list_reflections(session: Session, user_id: str) -> list[ReflectedQuote]:
    query = """
    MATCH (u:User {id: $user_id})-[:WROTE]->(r:Reflection)-[:ABOUT]->(quote:Quote)<-[:WROTE]-(a:Author)
    OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(t:Topic)
    WITH quote, a, r, collect(t.name) AS tags
    RETURN quote.id AS id, quote.text AS text, a.name AS author_name, a.slug AS author_slug, tags,
           r.text AS reflectionText, r.createdAt AS createdAt, r.updatedAt AS updatedAt
    ORDER BY r.updatedAt DESC
    """
    result = session.run(query, user_id=user_id)
    return [
        ReflectedQuote(
            quote=to_quote_public(record),
            reflection=ReflectionPublic(
                text=record["reflectionText"],
                createdAt=record["createdAt"].iso_format(),
                updatedAt=record["updatedAt"].iso_format(),
            ),
        )
        for record in result
    ]


def delete_reflection(session: Session, user_id: str, quote_id: str) -> None:
    session.run(
        """
        MATCH (u:User {id: $user_id})-[:WROTE]->(r:Reflection)-[:ABOUT]->(q:Quote {id: $quote_id})
        DETACH DELETE r
        """,
        user_id=user_id,
        quote_id=quote_id,
    )
