import { getService } from "@/lib/api/cms";
import ServicesRishtaPage from "@/components/pages/services-rishta";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("rishta");
  return <ServicesRishtaPage data={data} />;
}
