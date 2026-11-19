import { getService } from "@/lib/api/cms";
import ServicesFoundationPage from "@/components/pages/services-foundation";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("foundation");
  return <ServicesFoundationPage data={data} />;
}
