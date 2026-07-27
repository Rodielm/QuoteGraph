import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteReflection, getReflection, saveReflection } from "@/features/reflections/api";

export function ReflectionEditor({ quoteId }: { quoteId: string }) {
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReflection(quoteId)
      .then((reflection) => {
        if (cancelled) return;
        setText(reflection?.text ?? "");
        setSavedText(reflection?.text ?? "");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  async function handleSave() {
    setIsSaving(true);
    try {
      if (text.trim()) {
        await saveReflection(quoteId, text.trim());
        setSavedText(text.trim());
      } else if (savedText) {
        await deleteReflection(quoteId);
        setSavedText("");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges = text.trim() !== savedText;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading reflection...</p>;
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your reflection on this quote..."
        rows={3}
        className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
