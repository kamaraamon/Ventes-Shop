import "server-only";
import { hasDatabaseUrl } from "@vpct/config";
import { count } from "drizzle-orm";
import { createDb } from "./client";
import { emptyVendeurDashboard, vendeurDashboard, type VendeurDashboard } from "./mock/vendeurpro";
import { vpSellers } from "./schema/vendeurpro";

export type DataSource = "mock" | "database" | "error";

export interface VendeurDashboardResult {
  source: DataSource;
  fictional: boolean;
  dashboard: VendeurDashboard;
  message?: string;
}

/**
 * Sans DATABASE_URL : jeu fictif. Avec une URL : lecture Neon.
 * Une base vide ne réinjecte pas les données fictives.
 */
export async function getVendeurDashboard(): Promise<VendeurDashboardResult> {
  if (!hasDatabaseUrl()) {
    return { source: "mock", fictional: true, dashboard: vendeurDashboard };
  }
  try {
    const db = createDb(process.env.DATABASE_URL as string);
    const [row] = await db.select({ value: count() }).from(vpSellers);
    if (!row || row.value === 0) {
      return { source: "database", fictional: false, dashboard: emptyVendeurDashboard() };
    }
    return {
      source: "database",
      fictional: false,
      dashboard: emptyVendeurDashboard(),
      message: "La base contient des vendeurs. Le mapping complet des commandes n’est pas dans ce socle.",
    };
  } catch (error) {
    return {
      source: "error",
      fictional: false,
      dashboard: emptyVendeurDashboard(),
      message: error instanceof Error ? error.message : "Lecture impossible",
    };
  }
}
