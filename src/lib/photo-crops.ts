export type PhotoCrop = {
  x: number;
  y: number;
  scale: number;
};

export type PhotoCropMap = Record<string, PhotoCrop>;

export const DEFAULT_CROP: PhotoCrop = { x: 50, y: 50, scale: 1 };

export function cropKey(year: number, name: string) {
  return `${year}:${name}`;
}

export function coverCropKey(href: string) {
  return `cover:${href}`;
}

export function clampCrop(crop: PhotoCrop): PhotoCrop {
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    x: round(Math.min(100, Math.max(0, crop.x))),
    y: round(Math.min(100, Math.max(0, crop.y))),
    scale: round(Math.min(3, Math.max(0.6, crop.scale))),
  };
}
