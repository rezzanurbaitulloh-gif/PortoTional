import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/u/", "/pricing"],
        disallow: ["/app", "/api", "/onboarding", "/auth"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
