from typing import Literal

from pydantic import BaseModel


class GraphNodeData(BaseModel):
    id: str
    label: str
    type: Literal["Quote", "Author", "Topic"]
    fullText: str | None = None


class GraphNode(BaseModel):
    data: GraphNodeData


class GraphEdgeData(BaseModel):
    id: str
    source: str
    target: str
    label: str


class GraphEdge(BaseModel):
    data: GraphEdgeData


class QuoteGraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
