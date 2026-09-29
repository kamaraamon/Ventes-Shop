import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const customerReliability = pgEnum("vp_customer_reliability", [
  "fiable",
  "a_surveiller",
  "signale",
  "nouveau",
]);

export const orderStatus = pgEnum("vp_order_status", [
  "acompte_en_attente",
  "en_cours",
  "livree",
  "annulee",
]);

export const paymentMethod = pgEnum("vp_payment_method", ["orange_money", "mtn_momo", "wave"]);

export const paymentPurpose = pgEnum("vp_payment_purpose", ["acompte", "solde"]);

export const paymentStatus = pgEnum("vp_payment_status", ["pending", "paid", "failed"]);

export const deliveryStatus = pgEnum("vp_delivery_status", ["a_preparer", "en_cours", "livree", "annulee"]);

export const vpSellers = pgTable("vp_sellers", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  shopName: text("shop_name").notNull(),
  area: text("area").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vpProducts = pgTable("vp_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => vpSellers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  variant: text("variant"),
  priceFcfa: integer("price_fcfa").notNull(),
  stock: integer("stock").notNull().default(0),
});

export const vpCustomers = pgTable("vp_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => vpSellers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  area: text("area"),
  reliability: customerReliability("reliability").notNull().default("nouveau"),
  ordersCount: integer("orders_count").notNull().default(0),
  cancellationsCount: integer("cancellations_count").notNull().default(0),
});

export const vpOrders = pgTable("vp_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => vpSellers.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => vpCustomers.id),
  number: integer("number").notNull(),
  status: orderStatus("status").notNull(),
  subtotalFcfa: integer("subtotal_fcfa").notNull(),
  deliveryFeeFcfa: integer("delivery_fee_fcfa").notNull().default(0),
  totalFcfa: integer("total_fcfa").notNull(),
  depositPercent: integer("deposit_percent").notNull().default(0),
  depositFcfa: integer("deposit_fcfa").notNull().default(0),
  paymentMethod: paymentMethod("payment_method"),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vpOrderItems = pgTable("vp_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => vpOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => vpProducts.id),
  label: text("label").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceFcfa: integer("unit_price_fcfa").notNull(),
});

export const vpDeliveries = pgTable("vp_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => vpOrders.id, { onDelete: "cascade" }),
  area: text("area").notNull(),
  address: text("address"),
  feeFcfa: integer("fee_fcfa").notNull().default(0),
  status: deliveryStatus("status").notNull().default("a_preparer"),
});

export const vpPayments = pgTable("vp_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => vpOrders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("cinetpay"),
  transactionId: text("transaction_id").notNull().unique(),
  amountFcfa: integer("amount_fcfa").notNull(),
  purpose: paymentPurpose("purpose").notNull(),
  method: paymentMethod("method"),
  status: paymentStatus("status").notNull().default("pending"),
  /** Renseigné seulement après /v2/payment/check. */
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
