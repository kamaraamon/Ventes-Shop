"use client";

import type { Customer, OrderDraft, PayMethod, Product, VendeurDashboard } from "@vpct/db/mock";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Money } from "./money";
import { FictionalBadge } from "./shell";
import { Svg } from "./svg";

const METHODS: { id: PayMethod; label: string; dot: string }[] = [
  { id: "orange_money", label: "Orange Money", dot: "bg-pay-orange" },
  { id: "mtn_momo", label: "MTN MoMo", dot: "bg-pay-mtn" },
  { id: "wave", label: "Wave", dot: "bg-pay-wave" },
];

export function OrderForm({ data }: { data: VendeurDashboard }) {
  const [query, setQuery] = useState("Aya K");
  const [customerId, setCustomerId] = useState(data.draft.customerId);
  const [lines, setLines] = useState(data.draft.lines);
  const [neighborhood, setNeighborhood] = useState(data.draft.neighborhood);
  const [deliveryFee, setDeliveryFee] = useState(data.draft.deliveryFeeFcfa);
  const [deposit, setDeposit] = useState<30 | 50 | "other">(50);
  const [customPercent, setCustomPercent] = useState(40);
  const [method, setMethod] = useState<PayMethod>("wave");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]);

  const customers = [...data.customers, ...extraCustomers];
  const matches = customers.filter((customer) => customer.name.toLowerCase().includes(query.trim().toLowerCase()));
  const customer = customers.find((item) => item.id === customerId) ?? matches[0];

  const priced = useMemo(() => {
    return lines
      .map((line) => {
        const product = data.products.find((item) => item.id === line.productId);
        if (!product) return null;
        return { ...line, product };
      })
      .filter((line): line is { productId: string; quantity: number; product: Product } => Boolean(line));
  }, [data.products, lines]);

  const articleCount = priced.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = priced.reduce((sum, line) => sum + line.quantity * line.product.priceFcfa, 0);
  const total = subtotal + deliveryFee;
  const percent = deposit === "other" ? customPercent : deposit;
  const depositAmount = Math.round((total * percent) / 100);
  const balance = total - depositAmount;

  function setQty(productId: string, quantity: number) {
    setLines((current) => current.map((line) => (line.productId === productId ? { ...line, quantity: Math.max(1, quantity) } : line)));
  }

  async function generateLink() {
    setCreating(true);
    setResult(null);
    try {
      const response = await fetch("/api/paiements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountFcfa: depositAmount,
          description: `Acompte commande ${customer?.name ?? ""}`,
          channel: method,
          customerName: customer?.name,
          customerPhone: customer?.phone,
        }),
      });
      const payload = (await response.json()) as { status: string; mode: string; message: string; transactionId: string; paymentUrl: string | null };
      setResult(
        payload.paymentUrl
          ? `Lien prêt (${payload.transactionId}). Le paiement n’est pas confirmé : seule la vérification serveur compte.`
          : `${payload.message} Réf. ${payload.transactionId}. Statut : ${payload.status}.`,
      );
    } catch {
      setResult("Le lien n’a pas pu être préparé. Réessayez.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[390px] bg-bg pb-[168px]">
      <div className="flex h-14 items-center gap-1 px-1">
        <Link href="/" aria-label="Fermer" className="flex h-touch w-touch shrink-0 items-center justify-center rounded-full text-ink">
          <Svg>
            <path d="M18 6 6 18M6 6l12 12" />
          </Svg>
        </Link>
        <h1 className="flex-1 text-title text-ink">Nouvelle commande</h1>
        <span className="mr-3 inline-flex items-center gap-1.5 rounded-pill bg-primary-subtle px-3 py-1 text-sm font-semibold text-primary">
          <Svg className="h-4 w-4" strokeWidth={2.25}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </Svg>
          ≈ 30 s
        </span>
      </div>
      <div className="px-gutter pt-1">
        <FictionalBadge />
      </div>
      <main className="mt-3 space-y-2 px-gutter">
        <Section n={1} title="Client">
          <label className="flex h-touch items-center gap-3 rounded-md bg-surface px-4 shadow-control">
            <Svg className="h-5 w-5 text-text-muted">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </Svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-ink outline-none"
              aria-label="Rechercher un client"
            />
          </label>
          {customer ? (
            <button
              type="button"
              onClick={() => setCustomerId(customer.id)}
              className="mt-3 flex w-full items-center gap-3 rounded-md bg-primary-subtle p-3 text-left ring-2 ring-primary"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface font-semibold text-primary" aria-hidden>
                {customer.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{customer.name}</p>
                <p className="text-sm text-text-muted">
                  {customer.area} · {customer.phone}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-sm bg-success-bg px-2.5 text-badge text-success-text">
                    <Svg className="h-4 w-4" strokeWidth={2.25}>
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </Svg>
                    {customer.reliability === "fiable" ? "Fiable" : customer.reliability === "signale" ? "Signalé" : customer.reliability === "a_surveiller" ? "À surveiller" : "Nouveau"}
                  </span>
                  <span className="text-sm text-text-muted">
                    {customer.orders} cmd · {customer.cancellations} annulation
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Aucun client fictif pour cette recherche.</p>
          )}
          {matches.length > 1 ? (
            <ul className="mt-2 divide-y divide-line rounded-md bg-surface shadow-control">
              {matches
                .filter((item) => item.id !== customer?.id)
                .map((item) => (
                  <li key={item.id}>
                    <button type="button" className="flex h-touch w-full items-center px-4 text-left font-medium text-ink" onClick={() => { setCustomerId(item.id); setQuery(item.name); }}>
                      {item.name}
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
          <button type="button" className="mt-2 flex h-touch w-full items-center justify-center gap-2 rounded-md font-semibold text-link" onClick={() => setShowNew((value) => !value)}>
            <Svg className="h-5 w-5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </Svg>
            Nouveau client
          </button>
          {showNew ? <NewCustomer onCreate={(customer) => { setExtraCustomers((list) => [...list, customer]); setCustomerId(customer.id); setQuery(customer.name); setShowNew(false); }} /> : null}
        </Section>

        <Section n={2} title="Produits">
          <div className="divide-y divide-line">
            {priced.map((line) => (
              <div key={line.productId} className="flex items-center gap-3 py-3">
                <ProductMark kind={line.product.kind} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-5 text-ink">
                    {line.product.name}
                    {line.product.variant ? ` · ${line.product.variant}` : ""}
                  </p>
                  <p className="text-sm text-text-muted">
                    <Money value={line.product.priceFcfa} inline className="!font-medium !text-text-muted" />
                  </p>
                </div>
                <div className="flex h-touch shrink-0 items-center rounded-pill bg-surface shadow-control">
                  <button type="button" aria-label="Retirer un" className="flex h-touch w-11 items-center justify-center text-ink" onClick={() => setQty(line.productId, line.quantity - 1)}>
                    <Svg className="h-5 w-5" strokeWidth={2.5}>
                      <path d="M5 12h14" />
                    </Svg>
                  </button>
                  <span className="w-5 text-center font-semibold tabular-nums text-ink">{line.quantity}</span>
                  <button type="button" aria-label="Ajouter un" className="flex h-touch w-11 items-center justify-center text-primary" onClick={() => setQty(line.productId, line.quantity + 1)}>
                    <Svg className="h-5 w-5" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5v14" />
                    </Svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-1 flex h-touch w-full items-center justify-center gap-2 rounded-md bg-surface font-semibold text-ink shadow-control"
            onClick={() => {
              const missing = data.products.find((product) => !lines.some((line) => line.productId === product.id));
              if (missing) setLines((current) => [...current, { productId: missing.id, quantity: 1 }]);
            }}
          >
            <Svg className="h-5 w-5" strokeWidth={2.5}>
              <path d="M5 12h14M12 5v14" />
            </Svg>
            Ajouter un produit
          </button>
        </Section>

        <Section n={3} title="Livraison">
          <p className="mb-1 text-sm font-medium text-text-muted">Quartier</p>
          <label className="flex h-touch items-center gap-3 rounded-md bg-surface px-4 shadow-control">
            <Svg className="h-5 w-5 text-primary">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </Svg>
            <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} className="w-full bg-transparent font-medium text-ink outline-none" aria-label="Quartier" />
          </label>
          <p className="mb-1 mt-3 text-sm font-medium text-text-muted">Frais de livraison</p>
          <div className="flex gap-2">
            <label className="flex h-touch flex-1 items-center justify-between rounded-md bg-surface px-4 shadow-control">
              <input
                inputMode="numeric"
                value={deliveryFee}
                onChange={(event) => setDeliveryFee(Number(event.target.value.replace(/\D/g, "")) || 0)}
                className="w-24 bg-transparent font-bold text-ink outline-none"
                aria-label="Frais de livraison"
              />
              <span className="font-semibold text-text-muted">FCFA</span>
            </label>
            <span className="flex h-touch items-center rounded-md bg-surface-muted px-3 text-sm text-text-muted">{data.draft.deliveryTariffLabel}</span>
          </div>
        </Section>

        <Section n={4} title="Paiement">
          <Row label={`Produits (${articleCount} articles)`} value={subtotal} />
          <Row label="Livraison" value={deliveryFee} />
          <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
            <span className="text-lg font-semibold text-ink">Total</span>
            <Money value={total} className="text-title" />
          </div>
          <p className="mb-2 mt-4 text-sm font-medium text-text-muted">Acompte demandé</p>
          <div className="grid grid-cols-3 gap-2">
            {([30, 50, "other"] as const).map((option) => {
              const selected = deposit === option;
              return (
                <button
                  key={String(option)}
                  type="button"
                  onClick={() => setDeposit(option)}
                  className={`h-touch rounded-md font-medium ${selected ? "bg-primary-subtle font-semibold text-ink ring-2 ring-primary" : "bg-surface text-text shadow-control"}`}
                >
                  {option === "other" ? "Autre" : `${option} %`}
                </button>
              );
            })}
          </div>
          {deposit === "other" ? (
            <label className="mt-2 flex items-center gap-2 text-sm text-text-muted">
              Pourcentage
              <input
                inputMode="numeric"
                value={customPercent}
                onChange={(event) => setCustomPercent(Math.min(100, Math.max(0, Number(event.target.value) || 0)))}
                className="h-touch w-20 rounded-md bg-surface px-3 text-center font-semibold text-ink shadow-control outline-none"
              />
            </label>
          ) : null}
          <div className="mt-3 flex items-center justify-between rounded-md bg-surface-muted px-4 py-3">
            <div>
              <p className="text-sm text-text-muted">Acompte</p>
              <Money value={depositAmount} className="text-title" />
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">À la livraison</p>
              <Money value={balance} inline className="text-lg !text-text" />
            </div>
          </div>
          <p className="mb-2 mt-4 text-sm font-medium text-text-muted">Moyen de paiement de l’acompte</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Moyen de paiement">
            {METHODS.map((item) => {
              const selected = method === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMethod(item.id)}
                  className={`flex h-touch shrink-0 items-center gap-2 rounded-pill px-4 font-medium ${selected ? "bg-primary-subtle text-ink ring-2 ring-primary" : "bg-surface text-text shadow-control"}`}
                >
                  <span className={`h-3.5 w-3.5 rounded-full ${item.dot}`} aria-hidden />
                  {item.label}
                  {selected ? (
                    <Svg className="h-5 w-5 text-primary" strokeWidth={2.5}>
                      <path d="M20 6 9 17l-5-5" />
                    </Svg>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-text-muted">
            <Svg className="mt-0.5 h-4 w-4 text-success-fill" strokeWidth={2.25}>
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </Svg>
            La cliente paie l’acompte par lien. Rien n’est expédié avant le paiement.
          </p>
          {result ? <p className="mt-3 rounded-md bg-info-surface p-3 text-sm text-info-text">{result}</p> : null}
        </Section>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[390px] border-t border-line bg-surface px-gutter pt-3 pb-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-text-muted">
            Total <span className="ml-1"><Money value={total} inline className="text-md" /></span>
          </span>
          <span className="text-text-muted">
            Acompte <span className="ml-1"><Money value={depositAmount} inline className="text-md !text-primary" /></span>
          </span>
        </div>
        <button type="button" disabled={creating || !customer} onClick={() => void generateLink()} className="flex h-cta w-full items-center justify-center gap-2 rounded-pill bg-primary text-lg font-semibold text-primary-on shadow-cta disabled:opacity-60">
          <Svg className="h-6 w-6" strokeWidth={2.25}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </Svg>
          {creating ? "Préparation…" : "Générer le lien d’acompte"}
        </button>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-on">{n}</span>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-text-muted">{label}</span>
      <Money value={value} inline className="text-md !font-semibold !text-text" />
    </div>
  );
}

function ProductMark({ kind }: { kind: Product["kind"] }) {
  const tone = kind === "apparel" ? "bg-primary-subtle text-primary" : "bg-warning-surface text-warning-text";
  return (
    <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md ${tone}`} aria-label="Photo du produit (espace réservé)">
      {kind === "apparel" ? (
        <Svg className="relative h-6 w-6" strokeWidth={1.5}>
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </Svg>
      ) : (
        <Svg className="relative h-6 w-6" strokeWidth={1.5}>
          <rect x="5" y="8" width="14" height="13" rx="3" />
          <path d="M7 8V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
          <path d="M9 14h6" />
        </Svg>
      )}
    </div>
  );
}

function NewCustomer({ onCreate }: { onCreate: (customer: Customer) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <form
      className="mt-2 space-y-2 rounded-md bg-surface-muted p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        const initials = name
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("");
        onCreate({
          id: `local-${crypto.randomUUID()}`,
          name: name.trim(),
          initials: initials || "NC",
          phone: phone || "—",
          area: "À préciser",
          reliability: "nouveau",
          orders: 0,
          cancellations: 0,
        });
      }}
    >
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom" className="h-touch w-full rounded-md bg-surface px-3 shadow-control outline-none" />
      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Téléphone" className="h-touch w-full rounded-md bg-surface px-3 shadow-control outline-none" />
      <button type="submit" className="h-touch w-full rounded-md bg-primary font-semibold text-primary-on">
        Enregistrer en local
      </button>
    </form>
  );
}

export type { OrderDraft };
