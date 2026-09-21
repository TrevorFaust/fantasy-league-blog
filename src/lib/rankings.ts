import type { Post, PostImage } from "@/lib/content";

export type RankStat = { label: string; value: string };

export type RankEntry = {
  rank: number;
  title: string;
  stats: RankStat[];
  body: string[];
  image?: PostImage;
};

export type ParsedPost = {
  intro: string[];
  rankings: RankEntry[];
};

const RANK_LINE = /^(\d{1,2})\s*[\.:]\s*(.*)$/;
const STAT_LINE =
  /^(Post Draft Ranking|Post Draft Change|Quarterly Change|Weekly Change|Record)\s*:\s*(.+)$/i;

function clean(text: string) {
  return text.replace(/\u200b/g, "").replace(/\u00a0/g, " ").trim();
}

function linesOf(block: string) {
  return clean(block)
    .split(/\n/)
    .map((line) => clean(line))
    .filter(Boolean);
}

export function isRankHeader(block: string) {
  const first = linesOf(block)[0] || "";
  return RANK_LINE.test(first);
}

function parseHeader(block: string): RankEntry {
  const lines = linesOf(block);
  const match = lines[0].match(RANK_LINE);
  const rank = match ? Number(match[1]) : 0;
  const title = match ? match[2] : lines[0];
  const stats: RankStat[] = [];
  const body: string[] = [];

  for (const line of lines.slice(1)) {
    const stat = line.match(STAT_LINE);
    if (stat) {
      stats.push({ label: stat[1], value: stat[2].trim() });
    } else {
      body.push(line);
    }
  }

  return { rank, title, stats, body };
}

const PEOPLE = [
  "trevor",
  "maggie",
  "matte",
  "brendan",
  "haley",
  "jess",
  "gabe",
  "liz",
  "brin",
  "katie",
  "molly",
  "max",
  "olivia",
  "brody",
  "jordan",
  "becca",
] as const;

const TEAM_ALIASES: Record<string, string> = {
  teamconrad: "maggie",
  checkyournails: "maggie",
  butkerihardlyknowher: "maggie",
  herecomesmcbride: "katie",
  hurtssogood: "katie",
  brodysbeastialityteam: "brody",
  brodysbeastlyteam: "brody",
  brodysbeastyteam: "brody",
  kamaraharris: "trevor",
  jackinggoffhurts: "trevor",
  chromedomeclankers: "trevor",
  chromedomeclankershardr: "trevor",
  saquonthesenuts: "trevor",
  bootyholebrowns: "brody",
  likeagoodnaber: "katie",
  laportapottyparty: "max",
  babygotdak: "jess",
  gaypeoplecantplayfootball: "gabe",
  allmyopponentsgoofy: "maggie",
  fondlethesefootballz: "brin",
  fondlethesefootballs: "brin",
  babychoda: "brendan",
  jockstraps: "haley",
  blowinmyjs: "jordan",
  newpdogg: "olivia",
};

function compact(text: string) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

function personFromText(text: string) {
  const haystack = compact(text);
  return PEOPLE.find((person) => haystack.includes(person));
}

export function nameKey(title: string) {
  const paren = title.match(/\(([^)]+)\)\s*[:.]?\s*$/);
  const raw = (paren ? paren[1] : title).toLowerCase();
  return raw.replace(/[^a-z]/g, "");
}

export function personKey(title: string, alt = "") {
  const parens = [...title.matchAll(/\(([^)]+)\)/g)].map((match) => compact(match[1]));
  for (let i = parens.length - 1; i >= 0; i--) {
    if (PEOPLE.includes(parens[i] as (typeof PEOPLE)[number])) return parens[i];
  }

  const fromAlt = personFromText(alt);
  if (fromAlt) return fromAlt;

  const fromTitle = personFromText(title);
  if (fromTitle) return fromTitle;

  const team = compact(title.replace(/\([^)]*\)/g, ""));
  if (TEAM_ALIASES[team]) return TEAM_ALIASES[team];

  return nameKey(title);
}

const PULL_BACK_KEYS = new Set(["matte", "brendan"]);

export function rankingPhotoFit(title: string, alt = "") {
  return PULL_BACK_KEYS.has(personKey(title, alt)) ? "contain" : "cover";
}

function isRedundantName(entry: RankEntry, text: string) {
  const compact = text.toLowerCase().replace(/[^a-z]/g, "");
  if (!compact || compact.length > 20) return false;
  const titleKey = nameKey(entry.title);
  if (!titleKey) return false;
  return titleKey.includes(compact) || compact.includes(titleKey.slice(0, 4));
}

function stripLeadingName(entry: RankEntry, text: string) {
  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
  if (lines[0] && isRedundantName(entry, lines[0])) {
    return lines.slice(1).join("\n\n");
  }
  return text;
}

function portraitAlt(img: PostImage) {
  return img.alt.toLowerCase().replace(/[^a-z]/g, "");
}

function isPortrait(img: PostImage) {
  return portraitAlt(img).length >= 3;
}

function assignImages(rankings: RankEntry[], images: PostImage[]) {
  if (!images.length || !rankings.length) return;

  const pool = !isPortrait(images[0]) ? images.slice(1) : images;
  const used = new Set<string>();

  for (const entry of rankings) {
    const key = nameKey(entry.title);
    if (key.length < 3) continue;
    const match = pool.find((img) => {
      if (used.has(img.src) || !isPortrait(img)) return false;
      const alt = portraitAlt(img);
      return alt.includes(key.slice(0, 6)) || key.includes(alt.slice(0, 6));
    });
    if (match) {
      entry.image = match;
      used.add(match.src);
    }
  }

  const leftover = pool.filter((img) => !used.has(img.src));
  let i = 0;
  for (const entry of rankings) {
    if (entry.image) continue;
    if (leftover[i]) entry.image = leftover[i++];
  }
}

export function parsePost(post: Post): ParsedPost {
  const intro: string[] = [];
  const rankings: RankEntry[] = [];

  for (const block of post.blocks) {
    if (isRankHeader(block)) {
      rankings.push(parseHeader(block));
    } else if (rankings.length) {
      const text = clean(block);
      if (!text) continue;
      const last = rankings[rankings.length - 1];
      const trimmed = stripLeadingName(last, text);
      if (trimmed) last.body.push(trimmed);
    } else {
      const text = clean(block);
      if (text) intro.push(text);
    }
  }

  assignImages(rankings, post.images);
  rankings.sort((a, b) => b.rank - a.rank);
  return { intro, rankings };
}
