import cytoscape, { type ElementDefinition, type NodeSingular } from "cytoscape";
import { useEffect, useRef } from "react";

import type { QuoteGraphResponse } from "@/shared/types/graph";

const NODE_COLORS: Record<string, string> = {
  Quote: "oklch(0.55 0.15 250)",
  Author: "oklch(0.65 0.18 40)",
  Topic: "oklch(0.65 0.15 150)",
};

function toElements(graph: QuoteGraphResponse): ElementDefinition[] {
  return [
    ...graph.nodes.map((n) => ({ data: n.data })),
    ...graph.edges.map((e) => ({ data: e.data })),
  ];
}

export function GraphView({ graph }: { graph: QuoteGraphResponse }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: toElements(graph),
      style: [
        {
          selector: "node",
          style: {
            "background-color": (el: NodeSingular) => NODE_COLORS[el.data("type")] ?? "#999",
            label: "data(label)",
            "font-size": 10,
            color: "#111",
            "text-wrap": "wrap",
            "text-max-width": "120px",
            "text-valign": "bottom",
            "text-margin-y": 6,
            width: (el: NodeSingular) => (el.data("type") === "Quote" ? 28 : 18),
            height: (el: NodeSingular) => (el.data("type") === "Quote" ? 28 : 18),
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#c9c9c9",
            "target-arrow-color": "#c9c9c9",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 0.8,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 80,
      },
    });

    return () => cy.destroy();
  }, [graph]);

  return <div ref={containerRef} className="h-[600px] w-full rounded-lg border bg-card" />;
}
