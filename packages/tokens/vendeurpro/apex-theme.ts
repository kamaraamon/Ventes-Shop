/**
 * VendeurPro — thème ApexCharts construit à partir des tokens CSS (tokens.css).
 *
 * ApexCharts calcule des dégradés et des teintes à partir des couleurs : il lui faut des hex,
 * pas des var(--…). On lit donc les variables au runtime avec getComputedStyle, puis on
 * normalise chaque valeur en #RRGGBB (via un canvas 1×1, ce qui accepte hex, rgb(), hsl(), oklch()…).
 * Hors navigateur (rendu serveur, tests), les valeurs de repli ci-dessous sont utilisées.
 *
 * ── Usage Next.js 16 (App Router) ───────────────────────────────────────────────────────────
 * Le thème lit le DOM : il doit tourner dans un composant client. `ssr: false` n'est accepté par
 * next/dynamic QUE dans un composant client (doc Next.js « Lazy Loading »).
 *
 *   'use client';
 *   import dynamic from 'next/dynamic';
 *   import { useEffect, useRef, useState } from 'react';
 *   import type { ApexOptions } from 'apexcharts';
 *   import { buildApexTheme, mergeApexOptions, formatFCFA } from '@repo/tokens/vendeurpro/apex-theme';
 *
 *   const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
 *
 *   export function VentesSemaine({ data }: { data: number[] }) {
 *     const ref = useRef<HTMLDivElement>(null);
 *     const [theme, setTheme] = useState<ApexOptions | null>(null);
 *     useEffect(() => { if (ref.current) setTheme(buildApexTheme(ref.current)); }, []);
 *     return (
 *       <div ref={ref} className="h-[280px]">
 *         {theme && (
 *           <Chart type="bar" height={280} series={[{ name: 'Ventes', data }]}
 *             options={mergeApexOptions(theme, {
 *               xaxis: { categories: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'] },
 *               yaxis: { labels: { formatter: (v: number) => formatFCFA(v, { compact: true }) } },
 *               tooltip: { y: { formatter: (v: number) => formatFCFA(v) } },
 *             })} />
 *         )}
 *       </div>
 *     );
 *   }
 *
 * Infobulle : ApexCharts 7 la stylise en CSS (variables --apx-tt-*). Coller APEX_TOOLTIP_CSS
 * (plus bas) dans globals.css, après shadcn-bridge.css.
 * react-apexcharts 2.x sait aussi rendre côté serveur (react-apexcharts/server) : ce thème-ci
 * n'y est pas adapté (il lit le DOM) ; passer alors des hex explicites.
 */
import type { ApexOptions } from 'apexcharts';

type ApexLocale = NonNullable<NonNullable<ApexOptions['chart']>['locales']>[number];

/** Valeurs de repli = tokens.css (à garder synchronisées). */
export const FALLBACK = {
  '--chart-1': '#3A4BE0',
  '--chart-2': '#C4621E',
  '--chart-3': '#5B8FAE',
  '--chart-4': '#5C3052',
  '--chart-5': '#815848',
  '--color-text': '#303030',
  '--color-text-muted': '#616161',
  '--color-ink': '#14133B',
  '--color-border': '#E3E3E3',
  '--color-border-strong': '#8A8A8A',
  '--color-surface': '#FFFFFF',
  '--color-success-fill': '#047B5D',
  '--color-success-text': '#014B40',
  '--color-success-bg': '#AFFEBF',
  '--color-warning-fill': '#FFB800',
  '--color-warning-text': '#5E4200',
  '--color-warning-bg': '#FFD6A4',
  '--color-critical-fill': '#C70A24',
  '--color-critical-text': '#8E0B21',
  '--color-critical-bg': '#FED1D7',
  '--color-info-text': '#003A5A',
  '--color-info-bg': '#D5EBFF',
  '--color-neutral-text': '#616161',
  '--color-neutral-bg': '#F0F0F0',
} as const;

type ColorToken = keyof typeof FALLBACK;

const FONT_FALLBACK = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif';

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

