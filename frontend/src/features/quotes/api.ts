import { api } from "@/shared/lib/api";
import type { QuoteListResponse } from "@/shared/types/quote";

export interface FetchQuotesParams {
  page?: number;
  limit?: number;
  q?: string;
  author?: string;
  tag?: string;
}

export async function fetchQuotes(params: FetchQuotesParams): Promise<QuoteListResponse> {
  const { data } = await api.get<QuoteListResponse>("/quotes", { params });
  return data;
}
