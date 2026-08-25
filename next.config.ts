import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["puppeteer", "pdf-parse", "mammoth"],
};

export default nextConfig;
