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
  const isPro = plan === "pro";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { createResumeAction } = await import("@/actions/cv");
      const res = await createResumeAction({
        name,
        template_id: templateId,
        target_role: targetRole,
      });
      if (!res.ok) throw new Error(res.error);
      toast.success("CV created — it starts from your Master Identity.");
      router.push(`/app/cv/${res.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the CV.");
      setBusy(false);
    }
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
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      templateId === t.id
                        ? "border-gold bg-gold/5"
                        : "border-line hover:border-line-strong"
                    } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span className="block text-sm font-medium text-ivory">
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
          <Button type="submit" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" /> Creating…
              </>
            ) : (
              "Create CV"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
