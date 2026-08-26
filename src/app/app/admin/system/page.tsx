import type { Metadata } from "next";
import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FeatureFlagRow } from "@/types/database";
import { FlagToggle } from "./flag-toggle";

export const metadata: Metadata = { title: "Admin · System" };

type Check = { name: string; status: "operational" | "degraded" | "down"; note: string };

async function runHealthChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const admin = getSupabaseAdminClient();

  // Database
  try {
    const started = Date.now();
    await admin.from("profiles").select("id", { count: "exact", head: true });
    const ms = Date.now() - started;
    checks.push({ name: "Database", status: ms < 2000 ? "operational" : "degraded", note: `${ms} ms` });
  } catch {
    checks.push({ name: "Database", status: "down", note: "unreachable" });
  }

  // AI providers
  const providers = [
    process.env.NARA_API_KEYS,
    process.env.CHINA_API_KEYS,
    process.env.GEMINI_API_KEY,
  ].filter(Boolean).length;
  checks.push({
    name: "AI gateway",
    status: providers > 0 ? "operational" : "down",
    note: `${providers} provider(s) configured`,
  });

  // Payments
  const midtransOk =
    Boolean(process.env.MIDTRANS_SERVER_KEY) &&
    Boolean(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
  checks.push({
    name: "Payments (Midtrans)",
    status: midtransOk ? "operational" : "down",
    note: midtransOk ? `production=${process.env.MIDTRANS_IS_PRODUCTION}` : "keys missing",
  });

  // Storage
  try {
    const { error } = await admin.storage.listBuckets();
    checks.push({
      name: "Storage",
      status: error ? "degraded" : "operational",
      note: error ? error.message : "buckets reachable",
    });
  } catch {
    checks.push({ name: "Storage", status: "down", note: "unreachable" });
  }

  return checks;
}

const TONE = {
  operational: "border-success/30 bg-success/15 text-success",
  degraded: "border-gold/30 bg-gold/10 text-gold",
  down: "border-danger/30 bg-danger/15 text-danger",
} as const;

export default async function AdminSystemPage() {
  const [checks, flagsRes] = await Promise.all([
    runHealthChecks(),
    getSupabaseAdminClient()
      .from("feature_flags")
      .select("*")
      .order("key"),
  ]);
  const flags = (flagsRes.data ?? []) as FeatureFlagRow[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">System Health</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {checks.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted" aria-hidden />
                <span className="text-sm font-medium text-ivory">{c.name}</span>
              </div>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted">{c.note}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE[c.status]}`}>
                  {c.status}
                </span>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {flags.map((f) => (
            <div
              key={f.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3"
            >
              <div>
                <p className="font-mono text-xs text-gold">{f.key}</p>
                <p className="mt-0.5 text-xs text-muted">{f.description}</p>
              </div>
              <FlagToggle flagKey={f.key} enabled={f.enabled} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
