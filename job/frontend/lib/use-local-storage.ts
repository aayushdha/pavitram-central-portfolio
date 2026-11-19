"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
// In-memory copy so the UI still updates when localStorage is full/blocked.
const memory = new Map<string, string>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readRaw(key: string): string | null {
  const inMemory = memory.get(key);
  if (inMemory !== undefined) return inMemory;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Reads a JSON value from localStorage without setState-in-effect.
 * Returns `null` on the server and on first hydration render, so callers
 * should fall back to a default: `const data = stored ?? defaults`.
 */
export function useLocalStorage<T>(key: string): [T | null, (value: T) => boolean] {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null
  );

  const value = useMemo<T | null>(() => {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);

  const write = useCallback(
    (next: T) => {
      const json = JSON.stringify(next);
      memory.set(key, json);
      let persisted = true;
      try {
        localStorage.setItem(key, json);
      } catch {
        persisted = false; // still shown in this session, just not remembered
      }
      listeners.forEach((l) => l());
      return persisted;
    },
    [key]
  );

  return [value, write];
}
