"use client";

import Link from "next/link";
import { useSafeMode } from "@/components/SafeModeProvider";
import { site } from "@/lib/content";

export function SiteHeader() {
  const { safe, setSafe, filter } = useSafeMode();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex w-[min(100%-1.5rem,72rem)] items-center justify-between gap-3 py-3">
        <Link href="/" className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-lg tracking-wide text-accent sm:text-xl">
            {filter(site.name)}
          </div>
          <div className="truncate text-xs text-muted">{filter(site.tagline)}</div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link className="hidden text-sm text-muted hover:text-ink sm:inline" href="/2025">
            2025
          </Link>
          <Link className="hidden text-sm text-muted hover:text-ink sm:inline" href="/2024">
            2024
          </Link>
          <Link className="hidden text-sm text-muted hover:text-ink sm:inline" href="/2023">
            2023
          </Link>
          <button
            type="button"
            onClick={() => setSafe(!safe)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
              safe
                ? "border-accent bg-accent text-bg"
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
