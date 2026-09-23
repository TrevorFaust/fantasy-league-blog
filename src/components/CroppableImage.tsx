"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import { usePhotoCrops } from "@/components/PhotoCropsProvider";

const CORNERS = [
  { id: "nw", className: "top-1 left-1", cursor: "nwse-resize" },
  { id: "ne", className: "top-1 right-1", cursor: "nesw-resize" },
  { id: "sw", className: "bottom-10 left-1", cursor: "nesw-resize" },
  { id: "se", className: "bottom-10 right-1", cursor: "nwse-resize" },
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
    startDist: number;
  } | null>(null);

  useEffect(() => {
    if (!active) return;

    const onMove = (event: PointerEvent) => {
      const session = drag.current;
      if (!session || session.pointerId !== event.pointerId) return;
      event.preventDefault();
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const current = cropRef.current;
      if (session.kind === "pan") {
        const dx = ((event.clientX - session.startX) / box.width) * 100;
        const dy = ((event.clientY - session.startY) / box.height) * 100;
        setCrop(cropKey, {
          ...current,
          x: session.originX - dx,
          y: session.originY - dy,
        });
        return;
      }
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      const dist = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      setCrop(cropKey, {
        ...current,
        scale: session.originScale + (dist - session.startDist) / 140,
      });
    };

    const onUp = (event: PointerEvent) => {
      if (drag.current?.pointerId === event.pointerId) drag.current = null;
    };

    const onDownOutside = (event: PointerEvent) => {
      if (drag.current) return;
      if (!boxRef.current?.contains(event.target as Node)) setActiveKey(null);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("pointerdown", onDownOutside);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerdown", onDownOutside);
    };
  }, [active, cropKey, setActiveKey, setCrop]);

  const beginPan = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      kind: "pan",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: crop.x,
      originY: crop.y,
      originScale: crop.scale,
      startDist: 1,
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
      startDist: Math.hypot(event.clientX - centerX, event.clientY - centerY) || 1,
    };
  };

  const nudgeZoom = (event: SyntheticEvent, amount: number) => {
    event.preventDefault();
    event.stopPropagation();
    setCrop(cropKey, { ...cropRef.current, scale: cropRef.current.scale + amount });
  };

  const startEditing = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveKey(cropKey);
  };

  const blockLink = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={boxRef}
      className={`croppable-frame absolute inset-0 overflow-hidden bg-[#d8d4cc] select-none ${
        active ? "z-20" : "pointer-events-none"
      } ${className}`}
      onClick={active ? blockLink : undefined}
      onPointerDown={active ? blockLink : undefined}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${crop.scale})`,
          transformOrigin: "center center",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          draggable={false}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} pointer-events-none`}
          style={{ objectPosition: `${crop.x}% ${crop.y}%` }}
          sizes={sizes}
        />
      </div>

      {activate === "click" && !active ? (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer bg-transparent pointer-events-auto"
          aria-label={`Crop ${alt}`}
          onClick={startEditing}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : null}

      {activate === "button" && !active ? (
        <button
          type="button"
          className="pointer-events-auto absolute top-3 right-3 z-30 min-h-11 rounded-full border border-white/70 bg-ink/75 px-3 text-[0.65rem] font-semibold tracking-[0.16em] text-bg-elev uppercase"
          aria-label={`Crop ${alt}`}
          onClick={startEditing}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          Crop
        </button>
      ) : null}

      {active ? (
        <>
          <div
            className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={beginPan}
          />
          {CORNERS.map((corner) => (
            <button
              key={corner.id}
              type="button"
              aria-label={`Zoom ${alt} from the ${corner.id} corner`}
              className={`absolute z-30 flex h-12 w-12 items-center justify-center touch-none ${corner.className}`}
              style={{ cursor: corner.cursor }}
              onPointerDown={beginZoom}
              onClick={blockLink}
            >
              <span
                aria-hidden
                className={`block h-5 w-5 border-bg-elev ${
                  corner.id === "nw"
                    ? "border-t-4 border-l-4"
                    : corner.id === "ne"
                      ? "border-t-4 border-r-4"
                      : corner.id === "sw"
                        ? "border-b-4 border-l-4"
                        : "border-b-4 border-r-4"
                } shadow-[0_0_0_1px_rgba(0,0,0,0.45)]`}
              />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 bg-ink/80 px-3 py-2">
            <button
              type="button"
              className="min-h-11 min-w-11 rounded-full border border-white/40 text-lg leading-none text-bg-elev"
              aria-label={`Zoom out ${alt}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => nudgeZoom(event, -0.12)}
            >
              −
            </button>
            <p className="pointer-events-none text-center text-[0.62rem] font-semibold tracking-[0.14em] text-bg-elev uppercase">
              Drag to move · corners or −/+ to zoom
            </p>
            <button
              type="button"
              className="min-h-11 min-w-11 rounded-full border border-white/40 text-lg leading-none text-bg-elev"
              aria-label={`Zoom in ${alt}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => nudgeZoom(event, 0.12)}
            >
              +
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
