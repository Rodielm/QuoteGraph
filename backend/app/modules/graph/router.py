from fastapi import APIRouter, Depends, HTTPException, Query, status
from neo4j import Session

from app.core.database import get_session
from app.modules.graph.models import GraphEdge, GraphEdgeData, GraphNode, GraphNodeData, QuoteGraphResponse
from app.modules.graph.repository import expand_by_author, expand_by_topic, get_quote_core

router = APIRouter(prefix="/graph", tags=["graph"])

DependsSession = Depends(get_session)


def _truncate(text: str, length: int = 60) -> str:
    return text if len(text) <= length else text[: length - 1] + "…"


def _records_to_graph(records: list) -> QuoteGraphResponse:
    nodes: dict[str, GraphNode] = {}
    edges: dict[str, GraphEdge] = {}

    for record in records:
        quote = record["quote"]
        author = record["author"]
        topics = record["topics"]

        quote_node_id = f"quote:{quote['id']}"
        author_node_id = f"author:{author['slug']}"

        nodes[quote_node_id] = GraphNode(
            data=GraphNodeData(
                id=quote_node_id,
                label=_truncate(quote["text"]),
                type="Quote",
                fullText=quote["text"],
            )
        )
        nodes[author_node_id] = GraphNode(
            data=GraphNodeData(id=author_node_id, label=author["name"], type="Author")
        )

        wrote_edge_id = f"wrote:{author_node_id}->{quote_node_id}"
        edges[wrote_edge_id] = GraphEdge(
            data=GraphEdgeData(
                id=wrote_edge_id,
                source=author_node_id,
                target=quote_node_id,
                label="WROTE",
                explanation=f"{author['name']} wrote this quote.",
            )
        )

        for topic in topics:
            topic_node_id = f"topic:{topic['name']}"
            nodes[topic_node_id] = GraphNode(
                data=GraphNodeData(id=topic_node_id, label=topic["name"], type="Topic")
            )
            topic_edge_id = f"topic:{quote_node_id}->{topic_node_id}"
            edges[topic_edge_id] = GraphEdge(
                data=GraphEdgeData(
                    id=topic_edge_id,
                    source=quote_node_id,
                    target=topic_node_id,
                    label="HAS_TOPIC",
                    explanation=f'This quote relates to the topic "{topic["name"]}".',
                )
            )

    return QuoteGraphResponse(nodes=list(nodes.values()), edges=list(edges.values()))


@router.get("/quotes/{quote_id}", response_model=QuoteGraphResponse)
def get_quote_graph(quote_id: str, session: Session = DependsSession) -> QuoteGraphResponse:
    records = get_quote_core(session, quote_id)
    if records is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")
    return _records_to_graph(records)


@router.get("/authors/{author_slug}/expand", response_model=QuoteGraphResponse)
def expand_author_node(
    author_slug: str,
    exclude: list[str] = Query(default=[]),
    session: Session = DependsSession,
) -> QuoteGraphResponse:
    records = expand_by_author(session, author_slug, exclude_quote_ids=exclude)
    return _records_to_graph(records)


@router.get("/topics/{topic_name}/expand", response_model=QuoteGraphResponse)
def expand_topic_node(
    topic_name: str,
    exclude: list[str] = Query(default=[]),
    session: Session = DependsSession,
) -> QuoteGraphResponse:
    records = expand_by_topic(session, topic_name, exclude_quote_ids=exclude)
    return _records_to_graph(records)
