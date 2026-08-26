import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/services/identity";
import { formatIDR } from "@/lib/billing";
import { VerifyButtons } from "./verify-buttons";

export const metadata = { title: "Admin · User Detail" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminProfile = await requirePermission("users.read");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const admin = getSupabaseAdminClient();
  const userRes = await admin.auth.admin.getUserById(id);
  const user = userRes.data?.user;
  if (!user) notFound();

  const [profRes, resumesRes, showcasesRes, websiteRes, paymentsRes, aiRes, auditRes] =
    await Promise.all([
      admin.from("profiles").select("*").eq("user_id", id).maybeSingle(),
      admin.from("resumes").select("id,name,page_size,status").eq("profile_id", (await admin.from("profiles").select("id").eq("user_id", id).maybeSingle()).data?.id ?? ""),
      admin.from("showcases").select("id,title,type,visibility,featured").eq("profile_id", (await admin.from("profiles").select("id").eq("user_id", id).maybeSingle()).data?.id ?? ""),
      admin.from("websites").select("subdomain,published").eq("profile_id", (await admin.from("profiles").select("id").eq("user_id", id).maybeSingle()).data?.id ?? "").maybeSingle(),
      admin.from("payments").select("amount,metadata,status,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
      admin.from("ai_generations").select("type,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
      admin.from("audit_logs").select("*").or(`actor_user_id.eq.${id},entity_id.eq.${id}`).order("created_at", { ascending: false }).limit(15),
    ]);

  const profile = profRes.data as
    | (Record<string, unknown> & { username: string; role: string })
    | null;
  if (!profile) notFound();

  const paidTotal = (paymentsRes.data ?? []).reduce(
    (sum: number, p) =>
      sum +
      ((p.status === "settlement" || p.status === "capture")
        ? Number((p.metadata as Record<string, unknown>)?.gross_amount ?? p.amount)
        : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/app/admin/users" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ivory">
          <ArrowLeft className="h-3 w-3" /> Users
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={user.banned_until ? "danger" : "success"}>
            {user.banned_until ? "Suspended" : "Active"}
          </Badge>
          <Badge variant={profile.role === "USER" ? "secondary" : "default"}>
            {profile.role}
          </Badge>
        </div>
      </div>

      {/* §11 Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
          <Info label="Email" value={user.email ?? "—"} />
          <Info label="Username" value={`@${profile.username}`} />
          <Info label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
          <Info label="Last sign-in" value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "never"} />
          <Info label="CVs" value={String(resumesRes.data?.length ?? 0)} />
          <Info label="Showcases" value={String(showcasesRes.data?.length ?? 0)} />
          <Info
            label="Website"
            value={websiteRes.data ? `${websiteRes.data.published ? "published" : "draft"} · ${websiteRes.data.subdomain}` : "none"}
          />
          <Info label="Lifetime revenue" value={formatIDR(paidTotal)} />
          <Info label="AI generations" value={String(aiRes.data?.length ?? 0)} />
        </CardContent>
      </Card>

      {/* Identity + verification (§16) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-gold" /> Identity &amp; Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3">
            <div>
              <p className="font-medium text-ivory">
                Status:{" "}
                {String(profile.verification_status ?? "unverified")}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Verified badges are shown publicly; documents are never stored.
              </p>
            </div>
            {adminProfile.role === "SUPER_ADMIN" ||
            adminProfile.role === "ADMIN" ? (
              <VerifyButtons userId={id} current={String(profile.verification_status ?? "unverified")} />
            ) : null}
          </div>
          <Info label="Headline" value={String(profile.headline || "—")} />
          <Info label="Location" value={String(profile.location || "—")} />
        </CardContent>
      </Card>

      {/* CVs */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">CVs</CardTitle></CardHeader>
        <CardContent>
          {(resumesRes.data ?? []).length === 0 ? (
            <p className="text-xs text-muted">No CVs.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {(resumesRes.data ?? []).map((r) => (
                <li key={r.id} className="flex justify-between rounded-md bg-surface-2 px-3 py-1.5">
                  <span>{r.name}</span>
                  <span className="text-xs text-muted">{r.page_size} · {r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Showcase */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Showcase</CardTitle></CardHeader>
        <CardContent>
          {(showcasesRes.data ?? []).length === 0 ? (
            <p className="text-xs text-muted">No showcases.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {(showcasesRes.data ?? []).map((sc) => (
                <li key={sc.id} className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-1.5">
                  <span>{sc.title}</span>
                  <span className="text-xs text-muted">
                    {sc.type} · {sc.visibility}{sc.featured ? " · ★" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Billing</CardTitle></CardHeader>
        <CardContent>
          {(paymentsRes.data ?? []).length === 0 ? (
            <p className="text-xs text-muted">No transactions.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {(paymentsRes.data ?? []).map((p, i) => (
                <li key={i} className="flex justify-between rounded-md bg-surface-2 px-3 py-1.5">
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  <span className="text-xs text-muted">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Activity / Security */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {(auditRes.data ?? []).length === 0 ? (
            <p className="text-xs text-muted">No audit entries.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {(auditRes.data ?? []).map((a) => (
                <li key={a.id} className="flex flex-wrap gap-2 rounded-md bg-surface-2 px-3 py-1.5 text-xs">
                  <span className="font-mono text-muted">{new Date(a.created_at).toLocaleDateString()}</span>
                  <span className="font-medium text-gold">{a.action}</span>
                  {a.reason ? <span className="truncate text-muted">— {a.reason}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <BadgeCheck className="h-3 w-3" /> All actions on this user are recorded in audit logs.
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-0.5 break-all font-medium text-ivory">{value}</p>
    </div>
  );
}
