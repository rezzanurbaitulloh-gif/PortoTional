"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Loader2,
  QrCode as QrIcon,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { Visibility } from "@/types/database";

const TOGGLES: {
  key: keyof Visibility;
  label: string;
  hint: string;
}[] = [
  {
    key: "profile",
    label: "Profile is public",
    hint: "Your public page at /u/username becomes visible to anyone with the link.",
  },
  {
    key: "search_indexing",
    label: "Search engine indexing",
    hint: "Allow Google and other engines to index your public profile.",
  },
  {
    key: "location",
    label: "Show location",
    hint: "Display your city/region on your public profile.",
  },
  {
    key: "talent_discovery",
    label: "Talent discovery (opt-in)",
    hint: "Future feature — appear in recruiter searches. Off by default.",
  },
];

export function ProfileVisibilityPanel({
  username,
  isPublic,
  visibility,
  publicUrl,
  resumeUrl,
  websiteUrl,
  qrCodes,
  hasPhoto,
}: {
  username: string;
  isPublic: boolean;
  visibility: Visibility;
  publicUrl: string;
  resumeUrl: string;
  websiteUrl: string;
  qrCodes: { profile: string; resume: string; website: string };
  hasPhoto: boolean;
}) {
  const [qrTarget, setQrTarget] = useState<"profile" | "resume" | "website">("profile");
  const [state, setState] = useState<Visibility>(visibility);
  const [busy, setBusy] = useState(false);

  async function toggle(key: keyof Visibility, value: boolean) {
    const next = { ...state, [key]: value };
    setState(next);
    setBusy(true);
    try {
      const { updateProfileVisibilityAction } = await import("@/actions/identity");
      const res = await updateProfileVisibilityAction({ [key]: value });
      if (!res.ok) throw new Error(res.error);
    } catch (err) {
      setState(state);
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">Public Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Decide exactly what the world sees. Private by default.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Your link</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Input readOnly value={publicUrl} className="font-mono text-xs" />
          <Button size="sm" variant="secondary" onClick={copyLink}>
            <Copy /> Copy
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Open
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(resumeUrl);
              toast.success("Resume link copied.");
            }}
          >
            <Copy /> Resume link
          </Button>
          {websiteUrl ? (
            <Button size="sm" variant="ghost" asChild>
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Website
              </a>
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              const shareUrl =
                typeof navigator.share !== "undefined"
                  ? undefined
                  : publicUrl;
              if (navigator.share && shareUrl === undefined) {
                try {
                  await navigator.share({ title: `${username} — PortoTional`, url: publicUrl });
                } catch {}
              } else {
                await navigator.clipboard.writeText(shareUrl ?? publicUrl);
                toast.success("Link copied.");
              }
            }}
          >
            <Share2 /> Share
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Privacy & visibility</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-ivory">{t.label}</p>
                <p className="mt-0.5 text-xs text-muted">{t.hint}</p>
              </div>
              <Switch
                checked={Boolean(state[t.key])}
                onCheckedChange={(v) => toggle(t.key, v)}
                disabled={busy}
                aria-label={t.label}
              />
            </div>
          ))}
          <div className="py-3">
            <p className={`text-xs ${isPublic ? "text-success" : "text-muted"}`}>
              {isPublic
                ? "Your profile is live."
                : "Your profile is private — only you can see it."}
              {!hasPhoto ? " Tip: a photo builds trust." : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <QrIcon className="h-4 w-4 text-gold" /> QR code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-5">
          <Tabs value={qrTarget} onValueChange={(v) => setQrTarget(v as typeof qrTarget)}>
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="website">Website</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={qrTarget}
            src={qrCodes[qrTarget]}
            alt={`QR code for ${username} ${qrTarget}`}
            className="h-40 w-40 rounded-lg border border-line bg-white p-1"
          />
          <div className="max-w-xs text-sm text-muted">
            Print it on your business card or CV. Scanning opens your{" "}
            {qrTarget === "profile" ? "public profile" : qrTarget === "resume" ? "resume PDF" : "personal website"} instantly.
          </div>
        </CardContent>
      </Card>

      {!isPublic ? (
        <p className="rounded-lg border border-gold/30 bg-gold/[0.04] px-4 py-3 text-sm text-ivory-dim">
          Want your website published too? Your public profile must be visible
          first —{" "}
          <Link href="/app/showcase/website" className="text-gold hover:underline">
            go to Website settings
          </Link>
          .{busy ? <Loader2 className="ml-2 inline h-3 w-3 animate-spin" /> : null}
        </p>
      ) : null}
    </div>
  );
}
