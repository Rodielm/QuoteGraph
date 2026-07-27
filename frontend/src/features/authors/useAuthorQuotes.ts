import { useEffect, useState } from "react";

import { fetchQuotes } from "@/features/quotes/api";
import type { Quote } from "@/shared/types/quote";

const PAGE_SIZE = 20;

export function useAuthorQuotes(authorSlug: string | undefined) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Quote[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authorSlug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchQuotes({ page, limit: PAGE_SIZE, author: authorSlug })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this author's quotes");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authorSlug, page]);

  return { items, page, setPage, totalPages, totalCount, isLoading, error };
}
