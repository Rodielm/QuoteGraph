import cytoscape, { type Core, type ElementDefinition, type NodeSingular } from "cytoscape";
import cola from "cytoscape-cola";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { expandAuthor, expandTopic } from "@/features/graph/api";
import type { GraphEdgeData, GraphNodeData, QuoteGraphResponse } from "@/shared/types/graph";

cytoscape.use(cola);

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

type SelectedItem =
  | { kind: "node"; data: GraphNodeData }
  | { kind: "edge"; data: GraphEdgeData };

export function GraphView({ graph }: { graph: QuoteGraphResponse }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setSelected(null);

    const cy = cytoscape({
      container: containerRef.current,
      elements: toElements(graph),
      minZoom: 0.2,
      maxZoom: 3,
      style: [
        {
          selector: "node",
          style: {
            "background-color": (el: NodeSingular) => NODE_COLORS[el.data("type")] ?? "#999",
            "border-width": 2,
            "border-color": (el: NodeSingular) => NODE_COLORS[el.data("type")] ?? "#999",
            "border-opacity": 0.35,
            label: (el: NodeSingular) => (el.data("type") === "Quote" ? "" : el.data("label")),
            "font-size": 10,
            "font-family": "inherit",
            color: "var(--graph-label-color, #333)",
            "text-wrap": "wrap",
            "text-max-width": "110px",
            "text-valign": "bottom",
            "text-margin-y": 8,
            "transition-property": "background-color, border-color, width, height, opacity",
            "transition-duration": 150,
            opacity: 1,
            width: (el: NodeSingular) => (el.data("type") === "Quote" ? 26 : 20),
            height: (el: NodeSingular) => (el.data("type") === "Quote" ? 26 : 20),
          },
        },
        {
          selector: "node.dimmed",
          style: { opacity: 0.25 },
        },
        {
          selector: "node.hovered",
          style: {
            "background-color": (el: NodeSingular) => NODE_COLORS_SELECTED[el.data("type")] ?? "#666",
            "border-color": (el: NodeSingular) => NODE_COLORS_SELECTED[el.data("type")] ?? "#666",
            "border-opacity": 1,
            "border-width": 3,
            label: "data(label)",
            "text-max-width": "160px",
            opacity: 1,
            "z-index": 999,
          },
        },
        {
          selector: "node.focused",
          style: {
            "background-color": (el: NodeSingular) => NODE_COLORS_SELECTED[el.data("type")] ?? "#666",
            "border-color": (el: NodeSingular) => NODE_COLORS_SELECTED[el.data("type")] ?? "#666",
            "border-opacity": 1,
            "border-width": 4,
            label: "data(label)",
            "text-max-width": "180px",
            "font-size": 12,
            opacity: 1,
            width: (el: NodeSingular) => (el.data("type") === "Quote" ? 46 : 32),
            height: (el: NodeSingular) => (el.data("type") === "Quote" ? 46 : 32),
            "z-index": 1000,
          },
        },
        {
          selector: "node.newly-added",
          style: { opacity: 0 },
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
            opacity: 1,
            "transition-property": "line-color, target-arrow-color, width, opacity",
            "transition-duration": 150,
          },
        },
        {
          selector: "edge.dimmed",
          style: { opacity: 0.1 },
        },
        {
          selector: "edge.highlighted, edge:selected",
          style: {
            "line-color": "#7c8cf8",
            "target-arrow-color": "#7c8cf8",
            width: 2.5,
            opacity: 1,
          },
        },
      ],
      layout: {
        name: "cola",
        animate: true,
        infinite: false,
        fit: true,
        padding: 60,
        nodeSpacing: () => 24,
        edgeLength: () => 140,
        gravity: 0.02,
        avoidOverlap: true,
        randomize: false,
      } as cytoscape.LayoutOptions,
    });

    // Gentle "floating in space" effect: each node drifts in a small orbit
    // around its layout position. Runs independently of Cytoscape's own
    // pan/zoom/layout systems, so it never fights user interaction.
    let floatFrame: number;
    let basePositions: Map<string, { x: number; y: number }> | null = null;
    const draggedIds = new Set<string>();
    const focusedIds = new Set<string>();

    cy.on("grab", "node", (event) => {
      draggedIds.add(event.target.id());
    });
    cy.on("free", "node", (event) => {
      draggedIds.delete(event.target.id());
      if (basePositions) {
        basePositions.set(event.target.id(), { ...event.target.position() });
      }
    });

    const startFloating = () => {
      basePositions = new Map(cy.nodes().map((n) => [n.id(), { ...n.position() }]));
      const phase = new Map(cy.nodes().map((n) => [n.id(), Math.random() * Math.PI * 2]));
      const speed = new Map(cy.nodes().map((n) => [n.id(), 0.4 + Math.random() * 0.3]));
      const radius = new Map(cy.nodes().map((n) => [n.id(), 2.5 + Math.random() * 2]));

      const tick = (time: number) => {
        if (basePositions) {
          cy.batch(() => {
            cy.nodes().forEach((n) => {
              if (draggedIds.has(n.id()) || focusedIds.has(n.id())) return;
              const base = basePositions!.get(n.id());
              if (!base) return;
              const t = (time / 1000) * speed.get(n.id())! + phase.get(n.id())!;
              const r = radius.get(n.id())!;
              n.position({
                x: base.x + Math.cos(t) * r,
                y: base.y + Math.sin(t * 0.8) * r,
              });
            });
          });
        }
        floatFrame = requestAnimationFrame(tick);
      };
      floatFrame = requestAnimationFrame(tick);
    };

    cy.one("layoutstop", startFloating);

    // Click a Quote node: center + zoom the camera on it and enlarge it.
    cy.on("tap", "node", (event) => {
      const node = event.target as NodeSingular;
      const data = node.data() as GraphNodeData;
      setSelected({ kind: "node", data });

      cy.nodes().removeClass("focused");
      focusedIds.clear();
      if (basePositions) basePositions.set(node.id(), { ...node.position() });

      if (data.type === "Quote") {
        node.addClass("focused");
        focusedIds.add(node.id());
        cy.animate({
          center: { eles: node },
          zoom: Math.max(cy.zoom(), 1.4),
          duration: 450,
          easing: "ease-out-cubic",
        });
      }
    });

    cy.on("tap", "edge", (event) => {
      const data = event.target.data() as GraphEdgeData;
      setSelected({ kind: "edge", data });
    });

    cy.on("tap", (event) => {
      if (event.target === cy) {
        setSelected(null);
        cy.nodes().removeClass("focused");
        focusedIds.clear();
      }
    });

    // Hover a node: light up its direct relationships, dim the rest.
    cy.on("mouseover", "node", (event) => {
      const node = event.target as NodeSingular;
      node.addClass("hovered");
      const neighborhood = node.closedNeighborhood();
      cy.elements().difference(neighborhood).addClass("dimmed");
      neighborhood.edges().addClass("highlighted");
    });

    cy.on("mouseout", "node", (event) => {
      const node = event.target as NodeSingular;
      node.removeClass("hovered");
      cy.elements().removeClass("dimmed highlighted");
    });

    // Double-click an Author or Topic node: fetch more connected quotes and
    // merge them in with a fade-in, then let the layout settle around them.
    cy.on("dbltap", "node", async (event) => {
      const node = event.target as NodeSingular;
      const data = node.data() as GraphNodeData;
      if (data.type === "Quote" || isExpanding) return;

      setIsExpanding(true);
      try {
        const existingQuoteIds = cy
          .nodes('[type = "Quote"]')
          .map((n) => (n.data("id") as string).replace("quote:", ""));

        const expansion =
          data.type === "Author"
            ? await expandAuthor(data.id.replace("author:", ""), existingQuoteIds)
            : await expandTopic(data.id.replace("topic:", ""), existingQuoteIds);

        const newElements = toElements(expansion).filter(
          (el) => cy.getElementById(el.data.id as string).empty(),
        );
        if (newElements.length === 0) return;

        const added = cy.add(newElements);
        added.filter("node").addClass("newly-added");

        const relayout = added.union(added.closedNeighborhood()).layout({
          name: "cola",
          animate: true,
          infinite: false,
          fit: false,
          nodeSpacing: 24,
          edgeLength: 140,
          randomize: false,
        } as cytoscape.LayoutOptions);
        relayout.run();

        requestAnimationFrame(() => {
          added.filter("node").removeClass("newly-added");
        });
      } finally {
        setIsExpanding(false);
      }
    });

    cyRef.current = cy;
    return () => {
      cancelAnimationFrame(floatFrame);
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        {isExpanding && (
          <div className="absolute left-3 top-3 rounded-md bg-background/80 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
            Loading more...
          </div>
        )}

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
          <span className="text-muted-foreground/70">Double-click Author/Topic to expand</span>
        </div>
      </div>

      <div className="min-h-24 rounded-lg border bg-card p-4">
        {selected?.kind === "node" ? (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {selected.data.type}
            </span>
            <p className="text-base leading-relaxed text-foreground">
              {selected.data.type === "Quote"
                ? `"${selected.data.fullText ?? selected.data.label}"`
                : selected.data.label}
            </p>
          </div>
        ) : selected?.kind === "edge" ? (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Connection
            </span>
            <p className="text-base leading-relaxed text-foreground">{selected.data.explanation}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click a node or connection to see its detail here.
          </p>
        )}
      </div>
    </div>
  );
}
