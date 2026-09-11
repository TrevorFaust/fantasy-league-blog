import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const pages = JSON.parse(await fs.readFile(path.join(ROOT, "scrape/pages.json"), "utf8"));

const HEADER_MARKERS = [
  "Welcome to the Biggest Shitshow",
  "If you're reading this bottom text",
];

function cleanTitle(title) {
  return (title || "").replace(/\s*\|\s*Seattle Seacocks Pra\s*$/i, "").trim();
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function stripChrome(blocks) {
  return blocks.filter((b) => {
    const t = b.trim();
    if (!t) return false;
    if (HEADER_MARKERS.some((m) => t.includes(m))) return false;
    if (t === "HOME") return false;
    return true;
  });
}

function byUrl(suffix) {
  const url = suffix.startsWith("http")
    ? suffix
    : `https://trevorfaus27.wixsite.com/seattle-seacocks-pra${suffix === "" ? "" : "/" + suffix}`;
  const page = pages.find((p) => p.url.replace(/\/$/, "") === url.replace(/\/$/, ""));
  if (!page) throw new Error(`Missing page ${url}`);
  return page;
}

function toPost({ season, slug, title, hubLabel, order, source }) {
  const blocks = stripChrome(source.blocks || []);
  const pageTitle = title || cleanTitle(source.title);
  // Drop first block if it's just repeating the title
  const body =
    blocks[0] && blocks[0].replace(/\s+/g, " ").toLowerCase() === pageTitle.toLowerCase()
      ? blocks.slice(1)
      : blocks;

  return {
    season,
    slug,
    title: pageTitle,
    hubLabel: hubLabel || pageTitle,
    order,
    wixUrl: source.url,
    blocks: body,
    images: (source.localImages || [])
      .filter((img) => img.local)
      .map((img) => ({
        alt: img.alt || pageTitle,
        src: img.local.startsWith("/") ? img.local : `/${img.local}`,
      })),
  };
}

const posts = [
  // 2025 current season rankings (live on home for now)
  toPost({
    season: 2025,
    slug: "post-draft",
    title: "2025 Post Draft Rankings",
    hubLabel: "New Year, New Team",
    order: 1,
    source: byUrl("copy-of-2024-post-draft-rankings-1"),
  }),
  toPost({
    season: 2025,
    slug: "first-quarter",
    title: "First Quarter Rankings",
    hubLabel: "4 down, 13 to go",
    order: 2,
    source: byUrl("copy-of-2025-post-draft-rankings"),
  }),
  toPost({
    season: 2025,
    slug: "second-quarter",
    title: "Second Quarter Rankings",
    hubLabel: "We're Half Way There",
    order: 3,
    source: byUrl("copy-of-first-quarter-rankings"),
  }),
  toPost({
    season: 2025,
    slug: "end-of-regular-season",
    title: "End of Regular Season Rankings",
    hubLabel: "It's Showtime",
    order: 4,
    source: byUrl("copy-of-second-quarter-rankings"),
  }),

  // 2024
  toPost({
    season: 2024,
    slug: "lets-run-it-back",
    title: "2024 Post Draft Rankings",
    hubLabel: "Let's Run It Back...",
    order: 1,
    source: byUrl("copy-of-post-draft-rankings-1"),
  }),
  toPost({
    season: 2024,
    slug: "first-quarter",
    title: "First Quarter Recap (Weeks 1-4)",
    hubLabel: "First Quarter Recap",
    order: 2,
    source: byUrl("copy-of-2024-post-draft-rankings"),
  }),
  toPost({
    season: 2024,
    slug: "halftime",
    title: "Second Quarter Recap (Weeks 5-8)",
    hubLabel: "Halftime",
    order: 3,
    source: byUrl("copy-of-first-quarter-recap-weeks-1-4"),
  }),
  toPost({
    season: 2024,
    slug: "playoffs",
    title: "Regular Season Recap (Weeks 9-14)",
    hubLabel: "Playoffs???",
    order: 4,
    source: byUrl("copy-of-second-quarter-recap-weeks-5-8"),
  }),

  // 2023
  toPost({
    season: 2023,
    slug: "post-draft",
    title: "Post Draft Rankings",
    hubLabel: "And So It Begins...",
    order: 0,
    source: byUrl("week-1"),
  }),
  ...Array.from({ length: 14 }, (_, i) => {
    const week = i + 1;
    const source =
      week === 1 ? byUrl("copy-of-post-draft-rankings") : byUrl(`copy-of-week-${week - 1}`);
    return toPost({
      season: 2023,
      slug: `week-${week}`,
      title: `Week ${week}`,
      hubLabel: `Week ${week}`,
      order: week,
      source,
    });
  }),
];

const home = byUrl("");
const seasons = {
  2025: {
    year: 2025,
    title: "2025 Season",
    blurb:
      "Current season rankings. When the year's done, this whole pile moves into the 2025 season recap and we start over.",
    hubPath: "/2025",
    posts: posts.filter((p) => p.season === 2025).sort((a, b) => a.order - b.order),
  },
  2024: {
    year: 2024,
    title: "2024 Season Recap",
    blurb: home.blocks.find((b) => b.includes("I'll give this option")) ||
      "Revisit last year — the wins, the trash, and the mid.",
    hubPath: "/2024",
    posts: posts.filter((p) => p.season === 2024).sort((a, b) => a.order - b.order),
  },
  2023: {
    year: 2023,
    title: "2023 Season Recap",
    blurb: home.blocks.find((b) => b.includes("Revisit the shitshow")) ||
      "The origin shitshow. Post draft plus weeks 1–14.",
    hubPath: "/2023",
    posts: posts.filter((p) => p.season === 2023).sort((a, b) => a.order - b.order),
  },
};

const site = {
  name: "Practice Squad Rankings",
  tagline: "Welcome to the Biggest Shitshow on the West Coast",
  subtitle:
    "The Seattle fantasy league ranking page — brought to you by your wonderful commissioner, big dawg, little hog, Trevor Faust.",
  portfolioLabel: "Fantasy League Blog",
  homeCards: [
    {
      season: 2025,
      title: "It's Showtime",
      subtitle: "End of Regular Season Rankings",
      href: "/2025/end-of-regular-season",
      image: seasons[2025].posts.find((p) => p.slug === "end-of-regular-season")?.images?.[0]?.src,
    },
    {
      season: 2025,
      title: "We're Half Way There",
      subtitle: "Second Quarter Rankings",
      href: "/2025/second-quarter",
    },
    {
      season: 2025,
      title: "4 down, 13 to go",
      subtitle: "First Quarter Rankings",
      href: "/2025/first-quarter",
    },
    {
      season: 2025,
      title: "New Year, New Team",
      subtitle: "Post Draft Rankings",
      href: "/2025/post-draft",
    },
  ],
  seasons,
  posts,
};

await fs.mkdir(path.join(ROOT, "src/content"), { recursive: true });
await fs.writeFile(path.join(ROOT, "src/content/site.json"), JSON.stringify(site, null, 2));

// Copy images into public
const pubImg = path.join(ROOT, "public/images");
await fs.mkdir(pubImg, { recursive: true });
const scrapeImg = path.join(ROOT, "scrape/images");
for (const file of await fs.readdir(scrapeImg)) {
  await fs.copyFile(path.join(scrapeImg, file), path.join(pubImg, file));
}

console.log(`Wrote ${posts.length} posts + site.json`);
