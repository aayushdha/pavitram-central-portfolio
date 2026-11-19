"use client";

import { useEffect, useState } from "react";

const KEY = "pavitram:recently-viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setIds(raw ? JSON.parse(raw) : []);
    } catch {
      setIds([]);
    }
  }, []);

  return ids;
}

export function trackPropertyView(id: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const next = [id, ...existing.filter((x) => x !== id)].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing etc.) — silently skip
  }
}
