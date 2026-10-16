"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSafeMode } from "@/components/SafeModeProvider";

const YEARS = ["2026", "2025", "2024", "2023"] as const;

const canToggleSafe = process.env.NODE_ENV === "development";

export function SiteHeader() {
  const { safe, setSafe } = useSafeMode();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-panel/92 backdrop-blur-md">
      <div className="mx-auto flex w-[min(100%-1.5rem,72rem)] flex-wrap items-center justify-between gap-3 py-2">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center rounded-sm outline-offset-4 transition hover:opacity-80"
        >
          <Image
            src="/seattle-seacocks.png"
            alt="Seattle Seacocks home"
            width={716}
            height={850}
            className="h-12 w-auto sm:h-14"
            sizes="56px"
            priority
          />
        </Link>

        <nav aria-label="Seasons" className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-5">
          {YEARS.map((year) => {
            const active = pathname === `/${year}` || pathname.startsWith(`/${year}/`);
            return (
              <Link
                key={year}
                href={`/${year}`}
                className={`inline-flex min-h-11 items-center text-sm tracking-wide ${
                  active
                    ? "font-semibold text-accent underline decoration-gold decoration-2 underline-offset-6"
                    : "text-muted hover:text-accent"
                }`}
              >
                {year}
              </Link>
            );
          })}
          {canToggleSafe ? (
            <button
              type="button"
              onClick={() => setSafe(!safe)}
              className={`min-h-11 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
                safe
                  ? "border-accent bg-accent text-cream"
                  : "border-line bg-bg-elev text-muted hover:text-ink"
              }`}
              title="Preview the censored wording on this computer. League mates do not get this switch."
            >
              {safe ? "Safe mode on" : "Safe mode"}
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
