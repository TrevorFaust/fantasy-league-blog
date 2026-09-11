"use client";

import Link from "next/link";
import { useSafeMode } from "@/components/SafeModeProvider";
import type { Season } from "@/lib/content";

export function SeasonHub({ season }: { season: Season }) {
  const { filter } = useSafeMode();

  return (
    <div className="mx-auto w-[min(100%-1.5rem,72rem)] py-10">
      <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">Season archive</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-wide sm:text-6xl">
        {filter(season.title)}
      </h1>
      <p className="mt-4 max-w-2xl text-muted">{filter(season.blurb)}</p>

      <ol className="mt-10 grid gap-3">
        {season.posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/${post.season}/${post.slug}`}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-line bg-panel/80 px-5 py-4 transition hover:border-accent/50 hover:bg-panel"
            >
              <div>
                <div className="text-xs font-bold tracking-widest text-muted uppercase">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-wide group-hover:text-accent">
                  {filter(post.hubLabel)}
                </div>
                <div className="text-sm text-muted">{filter(post.title)}</div>
              </div>
              <span className="mt-2 text-accent" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
