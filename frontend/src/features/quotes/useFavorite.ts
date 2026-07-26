import { useEffect, useState } from "react";

import { addFavorite, getFavoriteStatus, removeFavorite } from "@/features/quotes/api";

export function useFavorite(quoteId: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFavoriteStatus(quoteId)
      .then((status) => {
        if (!cancelled) setIsFavorited(status.isFavorited);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  async function toggle() {
    const next = !isFavorited;
    setIsFavorited(next); // optimistic
    try {
      if (next) {
        await addFavorite(quoteId);
      } else {
        await removeFavorite(quoteId);
      }
    } catch {
      setIsFavorited(!next); // revert on failure
    }
  }

  return { isFavorited, isLoading, toggle };
}
