"use client";

import Link from "next/link";
import Image from "next/image";
import { useSafeMode } from "@/components/SafeModeProvider";

export function SiteHeader() {
  const { safe, setSafe } = useSafeMode();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-mint/80 backdrop-blur-md">
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

        <nav className="flex items-center gap-3 sm:gap-5">
          <Link className="text-sm text-muted hover:text-accent" href="/2026">
            2026
          </Link>
          <Link className="hidden text-sm text-muted hover:text-accent sm:inline" href="/2025">
            2025
          </Link>
          <Link className="hidden text-sm text-muted hover:text-accent sm:inline" href="/2024">
            2024
          </Link>
          <Link className="hidden text-sm text-muted hover:text-accent sm:inline" href="/2023">
            2023
          </Link>
          <button
            type="button"
            onClick={() => setSafe(!safe)}
            className={`min-h-11 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
              safe
                ? "border-accent bg-accent text-panel"
                : "border-line bg-panel text-muted hover:text-ink"
            }`}
            title="Censor swears for work / family browsing. Also works with ?safe=1"
          >
            {safe ? "Safe mode on" : "Safe mode"}
          </button>
        </nav>
      </div>
    </header>
  );
}
