import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium", "puppeteer-core", "pdf-parse", "mammoth"],
  // @sparticuz/chromium loads its compressed binaries dynamically from
  // <pkg>/bin at runtime — file tracing cannot see them, so include them.
  outputFileTracingIncludes: {
    "/api/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
