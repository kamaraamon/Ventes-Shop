export type GroupingMode = "narrow" | "nbsp";

const NBSP = "\u00A0";
const NNBSP = "\u202F";

/** Intl fr-FR, puis U+202F → U+00A0 quand la police (IBM Plex) n'a pas l'espace fine. */
export function formatNumber(value: number, digits = 0, mode: GroupingMode = "narrow"): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  if (mode === "nbsp") return formatted.replaceAll(NNBSP, NBSP);
  return formatted;
}

/**
 * Montant FCFA. On n'utilise pas `style: "currency"` avec XOF, qui affiche « F CFA ».
 * L'espace avant FCFA est toujours insécable (U+00A0).
 */
export function formatFcfa(value: number, mode: GroupingMode = "narrow"): string {
  return `${formatNumber(Math.round(value), 0, mode)}${NBSP}FCFA`;
}

export function splitFcfa(value: number, mode: GroupingMode = "narrow"): { amount: string; currency: "FCFA" } {
  const full = formatFcfa(value, mode);
  return { amount: full.slice(0, -`${NBSP}FCFA`.length), currency: "FCFA" };
}
