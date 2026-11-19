import type { Metadata } from "next";
import OpportunitiesPage from "@/components/pages/opportunities";
import { getOpportunities } from "@/lib/api/cms";

export const metadata: Metadata = {
  title: "Opportunities — Pavitram India",
  description: "Join as a Consumer, Merchant, Investor or Career associate — find your role in the cooperative network.",
  openGraph: {
    title: "Opportunities — Pavitram India",
    description: "Explore how you can contribute to the Pavitram network.",
  },
};

export const revalidate = 0;

export default async function Page() {
  const opportunities = await getOpportunities();
  return <OpportunitiesPage opportunities={opportunities} />;
}
