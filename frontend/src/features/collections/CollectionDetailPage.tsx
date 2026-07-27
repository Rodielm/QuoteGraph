import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchCollectionDetail, removeQuoteFromCollection } from "@/features/collections/api";
import type { CollectionDetail } from "@/shared/types/collection";

export function CollectionDetailPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) return;
    fetchCollectionDetail(collectionId)
      .then(setCollection)
      .catch(() => setError("Could not load this collection"))
      .finally(() => setIsLoading(false));
  }, [collectionId]);

  async function handleRemove(quoteId: string) {
    if (!collectionId || !collection) return;
    await removeQuoteFromCollection(collectionId, quoteId);
    setCollection({ ...collection, quotes: collection.quotes.filter((q) => q.id !== quoteId) });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{collection?.name ?? "Collection"}</h1>
          <p className="mt-1 text-muted-foreground">
            {collection ? `${collection.quotes.length} quotes` : ""}
          </p>
        </div>
        <Link to="/collections" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to collections
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {collection && collection.quotes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No quotes here yet. Add some from the quotes list.
        </p>
      )}

      {collection && collection.quotes.length > 0 && (
        <div className="space-y-3">
          {collection.quotes.map((quote) => (
            <Card key={quote.id}>
              <CardContent className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="leading-relaxed text-foreground">"{quote.text}"</p>
                  <p className="text-sm font-medium text-muted-foreground">— {quote.author.name}</p>
                  {quote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {quote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove from collection"
                  onClick={() => handleRemove(quote.id)}
                  className="shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
