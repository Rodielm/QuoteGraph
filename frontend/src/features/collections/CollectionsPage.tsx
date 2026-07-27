import { CollectionCard } from "@/features/collections/CollectionCard";
import { CreateCollectionDialog } from "@/features/collections/CreateCollectionDialog";
import { useCollections } from "@/features/collections/useCollections";

export function CollectionsPage() {
  const { collections, isLoading, error, create, rename, remove } = useCollections();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Your collections</h1>
          <p className="mt-1 text-muted-foreground">Group quotes around your own themes.</p>
        </div>
        <CreateCollectionDialog onCreate={create} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You don't have any collections yet. Create one to start grouping quotes.
        </p>
      ) : (
        <div className="space-y-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onRename={(name) => rename(collection.id, name)}
              onDelete={() => remove(collection.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
