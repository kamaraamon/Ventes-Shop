import { PhoneShell } from "@/components/shell";
import { customers } from "@vpct/db/mock";

const LABEL = { fiable: "Fiable", a_surveiller: "À surveiller", signale: "Signalé", nouveau: "Nouveau" } as const;

export default function ClientsPage() {
  return (
    <PhoneShell active="clients">
      <main className="px-gutter py-4">
        <h1 className="text-title text-ink">Clients</h1>
        <p className="mt-1 text-sm text-text-muted">Indicateur de fiabilité fictif. Pas de données personnelles réelles.</p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg bg-surface shadow-card">
          {customers.map((customer) => (
            <li key={customer.id} className="flex items-center gap-3 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle font-semibold text-primary">{customer.initials}</span>
              <div>
                <p className="font-semibold text-ink">{customer.name}</p>
                <p className="text-sm text-text-muted">
                  {LABEL[customer.reliability]} · {customer.orders} cmd · {customer.cancellations} annulation
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </PhoneShell>
  );
}
