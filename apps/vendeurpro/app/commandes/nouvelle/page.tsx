import { OrderForm } from "@/components/order-form";
import { getVendeurDashboard } from "@vpct/db/server";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const result = await getVendeurDashboard();
  return <OrderForm data={result.dashboard} />;
}
