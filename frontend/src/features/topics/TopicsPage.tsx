import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchTopics } from "@/features/topics/api";
import type { Topic } from "@/shared/types/topic";

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(() => setError("Could not load topics"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Topics</h1>
        <p className="mt-1 text-muted-foreground">Explore quotes by theme.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Link
              key={topic.name}
              to={`/topics/${encodeURIComponent(topic.name)}`}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {topic.name}
              <span className="text-muted-foreground">{topic.quoteCount}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
