"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "media",
  name: "Pavitram Media",
  hindi: "पवित्रम मीडिया",
  tagline: "Truthful media, e-paper, and digital voice for our community",
  heroIcon: getIcon("Radio"),
  aboutTitle: "About Pavitram Media",
  aboutP1: "Pavitram Media is the constructive, truthful voice of our cooperative community, highlighting inspirational stories, local developments, and positive national progress.",
  aboutP2: "Through our digital e-papers, video channels, and social networks, we amplify ground reality, champion ethical journalism, and educate citizens.",
  pills: ["E-Paper", "Ethical News", "Member Stories"],
  whyUs: ["Unbiased, constructive journalism focused on community growth", "Digital e-paper access covering national and regional news", "Platform for local members to share their stories and achievements"],
  features: [
      { icon: getIcon("Newspaper"), title: "E-Newspaper", desc: "Daily digital edition covering news and analysis." },
      { icon: getIcon("Share2"), title: "Social Media", desc: "Engaging video channels and social updates." },
      { icon: getIcon("Megaphone"), title: "Community News", desc: "Spotlighting regional developments and grassroots issues." },
      { icon: getIcon("Video"), title: "Digital Content", desc: "Educational videos on health, finance, and rights." },
      { icon: getIcon("Users"), title: "Member Stories", desc: "Inspirational profiles of self-reliant individuals." },
      { icon: getIcon("Megaphone"), title: "Awareness Campaigns", desc: "Promoting social welfare and civic responsibility." },
    ],
  steps: [
      { num: "01", title: "Subscribe", desc: "Access free digital media subscriptions." },
      { num: "02", title: "Read", desc: "Stay updated with daily e-papers and videos." },
      { num: "03", title: "Share", desc: "Spread positive news across your network." },
      { num: "04", title: "Stay Informed", desc: "Empower yourself with authentic knowledge." },
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

export default function ServicesMediaPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
