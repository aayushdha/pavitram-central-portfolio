import { getService } from "@/lib/api/cms";
import ServicesRozgarPage from "@/components/pages/services-rozgar";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("rozgar");
  return <ServicesRozgarPage data={data} />;
}
