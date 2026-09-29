/**
 * CoopTrace — thème ApexCharts construit à partir des tokens CSS (tokens.css).
 *
 * ApexCharts calcule des dégradés et des teintes à partir des couleurs : il lui faut des hex,
 * pas des var(--…). On lit donc les variables au runtime avec getComputedStyle sur l'élément
 * du graphique (ce qui respecte le mode terrain [data-density="field"] d'un conteneur), puis on
 * normalise chaque valeur en #RRGGBB via un canvas 1×1 (hex, rgb(), hsl(), oklch()… acceptés).
 * Hors navigateur (rendu serveur, tests), les valeurs de repli ci-dessous sont utilisées.
 *
 * IBM Plex Sans n'a pas le glyphe U+202F (espace fine insécable) qu'Intl.NumberFormat('fr-FR')
 * insère entre les milliers : tous les formateurs de ce fichier le remplacent par U+00A0.
 *
 * ── Usage Next.js 16 (App Router) ───────────────────────────────────────────────────────────
 * Le thème lit le DOM : il doit tourner dans un composant client. `ssr: false` n'est accepté par
 * next/dynamic QUE dans un composant client (doc Next.js « Lazy Loading »).
 *
 *   'use client';
 *   import dynamic from 'next/dynamic';
 *   import { useEffect, useRef, useState } from 'react';
 *   import type { ApexOptions } from 'apexcharts';
 *   import { buildApexTheme, mergeApexOptions, formatFCFA } from '@repo/tokens/cooptrace/apex-theme';
 *
 *   const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
 *
 *   export function PaiementsMensuels({ data }: { data: number[] }) {
 *     const ref = useRef<HTMLDivElement>(null);
 *     const [theme, setTheme] = useState<ApexOptions | null>(null);
 *     useEffect(() => { if (ref.current) setTheme(buildApexTheme(ref.current)); }, []);
 *     return (
 *       <div ref={ref} className="h-[300px]">
 *         {theme && (
 *           <Chart type="bar" height={300} series={[{ name: 'Paiements', data }]}
 *             options={mergeApexOptions(theme, {
 *               xaxis: { categories: ['janv.', 'févr.', 'mars'] },
 *               yaxis: { labels: { formatter: (v: number) => formatFCFA(v, { compact: true }) } },
 *               tooltip: { y: { formatter: (v: number) => formatFCFA(v) } },
 *             })} />
 *         )}
 *       </div>
 *     );
 *   }
 *
 * Si data-density change à chaud (bascule bureau/terrain), recalculer : setTheme(buildApexTheme(ref.current)).
 * Infobulle : ApexCharts 7 la stylise en CSS (variables --apx-tt-*). Coller APEX_TOOLTIP_CSS
 * (plus bas) dans globals.css, après shadcn-bridge.css.
 * Statuts de conformité dans un graphique : utiliser statusColors(), jamais chart-1…5.
 */
import type { ApexOptions } from 'apexcharts';

type ApexLocale = NonNullable<NonNullable<ApexOptions['chart']>['locales']>[number];

/** Valeurs de repli = tokens.css (à garder synchronisées). */
export const FALLBACK = {
  '--chart-1': '#5C3A25',
  '--chart-2': '#2F5DA8',
  '--chart-3': '#AE8170',
  '--chart-4': '#58354B',
  '--chart-5': '#7E8BB4',
  '--fg-default': '#25211D',
  '--fg-muted': '#685F56',
  '--fg-brand': '#45291A',
  '--border-default': '#E2DDD6',
  '--border-strong': '#CBC4BA',
  '--surface-card': '#FFFFFF',
  '--status-ok-dot': '#3A8659',
  '--status-ok-fg': '#1B472F',
  '--status-ok-bg': '#EFF7F1',
  '--status-ok-border': '#B6DBC2',
  '--status-warn-dot': '#B07D0A',
  '--status-warn-fg': '#6E4A00',
  '--status-warn-bg': '#FDF6E3',
  '--status-warn-border': '#FAEBC2',
  '--status-danger-dot': '#CC3B2E',
  '--status-danger-fg': '#922820',
  '--status-danger-bg': '#FCEEEC',
  '--status-danger-border': '#F8DAD5',
  '--status-neutral-dot': '#857C71',
  '--status-neutral-fg': '#38332E',
  '--status-neutral-bg': '#EFECE7',
  '--status-neutral-border': '#E2DDD6',
} as const;

