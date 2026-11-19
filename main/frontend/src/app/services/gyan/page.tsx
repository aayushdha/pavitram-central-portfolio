import { getService } from "@/lib/api/cms";
import ServicesGyanPage from "@/components/pages/services-gyan";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("gyan");
  return <ServicesGyanPage data={data} />;
}
