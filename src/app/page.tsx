"use client";

import Link from "next/link";
import Image from "next/image";
import { useSafeMode } from "@/components/SafeModeProvider";
import { site } from "@/lib/content";

export default function HomePage() {
  const { filter } = useSafeMode();

  return (
    <div>
      <section className="mx-auto w-[min(100%-1.5rem,72rem)] py-12 sm:py-16">
        <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Live season · 2025</p>
        <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-wide sm:text-7xl">
          {filter(site.tagline)}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{filter(site.subtitle)}</p>
      </section>

      <section className="mx-auto w-[min(100%-1.5rem,72rem)] pb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
            2025 Rankings
          </h2>
          <Link href="/2025" className="text-sm text-accent hover:underline">
            Full season index →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {site.homeCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-accent/40"
            >
              {card.image ? (
                <div className="relative aspect-[16/9] border-b border-line">
                  <Image
                    src={card.image}
                    alt={filter(card.title)}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-end bg-gradient-to-br from-[#243028] to-[#141816] p-5">
                  <span className="font-[family-name:var(--font-display)] text-4xl text-accent/80">
                    {card.season}
                  </span>
                </div>
              )}
              <div className="p-5">
                <h3 className="font-[family-name:var(--font-display)] text-3xl tracking-wide group-hover:text-accent">
                  {filter(card.title)}
                </h3>
                <p className="mt-1 text-sm text-muted">{filter(card.subtitle)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-[min(100%-1.5rem,72rem)] gap-4 py-10 md:grid-cols-2">
        <Link
          href="/2024"
          className="rounded-2xl border border-line bg-bg-elev p-6 transition hover:border-accent/40"
        >
          <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Archive</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-wide">
            2024 Season Recap
          </h2>
          <p className="mt-3 text-muted">{filter(site.seasons["2024"].blurb)}</p>
        </Link>
        <Link
          href="/2023"
          className="rounded-2xl border border-line bg-bg-elev p-6 transition hover:border-accent/40"
        >
          <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Archive</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-wide">
            2023 Season Recap
          </h2>
          <p className="mt-3 text-muted">{filter(site.seasons["2023"].blurb)}</p>
        </Link>
      </section>
    </div>
  );
}
