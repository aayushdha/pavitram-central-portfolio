import type { Metadata } from "next";
import ServicesPage from "@/components/pages/services";
import { getServices } from "@/lib/api/cms";

export const metadata: Metadata = {
  title: "Services — Pavitram India",
  description: "Thirteen cooperative services — from technology and retail to wellness, education, finance, travel and matrimonial.",
  openGraph: {
    title: "Pavitram Services",
    description: "13 cooperative services unified under one network.",
  },
};

export const revalidate = 0;

export default async function Page() {
  const services = await getServices();
  return <ServicesPage services={services} />;
}
