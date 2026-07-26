import { Link, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { GraphView } from "@/features/graph/GraphView";
import { useQuoteGraph } from "@/features/graph/useQuoteGraph";

export function GraphPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const { graph, isLoading, error } = useQuoteGraph(quoteId);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Explore graph</h1>
          <p className="mt-1 text-muted-foreground">
            This quote's author, topics, and related quotes.
          </p>
        </div>
        <Link to="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to quotes
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading graph...</p>}
      {graph && <GraphView graph={graph} />}
    </div>
  );
}
