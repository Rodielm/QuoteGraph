import { useEffect, useState } from "react";

import {
  createCollection,
  deleteCollection,
  fetchCollections,
  renameCollection,
} from "@/features/collections/api";
import type { Collection } from "@/shared/types/collection";

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchCollections()
      .then(setCollections)
      .catch(() => setError("Could not load your collections"))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function create(name: string) {
    const collection = await createCollection(name);
    setCollections((prev) => [...prev, collection].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function rename(id: string, name: string) {
    const updated = await renameCollection(id, name);
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function remove(id: string) {
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  return { collections, isLoading, error, create, rename, remove };
}
