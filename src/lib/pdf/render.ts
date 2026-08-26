import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";

const globalForPdf = globalThis as unknown as {
  __portoPdfBrowser?: Promise<Browser>;
};

export function getBrowser(): Promise<Browser> {
  if (!globalForPdf.__portoPdfBrowser) {
    globalForPdf.__portoPdfBrowser = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });
  }
  return globalForPdf.__portoPdfBrowser;
}

export async function htmlToPdf(
  html: string,
  opts: { pageSize: "A4" | "F4" | "LETTER" },
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
    const bytes = await page.pdf({
      width:
        opts.pageSize === "LETTER"
          ? "216mm"
          : "210mm",
      height:
        opts.pageSize === "F4"
          ? "330mm"
          : opts.pageSize === "LETTER"
            ? "279mm"
            : "297mm",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(bytes);
  } finally {
    await page.close().catch(() => {});
  }
}
