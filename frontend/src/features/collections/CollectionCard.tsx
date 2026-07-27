import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Collection } from "@/shared/types/collection";

interface CollectionCardProps {
  collection: Collection;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function CollectionCard({ collection, onRename, onDelete }: CollectionCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(collection.name);

  async function handleRenameSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim() && name !== collection.name) {
      await onRename(name.trim());
    }
    setIsRenaming(false);
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-2">
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex-1">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRenameSubmit}
              className="h-8"
            />
          </form>
        ) : (
          <Link to={`/collections/${collection.id}`} className="flex-1 hover:underline">
            <p className="font-medium text-foreground">{collection.name}</p>
            <p className="text-sm text-muted-foreground">
              {collection.quoteCount} {collection.quoteCount === 1 ? "quote" : "quotes"}
            </p>
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Collection options">
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
