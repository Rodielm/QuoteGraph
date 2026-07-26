export type GraphNodeType = "Quote" | "Author" | "Topic";

export interface GraphNodeData {
  id: string;
  label: string;
  type: GraphNodeType;
  fullText?: string;
}

export interface GraphNode {
  data: GraphNodeData;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface GraphEdge {
  data: GraphEdgeData;
}

export interface QuoteGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
