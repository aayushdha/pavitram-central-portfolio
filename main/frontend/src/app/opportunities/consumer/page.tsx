import { getOpportunity } from "@/lib/api/cms";
import OpportunitiesConsumerPage from "@/components/pages/opportunities-consumer";

export const revalidate = 0;

export default async function Page() {
  const data = await getOpportunity("consumer");
  return <OpportunitiesConsumerPage data={data} />;
}
