/* CoopTrace — config pour Tailwind Play CDN (v3) dans des maquettes HTML statiques.
   Usage :
     <script src="https://cdn.tailwindcss.com"></script>
     <script src="./tailwind.cdn-config.js"></script>
   Charger tokens.css AVANT ce fichier.
   - Palettes (cocoa, clay, sand, forest, ash, amber, red) : hex en dur, donc les modificateurs
     d'opacité (bg-forest-700/50) marchent.
   - Rôles sémantiques, badges, couleurs de carte, text-base, h-row, h-control : passent par les
     variables CSS de tokens.css (avec le hex en repli). data-density="field" les change donc
     directement : text-fg-muted, border-border-control, bg-surface-page, text-base, h-row, h-control.
     Pas de modificateur d'opacité sur ces rôles (utiliser la palette si besoin).
   Mêmes noms de classes que tokens.theme.css (Tailwind v4) → maquettes transposables.
   Commentaires : « relevé eProd », « relevé MapLibre » ou « conçu ». */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Bruns cacao — marque, navigation, titres — conçu
        cocoa: { 50: '#FAF4EE', 100: '#F2E6DA', 200: '#E3CCB5', 300: '#CDA886', 400: '#B0825D', 500: '#8F6040', 600: '#744A2F', 700: '#5C3A25', 800: '#45291A', 900: '#2F1C12', 950: '#1E120B' },
        // Argile / latérite — accent secondaire, marqueurs — conçu
        clay: { 50: '#FCF1EB', 100: '#F7DFD2', 300: '#E4A07F', 500: '#C4673F', 600: '#A9532F', 700: '#8A4325' },
        // Sable — fonds de page, zébrage — conçu
        sand: { 50: '#FBF8F3', 100: '#F5EFE5', 200: '#ECE3D4', 300: '#DED0B9', 400: '#C9B795' },
        // Verts végétation/forêt — action principale, « conforme » — conçu
        forest: { 50: '#EFF7F1', 100: '#DCEEE1', 200: '#B6DBC2', 300: '#86C09B', 400: '#55A173', 500: '#3A8659', 600: '#2B6E47', 700: '#22593A', 800: '#1B472F', 900: '#133321' },
        // Gris chauds neutres — texte, bordures — conçu
        ash: { 50: '#F8F6F3', 100: '#EFECE7', 200: '#E2DDD6', 300: '#CBC4BA', 400: '#A89F94', 500: '#857C71', 600: '#685F56', 700: '#4F4841', 800: '#38332E', 900: '#25211D', 950: '#171411' },
        // Ocre/ambre — « à vérifier », « en attente » — conçu
        amber: { 50: '#FDF6E3', 100: '#FAEBC2', 500: '#B07D0A', 700: '#8A5D00', 800: '#6E4A00' },
        // Rouge latérite foncé — « non conforme », alerte déforestation — conçu
        red: { 50: '#FCEEEC', 100: '#F8DAD5', 500: '#CC3B2E', 600: '#B23126', 700: '#922820' },
        // Rôles sémantiques — conçu
        'surface-page': 'var(--surface-page, #FBF8F3)', // conçu (= sand-50)
        'surface-card': 'var(--surface-card, #FFFFFF)', // conçu
        'surface-sunken': 'var(--surface-sunken, #F5EFE5)', // conçu (= sand-100)
        'surface-hover': 'var(--surface-hover, #ECE3D4)', // conçu (= sand-200)
        'surface-selected': 'var(--surface-selected, #EFF7F1)', // conçu (= forest-50)
        'surface-nav': 'var(--surface-nav, #2F1C12)', // conçu (= cocoa-900)
        'surface-inverse': 'var(--surface-inverse, #25211D)', // conçu (= ash-900)
        'fg-default': 'var(--fg-default, #25211D)', // conçu (= ash-900)
        'fg-muted': 'var(--fg-muted, #685F56)', // conçu (= ash-600)
        'fg-subtle': 'var(--fg-subtle, #857C71)', // conçu (= ash-500)
        'fg-on-accent': 'var(--fg-on-accent, #FFFFFF)', // conçu
        'fg-on-nav': 'var(--fg-on-nav, #F5EFE5)', // conçu (= sand-100)
        'fg-on-nav-muted': 'var(--fg-on-nav-muted, #CDA886)', // conçu (= cocoa-300)
        'fg-link': 'var(--fg-link, #22593A)', // conçu (= forest-700)
        'fg-brand': 'var(--fg-brand, #45291A)', // conçu (= cocoa-800)
        'border-default': 'var(--border-default, #E2DDD6)', // conçu (= ash-200)
        'border-strong': 'var(--border-strong, #CBC4BA)', // conçu (= ash-300)
        'border-control': 'var(--border-control, #857C71)', // conçu (= ash-500)
        'border-focus': 'var(--border-focus, #2B6E47)', // conçu (= forest-600)
        'accent': 'var(--accent, #22593A)', // conçu (= forest-700)
        'accent-hover': 'var(--accent-hover, #1B472F)', // conçu (= forest-800)
        'accent-soft': 'var(--accent-soft, #EFF7F1)', // conçu (= forest-50)
        'brand': 'var(--brand, #45291A)', // conçu (= cocoa-800)
        'brand-accent': 'var(--brand-accent, #A9532F)', // conçu (= clay-600)
        'danger-solid': 'var(--danger-solid, #B23126)', // conçu (= red-600)
        'status-ok-fg': 'var(--status-ok-fg, #1B472F)', // conçu (= forest-800)
        'status-ok-bg': 'var(--status-ok-bg, #EFF7F1)', // conçu (= forest-50)
        'status-ok-border': 'var(--status-ok-border, #B6DBC2)', // conçu (= forest-200)
        'status-ok-dot': 'var(--status-ok-dot, #3A8659)', // conçu (= forest-500)
        'status-warn-fg': 'var(--status-warn-fg, #6E4A00)', // conçu (= amber-800)
        'status-warn-bg': 'var(--status-warn-bg, #FDF6E3)', // conçu (= amber-50)
        'status-warn-border': 'var(--status-warn-border, #FAEBC2)', // conçu (= amber-100)
        'status-warn-dot': 'var(--status-warn-dot, #B07D0A)', // conçu (= amber-500)
        'status-danger-fg': 'var(--status-danger-fg, #922820)', // conçu (= red-700)
        'status-danger-bg': 'var(--status-danger-bg, #FCEEEC)', // conçu (= red-50)
        'status-danger-border': 'var(--status-danger-border, #F8DAD5)', // conçu (= red-100)
        'status-danger-dot': 'var(--status-danger-dot, #CC3B2E)', // conçu (= red-500)
        'status-neutral-fg': 'var(--status-neutral-fg, #38332E)', // conçu (= ash-800)
        'status-neutral-bg': 'var(--status-neutral-bg, #EFECE7)', // conçu (= ash-100)
        'status-neutral-border': 'var(--status-neutral-border, #E2DDD6)', // conçu (= ash-200)
        'status-neutral-dot': 'var(--status-neutral-dot, #857C71)', // conçu (= ash-500)
        // Statuts métier — conçu (alias des statuts de base)
        'badge-conforme-fg': 'var(--badge-conforme-fg, #1B472F)', 'badge-conforme-bg': 'var(--badge-conforme-bg, #EFF7F1)', 'badge-conforme-border': 'var(--badge-conforme-border, #B6DBC2)', 'badge-conforme-dot': 'var(--badge-conforme-dot, #3A8659)', // conçu — Conformité lot/parcelle
        'badge-a-verifier-fg': 'var(--badge-a-verifier-fg, #6E4A00)', 'badge-a-verifier-bg': 'var(--badge-a-verifier-bg, #FDF6E3)', 'badge-a-verifier-border': 'var(--badge-a-verifier-border, #FAEBC2)', 'badge-a-verifier-dot': 'var(--badge-a-verifier-dot, #B07D0A)', // conçu — Conformité : à vérifier
        'badge-non-conforme-fg': 'var(--badge-non-conforme-fg, #922820)', 'badge-non-conforme-bg': 'var(--badge-non-conforme-bg, #FCEEEC)', 'badge-non-conforme-border': 'var(--badge-non-conforme-border, #F8DAD5)', 'badge-non-conforme-dot': 'var(--badge-non-conforme-dot, #CC3B2E)', // conçu — Conformité : non conforme
        'badge-synchronise-fg': 'var(--badge-synchronise-fg, #1B472F)', 'badge-synchronise-bg': 'var(--badge-synchronise-bg, #EFF7F1)', 'badge-synchronise-border': 'var(--badge-synchronise-border, #B6DBC2)', 'badge-synchronise-dot': 'var(--badge-synchronise-dot, #3A8659)', // conçu — Synchro : synchronisé
        'badge-sync-en-attente-fg': 'var(--badge-sync-en-attente-fg, #6E4A00)', 'badge-sync-en-attente-bg': 'var(--badge-sync-en-attente-bg, #FDF6E3)', 'badge-sync-en-attente-border': 'var(--badge-sync-en-attente-border, #FAEBC2)', 'badge-sync-en-attente-dot': 'var(--badge-sync-en-attente-dot, #B07D0A)', // conçu — Synchro : en attente d'envoi
        'badge-hors-ligne-fg': 'var(--badge-hors-ligne-fg, #38332E)', 'badge-hors-ligne-bg': 'var(--badge-hors-ligne-bg, #EFECE7)', 'badge-hors-ligne-border': 'var(--badge-hors-ligne-border, #E2DDD6)', 'badge-hors-ligne-dot': 'var(--badge-hors-ligne-dot, #857C71)', // conçu — Synchro : hors ligne
        'badge-paye-fg': 'var(--badge-paye-fg, #1B472F)', 'badge-paye-bg': 'var(--badge-paye-bg, #EFF7F1)', 'badge-paye-border': 'var(--badge-paye-border, #B6DBC2)', 'badge-paye-dot': 'var(--badge-paye-dot, #3A8659)', // conçu — Paiement : payé
        'badge-paiement-en-attente-fg': 'var(--badge-paiement-en-attente-fg, #6E4A00)', 'badge-paiement-en-attente-bg': 'var(--badge-paiement-en-attente-bg, #FDF6E3)', 'badge-paiement-en-attente-border': 'var(--badge-paiement-en-attente-border, #FAEBC2)', 'badge-paiement-en-attente-dot': 'var(--badge-paiement-en-attente-dot, #B07D0A)', // conçu — Paiement : en attente
        // Carte (légendes)
        'map-plot-fill': 'var(--map-plot-fill, #3A8659)', // conçu
        'map-plot-stroke': 'var(--map-plot-stroke, #1B472F)', // conçu
        'map-plot-verify-fill': 'var(--map-plot-verify-fill, #B07D0A)', // conçu
        'map-plot-verify-stroke': 'var(--map-plot-verify-stroke, #8A5D00)', // conçu
        'map-plot-selected-stroke': 'var(--map-plot-selected-stroke, #171411)', // conçu
        'map-plot-selected-halo': 'var(--map-plot-selected-halo, #FFFFFF)', // conçu
        'map-risk-fill': 'var(--map-risk-fill, #CC3B2E)', // conçu
        'map-risk-stroke': 'var(--map-risk-stroke, #922820)', // conçu
        'map-protected-fill': 'var(--map-protected-fill, #133321)', // conçu
        'map-point-collecte': 'var(--map-point-collecte, #5C3A25)', // conçu
        'map-point-stroke': 'var(--map-point-stroke, #FFFFFF)', // conçu
        'map-label': 'var(--map-label, #25211D)', // conçu
        'map-label-halo': 'var(--map-label-halo, #FFFFFF)', // conçu
        'map-basemap-bg': 'var(--map-basemap-bg, #F2F3F0)', // relevé MapLibre
        // Carte satellite (légendes) — conçu
        'map-sat-conforme': 'var(--map-sat-conforme, #4CF0B0)', // conçu
        'map-sat-a-verifier': 'var(--map-sat-a-verifier, #FFC61A)', // conçu
        'map-sat-non-conforme': 'var(--map-sat-non-conforme, #FF4B3A)', // conçu
        'map-sat-protegee': 'var(--map-sat-protegee, #C88CFF)', // conçu
        'map-sat-casing': 'var(--map-sat-casing, #FFFFFF)', // conçu
        'map-sat-selected-stroke': 'var(--map-sat-selected-stroke, #171411)', // conçu (= ash-950)
        'map-sat-selected-halo': 'var(--map-sat-selected-halo, #FFFFFF)', // conçu
        'map-sat-point-fill': 'var(--map-sat-point-fill, #FFFFFF)', // conçu
        'map-sat-point-ring': 'var(--map-sat-point-ring, #5C3A25)', // conçu (= cocoa-700)
        // Palette graphique catégorielle — conçu (≥ 3:1 sur blanc, sans vert/ambre/rouge de statut)
        'chart-1': 'var(--chart-1, #5C3A25)', // conçu (= cocoa-700) — 10.06:1
        'chart-2': 'var(--chart-2, #2F5DA8)', // conçu — bleu indigo 6.46:1
        'chart-3': 'var(--chart-3, #AE8170)', // conçu — argile rosée 3.40:1
        'chart-4': 'var(--chart-4, #58354B)', // conçu — aubergine 10.37:1
        'chart-5': 'var(--chart-5, #7E8BB4)', // conçu — bleu ardoise 3.37:1
      },
      fontFamily: {
        sans: ["\"IBM Plex Sans\"", "ui-sans-serif", "system-ui", "\"Segoe UI\"", "Roboto", "Arial", "sans-serif"], // conçu (OFL)
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"], // conçu (OFL)
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }], // conçu
        'xs': ['12px', { lineHeight: '16px' }], // relevé eProd
        'sm': ['13px', { lineHeight: '18px' }], // conçu
        'base': ['var(--type-size-base, 14px)', { lineHeight: 'var(--type-lh-base, 20px)' }], // relevé eProd — 16px/24px en mode terrain
        'md': ['16px', { lineHeight: '24px' }], // relevé eProd
        'lg': ['18px', { lineHeight: '26px' }], // conçu
        'xl': ['20px', { lineHeight: '28px' }], // relevé eProd
        '2xl': ['24px', { lineHeight: '32px' }], // conçu
        '3xl': ['30px', { lineHeight: '36px' }], // conçu
        'display': ['40px', { lineHeight: '44px' }], // conçu
      },
      borderRadius: {
        'xs': '2px', // conçu
        'sm': '4px', // relevé MapLibre
        'md': '6px', // conçu
        'lg': '8px', // relevé eProd
        'xl': '12px', // relevé eProd
        'pill': '9999px', // relevé eProd
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(47 28 18 / 0.08), 0 1px 2px -1px rgb(47 28 18 / 0.08)', // conçu
        'popover': '0 4px 8px -2px rgb(47 28 18 / 0.10), 0 2px 4px -2px rgb(47 28 18 / 0.06)', // conçu
        'modal': '0 12px 24px -6px rgb(47 28 18 / 0.18)', // conçu
        'focus': '0 0 0 3px rgb(43 110 71 / 0.35)', // conçu
        'map-ctrl': '0 0 0 2px rgb(0 0 0 / 0.1)', // relevé MapLibre
      },
      spacing: {
        'row': 'var(--table-row-h, 40px)', // conçu — 48px en mode terrain
        'row-compact': '36px', // conçu
        'row-header': '36px', // conçu
        'cell-x': '12px', // conçu
        'cell-y': '8px', // conçu
        'control-sm': '32px', // conçu
        'control': 'var(--control-h-md, 36px)', // conçu — 48px en mode terrain
        'touch': '48px', // conçu
        'field': '48px', // conçu
        'field-lg': '56px', // conçu
        'map-ctrl': '29px', // relevé MapLibre
        'map-ctrl-field': '48px', // conçu
        'sidebar': '240px', // conçu
        'content': '1440px', // conçu
      },
      maxWidth: { content: '1440px' }, // conçu
    },
  },
};
