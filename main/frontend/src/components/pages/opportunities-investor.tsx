"use client";

import { OppDetailPage, type OppDetail } from "@/lib/opp-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiOpportunity } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Opportunities. */
const DEFAULT_DATA: OppDetail = {
  slug: "investor",
  title: "As an Investor",
  hindi: "निवेश के रूप में",
  label: "Investor",
  Icon: getIcon("TrendingUp"),
  intro: "Invest in community-driven projects with transparent returns and a focus on collective growth. Every project is backed by clear ownership, audited reporting, and shared upside with the community.",
  benefits: ["12%+ target cooperative annual return", "Transparent funding and ownership model", "Community-driven real estate & projects", "Quarterly performance reporting"],
  steps: [
      { title: "Qualify", body: "Complete a brief investor profile and KYC." },
      { title: "Choose", body: "Review and select community-backed projects." },
      { title: "Earn & impact", body: "Receive returns while creating real impact." },
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

export default function OpportunitiesInvestorPage({ data }: { data?: ApiOpportunity | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <OppDetailPage d={d} />;
}
