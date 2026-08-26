"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  Code,
  Briefcase,
  FileText,
  Loader2,
  Palette,
  PartyPopper,
  Plus,
  Rocket,
  Sparkles,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { ShowcaseRow, ShowcaseType } from "@/types/database";

const TYPE_ICON: Record<ShowcaseType, React.ReactNode> = {
  project: <Rocket className="h-4 w-4" />,
  activity: <PartyPopper className="h-4 w-4" />,
  achievement: <Award className="h-4 w-4" />,
  certification: <FileText className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  event: <Sparkles className="h-4 w-4" />,
  design: <Palette className="h-4 w-4" />,
  publication: <FileText className="h-4 w-4" />,
  custom: <Wrench className="h-4 w-4" />,
};

const EMPTY_FORM = {
  type: "project" as ShowcaseType,
  title: "",
  short_description: "",
  full_description: "",
  cover_url: "",
  video_url: "",
  start_date: "",
  end_date: "",
  role: "",
  organization: "",
  collaborators: "",
  skills: "",
  tags: "",
  category: "",
  github_url: "",
  demo_url: "",
  results_impact: "",
  caseStudyOpen: false,
  cs_problem: "",
  cs_goals: "",
  cs_process: "",
  cs_solution: "",
  cs_features: "",
  cs_lessons: "",
  visibility: "public" as ShowcaseRow["visibility"],
  show_on_profile: true,
  show_on_website: true,
  featured: false,
};

type FormState = typeof EMPTY_FORM;

function toForm(s: ShowcaseRow): FormState {
  return {
    type: s.type,
    title: s.title,
    short_description: s.short_description,
    full_description: s.full_description,
    cover_url: s.cover_url ?? "",
    video_url: s.video_url ?? "",
    start_date: s.start_date ?? "",
    end_date: s.end_date ?? "",
    role: s.role,
    organization: s.organization,
    collaborators: s.collaborators.join(", "),
    skills: s.skills.join(", "),
    tags: s.tags.join(", "),
    category: s.category,
    github_url: s.github_url ?? "",
    demo_url: s.demo_url ?? "",
    results_impact: s.results_impact,
    caseStudyOpen: Boolean(s.case_study),
    cs_problem: s.case_study?.problem ?? "",
    cs_goals: s.case_study?.goals ?? "",
    cs_process: s.case_study?.process ?? "",
    cs_solution: s.case_study?.solution ?? "",
    cs_features: s.case_study?.features ?? "",
    cs_lessons: s.case_study?.lessons ?? "",
    visibility: s.visibility,
    show_on_profile: s.show_on_profile,
    show_on_website: s.show_on_website,
    featured: s.featured,
  };
}

function toPayload(f: FormState) {
  const urlOrNull = (v: string) => (v.trim() ? v.trim() : null);
  return {
    type: f.type,
    title: f.title.trim(),
    short_description: f.short_description.trim(),
    full_description: f.full_description.trim(),
    cover_url: urlOrNull(f.cover_url),
    video_url: urlOrNull(f.video_url),
    start_date: f.start_date || null,
    end_date: f.end_date || null,
    role: f.role.trim(),
    organization: f.organization.trim(),
    collaborators: f.collaborators.split(",").map((s) => s.trim()).filter(Boolean),
    skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
    tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean),
    category: f.category.trim(),
    github_url: urlOrNull(f.github_url),
    demo_url: urlOrNull(f.demo_url),
    links: [],
    results_impact: f.results_impact.trim(),
    case_study: f.caseStudyOpen
      ? {
          problem: f.cs_problem,
          goals: f.cs_goals,
          process: f.cs_process,
          solution: f.cs_solution,
          features: f.cs_features,
          lessons: f.cs_lessons,
        }
      : null,
    visibility: f.visibility,
    show_on_profile: f.show_on_profile,
    show_on_website: f.show_on_website,
    featured: f.featured,
  };
}

