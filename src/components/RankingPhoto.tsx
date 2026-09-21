"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePhotoCrops } from "@/components/PhotoCropsProvider";
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
  const { editing, getCrop, setCrop } = usePhotoCrops();
  const key = cropKey(year, personKey(title, alt));
  const crop = getCrop(key);
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const pulledBack = rankingPhotoFit(title, alt) === "contain";
  const canEdit = Boolean(src) && editing;
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !canEdit) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const current = cropRef.current;
      setCrop(key, {
        ...current,
        scale: current.scale + (event.deltaY < 0 ? 0.06 : -0.06),
      });
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [canEdit, key, setCrop]);

  return (
    <div
      ref={boxRef}
      className={`ranking-photo-frame relative mb-5 w-full overflow-hidden bg-[#d8d4cc] select-none ${
        pulledBack ? "aspect-[4/5]" : "aspect-[3/4]"
      } sm:mb-5 sm:w-[min(60%,38rem)] ${
        photoLeft ? "sm:float-left sm:mr-8" : "sm:float-right sm:ml-8"
      } ${canEdit ? "cursor-grab touch-none ring-2 ring-ink/25 ring-offset-2 ring-offset-panel active:cursor-grabbing" : ""}`}
      style={{
        ["--crop-x" as string]: `${crop.x}%`,
        ["--crop-y" as string]: `${crop.y}%`,
        ["--crop-scale" as string]: String(crop.scale),
      }}
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit ? 0 : undefined}
      aria-label={canEdit ? `Reframe ${title} for ${year}` : undefined}
      onPointerDown={(event) => {
        if (!canEdit) return;
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: crop.x,
          originY: crop.y,
        };
      }}
      onPointerMove={(event) => {
        if (!canEdit || !drag.current || drag.current.pointerId !== event.pointerId) return;
        const box = event.currentTarget.getBoundingClientRect();
        const dx = ((event.clientX - drag.current.startX) / box.width) * 100;
        const dy = ((event.clientY - drag.current.startY) / box.height) * 100;
        setCrop(key, {
          ...cropRef.current,
          x: drag.current.originX - dx,
          y: drag.current.originY - dy,
        });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onKeyDown={(event) => {
        if (!canEdit) return;
        const step = event.shiftKey ? 5 : 2;
        const current = cropRef.current;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setCrop(key, { ...current, x: current.x - step });
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          setCrop(key, { ...current, x: current.x + step });
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setCrop(key, { ...current, y: current.y - step });
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setCrop(key, { ...current, y: current.y + step });
        } else if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          setCrop(key, { ...current, scale: current.scale + 0.1 });
        } else if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          setCrop(key, { ...current, scale: current.scale - 0.1 });
        }
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          className={`${pulledBack ? "object-contain p-3 sm:p-4" : "object-cover"} ${canEdit ? "pointer-events-none" : ""}`}
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold tracking-[0.16em] text-ink/45 uppercase">
          Photo coming soon
        </div>
      )}
      {canEdit ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/70 px-3 py-2 text-center text-[0.68rem] font-semibold tracking-[0.14em] text-bg-elev uppercase">
          Drag to reframe · scroll to zoom · {year} only
        </div>
      ) : null}
    </div>
  );
}
