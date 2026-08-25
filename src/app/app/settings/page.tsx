import { requireCurrentProfile, getPlan } from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UpgradeButton } from "@/features/payments/upgrade-button";
import type { PaymentRow } from "@/types/database";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  const plan = user ? await getPlan(user.id) : "free";

  const [{ data: payments }, { data: identities }] = await Promise.all([
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.auth.getUserIdentities(),
  ]);

  const providers =
    (identities?.identities ?? []).map((i) => i.provider as string) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ivory">Settings</h1>
        <p className="mt-1 text-sm text-muted">Account, sign-in methods and billing.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-muted">Email</span>
            <span className="text-ivory">{user?.email}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Username</span>
            <span className="font-mono text-gold">{profile.username}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Sign-in methods</span>
            <span className="capitalize text-ivory">
              {[...new Set(["email", ...providers])].join(", ")}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            Plan
            <Badge variant={plan === "pro" ? "default" : "secondary"}>
              {plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan !== "pro" ? (
            <>
              <p className="text-sm text-muted">
                Pro unlocks premium CV templates, your personal website at
                username.portotional.com, analytics, unlimited CVs and advanced
                AI.
              </p>
              <UpgradeButton />
            </>
          ) : (
            <>
              {(await supabase.from("subscriptions").select("current_period_end").eq("user_id", user!.id).maybeSingle())
                .data?.current_period_end ? (
                <p className="text-sm text-muted">
                  Active until{" "}
                  {new Date(
                    String(
                      (
                        await supabase
                          .from("subscriptions")
                          .select("current_period_end")
                          .eq("user_id", user!.id)
                          .maybeSingle()
                      ).data?.current_period_end,
                    ),
                  ).toLocaleDateString()}
                  .
                </p>
              ) : null}
              <Button variant="secondary" asChild>
                <Link href="/pricing">Manage plan</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent payments</CardTitle>
        </CardHeader>
        <CardContent>
          {!payments?.length ? (
            <p className="text-sm text-muted">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {(payments as PaymentRow[]).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: p.currency,
                    }).format(Number(p.amount))}
                    <span className="ml-2 text-xs text-muted">
                      {new Date(p.created_at).toLocaleDateString()} · {p.provider}
                    </span>
                  </span>
                  <Badge variant={["settlement", "capture"].includes(p.status) ? "success" : "secondary"}>
                    {p.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted">
        Danger zone:{" "}
        <Link href="/app/settings#delete" className="underline hover:text-danger">
          delete account
        </Link>{" "}
        — contact support@portotional.com.
      </p>
    </div>
  );
}
