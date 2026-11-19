import { getService } from "@/lib/api/cms";
import ServicesMediaPage from "@/components/pages/services-media";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("media");
  return <ServicesMediaPage data={data} />;
}
