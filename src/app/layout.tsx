import type { Metadata } from "next";
import { appUrl } from "@/lib/app-url";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

const themeInit = `(function(){try{var m=localStorage.getItem("pt-theme")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("light",!d);}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "PortoTional",
      url: appUrl(),
      logo: `${appUrl()}/logo-dark.png`,
    },
    {
      "@type": "WebSite",
      name: "PortoTional",
      url: appUrl(),
    },
    {
      "@type": "SoftwareApplication",
      name: "PortoTional",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "49000", priceCurrency: "IDR" },
      description:
        "AI-powered professional identity platform: build your Master Identity once, generate ATS-ready CVs, public profiles and personal websites.",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "PortoTional — Setup Once, Showcase Everywhere",
    template: "%s · PortoTional",
  },
  description:
    "Build your Master Professional Identity once. Generate ATS-ready CVs, a public professional profile, and your personal website — powered by AI that never invents facts.",
  openGraph: {
    type: "website",
    siteName: "PortoTional",
    url: appUrl(),
    title: "PortoTional — Setup Once, Showcase Everywhere",
    description:
      "AI-powered professional identity platform: ATS-ready CVs, public profiles and personal websites from one Master Identity.",
    images: [{ url: "/logo-dark.png", width: 512, height: 225 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortoTional — Setup Once, Showcase Everywhere",
    images: ["/logo-dark.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${display.variable} min-h-screen`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
