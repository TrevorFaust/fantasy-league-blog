import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://trevorfaus27.wixsite.com/seattle-seacocks-pra";

const SEEDS = [
  BASE,
  `${BASE}/copy-of-second-quarter-rankings`,
  `${BASE}/copy-of-2025-post-draft-rankings`,
  `${BASE}/copy-of-first-quarter-rankings`,
  `${BASE}/copy-of-2024-post-draft-rankings-1`,
  `${BASE}/copy-of-home-1`,
  `${BASE}/copy-of-post-draft-rankings-1`,
  `${BASE}/copy-of-2024-post-draft-rankings`,
  `${BASE}/copy-of-first-quarter-recap-weeks-1-4`,
  `${BASE}/copy-of-second-quarter-recap-weeks-5-8`,
  `${BASE}/copy-of-home`,
  `${BASE}/week-1`,
  `${BASE}/copy-of-post-draft-rankings`,
  ...Array.from({ length: 13 }, (_, i) => `${BASE}/copy-of-week-${i + 1}`),
];

function normalizeUrl(href) {
  try {
    const u = new URL(href);
    if (!u.hostname.includes("wixsite.com")) return null;
    if (!u.pathname.includes("seattle-seacocks-pra")) return null;
    u.hash = "";
    u.search = "";
    let s = u.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return null;
  }
}

async function extractPage(page) {
  return page.evaluate(() => {
    const title = document.title || "";
    const junk = [
      "This website was built on Wix",
      "Create yours today",
      "Get Started",
      "Skip to Main Content",
      "Powered and secured by Wix",
      "© 2035 by Johan Cage",
    ];

    const rich = Array.from(
      document.querySelectorAll('[data-testid="richTextElement"], .wixui-rich-text'),
    )
      .map((el) => (el.innerText || "").trim())
      .filter(Boolean)
      .filter((t) => !junk.some((j) => t.includes(j)));

    // Deduplicate while preserving order
    const seen = new Set();
    const blocks = [];
    for (const t of rich) {
      const key = t.replace(/\s+/g, " ").slice(0, 200);
      if (seen.has(key)) continue;
      seen.add(key);
      blocks.push(t);
    }

    const images = Array.from(document.querySelectorAll("img"))
      .map((img) => ({
        alt: img.alt || "",
        src: (img.currentSrc || img.src || "").split("?")[0],
      }))
      .filter((img) => img.src.includes("wixstatic.com"))
      .filter(
        (img, i, arr) =>
          arr.findIndex((x) => x.src.split("/v1/")[0] === img.src.split("/v1/")[0]) === i,
      );

    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => ({
        text: (a.innerText || "").trim().replace(/\s+/g, " ").slice(0, 120),
        href: a.href,
      }))
      .filter((l) => l.href.includes("seattle-seacocks-pra"));

    return {
      title,
      url: location.href.split("?")[0].replace(/\/$/, ""),
      blocks,
      images,
      links,
      bodyText: document.body?.innerText?.slice(0, 50000) || "",
    };
  });
}

async function main() {
  const outDir = path.join(process.cwd(), "scrape");
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(path.join(outDir, "images"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const queue = [...SEEDS];
  const seen = new Set();
  const pages = [];

  while (queue.length) {
    const url = normalizeUrl(queue.shift());
    if (!url || seen.has(url)) continue;
    seen.add(url);
    console.log(`Scraping ${url}`);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(2500);
      const data = await extractPage(page);
      pages.push(data);
      for (const link of data.links) {
        const n = normalizeUrl(link.href);
        if (n && !seen.has(n)) queue.push(n);
      }
    } catch (err) {
      console.error(`Failed ${url}:`, err.message);
      pages.push({ url, title: "", error: String(err), blocks: [], images: [], links: [] });
    }
  }

  // Download unique images (original-ish URLs)
  const imageMap = {};
  for (const p of pages) {
    for (const img of p.images || []) {
      const base = img.src.split("/v1/")[0];
      if (!base || imageMap[base]) continue;
      const id = base.split("/").pop() || `img-${Object.keys(imageMap).length}`;
      const safe = id.replace(/[^a-zA-Z0-9._-]/g, "_");
      const dest = path.join(outDir, "images", safe);
      try {
        const res = await context.request.get(base);
        if (res.ok()) {
          const buf = await res.body();
          await fs.writeFile(dest, buf);
          imageMap[base] = `/images/${safe}`;
          console.log(`Saved image ${safe}`);
        }
      } catch (e) {
        console.warn(`Image fail ${base}:`, e.message);
      }
    }
  }

  // Attach local image paths
  for (const p of pages) {
    p.localImages = (p.images || []).map((img) => ({
      ...img,
      local: imageMap[img.src.split("/v1/")[0]] || null,
    }));
  }

  await fs.writeFile(path.join(outDir, "pages.json"), JSON.stringify(pages, null, 2));
  await fs.writeFile(
    path.join(outDir, "sitemap.json"),
    JSON.stringify(
      pages.map((p) => ({ url: p.url, title: p.title, blocks: p.blocks?.length || 0 })),
      null,
      2,
    ),
  );

  await browser.close();
  console.log(`Done. ${pages.length} pages, ${Object.keys(imageMap).length} images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
