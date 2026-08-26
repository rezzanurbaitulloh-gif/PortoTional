import Link from "next/link";
import { Bookmark, FolderPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/services/identity";
import { CreateCollectionForm, RemoveSavedButton, MoveToCollectionSelect } from "./saved-controls";

export const metadata = { title: "Saved Professionals" };

type SavedRow = {
  id: string;
  collection_id: string | null;
  target_profile_id: string;
};

export default async function SavedPage() {
  const me = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();

  const [savedRes, collectionsRes] = await Promise.all([
    supabase
      .from("saved_professionals")
      .select(
        "id, collection_id, target_profile_id, target:profiles!saved_professionals_target_profile_id_fkey(username, full_name, headline)",
      )
      .eq("saver_profile_id", me.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_collections")
      .select("*")
      .eq("owner_profile_id", me.id)
      .order("name"),
  ]);
  const rows = (savedRes.data ?? []) as unknown as (SavedRow & {
    target?: { username: string; full_name: string; headline: string };
  })[];
  const collections = collectionsRes.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-ivory">
          <Bookmark className="h-6 w-6 text-gold" /> Saved Professionals
        </h1>
        <p className="mt-1 text-sm text-muted">
          People you want to remember — organize them into collections.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm">
            Collections
            <span className="text-xs font-normal text-muted">
              {collections.length} collection{collections.length === 1 ? "" : "s"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <li key={c.id}>
                <Badge variant="secondary">{c.name}</Badge>
              </li>
            ))}
            {collections.length === 0 ? (
              <li className="text-xs text-muted">No collections yet.</li>
            ) : null}
          </ul>
          <CreateCollectionForm />
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <FolderPlus className="mx-auto h-10 w-10 text-gold" aria-hidden />
            <p className="mt-4 text-sm font-medium text-ivory">
              You haven’t saved anyone yet.
            </p>
            <p className="mt-1 text-xs text-muted">
              Explore professionals and press Save on their profile.
            </p>
            <Button asChild className="mt-4">
              <Link href="/discover">Discover professionals</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link href={`/u/${r.target?.username ?? ""}`} className="text-sm font-medium text-gold hover:underline">
                      {r.target?.full_name || `@${r.target?.username ?? "?"}`}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {r.target?.headline}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MoveToCollectionSelect
                      savedId={r.id}
                      current={r.collection_id}
                      collections={collections.map((c) => ({ id: c.id, name: c.name }))}
                    />
                    <RemoveSavedButton savedId={r.id} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
