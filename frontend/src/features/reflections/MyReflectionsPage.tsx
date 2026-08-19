import { useEffect, useState } from "react";

import { fetchMyReflections } from "@/features/reflections/api";
import { QuoteCard } from "@/features/quotes/QuoteCard";
import type { ReflectedQuote } from "@/shared/types/reflection";

export function MyReflectionsPage() {
  const [items, setItems] = useState<ReflectedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyReflections()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your reflections");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Your reflections</h1>
        <p className="mt-1 text-muted-foreground">Quotes you've written personal reflections on.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven't written any reflections yet. Click the notebook icon on a quote to add one.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {items.map(({ quote, reflection }) => (
            <div key={quote.id} className="flex flex-col gap-2">
              <QuoteCard quote={quote} />
              <p className="line-clamp-3 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                {reflection.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
