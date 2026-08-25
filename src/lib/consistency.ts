import type { ExperienceRow } from "@/types/database";

export interface ConsistencyIssue {
  severity: "warning" | "info";
  message: string;
}

function toTime(d: string | null): number | null {
  if (!d) return null;
  const t = new Date(d + "T00:00:00").getTime();
  return Number.isNaN(t) ? null : t;
}

export function checkExperienceConsistency(
  experiences: Pick<
    ExperienceRow,
    "id" | "organization" | "title" | "start_date" | "end_date" | "is_current"
  >[],
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  const ranges = experiences
    .map((e) => ({
      ...e,
      start: toTime(e.start_date),
      end: e.is_current ? Date.now() : toTime(e.end_date),
    }))
    .filter((e): e is typeof e & { start: number; end: number } =>
      e.start !== null && (e.end as number | null) !== null,
    );

  for (let i = 0; i < ranges.length; i++) {
    const a = ranges[i];
    if (a.start > a.end) {
      issues.push({
        severity: "warning",
        message: `"${a.title}" at ${a.organization}: start date is after end date.`,
      });
    }
    for (let j = i + 1; j < ranges.length; j++) {
      const b = ranges[j];
      if (
        a.start <= b.end &&
        b.start <= a.end &&
        a.organization.trim().toLowerCase() ===
          b.organization.trim().toLowerCase()
      ) {
        if (
          a.title.trim().toLowerCase() === b.title.trim().toLowerCase()
        ) {
          issues.push({
            severity: "warning",
            message: `Possible duplicate entry: "${a.title}" at ${a.organization}.`,
          });
        } else {
          issues.push({
            severity: "info",
            message: `Overlapping roles at ${a.organization}: "${a.title}" and "${b.title}". If this is a promotion, that's fine — otherwise check the dates.`,
          });
        }
      }
    }
  }

  return issues;
}
