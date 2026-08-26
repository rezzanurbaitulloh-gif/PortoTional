export interface ResumeDocExperience {
  id: string;
  organization: string;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  location: string;
}

export interface ResumeDocEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
}

export interface ResumeDocSkill {
  id: string;
  name: string;
  category: string;
  proficiencyLabel: string;
}

export interface ResumeDocWork {
  id: string;
  title: string;
  description: string;
  role: string;
  url: string | null;
  tags: string[];
  startDate: string | null;
  endDate: string | null;
}

export interface ResumeDocCertification {
  id: string;
  name: string;
  issuer: string;
  credentialId: string;
  issueDate: string | null;
}

export type ResumeSectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications";

export interface ResumeDocSection {
  type: ResumeSectionType;
  visible: boolean;
  title?: string;
}

export interface ResumeDoc {
  pageSize: "A4" | "F4" | "LETTER";
  accentColor: string;
  showPhoto: boolean;
  fontScale: number;
  templateSlug: string;
  language: string;
  profile: {
    fullName: string;
    headline: string;
    summaryOverride: string | null;
    masterSummary: string;
    photoUrl: string | null;
    location: string;
    profession: string | null;
  };
  sections: ResumeDocSection[];
  experiences: ResumeDocExperience[];
  educations: ResumeDocEducation[];
  skills: ResumeDocSkill[];
  works: ResumeDocWork[];
  certifications: ResumeDocCertification[];
}

const SECTION_TITLES_EN: Record<ResumeSectionType, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects & Works",
  certifications: "Certifications",
};

const SECTION_TITLES_ID: Record<ResumeSectionType, string> = {
  summary: "Ringkasan Profesional",
  experience: "Pengalaman",
  education: "Pendidikan",
  skills: "Keahlian",
  projects: "Proyek & Karya",
  certifications: "Sertifikasi",
};

function sectionTitle(type: ResumeSectionType, language: string): string {
  return language === "id"
    ? SECTION_TITLES_ID[type]
    : SECTION_TITLES_EN[type];
}

function fmtRange(
  start: string | null,
  end: string | null,
  current: boolean,
): string {
  const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" };
  const s = start
    ? new Date(start + "T00:00:00").toLocaleDateString("en-US", opts)
    : "";
  const e = current
    ? "Present"
    : end
      ? new Date(end + "T00:00:00").toLocaleDateString("en-US", opts)
      : "";
  return [s, e].filter(Boolean).join(" — ");
}

function Bullets({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (!lines.length) return null;
  return (
    <ul className="rt-bullets">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

export function ResumeDocument({ doc }: { doc: ResumeDoc }) {
  const scale = doc.fontScale || 1;

  return (
    <div
      className={`rt-doc rt-${doc.templateSlug}`}
      style={{ fontSize: `${10 * scale}pt`, ["--accent" as never]: doc.accentColor }}
    >
      <header className="rt-header">
        {doc.showPhoto && doc.profile.photoUrl ? (
          <img className="rt-photo" src={doc.profile.photoUrl} alt="" />
        ) : null}
        <div className="rt-headline-block">
          <h1 className="rt-name">{doc.profile.fullName || "Your Name"}</h1>
          <p className="rt-tagline">
            {[
              doc.profile.headline,
              doc.profile.profession,
              doc.profile.location,
            ]
              .filter(Boolean)
              .join("  ·  ") || "Professional"}
          </p>
        </div>
      </header>

      {doc.sections
        .filter((s) => s.visible)
        .map((section) => {
          switch (section.type) {
            case "summary": {
              const text = doc.profile.summaryOverride ?? doc.profile.masterSummary;
              if (!text.trim()) return null;
              return (
                <section key={section.type} className="rt-section">
                  <h2>{sectionTitle("summary", doc.language)}</h2>
                  <p className="rt-summary">{text}</p>
                </section>
              );
            }
            case "experience": {
              if (!doc.experiences.length) return null;
              return (
                <section key={section.type} className="rt-section">
                  <h2>{sectionTitle("experience", doc.language)}</h2>
                  {doc.experiences.map((e) => (
                    <article key={e.id} className="rt-item">
                      <div className="rt-item-row">
                        <span className="rt-item-title">{e.title}</span>
                        <span className="rt-item-range">
                          {fmtRange(e.startDate, e.endDate, e.isCurrent)}
                        </span>
                      </div>
                      <p className="rt-item-sub">
                        {[e.organization, e.location].filter(Boolean).join(" · ")}
                      </p>
                      <Bullets text={e.description} />
                    </article>
                  ))}
                </section>
              );
            }
            case "education": {
              if (!doc.educations.length) return null;
              return (
                <section key={section.type} className="rt-section">
                  <h2>{sectionTitle("education", doc.language)}</h2>
                  {doc.educations.map((ed) => (
                    <article key={ed.id} className="rt-item">
                      <div className="rt-item-row">
                        <span className="rt-item-title">{ed.institution}</span>
                        <span className="rt-item-range">
                          {fmtRange(ed.startDate, ed.endDate, false)}
                        </span>
                      </div>
                      <p className="rt-item-sub">
                        {[ed.degree, ed.field].filter(Boolean).join(", ")}
                      </p>
                    </article>
                  ))}
                </section>
              );
            }
            case "skills": {
              if (!doc.skills.length) return null;
              return (
                <section key={section.type} className="rt-section">
                  <h2>{sectionTitle("skills", doc.language)}</h2>
                  <ul className="rt-skills">
                    {doc.skills.map((s) => (
                      <li key={s.id}>{s.name}</li>
                    ))}
                  </ul>
                </section>
              );
            }
            case "projects": {
              if (!doc.works.length) return null;
              return (
                <section key={section.type} className="rt-section">
                  <h2>{sectionTitle("projects", doc.language)}</h2>
                  {doc.works.map((w) => (
                    <article key={w.id} className="rt-item">
                      <div className="rt-item-row">
                        <span className="rt-item-title">
                          {w.url ? (
                            <a href={w.url} style={{ color: "inherit" }}>
                              {w.title}
                            </a>
                          ) : (
                            w.title
                          )}
                        </span>
                        <span className="rt-item-range">
                          {fmtRange(w.startDate, w.endDate, false)}
                        </span>
                      </div>
                      {w.role ? <p className="rt-item-sub">{w.role}</p> : null}
                      <Bullets text={w.description} />
                      {w.tags?.length ? (
                        <p className="rt-tags">{w.tags.join(" · ")}</p>
                      ) : null}
                    </article>
                  ))}
                </section>
              );
            }
            case "certifications": {
              if (!doc.certifications.length) return null;
              return (
                <section key={section.type} className="rt-section">
                  <h2>{sectionTitle("certifications", doc.language)}</h2>
                  {doc.certifications.map((c) => (
                    <article key={c.id} className="rt-item">
                      <div className="rt-item-row">
                        <span className="rt-item-title">{c.name}</span>
                        <span className="rt-item-range">
                          {c.issueDate
                            ? new Date(c.issueDate + "T00:00:00").toLocaleDateString(
                                "en-US",
                                { year: "numeric", month: "short" },
                              )
                            : ""}
                        </span>
                      </div>
                      {c.issuer ? (
                        <p className="rt-item-sub">
                          {c.issuer}
                          {c.credentialId ? ` · ID ${c.credentialId}` : ""}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </section>
              );
            }
            default:
              return null;
          }
        })}
    </div>
  );
}
