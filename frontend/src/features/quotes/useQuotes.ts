import { useEffect, useState } from "react";

import { fetchQuotes } from "@/features/quotes/api";
import type { Quote } from "@/shared/types/quote";

const PAGE_SIZE = 20;

export function useQuotes(search: string) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Quote[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchQuotes({ page, limit: PAGE_SIZE, q: search || undefined })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load quotes");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  return { items, page, setPage, totalPages, isLoading, error };
}
