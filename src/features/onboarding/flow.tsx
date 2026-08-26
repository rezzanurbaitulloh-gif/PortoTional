"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  FileUp,
  Loader2,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { appUrl } from "@/lib/app-url";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { slugifyUsername } from "@/lib/utils";

interface ProfessionOption {
  id: string;
  slug: string;
  name: string;
  description: string;
  recommendedSections: string[];
}

interface DetectedData {
  fullName: string;
  headline: string;
  summary: string;
  location: string;
  experiences: {
    organization: string;
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
  }[];
  educations: {
    institution: string;
    degree: string;
    field: string;
    startDate: string | null;
    endDate: string | null;
  }[];
  skills: string[];
  certifications: { name: string; issuer: string; issueDate: string | null }[];
}

export function OnboardingFlow({
  professions,
  currentUsername,
  fullName: initialFullName,
}: {
  professions: ProfessionOption[];
  currentUsername: string;
  fullName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [username, setUsername] = useState(currentUsername);
  const [fullName, setFullName] = useState(initialFullName);
  const [headline, setHeadline] = useState("");
  const [mode, setMode] = useState<"scratch" | "import" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [detected, setDetected] = useState<DetectedData | null>(null);
  const [finishing, setFinishing] = useState(false);

  const profession = useMemo(
    () => professions.find((p) => p.id === professionId) ?? null,
    [professions, professionId],
  );

  async function checkAndContinue() {
    if (!profession) return;
    setFinishing(true);
    try {
      const res = await fetch(
        `/api/username-available?username=${encodeURIComponent(username)}`,
      );
      const data = await res.json();
      if (!data.available) {
        toast.error("That username is taken. Try another.");
        setFinishing(false);
        return;
      }
      const { completeOnboardingAction } = await import("@/actions/identity");
      const result = await completeOnboardingAction({
        username,
        profession_id: profession.id,
        full_name: fullName || detected?.fullName || "",
        headline: headline || detected?.headline || "",
      });
      if (!result.ok) throw new Error(result.error);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed.");
    } finally {
      setFinishing(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetected(data.detected as DetectedData);
      if ((data.detected as DetectedData).fullName && !fullName) {
        setFullName((data.detected as DetectedData).fullName);
      }
      if ((data.detected as DetectedData).headline && !headline) {
        setHeadline((data.detected as DetectedData).headline);
      }
      toast.success("CV analyzed — review the details below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setUploading(false);
    }
  }

  async function saveDetectedToIdentity(d: DetectedData) {
    const { saveContentItemAction } = await import("@/actions/identity");
    let errors = 0;

    for (const exp of d.experiences.slice(0, 15)) {
      const res = await saveContentItemAction("experiences", null, {
        organization: exp.organization,
        title: exp.title,
        description: exp.description,
        start_date: exp.startDate?.slice(0, 10) ?? null,
        end_date: exp.isCurrent ? null : (exp.endDate?.slice(0, 10) ?? null),
        is_current: Boolean(exp.isCurrent),
        location: "",
      });
      if (!res.ok) errors++;
    }
    for (const ed of d.educations.slice(0, 10)) {
      const res = await saveContentItemAction("educations", null, {
        institution: ed.institution,
        degree: ed.degree,
        field: ed.field,
        description: "",
        start_date: ed.startDate?.slice(0, 10) ?? null,
        end_date: ed.endDate?.slice(0, 10) ?? null,
      });
      if (!res.ok) errors++;
    }
    for (const skill of d.skills.slice(0, 25)) {
      if (!skill.trim()) continue;
      const res = await saveContentItemAction("skills", null, {
        name: skill.trim(),
        category: "",
        proficiency_label: "",
      });
      if (!res.ok) errors++;
    }
    for (const cert of d.certifications.slice(0, 12)) {
      const res = await saveContentItemAction("certifications", null, {
        name: cert.name,
        issuer: cert.issuer,
        credential_id: "",
        credential_url: null,
        issue_date: cert.issueDate?.slice(0, 10) ?? null,
        expiry_date: null,
      });
      if (!res.ok) errors++;
    }

    if (errors > 0) {
      toast.warning(`Saved with ${errors} item(s) skipped — you can edit them in Identity.`);
    }
  }

  async function finish() {
    setFinishing(true);
    try {
      if (detected) await saveDetectedToIdentity(detected);
      router.push("/app/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong while saving your import.");
      setFinishing(false);
    }
  }

  const steps = ["Profession", "Identity basics", "Content", "Done"];

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <ol className="mb-8 flex items-center justify-center gap-1.5" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? "bg-gold text-obsidian"
                  : i === step
                    ? "border border-gold text-gold"
                    : "border border-line text-muted"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={`text-xs ${i === step ? "text-ivory" : "text-muted"} hidden sm:inline`}>
              {s}
            </span>
            {i < steps.length - 1 ? (
              <span className="mx-1 h-px w-4 bg-line" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>What do you do?</CardTitle>
            <p className="text-sm text-muted">
              PortoTional adapts to any profession — this shapes your recommended
              sections.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {professions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfessionId(p.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    professionId === p.id
                      ? "border-gold bg-gold/5"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <span className="block text-sm font-medium text-ivory">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-muted line-clamp-1">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={!professionId || finishing}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your identity basics</CardTitle>
            <p className="text-sm text-muted">
              Pick your public username — it becomes your profile link.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ob-fullname">Full name</Label>
              <Input
                id="ob-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ob-headline">Professional headline</Label>
              <Input
                id="ob-headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={`e.g. ${profession?.name ?? "Professional"} · what makes you, you`}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ob-username">Public username</Label>
              <div className="mt-1.5 flex items-center gap-0">
                <span className="rounded-l-md border border-r-0 border-line bg-surface-2 px-3 py-2 font-mono text-xs text-muted">
                  {appUrl().replace(/^https?:\/\//, "")}/u/
                </span>
                <Input
                  id="ob-username"
                  value={username}
                  onChange={(e) => setUsername(slugifyUsername(e.target.value))}
                  className="rounded-l-none font-mono"
                  maxLength={38}
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                <ShieldCheck className="h-3 w-3 text-success" />
                Lowercase letters, numbers and dashes. Changeable later via support.
              </p>
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={finishing}>
              Continue <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Fill your content</CardTitle>
            <p className="text-sm text-muted">
              Import an existing CV and let AI structure it — everything is
              reviewed by you before saving. Or start fresh.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mode ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("import")}
                  className="card-lift rounded-xl border border-line bg-surface p-5 text-left hover:border-line-strong"
                >
                  <FileUp className="h-5 w-5 text-gold" />
                  <p className="mt-2 font-medium text-ivory">Import existing CV</p>
                  <p className="mt-1 text-xs text-muted">PDF or DOCX · AI structures it</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("scratch");
                    void checkAndContinue();
                  }}
                  className="card-lift rounded-xl border border-line bg-surface p-5 text-left hover:border-line-strong"
                >
                  <PenLine className="h-5 w-5 text-gold" />
                  <p className="mt-2 font-medium text-ivory">Start from scratch</p>
                  <p className="mt-1 text-xs text-muted">Add content anytime</p>
                </button>
              </div>
            ) : null}

            {mode === "import" ? (
              <div className="space-y-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center transition-colors hover:bg-white/[0.02]">
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                      e.target.value = "";
                    }}
                  />
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-gold" />
                      <p className="mt-2 text-sm text-muted">
                        Reading & structuring your CV…
                      </p>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-6 w-6 text-gold" />
                      <p className="mt-2 text-sm font-medium text-ivory">
                        Click to upload your CV
                      </p>
                      <p className="mt-0.5 text-xs text-muted">PDF or DOCX · up to 20 MB</p>
                    </>
                  )}
                </label>

                {detected ? (
                  <ReviewDetected detected={detected} onChange={setDetected} />
                ) : null}

                <div className="flex gap-2">
                  {detected ? (
                    <>
                      <Button className="flex-1" onClick={finish} disabled={finishing}>
                        {finishing ? <Loader2 className="animate-spin" /> : <Check />}
                        Review looks good — finish setup
                      </Button>
                      <Button variant="ghost" onClick={() => setDetected(null)}>
                        Discard
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" onClick={() => void checkAndContinue()} disabled={finishing}>
                      Skip import for now <ArrowRight />
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

            {mode !== "import" ? (
              <p className="text-center text-sm text-muted">
                Finishing setup…
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="success">Ready</Badge> Identity created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted">
              Welcome to PortoTional{fullName ? `, ${fullName.split(" ")[0]}` : ""}. Your
              Master Professional Identity is live — now generate your first CV.
            </p>
            <Button className="w-full" onClick={finish} disabled={finishing}>
              Go to dashboard <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ReviewDetected({
  detected,
  onChange,
}: {
  detected: DetectedData;
  onChange: (d: DetectedData) => void;
}) {
  const total =
    detected.experiences.length +
    detected.educations.length +
    detected.skills.length +
    detected.certifications.length;

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/[0.03] p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-gold">
        <ShieldCheck className="h-4 w-4" /> AI detected {total} item(s) — please verify
      </p>
      <p className="mt-1 text-xs text-muted">
        Nothing is saved until you confirm. Edit anything that looks wrong.
      </p>

      <div className="mt-3 space-y-3">
        <LabeledInput
          label="Full name"
          value={detected.fullName}
          onChange={(v) => onChange({ ...detected, fullName: v })}
        />
        <LabeledInput
          label="Headline"
          value={detected.headline}
          onChange={(v) => onChange({ ...detected, headline: v })}
        />

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Experience ({detected.experiences.length})
          </p>
          {detected.experiences.map((exp, i) => (
            <div key={i} className="mb-2 rounded-lg border border-line p-2.5">
              <LabeledInput
                label="Title @ Organization"
                value={`${exp.title} @ ${exp.organization}`}
                onChange={(v) => {
                  const [title, ...rest] = v.split(" @ ");
                  const experiences = [...detected.experiences];
                  experiences[i] = { ...exp, title, organization: rest.join(" @ ") };
                  onChange({ ...detected, experiences });
                }}
              />
              <Textarea
                rows={2}
                value={exp.description}
                onChange={(e) => {
                  const experiences = [...detected.experiences];
                  experiences[i] = { ...exp, description: e.target.value };
                  onChange({ ...detected, experiences });
                }}
                className="mt-1.5 text-xs"
              />
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Skills ({detected.skills.length})
          </p>
          <LabeledInput
            label="Comma-separated"
            value={detected.skills.join(", ")}
            onChange={(v) =>
              onChange({
                ...detected,
                skills: v.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-[11px]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 h-8 text-sm" />
    </div>
  );
}
