"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "gyan",
  name: "Pavitram Gyan",
  hindi: "पवित्रम ज्ञान",
  tagline: "Equal education and skill development for every Indian",
  heroIcon: getIcon("BookOpen"),
  aboutTitle: "About Pavitram Gyan",
  aboutP1: "Pavitram Gyan focuses on empowering members through knowledge, practical skills, and awareness of constitutional rights and economic opportunities.",
  aboutP2: "We offer online and offline courses, vocational training, and leadership mentorship so that every youth and adult can achieve financial self-reliance.",
  pills: ["Skill Building", "Equal Access", "Career Guidance"],
  whyUs: ["Practical, employment-oriented skill courses", "Equal educational access regardless of economic background", "Awareness programs on constitutional duties and self-reliance"],
  features: [
      { icon: getIcon("Award"), title: "Skill Development", desc: "Vocational and digital skill training for youth." },
      { icon: getIcon("Compass"), title: "Awareness Programs", desc: "Workshops on legal rights and government schemes." },
      { icon: getIcon("BookOpen"), title: "Equal Education", desc: "Scholarships and learning support for students." },
      { icon: getIcon("Globe"), title: "Online Learning", desc: "Flexible digital courses accessible nationwide." },
      { icon: getIcon("Compass"), title: "Career Guidance", desc: "Mentorship for jobs and entrepreneurship." },
      { icon: getIcon("Scale"), title: "Constitutional Education", desc: "Understanding civic duties and rights." },
    ],
  steps: [
      { num: "01", title: "Enroll", desc: "Select a course or educational program." },
      { num: "02", title: "Learn", desc: "Participate in practical modules and mentorship." },
      { num: "03", title: "Apply Skills", desc: "Gain certifications and practical exposure." },
      { num: "04", title: "Grow", desc: "Unlock higher income and career growth." },
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

export default function ServicesGyanPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
