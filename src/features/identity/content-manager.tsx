"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { AiSuggestionField } from "@/features/identity/ai-suggestion-field";
import {
  saveContentItemAction,
  deleteContentItemAction,
  toggleContentVisibilityAction,
  reorderContentAction,
} from "@/actions/identity";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "url"
  | "number"
  | "select"
  | "tags"
  | "boolean"
  | "image";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  span?: 1 | 2;
  helpText?: string;
}

import type { ItemRecord } from "@/features/identity/item-records";

export type { ItemRecord };

export type EntityName =
  | "experiences"
  | "educations"
  | "skills"
  | "works"
  | "achievements"
  | "certifications"
  | "languages"
  | "social_links";

function emptyFromFields(fields: FieldDef[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "tags") out[f.name] = [];
    else if (f.type === "boolean") out[f.name] = false;
    else out[f.name] = "";
    if (f.name.endsWith("_date") || f.name.endsWith("_url"))
      out[f.name] = null as unknown as string;
  }
  return out;
}

function itemToForm(item: ItemRecord, fields: FieldDef[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = item[f.name];
    if (f.type === "date") {
      out[f.name] = v ? String(v).slice(0, 10) : "";
    } else if (f.type === "boolean") {
      out[f.name] = Boolean(v);
    } else {
      out[f.name] = v ?? (f.type === "tags" ? [] : "");
    }
  }
  return out;
}

