"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "properties",
  name: "Pavitram Properties",
  hindi: "पवित्रम प्रॉपर्टीज",
  tagline: "Your complete solution for every property need in India",
  heroIcon: getIcon("Building2"),
  aboutTitle: "About Pavitram Properties",
  aboutP1: "Pavitram Properties offers a trustworthy, transparent environment for buying, selling, renting, and investing in real estate across India.",
  aboutP2: "We eliminate fraudulent listings and hidden brokerage fees by connecting verified property owners directly with genuine buyers within our ethical cooperative network.",
  pills: ["Verified Listings", "Legal Support", "Pan-India"],
  whyUs: ["100% verified properties with legal due diligence", "Transparent pricing with zero hidden commissions", "Expert legal and documentation assistance"],
  features: [
      { icon: getIcon("Home"), title: "Buy & Sell", desc: "Residential houses, plots, and commercial spaces." },
      { icon: getIcon("Key"), title: "Rental Solutions", desc: "Hassle-free renting for tenants and owners." },
      { icon: getIcon("TrendingUp"), title: "Real Estate Investment", desc: "High-growth group investment opportunities." },
      { icon: getIcon("ShieldCheck"), title: "Legal Support", desc: "Title verification and agreement assistance." },
      { icon: getIcon("Building2"), title: "Property Valuation", desc: "Accurate market valuation reports." },
      { icon: getIcon("MapPin"), title: "Pan-India Listings", desc: "Properties spanning major cities and towns." },
    ],
  steps: [
      { num: "01", title: "List / Search", desc: "Post your property or search verified listings." },
      { num: "02", title: "Verify", desc: "Review legal documentation and site details." },
      { num: "03", title: "Negotiate", desc: "Connect directly with owners for fair deals." },
      { num: "04", title: "Close Deal", desc: "Complete transfer with our guided assistance." },
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

export default function ServicesPropertiesPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