type ColorToken = keyof typeof FALLBACK;

const FONT_FALLBACK = '"IBM Plex Sans", ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif';

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

// ── Normalisation couleur → #RRGGBB ────────────────────────────────────────────────────────
let ctx: CanvasRenderingContext2D | null | undefined;
const hexCache = new Map<string, string>();

function hex2(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0').toUpperCase();
}

/** Convertit n'importe quelle couleur CSS en #RRGGBB (alpha composité sur blanc). */
export function toHex(value: string, fallback: string): string {
  const v = value.trim();
  if (!v) return fallback;
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return ('#' + v.slice(1).split('').map((c) => c + c).join('')).toUpperCase();
  }
  if (!isBrowser()) return fallback;
  const cached = hexCache.get(v);
  if (cached) return cached;
  if (ctx === undefined) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (!ctx) return fallback;
  const sentinel = '#010203';
  ctx.fillStyle = sentinel;
  ctx.fillStyle = v; // valeur invalide → fillStyle inchangé
  if (ctx.fillStyle === sentinel && v.toLowerCase() !== sentinel) return fallback;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 255] = ctx.getImageData(0, 0, 1, 1).data;
  const k = a / 255;
  const out = '#' + hex2(r * k + 255 * (1 - k)) + hex2(g * k + 255 * (1 - k)) + hex2(b * k + 255 * (1 - k));
  hexCache.set(v, out);
  return out;
}

function styleOf(el?: HTMLElement): CSSStyleDeclaration | null {
  if (!isBrowser()) return null;
  return getComputedStyle(el ?? document.documentElement);
}

/** Lit un token couleur et le renvoie en hex (repli si absent). */
export function readColor(name: ColorToken, el?: HTMLElement): string {
  const cs = styleOf(el);
  return toHex(cs ? cs.getPropertyValue(name) : '', FALLBACK[name]);
}

/** true si `el` (ou <html>) est dans un conteneur data-density="field". */
export function isFieldDensity(el?: HTMLElement): boolean {
  if (!isBrowser()) return false;
  return (el ?? document.documentElement).closest('[data-density="field"]') !== null;
}

/** Toutes les couleurs et tailles utiles aux graphiques, résolues pour `el`. */
export function readChartTokens(el?: HTMLElement) {
  const c = (n: ColorToken) => readColor(n, el);
  const cs = styleOf(el);
  const field = isFieldDensity(el);
  return {
    series: [c('--chart-1'), c('--chart-2'), c('--chart-3'), c('--chart-4'), c('--chart-5')],
    text: c('--fg-default'),
    textMuted: c('--fg-muted'), // ash-600 au bureau, ash-700 en mode terrain
    brand: c('--fg-brand'),
    grid: c('--border-default'),
    axis: c('--border-strong'),
    surface: c('--surface-card'),
    fontFamily: cs?.getPropertyValue('--type-family-sans').trim() || FONT_FALLBACK,
    axisFontSize: field ? '14px' : '12px',
    legendFontSize: field ? '16px' : '13px',
    field,
  };
}

/** Palette catégorielle chart-1…5 en hex. */
export function chartColors(el?: HTMLElement): string[] {
  return readChartTokens(el).series;
}

/**
 * Couleurs des statuts métier (tokens status-* / badge-*), en hex.
 * `solid` = pastille / série de graphique (≥ 3:1 sur blanc), `text`, `soft` (fond), `border`.
 */
