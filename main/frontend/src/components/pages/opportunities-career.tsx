"use client";

import { OppDetailPage, type OppDetail } from "@/lib/opp-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiOpportunity } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Opportunities. */
const DEFAULT_DATA: OppDetail = {
  slug: "career",
  title: "As a Career",
  hindi: "करियर के रूप में",
  label: "Career",
  Icon: getIcon("Briefcase"),
  intro: "Connect with dignified and organized employment opportunities tailored perfectly to your qualifications and skills. Pavitram Rozgar pairs talent with the right roles inside a values-driven network.",
  benefits: ["Employment according to qualification and interest", "Dignified and organized work culture", "Skill development and awareness", "Mentorship from senior associates"],
  steps: [
      { title: "Sign up", body: "Share your skills, experience and interests." },
      { title: "Match", body: "Get matched to roles inside the network." },
      { title: "Grow", body: "Learn, earn and progress with mentorship." },
    ],
};

function mapApiToDetail(data: ApiOpportunity): OppDetail {
  return {
    slug: data.slug as OppDetail["slug"],
    title: data.title,
    hindi: data.hindi,
    label: data.label,
    Icon: getIcon(data.icon),
    intro: data.intro,
    benefits: data.benefits,
    steps: data.steps,
  };
}

export default function OpportunitiesCareerPage({ data }: { data?: ApiOpportunity | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <OppDetailPage d={d} />;
}
