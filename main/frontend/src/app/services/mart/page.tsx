import { getService } from "@/lib/api/cms";
import ServicesMartPage from "@/components/pages/services-mart";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("mart");
  return <ServicesMartPage data={data} />;
}
