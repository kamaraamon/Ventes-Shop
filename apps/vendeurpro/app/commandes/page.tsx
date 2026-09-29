import { PhoneShell } from "@/components/shell";
import { recentOrders } from "@vpct/db/mock";
import { OrderStatusBadge } from "@/components/status";
import { Money } from "@/components/money";

export default function OrdersPage() {
  return (
    <PhoneShell active="orders">
      <main className="px-gutter py-4">
        <h1 className="text-title text-ink">Commandes</h1>
        <p className="mt-1 text-sm text-text-muted">Extrait fictif. Le suivi détaillé n’est pas dans ce socle.</p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg bg-surface shadow-card">
          {recentOrders.map((order) => (
            <li key={order.id} className="p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-ink">{order.customerName}</p>
                <Money value={order.totalFcfa} inline className="text-md" />
              </div>
              <p className="text-sm text-text-muted">N° {String(order.number).padStart(4, "0")}</p>
              <div className="mt-2">
                <OrderStatusBadge status={order.status} />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </PhoneShell>
  );
}
