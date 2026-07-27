import { api } from "@/shared/lib/api";
import type { Collection, CollectionDetail } from "@/shared/types/collection";

export async function fetchCollections(): Promise<Collection[]> {
  const { data } = await api.get<Collection[]>("/collections");
  return data;
}

export async function fetchCollectionDetail(collectionId: string): Promise<CollectionDetail> {
  const { data } = await api.get<CollectionDetail>(`/collections/${collectionId}`);
  return data;
}

export async function createCollection(name: string): Promise<Collection> {
  const { data } = await api.post<Collection>("/collections", { name });
  return data;
}

export async function renameCollection(collectionId: string, name: string): Promise<Collection> {
  const { data } = await api.put<Collection>(`/collections/${collectionId}`, { name });
  return data;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await api.delete(`/collections/${collectionId}`);
}

export async function addQuoteToCollection(collectionId: string, quoteId: string): Promise<void> {
  await api.put(`/collections/${collectionId}/quotes/${quoteId}`);
}

export async function removeQuoteFromCollection(collectionId: string, quoteId: string): Promise<void> {
  await api.delete(`/collections/${collectionId}/quotes/${quoteId}`);
}
