"use client";

import { MatchRing } from "@/components/ui/MatchRing";
import { useResume, resumeScore } from "@/lib/resume";

/** Profile strength from the resume the person actually built (0 until they start). */
export function ProfileStrengthRing() {
  const { saved } = useResume();
  return <MatchRing value={saved ? resumeScore(saved) : 0} label="strength" size={64} />;
}
