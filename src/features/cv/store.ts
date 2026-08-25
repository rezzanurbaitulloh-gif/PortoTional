"use client";

import { create } from "zustand";
import type {
  ResumeDoc,
  ResumeSectionType,
} from "@/features/cv/document";
import type {
  ExperienceRow,
  EducationRow,
  SkillRow,
  WorkRow,
  CertificationRow,
  ResumeRow,
} from "@/types/database";

export interface BuilderSection {
  section_type: ResumeSectionType;
  source_reference: string[];
  custom_content: Record<string, unknown> | null;
  is_visible: boolean;
}

export type SaveStatus =
  | "saved"
  | "dirty"
  | "saving"
  | "offline"
  | "syncing";

interface BuilderState {
  resumeId: string;
  fields: Pick<
    ResumeRow,
    "name" | "target_role" | "target_company" | "target_job_description" | "language" | "page_size" | "template_id"
  >;
  settings: { accentColor: string; showPhoto: boolean; fontScale: number };
  sections: BuilderSection[];
  status: SaveStatus;
  dirtySince: number | null;
  setField: <K extends keyof BuilderState["fields"]>(
    key: K,
    value: BuilderState["fields"][K],
  ) => void;
  setSettings: (patch: Partial<BuilderState["settings"]>) => void;
  setSections: (sections: BuilderSection[]) => void;
  patchSection: (type: ResumeSectionType, patch: Partial<BuilderSection>) => void;
  setStatus: (s: SaveStatus) => void;
  hydrate: (payload: {
    resumeId: string;
    fields: BuilderState["fields"];
    settings: BuilderState["settings"];
    sections: BuilderSection[];
  }) => void;
}

const LOCAL_DRAFT_KEY = (id: string) => `porto-cv-draft-${id}`;

export const useBuilderStore = create<BuilderState>((set) => ({
  resumeId: "",
  fields: {
    name: "Untitled CV",
    target_role: "",
    target_company: "",
    target_job_description: "",
    language: "en",
    page_size: "A4",
    template_id: null,
  },
  settings: { accentColor: "#D4AF37", showPhoto: true, fontScale: 1 },
  sections: [],
  status: "saved",
  dirtySince: null,
  hydrate: ({ resumeId, fields, settings, sections }) =>
    set({ resumeId, fields, settings, sections, status: "saved", dirtySince: null }),
  setField: (key, value) =>
    set((s) => ({
      fields: { ...s.fields, [key]: value },
      status: s.status === "offline" ? "offline" : "dirty",
      dirtySince: Date.now(),
    })),
  setSettings: (patch) =>
    set((s) => ({
      settings: { ...s.settings, ...patch },
      status: s.status === "offline" ? "offline" : "dirty",
      dirtySince: Date.now(),
    })),
  setSections: (sections) =>
    set({
      sections,
      status: "dirty",
      dirtySince: Date.now(),
    }),
  patchSection: (type, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.section_type === type ? { ...sec, ...patch } : sec,
      ),
      status: "dirty",
      dirtySince: Date.now(),
    })),
  setStatus: (status) => set({ status }),
}));

function readLocalDraft(id: string): string | null {
  try {
    return localStorage.getItem(LOCAL_DRAFT_KEY(id));
  } catch {
    return null;
  }
}

async function persist(state: BuilderState) {
  const payload = {
    id: state.resumeId,
    ...state.fields,
    settings: state.settings,
  };
  try {
    const [{ updateResumeAction }, { setResumeSectionsAction }] = await Promise.all([
      import("@/actions/cv"),
      import("@/actions/cv"),
    ]);
    await updateResumeAction(payload);
    await setResumeSectionsAction(
      state.resumeId,
      state.sections.map((s) => ({
        section_type: s.section_type,
        source_reference: s.source_reference,
        custom_content: s.custom_content,
        is_visible: s.is_visible,
      })),
    );
    useBuilderStore.setState({ status: "saved", dirtySince: null });
    try {
      localStorage.removeItem(LOCAL_DRAFT_KEY(state.resumeId));
    } catch {}
  } catch {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        localStorage.setItem(
          LOCAL_DRAFT_KEY(state.resumeId),
          JSON.stringify({ fields: state.fields, settings: state.settings, sections: state.sections }),
        );
      } catch {}
      useBuilderStore.setState({ status: "offline" });
    } else {
      useBuilderStore.setState({ status: "dirty", dirtySince: Date.now() });
    }
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== "undefined") {
  useBuilderStore.subscribe((state) => {
    if (state.status === "dirty") {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void persist(useBuilderStore.getState());
      }, 1200);
    }
  });

  window.addEventListener("online", () => {
    const state = useBuilderStore.getState();
    if (state.status === "offline") {
      useBuilderStore.setState({ status: "syncing" });
      setTimeout(() => void persist(useBuilderStore.getState()), 300);
    }
  });

  window.addEventListener("beforeunload", (e) => {
    const state = useBuilderStore.getState();
    if (["dirty", "saving", "offline"].includes(state.status)) {
      e.preventDefault();
    }
  });
}

