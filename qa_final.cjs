const puppeteer = require("puppeteer");
const fs = require("fs");
const BASE = "https://portotional.vercel.app";
const RID = "28803727-c258-41ad-9407-b8eab3b57181";

async function findButtonByText(page, text) {
  const handles = await page.$$("button");
  for (const h of handles) {
    const t = await h.evaluate((el) => el.textContent.trim());
    if (t === text) return h;
  }
  return null;
}
async function pageFindOption(page, textPart) {
  const handles = await page.$$('[role="option"]');
  for (const h of handles) {
    const t = await h.evaluate((el) => el.textContent);
    if (t.toLowerCase().includes(textPart.toLowerCase())) return h;
  }
  return null;
}

(async () => {
  const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-dev-shm-usage"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/login", { waitUntil: "networkidle2" });
  await p.type("#email", "demo@portotional.com");
  await p.type("#password", "Demo2026!");
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(()=>{}), p.click('button[type="submit"]')]);
  await new Promise(r=>setTimeout(r,4000));

  // open builder, go to Design tab, enumerate size options, switch LETTER
  await p.goto(`${BASE}/app/cv/${RID}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r=>setTimeout(r,3000));
  const designTab = await findButtonByText(p, "Design");
  if (designTab) { await designTab.click(); await new Promise(r=>setTimeout(r,800)); }
  const combos = await p.$$('[role="combobox"]');
  let sizeInfo = [];
  for (const h of combos) {
    const t = await h.evaluate(el=>el.textContent.trim());
    if (/A4|F4|LETTER/.test(t)) {
      await h.click(); await new Promise(r=>setTimeout(r,500));
      sizeInfo = await p.evaluate(()=>Array.from(document.querySelectorAll('[role="option"]')).map(o=>o.textContent.trim()));
      const letterOpt = await pageFindOption(p, "Letter");
      if (letterOpt) { await letterOpt.click(); await new Promise(r=>setTimeout(r,1200)); }
      break;
    }
  }
  async function measure(){ return p.evaluate(()=>{const el=document.querySelector(".pv-page"); return el?{w:el.offsetWidth,h:el.offsetHeight}:null;}); }
  const mLetter = await measure();
  console.log(`[size-options] ${JSON.stringify(sizeInfo)}`);
  console.log(`[letter-preview] dims=${JSON.stringify(mLetter)} expect w≈816(216mm) h≈1054(279mm)`);

  async function getPdf(ps){
    return p.evaluate(async (ps)=>{
      const r = await fetch("/api/pdf",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({resumeId:"28803727-c258-41ad-9407-b8eab3b57181",pageSize:ps})});
      if(!r.ok) return {status:r.status,err:(await r.text()).slice(0,150)};
      const buf=await r.arrayBuffer(); const u8=new Uint8Array(buf); let bin="";
      for(let i=0;i<u8.length;i+=8192) bin+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));
      return {status:r.status,b64:btoa(bin)};
    }, ps);
  }
  for (const ps of ["A4","LETTER"]) {
    const r = await getPdf(ps);
    if(!r.b64){console.log(`[pdf-${ps}] FAIL ${r.status} ${r.err||""}`);continue;}
    const buf = Buffer.from(r.b64,"base64");
    fs.writeFileSync(`/tmp/opencode/qa/final-${ps}.pdf`,buf);
    const raw=buf.toString("latin1");
    const mb=raw.match(/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    const pages=(raw.match(/\/Type\s*\/Page[^s]/g)||[]).length;
    console.log(`[pdf-${ps}] bytes=${buf.length} MediaBox=${mb?mb.slice(1).join(","):"?"}pt pages=${pages}`);
  }

  // template distinctness: create-form previews vs builder render — check two-column grid applies
  await p.goto(BASE + "/app/cv/new", { waitUntil: "networkidle2" });
  await new Promise(r=>setTimeout(r,2000));
  const gal = await p.evaluate(()=>{
    const names=["Classic Professional","Modern Minimal","Executive Gold","Two-Column Modern","Academic Serif","Creative Bold","Student Compact","Developer Tech"];
    return names.map(n=>({n,present:Array.from(document.querySelectorAll("button")).some(b=>b.textContent.includes(n))}));
  });
  console.log("[gallery]", JSON.stringify(gal.filter(g=>!g.present).length===0 ? "ALL 8 PRESENT" : gal.filter(g=>!g.present)));
  await b.close();
})().catch(e=>{console.error("ERR",e.message);process.exit(1);});
