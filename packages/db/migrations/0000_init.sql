CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint

CREATE TYPE "vp_customer_reliability" AS ENUM ('fiable', 'a_surveiller', 'signale', 'nouveau');
--> statement-breakpoint
CREATE TYPE "vp_order_status" AS ENUM ('acompte_en_attente', 'en_cours', 'livree', 'annulee');
--> statement-breakpoint
CREATE TYPE "vp_payment_method" AS ENUM ('orange_money', 'mtn_momo', 'wave');
--> statement-breakpoint
CREATE TYPE "vp_payment_purpose" AS ENUM ('acompte', 'solde');
--> statement-breakpoint
CREATE TYPE "vp_payment_status" AS ENUM ('pending', 'paid', 'failed');
--> statement-breakpoint
CREATE TYPE "vp_delivery_status" AS ENUM ('a_preparer', 'en_cours', 'livree', 'annulee');
--> statement-breakpoint
CREATE TYPE "ct_compliance_status" AS ENUM ('conforme', 'a_verifier', 'non_conforme');
--> statement-breakpoint
CREATE TYPE "ct_deforestation_status" AS ENUM ('conforme', 'a_verifier', 'non_conforme');
--> statement-breakpoint
CREATE TYPE "ct_weighing_grade" AS ENUM ('grade_i', 'grade_ii', 'hors_norme');
--> statement-breakpoint
CREATE TYPE "ct_payment_kind" AS ENUM ('achat', 'prime');
--> statement-breakpoint
CREATE TYPE "ct_payment_status" AS ENUM ('en_attente', 'paye', 'echec');
--> statement-breakpoint

CREATE TABLE "vp_sellers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "display_name" text NOT NULL,
  "shop_name" text NOT NULL,
  "area" text NOT NULL,
  "phone" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vp_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "seller_id" uuid NOT NULL REFERENCES "vp_sellers"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "variant" text,
  "price_fcfa" integer NOT NULL,
  "stock" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vp_customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "seller_id" uuid NOT NULL REFERENCES "vp_sellers"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "phone" text,
  "area" text,
  "reliability" "vp_customer_reliability" DEFAULT 'nouveau' NOT NULL,
  "orders_count" integer DEFAULT 0 NOT NULL,
  "cancellations_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vp_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "seller_id" uuid NOT NULL REFERENCES "vp_sellers"("id") ON DELETE cascade,
  "customer_id" uuid NOT NULL REFERENCES "vp_customers"("id"),
  "number" integer NOT NULL,
  "status" "vp_order_status" NOT NULL,
  "subtotal_fcfa" integer NOT NULL,
  "delivery_fee_fcfa" integer DEFAULT 0 NOT NULL,
  "total_fcfa" integer NOT NULL,
  "deposit_percent" integer DEFAULT 0 NOT NULL,
  "deposit_fcfa" integer DEFAULT 0 NOT NULL,
  "payment_method" "vp_payment_method",
  "summary" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vp_order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "vp_orders"("id") ON DELETE cascade,
  "product_id" uuid REFERENCES "vp_products"("id"),
  "label" text NOT NULL,
  "quantity" integer NOT NULL,
  "unit_price_fcfa" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vp_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "vp_orders"("id") ON DELETE cascade,
  "area" text NOT NULL,
  "address" text,
  "fee_fcfa" integer DEFAULT 0 NOT NULL,
  "status" "vp_delivery_status" DEFAULT 'a_preparer' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vp_payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "vp_orders"("id") ON DELETE cascade,
  "provider" text DEFAULT 'cinetpay' NOT NULL,
  "transaction_id" text NOT NULL UNIQUE,
  "amount_fcfa" integer NOT NULL,
  "purpose" "vp_payment_purpose" NOT NULL,
  "method" "vp_payment_method",
  "status" "vp_payment_status" DEFAULT 'pending' NOT NULL,
  "verified_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "ct_cooperatives" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "campaign_label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ct_producers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cooperative_id" uuid NOT NULL REFERENCES "ct_cooperatives"("id") ON DELETE cascade,
  "code" text NOT NULL,
  "full_name" text NOT NULL,
  "village" text,
  "section" text,
  "phone" text
);
--> statement-breakpoint
CREATE TABLE "ct_parcels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "producer_id" uuid NOT NULL REFERENCES "ct_producers"("id") ON DELETE cascade,
  "code" text NOT NULL,
  "area_ha" numeric(8, 2) NOT NULL,
  "village" text,
  "geom" geometry(Geometry, 4326) NOT NULL,
  "compliance" "ct_compliance_status" DEFAULT 'a_verifier' NOT NULL,
  "deforestation_status" "ct_deforestation_status",
  "deforestation_note" text
);
--> statement-breakpoint
COMMENT ON COLUMN "ct_parcels"."deforestation_status" IS 'Saisie manuelle. Contrôle Earth Engine non branché : budget non décidé.';
--> statement-breakpoint
CREATE INDEX "ct_parcels_geom_gix" ON "ct_parcels" USING gist ("geom");
--> statement-breakpoint
CREATE TABLE "ct_lots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cooperative_id" uuid NOT NULL REFERENCES "ct_cooperatives"("id") ON DELETE cascade,
  "code" text NOT NULL UNIQUE,
  "formed_on" date NOT NULL,
  "store_name" text NOT NULL,
  "net_kg" numeric(12, 1) NOT NULL,
  "bags" integer NOT NULL,
  "producer_count" integer NOT NULL,
  "compliance" "ct_compliance_status" NOT NULL,
  "destination" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ct_lot_parcels" (
  "lot_id" uuid NOT NULL REFERENCES "ct_lots"("id") ON DELETE cascade,
  "parcel_id" uuid NOT NULL REFERENCES "ct_parcels"("id") ON DELETE cascade,
  PRIMARY KEY ("lot_id", "parcel_id")
);
--> statement-breakpoint
CREATE TABLE "ct_weighings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL UNIQUE,
  "cooperative_id" uuid NOT NULL REFERENCES "ct_cooperatives"("id"),
  "producer_id" uuid NOT NULL REFERENCES "ct_producers"("id"),
  "parcel_id" uuid REFERENCES "ct_parcels"("id"),
  "lot_id" uuid REFERENCES "ct_lots"("id"),
  "store_name" text NOT NULL,
  "bags" integer NOT NULL,
  "gross_kg" numeric(12, 1) NOT NULL,
  "tare_kg" numeric(12, 1) NOT NULL,
  "net_kg" numeric(12, 1) NOT NULL,
  "moisture_pct" numeric(4, 1),
  "mold_pct" numeric(4, 1),
  "grade" "ct_weighing_grade" NOT NULL,
  "price_fcfa_per_kg" integer NOT NULL,
  "amount_fcfa" integer NOT NULL,
  "recorded_at" timestamptz NOT NULL,
  "synced_at" timestamptz
);
--> statement-breakpoint
CREATE TABLE "ct_payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "producer_id" uuid NOT NULL REFERENCES "ct_producers"("id"),
  "weighing_id" uuid REFERENCES "ct_weighings"("id"),
  "kind" "ct_payment_kind" NOT NULL,
  "amount_fcfa" integer NOT NULL,
  "status" "ct_payment_status" DEFAULT 'en_attente' NOT NULL,
  "channel" text DEFAULT 'mobile_money' NOT NULL,
  "period_label" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" boolean DEFAULT false NOT NULL,
  "image" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "phone_number" text UNIQUE,
  "phone_number_verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamptz,
  "refresh_token_expires_at" timestamptz,
  "scope" text,
  "password" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
