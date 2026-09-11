"use client";

import Image from "next/image";
import { useSafeMode } from "@/components/SafeModeProvider";
import type { Post } from "@/lib/content";

export function PostContent({ post }: { post: Post }) {
  const { filter } = useSafeMode();
  const hero = post.images[0];
  const gallery = post.images.slice(1, 9);

  return (
    <article className="mx-auto w-[min(100%-1.5rem,48rem)] py-10">
      <p className="mb-3 text-xs font-bold tracking-[0.18em] text-accent uppercase">
        {post.season} season
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-wide text-ink sm:text-6xl">
        {filter(post.title)}
      </h1>

      {hero ? (
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-panel">
                  <Image
                    src={hero.src}
                    alt={filter(hero.alt || post.title)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
        </div>
      ) : null}

      <div className="mt-8 space-y-5 text-[1.05rem] leading-7 text-[#d9d4c8]">
        {post.blocks.map((block, i) => {
          const text = filter(block);
          const isRankHeader = /^\d+\.\s/.test(block.trim()) || /^#?\d+\s/.test(block.trim());
          if (isRankHeader) {
            return (
              <h2
                key={i}
                className="pt-4 font-[family-name:var(--font-display)] text-2xl tracking-wide text-accent sm:text-3xl"
              >
                {text}
              </h2>
            );
          }
          return (
            <p key={i} className="whitespace-pre-wrap">
              {text}
            </p>
          );
        })}
      </div>

      {gallery.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square overflow-hidden rounded-xl border border-line bg-panel"
            >
              <Image
                src={img.src}
                alt={filter(img.alt)}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
