"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateCollectionForm() {
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const { createCollectionAction } = await import("@/actions/network");
      const res = await createCollectionAction(name);
      if (!res.ok) throw new Error(res.error);
      toast.success(`Collection "${name.trim()}" created.`);
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      { }
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New collection name…"
        aria-label="New collection name"
        maxLength={60}
        className="h-8 max-w-xs text-xs"
      />
      <Button size="sm" variant="outline" type="submit" disabled={!name.trim()}>
        Create
      </Button>
    </form>
  );
}

export function MoveToCollectionSelect({
  savedId,
  current,
  collections,
}: {
  savedId: string;
  current: string | null;
  collections: { id: string; name: string }[];
}) {
  async function change(value: string) {
    try {
      const { moveToCollectionAction } = await import("@/actions/network");
      const res = await moveToCollectionAction(
        savedId,
        value === "none" ? null : value,
      );
      if (!res.ok) throw new Error(res.error);
      toast.success("Moved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  }

  return (
    <Select defaultValue={current ?? "none"} onValueChange={change}>
      <SelectTrigger className="h-8 w-36 text-xs" aria-label="Move to collection">
        <SelectValue placeholder="No collection" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No collection</SelectItem>
        {collections.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RemoveSavedButton({ savedId }: { savedId: string }) {
  return (
    <button
      type="button"
      aria-label="Remove from saved"
      className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      onClick={async () => {
        const { removeSavedAction } = await import("@/actions/network");
        const res = await removeSavedAction(savedId);
        if (!res.ok) toast.error(res.error);
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
