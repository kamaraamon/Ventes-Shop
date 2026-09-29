/// <reference types="google.maps" />
/**
 * CoopTrace — calques Google Maps (vue satellite) branchés sur les tokens --map-sat-* de tokens.css.
 *
 * Contenu : plotStyle() pour map.data.setStyle(), ajout des parcelles avec liseré clair (casing),
 * sélection à double contour, marqueur HTML « point de collecte » pour AdvancedMarkerElement,
 * options de carte conseillées.
 *
 * ── Rappels vérifiés dans la doc Google (28/09/2026) ─────────────────────────────────────────
 * - Map ID obligatoire pour AdvancedMarkerElement (DEMO_MAP_ID possible pour essayer, sans style cloud).
 * - MapOptions.styles (ancien tableau JSON) : « not available when using a map ID, or when using vector
 *   maps (use cloud-based maps styling instead) ». Avec un Map ID, ne pas compter sur `styles`.
 * - Imagerie satellite : le style cloud ne touche que les données vectorielles posées dessus (libellés,
 *   routes, POI) sur `hybrid` ; « You can't customize features that are part of the base imagery ».
 *   D'où les couleurs --map-sat-* dédiées, pensées pour une imagerie sombre et verte.
 * - Contours de polygones : couleur, opacité, épaisseur (strokePosition sur google.maps.Polygon). Les
 *   pointillés ne sont documentés que pour les Polyline (symboles). Data.StyleOptions n'a ni tirets ni
 *   strokePosition → statuts distingués par couleur + épaisseur + opacité de remplissage.
 * - Data.StyleOptions.zIndex : « All features are displayed on the map in order of their zIndex ».
 *   Le liseré (casing) et le double contour s'appuient sur cet ordre, DANS UN MÊME calque Data.
 * - Logo Google et attributions : toujours visibles, jamais masqués ni déplacés (politiques Maps JS API).
 *   Ne pas poser de panneau/légende par-dessus le coin bas de la carte.
 * - Pré-chargement / cache du contenu Google : restreint par les politiques → le vrai hors ligne passe
 *   par MapLibre + tuiles OpenStreetMap auto-hébergées (cooptrace-map-layers.js), pas par Google.
 * Non vérifié faute de clé : le rendu réel dans Google Maps (épaisseurs fractionnaires, ordre exact du
 * liseré). À contrôler visuellement à la première intégration avec une clé.
 *
 * ── Double contour de la parcelle sélectionnée (technique retenue) ────────────────────────────
 * Un calque Data ne dessine qu'UN contour par entité. On ajoute donc, dans le MÊME calque, une entité
 * « casing » par polygone (même géométrie, propriété _role='casing', id = `${id}__casing`), stylée en
 * blanc, plus large et avec un zIndex juste sous celui de la parcelle. À la sélection :
 *   parcelle  → overrideStyle : contour sombre --map-sat-selected-stroke (3 px), zIndex 1001
 *   casing    → overrideStyle : blanc --map-sat-selected-halo (9 px), zIndex 1000
 * Même calque = ordre garanti par zIndex (doc). Sans casing global (option casing:false, gros volumes),
 * l'entité casing de la parcelle sélectionnée est créée à la volée puis supprimée.
 * Alternative écartée : deux google.maps.Polygon (halo + contour) superposés au calque Data — leur
 * zIndex n'est documenté qu'entre « polys », pas vis-à-vis des entités d'un calque Data.
 *
 * ── Usage (composant client Next.js) ──────────────────────────────────────────────────────────
 *   const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
 *   const map = new Map(el, satelliteMapOptions(process.env.NEXT_PUBLIC_GMAPS_MAP_ID!, { field: true }));
 *   const tokens = readMapSatTokens(el);
 *   addPlots(map.data, geojson);                  // id obligatoire sur chaque entité
 *   map.data.setStyle((f) => plotStyle(f, tokens));
 *   const selection = createPlotSelection(map.data, tokens);
 *   map.data.addListener('click', (e: google.maps.Data.MouseEvent) => {
 *     if (!isCasing(e.feature)) selection.select(e.feature.getId());
 *   });
 *   await createCollecteMarker(map, { lat: 5.905, lng: -6.55 }, { title: 'Magasin (fictif)', label: 'PC-01' });
 */