export function ShowcaseManager({
  initial,
  username,
  plan,
}: {
  initial: ShowcaseRow[];
  username: string;
  plan: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<ShowcaseRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = creating || editing !== null;
  const limit = plan === "pro" ? 100 : 5;

  async function remove(id: string) {
    if (!window.confirm("Delete this showcase permanently?")) return;
    try {
      const { deleteShowcaseAction } = await import("@/actions/showcase");
      const res = await deleteShowcaseAction(id);
      if (!res.ok) throw new Error(res.error);
      setItems((arr) => arr.filter((x) => x.id !== id));
      toast.success("Showcase deleted.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function save(state: FormState) {
    setBusy(true);
    try {
      const mod = await import("@/actions/showcase");
      if (editing) {
        const res = await mod.updateShowcaseAction(editing.id, toPayload(state));
        if (!res.ok) throw new Error(res.error);
        setItems((arr) =>
          arr.map((x) =>
            x.id === editing.id ? { ...x, ...toPayload(state) } as ShowcaseRow : x,
          ),
        );
        toast.success("Showcase updated.");
      } else {
        const res = await mod.createShowcaseAction(toPayload(state));
        if (!res.ok || !res.id) throw new Error(res.error);
        const refreshed = await mod.listShowcases();
        setItems(refreshed);
        toast.success("Showcase created.");
      }
      setEditing(null);
      setCreating(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const featuredCount = useMemo(() => items.filter((i) => i.featured).length, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ivory">Showcase</h1>
          <p className="mt-1 text-sm text-muted">
            Document real work — projects, activities, achievements. Featured
            items appear first on your public profile and website.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={items.length >= limit}>
          <Plus /> New showcase
        </Button>
      </div>

      {items.length >= limit ? (
        <p className="text-xs text-muted" role="status">
          {plan === "pro"
            ? `${items.length}/${limit} used.`
            : `Free plan limit reached (${limit}). Upgrade to Pro for up to 100.`}
        </p>
      ) : null}
      {featuredCount > 3 ? (
        <p className="text-xs text-gold" role="status">
          Tip: more than 3 featured items dilute the “Featured Work” section.
        </p>
      ) : null}

      {items.length === 0 && !open ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Rocket className="mx-auto h-10 w-10 text-gold" aria-hidden />
            <p className="mt-4 text-sm font-medium text-ivory">
              No showcases yet.
            </p>
            <p className="mt-1 text-xs text-muted">
              Show what you have done — a shipped project, an event you ran, a
              design you made.
            </p>
            <Button className="mt-4" onClick={() => setCreating(true)}>
              <Plus /> Create your first showcase
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((s) => (
            <li key={s.id}>
              <Card className="h-full">
                <CardContent className="p-0">
                  {s.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.cover_url}
                      alt=""
                      className="h-32 w-full rounded-t-xl border-b border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-t-xl border-b border-line bg-surface-2 text-muted">
                      {TYPE_ICON[s.type] ?? <Wrench />}
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ivory">
                          {s.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {s.short_description || s.role || s.organization}
                        </p>
                      </div>
                      {s.featured ? (
                        <Star className="h-4 w-4 shrink-0 fill-gold text-gold" aria-label="Featured" />
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{s.type}</Badge>
                      <Badge
                        variant={s.visibility === "public" ? "success" : "outline"}
                      >
                        {s.visibility}
                      </Badge>
                      {s.skills.slice(0, 2).map((sk) => (
                        <span key={sk} className="text-[11px] text-muted">
                          · {sk}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                        <Trash2 /> Delete
                      </Button>
                      {s.visibility === "public" ? (
                        <a
                          href={`/u/${username}#showcase-${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto self-center text-xs text-gold hover:underline"
                        >
                          View public →
                        </a>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit — ${editing.title}` : "New showcase"}
            </DialogTitle>
          </DialogHeader>
          <ShowcaseForm
            initial={editing ? toForm(editing) : EMPTY_FORM}
            isEdit={editing !== null}
            busy={busy}
            onSave={save}
            onCancel={() => { setCreating(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShowcaseForm({
  initial,
  isEdit,
  busy,
  onSave,
  onCancel,
}: {
  initial: FormState;
  isEdit: boolean;
  busy: boolean;
  onSave: (f: FormState) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(initial);
  const [aiBusy, setAiBusy] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  // §12 — AI assists writing; facts come only from what the user typed.
  async function runAi(kind: "description" | "case_study") {
    if (!f.title.trim()) {
      toast.error("Add a title first so the AI knows the subject.");
      return;
    }
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "description"
            ? {
                action: "project_description",
                title: f.title,
                type: f.type,
                rawNotes: [
                  f.full_description,
                  f.role && `role: ${f.role}`,
                  f.organization && `organization: ${f.organization}`,
                  f.results_impact && `results: ${f.results_impact}`,
                ]
                  .filter(Boolean)
                  .join("\n"),
              }
            : {
                action: "case_study",
                showcase: {
                  title: f.title,
                  shortDescription: f.short_description,
                  fullDescription: f.full_description,
                  role: f.role,
                  organization: f.organization,
                  resultsImpact: f.results_impact,
                },
              },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const parsed =
        typeof data.text === "string" ? JSON.parse(data.text) : data.text;
      if (kind === "description") {
        setF((prev) => ({
          ...prev,
          short_description: parsed.shortDescription ?? prev.short_description,
          full_description: parsed.fullDescription ?? prev.full_description,
          results_impact:
            parsed.resultsImpact || prev.results_impact,
        }));
      } else {
        set("caseStudyOpen", true);
        setF((prev) => ({
          ...prev,
          cs_problem: parsed.problem ?? "",
          cs_goals: parsed.goals ?? "",
          cs_process: parsed.process ?? "",
          cs_solution: parsed.solution ?? "",
          cs_features: parsed.features ?? "",
          cs_lessons: parsed.lessons ?? "",
        }));
      }
      toast.success("AI draft applied — review before saving.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f);
      }}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <Label htmlFor="sc-type">Type</Label>
          <Select value={f.type} onValueChange={(v) => set("type", v as ShowcaseType)}>
            <SelectTrigger id="sc-type" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_ICON) as ShowcaseType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sc-title">Title *</Label>
          <Input
            id="sc-title"
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            required
            minLength={2}
            maxLength={120}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sc-short">Short description</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={aiBusy}
            onClick={() => runAi("description")}
          >
            {aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI write
          </Button>
        </div>
        <Input
          id="sc-short"
          value={f.short_description}
          onChange={(e) => set("short_description", e.target.value)}
          maxLength={300}
          placeholder="One line that sells it"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="sc-full">Full description</Label>
        <Textarea
          id="sc-full"
          rows={4}
          value={f.full_description}
          onChange={(e) => set("full_description", e.target.value)}
          maxLength={8000}
          className="mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-cover">Cover image URL</Label>
          <Input
            id="sc-cover"
            type="url"
            value={f.cover_url}
            onChange={(e) => set("cover_url", e.target.value)}
            placeholder="https://…"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="sc-video">Video URL (optional)</Label>
          <Input
            id="sc-video"
            type="url"
            value={f.video_url}
            onChange={(e) => set("video_url", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-role">Your role</Label>
          <Input id="sc-role" value={f.role} onChange={(e) => set("role", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sc-org">Organization</Label>
          <Input id="sc-org" value={f.organization} onChange={(e) => set("organization", e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-start">Start date</Label>
          <Input id="sc-start" type="date" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sc-end">End date</Label>
          <Input id="sc-end" type="date" value={f.end_date} onChange={(e) => set("end_date", e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="sc-skills">Skills (comma-separated)</Label>
          <Input id="sc-skills" value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Figma, Research" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sc-tags">Tags</Label>
          <Input id="sc-tags" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="fintech, mobile" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sc-collab">Collaborators</Label>
          <Input id="sc-collab" value={f.collaborators} onChange={(e) => set("collaborators", e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sc-github" className="items-center gap-1.5">
            <Code className="inline h-3.5 w-3.5" /> GitHub URL
          </Label>
          <Input id="sc-github" type="url" value={f.github_url} onChange={(e) => set("github_url", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sc-demo">Live demo URL</Label>
          <Input id="sc-demo" type="url" value={f.demo_url} onChange={(e) => set("demo_url", e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label htmlFor="sc-results">Results / impact</Label>
        <Textarea
          id="sc-results"
          rows={2}
          value={f.results_impact}
          onChange={(e) => set("results_impact", e.target.value)}
          maxLength={2000}
          placeholder="What changed because of this work?"
          className="mt-1.5"
        />
      </div>

      <div className="rounded-lg border border-line p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sc-cs" className="text-sm font-medium text-ivory">
            Case study mode
          </Label>
          <div className="flex items-center gap-2">
            {f.caseStudyOpen ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={aiBusy}
                onClick={() => runAi("case_study")}
              >
                {aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI structure
              </Button>
            ) : null}
            <Switch
              id="sc-cs"
              checked={f.caseStudyOpen}
              onCheckedChange={(v) => set("caseStudyOpen", v)}
            />
          </div>
        </div>
        {f.caseStudyOpen ? (
          <div className="mt-3 grid gap-3">
            {(
              [
                ["cs_problem", "Problem"],
                ["cs_goals", "Goals"],
                ["cs_process", "Process"],
                ["cs_solution", "Solution"],
                ["cs_features", "Key features"],
                ["cs_lessons", "Lessons learned"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`sc-${key}`}>{label}</Label>
                <Textarea
                  id={`sc-${key}`}
                  rows={2}
                  value={f[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-xs uppercase tracking-widest text-muted">
          Visibility
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="sc-vis">Who can see this</Label>
            <Select value={f.visibility} onValueChange={(v) => set("visibility", v as FormState["visibility"])}>
              <SelectTrigger id="sc-vis" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted (link only)</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between text-sm">
              Show on profile
              <Switch checked={f.show_on_profile} onCheckedChange={(v) => set("show_on_profile", v)} aria-label="Show on profile" />
            </label>
            <label className="flex items-center justify-between text-sm">
              Show on website
              <Switch checked={f.show_on_website} onCheckedChange={(v) => set("show_on_website", v)} aria-label="Show on website" />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-gold" /> Featured
              </span>
              <Switch checked={f.featured} onCheckedChange={(v) => set("featured", v)} aria-label="Featured" />
            </label>
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create showcase"}
        </Button>
      </div>
    </form>
  );
}
