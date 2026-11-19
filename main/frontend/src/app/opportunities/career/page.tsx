import { getOpportunity } from "@/lib/api/cms";
import OpportunitiesCareerPage from "@/components/pages/opportunities-career";

export const revalidate = 0;

export default async function Page() {
  const data = await getOpportunity("career");
  return <OpportunitiesCareerPage data={data} />;
}
