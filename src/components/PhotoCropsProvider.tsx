"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clampCrop,
  DEFAULT_CROP,
  type PhotoCrop,
  type PhotoCropMap,
} from "@/lib/photo-crops";

type PhotoCropsContextValue = {
  activeKey: string | null;
  setActiveKey: (key: string | null) => void;
  getCrop: (key: string) => PhotoCrop;
  setCrop: (key: string, crop: PhotoCrop) => void;
};

const PhotoCropsContext = createContext<PhotoCropsContextValue | null>(null);
const STORAGE_KEY = "psq-photo-crops";

function readLocal(): PhotoCropMap {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as PhotoCropMap;
  } catch {
    return {};
  }
}

function writeLocal(crops: PhotoCropMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
}

export function PhotoCropsProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [crops, setCrops] = useState<PhotoCropMap>({});
  const [ready, setReady] = useState(false);
  const cropsRef = useRef<PhotoCropMap>({});
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const local = readLocal();
    cropsRef.current = local;
    setCrops(local);
    setReady(true);

    void fetch("/api/photo-crops")
      .then((res) => res.json())
      .then((remote: PhotoCropMap) => {
        setCrops((prev) => {
          const next = { ...remote, ...prev };
          cropsRef.current = next;
          writeLocal(next);
          return next;
        });
      })
      .catch(() => {
        /* keep local crops if the file has not been saved yet */
      });
  }, []);

  useEffect(() => {
    if (!activeKey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveKey(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeKey]);

  const persist = useCallback((key: string, crop: PhotoCrop) => {
    window.clearTimeout(timers.current[key]);
    timers.current[key] = window.setTimeout(() => {
      void fetch("/api/photo-crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, crop }),
      });
    }, 500);
  }, []);

  const getCrop = useCallback(
    (key: string) => (ready ? (crops[key] ?? DEFAULT_CROP) : DEFAULT_CROP),
    [crops, ready],
  );

  const setCrop = useCallback(
    (key: string, next: PhotoCrop) => {
      const crop = clampCrop(next);
      setCrops((prev) => {
        const updated = { ...prev, [key]: crop };
        cropsRef.current = updated;
        writeLocal(updated);
        return updated;
      });
      persist(key, crop);
    },
    [persist],
  );

  const value = useMemo(
    () => ({ activeKey, setActiveKey, getCrop, setCrop }),
    [activeKey, getCrop, setCrop],
  );

  return <PhotoCropsContext.Provider value={value}>{children}</PhotoCropsContext.Provider>;
}

export function usePhotoCrops() {
  const ctx = useContext(PhotoCropsContext);
  if (!ctx) throw new Error("usePhotoCrops must be used within PhotoCropsProvider");
  return ctx;
}
