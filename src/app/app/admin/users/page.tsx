import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SuspendButton } from "./suspend-button";
import { EntitlementButtons } from "./entitlement-buttons";

export const metadata: Metadata = { title: "Admin · Users" };

type AdminUserRow = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(1, Math.min(50, Number(sp.page ?? "1") || 1));
  const perPage = 20;

  const admin = getSupabaseAdminClient();
  const { data } = await admin.auth.admin.listUsers({
    page,
    perPage,
  });
  let users = (data?.users ?? []) as unknown as AdminUserRow[];

  const planRes = await admin
    .from("subscriptions")
    .select("user_id, plan, status")
    .in("user_id", [
      ...new Set(
        ((data?.users ?? []) as unknown as AdminUserRow[]).map((u) => u.id),
      ),
    ].length
      ? [...new Set(((data?.users ?? []) as unknown as AdminUserRow[]).map((u) => u.id))]
      : ["00000000-0000-0000-0000-000000000000"]);
  const proUsers = new Set(
    (planRes.data ?? [])
      .filter((x: { plan: string; status: string }) => x.plan === "pro" && x.status === "active")
      .map((x: { user_id: string }) => x.user_id),
  );

  if (q) {
    const needle = q.toLowerCase();
    users = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(needle) ||
        u.id.toLowerCase().includes(needle),
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-sm">
          Users
          <form action="/app/admin/users" method="get" className="flex gap-2">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search email or ID…"
              className="h-8 w-56 text-xs"
              aria-label="Search users"
            />
            <Button size="sm" variant="outline" type="submit">
              <Search /> Search
            </Button>
          </form>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Joined</th>
                <th className="py-2 pr-3 font-medium">Last sign-in</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line/60 align-middle">
                  <td className="max-w-[240px] truncate py-2.5 pr-3">
                    <Link href={`/app/admin/users/${u.id}`} className="text-gold hover:underline">
                      {u.email ?? u.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-muted">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    {u.banned_until ? (
                      <Badge variant="danger">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <EntitlementButtons userId={u.id} hasPro={proUsers.has(u.id)} />
                      <SuspendButton
                        userId={u.id}
                        suspended={Boolean(u.banned_until)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

