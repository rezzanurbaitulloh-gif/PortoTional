"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileDown,
  History,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ResumeDocument, type ResumeSectionType } from "@/features/cv/document";
import { analyzeAts } from "@/lib/ats";
import {
  useBuilderStore,
  restoreOfflineDraft,
  buildDoc,
  type BuilderSection,
} from "@/features/cv/store";
import type { ResumeRow } from "@/types/database";
import type {
  CertificationRow,
  EducationRow,
  ExperienceRow,
  ResumeVersionRow,
  SkillRow,
  TemplateRow,
  WorkRow,
} from "@/types/database";

const SECTION_LABELS: Record<ResumeSectionType, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
};

interface MasterData {
  fullName: string;
  headline: string;
  summary: string;
  photoUrl: string | null;
  location: string;
  profession: string | null;
  experiences: ExperienceRow[];
  educations: EducationRow[];
  skills: SkillRow[];
  works: WorkRow[];
  certifications: CertificationRow[];
}

export function CvBuilder({
  resumeId,
  templates,
  master,
  initialSections,
  initialFields,
  initialSettings,
  plan,
}: {
  resumeId: string;
  templates: TemplateRow[];
  master: MasterData;
  initialSections: BuilderSection[];
  initialFields: Pick<
    ResumeRow,
    | "name"
    | "target_role"
    | "target_company"
    | "target_job_description"
    | "language"
    | "page_size"
    | "template_id"
  >;
  initialSettings: { accentColor: string; showPhoto: boolean; fontScale: number };
  plan: string;
}) {
  const store = useBuilderStore();
  const isPro = plan === "pro";
  const [zoom, setZoom] = useState(0.72);
const [hydrated, setHydrated] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<ResumeVersionRow[]>([]);
  const [exporting, setExporting] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [tailorResult, setTailorResult] = useState<{
    summary: string;
    suggestions: { section: string; reason: string }[];
    matchedKeywords: string[];
    missingKeywords: string[];
  } | null>(null);

  useEffect(() => {
    if (hydrated) return;
    useBuilderStore.getState().hydrate({
      resumeId,
      fields: { ...useBuilderStore.getState().fields, ...initialFields },
      settings: { ...useBuilderStore.getState().settings, ...initialSettings },
      sections: initialSections,
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  useEffect(() => {
    if (!hydrated) return;
    const draftRestored = restoreOfflineDraft(resumeId);
    if (draftRestored) {
      toast.info("Offline changes restored — syncing now.");
    }
     
  }, [hydrated, resumeId]);

  const templateSlug =
    templates.find((t) => t.id === store.fields.template_id)?.slug ??
    "classic-professional";

  const doc = useMemo(
    () =>
      buildDoc(store, {
        ...master,
        templateSlug,
      }),
    [store, master, templateSlug],
  );

  const ats = useMemo(() => {
    const bullets = doc.experiences.map((e) =>
      Math.max(0, e.description.split("\n").filter((l) => l.trim()).length),
    );
    const sentences = `${doc.profile.summaryOverride ?? doc.profile.masterSummary}`
      .split(/[.!?]+/)
      .filter(Boolean);
    const words = sentences.join(" ").split(/\s+/).filter(Boolean).length;
    const specialChars = (
      doc.profile.summaryOverride ?? doc.profile.masterSummary
    ).match(/[★✦►●◆]/g)?.length ?? 0;
    return analyzeAts({
      hasSummary:
        (doc.profile.summaryOverride ?? doc.profile.masterSummary).trim().length >
        40,
      summaryLength: (
        doc.profile.summaryOverride ?? doc.profile.masterSummary
      ).length,
      experienceCount: doc.experiences.length + doc.works.length,
      educationCount: doc.educations.length,
      skillCount: doc.skills.length,
      bulletsPerExperience: bullets,
      avgSentenceWords: sentences.length ? Math.round(words / sentences.length) : 0,
      targetJobDescription: store.fields.target_job_description || null,
      skillNames: doc.skills.map((s) => s.name),
      dateRangesValid: true,
      usesStandardHeadings: true,
      specialCharacterHeavy: specialChars > 4,
    });
  }, [doc, store.fields.target_job_description]);

  async function exportPdf() {
    setExporting(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "PDF generation failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.fields.name.replace(/\s+/g, "-")}-${store.fields.page_size}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF generation failed.");
    } finally {
      setExporting(false);
    }
  }

  async function openVersions() {
    const { listVersionsAction } = await import("@/actions/cv");
    setVersions(await listVersionsAction(resumeId));
    setVersionsOpen(true);
  }

  async function restoreVersion(version: ResumeVersionRow) {
    const snapshot = version.snapshot as {
      sections?: BuilderSection[];
    };
    if (!snapshot.sections) {
      toast.error("This version has no restorable section data.");
      return;
    }
    store.setSections(snapshot.sections);
    toast.success(`Restored to v${version.version_number}. Saving…`);
    setTimeout(() => {
      void persistNow();
    }, 100);
    setVersionsOpen(false);
  }

  async function persistNow() {
    const { setResumeSectionsAction, updateResumeAction } = await import("@/actions/cv");
    await updateResumeAction({
      id: resumeId,
      ...store.fields,
      settings: store.settings,
    });
    await setResumeSectionsAction(resumeId, store.sections);
    useBuilderStore.setState({ status: "saved", dirtySince: null });
  }

  async function saveManualVersion() {
    try {
      await persistNow();
      const { saveVersionAction } = await import("@/actions/cv");
      const res = await saveVersionAction(resumeId, "Manual save");
      if (res.ok) toast.success("Version saved.");
      else toast.error(res.error ?? "Failed to save version.");
    } catch {
      toast.error("Could not save a version right now.");
    }
  }

  async function runTailor() {
    if ((store.fields.target_job_description ?? "").length < 30) {
      toast.error("Paste the job description first (at least 30 characters).");
      return;
    }
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tailor",
          jobDescription: store.fields.target_job_description,
          snapshot: { doc },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      let parsed = data.text;
      try {
        if (parsed.startsWith("```")) {
          parsed = parsed.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
        }
        parsed = JSON.parse(parsed);
      } catch {}
      setTailorResult(parsed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setAiBusy(false);
    }
  }

  async function aiImproveSummary() {
    setAiBusy(true);
    try {
      const current =
        String(
          store.sections.find((s) => s.section_type === "summary")?.custom_content?.text ?? "",
        ) || doc.profile.masterSummary;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refine",
          text: current || "Professional in " + (master.profession ?? "my field"),
          context: "CV professional summary",
          language: store.fields.language === "id" ? "id" : "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const sec = store.sections.find((s) => s.section_type === "summary");
      if (!sec) return;
      store.patchSection("summary", {
        custom_content: { ...(sec.custom_content ?? {}), text: data.text },
      });
      toast.success("Suggestion applied to the Summary editor below — review and save.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setAiBusy(false);
    }
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const arr = [...store.sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const [item] = arr.splice(idx, 1);
    arr.splice(target, 0, item);
    store.setSections(arr);
  }

  const statusLabel = {
    saved: "Saved ✓",
    dirty: "Unsaved changes…",
    saving: "Saving…",
    offline: "Offline — saved locally",
    syncing: "Syncing…",
  }[store.status];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" asChild aria-label="Back to CVs">
            <Link href="/app/cv">
              <ArrowLeft />
            </Link>
          </Button>
          <Input
            value={store.fields.name}
            onChange={(e) => store.setField("name", e.target.value)}
            className="h-9 w-56 font-semibold"
            aria-label="CV name"
          />
          <Badge variant={store.status === "saved" ? "success" : "secondary"}>
            {statusLabel}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" onClick={saveManualVersion}>
            <Check /> Save version
          </Button>
          <Button size="sm" variant="ghost" onClick={openVersions}>
            <History /> History
          </Button>
          <Button size="sm" onClick={exportPdf} disabled={exporting}>
            {exporting ? <Loader2 className="animate-spin" /> : <FileDown />}
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <Tabs defaultValue="content" className="min-w-0">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="content">Sections</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="ats">ATS</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-3">
            {store.sections.map((section, idx) => {
              const counts: Record<ResumeSectionType, number> = {
                summary: 1,
                experience: master.experiences.length,
                education: master.educations.length,
                skills: master.skills.length,
                projects: master.works.length,
                certifications: master.certifications.length,
              };
              const selectedCount =
                section.section_type === "summary"
                  ? 1
                  : section.source_reference.length || counts[section.section_type];
              return (
                <Card key={section.section_type} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-ivory">
                      <Switch
                        checked={section.is_visible}
                        onCheckedChange={(v) =>
                          store.patchSection(section.section_type, {
                            is_visible: v,
                          })
                        }
                        aria-label={`Toggle ${SECTION_LABELS[section.section_type]}`}
                      />
                      {SECTION_LABELS[section.section_type]}
                      {selectedCount > 0 ? (
                        <span className="text-xs text-muted">({selectedCount})</span>
                      ) : null}
                    </span>
                    <span className="flex">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Move up"
                      >
                        <ChevronUp />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === store.sections.length - 1}
                        aria-label="Move down"
                      >
                        <ChevronDown />
                      </Button>
                    </span>
                  </div>

                  {section.section_type === "summary" ? (
                    <Textarea
                      rows={3}
                      className="mt-2 text-sm"
                      placeholder="Custom summary for this CV (leave empty to use your Master Identity summary)"
                      value={
                        String(section.custom_content?.text ?? "") ||
                        ""
                      }
                      onChange={(e) =>
                        store.patchSection("summary", {
                          custom_content: {
                            ...(section.custom_content ?? {}),
                            text: e.target.value,
                          },
                        })
                      }
                    />
                  ) : null}

                  {section.section_type !== "summary" &&
                  counts[section.section_type] > 0 ? (
                    <ItemPicker
                      type={section.section_type}
                      selected={new Set(section.source_reference)}
                      master={master}
                      onToggle={(ids) =>
                        store.patchSection(section.section_type, {
                          source_reference: ids,
                        })
                      }
                    />
                  ) : null}

                  {counts[section.section_type] === 0 &&
                  section.section_type !== "summary" ? (
                    <p className="mt-1.5 text-xs text-muted">
                      No content yet —{" "}
                      <Link
                        href={`/app/identity/${identityPathFor(section.section_type)}`}
                        className="text-gold hover:underline"
                      >
                        add it to your identity
                      </Link>
                      .
                    </p>
                  ) : null}
                </Card>
              );
            })}

            <Card className="border-gold/25 bg-gold/[0.03] p-3">
              <Label htmlFor="jd" className="text-xs uppercase tracking-wide text-gold">
                Tailor to a job description
              </Label>
              <p className="mt-1 text-xs text-muted">
                Paste a job posting — AI reorders emphasis using only your real
                facts.
              </p>
              <Textarea
                id="jd"
                rows={4}
                className="mt-2 text-sm"
                value={store.fields.target_job_description}
                onChange={(e) =>
                  store.setField("target_job_description", e.target.value)
                }
                placeholder="Paste the job description here…"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Target role"
                  value={store.fields.target_role}
                  onChange={(e) => store.setField("target_role", e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Target company"
                  value={store.fields.target_company}
                  onChange={(e) =>
                    store.setField("target_company", e.target.value)
                  }
                  className="h-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={runTailor}
                disabled={aiBusy}
              >
                {aiBusy ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Analyze fit
              </Button>
              {tailorResult ? (
                <div className="mt-3 rounded-lg border border-gold/30 bg-obsidian-raised p-3 text-sm">
                  <p className="font-medium text-gold">AI tailoring report</p>
                  <p className="mt-2 whitespace-pre-wrap text-ivory-dim">
                    {typeof tailorResult.summary === "string"
                      ? tailorResult.summary
                      : JSON.stringify(tailorResult, null, 2)}
                  </p>
                  {Array.isArray(tailorResult.matchedKeywords) ? (
                    <p className="mt-2 text-xs text-success">
                      Matched keywords: {tailorResult.matchedKeywords.join(", ") || "—"}
                    </p>
                  ) : null}
                  {Array.isArray(tailorResult.missingKeywords) ? (
                    <p className="mt-1 text-xs text-muted">
                      Missing from your CV: {tailorResult.missingKeywords.join(", ") || "none"}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Card>
          </TabsContent>

          <TabsContent value="design" className="space-y-3">
            <Card className="p-4 space-y-4">
              <div>
                <Label>Template</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {templates.map((t) => {
                    const locked = t.is_premium && !isPro;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={locked}
                        onClick={() => store.setField("template_id", t.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          store.fields.template_id === t.id
                            ? "border-gold bg-gold/5"
                            : "border-line hover:border-line-strong"
                        } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <span className="block text-sm font-medium text-ivory">
                          {t.name}{" "}
                          {t.is_premium ? (
                            <Badge variant="default" className="ml-1 text-[10px]">
                              Pro
                            </Badge>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted line-clamp-2">
                          {t.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Page size</Label>
                  <Select
                    value={store.fields.page_size}
                    onValueChange={(v) =>
                      store.setField("page_size", v as "A4" | "F4" | "LETTER")
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="F4">F4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select
                    value={store.fields.language}
                    onValueChange={(v) => store.setField("language", v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="accent">Accent color</Label>
                  <input
                    id="accent"
                    type="color"
                    value={store.settings.accentColor}
                    onChange={(e) =>
                      store.setSettings({ accentColor: e.target.value })
                    }
                    className="mt-1.5 h-10 w-full cursor-pointer rounded-md border border-line bg-obsidian-raised p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="scale">Text scale ({Math.round(store.settings.fontScale * 100)}%)</Label>
                  <input
                    id="scale"
                    type="range"
                    min={0.85}
                    max={1.15}
                    step={0.05}
                    value={store.settings.fontScale}
                    onChange={(e) =>
                      store.setSettings({ fontScale: Number(e.target.value) })
                    }
                    className="mt-3 w-full accent-[#D4AF37]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="photo-toggle">Show photo</Label>
                <Switch
                  id="photo-toggle"
                  checked={store.settings.showPhoto && Boolean(master.photoUrl)}
                  disabled={!master.photoUrl}
                  onCheckedChange={(v) => store.setSettings({ showPhoto: v })}
                />
              </div>
              {!master.photoUrl ? (
                <p className="text-xs text-muted">
                  Upload a photo in{" "}
                  <Link href="/app/identity" className="text-gold hover:underline">
                    Identity
                  </Link>{" "}
                  to include one.
                </p>
              ) : null}
            </Card>
          </TabsContent>

          <TabsContent value="ats" className="space-y-3">
            <Card className="p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-ivory">ATS readiness</p>
                <p className="text-2xl font-semibold text-gold">{ats.score}</p>
              </div>
              <div className="mt-3 space-y-2.5">
                {(Object.entries(ats.breakdown) as [string, number][]).map(
                  ([area, score]) => (
                    <div key={area}>
                      <div className="flex justify-between text-xs text-muted">
                        <span className="capitalize">{area}</span>
                        <span>{score}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-gold/80"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
              {ats.notes.length ? (
                <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-ivory-dim">
                  {ats.notes.map((n, i) => (
                    <li key={i}>
                      • <span className="text-muted">{n.area}:</span> {n.note}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                This is guidance based on common parsing practices — not a
                guarantee of passing any employer&apos;s system.
              </p>
              <div className="mt-4 border-t border-line pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={aiImproveSummary}
                  disabled={aiBusy}
                  className="w-full"
                >
                  {aiBusy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  AI: improve my summary wording
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="min-w-0">
          <div className="sticky top-20">
            <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
              <div
                className="mx-auto w-fit origin-top shadow-2xl"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="pointer-events-none">
                  <PreviewFrame doc={doc} />
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              {/* §11 viewer controls — zoom never changes document layout */}
              <div
                role="group"
                aria-label="Preview zoom"
                className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
                  aria-label="Zoom out"
                  className="rounded-md px-2 py-1 text-xs text-muted hover:text-ivory"
                >
                  −
                </button>
                <span className="min-w-[38px] text-center text-[11px] text-muted">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.25, +(z + 0.1).toFixed(2)))}
                  aria-label="Zoom in"
                  className="rounded-md px-2 py-1 text-xs text-muted hover:text-ivory"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(0.72)}
                  aria-label="Reset zoom"
                  className="rounded-md px-2 py-1 text-[11px] text-muted hover:text-ivory"
                >
                  Reset
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-center text-xs text-muted">
                <Eye className="h-3 w-3" /> Live preview · {doc.pageSize} ·
                updates as you edit
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>
          {versions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">
              No versions yet — press &ldquo;Save version&rdquo; to create one.
            </p>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-y-auto">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-line px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-ivory">
                      v{v.version_number}
                      {v.label ? ` · ${v.label}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => restoreVersion(v)}
                  >
                    <RefreshCw /> Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewFrame({ doc }: { doc: ReturnType<typeof buildDoc> }) {
  return (
    <>
      <style>{`
        .pv-page { width: ${doc.pageSize === "F4" ? 210 : 210}mm; min-height: ${doc.pageSize === "F4" ? 330 : 297}mm; background:#fff; color:#1a1c20; padding:14mm 15mm; box-sizing:border-box; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; position:relative;}
        .pv-page::after { content:""; display:none; }
      `}</style>
      <div className="pv-page">
        <ResumeDocument doc={{ ...doc, pageSize: doc.pageSize }} />
        <style>{resumeRuntimeCss()}</style>
      </div>
    </>
  );
}

function resumeRuntimeCss(): string {
  return `
.pv-page *{box-sizing:border-box;margin:0;padding:0;}
.pv-page .rt-doc{line-height:1.45;color:#1a1c20;background:#fff;}
.pv-page img.rt-photo{width:26mm;height:26mm;object-fit:cover;border-radius:50%;border:2px solid var(--accent);flex-shrink:0;}
.pv-page .rt-header{display:flex;align-items:center;gap:14pt;margin-bottom:12pt;}
.pv-page .rt-modern .rt-header{flex-direction:column;align-items:flex-start;gap:4pt;}
.pv-page .rt-name{font-size:2.05em;font-weight:700;letter-spacing:-0.5px;color:#111318;}
.pv-page .rt-modern .rt-name{color:var(--accent);}
.pv-page .rt-gold .rt-name{font-family:Georgia,"Times New Roman",serif;}
.pv-page .rt-tagline{margin-top:3pt;color:#555b66;font-size:.95em;}
.pv-page .rt-gold .rt-tagline{color:#7c6a33;}
.pv-page .rt-section{margin-top:11pt;}
.pv-page .rt-section h2{font-size:1.02em;text-transform:uppercase;letter-spacing:1.6px;color:var(--accent);border-bottom:1.4px solid var(--accent);padding-bottom:3pt;margin-bottom:7pt;}
.pv-page .rt-modern .rt-section h2{color:#17191f;border-bottom-color:#e2e4e8;}
.pv-page .rt-item{margin-bottom:8.5pt;}
.pv-page .rt-item-row{display:flex;justify-content:space-between;align-items:baseline;gap:8pt;}
.pv-page .rt-item-title{font-weight:700;font-size:1em;color:#17191f;}
.pv-page .rt-item-range{font-size:.82em;color:#6a7079;white-space:nowrap;}
.pv-page .rt-item-sub{margin-top:1pt;font-size:.88em;color:#4d525b;font-style:italic;}
.pv-page .rt-bullets{margin-top:3pt;padding-left:13pt;list-style:disc;}
.pv-page .rt-bullets li{margin-bottom:2.2pt;font-size:.92em;color:#2a2d33;}
.pv-page .rt-summary{font-size:.95em;color:#2a2d33;}
.pv-page .rt-skills{list-style:none;display:flex;flex-wrap:wrap;gap:4pt;}
.pv-page .rt-skills li{border:1px solid #d8dbe0;border-radius:999px;padding:1.6pt 7pt;font-size:.85em;color:#2a2d33;}
.pv-page .rt-tags{margin-top:2pt;font-size:.78em;color:#6a7079;}
`;
}

function ItemPicker({
  type,
  selected,
  master,
  onToggle,
}: {
  type: ResumeSectionType;
  selected: Set<string>;
  master: MasterData;
  onToggle: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const pools: Record<string, { id: string; label: string }[]> = {
    experience: master.experiences.map(
      (e) => ({
        id: e.id,
        label: `${e.title} · ${e.organization}`,
      }),
    ),
    education: master.educations.map(
      (e) => ({ id: e.id, label: e.institution }),
    ),
    skills: master.skills.map((s) => ({ id: s.id, label: s.name })),
    projects: master.works.map((w) => ({ id: w.id, label: w.title })),
    certifications: master.certifications.map((c) => ({ id: c.id, label: c.name })),
    summary: [],
  };

  const pool = pools[type] ?? [];
  if (!pool.length) return null;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.size === 0) {
      for (const item of pool) next.add(item.id);
      next.delete(id);
    } else if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onToggle([...next]);
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-muted hover:text-ivory"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {open ? "Hide items" : `Choose items (${selected.size || "all"})`}
      </button>
      {open ? (
        <ul className="mt-1.5 space-y-1">
          {pool.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ivory-dim">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="accent-[#D4AF37]"
                />
                <span className="truncate">{item.label}</span>
              </label>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="text-[11px] text-gold hover:underline"
              onClick={() => onToggle([])}
            >
              Reset selection (include all)
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function identityPathFor(type: ResumeSectionType): string {
  const map: Record<ResumeSectionType, string> = {
    summary: "",
    experience: "experience",
    education: "education",
    skills: "skills",
    projects: "work",
    certifications: "certifications",
  };
  return map[type];
}
