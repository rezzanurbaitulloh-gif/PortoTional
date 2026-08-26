import type { Metadata } from "next";
import { SeoLanding } from "@/components/shared/seo-landing";

export const metadata: Metadata = {
  title: "Portfolio Builder — Showcase Real Work Alongside Your CV",
  description:
    "Attach projects, images, links and outcomes to a professional portfolio that renders as part of your CV and personal website. Built for designers, developers and creators.",
};

export default function Page() {
  return (
    <SeoLanding
      h1="Portfolio builder for people who show, not tell"
      intro="Bullet points rarely capture great work. PortoTional includes a dedicated portfolio section where each project carries its own title, role, description, live URL, cover image and tags. The same portfolio entries flow into your CV, your public profile and your personal website — write once, showcase everywhere."
      bullets={[
        "Project cards with role, description, links and imagery",
        "Works appear in CV, public profile and website automatically",
        "Showcase Bold website theme for visual-first professions",
        "Tags make your work discoverable in search on your own terms",
        "Everything stays attached to your Master Identity — no duplication",
      ]}
      faq={[
        { q: "Who is this for?", a: "Designers, developers, writers, marketers — anyone whose work speaks louder than job titles. If you have shipped things people can look at, the portfolio section is for you." },
        { q: "Do I need the paid plan?", a: "Adding portfolio works to your CV and public profile is free. Personal websites with visual themes are part of Pro." },
        { q: "Can I reorder projects?", a: "Yes — drag to reorder inside the builder and the order applies everywhere your portfolio appears." },
      ]}
    />
  );
}
