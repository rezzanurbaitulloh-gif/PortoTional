import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRange(
  start: string | null,
  end: string | null,
  isCurrent = false,
): string {
  const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" };
  const s = start
    ? new Date(start + "T00:00:00").toLocaleDateString("en-US", opts)
    : "";
  const e = isCurrent
    ? "Present"
    : end
      ? new Date(end + "T00:00:00").toLocaleDateString("en-US", opts)
      : "";
  if (!s && !e) return "";
  if (s && e) return `${s} — ${e}`;
  return s || e;
}

export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 38);
}

export const PROFICIENCY_LABELS: Record<string, string> = {
  native: "Native",
  fluent: "Fluent",
  professional_working: "Professional working",
  limited_working: "Limited working",
  basic: "Basic",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  open_to_work: "Open to work",
  open_to_opportunities: "Open to opportunities",
  not_available: "Not available",
};
