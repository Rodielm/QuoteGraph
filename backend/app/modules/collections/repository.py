import uuid

from neo4j import Session

from app.modules.collections.models import CollectionDetail, CollectionPublic
from app.modules.quotes.repository import to_quote_public


def create_collection(session: Session, user_id: str, name: str) -> CollectionPublic:
    collection_id = str(uuid.uuid4())
    session.run(
        """
        MATCH (u:User {id: $user_id})
        CREATE (c:Collection {id: $collection_id, name: $name})
        MERGE (u)-[:CREATED]->(c)
        """,
        user_id=user_id,
        collection_id=collection_id,
        name=name,
    )
    return CollectionPublic(id=collection_id, name=name, quoteCount=0)


def list_collections(session: Session, user_id: str) -> list[CollectionPublic]:
    result = session.run(
        """
        MATCH (u:User {id: $user_id})-[:CREATED]->(c:Collection)
        OPTIONAL MATCH (c)-[:CONTAINS]->(q:Quote)
        RETURN c.id AS id, c.name AS name, count(q) AS quoteCount
        ORDER BY c.name
        """,
        user_id=user_id,
    )
    return [CollectionPublic(**record) for record in result]


def get_owned_collection(session: Session, user_id: str, collection_id: str) -> dict | None:
    result = session.run(
        """
        MATCH (u:User {id: $user_id})-[:CREATED]->(c:Collection {id: $collection_id})
        RETURN c.id AS id, c.name AS name
        """,
        user_id=user_id,
        collection_id=collection_id,
    )
    record = result.single()
    return dict(record) if record else None


def get_collection_detail(session: Session, collection_id: str) -> CollectionDetail:
    result = session.run(
        """
        MATCH (c:Collection {id: $collection_id})
        OPTIONAL MATCH (c)-[:CONTAINS]->(quote:Quote)<-[:WROTE]-(a:Author)
        OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(t:Topic)
        WITH c, quote, a, collect(DISTINCT t.name) AS tags
        RETURN c.id AS id, c.name AS name,
               collect(CASE WHEN quote IS NULL THEN NULL ELSE
                   {id: quote.id, text: quote.text, author_name: a.name, author_slug: a.slug, tags: tags}
               END) AS quoteRecords
        """,
        collection_id=collection_id,
    )
    record = result.single()
    quotes = [to_quote_public(q) for q in record["quoteRecords"] if q is not None]
    return CollectionDetail(id=record["id"], name=record["name"], quotes=quotes)


def rename_collection(session: Session, collection_id: str, name: str) -> None:
    session.run(
        "MATCH (c:Collection {id: $collection_id}) SET c.name = $name",
        collection_id=collection_id,
        name=name,
    )


def delete_collection(session: Session, collection_id: str) -> None:
    session.run(
        "MATCH (c:Collection {id: $collection_id}) DETACH DELETE c",
        collection_id=collection_id,
    )


def add_quote_to_collection(session: Session, collection_id: str, quote_id: str) -> None:
    session.run(
        """
        MATCH (c:Collection {id: $collection_id}), (q:Quote {id: $quote_id})
        MERGE (c)-[:CONTAINS]->(q)
        """,
        collection_id=collection_id,
        quote_id=quote_id,
    )


def remove_quote_from_collection(session: Session, collection_id: str, quote_id: str) -> None:
    session.run(
        """
        MATCH (c:Collection {id: $collection_id})-[r:CONTAINS]->(q:Quote {id: $quote_id})
        DELETE r
        """,
        collection_id=collection_id,
        quote_id=quote_id,
    )
