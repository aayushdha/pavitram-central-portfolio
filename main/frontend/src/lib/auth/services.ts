import {
  Building2,
  HeartPulse,
  BookOpen,
  ShoppingBag,
  Cpu,
  Landmark,
  Plane,
  Heart,
  Briefcase,
  Wrench,
  Radio,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type DashboardService = {
  id: string;
  name: string;
  description: string;
  href: string;
  external?: boolean;
  sso?: boolean;
  Icon: LucideIcon;
  accent: string;
};

export const DASHBOARD_SERVICES: DashboardService[] = [
  {
    id: "properties",
    name: "Pavitram Properties",
    description: "Buy, sell, rent and invest — opens the real-estate portal.",
    href: "/sso/properties",
    external: true,
    sso: true,
    Icon: Building2,
    accent: "from-amber-500/20 to-transparent",
  },
  {
    id: "mart",
    name: "Pavitram Mart",
    description: "Cooperative B2B & B2C marketplace at fair prices.",
    href: "/services/mart",
    Icon: ShoppingBag,
    accent: "from-emerald-500/20 to-transparent",
  },
  {
    id: "wellness",
    name: "Pavitram Wellness",
    description: "Holistic wellness and trusted healthcare access.",
    href: "/services/wellness",
    Icon: HeartPulse,
    accent: "from-rose-500/20 to-transparent",
  },
  {
    id: "gyan",
    name: "Pavitram Gyan",
    description: "Education, skills and equal learning access.",
    href: "/services/gyan",
    Icon: BookOpen,
    accent: "from-sky-500/20 to-transparent",
  },
  {
    id: "technology",
    name: "Pavitram Technology",
    description: "Digital platforms and tech enablement.",
    href: "/services/technology",
    Icon: Cpu,
    accent: "from-violet-500/20 to-transparent",
  },
  {
    id: "finance",
    name: "Pavitram Finance",
    description: "Cooperative finance and transparent funding.",
    href: "/services/finance",
    Icon: Landmark,
    accent: "from-yellow-500/20 to-transparent",
  },
  {
    id: "travels",
    name: "Pavitram Travels",
    description: "Community travel and curated experiences.",
    href: "/services/travels",
    Icon: Plane,
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    id: "rishta",
    name: "Pavitram Rishta",
    description: "Ethical matchmaking within the network.",
    href: "/services/rishta",
    Icon: Heart,
    accent: "from-pink-500/20 to-transparent",
  },
  {
    id: "rozgar",
    name: "Pavitram Rozgar",
    description: "Dignified employment matched to your skills.",
    href: "/services/rozgar",
    Icon: Briefcase,
    accent: "from-orange-500/20 to-transparent",
  },
  {
    id: "services",
    name: "Pavitram Services",
    description: "Verified local services for everyday needs.",
    href: "/services/services",
    Icon: Wrench,
    accent: "from-lime-500/20 to-transparent",
  },
  {
    id: "media",
    name: "Pavitram Media",
    description: "Community storytelling and creator platform.",
    href: "/services/media",
    Icon: Radio,
    accent: "from-fuchsia-500/20 to-transparent",
  },
  {
    id: "delivery",
    name: "Pavitram Delivery",
    description: "Logistics across rural and urban India.",
    href: "/services/delivery",
    Icon: Truck,
    accent: "from-teal-500/20 to-transparent",
  },
];
