import type { VendeurDashboard } from "@vpct/db/mock";
import { VENDEUR_FICTIONAL_LABEL } from "@vpct/db/mock";
import Link from "next/link";
import type { ReactNode } from "react";
import { Money } from "./money";
import { FictionalBadge, PhoneShell } from "./shell";
import { OrderStatusBadge, statusAvatarClass } from "./status";
import { Svg } from "./svg";

export function Dashboard({ data, fictional }: { data: VendeurDashboard; fictional: boolean }) {
  const { seller, day, orders } = data;
  const empty = orders.length === 0 && !fictional;
  return (
    <PhoneShell active="home">
      <div className="px-gutter pt-4">
        {fictional ? <FictionalBadge /> : <span className="text-xs text-text-muted">Source : base de données</span>}
      </div>
      <header className="flex items-center justify-between gap-3 px-gutter pb-4 pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-on" aria-hidden>
            {seller.initials || "VP"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-text-muted">{seller.displayName ? `Bonjour ${seller.displayName}` : "Bonjour"}</p>
            <p className="truncate text-lg font-semibold text-ink">
              {seller.shopName || "Aucune boutique"}
              {seller.area ? ` · ${seller.area}` : ""}
            </p>
          </div>
        </div>
        <button aria-label="Notifications" className="relative flex h-touch w-touch items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <Svg>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </Svg>
          {fictional ? <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-critical-fill ring-2 ring-surface" /> : null}
        </button>
      </header>
      <main className="px-gutter">
        <section className="rounded-lg bg-surface p-4 shadow-card" aria-label="Chiffres du jour">
          <div className="flex items-center justify-between">
            <p className="font-medium text-text-muted">Ventes du jour</p>
            <p className="text-sm text-text-muted">{day.label || "Aujourd’hui"}</p>
          </div>
          <p className="mt-1">
            <Money value={day.salesFcfa} className="text-amount" />
          </p>
          {day.deltaLabel ? (
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-success-text">
              <Svg className="h-4 w-4" strokeWidth={2.25}>
                <path d="m22 7-8.5 8.5-5-5L2 17" />
                <path d="M16 7h6v6" />
              </Svg>
              {day.deltaLabel}
            </p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat tone="info" label="En cours" value={String(day.inProgress)} icon={<Truck />} />
            <Stat tone="success" label="Livrées" value={String(day.delivered)} icon={<Check />} />
            <Stat tone="critical" label="Annulées" value={String(day.cancelled)} icon={<Cross />} />
            <div className="rounded-md bg-primary-subtle p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <Wallet />
                Acomptes reçus
              </p>
              <p className="mt-1 text-title">
                <Money value={day.depositsReceivedFcfa} />
              </p>
            </div>
          </div>
        </section>
        <Link href="/commandes/nouvelle" className="mt-4 flex h-cta w-full items-center justify-center gap-2 rounded-pill bg-primary text-lg font-semibold text-primary-on shadow-cta">
          <Svg className="h-6 w-6" strokeWidth={2.5}>
            <path d="M5 12h14M12 5v14" />
          </Svg>
          Créer une commande
        </Link>
        {day.pendingDeposits > 0 ? (
          <Link href="/commandes" className="mt-3 flex min-h-touch items-center gap-3 rounded-lg bg-warning-surface px-4 py-3 text-warning-text ring-1 ring-inset ring-warning-bg">
            <Svg className="h-5 w-5">
              <path d="M5 22h14M5 2h14" />
              <path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22" />
              <path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2" />
            </Svg>
            <span className="flex-1 font-semibold">{day.pendingDeposits} acomptes en attente</span>
            <span className="text-sm">Relancer</span>
            <Svg className="h-5 w-5">
              <path d="m9 18 6-6-6-6" />
            </Svg>
          </Link>
        ) : null}
        <section className="mt-6" aria-label="Commandes récentes">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-title text-ink">Commandes récentes</h2>
            <Link href="/commandes" className="flex min-h-touch items-center px-2 font-semibold text-link">
              Tout voir
            </Link>
          </div>
          {empty ? (
            <p className="rounded-lg bg-surface p-4 text-text-muted shadow-card">
              Aucune commande enregistrée. {VENDEUR_FICTIONAL_LABEL} s’affiche seulement sans DATABASE_URL.
            </p>
          ) : (
            <div className="divide-y divide-line overflow-hidden rounded-lg bg-surface shadow-card">
              {orders.map((order) => (
                <article key={order.id} className="flex items-start gap-3 p-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold ${statusAvatarClass(order.status)}`} aria-hidden>
                    {order.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold text-ink">{order.customerName}</p>
                      <Money value={order.totalFcfa} inline className="text-md" />
                    </div>
                    <p className="truncate text-sm text-text-muted">
                      N° {String(order.number).padStart(4, "0")} · {order.summary}
                    </p>
                    <div className="mt-2">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PhoneShell>
  );
}

function Stat({ tone, label, value, icon }: { tone: "info" | "success" | "critical"; label: string; value: string; icon: ReactNode }) {
  const box = tone === "info" ? "bg-info-surface" : tone === "success" ? "bg-success-surface" : "bg-critical-surface";
  const text = tone === "info" ? "text-info-text" : tone === "success" ? "text-success-text" : "text-critical-text";
  return (
    <div className={`rounded-md p-3 ${box}`}>
      <p className={`flex items-center gap-1.5 text-sm font-medium ${text}`}>
        {icon}
        {label}
      </p>
      <p className="mt-1 text-title">
        <span className={`money ${text}`}>{value}</span>
      </p>
    </div>
  );
}

function Truck() {
  return (
    <Svg className="h-4 w-4" strokeWidth={2.25}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </Svg>
  );
}
function Check() {
  return (
    <Svg className="h-4 w-4" strokeWidth={2.25}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}
function Cross() {
  return (
    <Svg className="h-4 w-4" strokeWidth={2.25}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}
function Wallet() {
  return (
    <Svg className="h-4 w-4" strokeWidth={2.25}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Svg>
  );
}
