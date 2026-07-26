import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Quote } from "@/shared/types/quote";

export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <p className="line-clamp-4 text-base leading-relaxed text-foreground">"{quote.text}"</p>
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
        <Link
          to={`/graph/${quote.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mt-auto self-start" })}
        >
          Explore graph
        </Link>
      </CardContent>
    </Card>
  );
}
