"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "rishta",
  name: "Pavitram Rishta",
  hindi: "पवित्रम रिश्ता",
  tagline: "Trusted matrimonial connections within a values-driven community",
  heroIcon: getIcon("HeartHandshake"),
  aboutTitle: "About Pavitram Rishta",
  aboutP1: "Pavitram Rishta is a dignified matchmaking platform built on trust, traditional values, and verified family backgrounds.",
  aboutP2: "Unlike commercial matrimonial websites, we prioritize security, genuine compatibility, and cultural alignment within our ethical network.",
  pills: ["Verified Profiles", "Privacy Protected", "Family First"],
  whyUs: ["100% manually verified profiles within trusted network", "Complete privacy protection and respectful communication", "Guided family-to-family introductions and support"],
  features: [
      { icon: getIcon("ShieldCheck"), title: "Verified Profiles", desc: "Background check for authenticity and trust." },
      { icon: getIcon("Heart"), title: "Community Matching", desc: "Filter by values, education, and background." },
      { icon: getIcon("Users"), title: "Family Connect", desc: "Facilitated meetings between respected families." },
      { icon: getIcon("Lock"), title: "Privacy Protected", desc: "Contact details shared only upon mutual consent." },
      { icon: getIcon("Award"), title: "Values Aligned", desc: "Connecting individuals who share cultural ethics." },
      { icon: getIcon("HeartHandshake"), title: "Counseling Support", desc: "Pre-marriage guidance and family counseling." },
    ],
  steps: [
      { num: "01", title: "Register", desc: "Create your confidential matchmaking profile." },
      { num: "02", title: "Create Profile", desc: "Add verified education, career, and family details." },
      { num: "03", title: "Match", desc: "Discover compatible profiles aligned with your values." },
      { num: "04", title: "Connect", desc: "Initiate dignified family conversations." },
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

export default function ServicesRishtaPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