export function statusColors(el?: HTMLElement) {
  const c = (n: ColorToken) => readColor(n, el);
  const set = (k: 'ok' | 'warn' | 'danger' | 'neutral') => ({
    solid: c(`--status-${k}-dot`),
    text: c(`--status-${k}-fg`),
    soft: c(`--status-${k}-bg`),
    border: c(`--status-${k}-border`),
  });
  return {
    conforme: set('ok'), // vert — aussi : synchronisé, payé
    a_verifier: set('warn'), // ambre — aussi : en attente
    non_conforme: set('danger'), // rouge latérite
    hors_ligne: set('neutral'), // gris
  };
}

// ── Formats français (U+202F → U+00A0 pour IBM Plex) ─────────────────────────────────────
const plex = (s: string): string => s.replace(/\u202F/g, '\u00A0');
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const nfCompact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
const nfNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const nfPercent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });

/**
 * « 12 500 FCFA » avec espaces insécables U+00A0 (Plex n'a pas U+202F).
 * On évite style:'currency' + XOF (affiche « F CFA »). `compact: true` → « 1,3 M FCFA » (axes).
 */
export function formatFCFA(n: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(n)) return '';
  return plex((opts.compact ? nfCompact : nf0).format(n)) + '\u00A0FCFA';
}

/** Nombre au format français (« 1 250,5 »), sans U+202F. */
export function formatNombre(n: number): string {
  return Number.isFinite(n) ? plex(nfNumber.format(n)) : '';
}

/** Poids : formatKg(12500) → « 12 500 kg » ; formatKg(12500, { tonnes: true }) → « 12,5 t ». */
export function formatKg(kg: number, opts: { tonnes?: boolean } = {}): string {
  if (!Number.isFinite(kg)) return '';
  return opts.tonnes ? plex(nfNumber.format(kg / 1000)) + '\u00A0t' : plex(nf0.format(kg)) + '\u00A0kg';
}

/** Pourcentage : formatPourcent(45.5) → « 45,5 % » (entrée en points de pourcentage). */
export function formatPourcent(points: number): string {
  return Number.isFinite(points) ? plex(nfPercent.format(points / 100)) : '';
}

// ── Locale française complète pour ApexCharts ─────────────────────────────────────────────
export const FR_LOCALE: ApexLocale = {
  name: 'fr',
  options: {
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    toolbar: {
      download: 'Télécharger',
      exportToSVG: 'Télécharger en SVG',
      exportToPNG: 'Télécharger en PNG',
      exportToCSV: 'Télécharger en CSV',
      menu: 'Menu',
      selection: 'Sélection',
      selectionZoom: 'Zoom sur la sélection',
      zoomIn: 'Zoom avant',
      zoomOut: 'Zoom arrière',
      pan: 'Déplacer',
      reset: 'Réinitialiser le zoom',
      measure: 'Mesurer',
    },
  },
};

type DataLabelOpts = { w?: { config?: { chart?: { type?: string } } } } | undefined;

/**
 * Options ApexCharts de base, lues depuis les tokens de `el` (ou de <html>).
 * À fusionner avec les options propres au graphique : mergeApexOptions(buildApexTheme(el), {...}).
 */
