"use client";

import Link from "next/link";
import { CroppableImage } from "@/components/CroppableImage";
import { MarbleBanner } from "@/components/MarbleBanner";
import { usePhotoCrops } from "@/components/PhotoCropsProvider";
import { useSafeMode } from "@/components/SafeModeProvider";
import { getHomeCards } from "@/lib/covers";
import { coverCropKey } from "@/lib/photo-crops";

const HOME_CARDS = getHomeCards();

export default function HomePage() {
  const { filter } = useSafeMode();
  const { activeKey } = usePhotoCrops();

  return (
    <div>
      <MarbleBanner priority>
        <div className="mx-auto flex min-h-[62vh] w-[min(100%-1.5rem,72rem)] flex-col items-center justify-center px-2 py-20 text-center sm:min-h-[74vh] sm:px-6 sm:py-24">
          <p className="banner-kicker">Practice Squad Rankings</p>
          <span aria-hidden className="rule-gold mt-6 mb-7" />
          <h1 className="banner-title font-[family-name:var(--font-display)] text-[clamp(1.85rem,6.4vw,4.6rem)] leading-[0.95] font-bold tracking-[0.06em] uppercase">
            {filter("Welcome to the Biggest Shitshow on the West Coast")}
          </h1>
          <span aria-hidden className="rule-gold mt-8 mb-7" />
          <p className="banner-copy max-w-2xl text-[0.72rem] font-semibold tracking-[0.2em] uppercase sm:text-xs">
            {filter(
              "The Seattle Seacocks Practice Squad's Ranking page Brought to you by your wonderful Commissioner, big dawg, little hog, Trevor Faust",
            )}
          </p>
        </div>
      </MarbleBanner>

      <section>
        {HOME_CARDS.map((card, index) => {
          const photoRight = index % 2 === 0;
          const key = coverCropKey(card.href);
          const cropping = activeKey === key;
          const year = card.href.split("/").filter(Boolean)[0];
          const isRecap = card.href.split("/").filter(Boolean).length === 1;
          return (
            <article
              key={card.href}
              className="group grid min-h-[64vh] overflow-hidden border-b border-line bg-panel sm:min-h-[72vh] sm:grid-cols-2"
            >
              <div
                className={`relative min-h-[42vh] bg-matte sm:min-h-[72vh] ${
                  photoRight ? "sm:order-2" : "sm:order-1"
                }`}
              >
                {card.image ? (
                  <CroppableImage
                    cropKey={key}
                    src={card.image}
                    alt={filter(card.title).replace(/\n/g, " ")}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={index === 0}
                    activate="button"
                  />
                ) : null}
                <Link
                  href={card.href}
                  className={`absolute inset-0 z-[5] ${cropping ? "pointer-events-none" : ""}`}
                  aria-label={filter(card.title).replace(/\n/g, " ")}
                  tabIndex={cropping ? -1 : undefined}
                  onClick={(event) => {
                    if (cropping) event.preventDefault();
                  }}
                />
              </div>
              <Link
                href={card.href}
                className={`flex flex-col justify-center px-8 py-14 sm:px-12 md:px-16 ${
                  photoRight ? "sm:order-1" : "sm:order-2"
                }`}
              >
                <p className="text-[0.68rem] font-semibold tracking-[0.32em] text-gold uppercase">
                  {isRecap ? "Season recap" : `${year} installment`}
                </p>
                <h2 className="italic-shadow mt-4 font-[family-name:var(--font-display)] text-4xl leading-[0.95] italic sm:text-6xl">
                  {filter(card.title)
                    .split("\n")
                    .map((line, lineIndex) => (
                      <span
                        key={lineIndex}
                        className={lineIndex > 0 ? "mt-4 block text-xl leading-snug sm:text-2xl" : "block"}
                      >
                        {line}
                      </span>
                    ))}
                </h2>
                <span aria-hidden className="mt-6 h-px w-12 bg-gold/45" />
                <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
                  {filter(card.blurb)}
                </p>
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
