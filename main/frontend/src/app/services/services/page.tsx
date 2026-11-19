import { getService } from "@/lib/api/cms";
import ServicesServicesPage from "@/components/pages/services-services";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("services");
  return <ServicesServicesPage data={data} />;
}
