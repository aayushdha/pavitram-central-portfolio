"use client";

import { ServiceDetailPage, type ServiceDetail } from "@/lib/service-detail";
import { getIcon } from "@/lib/icon-map";
import type { ApiService } from "@/lib/api/types";

/** Fallback content (used if the backend is unreachable) — fully editable from Super Admin > Services. */
const DEFAULT_DATA: ServiceDetail = {
  slug: "delivery",
  name: "Pavitram Delivery",
  hindi: "पवित्रम डिलीवरी",
  tagline: "Anything, anywhere, anytime — delivered with care",
  heroIcon: getIcon("Truck"),
  aboutTitle: "About Pavitram Delivery",
  aboutP1: "Pavitram Delivery is our dedicated logistics engine ensuring swift, secure, and affordable package delivery across rural and urban India.",
  aboutP2: "By utilizing our cooperative network hubs, we power last-mile connectivity for Pavitram Mart orders, business documents, and personal parcels.",
  pills: ["Same Day", "Last-Mile Connect", "Pan-India"],
  whyUs: ["Extensive last-mile reach into rural villages and urban hubs", "Affordable cooperative shipping rates for individuals and merchants", "Real-time GPS tracking and tamper-proof packaging"],
  features: [
      { icon: getIcon("Clock"), title: "Same Day Delivery", desc: "Express local delivery within major city limits." },
      { icon: getIcon("Globe"), title: "Pan-India Shipping", desc: "Reliable logistics connecting 15+ states." },
      { icon: getIcon("MapPin"), title: "Real-Time Tracking", desc: "Live updates from dispatch to doorstep." },
      { icon: getIcon("ShieldCheck"), title: "Cooperative Pricing", desc: "Maximum savings on freight and parcel delivery." },
      { icon: getIcon("Box"), title: "Secure Packaging", desc: "Protected handling for delicate goods and documents." },
      { icon: getIcon("Truck"), title: "Last-Mile Connect", desc: "Reaching deep into rural village centers." },
    ],
  steps: [
      { num: "01", title: "Order", desc: "Book shipment via app or Pavitram Mart." },
      { num: "02", title: "Pickup", desc: "Agent collects package from your location." },
      { num: "03", title: "Track", desc: "Follow real-time progress on live map." },
      { num: "04", title: "Delivered", desc: "Safe doorstep delivery with instant OTP." },
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

export default function ServicesDeliveryPage({ data }: { data?: ApiService | null }) {
  const d = data ? mapApiToDetail(data) : DEFAULT_DATA;
  return <ServiceDetailPage d={d} />;
}
