from neo4j import Session

MAX_RELATED_QUOTES = 15


def get_quote_neighborhood(session: Session, quote_id: str) -> list | None:
    """Returns raw (author, quote, topic) triples for the quote's 2-hop neighborhood:
    the center quote, its direct author/topics, and other quotes sharing that
    author or one of those topics — each with their own author/topics attached,
    so the frontend can render every edge without extra requests.
    """
    query = """
    MATCH (center:Quote {id: $quote_id})<-[:WROTE]-(:Author)
    OPTIONAL MATCH (center)-[:HAS_TOPIC]->(centerTopic:Topic)
    WITH center, collect(DISTINCT centerTopic) AS centerTopics

    MATCH (center)<-[:WROTE]-(centerAuthor:Author)
    OPTIONAL MATCH (centerAuthor)-[:WROTE]->(byAuthor:Quote)
    WHERE byAuthor.id <> center.id
    WITH center, centerAuthor, centerTopics, collect(DISTINCT byAuthor)[0..$max_related] AS relatedByAuthor

    OPTIONAL MATCH (centerTopic)<-[:HAS_TOPIC]-(byTopic:Quote)
    WHERE centerTopic IN centerTopics AND byTopic.id <> center.id
    WITH center, centerAuthor, centerTopics, relatedByAuthor,
         collect(DISTINCT byTopic)[0..$max_related] AS relatedByTopic

    WITH center, centerAuthor, centerTopics,
         relatedByAuthor + relatedByTopic AS relatedQuotes

    UNWIND (relatedQuotes + [center]) AS quote
    MATCH (quote)<-[:WROTE]-(author:Author)
    OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(topic:Topic)
    RETURN DISTINCT quote, author, collect(DISTINCT topic) AS topics
    """
    result = session.run(query, quote_id=quote_id, max_related=MAX_RELATED_QUOTES)
    records = list(result)
    return records if records else None
