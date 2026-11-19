"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "mart",
  name: "Pavitram Mart",
  hindi: "पवित्रम मार्ट",
  tagline: "One platform. Every product. Fair cooperative prices.",
  heroIcon: getIcon("ShoppingBag"),
  aboutTitle: "About Pavitram Mart",
  aboutP1: "Pavitram Mart connects consumers, producers, and merchants on a single unified marketplace. By eliminating unnecessary middlemen, we deliver high-quality products at genuine cooperative prices.",
  aboutP2: "Whether you are sourcing raw materials for your business or buying daily household groceries, Pavitram Mart guarantees quality, transparency, and timely delivery.",
  pills: ["Multi-Vendor", "B2B & B2C", "Fair Pricing"],
  whyUs: ["Direct producer-to-consumer marketplace model", "Unbeatable cooperative savings and discounts", "Rigorous quality verification for every listing"],
  features: [
      { icon: getIcon("Layers"), title: "Multi-Category Products", desc: "Groceries, electronics, apparel, and agricultural goods." },
      { icon: getIcon("Store"), title: "Multi-Vendor Platform", desc: "Empowering local manufacturers and merchants." },
      { icon: getIcon("Tag"), title: "B2B & B2C Commerce", desc: "Serving both wholesale businesses and individual homes." },
      { icon: getIcon("Tag"), title: "Fair Pricing", desc: "Cooperative rates ensuring max savings." },
      { icon: getIcon("Truck"), title: "Fast Delivery", desc: "Reliable logistics straight to your doorstep." },
      { icon: getIcon("ShieldCheck"), title: "Quality Assured", desc: "Verified products backed by customer guarantees." },
    ],
  steps: [
      { num: "01", title: "Browse", desc: "Explore thousands of verified cooperative products." },
      { num: "02", title: "Select", desc: "Add items to your cart at transparent prices." },
      { num: "03", title: "Order", desc: "Checkout securely using member payments." },
      { num: "04", title: "Delivered to You", desc: "Receive doorstep delivery with full satisfaction." },
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

export default function ServicesMartPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
