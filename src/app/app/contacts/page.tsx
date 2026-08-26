import Link from "next/link";
import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/services/identity";
import { RespondButtons } from "./respond-buttons";

export const metadata = { title: "Contact Requests" };

type RequestRow = {
  id: string;
  intent: string;
  message: string;
  status: string;
  created_at: string;
  from_profile_id: string;
  to_profile_id: string;
  sender?: { username: string; full_name: string } | null;
  recipient?: { username: string; full_name: string } | null;
};

export default async function ContactsPage() {
  const me = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();

  const [incomingRes, outgoingRes] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("*, sender:profiles!contact_requests_from_profile_id_fkey(username, full_name)")
      .eq("to_profile_id", me.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("contact_requests")
      .select("*, recipient:profiles!contact_requests_to_profile_id_fkey(username, full_name)")
      .eq("from_profile_id", me.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const incoming = (incomingRes.data ?? []) as unknown as RequestRow[];
  const outgoing = (outgoingRes.data ?? []) as unknown as RequestRow[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-ivory">
          <Send className="h-6 w-6 text-gold" /> Contact Requests
        </h1>
        <p className="mt-1 text-sm text-muted">
          Professional introductions — accept or decline on your own terms.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Incoming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incoming.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">No requests yet.</p>
          ) : (
            incoming.map((r) => (
              <div key={r.id} className="rounded-lg border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/u/${r.sender?.username ?? ""}`} className="text-sm font-medium text-gold hover:underline">
                    {r.sender?.full_name || `@${r.sender?.username}`}
                  </Link>
                  <Badge variant={r.status === "pending" ? "default" : r.status === "accepted" ? "success" : "secondary"}>
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
                  {r.intent}
                </p>
                {r.message ? (
                  <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{r.message}</p>
                ) : null}
                {r.status === "pending" ? (
                  <RespondButtons requestId={r.id} />
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Sent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {outgoing.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">
              You haven’t reached out to anyone yet.
            </p>
          ) : (
            outgoing.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-4">
                <div>
                  <Link href={`/u/${r.recipient?.username ?? ""}`} className="text-sm font-medium text-gold hover:underline">
                    {r.recipient?.full_name || `@${r.recipient?.username}`}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(r.created_at).toLocaleDateString()} · {r.intent}
                  </p>
                </div>
                <Badge variant={r.status === "pending" ? "default" : r.status === "accepted" ? "success" : "secondary"}>
                  {r.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
