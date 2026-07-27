import { api } from "@/shared/lib/api";
import type { Reflection } from "@/shared/types/reflection";

export async function getReflection(quoteId: string): Promise<Reflection | null> {
  const { data } = await api.get<Reflection | null>(`/quotes/${quoteId}/reflection`);
  return data;
}

export async function saveReflection(quoteId: string, text: string): Promise<Reflection> {
  const { data } = await api.put<Reflection>(`/quotes/${quoteId}/reflection`, { text });
  return data;
}

export async function deleteReflection(quoteId: string): Promise<void> {
  await api.delete(`/quotes/${quoteId}/reflection`);
}
