const puppeteer = require("puppeteer");
const BASE = "https://portotional.vercel.app";
const RID = "28803727-c258-41ad-9407-b8eab3b57181";
(async () => {
  const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-dev-shm-usage"] });
  const p = await b.newPage();
  const logs = [];
  p.on("console", m => logs.push(`[${m.type()}] ${m.text().slice(0,200)}`));
  p.on("pageerror", e => logs.push(`[pageerror] ${String(e).slice(0,300)}`));
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/login", { waitUntil: "networkidle2" });
  await p.type("#email", "demo@portotional.com");
  await p.type("#password", "Demo2026!");
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(()=>{}), p.click('button[type="submit"]')]);
  await new Promise(r=>setTimeout(r,4000));
  logs.length = 0;
  await p.goto(`${BASE}/app/cv/${RID}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r=>setTimeout(r,5000));
  const info = await p.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    hasPvPage: !!document.querySelector(".pv-page"),
    comboboxes: document.querySelectorAll('[role="combobox"]').length,
    selects: document.querySelectorAll("select").length,
    bodySnippet: document.body.innerText.slice(0, 300),
  }));
  console.log("PAGE:", JSON.stringify(info));
  console.log("CONSOLE:", logs.slice(-10).join("\n"));
  await p.screenshot({ path: "/tmp/opencode/qa/diag-builder.png" });

  // Raw PDF response incl headers
  const cookies = await p.cookies();
  const ck = cookies.map(c=>`${c.name}=${c.value}`).join("; ");
  const res = await fetch(BASE + "/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ck },
    body: JSON.stringify({ resumeId: RID, pageSize: "A4" }),
  });
  console.log("PDF status:", res.status);
  console.log("PDF headers:", JSON.stringify(Object.fromEntries([...res.headers.entries()].filter(([k])=>/vercel|x-matched|retry|age/i.test(k)))));
  console.log("PDF body:", (await res.text()).slice(0, 300));
  await b.close();
})().catch(e => { console.error("ERR", e); process.exit(1); });
