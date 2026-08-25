"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAutosave, AutosaveBadge } from "@/features/identity/use-autosave";
import { ExternalLink, Globe, Loader2, MonitorSmartphone, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type {
  TemplateRow,
  WebsiteConfiguration,
  WebsiteRow,
  WebsiteSectionRow,
} from "@/types/database";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  work: "Selected Work",
  experience: "Experience",
  skills: "Skills",
  contact: "Contact",
};

export function WebsiteCustomizer({
  website,
  sections: initialSections,
  themes,
  username,
  rootDomain,
  isLocalhost,
  plan,
}: {
  website: WebsiteRow | null;
  sections: WebsiteSectionRow[];
  themes: TemplateRow[];
  username: string;
  rootDomain: string;
  isLocalhost: boolean;
  plan: string;
}) {
  const [config, setConfig] = useState<WebsiteConfiguration>(
    website?.configuration ?? {
      theme: "editorial-minimal",
      typography: "modern",
      color: "#D4AF37",
      layout: "stacked",
      animations: true,
      threeD: false,
    },
  );
  const [seo, setSeo] = useState({
    title: website?.seo_configuration?.title ?? "",
    description: website?.seo_configuration?.description ?? "",
    index: website?.seo_configuration?.index ?? true,
  });
  const [sections, setSections] = useState(initialSections);
  const [published, setPublished] = useState(website?.published ?? false);
  const [busy, setBusy] = useState(false);
  const isPro = plan === "pro";

  const valuesKey = JSON.stringify([config, seo, sections]);
  const persist = async () => {
    const { updateWebsiteAction, saveWebsiteSectionsAction } = await import(
      "@/actions/website"
    );
    const res = await updateWebsiteAction({ configuration: config, seo_configuration: seo });
    if (!res.ok) return res;
    if (website) {
      return saveWebsiteSectionsAction(
        website.id,
        [...sections]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((x) => ({ id: x.id, is_visible: x.is_visible })),
      );
    }
    return { ok: true };
  };
  const { status: autosaveStatus, saveNow } = useAutosave(persist, valuesKey);

  const hostUrl =
    typeof window !== "undefined" && isLocalhost
      ? `http://${username}.lvh.me:${window.location.port}`
      : `https://${website?.subdomain ?? username}.${rootDomain}`;

  async function save() {
    setBusy(true);
    try {
      const res = await saveNow();
      if (!res) throw new Error("Save failed — retry in a moment.");
      toast.success("Website saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(publish: boolean) {
    setBusy(true);
    try {
      const { togglePublishAction } = await import("@/actions/website");
      const res = await togglePublishAction(publish);
      if (!res.ok) throw new Error(res.error);
      setPublished(publish);
      toast.success(publish ? "Website published." : "Website unpublished.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish.");
    } finally {
      setBusy(false);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const arr = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const [item] = arr.splice(idx, 1);
    arr.splice(target, 0, item);
    setSections(arr.map((s, i) => ({ ...s, sort_order: i })));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">My Website</h1>
        <p className="mt-1 text-sm text-muted">
          One engine renders every member site — no separate deployment.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-gold" /> Status
            </span>
            <Badge variant={published ? "success" : "secondary"}>
              {published ? "Published ✓" : "Draft"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-md border border-line bg-obsidian-raised px-3 py-1.5 font-mono text-xs text-gold">
              {hostUrl.replace(/^https?:\/\//, "")}
            </code>
            <Button size="sm" variant="secondary" asChild disabled={!published}>
              <a href={hostUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open
              </a>
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ivory">Publish website</p>
              {!isPro ? (
                <p className="mt-0.5 text-xs text-muted">
                  Publishing is a Pro feature.
                </p>
              ) : !published ? (
                <p className="mt-0.5 text-xs text-muted">
                  Requires your public profile to be visible first.
                </p>
              ) : null}
            </div>
            <Switch
              checked={published}
              onCheckedChange={(v) => togglePublish(v)}
              disabled={busy || !isPro}
              aria-label="Publish website"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Theme</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          {themes.map((t) => {
            const locked = t.is_premium && !isPro;
            return (
              <button
                key={t.id}
                type="button"
                disabled={locked}
                onClick={() => setConfig({ ...config, theme: t.slug })}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  config.theme === t.slug
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
                <span className="mt-0.5 block text-xs text-muted line-clamp-2">
                  {t.description}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Sections</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          {[...sections]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((s, idx) => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-ivory">{SECTION_LABELS[s.section_type] ?? s.section_type}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="px-1 text-muted hover:text-ivory disabled:opacity-30"
                    aria-label={`Move up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === sections.length - 1}
                    className="px-1 text-muted hover:text-ivory disabled:opacity-30"
                    aria-label={`Move down`}
                  >
                    ↓
                  </button>
                  <Switch
                    checked={s.is_visible}
                    onCheckedChange={(v) =>
                      setSections(
                        sections.map((x) =>
                          x.id === s.id ? { ...x, is_visible: v } : x,
                        ),
                      )
                    }
                    aria-label={`Toggle ${SECTION_LABELS[s.section_type]}`}
                  />
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SEO & social preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="w-title">Page title</Label>
            <Input
              id="w-title"
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              placeholder={`${username} — Professional Portfolio`}
              className="mt-1.5"
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="w-desc">Meta description</Label>
            <Input
              id="w-desc"
              value={seo.description}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
              placeholder="A short description shown in search results…"
              className="mt-1.5"
              maxLength={200}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="w-index">Allow search indexing</Label>
            <Switch
              id="w-index"
              checked={seo.index}
              onCheckedChange={(v) => setSeo({ ...seo, index: v })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs text-muted">
          <MonitorSmartphone className="h-3.5 w-3.5" />
          Responsive & mobile-ready by default ·{" "}
          <Globe className="h-3.5 w-3.5" /> 3D optional (lazy-loaded)
        </p>
        <div className="flex items-center gap-3">
          <AutosaveBadge status={autosaveStatus} />
          <Button onClick={save} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null} Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
