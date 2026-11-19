"use client";

import { OppDetailPage, type OppDetail } from "@/lib/opp-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiOpportunity } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Opportunities. */
const DEFAULT_DATA: OppDetail = {
  slug: "merchant",
  title: "As a Merchant",
  hindi: "व्यापारी के रूप में",
  label: "Merchant",
  Icon: getIcon("Store"),
  intro: "Partner with us to reach a dedicated community customer base and grow your business with transparent partnerships. List products and services across a multi-vendor, multi-location cooperative framework.",
  benefits: ["Transparent business partnerships", "Multi-vendor, multi-location B2B and B2C framework", "Significant income enhancement", "Verified buyer community"],
  steps: [
      { title: "Apply", body: "Submit your business profile for verification." },
      { title: "Onboard", body: "List products and services on the network." },
      { title: "Grow", body: "Reach verified members across 15+ states." },
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

export default function OpportunitiesMerchantPage({ data }: { data?: ApiOpportunity | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <OppDetailPage d={d} />;
}
