"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "wellness",
  name: "Pavitram Wellness",
  hindi: "पवित्रम वेलनेस",
  tagline: "Healthy body, peaceful mind, and true wealth for every member",
  heroIcon: getIcon("HeartPulse"),
  aboutTitle: "About Pavitram Wellness",
  aboutP1: "Pavitram Wellness is dedicated to nurturing physical health, mental well-being, and preventive healthcare for our community members.",
  aboutP2: "We combine traditional wellness practices with modern medical access, offering health consultations, nutrition counseling, and cooperative discounts at top medical centers.",
  pills: ["Holistic Health", "Preventive Care", "Health Camps"],
  whyUs: ["Accessible healthcare consultations and expert advice", "Discounted diagnostics and medicine through network", "Regular community health camps in rural and urban areas"],
  features: [
      { icon: getIcon("Stethoscope"), title: "Health Consultations", desc: "Access to verified doctors and wellness experts." },
      { icon: getIcon("Activity"), title: "Wellness Programs", desc: "Yoga, fitness, and lifestyle management plans." },
      { icon: getIcon("HeartPulse"), title: "Preventive Care", desc: "Regular checkups and early health risk detection." },
      { icon: getIcon("Smile"), title: "Mental Wellness", desc: "Counseling and stress reduction initiatives." },
      { icon: getIcon("Apple"), title: "Nutrition Guidance", desc: "Personalized diet and wholesome nutrition advice." },
      { icon: getIcon("Users"), title: "Community Health Camps", desc: "Free medical screening camps across villages." },
    ],
  steps: [
      { num: "01", title: "Join", desc: "Access the Pavitram Wellness network portal." },
      { num: "02", title: "Assess Health", desc: "Complete a basic wellness assessment." },
      { num: "03", title: "Get Plan", desc: "Receive customized healthcare guidance." },
      { num: "04", title: "Live Better", desc: "Enjoy long-term vitality and peace of mind." },
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

export default function ServicesWellnessPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
