"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "travels",
  name: "Pavitram Travels",
  hindi: "पवित्रम ट्रेवल्स",
  tagline: "Complete travel solutions for the Pavitram community",
  heroIcon: getIcon("Plane"),
  aboutTitle: "About Pavitram Travels",
  aboutP1: "Pavitram Travels provides seamless, affordable, and joyful travel services for families, groups, and business associates throughout India.",
  aboutP2: "From sacred pilgrimage tours to family vacations and corporate retreats, our cooperative booking network delivers exclusive discounts and dedicated support.",
  pills: ["Pilgrimage Tours", "Group Discounts", "End-to-End"],
  whyUs: ["Curated spiritual and cultural itineraries", "Exclusive cooperative rates on hotels and transport", "Dedicated group coordinators ensuring safe journeys"],
  features: [
      { icon: getIcon("Map"), title: "Tour Packages", desc: "Customized domestic and pilgrimage tour itineraries." },
      { icon: getIcon("Plane"), title: "Travel Booking", desc: "Flight, train, and bus ticket reservations." },
      { icon: getIcon("Hotel"), title: "Hotel Stays", desc: "Verified hotel accommodations at negotiated prices." },
      { icon: getIcon("Users"), title: "Group Tours", desc: "Community group trips with shared camaraderie." },
      { icon: getIcon("Tag"), title: "Cooperative Discounts", desc: "Special savings for registered community members." },
      { icon: getIcon("ShieldCheck"), title: "Travel Insurance", desc: "Coverage for hassle-free and safe travel." },
    ],
  steps: [
      { num: "01", title: "Plan", desc: "Select your desired destination or pilgrimage." },
      { num: "02", title: "Book", desc: "Confirm transport and stay with cooperative rates." },
      { num: "03", title: "Travel", desc: "Enjoy organized support throughout your trip." },
      { num: "04", title: "Enjoy Savings", desc: "Experience memorable journeys for less." },
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

export default function ServicesTravelsPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
