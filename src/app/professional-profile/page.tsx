import type { Metadata } from "next";
import { SeoLanding } from "@/components/shared/seo-landing";

export const metadata: Metadata = {
  title: "Professional Profile — One Identity for Every Opportunity",
  description:
    "Create a Master Professional Profile once, then generate CVs, public profiles and websites from it. Privacy-first, AI-assisted, made for every profession.",
};

export default function Page() {
  return (
    <SeoLanding
      h1="One professional profile powering everything"
      intro="You rewrite the same information for every application — until now. PortoTional stores your Master Professional Profile once: identity, experience, education, skills, certifications, languages and portfolio. Every CV you create, your public profile page and your personal website draw from that single source, so updating your career happens in one place."
      bullets={[
        "Eight structured sections covering your whole career",
        "Profile completeness indicator shows exactly what's missing",
        "Timeline consistency checks catch overlapping dates",
        "Universal profession support — from accountant to chef to developer",
        "Export or delete your entire data anytime; your identity belongs to you",
      ]}
      faq={[
        { q: "What is a Master Professional Profile?", a: "It is the canonical, private-by-default record of your career inside PortoTional. Everything public or generated is derived from it — never the other way around." },
        { q: "Which professions are supported?", a: "All of them. PortoTional ships with curated profession profiles plus an open 'Other Professional' option, because careers do not fit dropdowns." },
        { q: "Can I delete everything later?", a: "Yes. Account deletion removes your profile, files, CVs and websites permanently — no dark patterns." },
      ]}
    />
  );
}
