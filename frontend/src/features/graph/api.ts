import { api } from "@/shared/lib/api";
import type { QuoteGraphResponse } from "@/shared/types/graph";

export async function fetchQuoteGraph(quoteId: string): Promise<QuoteGraphResponse> {
  const { data } = await api.get<QuoteGraphResponse>(`/graph/quotes/${quoteId}`);
  return data;
}
