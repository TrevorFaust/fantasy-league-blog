"use client";

import { CroppableImage } from "@/components/CroppableImage";
import { cropKey } from "@/lib/photo-crops";
import { personKey, rankingPhotoFit } from "@/lib/rankings";

type RankingPhotoProps = {
  year: number;
  title: string;
  src?: string;
  alt: string;
};

export function RankingPhoto({ year, title, src, alt }: RankingPhotoProps) {
  const pulledBack = rankingPhotoFit(title, alt) === "contain";
  const key = cropKey(year, personKey(title, alt));

  return (
    <div className="absolute inset-0 overflow-hidden bg-matte">
      {src ? (
        <CroppableImage
          cropKey={key}
          src={src}
          alt={alt}
          fit={pulledBack ? "contain" : "cover"}
          activate="click"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold tracking-[0.16em] text-ink/45 uppercase">
          Photo coming soon
        </div>
      )}
    </div>
  );
}
