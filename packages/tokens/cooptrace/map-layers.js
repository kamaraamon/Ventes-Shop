// CoopTrace — couches MapLibre GL JS (v6) pour les parcelles. Valeurs = tokens.css (toutes « conçu »,
// sauf le fond de carte OpenFreeMap « relevé MapLibre »). MapLibre ne lit pas les variables CSS :
// on les résout au runtime via getComputedStyle (tokens.css doit être chargé), avec repli en dur.
const FALLBACK = {
  '--map-plot-fill': '#3A8659', '--map-plot-fill-opacity': '0.28', '--map-plot-stroke': '#1B472F',
  '--map-plot-stroke-width': '1.5', '--map-plot-verify-fill': '#B07D0A', '--map-plot-verify-stroke': '#8A5D00',
  '--map-plot-selected-stroke': '#171411', '--map-plot-selected-halo': '#FFFFFF',
  '--map-plot-selected-stroke-width': '3', '--map-plot-selected-fill-opacity': '0.45',
  '--map-risk-fill': '#CC3B2E', '--map-risk-fill-opacity': '0.35', '--map-risk-stroke': '#922820',
  '--map-protected-fill': '#133321', '--map-protected-fill-opacity': '0.12',
  '--map-point-collecte': '#5C3A25', '--map-point-stroke': '#FFFFFF',
  '--map-label': '#25211D', '--map-label-halo': '#FFFFFF',
};
export function readTokens(el = document.documentElement) {
  const cs = getComputedStyle(el), t = {};
  for (const k of Object.keys(FALLBACK)) t[k] = cs.getPropertyValue(k).trim() || FALLBACK[k];
  return t;
}

// data = { plots, alerts, protectedAreas, points } (FeatureCollection GeoJSON).
// plots : properties.statut ∈ 'conforme' | 'a_verifier' | 'non_conforme', properties.code ; id numérique requis (feature-state).
export function addPlotLayers(map, data, t = readTokens()) {
  const n = (k) => Number(t[k]);
  const selected = ['boolean', ['feature-state', 'selected'], false];
  map.addSource('aires-protegees', { type: 'geojson', data: data.protectedAreas });
  map.addSource('alertes', { type: 'geojson', data: data.alerts });
  map.addSource('parcelles', { type: 'geojson', data: data.plots });
  map.addSource('points', { type: 'geojson', data: data.points });

  // Aire protégée / forêt classée (référence)
  map.addLayer({ id: 'aires-protegees-fill', type: 'fill', source: 'aires-protegees',
    paint: { 'fill-color': t['--map-protected-fill'], 'fill-opacity': n('--map-protected-fill-opacity') } });
  map.addLayer({ id: 'aires-protegees-line', type: 'line', source: 'aires-protegees',
    paint: { 'line-color': t['--map-protected-fill'], 'line-width': 1, 'line-dasharray': [4, 2], 'line-opacity': 0.6 } });

  // Parcelles : remplissage selon le statut, plus opaque si sélectionnée
  map.addLayer({ id: 'parcelles-fill', type: 'fill', source: 'parcelles', filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'fill-color': ['match', ['get', 'statut'],
        'a_verifier', t['--map-plot-verify-fill'],
        'non_conforme', t['--map-risk-fill'],
        /* conforme */ t['--map-plot-fill']],
      'fill-opacity': ['case', selected, n('--map-plot-selected-fill-opacity'), n('--map-plot-fill-opacity')],
    } });
  // Contours : un calque par style de trait (line-dasharray n'est pas piloté par les données ici)
  map.addLayer({ id: 'parcelles-line', type: 'line', source: 'parcelles', filter: ['!=', ['get', 'statut'], 'a_verifier'],
    paint: { 'line-color': ['match', ['get', 'statut'], 'non_conforme', t['--map-risk-stroke'], t['--map-plot-stroke']],
             'line-width': n('--map-plot-stroke-width') } });
  map.addLayer({ id: 'parcelles-line-verifier', type: 'line', source: 'parcelles', filter: ['==', ['get', 'statut'], 'a_verifier'],
    paint: { 'line-color': t['--map-plot-verify-stroke'], 'line-width': n('--map-plot-stroke-width') + 0.5, 'line-dasharray': [2, 1] } });

  // Zone d'alerte déforestation (au-dessus des parcelles pour rester visible)
  map.addLayer({ id: 'alertes-fill', type: 'fill', source: 'alertes',
    paint: { 'fill-color': t['--map-risk-fill'], 'fill-opacity': n('--map-risk-fill-opacity') } });
  map.addLayer({ id: 'alertes-line', type: 'line', source: 'alertes',
    paint: { 'line-color': t['--map-risk-stroke'], 'line-width': 2, 'line-dasharray': [3, 2] } });

  // Sélection : halo blanc + contour sombre neutre (distinct de tous les statuts)
  map.addLayer({ id: 'parcelles-selection-halo', type: 'line', source: 'parcelles',
    paint: { 'line-color': t['--map-plot-selected-halo'], 'line-width': n('--map-plot-selected-stroke-width') * 2,
             'line-opacity': ['case', selected, 1, 0] } });
  map.addLayer({ id: 'parcelles-selection', type: 'line', source: 'parcelles',
    paint: { 'line-color': t['--map-plot-selected-stroke'], 'line-width': n('--map-plot-selected-stroke-width'),
             'line-opacity': ['case', selected, 1, 0] } });

  // Parcelles ≤ 4 ha géolocalisées par un simple point (EUDR) : cercle coloré selon le statut
  map.addLayer({ id: 'parcelles-points', type: 'circle', source: 'parcelles', filter: ['==', ['geometry-type'], 'Point'],
    paint: { 'circle-radius': ['case', selected, 8, 6],
             'circle-color': ['match', ['get', 'statut'], 'a_verifier', t['--map-plot-verify-fill'], 'non_conforme', t['--map-risk-fill'], t['--map-plot-fill']],
             'circle-stroke-color': ['case', selected, t['--map-plot-selected-stroke'], t['--map-plot-stroke']],
             'circle-stroke-width': ['case', selected, 3, 1.5] } });

  // Points de collecte / magasins
  map.addLayer({ id: 'points-collecte', type: 'circle', source: 'points',
    paint: { 'circle-radius': 7, 'circle-color': t['--map-point-collecte'],
             'circle-stroke-color': t['--map-point-stroke'], 'circle-stroke-width': 2 } });

  // Étiquettes (polices servies par OpenFreeMap : "Noto Sans Regular" / "Noto Sans Bold")
  map.addLayer({ id: 'parcelles-label', type: 'symbol', source: 'parcelles', minzoom: 14,
    layout: { 'text-field': ['get', 'code'], 'text-font': ['Noto Sans Bold'], 'text-size': 12 },
    paint: { 'text-color': t['--map-label'], 'text-halo-color': t['--map-label-halo'], 'text-halo-width': 1.5 } });
}

export function selectPlot(map, id, prevId) {
  if (prevId != null) map.setFeatureState({ source: 'parcelles', id: prevId }, { selected: false });
  if (id != null) map.setFeatureState({ source: 'parcelles', id }, { selected: true });
}
