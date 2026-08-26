export type Visibility = {
  profile: boolean;
  search_indexing: boolean;
  talent_discovery: boolean;
  location: boolean;
};

export interface ProfessionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  configuration: { recommendedSections?: string[]; workLabel?: string } & Record<
    string,
    unknown
  >;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  headline: string;
  summary: string;
  profession_id: string | null;
  photo_url: string | null;
  location: string;
  availability: "open_to_work" | "open_to_opportunities" | "not_available";
  availability_message: string | null;
  visibility: Visibility;
  notification_prefs: Record<string, boolean>;
  onboarding_completed: boolean;
  is_admin: boolean;
  role: "USER" | "SUPPORT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
  verification_status: "unverified" | "verified" | "professionally_verified";
  created_at: string;
  updated_at: string;
}

export interface ExperienceRow {
  id: string;
  profile_id: string;
  organization: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  location: string;
  sort_order: number;
  visibility: boolean;
}

export interface EducationRow {
  id: string;
  profile_id: string;
  institution: string;
  degree: string;
  field: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  visibility: boolean;
}

export interface SkillRow {
  id: string;
  profile_id: string;
  name: string;
  category: string;
  proficiency_label: string;
  sort_order: number;
  visibility: boolean;
}

export interface WorkRow {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  role: string;
  url: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  tags: string[];
  sort_order: number;
  visibility: boolean;
}

export interface AchievementRow {
  id: string;
  profile_id: string;
  title: string;
  issuer: string;
  date: string | null;
  description: string;
  evidence_id: string | null;
  sort_order: number;
  visibility: boolean;
}

export interface CertificationRow {
  id: string;
  profile_id: string;
  name: string;
  issuer: string;
  credential_id: string;
  credential_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  evidence_id: string | null;
  sort_order: number;
  visibility: boolean;
}

export interface LanguageRow {
  id: string;
  profile_id: string;
  language: string;
  proficiency:
    | "native"
    | "fluent"
    | "professional_working"
    | "limited_working"
    | "basic";
  sort_order: number;
  visibility: boolean;
}

export interface SocialLinkRow {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  sort_order: number;
  visibility: boolean;
}

export interface TemplateRow {
  id: string;
  type: "cv" | "website";
  name: string;
  slug: string;
  description: string;
  configuration: {
    accent?: string;
    serif?: boolean;
    photoPosition?: string;
    background?: string;
    font?: string;
    sectionsDefaultOrder?: string[];
    animations?: boolean;
    threeD?: boolean;
  };
  is_premium: boolean;
  is_active: boolean;
}

export type ResumeSectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications";

export interface ResumeSectionRow {
  id: string;
  resume_id: string;
  section_type: ResumeSectionType;
  source_reference: string[];
  custom_content: Record<string, unknown> | null;
  sort_order: number;
  is_visible: boolean;
}

export interface ResumeRow {
  id: string;
  profile_id: string;
  name: string;
  target_role: string;
  target_company: string;
  target_job_description: string;
  language: string;
  page_size: "A4" | "F4";
  template_id: string | null;
  status: string;
  settings: {
    accentColor: string;
    showPhoto: boolean;
    fontScale: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ResumeVersionRow {
  id: string;
  resume_id: string;
  snapshot: Record<string, unknown>;
  version_number: number;
  label: string;
  created_at: string;
}

export interface WebsiteRow {
  id: string;
  profile_id: string;
  subdomain: string;
  custom_domain: string | null;
  template_id: string | null;
  published: boolean;
  configuration: WebsiteConfiguration;
  seo_configuration: SeoConfiguration;
  created_at: string;
  updated_at: string;
}

export interface WebsiteConfiguration {
  theme: string;
  typography: string;
  color: string;
  layout: string;
  animations: boolean;
  threeD: boolean;
  heroTagline?: string;
}

export interface SeoConfiguration {
  title: string;
  description: string;
  ogImage: string;
  index: boolean;
}

export interface WebsiteSectionRow {
  id: string;
  website_id: string;
  section_type: string;
  content_reference: Record<string, unknown>;
  custom_content: Record<string, unknown> | null;
  sort_order: number;
  is_visible: boolean;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  action_url: string | null;
  entity_id: string | null;
  created_at: string;
}

export interface PublicProfileData {
  exists: boolean;
  public: boolean;
  username?: string;
  full_name?: string;
  headline?: string;
  summary?: string;
  photo_url?: string | null;
  availability?: string | null;
  availability_message?: string | null;
  profession?: string | null;
  location?: string | null;
  website_id?: string | null;
  skills?: { name: string; category: string; proficiency_label: string }[];
  works?: {
    id: string;
    title: string;
    description: string;
    role: string;
    url: string | null;
    image_url: string | null;
    tags: string[];
  }[];
  experiences?: {
    organization: string;
    title: string;
    description: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    location: string;
  }[];
  educations?: {
    institution: string;
    degree: string;
    field: string;
    start_date: string | null;
    end_date: string | null;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    credential_url: string | null;
    issue_date: string | null;
  }[];
  achievements?: {
    title: string;
    issuer: string;
    date: string | null;
    description: string;
  }[];
  languages?: { language: string; proficiency: string }[];
  social_links?: { platform: string; url: string }[];
}

export interface MasterIdentityBundle {
  profile: ProfileRow;
  experiences: ExperienceRow[];
  educations: EducationRow[];
  skills: SkillRow[];
  works: WorkRow[];
  achievements: AchievementRow[];
  certifications: CertificationRow[];
  languages: LanguageRow[];
  socialLinks: SocialLinkRow[];
  profession: ProfessionRow | null;
}

export interface ReportRow {
  id: string;
  reporter_user_id: string | null;
  target_type: "profile" | "website";
  target_username: string;
  reason:
    | "inappropriate_content"
    | "impersonation"
    | "spam"
    | "fake_information"
    | "other";
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolution_note: string;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: number;
  actor_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FeatureFlagRow {
  key: string;
  enabled: boolean;
  description: string;
  updated_at: string;
}

export type ShowcaseType =
  | "project"
  | "activity"
  | "achievement"
  | "certification"
  | "experience"
  | "event"
  | "design"
  | "publication"
  | "custom";

export interface ShowcaseGalleryItem {
  url: string;
  caption?: string;
}

export interface CaseStudy {
  problem?: string;
  goals?: string;
  process?: string;
  solution?: string;
  features?: string;
  lessons?: string;
}

export interface ShowcaseRow {
  id: string;
  profile_id: string;
  type: ShowcaseType;
  title: string;
  short_description: string;
  full_description: string;
  cover_url: string | null;
  gallery: ShowcaseGalleryItem[];
  video_url: string | null;
  start_date: string | null;
  end_date: string | null;
  role: string;
  organization: string;
  collaborators: string[];
  skills: string[];
  tags: string[];
  category: string;
  github_url: string | null;
  demo_url: string | null;
  links: { label: string; url: string }[];
  results_impact: string;
  case_study: CaseStudy | null;
  visibility: "public" | "unlisted" | "private";
  show_on_profile: boolean;
  show_on_website: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