export function restoreOfflineDraft(id: string): boolean {
  const raw = readLocalDraft(id);
  if (!raw) return false;
  try {
    const draft = JSON.parse(raw);
    useBuilderStore.setState({
      fields: { ...useBuilderStore.getState().fields, ...draft.fields },
      settings: { ...useBuilderStore.getState().settings, ...draft.settings },
      sections: draft.sections ?? [],
      status: "dirty",
      dirtySince: Date.now(),
    });
    return true;
  } catch {
    return false;
  }
}

export function buildDoc(
  state: Pick<BuilderState, "fields" | "settings" | "sections">,
  master: {
    fullName: string;
    headline: string;
    summary: string;
    photoUrl: string | null;
    location: string;
    profession: string | null;
    templateSlug: string;
    experiences: ExperienceRow[];
    educations: EducationRow[];
    skills: SkillRow[];
    works: WorkRow[];
    certifications: CertificationRow[];
  },
): ResumeDoc {

  const summarySection = state.sections.find((s) => s.section_type === "summary");

  return {
    pageSize: state.fields.page_size,
    accentColor: state.settings.accentColor,
    showPhoto: state.settings.showPhoto,
    fontScale: state.settings.fontScale,
    templateSlug: master.templateSlug || "classic-professional",
    language: state.fields.language,
    profile: {
      fullName: master.fullName,
      headline: master.headline,
      masterSummary: master.summary,
      summaryOverride:
        summarySection && typeof summarySection.custom_content?.text === "string"
          ? String(summarySection.custom_content.text)
          : null,
      photoUrl: master.photoUrl,
      location: master.location,
      profession: master.profession,
    },
    sections: state.sections.map((s) => ({
      type: s.section_type,
      visible: s.is_visible,
    })),
    experiences: filterByRefs(master.experiences, state.sections, "experience").map(
      (e) => ({
        id: e.id,
        organization: e.organization,
        title: e.title,
        description: e.description,
        startDate: e.start_date?.slice(0, 10) ?? null,
        endDate: e.end_date?.slice(0, 10) ?? null,
        isCurrent: e.is_current,
        location: e.location,
      }),
    ),
    educations: filterByRefs(master.educations, state.sections, "education").map(
      (ed) => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree,
        field: ed.field,
        description: "",
        startDate: ed.start_date?.slice(0, 10) ?? null,
        endDate: ed.end_date?.slice(0, 10) ?? null,
      }),
    ),
    skills: filterByRefs(master.skills, state.sections, "skills").map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      proficiencyLabel: s.proficiency_label,
    })),
    works: filterByRefs(master.works, state.sections, "projects").map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      role: w.role,
      url: w.url,
      tags: w.tags ?? [],
      startDate: w.start_date?.slice(0, 10) ?? null,
      endDate: w.end_date?.slice(0, 10) ?? null,
    })),
    certifications: filterByRefs(
      master.certifications,
      state.sections,
      "certifications",
    ).map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      credentialId: c.credential_id,
      issueDate: c.issue_date?.slice(0, 10) ?? null,
    })),
  };
}

function filterByRefs<T extends { id: string }>(
  items: T[],
  sections: BuilderSection[],
  type: ResumeSectionType,
): T[] {
  const sec = sections.find((s) => s.section_type === type);
  if (!sec || sec.source_reference.length === 0) return items;
  const include = new Set(sec.source_reference);
  return items.filter((i) => include.has(i.id));
}
