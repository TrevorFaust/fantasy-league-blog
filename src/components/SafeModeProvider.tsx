"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applySafeMode } from "@/lib/safe-mode";

type SafeModeContextValue = {
  safe: boolean;
  setSafe: (value: boolean) => void;
  filter: (text: string) => string;
};

const SafeModeContext = createContext<SafeModeContextValue | null>(null);
const STORAGE_KEY = "psq-safe-mode";

export function SafeModeProvider({ children }: { children: ReactNode }) {
  const [safe, setSafeState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "1") setSafeState(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("safe") === "1") setSafeState(true);
    setReady(true);
  }, []);

  const setSafe = useCallback((value: boolean) => {
    setSafeState(value);
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }, []);

  const filter = useCallback((text: string) => applySafeMode(text, safe), [safe]);

  const value = useMemo(
    () => ({ safe, setSafe, filter }),
    [safe, setSafe, filter],
  );

  if (!ready) {
    return <SafeModeContext.Provider value={value}>{children}</SafeModeContext.Provider>;
  }

  return <SafeModeContext.Provider value={value}>{children}</SafeModeContext.Provider>;
}

export function useSafeMode() {
  const ctx = useContext(SafeModeContext);
  if (!ctx) throw new Error("useSafeMode must be used within SafeModeProvider");
  return ctx;
}
