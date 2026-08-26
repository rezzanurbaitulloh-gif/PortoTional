import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PortoTional — AI-Powered Professional Identity",
    short_name: "PortoTional",
    description:
      "Build your Master Professional Identity once. Generate ATS-ready CVs, a public profile and a personal website.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0C10",
    theme_color: "#0B0C10",
    icons: [
      {
        src: "/logo-dark.png",
        sizes: "512x225",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
