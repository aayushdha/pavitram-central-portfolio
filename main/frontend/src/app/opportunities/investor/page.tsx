import { getOpportunity } from "@/lib/api/cms";
import OpportunitiesInvestorPage from "@/components/pages/opportunities-investor";

export const revalidate = 0;

export default async function Page() {
  const data = await getOpportunity("investor");
  return <OpportunitiesInvestorPage data={data} />;
}
