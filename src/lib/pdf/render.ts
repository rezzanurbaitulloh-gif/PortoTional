type BrowserLike = {
  newPage: () => Promise<{
    setContent: (html: string, o?: unknown) => Promise<void>;
    pdf: (o?: unknown) => Promise<Uint8Array | Buffer>;
    close: () => Promise<void>;
  }>;
  close: () => Promise<void>;
};

const globalForPdf = globalThis as unknown as {
  __portoPdfBrowser?: Promise<BrowserLike>;
};

/**
 * PDF engine.
 * - Serverless (Vercel): puppeteer-core + @sparticuz/chromium (packaged Chrome).
 * - Local/other: full puppeteer (system Chrome via its own download).
 */
export function getBrowser(): Promise<BrowserLike> {
  if (!globalForPdf.__portoPdfBrowser) {
    globalForPdf.__portoPdfBrowser = launch();
  }
  return globalForPdf.__portoPdfBrowser;
}

async function launch(): Promise<BrowserLike> {
  if (process.env.VERCEL) {
    const [{ default: chromium }, puppeteerCore] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);
    const browser = (await puppeteerCore.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    })) as unknown as BrowserLike;
    return browser;
  }

  const puppeteer = (await import("puppeteer")).default;
  return (await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  })) as unknown as BrowserLike;
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
      preferCSSPageSize: false,
    });
    return Buffer.from(bytes);
  } finally {
    await page.close();
  }
}
