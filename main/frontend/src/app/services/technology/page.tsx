import { getService } from "@/lib/api/cms";
import ServicesTechnologyPage from "@/components/pages/services-technology";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("technology");
  return <ServicesTechnologyPage data={data} />;
}
