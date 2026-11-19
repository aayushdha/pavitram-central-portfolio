"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "rozgar",
  name: "Pavitram Rozgar",
  hindi: "पवित्रम रोजगार",
  tagline: "Dignified employment matching your qualifications and ambitions",
  heroIcon: getIcon("Briefcase"),
  aboutTitle: "About Pavitram Rozgar",
  aboutP1: "Pavitram Rozgar bridges job seekers and verified employers within our cooperative network, fostering dignified employment and entrepreneurship.",
  aboutP2: "We match individuals to roles that fit their exact qualifications, technical skills, and personal interests while ensuring fair compensation.",
  pills: ["Dignified Work", "Skill Matching", "Fair Wages"],
  whyUs: ["Direct linkage with growing businesses in our network", "No placement fees or exploitation for job seekers", "Equal employment opportunities for rural and urban candidates"],
  features: [
      { icon: getIcon("Briefcase"), title: "Job Listings", desc: "Openings across technology, retail, finance, and services." },
      { icon: getIcon("Building"), title: "Business Opportunities", desc: "Franchise and associate business models." },
      { icon: getIcon("Award"), title: "Skill Matching", desc: "AI-assisted pairing of candidate skills with jobs." },
      { icon: getIcon("Users"), title: "Employer Connect", desc: "Direct interviews with verified network employers." },
      { icon: getIcon("DollarSign"), title: "Fair Wages", desc: "Ensuring timely and respectful compensation." },
      { icon: getIcon("TrendingUp"), title: "Career Growth", desc: "Continuous skill upgrading and promotion pathways." },
    ],
  steps: [
      { num: "01", title: "Register", desc: "Create your employment seeker profile." },
      { num: "02", title: "Upload Skills", desc: "Detail your experience, education, and interests." },
      { num: "03", title: "Match Jobs", desc: "Get recommendations tailored to your goals." },
      { num: "04", title: "Get Hired", desc: "Secure dignified work in our cooperative ecosystem." },
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

export default function ServicesRozgarPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
