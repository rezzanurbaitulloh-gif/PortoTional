import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium", "puppeteer-core", "pdf-parse", "mammoth"],
};

export default nextConfig;
