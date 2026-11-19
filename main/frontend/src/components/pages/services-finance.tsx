"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "finance",
  name: "Pavitram Finance",
  hindi: "पवित्रम फाइनेंस",
  tagline: "Transparent banking, smart investment, and cooperative returns",
  heroIcon: getIcon("Landmark"),
  aboutTitle: "About Pavitram Finance",
  aboutP1: "Pavitram Finance provides transparent financial services, cooperative investment plans, and micro-loan assistance to foster economic independence.",
  aboutP2: "By pooling community resources ethically, members enjoy strong returns of 12%+ through real business asset investments while protecting family capital.",
  pills: ["12%+ Returns", "Transparent KYC", "Cooperative Finance"],
  whyUs: ["Proven cooperative return model generating 12%+ annually", "Ethical micro-loans for small businesses and farmers", "Total transparency in fund allocation and security"],
  features: [
      { icon: getIcon("Wallet"), title: "Banking Solutions", desc: "Cooperative savings accounts and digital transfers." },
      { icon: getIcon("Landmark"), title: "Loans Assistance", desc: "Fair-rate business and personal micro-loans." },
      { icon: getIcon("TrendingUp"), title: "Investment Plans", desc: "High-yield cooperative asset investment pools." },
      { icon: getIcon("ShieldCheck"), title: "Insurance Cover", desc: "Life and health security options for families." },
      { icon: getIcon("PieChart"), title: "12%+ Cooperative Returns", desc: "Share in community growth and business profits." },
      { icon: getIcon("Calculator"), title: "Financial Planning", desc: "Expert guidance for wealth preservation." },
    ],
  steps: [
      { num: "01", title: "Register", desc: "Sign up for financial member services." },
      { num: "02", title: "KYC Verification", desc: "Complete basic identity verification." },
      { num: "03", title: "Choose Plan", desc: "Select savings, loan, or investment pools." },
      { num: "04", title: "Earn Returns", desc: "Track earnings and build financial security." },
    ],
};

function mapApiToDetail(data: ApiService): ServiceDetail {
  return {
    slug: data.slug,
    name: data.name,
    hindi: data.hindi,
    tagline: data.tagline,
    heroIcon: getIcon(data.heroIcon),
    aboutTitle: data.aboutTitle,
    aboutP1: data.aboutP1,
    aboutP2: data.aboutP2,
    pills: data.pills,
    whyUs: data.whyUs,
    features: data.features.map((f) => ({ icon: getIcon(f.icon), title: f.title, desc: f.desc })),
    steps: data.steps,
  };
}

export default function ServicesFinancePage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
