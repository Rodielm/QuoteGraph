import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Quote } from "@/shared/types/quote";

export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-base leading-relaxed text-foreground">"{quote.text}"</p>
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
      </CardContent>
    </Card>
  );
}
