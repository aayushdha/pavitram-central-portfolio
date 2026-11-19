import { getService } from "@/lib/api/cms";
import ServicesPropertiesPage from "@/components/pages/services-properties";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("properties");
  return <ServicesPropertiesPage data={data} />;
}
