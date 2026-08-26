"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "spam", label: "Spam" },
  { value: "fake_information", label: "Fake information" },
  { value: "other", label: "Other" },
];

export function ReportProfileDialog({
  username,
  targetType = "profile",
}: {
  username: string;
  targetType?: "profile" | "website";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("inappropriate_content");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_username: username,
          reason,
          details: details.slice(0, 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Report submitted. Our moderators will review it.");
      setOpen(false);
      setDetails("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
        >
          <Flag className="h-3 w-3" /> Report
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="rp-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="rp-reason" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rp-details">Details (optional)</Label>
            <Textarea
              id="rp-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell us what's wrong…"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Submitting…" : "Submit report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
