const puppeteer = require("puppeteer");
const BASE = "https://portotional.vercel.app";
const RID = "28803727-c258-41ad-9407-b8eab3b57181";

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-dev-shm-usage"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const out = [];

  // login
  await page.goto(BASE + "/login", { waitUntil: "networkidle2" });
  await page.type("#email", "demo@portotional.com");
  await page.type("#password", "Demo2026!");
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(()=>{}), page.click('button[type="submit"]')]);
  await new Promise(r=>setTimeout(r,4000));
  out.push(`[auth] ${page.url().includes("/app/") ? "LOGIN-OK" : "LOGIN-FAIL"}`);

  // builder: size options + LETTER switch
  await page.goto(`${BASE}/app/cv/${RID}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r=>setTimeout(r,3000));

  const combos = await page.$$('[role="combobox"]');
  out.push(`[combobox-count] ${combos.length}`);
  let letterDone = false;
  for (const h of combos) {
    const txt = await h.evaluate(el => el.textContent.trim());
    if (!/A4|F4|LETTER/.test(txt)) continue;
    out.push(`[size-combo] current="${txt}"`);
    await h.click();
    await new Promise(r=>setTimeout(r,600));
    const opts = await page.evaluate(() => Array.from(document.querySelectorAll('[role="option"]')).map(o=>o.textContent.trim()));
    out.push(`[size-options] ${JSON.stringify(opts)}`);
    const letterOpt = await page.$x('//*[@role="option" and contains(normalize-space(),"LETTER")]');
    if (letterOpt.length) {
      await letterOpt[0].click();
      await new Promise(r=>setTimeout(r,1200));
      letterDone = true;
    }
    break;
  }
  async function measure(){ return page.evaluate(()=>{const el=document.querySelector(".pv-page"); return el?{w:el.offsetWidth,h:el.offsetHeight}:null;}); }
  const mA4 = null;
  const mLetter = letterDone ? await measure() : null;
  out.push(`[letter-preview] switched=${letterDone} dims=${JSON.stringify(mLetter)} expect w=816 h≈1054`);
  await page.screenshot({ path: "/tmp/opencode/qa/letter-mode.png" });

  // switch back to A4 and measure both sizes for parity inputs
  if (letterDone) {
    const handles = await page.$$('[role="combobox"]');
    for (const h of handles) {
      const txt = await h.evaluate(el => el.textContent.trim());
      if (/LETTER/.test(txt)) {
        await h.click(); await new Promise(r=>setTimeout(r,500));
        const a4 = await page.$x('//*[@role="option" and contains(normalize-space(),"A4")]');
        if (a4.length) { await a4[0].click(); await new Promise(r=>setTimeout(r,1000)); }
        break;
      }
    }
    const mBack = await measure();
    out.push(`[a4-preview] dims=${JSON.stringify(mBack)} expect 794×1123`);
  }

  // PDF fetch — real bytes + MediaBox
  for (const ps of ["A4","LETTER"]) {
    if (ps === "LETTER" && !letterDone) continue;
    const res = await page.evaluate(async (rid) => {
      const r = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: rid, pageSize: arguments[1] }),
      });
      if (!r.ok) return { status: r.status, err: await r.text() };
      const buf = await r.arrayBuffer();
      let bin = "";
      const u8 = new Uint8Array(buf);
      for (let i = 0; i < u8.length; i += 8192)
        bin += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
      return { status: r.status, b64: btoa(bin), len: buf.byteLength };
    }, ps === "A4" ? undefined : undefined).catch(e => ({status:0, err:e.message}));
    // simpler: pass pageSize via closure below instead
  }

  // do PDF properly with explicit args
  async function getPdf(pageSize){
    return page.evaluate(async (rid, ps) => {
      const r = await fetch("/api/pdf", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify({ resumeId: rid, pageSize: ps }) });
      if (!r.ok) return { status: r.status, err: (await r.text()).slice(0,200) };
      const buf = await r.arrayBuffer();
      const u8 = new Uint8Array(buf);
      let bin = "";
      for (let i=0;i<u8.length;i+=8192) bin += String.fromCharCode.apply(null, u8.subarray(i,i+8192));
      return { status: r.status, b64: btoa(bin), len: buf.byteLength };
    }, RID, pageSize);
  }
  const fs = require("fs");
  for (const ps of ["A4","LETTER"]) {
    const r = await getPdf(ps);
    if (!r.b64) { out.push(`[pdf-${ps}] FAIL status=${r.status} body=${r.err}`); continue; }
    const buf = Buffer.from(r.b64, "base64");
    fs.writeFileSync(`/tmp/opencode/qa/cv-${ps}.pdf`, buf);
    const raw = buf.toString("latin1");
    const mb = raw.match(/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
    out.push(`[pdf-${ps}] bytes=${buf.length} MediaBox=${mb?mb.slice(1).join(","):"?"} pages≈${pages}`);
  }

  console.log(out.join("\n"));
  fs.writeFileSync("/tmp/opencode/qa/verify-report.txt", out.join("\n"));
  await browser.close();
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
