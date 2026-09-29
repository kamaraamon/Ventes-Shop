/**
 * Régions proposées par la stack, pas une décision d'hébergement.
 * Neon n'a pas de région Afrique. Un transfert de données personnelles hors
 * CEDEAO exige une autorisation préalable de l'ARTCI (loi n° 2013-450).
 * Surcharger via les variables d'environnement, sans données personnelles réelles.
 */
export const PROPOSED_COMPUTE_REGION = "fra1";
export const PROPOSED_DATABASE_REGION = "aws-eu-central-1";

export function getComputeRegion(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.VERCEL_FUNCTION_REGION?.trim();
  return value || PROPOSED_COMPUTE_REGION;
}

export function getDatabaseRegion(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.DATABASE_REGION?.trim();
  return value || PROPOSED_DATABASE_REGION;
}
