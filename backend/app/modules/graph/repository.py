from neo4j import Session

INITIAL_RELATED_LIMIT = 8
EXPAND_LIMIT = 10


def get_quote_core(session: Session, quote_id: str) -> list | None:
    """Returns the initial, reduced neighborhood for a quote: the quote itself,
    its direct author and topics, and a handful of related quotes sharing that
    author or one of those topics. Kept small (~5-15 nodes total) for a
    readable first view — more nodes are fetched on demand via
    expand_author/expand_topic.

    Related quotes only expose the *center's* topics here (not their own
    unrelated tags), so the initial view stays focused on what's actually
    being explored — extra tags surface later via expand_topic.
    """
    query = """
    MATCH (center:Quote {id: $quote_id})<-[:WROTE]-(centerAuthor:Author)
    OPTIONAL MATCH (center)-[:HAS_TOPIC]->(centerTopic:Topic)
    WITH center, centerAuthor, collect(DISTINCT centerTopic) AS centerTopics

    OPTIONAL MATCH (centerAuthor)-[:WROTE]->(byAuthor:Quote)
    WHERE byAuthor.id <> center.id
    OPTIONAL MATCH (centerTopic)<-[:HAS_TOPIC]-(byTopic:Quote)
    WHERE centerTopic IN centerTopics AND byTopic.id <> center.id

    WITH center, centerAuthor, centerTopics,
         [q IN collect(DISTINCT byAuthor) + collect(DISTINCT byTopic) WHERE q IS NOT NULL] AS candidates
    WITH center, centerAuthor, centerTopics, candidates[0..$limit] AS relatedQuotes

    UNWIND (relatedQuotes + [center]) AS quote
    MATCH (quote)<-[:WROTE]-(author:Author)
    WITH center, centerTopics, quote, author,
         CASE WHEN quote = center
              THEN centerTopics
              ELSE [t IN centerTopics WHERE (quote)-[:HAS_TOPIC]->(t)]
         END AS topics
    RETURN DISTINCT quote, author, topics
    """
    result = session.run(query, quote_id=quote_id, limit=INITIAL_RELATED_LIMIT)
    records = list(result)
    return records if records else None


def expand_by_author(session: Session, author_slug: str, exclude_quote_ids: list[str]) -> list:
    """More quotes by this author, for progressive expansion when the user
    double-clicks the Author node."""
    query = """
    MATCH (author:Author {slug: $author_slug})-[:WROTE]->(quote:Quote)
    WHERE NOT quote.id IN $exclude_ids
    OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(topic:Topic)
    WITH quote, author, collect(DISTINCT topic) AS topics
    RETURN DISTINCT quote, author, topics
    LIMIT $limit
    """
    result = session.run(
        query, author_slug=author_slug, exclude_ids=exclude_quote_ids, limit=EXPAND_LIMIT
    )
    return list(result)


def expand_by_topic(session: Session, topic_name: str, exclude_quote_ids: list[str]) -> list:
    """More quotes tagged with this topic, for progressive expansion when the
    user double-clicks the Topic node."""
    query = """
    MATCH (topic:Topic {name: $topic_name})<-[:HAS_TOPIC]-(quote:Quote)
    WHERE NOT quote.id IN $exclude_ids
    MATCH (quote)<-[:WROTE]-(author:Author)
    OPTIONAL MATCH (quote)-[:HAS_TOPIC]->(t:Topic)
    WITH quote, author, collect(DISTINCT t) AS topics
    RETURN DISTINCT quote, author, topics
    LIMIT $limit
    """
    result = session.run(
        query, topic_name=topic_name, exclude_ids=exclude_quote_ids, limit=EXPAND_LIMIT
    )
    return list(result)
