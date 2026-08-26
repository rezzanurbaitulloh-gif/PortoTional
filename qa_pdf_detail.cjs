const puppeteer = require("puppeteer");
const BASE = "https://portotional.vercel.app";
(async () => {
  const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-dev-shm-usage"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/login", { waitUntil: "networkidle2" });
  await p.type("#email", "demo@portotional.com");
  await p.type("#password", "Demo2026!");
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(()=>{}), p.click('button[type="submit"]')]);
  await new Promise(r=>setTimeout(r,4000));
  const res = await p.evaluate(async () => {
    const r = await fetch("/api/pdf", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ resumeId: "28803727-c258-41ad-9407-b8eab3b57181", pageSize: "A4" }) });
    return { status: r.status, body: (await r.text()).slice(0, 400) };
  });
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})().catch(e => {console.error(e.message); process.exit(1);});