export type PlotStatus = 'conforme' | 'a_verifier' | 'non_conforme' | 'protegee';
export const PLOT_STATUSES: readonly PlotStatus[] = ['conforme', 'a_verifier', 'non_conforme', 'protegee'];

export interface StatusStyle {
  color: string;
  width: number;
  fillOpacity: number;
}

export interface MapSatTokens {
  status: Record<PlotStatus, StatusStyle>;
  casing: { color: string; opacity: number; extra: number };
  selected: { stroke: string; width: number; halo: string; haloWidth: number; fillOpacity: number };
  point: { fill: string; ring: string; glyph: string };
}

/** Valeurs de repli = tokens.css (à garder synchronisées). */
export const MAP_SAT_FALLBACK: MapSatTokens = {
  status: {
    conforme: { color: '#4CF0B0', width: 2, fillOpacity: 0.18 },
    a_verifier: { color: '#FFC61A', width: 3, fillOpacity: 0.1 },
    non_conforme: { color: '#FF4B3A', width: 3, fillOpacity: 0.35 },
    protegee: { color: '#C88CFF', width: 2, fillOpacity: 0.1 },
  },
  casing: { color: '#FFFFFF', opacity: 0.85, extra: 3 },
  selected: { stroke: '#171411', width: 3, halo: '#FFFFFF', haloWidth: 9, fillOpacity: 0.32 },
  point: { fill: '#FFFFFF', ring: '#5C3A25', glyph: '#45291A' },
};

/** Ordre d'empilement (zIndex dans le calque Data). Casing = rang pair, contour = rang impair. */
const Z: Record<PlotStatus, number> = { protegee: 2, conforme: 10, a_verifier: 20, non_conforme: 30 };
const Z_SELECTED = 1000;
const CASING_SUFFIX = '__casing';

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

// ── Lecture des tokens ───────────────────────────────────────────────────────────────────────
let ctx: CanvasRenderingContext2D | null | undefined;
function toHex(value: string, fallback: string): string {
  const v = value.trim();
  if (!v) return fallback;
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
  if (!isBrowser()) return fallback;
  if (ctx === undefined) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    ctx = c.getContext('2d', { willReadFrequently: true });
  }
  if (!ctx) return fallback;
  ctx.fillStyle = '#010203';
  ctx.fillStyle = v;
  if (ctx.fillStyle === '#010203') return fallback;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Lit les tokens --map-sat-* sur `el` (ou <html>) : couleurs normalisées en #RRGGBB (Google accepte
 * les couleurs CSS3 sur Data.StyleOptions, mais les hex évitent toute ambiguïté), nombres en px.
 */
