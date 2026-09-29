/**
 * Jeu fictif VendeurPro. Aucune personne réelle.
 * Les totaux du jour sont un instantané : la liste « récentes » n'est qu'un extrait.
 */
export const FICTIONAL = true;
export const FICTIONAL_LABEL = "Données fictives — maquette";

export type Reliability = "fiable" | "a_surveiller" | "signale" | "nouveau";
export type OrderStatus = "en_cours" | "acompte_en_attente" | "livree" | "annulee";
export type PayMethod = "orange_money" | "mtn_momo" | "wave";

export interface Seller {
  id: string;
  displayName: string;
  shopName: string;
  area: string;
  initials: string;
}

export interface Product {
  id: string;
  name: string;
  variant: string | null;
  priceFcfa: number;
  kind: "apparel" | "jar";
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  phone: string;
  area: string;
  reliability: Reliability;
  orders: number;
  cancellations: number;
}

export interface RecentOrder {
  id: string;
  number: number;
  customerName: string;
  initials: string;
  summary: string;
  totalFcfa: number;
  status: OrderStatus;
}

export interface DaySummary {
  label: string;
  salesFcfa: number;
  deltaLabel: string;
  inProgress: number;
  delivered: number;
  cancelled: number;
  depositsReceivedFcfa: number;
  pendingDeposits: number;
}

export interface OrderDraft {
  customerId: string;
  lines: { productId: string; quantity: number }[];
  neighborhood: string;
  deliveryFeeFcfa: number;
  deliveryTariffLabel: string;
}

export const seller: Seller = {
  id: "sel_awa",
  displayName: "Awa",
  shopName: "Awa Couture",
  area: "Cocody",
  initials: "AC",
};

export const products: Product[] = [
  { id: "prd_robe", name: "Robe wax « Adjoua »", variant: "M", priceFcfa: 15000, kind: "apparel" },
  { id: "prd_karite", name: "Beurre de karité 250 g", variant: null, priceFcfa: 3500, kind: "jar" },
];

export const customers: Customer[] = [
  {
    id: "cus_aya",
    name: "Aya Kouassi",
    initials: "AK",
    phone: "07 07 12 34 56",
    area: "Cocody Angré",
    reliability: "fiable",
    orders: 8,
    cancellations: 0,
  },
  {
    id: "cus_aminata",
    name: "Aminata Koné",
    initials: "AK",
    phone: "07 08 11 22 33",
    area: "Marcory",
    reliability: "fiable",
    orders: 3,
    cancellations: 0,
  },
  {
    id: "cus_mariam",
    name: "Mariam Traoré",
    initials: "MT",
    phone: "05 05 44 33 22",
    area: "Yopougon",
    reliability: "fiable",
    orders: 5,
    cancellations: 0,
  },
  {
    id: "cus_koffi",
    name: "Koffi Brou",
    initials: "KB",
    phone: "01 01 90 80 70",
    area: "Abobo",
    reliability: "signale",
    orders: 2,
    cancellations: 2,
  },
  {
    id: "cus_jean",
    name: "Jean-Marc Yao",
    initials: "JY",
    phone: "07 09 55 66 77",
    area: "Plateau",
    reliability: "nouveau",
    orders: 1,
    cancellations: 0,
  },
];

export const daySummary: DaySummary = {
  label: "Lun. 28 sept.",
  salesFcfa: 87500,
  deltaLabel: "+12 % par rapport à hier",
  inProgress: 4,
  delivered: 6,
  cancelled: 1,
  depositsReceivedFcfa: 35000,
  pendingDeposits: 2,
};

export const recentOrders: RecentOrder[] = [
  {
    id: "ord_0142",
    number: 142,
    customerName: "Aminata Koné",
    initials: "AK",
    summary: "2 × Robe wax · Marcory",
    totalFcfa: 32000,
    status: "en_cours",
  },
  {
    id: "ord_0143",
    number: 143,
    customerName: "Aya Kouassi",
    initials: "AK",
    summary: "Robe + karité · Cocody",
    totalFcfa: 24000,
    status: "acompte_en_attente",
  },
  {
    id: "ord_0141",
    number: 141,
    customerName: "Mariam Traoré",
    initials: "MT",
    summary: "Écouteurs sans fil · Yopougon",
    totalFcfa: 13500,
    status: "livree",
  },
  {
    id: "ord_0140",
    number: 140,
    customerName: "Koffi Brou",
    initials: "KB",
    summary: "Montre connectée · Abobo",
    totalFcfa: 24500,
    status: "annulee",
  },
  {
    id: "ord_0139",
    number: 139,
    customerName: "Jean-Marc Yao",
    initials: "JY",
    summary: "Sérum éclat · Plateau",
    totalFcfa: 9000,
    status: "livree",
  },
];

export const orderDraft: OrderDraft = {
  customerId: "cus_aya",
  lines: [
    { productId: "prd_robe", quantity: 1 },
    { productId: "prd_karite", quantity: 2 },
  ],
  neighborhood: "Cocody · Angré 8ᵉ tranche",
  deliveryFeeFcfa: 2000,
  deliveryTariffLabel: "Tarif Cocody",
};

export interface VendeurDashboard {
  seller: Seller;
  day: DaySummary;
  orders: RecentOrder[];
  products: Product[];
  customers: Customer[];
  draft: OrderDraft;
}

export const vendeurDashboard: VendeurDashboard = {
  seller,
  day: daySummary,
  orders: recentOrders,
  products,
  customers,
  draft: orderDraft,
};

export function emptyVendeurDashboard(): VendeurDashboard {
  return {
    seller: { id: "", displayName: "", shopName: "", area: "", initials: "" },
    day: {
      label: "",
      salesFcfa: 0,
      deltaLabel: "",
      inProgress: 0,
      delivered: 0,
      cancelled: 0,
      depositsReceivedFcfa: 0,
      pendingDeposits: 0,
    },
    orders: [],
    products: [],
    customers: [],
    draft: {
      customerId: "",
      lines: [],
      neighborhood: "",
      deliveryFeeFcfa: 0,
      deliveryTariffLabel: "",
    },
  };
}
