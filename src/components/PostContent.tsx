"use client";

import Image from "next/image";
import { useSafeMode } from "@/components/SafeModeProvider";
import { RankingPhoto } from "@/components/RankingPhoto";
import type { Post } from "@/lib/content";
import { parsePost } from "@/lib/rankings";

export function PostContent({ post }: { post: Post }) {
  const { filter } = useSafeMode();
  const { intro, rankings } = parsePost(post);

  return (
    <article>
      <header className="border-b border-line bg-mint">
        <div className="mx-auto w-[min(100%-1.5rem,72rem)] py-14 text-center sm:py-20">
          <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-ink/70 uppercase">
            {post.season} season
          </p>
          <h1 className="italic-shadow font-[family-name:var(--font-display)] text-[clamp(2.6rem,8vw,6.2rem)] leading-[0.92] italic">
            {filter(post.title)}
          </h1>
        </div>
      </header>

      {intro.length > 0 ? (
        <div className="mx-auto w-[min(100%-1.5rem,46rem)] space-y-5 py-12 text-center text-[1.08rem] leading-8 text-ink/90">
          {intro.map((block, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {filter(block)}
            </p>
          ))}
        </div>
      ) : null}

      {rankings.length > 0 ? (
        <div>
          {rankings.map((entry, index) => {
            const photoLeft = index % 2 === 0;
            return (
              <section
                key={`${entry.rank}-${entry.title}`}
                className="overflow-hidden border-t border-line bg-panel px-5 py-10 sm:px-8 md:px-12"
              >
                {entry.image || post.images.length === 0 ? (
                  <RankingPhoto
                    year={post.season}
                    title={entry.title}
                    src={entry.image?.src}
                    alt={filter(entry.image?.alt || entry.title)}
                    photoLeft={photoLeft}
                  />
                ) : null}
                <h2 className="text-center font-[family-name:var(--font-display)] text-3xl leading-[1.12] sm:text-5xl">
                  {filter(`${entry.rank}. ${entry.title}`)}
                </h2>
                {entry.stats.length > 0 ? (
                  <dl className="mt-4 space-y-1 text-center text-[1.12rem] font-semibold leading-7 text-ink sm:text-xl">
                    {entry.stats.map((stat) => (
                      <div key={stat.label}>
                        <dt className="inline">{filter(stat.label)}: </dt>
                        <dd className="inline">{filter(stat.value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div className="mt-6 space-y-4 text-center text-[1.05rem] leading-7 text-ink/90">
                  {entry.body.map((block, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {filter(block)}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto w-[min(100%-1.5rem,46rem)] space-y-5 py-10 text-center text-[1.08rem] leading-8">
          {post.blocks.map((block, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {filter(block)}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}
