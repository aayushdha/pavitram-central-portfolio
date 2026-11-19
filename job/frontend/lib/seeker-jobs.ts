"use client";

import { useLocalStorage } from "./use-local-storage";
import { savedJobs } from "./data";

const SAVED_KEY = "jobportal_seeker_saved_jobs";
const APPLIED_KEY = "jobportal_seeker_applications";

export type AppliedJob = {
  jobId: string;
  title: string;
  company: string;
  resume: string;
  note: string;
  date: string; // e.g. "30 Sep"
};

/** Jobs the seeker bookmarked (kept in this browser). */
export function useSavedJobs() {
  const [stored, write] = useLocalStorage<string[]>(SAVED_KEY);
  const saved = stored ?? savedJobs.map((j) => j.id);
  return {
    saved,
    isSaved: (id: string) => saved.includes(id),
    toggle: (id: string) => write(saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]),
  };
}

/** Applications submitted from this browser. */
export function useAppliedJobs() {
  const [stored, write] = useLocalStorage<AppliedJob[]>(APPLIED_KEY);
  const applied = stored ?? [];
  return {
    applied,
    hasApplied: (jobId: string) => applied.some((a) => a.jobId === jobId),
    apply: (a: Omit<AppliedJob, "date">) =>
      write([
        { ...a, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) },
        ...applied,
      ]),
  };
}
