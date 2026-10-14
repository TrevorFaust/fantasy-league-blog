import Image from "next/image";
import type { ReactNode } from "react";
import { MARBLE } from "@/lib/covers";

export function MarbleBanner({
  children,
  className = "",
  priority = false,
}: {
  children: ReactNode;
  className?: string;
  priority?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden border-b border-gold-soft/25 bg-accent ${className}`}
    >
      <Image
        src={MARBLE}
        alt=""
        fill
        priority={priority}
        className="object-cover opacity-55 mix-blend-overlay contrast-110"
        sizes="100vw"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(26,48,38,0.35)_0%,rgba(47,93,74,0.22)_50%,rgba(90,76,36,0.28)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,178,122,0.14),transparent_55%)]"
      />
      <div className="relative">{children}</div>
    </section>
  );
}
