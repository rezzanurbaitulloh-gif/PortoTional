"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/** §14/§15 — save & contact actions for signed-in visitors on public profiles. */
export function ProfileActions({
  username,
  initiallySaved,
}: {
  username: string;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState<"contact" | "collaboration">("contact");

  async function toggleSave() {
    setBusy(true);
    try {
      const { toggleSaveProfessionalAction } = await import("@/actions/network");
      const res = await toggleSaveProfessionalAction({ username });
      if (!res.ok) throw new Error(res.error);
      setSaved(Boolean(res.saved));
      toast.success(res.saved ? "Saved to your list." : "Removed from saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { sendContactRequestAction } = await import("@/actions/network");
      const res = await sendContactRequestAction({ username, message, intent });
      if (!res.ok) throw new Error(res.error);
      toast.success("Request sent.");
      setContactOpen(false);
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSave}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
          saved
            ? "border-gold bg-gold/10 text-gold"
            : "border-line text-muted hover:text-ivory"
        }`}
        aria-pressed={saved}
      >
        {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        {saved ? "Saved" : "Save"}
      </button>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Send className="h-3.5 w-3.5" /> Contact
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact @{username}</DialogTitle>
          </DialogHeader>
          <form onSubmit={sendRequest} className="space-y-4">
            <div>
              <Label htmlFor="cr-intent">Intent</Label>
              <Select value={intent} onValueChange={(v) => setIntent(v as typeof intent)}>
                <SelectTrigger id="cr-intent" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact">Get in touch</SelectItem>
                  <SelectItem value="collaboration">Collaborate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cr-msg">Message (optional)</Label>
              <Textarea
                id="cr-msg"
                rows={3}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself briefly…"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              <Send /> {busy ? "Sending…" : "Send request"}
            </Button>
            <p className="text-center text-[11px] text-muted">
              They choose to accept or decline — no open messaging.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