export function readMapSatTokens(el?: HTMLElement): MapSatTokens {
  if (!isBrowser()) return MAP_SAT_FALLBACK;
  const cs = getComputedStyle(el ?? document.documentElement);
  const raw = (n: string) => cs.getPropertyValue(n).trim();
  const col = (n: string, f: string) => toHex(raw(n), f);
  const num = (n: string, f: number) => {
    const v = parseFloat(raw(n));
    return Number.isFinite(v) ? v : f;
  };
  const F = MAP_SAT_FALLBACK;
  const st = (key: PlotStatus, css: string): StatusStyle => ({
    color: col(`--map-sat-${css}`, F.status[key].color),
    width: num(`--map-sat-${css}-width`, F.status[key].width),
    fillOpacity: num(`--map-sat-${css}-fill-opacity`, F.status[key].fillOpacity),
  });
  return {
    status: {
      conforme: st('conforme', 'conforme'),
      a_verifier: st('a_verifier', 'a-verifier'),
      non_conforme: st('non_conforme', 'non-conforme'),
      protegee: st('protegee', 'protegee'),
    },
    casing: {
      color: col('--map-sat-casing', F.casing.color),
      opacity: num('--map-sat-casing-opacity', F.casing.opacity),
      extra: num('--map-sat-casing-extra', F.casing.extra),
    },
    selected: {
      stroke: col('--map-sat-selected-stroke', F.selected.stroke),
      width: num('--map-sat-selected-width', F.selected.width),
      halo: col('--map-sat-selected-halo', F.selected.halo),
      haloWidth: num('--map-sat-selected-halo-width', F.selected.haloWidth),
      fillOpacity: num('--map-sat-selected-fill-opacity', F.selected.fillOpacity),
    },
    point: {
      fill: col('--map-sat-point-fill', F.point.fill),
      ring: col('--map-sat-point-ring', F.point.ring),
      glyph: col('--map-sat-point-glyph', F.point.glyph),
    },
  };
}

// ── Style des entités ────────────────────────────────────────────────────────────────────────
/** Statut d'une entité : propriété `status` (ou `statut`, nom utilisé par cooptrace-map-layers.js). */
export function getPlotStatus(feature: google.maps.Data.Feature): PlotStatus {
  const v = feature.getProperty('status') ?? feature.getProperty('statut');
  return (PLOT_STATUSES as readonly unknown[]).includes(v) ? (v as PlotStatus) : 'a_verifier'; // inconnu → à vérifier
}

export const isCasing = (feature: google.maps.Data.Feature): boolean => feature.getProperty('_role') === 'casing';

const casingId = (id: string | number): string => `${id}${CASING_SUFFIX}`;

/**
 * Style d'une entité pour map.data.setStyle(). Passer `t` lu une fois (readMapSatTokens) pour
 * éviter de relire le CSS à chaque entité.
 */
export function plotStyle(
  feature: google.maps.Data.Feature,
  t: MapSatTokens = readMapSatTokens(),
): google.maps.Data.StyleOptions {
  const status = getPlotStatus(feature);
  const s = t.status[status];
  if (isCasing(feature)) {
    return {
      strokeColor: t.casing.color,
      strokeOpacity: t.casing.opacity,
      strokeWeight: s.width + t.casing.extra,
      fillOpacity: 0,
      clickable: false,
      zIndex: Z[status],
    };
  }
  const type = feature.getGeometry()?.getType();
  if (type === 'Point' || type === 'MultiPoint') {
    // Parcelle ≤ 4 ha géolocalisée par un point (EUDR) : pastille colorée cerclée de blanc.
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: s.color,
        fillOpacity: 1,
        strokeColor: t.casing.color,
        strokeWeight: 2,
      },
      title: String(feature.getProperty('code') ?? ''),
      zIndex: Z[status] + 1,
    };
  }
  return {
    fillColor: s.color,
    fillOpacity: s.fillOpacity,
    strokeColor: s.color,
    strokeOpacity: 1,
    strokeWeight: s.width,
    clickable: status !== 'protegee', // l'aire protégée est une couche de référence
    zIndex: Z[status] + 1,
  };
}

/** Styleur prêt à passer à map.data.setStyle (tokens lus une seule fois). */
export function makePlotStyler(el?: HTMLElement): google.maps.Data.StylingFunction {
  const t = readMapSatTokens(el);
  return (feature) => plotStyle(feature, t);
}

function addCasing(data: google.maps.Data, f: google.maps.Data.Feature): google.maps.Data.Feature | null {
  const id = f.getId();
  const geometry = f.getGeometry();
  const type = geometry?.getType();
  if (id === undefined || !geometry || (type !== 'Polygon' && type !== 'MultiPolygon')) return null;
  return data.add({ id: casingId(id), geometry, properties: { _role: 'casing', _ref: id, status: getPlotStatus(f) } });
}

