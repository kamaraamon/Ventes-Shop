import { sql } from "drizzle-orm";
import {
  customType,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { ParcelGeometry } from "../geometry";

/**
 * geometry(Geometry, 4326) : Point ou Polygon.
 * Drizzle n'échange pas le GeoJSON tout seul : écrire avec geomFromGeoJson,
 * lire avec parcelGeomAsGeoJson (ST_GeomFromGeoJSON / ST_AsGeoJSON).
 */
export const postgisGeometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geometry(Geometry,4326)";
  },
});

export function geomFromGeoJson(geometry: ParcelGeometry) {
  return sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(geometry)}), 4326)`;
}

export function parcelGeomAsGeoJson(column: { name: string } = { name: "geom" }) {
  return sql<string>`ST_AsGeoJSON(${sql.raw(`"${column.name}"`)})`;
}

export const complianceStatus = pgEnum("ct_compliance_status", ["conforme", "a_verifier", "non_conforme"]);

export const deforestationStatus = pgEnum("ct_deforestation_status", ["conforme", "a_verifier", "non_conforme"]);

export const weighingGrade = pgEnum("ct_weighing_grade", ["grade_i", "grade_ii", "hors_norme"]);

export const ctPaymentKind = pgEnum("ct_payment_kind", ["achat", "prime"]);

export const ctPaymentStatus = pgEnum("ct_payment_status", ["en_attente", "paye", "echec"]);

export const ctCooperatives = pgTable("ct_cooperatives", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  campaignLabel: text("campaign_label").notNull(),
});

export const ctProducers = pgTable("ct_producers", {
  id: uuid("id").primaryKey().defaultRandom(),
  cooperativeId: uuid("cooperative_id")
    .notNull()
    .references(() => ctCooperatives.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  fullName: text("full_name").notNull(),
  village: text("village"),
  section: text("section"),
  phone: text("phone"),
});

export const ctParcels = pgTable(
  "ct_parcels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    producerId: uuid("producer_id")
      .notNull()
      .references(() => ctProducers.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    areaHa: numeric("area_ha", { precision: 8, scale: 2 }).notNull(),
    village: text("village"),
    geom: postgisGeometry("geom").notNull(),
    compliance: complianceStatus("compliance").notNull().default("a_verifier"),
    /**
     * Saisie manuelle. Aucun appel Earth Engine : le budget n'est pas décidé.
     */
    deforestationStatus: deforestationStatus("deforestation_status"),
    deforestationNote: text("deforestation_note"),
  },
  (table) => [index("ct_parcels_geom_gix").using("gist", table.geom)],
);

export const ctLots = pgTable("ct_lots", {
  id: uuid("id").primaryKey().defaultRandom(),
  cooperativeId: uuid("cooperative_id")
    .notNull()
    .references(() => ctCooperatives.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  formedOn: date("formed_on").notNull(),
  storeName: text("store_name").notNull(),
  netKg: numeric("net_kg", { precision: 12, scale: 1 }).notNull(),
  bags: integer("bags").notNull(),
  producerCount: integer("producer_count").notNull(),
  compliance: complianceStatus("compliance").notNull(),
  destination: text("destination").notNull(),
});

export const ctLotParcels = pgTable(
  "ct_lot_parcels",
  {
    lotId: uuid("lot_id")
      .notNull()
      .references(() => ctLots.id, { onDelete: "cascade" }),
    parcelId: uuid("parcel_id")
      .notNull()
      .references(() => ctParcels.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.lotId, table.parcelId] })],
);

export const ctWeighings = pgTable("ct_weighings", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** UUID généré sur le téléphone. Contrainte d'unicité = synchro idempotente. */
  clientId: uuid("client_id").notNull().unique(),
  cooperativeId: uuid("cooperative_id")
    .notNull()
    .references(() => ctCooperatives.id),
  producerId: uuid("producer_id")
    .notNull()
    .references(() => ctProducers.id),
  parcelId: uuid("parcel_id").references(() => ctParcels.id),
  lotId: uuid("lot_id").references(() => ctLots.id),
  storeName: text("store_name").notNull(),
  bags: integer("bags").notNull(),
  grossKg: numeric("gross_kg", { precision: 12, scale: 1 }).notNull(),
  tareKg: numeric("tare_kg", { precision: 12, scale: 1 }).notNull(),
  netKg: numeric("net_kg", { precision: 12, scale: 1 }).notNull(),
  moisturePct: numeric("moisture_pct", { precision: 4, scale: 1 }),
  moldPct: numeric("mold_pct", { precision: 4, scale: 1 }),
  grade: weighingGrade("grade").notNull(),
  priceFcfaPerKg: integer("price_fcfa_per_kg").notNull(),
  amountFcfa: integer("amount_fcfa").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
});

export const ctPayments = pgTable("ct_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  producerId: uuid("producer_id")
    .notNull()
    .references(() => ctProducers.id),
  weighingId: uuid("weighing_id").references(() => ctWeighings.id),
  kind: ctPaymentKind("kind").notNull(),
  amountFcfa: integer("amount_fcfa").notNull(),
  status: ctPaymentStatus("status").notNull().default("en_attente"),
  channel: text("channel").notNull().default("mobile_money"),
  periodLabel: text("period_label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
