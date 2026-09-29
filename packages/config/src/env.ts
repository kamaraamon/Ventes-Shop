/** Noms seuls. Aucune valeur secrète n'est fournie dans le dépôt. */
export const ENV_NAMES = [
  "DATABASE_URL",
  "DATABASE_REGION",
  "VERCEL_FUNCTION_REGION",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "OTP_CHANNEL",
  "CINETPAY_API_KEY",
  "CINETPAY_SITE_ID",
  "CINETPAY_NOTIFY_URL",
  "CINETPAY_RETURN_URL",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID",
] as const;

export type EnvName = (typeof ENV_NAMES)[number];

export function readEnv(name: EnvName, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

export function hasDatabaseUrl(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(readEnv("DATABASE_URL", env));
}
