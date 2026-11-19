import { getService } from "@/lib/api/cms";
import ServicesWellnessPage from "@/components/pages/services-wellness";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("wellness");
  return <ServicesWellnessPage data={data} />;
}
