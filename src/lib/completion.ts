import type {
  EducationRow,
  ExperienceRow,
  ProfileRow,
  SkillRow,
  WorkRow,
  CertificationRow,
} from "@/types/database";

export interface CompletionChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href?: string;
}

export function computeIdentityCompletion(input: {
  profile: Pick<ProfileRow, "photo_url" | "headline" | "summary" | "full_name">;
  experiences: Pick<ExperienceRow, "id">[];
  educations: Pick<EducationRow, "id">[];
  skills: Pick<SkillRow, "id">[];
  works: Pick<WorkRow, "id">[];
  certifications: Pick<CertificationRow, "id">[];
}): { percent: number; items: CompletionChecklistItem[] } {
  const items: CompletionChecklistItem[] = [
    {
      key: "name",
      label: "Full name",
      done: input.profile.full_name.trim().length > 1,
      href: "/app/identity",
    },
    {
      key: "headline",
      label: "Professional headline",
      done: input.profile.headline.trim().length > 3,
      href: "/app/identity",
    },
    {
      key: "summary",
      label: "Professional summary",
      done: input.profile.summary.trim().length > 60,
      href: "/app/ai",
    },
    {
      key: "photo",
      label: "Profile photo",
      done: Boolean(input.profile.photo_url),
      href: "/app/identity",
    },
    {
      key: "experience",
      label: "At least one experience",
      done: input.experiences.length > 0,
      href: "/app/identity/experience",
    },
    {
      key: "education",
      label: "Education history",
      done: input.educations.length > 0,
      href: "/app/identity/education",
    },
    {
      key: "skills",
      label: "At least 3 skills",
      done: input.skills.length >= 3,
      href: "/app/identity/skills",
    },
    {
      key: "work",
      label: "A project or work sample",
      done: input.works.length > 0,
      href: "/app/identity/work",
    },
    {
      key: "certifications",
      label: "A certification",
      done: input.certifications.length > 0,
      href: "/app/identity/certifications",
    },
  ];
  const done = items.filter((i) => i.done).length;
  return { percent: Math.round((done / items.length) * 100), items };
}
