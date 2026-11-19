import { getService } from "@/lib/api/cms";
import ServicesTravelsPage from "@/components/pages/services-travels";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("travels");
  return <ServicesTravelsPage data={data} />;
}