export function ContentManager({
  entity,
  title,
  description,
  fields,
  items: initialItems,
  emptyHint,
  titleFields,
  allowReorder = true,
}: {
  entity: EntityName;
  title: string;
  description?: string;
  fields: FieldDef[];
  items: ItemRecord[];
  emptyHint: string;
  allowReorder?: boolean;
  titleFields?: string[];
}) {
  const [items, setItems] = useState<ItemRecord[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(() =>
    emptyFromFields(fields),
  );
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)),
    [items],
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyFromFields(fields));
    setOpen(true);
  }

  function openEdit(item: ItemRecord) {
    setEditingId(item.id);
    setForm(itemToForm(item, fields));
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      for (const f of fields) {
        if (f.type === "date") {
          payload[f.name] =
            typeof payload[f.name] === "string" && payload[f.name]
              ? payload[f.name]
              : null;
        }
        if ((f.type === "url") && payload[f.name] === "") payload[f.name] = null;
      }
      const res = await saveContentItemAction(entity, editingId, payload);
      if (!res.ok) throw new Error(res.error);
      toast.success(editingId ? "Changes saved." : `${title.replace(/s$/, "")} added.`);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    const res = await deleteContentItemAction(entity, id);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted.");
    } else {
      toast.error(res.error ?? "Delete failed.");
    }
  }

  async function toggleVisibility(id: string, visible: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, visibility: visible } : i)),
    );
    const res = await toggleContentVisibilityAction(entity, id, visible);
    if (!res.ok) toast.error(res.error ?? "Failed to update visibility.");
  }

  async function commitReorder(newOrder: string[]) {
    const map = new Map(items.map((i) => [i.id, i]));
    setItems(
      newOrder.map((id, idx) => ({ ...map.get(id)!, sort_order: idx })) as ItemRecord[],
    );
    await reorderContentAction(entity, newOrder);
  }

  function onDrop(targetIdx: number) {
    if (dragIndex === null || dragIndex === targetIdx) return;
    const arr = [...sorted];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(targetIdx, 0, moved);
    void commitReorder(arr.map((i) => i.id));
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ivory">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description={emptyHint}
          action={
            <Button size="sm" variant="outline" onClick={openCreate}>
              <Plus /> Add first entry
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {sorted.map((item, idx) => (
            <li
              key={item.id}
              draggable={allowReorder}
              onDragStart={() => setDragIndex(idx)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(idx);
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(idx);
              }}
              className={
                dragOverIndex === idx && dragIndex !== null && dragIndex !== idx
                  ? "rounded-xl ring-1 ring-gold/50"
                  : undefined
              }
            >
              <Card className="group flex items-start gap-3 p-4">
                {allowReorder ? (
                  <span className="mt-1 cursor-grab text-muted opacity-40 transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-4 w-4" />
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ivory">
                    {(titleFields ?? [fields[0]?.name])
                      .map((f) =>
                        Array.isArray(item[f])
                          ? (item[f] as string[]).join(", ")
                          : String(item[f] ?? ""),
                      )
                      .filter(Boolean)
                      .join(" · ") || String(item[fields[0]?.name] ?? "")}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                    {fields
                      .slice(1, 4)
                      .map((f) =>
                        f.type === "date" && item[f.name]
                          ? new Date(String(item[f.name]) + "T00:00:00").toLocaleDateString()
                          : Array.isArray(item[f.name])
                            ? (item[f.name] as string[]).join(", ")
                            : item[f.name],
                      )
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span title={item.visibility ? "Visible on public profile" : "Hidden from public profile"}>
                    <Switch
                      checked={item.visibility}
                      onCheckedChange={(v) => toggleVisibility(item.id, v)}
                      aria-label="Toggle visibility"
                    />
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(item)}
                    aria-label="Edit"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-danger hover:text-danger"
                    onClick={() => remove(item.id)}
                    aria-label="Delete"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.name}
                className={f.span === 2 || f.type === "textarea" ? "sm:col-span-2" : ""}
              >
                {f.type !== "textarea" ? (
                  <Label htmlFor={`${entity}-${f.name}`}>{f.label}</Label>
                ) : null}
                {f.type === "textarea" ? (
                  <div className="mt-1.5">
                    <AiSuggestionField
                      label={f.label + (f.required ? " *" : "")}
                      value={String(form[f.name] ?? "")}
                      context={`${title} — ${f.label}`}
                      action="refine"
                      rows={4}
                      onChange={(v) => setForm({ ...form, [f.name]: v })}
                    />
                  </div>
                ) : f.type === "select" ? (
                  <Select
                    value={String(form[f.name] ?? "")}
                    onValueChange={(v) => setForm({ ...form, [f.name]: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(f.options ?? []).map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "boolean" ? (
                  <div className="flex h-10 items-center">
                    <Switch
                      id={`${entity}-${f.name}`}
                      checked={Boolean(form[f.name])}
                      onCheckedChange={(v) =>
                        setForm({ ...form, [f.name]: v })
                      }
                    />
                  </div>
                ) : f.type === "image" ? (
                  <ImageField
                    id={`${entity}-${f.name}`}
                    value={typeof form[f.name] === "string" ? String(form[f.name]) : ""}
                    onChange={(url) => setForm({ ...form, [f.name]: url })}
                  />
                ) : f.type === "tags" ? (
                  <Input
                    id={`${entity}-${f.name}`}
                    placeholder={f.placeholder ?? "Comma-separated"}
                    value={
                      Array.isArray(form[f.name])
                        ? (form[f.name] as string[]).join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [f.name]: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-1.5"
                  />
                ) : (
                  <Input
                    id={`${entity}-${f.name}`}
                    type={
                      f.type === "date"
                        ? "date"
                        : f.type === "url"
                          ? "url"
                          : "text"
                    }
                    required={f.required}
                    placeholder={f.placeholder}
                    value={String(form[f.name] ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [f.name]: e.target.value })
                    }
                    className="mt-1.5"
                  />
                )}
                {f.helpText ? (
                  <p className="mt-1 text-xs text-muted">{f.helpText}</p>
                ) : null}
              </div>
            ))}
            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ImageField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { uploadWorkImageAction } = await import("@/actions/uploads");
      const res = await uploadWorkImageAction(fd);
      if (res.ok && res.url) onChange(res.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-12 w-16 rounded border border-line object-cover"
        />
      ) : null}
      <label
        htmlFor={id}
        className="inline-flex h-8 cursor-pointer items-center rounded-md border border-line bg-obsidian-raised px-3 text-xs text-ivory-dim hover:border-line-strong"
      >
        {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </label>
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-danger hover:underline"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
