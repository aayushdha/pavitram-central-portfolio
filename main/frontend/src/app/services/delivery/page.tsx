import { getService } from "@/lib/api/cms";
import ServicesDeliveryPage from "@/components/pages/services-delivery";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("delivery");
  return <ServicesDeliveryPage data={data} />;
}
