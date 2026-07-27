import { useEffect, useState } from "react";

import { fetchQuotes } from "@/features/quotes/api";
import type { Quote } from "@/shared/types/quote";

const PAGE_SIZE = 20;

export function useTopicQuotes(topicName: string | undefined) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Quote[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicName) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchQuotes({ page, limit: PAGE_SIZE, tag: topicName })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load quotes for this topic");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topicName, page]);

  return { items, page, setPage, totalPages, totalCount, isLoading, error };
}
