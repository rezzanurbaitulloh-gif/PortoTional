export const APP_NAME = "PortoTional";
export const APP_TAGLINE = "Setup Once, Showcase Everywhere.";

export const COLORS = {
  obsidian: "#0B0C10",
  ivory: "#F8F9FA",
  gold: "#D4AF37",
} as const;

export const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/app/identity", label: "Identity", icon: "Fingerprint" },
  { href: "/app/cv", label: "My CVs", icon: "FileText" },
  { href: "/app/ai", label: "AI Studio", icon: "Sparkles" },
  { href: "/app/showcase/profile", label: "Public Profile", icon: "Globe" },
  { href: "/app/showcase/website", label: "Website", icon: "MonitorSmartphone" },
  { href: "/app/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/app/settings", label: "Settings", icon: "Settings" },
] as const;

export const RESUME_SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects / Works",
  certifications: "Certifications",
};

export const WEBSITE_SECTIONS = [
  "hero",
  "about",
  "work",
  "experience",
  "skills",
  "contact",
] as const;

export type WebsiteSectionType = (typeof WEBSITE_SECTIONS)[number];

export const PLAN_LIMITS = {
  free: {
    maxResumes: 2,
    aiPerHour: Number(process.env.AI_RATE_LIMIT_FREE_PER_HOUR ?? 30),
    premiumTemplates: false,
    websitePublish: false,
    analytics: false,
  },
  pro: {
    maxResumes: 50,
    aiPerHour: Number(process.env.AI_RATE_LIMIT_PRO_PER_HOUR ?? 150),
    premiumTemplates: true,
    websitePublish: true,
    analytics: true,
  },
} as const;

export function planLimits(plan: string) {
  return plan === "pro" ? PLAN_LIMITS.pro : PLAN_LIMITS.free;
}

export const PRO_PRICE_IDR = 49000;
