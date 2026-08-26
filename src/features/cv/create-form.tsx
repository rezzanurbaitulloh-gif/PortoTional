"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TemplateRow } from "@/types/database";

export function CreateCvForm({
  templates,
  plan,
  suggestedName,
}: {
  templates: TemplateRow[];
  plan: string;
  suggestedName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(suggestedName);
  const [targetRole, setTargetRole] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(
    templates.find((t) => !t.is_premium)?.id ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const isPro = plan === "pro";

  async function runCreate(generate: boolean) {
    if (generate) setGenerating(true);
    else setBusy(true);
    try {
      const mod = await import("@/actions/cv");
      const res = generate
        ? await mod.generateResumeAction({
            name,
            template_id: templateId,
            target_role: targetRole,
          })
        : await mod.createResumeAction({
            name,
            template_id: templateId,
            target_role: targetRole,
          });
      if (!res.ok) throw new Error(res.error);
      toast.success(
        generate
          ? "CV generated from your Master Identity with AI."
          : "CV created — it starts from your Master Identity.",
      );
      router.push(`/app/cv/${res.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the CV.");
      setGenerating(false);
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await runCreate(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new CV</CardTitle>
        <p className="text-sm text-muted">
          Your CV is generated from your Master Identity. You choose which
          sections to include and how they look.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="cv-name">CV name</Label>
            <Input
              id="cv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="cv-role">Target role (optional)</Label>
            <Input
              id="cv-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Template</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {templates.map((t) => {
                const locked = t.is_premium && !isPro;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={locked}
                    onClick={() => setTemplateId(t.id)}
                    aria-pressed={templateId === t.id}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      templateId === t.id
                        ? "border-gold bg-gold/5"
                        : "border-line hover:border-line-strong"
                    } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <TemplatePreview config={t.configuration as Record<string, unknown>} />
                    <span className="mt-2 block text-sm font-medium text-ivory">
                      {t.name}
                      {t.is_premium ? (
                        <Badge className="ml-1.5 text-[10px]">Pro</Badge>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {!isPro ? (
              <p className="mt-2 text-xs text-muted">
                Premium templates are part of{" "}
                <Link href="/pricing" className="text-gold hover:underline">
                  PortoTional Pro
                </Link>
                .
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy || generating}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Creating…
                </>
              ) : (
                "Create CV"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || generating}
              onClick={() => runCreate(true)}
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" /> Generating…
                </>
              ) : (
                "Generate with AI"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted">
            Generate with AI drafts your professional summary and target role
            from Master Identity facts only — never invented.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function TemplatePreview({ config }: { config: Record<string, unknown> }) {
  const accent = (config.accent as string) ?? "#0B0C10";
  const twoCol = config.layout === "two-column";
  const serif = Boolean(config.serif);
  const mono = Boolean(config.mono);
  const largeHeader = Boolean(config.largeHeader);
  return (
    <div
      aria-hidden
      className="h-24 w-full overflow-hidden rounded-md border border-line bg-white p-1.5"
    >
      <div className="flex items-center gap-1">
        <div
          className={`${largeHeader ? "h-4" : "h-3"} w-16 rounded-sm`}
          style={{ background: accent }}
        />
        {!twoCol ? (
          <div className="ml-auto h-2.5 w-6 rounded-full" style={{ background: "#d8dbe0" }} />
        ) : null}
      </div>
      <div className={`mt-1.5 flex gap-1.5${serif ? " font-serif" : mono ? " font-mono" : ""}`}>
        {twoCol ? (
          <div className="flex w-1/3 flex-col gap-1 border-r border-gray-200 pr-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 rounded-sm bg-gray-200" />
            ))}
            <div className="mt-1 h-1.5 w-8 rounded-full" style={{ background: accent, opacity: 0.7 }} />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-3/4 rounded-sm" style={{ background: accent, opacity: 0.35 }} />
          {[...Array(largeHeader ? 3 : 4)].map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-1.5 w-1/3 rounded-sm bg-gray-300" />
              <div className="h-1.5 flex-1 rounded-sm bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
