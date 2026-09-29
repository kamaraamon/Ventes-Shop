import type { OrderStatus } from "@vpct/db/mock";
import type { ReactNode } from "react";
import { Svg } from "./svg";

const STATUS: Record<OrderStatus, { label: string; className: string; icon: ReactNode }> = {
  en_cours: {
    label: "En cours",
    className: "bg-info-bg text-info-text",
    icon: (
      <Svg className="h-4 w-4" strokeWidth={2.25}>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </Svg>
    ),
  },
  acompte_en_attente: {
    label: "Acompte en attente",
    // #FFB800 (--color-warning-fill) reste un fond ou une pastille. Le texte utilise --color-warning-text.
    className: "bg-warning-bg text-warning-text",
    icon: (
      <Svg className="h-4 w-4" strokeWidth={2.25}>
        <path d="M5 22h14M5 2h14" />
        <path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22" />
        <path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2" />
      </Svg>
    ),
  },
  livree: {
    label: "Livrée",
    className: "bg-success-bg text-success-text",
    icon: (
      <Svg className="h-4 w-4" strokeWidth={2.25}>
        <path d="M20 6 9 17l-5-5" />
      </Svg>
    ),
  },
  annulee: {
    label: "Annulée",
    className: "bg-critical-bg text-critical-text",
    icon: (
      <Svg className="h-4 w-4" strokeWidth={2.25}>
        <path d="M18 6 6 18M6 6l12 12" />
      </Svg>
    ),
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const item = STATUS[status];
  return (
    <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 text-badge ${item.className}`}>
      {item.icon}
      {item.label}
    </span>
  );
}

const AVATAR: Record<OrderStatus, string> = {
  en_cours: "bg-info-surface text-info-text",
  acompte_en_attente: "bg-warning-surface text-warning-text",
  livree: "bg-success-surface text-success-text",
  annulee: "bg-critical-surface text-critical-text",
};

export function statusAvatarClass(status: OrderStatus) {
  return AVATAR[status];
}
