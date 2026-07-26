import { api } from "@/shared/lib/api";
import type { Quote, QuoteListResponse } from "@/shared/types/quote";

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

export interface FavoriteStatus {
  isFavorited: boolean;
}

export async function getFavoriteStatus(quoteId: string): Promise<FavoriteStatus> {
  const { data } = await api.get<FavoriteStatus>(`/quotes/${quoteId}/favorite`);
  return data;
}

export async function addFavorite(quoteId: string): Promise<FavoriteStatus> {
  const { data } = await api.put<FavoriteStatus>(`/quotes/${quoteId}/favorite`);
  return data;
}

export async function removeFavorite(quoteId: string): Promise<FavoriteStatus> {
  const { data } = await api.delete<FavoriteStatus>(`/quotes/${quoteId}/favorite`);
  return data;
}

export async function fetchFavoriteQuotes(): Promise<Quote[]> {
  const { data } = await api.get<Quote[]>("/users/me/favorites");
  return data;
}
