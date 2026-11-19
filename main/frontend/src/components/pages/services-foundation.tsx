"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "foundation",
  name: "Pavitram Foundation",
  hindi: "पवित्रम फाउंडेशन",
  tagline: "Social welfare and community development at the heart of our mission",
  heroIcon: getIcon("Heart"),
  aboutTitle: "About Pavitram Foundation",
  aboutP1: "Pavitram Foundation is the non-profit philanthropic arm of Pavitram India, driving grassroots social upliftment, disaster relief, and educational empowerment.",
  aboutP2: "We channel cooperative goodwill and resources into sustainable community development, empowering women, supporting underprivileged students, and organizing healthcare camps.",
  pills: ["Social Impact", "Scholarships", "Community Care"],
  whyUs: ["100% transparent utilization of charitable donations", "Direct grassroots impact in remote rural areas", "Focus on long-term self-reliance rather than temporary aid"],
  features: [
      { icon: getIcon("Users"), title: "Community Welfare", desc: "Socio-economic support programs for vulnerable families." },
      { icon: getIcon("Heart"), title: "Charitable Initiatives", desc: "Food drives, clothing distribution, and relief work." },
      { icon: getIcon("Compass"), title: "Rural Development", desc: "Clean water, sanitation, and infrastructure projects." },
      { icon: getIcon("Award"), title: "Education Scholarships", desc: "Financial aid for meritorious underprivileged youth." },
      { icon: getIcon("Stethoscope"), title: "Health Camps", desc: "Free diagnostic clinics and medical aid." },
      { icon: getIcon("Smile"), title: "Women Empowerment", desc: "Self-help groups and vocational skill centers for women." },
    ],
  steps: [
      { num: "01", title: "Donate / Volunteer", desc: "Contribute resources or join ground teams." },
      { num: "02", title: "Join Program", desc: "Participate in local community initiatives." },
      { num: "03", title: "Create Impact", desc: "Empower families with education and care." },
      { num: "04", title: "Transform Lives", desc: "Build a compassionate and self-reliant India." },
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

export default function ServicesFoundationPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
