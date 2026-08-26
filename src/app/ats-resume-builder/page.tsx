import type { Metadata } from "next";
import { SeoLanding } from "@/components/shared/seo-landing";

export const metadata: Metadata = {
  title: "ATS Resume Builder — Beat Applicant Tracking Systems",
  description:
    "Build an ATS-friendly resume that parsing software reads correctly. Clean single-column layouts, semantic headings and honest content with PortoTional.",
};

export default function Page() {
  return (
    <SeoLanding
      h1="ATS resume builder for systems that actually read your CV"
      intro="Around three in four resumes are filtered by an Applicant Tracking System before a human sees them. The classic-professional template in PortoTional uses a clean single-column layout, standard section headings and machine-readable text so parsers extract your real experience accurately."
      bullets={[
        "Classic Professional template engineered for parser accuracy",
        "Standard section names ATS software recognises (Experience, Education, Skills)",
        "Built-in analyzer flags clarity, completeness and consistency issues",
        "A4 page size with print-perfect PDF output",
        "Your data stays structured — reuse the same identity across every CV",
      ]}
      faq={[
        { q: "What makes a resume ATS-friendly?", a: "Simple layout, standard headings, readable digital text, correct date formats and no critical information trapped in images or columns. PortoTional's classic template follows all of these rules by default." },
        { q: "How do I check my score?", a: "Open any CV in the builder and switch to the analysis tab. It reviews clarity, completeness and consistency, then suggests concrete improvements." },
        { q: "Is it really free?", a: "The ATS-friendly template and public profile are free forever. Pro adds premium templates and higher AI limits." },
      ]}
    />
  );
}
