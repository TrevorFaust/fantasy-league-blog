"use client";

import Link from "next/link";
import { CroppableImage } from "@/components/CroppableImage";
import { usePhotoCrops } from "@/components/PhotoCropsProvider";
import { useSafeMode } from "@/components/SafeModeProvider";
import type { Season } from "@/lib/content";
import { HOME_COVERS, HOME_RECAPS, HUB_COVERS } from "@/lib/covers";
import { coverCropKey } from "@/lib/photo-crops";

function coverFor(href: string) {
  return HUB_COVERS[href] ?? HOME_COVERS[href];
}

function recapCopy(season: Season) {
  const recap = HOME_RECAPS.find((item) => item.year === String(season.year));
  return {
    title: recap?.title ?? season.title,
    blurb: recap?.blurb ?? season.blurb,
  };
}

export function SeasonHub({ season }: { season: Season }) {
  const { filter } = useSafeMode();
  const { activeKey } = usePhotoCrops();
  const { title, blurb } = recapCopy(season);

  return (
    <div>
      <section className="relative border-b border-line bg-mint">
        <div className="relative mx-auto flex w-[min(100%-1.5rem,44rem)] flex-col items-center px-2 py-16 text-center sm:py-20">
          <p className="text-[0.68rem] font-semibold tracking-[0.32em] text-ink/55 uppercase">
            {HOME_RECAPS.some((recap) => recap.year === String(season.year))
              ? "Season recap"
              : "Current season"}
          </p>
          <div className="relative mt-4 px-3 pb-3">
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] font-[family-name:var(--font-display)] text-[min(28vw,8.5rem)] leading-none font-bold text-ink/[0.06] italic select-none"
            >
              {season.year}
            </span>
            <h1 className="italic-shadow relative font-[family-name:var(--font-display)] text-[clamp(2.85rem,8.4vw,5.8rem)] leading-[1.12] italic">
              {filter(title)}
            </h1>
          </div>
          <span className="mt-5 h-px w-14 bg-ink/20" />
          <p className="mt-7 max-w-xl text-[1.05rem] leading-8 text-ink/80">
            {filter(blurb)}
          </p>
        </div>
      </section>

      <ol className="divide-y divide-line bg-bg">
        {season.posts.map((post, index) => {
          const href = `/${post.season}/${post.slug}`;
          const image = coverFor(href);
          const photoRight = index % 2 === 1;
          const key = coverCropKey(href);
          const cropping = activeKey === key;
          return (
            <li key={post.slug}>
              <div className="group grid items-stretch bg-bg sm:grid-cols-2">
                <div
                  className={`relative flex aspect-[16/10] items-center justify-center bg-bg ${
                    photoRight ? "sm:order-2" : "sm:order-1"
                  }`}
                >
                  {image ? (
                    <CroppableImage
                      cropKey={key}
                      src={image}
                      alt={filter(post.hubLabel)}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      activate="button"
                    />
                  ) : null}
                  <Link
                    href={href}
                    className={`absolute inset-0 z-[5] ${cropping ? "pointer-events-none" : ""}`}
                    aria-label={filter(post.hubLabel)}
                    tabIndex={cropping ? -1 : undefined}
                    onClick={(event) => {
                      if (cropping) event.preventDefault();
                    }}
                  />
                </div>
                <Link
                  href={href}
                  className={`flex flex-col items-center justify-center bg-bg px-8 py-10 text-center ${
                    photoRight ? "sm:order-1" : "sm:order-2"
                  }`}
                >
                  <h2 className="font-[family-name:var(--font-display)] text-4xl italic group-hover:underline">
                    {filter(post.hubLabel)}
                  </h2>
                  <p className="mt-2 text-muted">{filter(post.title)}</p>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
