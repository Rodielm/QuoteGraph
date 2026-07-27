import { FolderPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addQuoteToCollection, fetchCollections } from "@/features/collections/api";
import type { Collection } from "@/shared/types/collection";

export function AddToCollectionMenu({ quoteId }: { quoteId: string }) {
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  async function handleOpenChange(open: boolean) {
    if (open && collections === null) {
      const data = await fetchCollections();
      setCollections(data);
    }
  }

  async function handleAdd(collectionId: string) {
    await addQuoteToCollection(collectionId, quoteId);
    setAddedTo((prev) => new Set(prev).add(collectionId));
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Add to collection">
            <FolderPlus className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {collections === null && (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        )}
        {collections?.length === 0 && (
          <DropdownMenuItem disabled>No collections yet</DropdownMenuItem>
        )}
        {collections?.map((collection) => (
          <DropdownMenuItem key={collection.id} onClick={() => handleAdd(collection.id)}>
            {addedTo.has(collection.id) ? "✓ " : ""}
            {collection.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
