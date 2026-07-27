import { api } from "@/shared/lib/api";
import type { QuoteGraphResponse } from "@/shared/types/graph";

export async function fetchQuoteGraph(quoteId: string): Promise<QuoteGraphResponse> {
  const { data } = await api.get<QuoteGraphResponse>(`/graph/quotes/${quoteId}`);
  return data;
}

export async function expandAuthor(
  authorSlug: string,
  excludeQuoteIds: string[],
): Promise<QuoteGraphResponse> {
  const { data } = await api.get<QuoteGraphResponse>(`/graph/authors/${authorSlug}/expand`, {
    params: { exclude: excludeQuoteIds },
  });
  return data;
}

export async function expandTopic(
  topicName: string,
  excludeQuoteIds: string[],
): Promise<QuoteGraphResponse> {
  const { data } = await api.get<QuoteGraphResponse>(
    `/graph/topics/${encodeURIComponent(topicName)}/expand`,
    { params: { exclude: excludeQuoteIds } },
  );
  return data;
}
