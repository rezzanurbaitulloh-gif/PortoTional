import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireCurrentProfile } from "@/services/identity";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteResumeButton } from "@/features/cv/delete-button";
import type { ResumeRow, TemplateRow } from "@/types/database";

export default async function CvListPage() {
  const profile = await requireCurrentProfile();
  const supabase = await getSupabaseServerClient();
  const [resumesRes, templatesRes] = await Promise.all([
    supabase
      .from("resumes")
      .select("*")
      .eq("profile_id", profile.id)
      .order("updated_at", { ascending: false }),
    supabase.from("templates").select("*").eq("type", "cv"),
  ]);
  const resumes = (resumesRes.data ?? []) as ResumeRow[];
  const templates = (templatesRes.data ?? []) as TemplateRow[];
  const templateName = (id: string | null) =>
    templates.find((t) => t.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ivory">My CVs</h1>
          <p className="mt-0.5 text-sm text-muted">
            Multiple CVs, one Master Identity — no duplicated data.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/cv/new">
            <Plus /> Create New CV
          </Link>
        </Button>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No CVs yet"
          description="Create your first CV. It will be generated from your Master Identity."
          action={
            <Button asChild>
              <Link href="/app/cv/new">Create New CV</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {resumes.map((r) => (
            <li key={r.id}>
              <Card className="card-lift flex flex-wrap items-center gap-3 p-4">
                <FileText className="h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ivory">{r.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Updated{" "}
                    {new Date(r.updated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {templateName(r.template_id)} · {r.page_size}
                    {r.target_role ? ` · ${r.target_role}` : ""}
                  </p>
                </div>
                <Badge variant={r.status === "draft" ? "secondary" : "success"}>
                  {r.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/app/cv/${r.id}`}>Edit</Link>
                  </Button>
                  <DeleteResumeButton resumeId={r.id} name={r.name} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