/** Toutes les couleurs utiles aux graphiques, résolues en hex. */
export function readChartTokens(el?: HTMLElement) {
  const c = (n: ColorToken) => readColor(n, el);
  const cs = styleOf(el);
  const font = cs?.getPropertyValue('--font-sans').trim() || FONT_FALLBACK;
  return {
    series: [c('--chart-1'), c('--chart-2'), c('--chart-3'), c('--chart-4'), c('--chart-5')],
    text: c('--color-text'),
    textMuted: c('--color-text-muted'),
    ink: c('--color-ink'),
    grid: c('--color-border'),
    axis: c('--color-border-strong'),
    surface: c('--color-surface'),
    fontFamily: font,
  };
}

/** Palette catégorielle chart-1…5 en hex. */
export function chartColors(el?: HTMLElement): string[] {
  return readChartTokens(el).series;
}

/**
 * Couleurs des statuts (rôles Polaris de tokens.css), en hex.
 * `solid` = remplissage plein, `text` = texte sur `soft`, `soft` = fond de badge.
 * Attention : warning.solid (#FFB800) ne fait que 1.73:1 sur blanc → dans un graphique,
 * l'accompagner d'étiquettes de données ou d'une bordure ; ne jamais s'y fier seul.
 * Les séries catégorielles utilisent chartColors(), pas ces couleurs.
 */
export function statusColors(el?: HTMLElement) {
  const c = (n: ColorToken) => readColor(n, el);
  return {
    success: { solid: c('--color-success-fill'), text: c('--color-success-text'), soft: c('--color-success-bg') },
    warning: { solid: c('--color-warning-fill'), text: c('--color-warning-text'), soft: c('--color-warning-bg') },
    critical: { solid: c('--color-critical-fill'), text: c('--color-critical-text'), soft: c('--color-critical-bg') },
    info: { solid: c('--color-info-text'), text: c('--color-info-text'), soft: c('--color-info-bg') },
    neutral: { solid: c('--color-neutral-text'), text: c('--color-neutral-text'), soft: c('--color-neutral-bg') },
  };
}

// ── Formats français ───────────────────────────────────────────────────────────────────────
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const nfCompact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
const nfNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const nfPercent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });

/**
 * « 12 500 FCFA ». Séparateur de milliers = espace fine insécable (U+202F, fournie par Inter),
 * espace insécable (U+00A0) avant « FCFA ». On évite style:'currency' + XOF (affiche « F CFA »).
 * `compact: true` → « 1,3 M FCFA » (axes).
 */
export function formatFCFA(n: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(n)) return '';
  return (opts.compact ? nfCompact : nf0).format(n) + '\u00A0FCFA';
}

/** Nombre au format français (« 1 250,5 »). */
export function formatNombre(n: number): string {
  return Number.isFinite(n) ? nfNumber.format(n) : '';
}

/** Pourcentage : formatPourcent(45.5) → « 45,5 % » (entrée en points de pourcentage). */
export function formatPourcent(points: number): string {
  return Number.isFinite(points) ? nfPercent.format(points / 100) : '';
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
  const axisLabel = { colors: t.textMuted, fontSize: '12px', fontFamily: t.fontFamily, fontWeight: 450 };
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
      animations: { enabled: !reduceMotion },
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
      title: { style: { color: t.text, fontFamily: t.fontFamily, fontWeight: 550 } },
    },
    yaxis: {
      labels: {
        style: axisLabel,
        formatter: (v: number) => (typeof v === 'number' ? formatNombre(v) : String(v)),
      },
      title: { style: { color: t.text, fontFamily: t.fontFamily, fontWeight: 550 } },
    },
    legend: {
      fontFamily: t.fontFamily,
      fontSize: '14px',
      fontWeight: 450,
      labels: { colors: t.text },
      itemMargin: { horizontal: 12, vertical: 4 },
    },
    tooltip: {
      theme: 'light',
      style: { fontFamily: t.fontFamily, fontSize: '14px' },
      y: { formatter: (v: number) => (typeof v === 'number' ? formatNombre(v) : String(v)) },
    },
    dataLabels: {
      style: { fontFamily: t.fontFamily, fontWeight: 650, fontSize: '12px' },
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
    title: { style: { color: t.ink, fontFamily: t.fontFamily, fontWeight: 650 } },
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

/**
 * Fusion profonde (les tableaux remplacent, sauf yaxis: [..] qui hérite de l'objet de base).
 */
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
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
}
html .apexcharts-xaxistooltip,
html .apexcharts-yaxistooltip {
  --apx-axt-bg: var(--popover);
  --apx-axt-border: var(--border);
  --apx-axt-color: var(--popover-foreground);
}
`;
