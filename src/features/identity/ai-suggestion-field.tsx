"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AiSuggestionField({
  label,
  value,
  context,
  action,
  language = "en",
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  context: string;
  action: "refine" | "summary" | "translate";
  language?: "en" | "id";
  rows?: number;
  onChange: (v: string) => void;
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
        body: JSON.stringify(
          action === "summary"
            ? { action: "summary", profile: JSON.parse(value || "{}") }
            : action === "translate"
              ? {
                  action: "translate",
                  text: value,
                  targetLanguage: language === "en" ? "English" : "Indonesian",
                }
              : { action: "refine", text: value, context, language },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuggestion(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ivory-dim">{label}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={generate}
          disabled={busy}
          title="AI improves wording using only your existing data"
        >
          {busy ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          {action === "summary" ? "Generate with AI" : "Improve with AI"}
        </Button>
      </div>

      <Textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          action === "summary"
            ? "A short professional summary will appear here…"
            : undefined
        }
      />

      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}

      {suggestion ? (
        <div className="mt-2 rounded-lg border border-gold/30 bg-gold/[0.04] p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gold">
              AI suggestion
            </p>
            <button
              type="button"
              aria-label="Dismiss suggestion"
              onClick={() => setSuggestion(null)}
              className="text-muted hover:text-ivory"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-ivory-dim">
            {suggestion}
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onChange(suggestion);
                setSuggestion(null);
              }}
            >
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={generate}
              disabled={busy}
            >
              Regenerate
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSuggestion(null)}
            >
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
