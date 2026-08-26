"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AssetRow = {
  id: string;
  file_name: string;
  mime_type: string;
  size: number;
  category: string;
  created_at: string;
  url: string;
};

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetManager({
  initial,
  plan,
}: {
  initial: AssetRow[];
  plan: string;
}) {
  const [assets, setAssets] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("general");
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = plan === "pro" ? 1000 : 25;

  async function upload(file: File) {
    if (assets.length >= limit) {
      toast.error(`Asset limit reached (${limit}).`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("category", category);
      const { uploadAssetAction } = await import("@/actions/assets");
      const res = await uploadAssetAction(fd);
      if (!res.ok || !res.url) throw new Error(res.error);
      setAssets((arr) => [
        {
          id: `tmp-${Date.now()}`,
          file_name: file.name.slice(0, 120),
          mime_type: file.type,
          size: file.size,
          category,
          created_at: new Date().toISOString(),
          url: res.url!,
        },
        ...arr,
      ]);
      toast.success("Asset uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this asset? References to it will break.")) return;
    try {
      const { deleteAssetAction } = await import("@/actions/assets");
      const res = await deleteAssetAction(id);
      if (!res.ok) throw new Error(res.error);
      setAssets((arr) => arr.filter((a) => a.id !== id));
      toast.success("Asset deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  const filtered = filter
    ? assets.filter((a) =>
        a.file_name.toLowerCase().includes(filter.toLowerCase()) ||
        a.category.toLowerCase().includes(filter.toLowerCase()),
      )
    : assets;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">Asset Library</h1>
        <p className="mt-1 text-sm text-muted">
          Reusable images for showcases and your profile. {assets.length}/{limit} used on the{" "}
          {plan} plan.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gold" /> Library
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name or folder…"
                aria-label="Filter assets"
                className="h-8 w-52 text-xs"
              />
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Folder"
                aria-label="Upload folder"
                className="h-8 w-28 text-xs"
              />
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id="asset-upload-input"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                }}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById("asset-upload-input")?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No assets yet. Upload images to reuse them across showcases.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((a) => (
                <li key={a.id} className="group overflow-hidden rounded-xl border border-line bg-surface">
                  {a.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt="" className="h-28 w-full border-b border-line object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center border-b border-line bg-surface-2 text-xs text-muted">
                      legacy file
                    </div>
                  )}
                  <div className="space-y-1 p-2.5">
                    <p className="truncate text-xs font-medium text-ivory" title={a.file_name}>
                      {a.file_name}
                    </p>
                    <p className="text-[10px] text-muted">
                      {fmtSize(a.size)} · {a.category}
                    </p>
                    <div className="flex gap-1 pt-1">
                      {a.url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => {
                            navigator.clipboard.writeText(a.url);
                            toast.success("URL copied.");
                          }}
                        >
                          <Copy /> Copy URL
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-7 px-2 text-danger hover:bg-danger/10"
                        onClick={() => remove(a.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
