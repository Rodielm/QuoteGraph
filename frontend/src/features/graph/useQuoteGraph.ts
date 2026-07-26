import { useEffect, useState } from "react";

import { fetchQuoteGraph } from "@/features/graph/api";
import type { QuoteGraphResponse } from "@/shared/types/graph";

export function useQuoteGraph(quoteId: string | undefined) {
  const [graph, setGraph] = useState<QuoteGraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchQuoteGraph(quoteId)
      .then((data) => {
        if (!cancelled) setGraph(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the graph for this quote");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  return { graph, isLoading, error };
}
