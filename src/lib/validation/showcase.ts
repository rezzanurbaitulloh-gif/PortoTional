import { z } from "zod";

export const SHOWCASE_TYPES = [
  "project",
  "activity",
  "achievement",
  "certification",
  "experience",
  "event",
  "design",
  "publication",
  "custom",
] as const;

const galleryItem = z.object({
  url: z.string().url().max(600),
  caption: z.string().max(200).optional(),
});

const linkItem = z.object({
  label: z.string().min(1).max(60),
  url: z.string().url().max(600),
});

const caseStudySchema = z
  .object({
    problem: z.string().max(4000).optional(),
    goals: z.string().max(4000).optional(),
    process: z.string().max(4000).optional(),
    solution: z.string().max(4000).optional(),
    features: z.string().max(4000).optional(),
    lessons: z.string().max(4000).optional(),
  })
  .optional();

export const showcaseSchema = z.object({
  type: z.enum(SHOWCASE_TYPES).default("project"),
  title: z.string().min(2).max(120),
  short_description: z.string().max(300).default(""),
  full_description: z.string().max(8000).default(""),
  cover_url: z.string().url().max(600).nullable().optional(),
  gallery: z.array(galleryItem).max(20).default([]),
  video_url: z.string().url().max(600).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  role: z.string().max(120).default(""),
  organization: z.string().max(120).default(""),
  collaborators: z.array(z.string().max(80)).max(20).default([]),
  skills: z.array(z.string().max(60)).max(20).default([]),
  tags: z.array(z.string().max(40)).max(12).default([]),
  category: z.string().max(60).default(""),
  github_url: z.string().url().max(600).nullable().optional(),
  demo_url: z.string().url().max(600).nullable().optional(),
  links: z.array(linkItem).max(8).default([]),
  results_impact: z.string().max(2000).default(""),
  case_study: caseStudySchema,
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  show_on_profile: z.boolean().default(true),
  show_on_website: z.boolean().default(true),
  featured: z.boolean().default(false),
});