export function buildApexTheme(el?: HTMLElement): ApexOptions {
  const t = readChartTokens(el);
  const reduceMotion = isBrowser() && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const axisLabel = { colors: t.textMuted, fontSize: t.axisFontSize, fontFamily: t.fontFamily, fontWeight: 400 };
  const num = (v: number) => (typeof v === 'number' ? formatNombre(v) : String(v));
  return {
    colors: t.series,
    chart: {
      fontFamily: t.fontFamily,
      foreColor: t.textMuted,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      locales: [FR_LOCALE],
      defaultLocale: 'fr',
      animations: { enabled: !reduceMotion && !t.field }, // terrain : pas d'animation (appareils modestes)
      redrawOnParentResize: true,
    },
    grid: {
      borderColor: t.grid,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      axisBorder: { show: true, color: t.axis },
      axisTicks: { show: false },
      labels: { style: axisLabel },
      title: { style: { color: t.text, fontFamily: t.fontFamily, fontWeight: 600 } },
    },
    yaxis: {
      labels: { style: axisLabel, formatter: num },
      title: { style: { color: t.text, fontFamily: t.fontFamily, fontWeight: 600 } },
    },
    legend: {
      fontFamily: t.fontFamily,
      fontSize: t.legendFontSize,
      fontWeight: 400,
      labels: { colors: t.text },
      itemMargin: { horizontal: 12, vertical: 4 },
    },
    tooltip: {
      theme: 'light',
      style: { fontFamily: t.fontFamily, fontSize: t.field ? '16px' : '13px' },
      y: { formatter: num },
    },
    dataLabels: {
      style: { fontFamily: t.fontFamily, fontWeight: 600, fontSize: t.axisFontSize },
      formatter: (val: string | number | number[], opts?: DataLabelOpts) => {
        const type = opts?.w?.config?.chart?.type;
        if (typeof val !== 'number') return String(val);
        return type === 'pie' || type === 'donut' ? formatPourcent(val) : formatNombre(val);
      },
    },
    // Opacité 1 : les ratios de contraste documentés (chart-1…5) supposent des aplats pleins
    // (ApexCharts éclaircit sinon les barres). Pour un graphique `area`, surcharger fill.
    fill: { opacity: 1 },
    markers: { strokeColors: t.surface, strokeWidth: 2 },
    title: { style: { color: t.brand, fontFamily: t.fontFamily, fontWeight: 600 } },
    subtitle: { style: { color: t.textMuted, fontFamily: t.fontFamily } },
    noData: { text: 'Aucune donnée', style: { color: t.textMuted, fontFamily: t.fontFamily } },
  };
}

/** Options conseillées pour un anneau (donut) : séparateurs couleur de carte entre les parts. */
export function donutDefaults(el?: HTMLElement): ApexOptions {
  const t = readChartTokens(el);
  return {
    stroke: { width: 2, colors: [t.surface] },
    plotOptions: { pie: { donut: { size: '62%', labels: { show: true, total: { show: true, label: 'Total', color: t.textMuted } } } } },
    legend: { position: 'bottom' },
  };
}

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

function mergeDeep(base: Plain, over: Plain): Plain {
  const out: Plain = { ...base };
  for (const [k, ov] of Object.entries(over)) {
    const bv = out[k];
    if (isPlain(bv) && isPlain(ov)) out[k] = mergeDeep(bv, ov);
    else if (isPlain(bv) && Array.isArray(ov) && ov.every(isPlain)) out[k] = ov.map((o) => mergeDeep(bv, o));
    else if (ov !== undefined) out[k] = ov;
  }
  return out;
}

/** Fusion profonde (les tableaux remplacent, sauf yaxis: [..] qui hérite de l'objet de base). */
export function mergeApexOptions(base: ApexOptions, ...overrides: ApexOptions[]): ApexOptions {
  return overrides.reduce<Plain>((acc, o) => mergeDeep(acc, o as Plain), base as Plain) as ApexOptions;
}

/**
 * CSS de l'infobulle ApexCharts 7 (variables --apx-tt-* / --apx-axt-*), branchée sur les
 * variables shadcn de shadcn-bridge.css. `html` augmente la spécificité : la feuille injectée
 * par ApexCharts arrive souvent après globals.css.
 */
export const APEX_TOOLTIP_CSS = `
html .apexcharts-tooltip {
  --apx-tt-bg: var(--popover);
  --apx-tt-border: var(--border);
  --apx-tt-color: var(--popover-foreground);
  --apx-tt-color-muted: var(--muted-foreground);
  border-radius: var(--corner-lg);
  font-family: var(--type-family-sans);
}
html .apexcharts-xaxistooltip,
html .apexcharts-yaxistooltip {
  --apx-axt-bg: var(--popover);
  --apx-axt-border: var(--border);
  --apx-axt-color: var(--popover-foreground);
}
`;
