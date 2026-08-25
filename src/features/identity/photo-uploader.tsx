"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  uploadProfilePhotoAction,
  removeProfilePhotoAction,
} from "@/actions/uploads";

const OUTPUT_SIZE = 512;

export function PhotoUploader({
  photoUrl,
  fullName,
}: {
  photoUrl: string | null;
  fullName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  function pickFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use JPG, PNG or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(String(reader.result));
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setOpen(true);
    };
    reader.readAsDataURL(file);
  }

  function drawToCanvas(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";
        const baseScale =
          Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height) * zoom;
        const w = img.width * baseScale;
        const h = img.height * baseScale;
        const dx = (OUTPUT_SIZE - w) / 2 + offset.x;
        const dy = (OUTPUT_SIZE - h) / 2 + offset.y;
        ctx.drawImage(img, dx, dy, w, h);
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
      };
      if (typeof rawSrc === "string" && rawSrc.startsWith("data:image")) {
        img.src = rawSrc;
      }
    });
  }

  async function confirmUpload() {
    setBusy(true);
    try {
      const blob = await drawToCanvas();
      if (!blob) throw new Error("Crop failed.");
      const fd = new FormData();
      fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const res = await uploadProfilePhotoAction(fd);
      if (!res.ok) throw new Error(res.error);
      toast.success("Photo updated.");
      setOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    const res = await removeProfilePhotoAction();
    if (res.ok) {
      toast.success("Photo removed.");
      window.location.reload();
    } else {
      toast.error(res.error ?? "Failed to remove photo.");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-20 w-20 overflow-hidden rounded-full border border-line bg-obsidian-raised"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) pickFile(f);
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted">
            {(fullName || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          <Camera /> {photoUrl ? "Replace photo" : "Upload photo"}
        </Button>
        {photoUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-danger"
            onClick={removePhoto}
          >
            <Trash2 /> Remove
          </Button>
        ) : null}
        <p className="text-xs text-muted">JPG, PNG or WEBP · up to 5 MB</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Position your photo</DialogTitle>
          </DialogHeader>
          <div
            className="relative mx-auto h-56 w-56 cursor-move touch-none select-none overflow-hidden rounded-full border border-line-strong bg-obsidian-raised"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const startX = e.clientX;
              const startY = e.clientY;
              const origin = { ...offset };
              const move = (ev: PointerEvent) => {
                setOffset({
                  x: Math.max(-160, Math.min(160, origin.x + ev.clientX - startX)),
                  y: Math.max(-160, Math.min(160, origin.y + ev.clientY - startY)),
                });
              };
              const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };
              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            }}
          >
            {rawSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rawSrc}
                alt="crop preview"
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${zoom * 100}%`,
                  minWidth: "100%",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            ) : null}
          </div>
          <label className="block text-xs text-muted">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-1 w-full accent-[#D4AF37]"
            />
          </label>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpload} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              Save photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
