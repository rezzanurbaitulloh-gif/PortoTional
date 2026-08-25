import { notFound } from "next/navigation";
import { getCurrentProfile, getIdentityBundle } from "@/services/identity";
import {
  ContentManager,
  type FieldDef,
  type EntityName,
} from "@/features/identity/content-manager";
import { toItemRecords } from "@/features/identity/item-records";
import type { ProfileRow } from "@/types/database";

const SECTION_CONFIG: Record<
  string,
  {
    entity: EntityName;
    title: string;
    description: string;
    emptyHint: string;
    fields: FieldDef[];
    titleFields?: string[];
  }
> = {
  experience: {
    entity: "experiences",
    title: "Experience",
    description:
      "Roles, jobs, internships, freelance work and volunteering. Use one line per achievement for best results.",
    emptyHint: "Add roles you've held — including internships and freelance work.",
    fields: [
      { name: "title", label: "Job title", type: "text", required: true },
      { name: "organization", label: "Organization", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "is_current", label: "I currently work here", type: "boolean" },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        span: 2,
        placeholder: "- Led the redesign of onboarding flow\n- Cut support tickets by 30% (as reported)",
        helpText:
          "Start each bullet with a dash (-). Numbers only if they are real.",
      },
    ],
    titleFields: ["title", "organization"],
  },
  education: {
    entity: "educations",
    title: "Education",
    description: "Formal education, bootcamps and courses.",
    emptyHint: "Add schools, universities or programs you completed or attend.",
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "degree", label: "Degree / program", type: "text" },
      { name: "field", label: "Field of study", type: "text" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "description", label: "Notes", type: "textarea", span: 2 },
    ],
    titleFields: ["institution"],
  },
  skills: {
    entity: "skills",
    title: "Skills",
    description: "Tools, methods, languages of practice — any skill relevant to your profession.",
    emptyHint: "Add skills like 'Figma', 'Bookkeeping', 'Public speaking'…",
    fields: [
      { name: "name", label: "Skill", type: "text", required: true },
      { name: "category", label: "Category (optional)", type: "text", placeholder: "Design, Finance…" },
      { name: "proficiency_label", label: "Level label (optional)", type: "text", placeholder: "Advanced" },
    ],
    
  },
  work: {
    entity: "works",
    title: "Projects & Works",
    description: "Portfolio pieces: projects, products, campaigns, artworks.",
    emptyHint: "Add your best work — with links or images when possible.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "role", label: "Your role", type: "text" },
      { name: "url", label: "Link", type: "url" },
      { name: "image_url", label: "Cover image", type: "image", span: 2 },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "tags", label: "Tags", type: "tags", placeholder: "branding, research" },
      { name: "description", label: "Description", type: "textarea", span: 2 },
    ],
    
  },
  certifications: {
    entity: "certifications",
    title: "Certifications",
    description: "Licenses, certificates and credentials.",
    emptyHint: "Add certifications — attach credential links as evidence.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text" },
      { name: "credential_id", label: "Credential ID", type: "text" },
      { name: "credential_url", label: "Credential URL", type: "url" },
      { name: "issue_date", label: "Issued", type: "date" },
      { name: "expiry_date", label: "Expires (if applicable)", type: "date" },
    ],
    
  },
  achievements: {
    entity: "achievements",
    title: "Achievements",
    description: "Awards, honors and recognitions.",
    emptyHint: "Add awards, competitions or recognitions.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "issuer", label: "Awarded by", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "description", label: "Description", type: "textarea", span: 2 },
    ],
    
  },
  languages: {
    entity: "languages",
    title: "Languages",
    description: "Spoken languages and proficiency.",
    emptyHint: "Add languages you speak professionally.",
    fields: [
      { name: "language", label: "Language", type: "text", required: true },
      {
        name: "proficiency",
        label: "Proficiency",
        type: "select",
        options: [
          { value: "native", label: "Native" },
          { value: "fluent", label: "Fluent" },
          { value: "professional_working", label: "Professional working" },
          { value: "limited_working", label: "Limited working" },
          { value: "basic", label: "Basic" },
        ],
      },
    ],
      },
  links: {
    entity: "social_links",
    title: "Links",
    description: "LinkedIn, portfolio site, GitHub, Behance, Instagram…",
    emptyHint: "Add professional links so people can verify and explore.",
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true, placeholder: "LinkedIn" },
      { name: "url", label: "URL", type: "url", required: true },
    ],
    titleFields: ["platform", "url"],
  },
};

const ROUTE_TO_KEY: Record<string, string> = {
  experience: "experience",
  education: "education",
  skills: "skills",
  work: "work",
  certifications: "certifications",
  achievements: "achievements",
  languages: "languages",
  links: "links",
};

export default async function IdentitySectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const key = ROUTE_TO_KEY[section];
  const config = key ? SECTION_CONFIG[key] : null;
  if (!config) notFound();

  const profile = (await getCurrentProfile()) as ProfileRow;
  if (!profile) return null;

  const bundle = await getIdentityBundle(profile.id);
  const itemsByEntity: Record<string, ReturnType<typeof toItemRecords>> = {
    experiences: toItemRecords(bundle.experiences),
    educations: toItemRecords(bundle.educations),
    skills: toItemRecords(bundle.skills),
    works: toItemRecords(bundle.works),
    achievements: toItemRecords(bundle.achievements),
    certifications: toItemRecords(bundle.certifications),
    languages: toItemRecords(bundle.languages),
    social_links: toItemRecords(bundle.socialLinks),
  };

  return (
    <div className="mx-auto max-w-3xl">
      <ContentManager
        entity={config.entity}
        title={config.title}
        description={config.description}
        emptyHint={config.emptyHint}
        fields={config.fields}
        items={itemsByEntity[config.entity] ?? []}
        titleFields={config.titleFields}

        allowReorder
      />
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(ROUTE_TO_KEY).map((section) => ({ section }));
}

export const dynamicParams = false;
