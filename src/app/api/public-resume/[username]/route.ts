import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildResumeHtml } from "@/features/cv/document-string";
import { htmlToPdf } from "@/lib/pdf/render";
import type { ResumeDoc } from "@/features/cv/document";

interface RpcProfile {
  exists: boolean;
  public: boolean;
}

interface DbExperience {
  id: string;
  organization: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  location: string;
}
interface DbEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string | null;
  end_date: string | null;
}
interface DbSkill {
  id: string;
  name: string;
  category: string;
  proficiency_label: string;
}
interface DbWork {
  id: string;
  title: string;
  description: string;
  role: string;
  url: string | null;
  tags: string[];
  start_date: string | null;
  end_date: string | null;
}
interface DbCertification {
  id: string;
  name: string;
  issuer: string;
  credential_id: string;
  issue_date: string | null;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username } = await ctx.params;
  try {
    const db = getSupabaseAdminClient();
    const rpcRes = await db.rpc("get_public_profile", {
      target_username: username,
    });
    const profile = (rpcRes.data as (RpcProfile & Record<string, unknown>) | null) ?? null;
    if (!profile || !profile.public) {
      return NextResponse.json({ error: "This profile is not public." }, { status: 404 });
    }

    const ownerRes = await db
      .from("profiles")
      .select("id, full_name, headline, summary, photo_url, location, profession_id")
      .eq("username", username)
      .maybeSingle();
    const owner = ownerRes.data as
      | {
          id: string;
          full_name: string;
          headline: string;
          summary: string;
          photo_url: string | null;
          location: string;
          profession_id: string | null;
        }
      | null;

    if (!owner) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const [expRes, eduRes, skillRes, workRes, certRes] = await Promise.all([
      db.from("experiences").select("*").eq("profile_id", owner.id).eq("visibility", true).order("sort_order"),
      db.from("educations").select("*").eq("profile_id", owner.id).eq("visibility", true).order("sort_order"),
      db.from("skills").select("*").eq("profile_id", owner.id).eq("visibility", true).order("sort_order"),
      db.from("works").select("*").eq("profile_id", owner.id).eq("visibility", true).order("sort_order"),
      db.from("certifications").select("*").eq("profile_id", owner.id).eq("visibility", true).order("sort_order"),
    ]);

    let professionName: string | null = null;
    if (owner.profession_id) {
      const profRes = await db
        .from("professions")
        .select("name")
        .eq("id", owner.profession_id)
        .maybeSingle();
      professionName =
        ((profRes.data as { name?: string } | null)?.name as string) ?? null;
    }

    const experiences = (expRes.data ?? []) as DbExperience[];
    const educations = (eduRes.data ?? []) as DbEducation[];
    const skills = (skillRes.data ?? []) as DbSkill[];
    const works = (workRes.data ?? []) as DbWork[];
    const certifications = (certRes.data ?? []) as DbCertification[];

    const doc: ResumeDoc = {
      pageSize: "A4",
      accentColor: "#D4AF37",
      showPhoto: true,
      fontScale: 1,
      templateSlug: "executive-gold",
      language: "en",
      profile: {
        fullName: owner.full_name || username,
        headline: owner.headline,
        masterSummary: owner.summary,
        summaryOverride: null,
        photoUrl: owner.photo_url,
        location: owner.location,
        profession: professionName,
      },
      sections: [
        { type: "summary", visible: true },
        { type: "experience", visible: true },
        { type: "projects", visible: true },
        { type: "education", visible: true },
        { type: "skills", visible: true },
        { type: "certifications", visible: true },
      ],
      experiences: experiences.map((e) => ({
        id: e.id,
        organization: e.organization,
        title: e.title,
        description: e.description,
        startDate: e.start_date,
        endDate: e.end_date,
        isCurrent: e.is_current,
        location: e.location,
      })),
      educations: educations.map((ed) => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree,
        field: ed.field,
        description: "",
        startDate: ed.start_date,
        endDate: ed.end_date,
      })),
      skills: skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiencyLabel: s.proficiency_label,
      })),
      works: works.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        role: w.role,
        url: w.url,
        tags: w.tags ?? [],
        startDate: w.start_date,
        endDate: w.end_date,
      })),
      certifications: certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        credentialId: c.credential_id,
        issueDate: c.issue_date,
      })),
    };

    const pdf = await htmlToPdf(buildResumeHtml(doc), { pageSize: doc.pageSize });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(username)}-resume.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[public-resume]", err);
    return NextResponse.json(
      { error: "Resume generation failed. Please retry." },
      { status: 502 },
    );
  }
}
