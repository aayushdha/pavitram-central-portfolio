"use client";

import { useLocalStorage } from "./use-local-storage";

const PLAN_KEY = "jobportal_seeker_plan";

/**
 * Tracks the seeker's chosen plan in this browser.
 * There's no billing backend yet, so this is a local demo of the upgrade flow.
 */
export function usePlan() {
  const [stored, write] = useLocalStorage<string>(PLAN_KEY);
  return { plan: stored ?? "Basic", setPlan: (name: string) => write(name) };
}
