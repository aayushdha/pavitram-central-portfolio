"use client";

import { OppDetailPage, type OppDetail } from "@/lib/opp-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiOpportunity } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Opportunities. */
const DEFAULT_DATA: OppDetail = {
  slug: "consumer",
  title: "As a Consumer",
  hindi: "उपभोक्ता के रूप में",
  label: "Consumer",
  Icon: getIcon("User"),
  intro: "Access high-quality, ethically sourced products and services at fair cooperative prices. Become part of a network that puts member needs ahead of margins, with transparent pricing and verified quality at every step.",
  benefits: ["Access to daily needs and essential services", "Significant reduction in expenses", "Cooperative community support", "Verified suppliers and ethical sourcing"],
  steps: [
      { title: "Register", body: "Create your Pavitram member profile in minutes." },
      { title: "Explore", body: "Browse cooperative services across 12 categories." },
      { title: "Save & contribute", body: "Reduce expenses while supporting the network." },
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

export default function OpportunitiesConsumerPage({ data }: { data?: ApiOpportunity | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <OppDetailPage d={d} />;
}