/**
 * Ajoute des parcelles GeoJSON au calque Data, avec une entité « casing » (liseré clair) sous
 * chaque polygone. Chaque entité DOIT avoir un id (Feature.id ou `idPropertyName`).
 * Renvoie les entités parcelles (sans les casings).
 */
export function addPlots(
  data: google.maps.Data,
  geojson: object,
  opts: { casing?: boolean; idPropertyName?: string } = {},
): google.maps.Data.Feature[] {
  const features = data.addGeoJson(geojson, opts.idPropertyName ? { idPropertyName: opts.idPropertyName } : undefined);
  if (opts.casing !== false) {
    for (const f of features) addCasing(data, f);
  }
  return features;
}

// ── Sélection : double contour ───────────────────────────────────────────────────────────────
export interface PlotSelection {
  select(id: string | number | undefined): void;
  clear(): void;
  readonly selectedId: string | number | undefined;
}

export function createPlotSelection(data: google.maps.Data, t: MapSatTokens = readMapSatTokens()): PlotSelection {
  let selectedId: string | number | undefined;
  let tempCasing: google.maps.Data.Feature | null = null;

  function clear(): void {
    if (selectedId === undefined) return;
    const f = data.getFeatureById(selectedId);
    const c = data.getFeatureById(casingId(selectedId));
    if (f) data.revertStyle(f);
    if (c) data.revertStyle(c);
    if (tempCasing) data.remove(tempCasing);
    tempCasing = null;
    selectedId = undefined;
  }

  function select(id: string | number | undefined): void {
    clear();
    if (id === undefined) return;
    const f = data.getFeatureById(id);
    if (!f || isCasing(f)) return;
    let c = data.getFeatureById(casingId(id)) ?? null;
    if (!c) {
      c = addCasing(data, f); // casing absent (option casing:false) → créé pour la durée de la sélection
      tempCasing = c;
    }
    // 1) liseré blanc large, juste sous… 2) …le contour sombre ; le remplissage garde la couleur du statut.
    if (c) {
      data.overrideStyle(c, {
        strokeColor: t.selected.halo,
        strokeOpacity: 1,
        strokeWeight: t.selected.haloWidth,
        fillOpacity: 0,
        zIndex: Z_SELECTED,
      });
    }
    data.overrideStyle(f, {
      strokeColor: t.selected.stroke,
      strokeOpacity: 1,
      strokeWeight: t.selected.width,
      fillOpacity: t.selected.fillOpacity,
      zIndex: Z_SELECTED + 1,
    });
    selectedId = id;
  }

  return {
    select,
    clear,
    get selectedId() {
      return selectedId;
    },
  };
}

// ── Point de collecte : contenu HTML pour AdvancedMarkerElement ─────────────────────────────
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Pictogramme « magasin / hangar » dessiné pour CoopTrace (currentColor). */
function warehouseGlyph(size: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.style.display = 'block'; // neutralise les styles svg globaux de la page hôte
  svg.style.position = 'static';
  const roof = document.createElementNS(SVG_NS, 'path');
  roof.setAttribute('d', 'M3 10.5 12 5l9 5.5V20a1 1 0 0 1-1 1h-3v-6H7v6H4a1 1 0 0 1-1-1z');
  roof.setAttribute('fill', 'currentColor');
  const door = document.createElementNS(SVG_NS, 'path');
  door.setAttribute('d', 'M9 17h6M9 19h6');
  door.setAttribute('stroke', 'currentColor');
  door.setAttribute('stroke-width', '1.6');
  door.setAttribute('stroke-linecap', 'round');
  svg.append(roof, door);
  return svg;
}

