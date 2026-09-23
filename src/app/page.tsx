"use client";

import Link from "next/link";
import Image from "next/image";
import { CroppableImage } from "@/components/CroppableImage";
import { usePhotoCrops } from "@/components/PhotoCropsProvider";
import { useSafeMode } from "@/components/SafeModeProvider";
import { getHomeCards, MARBLE } from "@/lib/covers";
import { coverCropKey } from "@/lib/photo-crops";

const HOME_CARDS = getHomeCards();

export default function HomePage() {
  const { filter } = useSafeMode();
  const { activeKey } = usePhotoCrops();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <Image
          src={MARBLE}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="relative mx-auto flex min-h-[58vh] w-[min(100%-1.5rem,72rem)] flex-col items-center justify-center px-2 py-16 text-center sm:min-h-[70vh]">
          <h1 className="outline-title font-[family-name:var(--font-display)] text-[clamp(1.85rem,6.4vw,4.6rem)] leading-[0.95] font-bold tracking-[0.06em] uppercase">
            {filter("Welcome to the Biggest Shitshow on the West Coast")}
          </h1>
          <p className="mt-8 max-w-3xl text-[0.72rem] font-semibold tracking-[0.18em] text-ink/80 uppercase sm:text-xs">
            {filter(
              "The Seattle Seacocks Practice Squad's Ranking page Brought to you by your wonderful Commissioner, big dawg, little hog, Trevor Faust",
            )}
          </p>
        </div>
      </section>

      <section>
        {HOME_CARDS.map((card, index) => {
          const photoRight = index % 2 === 1;
          const key = coverCropKey(card.href);
          const cropping = activeKey === key;
          return (
            <article
              key={card.href}
              className="group grid min-h-[64vh] overflow-hidden border-b border-line bg-bg-elev sm:min-h-[72vh] sm:grid-cols-2"
            >
              <div
                className={`relative min-h-[42vh] bg-[#d8d4cc] sm:min-h-[72vh] ${
                  photoRight ? "sm:order-2" : "sm:order-1"
                }`}
              >
                {card.image ? (
                  <CroppableImage
                    cropKey={key}
                    src={card.image}
                    alt={filter(card.title)}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={index === 0}
                    activate="button"
                  />
                ) : null}
                <Link
                  href={card.href}
                  className={`absolute inset-0 z-[5] ${cropping ? "pointer-events-none" : ""}`}
                  aria-label={filter(card.title)}
                  tabIndex={cropping ? -1 : undefined}
                  onClick={(event) => {
                    if (cropping) event.preventDefault();
                  }}
                />
              </div>
              <Link
                href={card.href}
                className={`flex flex-col justify-center bg-bg-elev px-8 py-12 sm:px-12 md:px-16 ${
                  photoRight ? "sm:order-1" : "sm:order-2"
                }`}
              >
                <h2 className="italic-shadow font-[family-name:var(--font-display)] text-4xl leading-[0.95] italic sm:text-6xl">
                  {filter(card.title)}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
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
