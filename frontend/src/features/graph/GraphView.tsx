import cytoscape, { type Core, type ElementDefinition, type NodeSingular } from "cytoscape";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GraphNodeData, QuoteGraphResponse } from "@/shared/types/graph";

const NODE_COLORS: Record<string, string> = {
  Quote: "#7c8cf8",
  Author: "#f6a04d",
  Topic: "#4dbf8f",
};

const NODE_COLORS_SELECTED: Record<string, string> = {
  Quote: "#4c5edb",
  Author: "#d6790f",
  Topic: "#22916a",
};

function toElements(graph: QuoteGraphResponse): ElementDefinition[] {
  return [
    ...graph.nodes.map((n) => ({ data: n.data })),
    ...graph.edges.map((e) => ({ data: e.data })),
  ];
}

export function GraphView({ graph }: { graph: QuoteGraphResponse }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selected, setSelected] = useState<GraphNodeData | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    setSelected(null);

    const cy = cytoscape({
      container: containerRef.current,
      elements: toElements(graph),
      minZoom: 0.3,
      maxZoom: 2.5,
      style: [
        {
          selector: "node",
          style: {
            "background-color": (el: NodeSingular) => NODE_COLORS[el.data("type")] ?? "#999",
            "border-width": 2,
            "border-color": (el: NodeSingular) => NODE_COLORS[el.data("type")] ?? "#999",
            "border-opacity": 0.35,
            label: "data(label)",
            "font-size": 10,
            "font-family": "inherit",
            color: "var(--graph-label-color, #333)",
            "text-wrap": "wrap",
            "text-max-width": "110px",
            "text-valign": "bottom",
            "text-margin-y": 8,
            "transition-property": "background-color, border-color, width, height",
            "transition-duration": 150,
            width: (el: NodeSingular) => (el.data("type") === "Quote" ? 32 : 20),
            height: (el: NodeSingular) => (el.data("type") === "Quote" ? 32 : 20),
          },
        },
        {
          selector: "node:selected",
          style: {
            "background-color": (el: NodeSingular) => NODE_COLORS_SELECTED[el.data("type")] ?? "#666",
            "border-color": (el: NodeSingular) => NODE_COLORS_SELECTED[el.data("type")] ?? "#666",
            "border-opacity": 1,
            "border-width": 3,
            width: (el: NodeSingular) => (el.data("type") === "Quote" ? 40 : 26),
            height: (el: NodeSingular) => (el.data("type") === "Quote" ? 40 : 26),
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "var(--graph-edge-color, #d4d4d4)",
            "target-arrow-color": "var(--graph-edge-color, #d4d4d4)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 0.8,
            "transition-property": "line-color, target-arrow-color, width",
            "transition-duration": 150,
          },
        },
        {
          selector: "edge:selected, node:selected + edge",
          style: {
            "line-color": "#7c8cf8",
            "target-arrow-color": "#7c8cf8",
            width: 2.5,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 700,
        animationEasing: "ease-out-cubic",
        nodeRepulsion: () => 9000,
        idealEdgeLength: () => 90,
        fit: true,
        padding: 40,
      },
    });

    cy.on("tap", "node", (event) => {
      const data = event.target.data() as GraphNodeData;
      setSelected(data);
    });

    cy.on("tap", (event) => {
      if (event.target === cy) setSelected(null);
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph]);

  return (
    <div className="space-y-3">
      <div className="relative h-[600px] w-full overflow-hidden rounded-lg border bg-card">
        <div ref={containerRef} className="h-full w-full [--graph-label-color:var(--foreground)] [--graph-edge-color:var(--border)]" />

        <div className="absolute right-3 top-3 flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Zoom in"
            onClick={() => {
              const cy = cyRef.current;
              if (!cy) return;
              cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
            }}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Zoom out"
            onClick={() => {
              const cy = cyRef.current;
              if (!cy) return;
              cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
            }}
          >
            −
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Fit to view"
            onClick={() => cyRef.current?.fit(undefined, 40)}
          >
            ⤢
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 flex gap-3 rounded-md bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: NODE_COLORS.Quote }} />
            Quote
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: NODE_COLORS.Author }} />
            Author
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: NODE_COLORS.Topic }} />
            Topic
          </span>
        </div>
      </div>

      <div className="min-h-24 rounded-lg border bg-card p-4">
        {selected ? (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {selected.type}
            </span>
            <p className="text-base leading-relaxed text-foreground">
              {selected.type === "Quote" ? `"${selected.fullText ?? selected.label}"` : selected.label}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click a node to see its full detail here.</p>
        )}
      </div>
    </div>
  );
}
