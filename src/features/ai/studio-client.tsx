"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileSearch,
  Languages,
  Loader2,
  MessageSquare,
  ScanLine,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Tool = "summary" | "refine" | "translate" | "analyze" | "career";

type ChatTurn = { role: "user" | "assistant"; content: string };

export function AiStudioClient({
  profile,
}: {
  profile: {
    fullName: string;
    headline: string;
    location: string;
    summaryLength: number;
  };
}) {
  const [tool, setTool] = useState<Tool>("summary");
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [resumeId, setResumeId] = useState("");
  const [resumes, setResumes] = useState<{ id: string; name: string }[]>([]);
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  async function loadResumes() {
    if (resumes.length) return true;
    try {
      const { listResumes } = await import("@/actions/cv");
      const rows = await listResumes();
      setResumes(rows.map((r) => ({ id: r.id, name: r.name })));
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  async function run(t: Tool) {
    setBusy(true);
    setResult("");
    try {
      let body: Record<string, unknown>;
      if (t === "summary") {
        body = {
          action: "summary",
          profile: {
            fullName: profile.fullName,
            headline: profile.headline,
            location: profile.location,
            note: "Generate a professional summary for this person",
          },
        };
      } else if (t === "refine") {
        if (!text.trim()) throw new Error("Paste the text you want improved.");
        body = { action: "refine", text, context: "professional profile content" };
      } else if (t === "translate") {
        if (!text.trim()) throw new Error("Paste the text you want translated.");
        body = { action: "translate", text, targetLanguage: targetLang };
      } else {
        const has = await loadResumes();
        if (!has || !resumeId) throw new Error("Create and select a CV first.");
        const snapshotMod = await import("@/actions/cv");
        const snapshot = await (
          snapshotMod as unknown as {
            buildResumeSnapshotClient?: never;
          }
        );
        void snapshot;
        body = { action: "analyze", snapshot: { resumeId } };
      }

      if (t === "analyze") {
        toast.info(
          "Open your CV in the builder and check the ATS tab for a full analysis.",
        );
        setBusy(false);
        return;
      }

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function sendChat() {
    const content = chatInput.trim();
    if (!content || chatBusy) return;
    const next: ChatTurn[] = [...chat, { role: "user", content }];
    setChat(next);
    setChatInput("");
    setChatBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "career", messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChat([...next, { role: "assistant", content: data.text }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assistant unavailable.");
      setChat(chat);
    } finally {
      setChatBusy(false);
    }
  }

  const tools: {
    key: Tool;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      key: "summary",
      label: "Improve my summary",
      icon: <Sparkles className="h-4 w-4" />,
      description:
        "Generates a professional summary strictly from facts already in your identity.",
    },
    {
      key: "refine",
      label: "Improve experience",
      icon: <Wand2 className="h-4 w-4" />,
      description:
        "Rewrites any text professionally — grammar, tone, structure. No invented facts.",
    },
    {
      key: "analyze",
      label: "Analyze CV",
      icon: <ScanLine className="h-4 w-4" />,
      description:
        "ATS-style analysis of clarity, completeness and consistency in the CV builder.",
    },
    {
      key: "translate",
      label: "Translate",
      icon: <Languages className="h-4 w-4" />,
      description: "Translate professional content faithfully between languages.",
    },
    {
      key: "career",
      label: "Career Assistant",
      icon: <MessageSquare className="h-4 w-4" />,
      description:
        "Chat about setup, writing and career preparation. It asks for details instead of inventing them.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">AI Studio</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted">
          <Target className="h-3.5 w-3.5 text-gold" />
          AI assists — it never invents companies, roles, numbers or
          achievements.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTool(t.key)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              tool === t.key
                ? "border-gold bg-gold/5"
                : "border-line bg-surface hover:border-line-strong"
            }`}
          >
            <span className="flex items-center gap-2 font-medium text-ivory">
              {t.icon}
              {t.label}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted">
              {t.description}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {tools.find((t) => t.key === tool)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tool === "career" ? (
            <div className="space-y-3">
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-line bg-obsidian-raised p-3">
                {chat.length === 0 ? (
                  <p className="text-xs text-muted">
                    Ask anything about your career prep — e.g. “How do I
                    describe a career gap honestly?” or “Help me prepare for a
                    product manager interview.”
                  </p>
                ) : (
                  chat.map((m, i) => (
                    <div
                      key={i}
                      className={`rounded-md px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "ml-8 bg-gold/10 text-ivory"
                          : "mr-8 bg-surface text-ivory-dim"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))
                )}
                {chatBusy ? (
                  <div className="mr-8 flex items-center gap-2 px-1 py-1 text-xs text-muted">
                    <Loader2 className="h-3 w-3 animate-spin" /> thinking…
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder="Type your question…"
                  aria-label="Message the career assistant"
                  disabled={chatBusy}
                />
                <Button onClick={sendChat} disabled={chatBusy || !chatInput.trim()}>
                  {chatBusy ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <MessageSquare />
                  )}
                  Send
                </Button>
              </div>
            </div>
          ) : null}

          {tool !== "career" && (tool === "refine" || tool === "translate") ? (
            <>
              <div>
                <Label htmlFor="ai-text">Your text</Label>
                <Textarea
                  id="ai-text"
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    tool === "refine"
                      ? "e.g. saya membuat desain poster untuk event kampus"
                      : "Paste the text to translate…"
                  }
                  className="mt-1.5"
                />
              </div>
              {tool === "translate" ? (
                <div>
                  <Label htmlFor="ai-lang">Translate to</Label>
                  <Input
                    id="ai-lang"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="mt-1.5 max-w-xs"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {tool === "analyze" ? (
            <div>
              <Label htmlFor="ai-resume">Choose CV</Label>
              <select
                id="ai-resume"
                value={resumeId}
                onChange={async (e) => {
                  setResumeId(e.target.value);
                  if (!resumes.length) await loadResumes();
                }}
                onFocus={loadResumes}
                className="mt-1.5 h-10 w-full rounded-md border border-line bg-obsidian-raised px-3 text-sm"
              >
                <option value="">Select…</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <Link
                href="/app/cv"
                className="mt-2 inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                <FileSearch className="h-3 w-3" /> Manage CVs
              </Link>
            </div>
          ) : null}

          {tool !== "career" ? (
            <Button onClick={() => run(tool)} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Run AI
            </Button>
          ) : null}

          {result ? (
            <div className="rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
              <Badge variant="default">AI result</Badge>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ivory-dim">
                {result}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied to clipboard.");
                  }}
                >
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setResult("")}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
