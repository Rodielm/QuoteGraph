import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { QuoteCard } from "@/features/quotes/QuoteCard";
import { useTopicQuotes } from "@/features/topics/useTopicQuotes";

export function TopicDetailPage() {
  const { topicName } = useParams<{ topicName: string }>();
  const decodedTopic = topicName ? decodeURIComponent(topicName) : undefined;
  const { items, page, setPage, totalPages, totalCount, isLoading, error } =
    useTopicQuotes(decodedTopic);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{decodedTopic}</h1>
        {totalCount > 0 && (
          <p className="mt-1 text-muted-foreground">
            {totalCount} {totalCount === 1 ? "quote" : "quotes"}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quotes found for this topic.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {items.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
