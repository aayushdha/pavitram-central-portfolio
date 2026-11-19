import { getService } from "@/lib/api/cms";
import ServicesFinancePage from "@/components/pages/services-finance";

export const revalidate = 0;

export default async function Page() {
  const data = await getService("finance");
  return <ServicesFinancePage data={data} />;
}