/**
 * Élément HTML du point de collecte, stylé par les variables CSS (--map-sat-point-*), avec repli en dur.
 * Les propriétés personnalisées héritent jusque dans le marqueur : le mode terrain agrandit la pastille
 * si `field` n'est pas forcé (lecture de --map-sat-point-size-field).
 */
export function createCollectePointContent(opts: { label?: string; field?: boolean } = {}): HTMLElement {
  const size = opts.field ? 'var(--map-sat-point-size-field, 44px)' : 'var(--map-sat-point-size, 32px)';
  const root = document.createElement('div');
  root.className = 'ct-collecte-point';
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    pointerEvents: 'auto',
  } satisfies Partial<CSSStyleDeclaration>);

  const disc = document.createElement('div');
  Object.assign(disc.style, {
    width: size,
    height: size,
    boxSizing: 'border-box',
    borderRadius: '9999px',
    background: 'var(--map-sat-point-fill, #FFFFFF)',
    border: '3px solid var(--map-sat-point-ring, #5C3A25)',
    color: 'var(--map-sat-point-glyph, #45291A)',
    boxShadow: 'var(--map-sat-point-shadow, 0 1px 4px rgb(0 0 0 / 0.55))',
    display: 'grid',
    placeItems: 'center',
  } satisfies Partial<CSSStyleDeclaration>);
  disc.append(warehouseGlyph(opts.field ? 24 : 18));
  root.append(disc);

  if (opts.label) {
    const label = document.createElement('span');
    label.textContent = opts.label;
    Object.assign(label.style, {
      font: '600 12px/16px var(--type-family-mono, "IBM Plex Mono", monospace)',
      color: 'var(--map-sat-label, #FFFFFF)',
      textShadow: '0 0 2px var(--map-sat-label-halo, rgb(0 0 0 / 0.75)), 0 0 4px var(--map-sat-label-halo, rgb(0 0 0 / 0.75))',
      whiteSpace: 'nowrap',
    } satisfies Partial<CSSStyleDeclaration>);
    root.append(label);
  }
  return root;
}

/**
 * Crée le marqueur avancé d'un point de collecte (nécessite un Map ID sur la carte).
 * L'ancre est placée au centre de la pastille (anchorTop calculé), et non en bas comme l'épingle par défaut.
 */
export async function createCollecteMarker(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  opts: { title: string; label?: string; field?: boolean },
): Promise<google.maps.marker.AdvancedMarkerElement> {
  const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
  const content = createCollectePointContent({ ...(opts.label ? { label: opts.label } : {}), ...(opts.field ? { field: true } : {}) });
  const discPx = opts.field ? 44 : 32;
  return new AdvancedMarkerElement({
    map,
    position,
    title: opts.title, // lu par les lecteurs d'écran
    content,
    gmpClickable: true,
    anchorLeft: '-50%',
    anchorTop: `-${discPx / 2}px`, // centre de la pastille sur la position (l'étiquette pend dessous)
  });
}

// ── Options de carte conseillées ─────────────────────────────────────────────────────────────
/**
 * Carte satellite CoopTrace. `hybrid` garde les noms de villages et les routes Google (stylables par le
 * style cloud du Map ID), `satellite` = imagerie seule. En terrain, contrôles agrandis à 48 px
 * (MapOptions.controlSize, taille des contrôles de l'API en px).
 */
export function satelliteMapOptions(
  mapId: string,
  opts: { field?: boolean; labels?: boolean; center?: google.maps.LatLngLiteral; zoom?: number } = {},
): google.maps.MapOptions {
  return {
    mapId,
    mapTypeId: opts.labels === false ? 'satellite' : 'hybrid',
    center: opts.center ?? { lat: 7.54, lng: -5.55 }, // Côte d'Ivoire
    zoom: opts.zoom ?? 7,
    clickableIcons: false, // pas de fiches POI Google par-dessus les parcelles
    ...(opts.field ? { controlSize: 48, gestureHandling: 'greedy' } : {}),
  };
}
