"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import { usePhotoCrops } from "@/components/PhotoCropsProvider";

const CORNERS = [
  { id: "nw", className: "top-0 left-0 cursor-nwse-resize" },
  { id: "ne", className: "top-0 right-0 cursor-nesw-resize" },
  { id: "sw", className: "bottom-0 left-0 cursor-nesw-resize" },
  { id: "se", className: "bottom-0 right-0 cursor-nwse-resize" },
] as const;

type CroppableImageProps = {
  cropKey: string;
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  activate?: "click" | "button";
  className?: string;
};

export function CroppableImage({
  cropKey,
  src,
  alt,
  sizes,
  priority = false,
  fit = "cover",
  activate = "click",
  className = "",
}: CroppableImageProps) {
  const { activeKey, setActiveKey, getCrop, setCrop } = usePhotoCrops();
  const crop = getCrop(cropKey);
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const boxRef = useRef<HTMLDivElement>(null);
  const active = activeKey === cropKey;
  const drag = useRef<{
    kind: "pan" | "zoom";
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originScale: number;
    centerX: number;
    centerY: number;
    startDist: number;
  } | null>(null);

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setActiveKey(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, setActiveKey]);

  const beginPan = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      kind: "pan",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: crop.x,
      originY: crop.y,
      originScale: crop.scale,
      centerX: 0,
      centerY: 0,
      startDist: 0,
    };
  };

  const beginZoom = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      kind: "zoom",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: crop.x,
      originY: crop.y,
      originScale: crop.scale,
      centerX,
      centerY,
      startDist: Math.hypot(event.clientX - centerX, event.clientY - centerY) || 1,
    };
  };

  const onMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const current = cropRef.current;
    if (drag.current.kind === "pan") {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = ((event.clientX - drag.current.startX) / box.width) * 100;
      const dy = ((event.clientY - drag.current.startY) / box.height) * 100;
      setCrop(cropKey, {
        ...current,
        x: drag.current.originX - dx,
        y: drag.current.originY - dy,
      });
      return;
    }
    const dist = Math.hypot(event.clientX - drag.current.centerX, event.clientY - drag.current.centerY);
    setCrop(cropKey, {
      ...current,
      scale: drag.current.originScale * (dist / drag.current.startDist),
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  const startEditing = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveKey(cropKey);
  };

  return (
    <div
      ref={boxRef}
      className={`croppable-frame absolute inset-0 overflow-hidden bg-[#d8d4cc] select-none ${className}`}
      style={{
        ["--crop-x" as string]: `${crop.x}%`,
        ["--crop-y" as string]: `${crop.y}%`,
        ["--crop-scale" as string]: String(crop.scale),
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        draggable={false}
        className={`${fit === "contain" ? "object-contain" : "object-cover"} pointer-events-none`}
        sizes={sizes}
      />

      {activate === "click" && !active ? (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          aria-label={`Crop ${alt}`}
          onClick={startEditing}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : null}

      {activate === "button" && !active ? (
        <button
          type="button"
          className="absolute top-3 right-3 z-20 min-h-11 min-w-11 rounded-full border border-white/70 bg-ink/70 px-3 text-[0.65rem] font-semibold tracking-[0.16em] text-bg-elev uppercase opacity-90 transition sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Crop ${alt}`}
          onClick={startEditing}
          onPointerDown={(event) => event.stopPropagation()}
        >
          Crop
        </button>
      ) : null}

      {active ? (
        <>
          <div
            className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={beginPan}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          {CORNERS.map((corner) => (
            <button
              key={corner.id}
              type="button"
              aria-label={`Zoom ${alt} from the ${corner.id} corner`}
              className={`absolute z-20 flex h-11 w-11 items-center justify-center touch-none ${corner.className}`}
              onPointerDown={beginZoom}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="h-3.5 w-3.5 border-2 border-bg-elev bg-ink shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" />
            </button>
          ))}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-ink/70 px-3 py-2 text-center text-[0.68rem] font-semibold tracking-[0.14em] text-bg-elev uppercase">
            Drag to move · corners to zoom · Esc when done
          </div>
        </>
      ) : null}
    </div>
  );
}
