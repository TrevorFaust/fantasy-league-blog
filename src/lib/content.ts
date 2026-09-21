export type PostImage = { alt: string; src: string };

export type Post = {
  season: number;
  slug: string;
  title: string;
  hubLabel: string;
  order: number;
  wixUrl: string;
  blocks: string[];
  images: PostImage[];
};

export type Season = {
  year: number;
  title: string;
  blurb: string;
  hubPath: string;
  posts: Post[];
};

export type SiteContent = {
  name: string;
  tagline: string;
  subtitle: string;
  portfolioLabel: string;
  homeCards: {
    season: number;
    title: string;
    subtitle: string;
    href: string;
    image?: string;
  }[];
  seasons: Record<string, Season>;
  posts: Post[];
};

import raw from "@/content/site.json";
import live from "@/content/live.json";

type LiveContent = {
  seasons: Record<string, Season>;
};

function withLiveSeasons(base: SiteContent, extra: LiveContent): SiteContent {
  const livePosts = Object.values(extra.seasons).flatMap((season) => season.posts);
  return {
    ...base,
    seasons: { ...base.seasons, ...extra.seasons },
    posts: [...base.posts, ...livePosts],
  };
}

export const site = withLiveSeasons(raw as SiteContent, live);

export function getSeasonYears() {
  return Object.keys(site.seasons);
}

export function getSeason(year: number) {
  return site.seasons[String(year)];
}

export function getPost(year: number, slug: string) {
  return site.posts.find((p) => p.season === year && p.slug === slug);
}

export function getAllPostParams() {
  return site.posts.map((p) => ({
    year: String(p.season),
    slug: p.slug,
  }));
}
