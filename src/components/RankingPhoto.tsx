"use client";

import { CroppableImage } from "@/components/CroppableImage";
import { cropKey } from "@/lib/photo-crops";
import { personKey, rankingPhotoFit } from "@/lib/rankings";

type RankingPhotoProps = {
  year: number;
  title: string;
  src?: string;
  alt: string;
  photoLeft: boolean;
};

export function RankingPhoto({ year, title, src, alt, photoLeft }: RankingPhotoProps) {
  const pulledBack = rankingPhotoFit(title, alt) === "contain";
  const key = cropKey(year, personKey(title, alt));

  return (
    <div
      className={`relative mb-5 w-full overflow-hidden bg-[#d8d4cc] ${
        pulledBack ? "aspect-[4/5]" : "aspect-[3/4]"
      } sm:mb-5 sm:w-[min(60%,38rem)] ${
        photoLeft ? "sm:float-left sm:mr-8" : "sm:float-right sm:ml-8"
      }`}
    >
      {src ? (
        <CroppableImage
          cropKey={key}
          src={src}
          alt={alt}
          fit={pulledBack ? "contain" : "cover"}
          activate="click"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold tracking-[0.16em] text-ink/45 uppercase">
          Photo coming soon
        </div>
      )}
    </div>
  );
}
