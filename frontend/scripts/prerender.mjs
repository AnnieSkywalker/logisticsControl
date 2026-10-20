import fs from "fs";

const API_BASE = process.env.API_BASE || "http://backend:3001";
const SHELL_BASE = process.env.SHELL_BASE || "http://frontend:80";
const SITE_URL = process.env.SITE_URL || "https://logistics.example.ru";
const OUT_DIR = process.env.OUT_DIR || "/out";

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function waitForBackend(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Backend не ответил за отведённое время");
}

async function waitForShell(timeoutMs = 90000) {
  const start = Date.now();
  let lastAsset = null;
  let stableSince = 0;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${SHELL_BASE}/index.html`);
      if (res.ok) {
        const text = await res.text();
        const m = text.match(/src="\/assets\/([^"]+)"/);
        if (m) {
          const assetRes = await fetch(`${SHELL_BASE}/assets/${m[1]}`);
          if (assetRes.ok) {
            if (lastAsset === m[1]) {
              if (!stableSince) stableSince = Date.now();
              if (Date.now() - stableSince >= 15000) return;
            } else {
              lastAsset = m[1];
              stableSince = 0;
            }
          }
        }
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Frontend (shell) не готов за отведённое время");
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildBody(settings) {
  const h1 = settings.h1 || settings.site_title || "Logistics Control";
  const seoText = settings.seo_text
    ? String(settings.seo_text).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")
    : "";
  const description = settings.site_description
    ? `<p>${esc(settings.site_description)}</p>`
    : "";
  return `<section><h1>${esc(h1)}</h1>${description}${seoText}</section>`;
}

async function main() {
  console.log("Prerender: waiting for backend...");
  await waitForBackend();
  console.log("Prerender: waiting for frontend shell...");
  await waitForShell();
  console.log("Prerender: fetching settings...");
  const settings = await get("/api/settings").catch(() => ({}));

  console.log("Prerender: fetching SPA shell...");
  const shellRes = await fetch(`${SHELL_BASE}/index.html`);
  const shell = await shellRes.text();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.seo_business_name || settings.site_title || "Logistics Control",
    description: settings.seo_business_description || settings.site_description || "",
    url: `${SITE_URL}/`,
  };
  const blocks = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  const staticContent = buildBody(settings);

  const titleText = settings.site_title || "Logistics Control";
  const descText = settings.site_description || "";

  const html = shell
    .replace(/<div id="app"><\/div>/, `<div id="app"><noscript>${staticContent}</noscript></div>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titleText)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(descText)}" />`)
    .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(descText)}" />`)
    .replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(titleText)}" />`)
    .replace(/<\/head>/, `  ${blocks}\n  </head>`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(`${OUT_DIR}/index.html`, html, "utf8");
  console.log(`Prerender: written ${OUT_DIR}/index.html (${html.length} bytes)`);
}

main().catch((err) => {
  console.error("Prerender failed:", err.message);
  process.exit(1);
});
