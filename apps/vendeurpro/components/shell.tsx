import Link from "next/link";
import type { ReactNode } from "react";
import { Svg } from "./svg";

type NavKey = "home" | "orders" | "create" | "catalog" | "clients";

export function PhoneShell({
  children,
  active,
  pad = "pb-[112px]",
}: {
  children: ReactNode;
  active: NavKey | "none";
  pad?: string;
}) {
  return (
    <div className={`mx-auto min-h-screen w-full max-w-[390px] bg-bg ${pad}`}>
      {children}
      {active !== "none" ? <BottomNav active={active} /> : null}
    </div>
  );
}

function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-line bg-surface"
      aria-label="Navigation principale"
    >
      <div className="flex h-nav-bottom items-stretch px-1 pt-1">
        <NavItem href="/" label="Accueil" current={active === "home"}>
          <Svg>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </Svg>
        </NavItem>
        <NavItem href="/commandes" label="Commandes" current={active === "orders"}>
          <Svg>
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
          </Svg>
        </NavItem>
        <div className="flex flex-1 flex-col items-center justify-end gap-1 pb-[3px]">
          <Link
            href="/commandes/nouvelle"
            aria-label="Créer une commande"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-on shadow-raised ring-4 ring-surface"
          >
            <Svg className="h-7 w-7" strokeWidth={2.5}>
              <path d="M5 12h14M12 5v14" />
            </Svg>
          </Link>
          <span className="text-xs font-semibold text-primary">Créer</span>
        </div>
        <NavItem href="/catalogue" label="Catalogue" current={active === "catalog"}>
          <Svg>
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </Svg>
        </NavItem>
        <NavItem href="/clients" label="Clients" current={active === "clients"}>
          <Svg>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </Svg>
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  current,
  children,
}: {
  href: string;
  label: string;
  current: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-touch flex-1 flex-col items-center justify-center gap-1 ${current ? "text-ink" : "text-text-muted"}`}
      aria-current={current ? "page" : undefined}
    >
      <span className={`flex h-8 w-14 items-center justify-center rounded-pill ${current ? "bg-primary-subtle text-primary" : ""}`}>
        {children}
      </span>
      <span className={`text-xs ${current ? "font-semibold" : "font-medium"}`}>{label}</span>
    </Link>
  );
}

export function FictionalBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-warning-surface px-2.5 py-1 text-xs font-semibold text-warning-text ring-1 ring-inset ring-warning-bg">
      <Svg className="h-3.5 w-3.5" strokeWidth={2.25}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </Svg>
      Données fictives — maquette
    </span>
  );
}
