"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "services",
  name: "Pavitram Services",
  hindi: "पवित्रम सर्विसेज",
  tagline: "Every home service you need, delivered with trust and quality",
  heroIcon: getIcon("Wrench"),
  aboutTitle: "About Pavitram Services",
  aboutP1: "Pavitram Services delivers trusted home maintenance, housekeeping, repair, and security solutions directly to your doorstep.",
  aboutP2: "All our service technicians and professionals undergo thorough background checks and skill certifications to guarantee safety, quality, and fair pricing.",
  pills: ["Verified Pros", "On-Demand", "Transparent Rates"],
  whyUs: ["Rigorous background checks on every technician", "Fixed cooperative pricing with no surprise charges", "Guaranteed satisfaction and prompt service delivery"],
  features: [
      { icon: getIcon("Home"), title: "Home Maintenance", desc: "Carpentry, painting, and general household repairs." },
      { icon: getIcon("Zap"), title: "Plumbing & Electrical", desc: "Certified technicians for urgent home fixes." },
      { icon: getIcon("ShieldCheck"), title: "Security Services", desc: "Trained security personnel for homes and events." },
      { icon: getIcon("UserCheck"), title: "Housekeeping", desc: "Professional cleaning and sanitation services." },
      { icon: getIcon("UserCheck"), title: "Verified Professionals", desc: "ID-verified and background-tested staff." },
      { icon: getIcon("Clock"), title: "On-Demand Booking", desc: "Easy scheduling via app or phone call." },
    ],
  steps: [
      { num: "01", title: "Book", desc: "Select the service needed and choose a time." },
      { num: "02", title: "Verified Pro Assigned", desc: "Receive technician details and ETA." },
      { num: "03", title: "Service Done", desc: "Work completed with high quality." },
      { num: "04", title: "Review", desc: "Pay transparently and share your experience." },
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

export default function ServicesServicesPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
