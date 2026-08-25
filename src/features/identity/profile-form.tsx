"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateProfileAction,
  type experienceSchema,
} from "@/actions/identity";
import { useAutosave, AutosaveBadge } from "@/features/identity/use-autosave";
import type { z } from "zod";

type ExperienceInput = z.infer<typeof experienceSchema>;

export function ProfileForm({
  initial,
}: {
  initial: {
    full_name: string;
    headline: string;
    summary: string;
    location: string;
    availability: string;
    availability_message: string;
    summaryProfileForAi: Record<string, unknown>;
  };
}) {
  const [fullName, setFullName] = useState(initial.full_name);
  const [headline, setHeadline] = useState(initial.headline);
  const [location, setLocation] = useState(initial.location);
  const [availability, setAvailability] = useState(initial.availability);
  const [summary, setSummary] = useState(initial.summary);
  const router = useRouter();

  const valuesKey = JSON.stringify([fullName, headline, location, availability, summary]);
  const { status, saveNow } = useAutosave(
    () =>
      updateProfileAction({
        full_name: fullName,
        headline,
        location,
        availability,
        availability_message: undefined,
        summary,
      }),
    valuesKey,
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (await saveNow()) {
      toast.success("Identity saved.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center justify-end">
        <AutosaveBadge status={status} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5"
            placeholder="Reja Pratama"
          />
        </div>
        <div>
          <Label htmlFor="headline">Professional headline</Label>
          <Input
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="mt-1.5"
            placeholder="Product Designer · 6 years in fintech"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5"
            placeholder="Jakarta, Indonesia"
          />
        </div>
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger id="availability" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open_to_work">Open to work</SelectItem>
              <SelectItem value="open_to_opportunities">
                Open to opportunities
              </SelectItem>
              <SelectItem value="not_available">Not available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AiSummaryBlock
        profilePayload={initial.summaryProfileForAi}
        summary={summary}
        setSummary={setSummary}
      />

      <Button type="submit">
        <Loader2 className={status === "saving" ? "animate-spin" : "hidden"} />
        Save changes
      </Button>
    </form>
  );
}

function AiSummaryBlock({
  profilePayload,
  summary,
  setSummary,
}: {
  profilePayload: Record<string, unknown>;
  summary: string;
  setSummary: (v: string) => void;
}) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "summary", profile: profilePayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuggestion(
        data.text.startsWith("Insufficient")
          ? "Insufficient information. Add more details (experience, skills, education) first."
          : data.text,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-obsidian-raised/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label htmlFor="summary">Professional summary</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={generate}
          disabled={busy}
        >
          {busy ? <Loader2 className="animate-spin" /> : null}
          Generate with AI
        </Button>
      </div>
      <p className="mb-2 text-xs text-muted">
        AI writes this only from facts already in your identity — it never
        invents roles, companies or numbers.
      </p>
      <Textarea
        id="summary"
        rows={4}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="A concise professional summary…"
      />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      {suggestion ? (
        <div className="mt-2 rounded-lg border border-gold/30 bg-gold/[0.04] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            AI suggestion
          </p>
          <p className="mt-1.5 text-sm text-ivory-dim">{suggestion}</p>
          <div className="mt-2 flex gap-2">
            <Button type="button" size="sm" onClick={() => setSummary(suggestion)}>
              Accept
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={generate} disabled={busy}>
              Regenerate
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { ExperienceInput };
