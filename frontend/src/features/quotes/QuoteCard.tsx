import { NotebookPen, Share2, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCollectionMenu } from "@/features/collections/AddToCollectionMenu";
import { useFavorite } from "@/features/quotes/useFavorite";
import { ReflectionEditor } from "@/features/reflections/ReflectionEditor";
import { cn } from "@/lib/utils";
import type { Quote } from "@/shared/types/quote";

export function QuoteCard({ quote }: { quote: Quote }) {
  const { isFavorited, isLoading, toggle } = useFavorite(quote.id);
  const [isReflecting, setIsReflecting] = useState(false);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-4 text-base leading-relaxed text-foreground">"{quote.text}"</p>
          <div className="flex shrink-0 items-center">
            <AddToCollectionMenu quoteId={quote.id} />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isReflecting ? "Hide reflection" : "Write a reflection"}
              aria-pressed={isReflecting}
              onClick={() => setIsReflecting((v) => !v)}
            >
              <NotebookPen className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isLoading}
              onClick={toggle}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorited}
            >
              <Star
                className={cn("size-4", isFavorited && "fill-amber-500 text-amber-500")}
              />
            </Button>
          </div>
        </div>
        <Link
          to={`/authors/${quote.author.slug}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          — {quote.author.name}
        </Link>
        {quote.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {quote.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                render={<Link to={`/topics/${encodeURIComponent(tag)}`} />}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {isReflecting && <ReflectionEditor quoteId={quote.id} />}
        <Link
          to={`/graph/${quote.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mt-auto self-start gap-1.5" })}
        >
          <Share2 className="size-3.5" />
          Explore graph
        </Link>
      </CardContent>
    </Card>
  );
}
