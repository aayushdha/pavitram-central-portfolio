"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiRequestError } from "../auth/types";

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Optimistic/local updates without waiting for a full reload. */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Fetches `fetcher()` on mount and whenever `deps` change. Used by every
 * dashboard page to replace what used to be a static import from
 * `lib/mock-data.ts` with a real call into this project's backend.
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the async fetch this hook exists to perform
    setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken, ...deps]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return { data, loading, error, reload, setData };
}
