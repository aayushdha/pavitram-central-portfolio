import { getOpportunity } from "@/lib/api/cms";
import OpportunitiesMerchantPage from "@/components/pages/opportunities-merchant";

export const revalidate = 0;

export default async function Page() {
  const data = await getOpportunity("merchant");
  return <OpportunitiesMerchantPage data={data} />;
}
