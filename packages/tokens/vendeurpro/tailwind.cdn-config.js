// VendeurPro — configuration pour le Tailwind Play CDN (v3) dans des maquettes HTML statiques.
// Utilisation dans <head> :
//   <script src="https://cdn.tailwindcss.com"></script>
//   <script src="./tailwind.cdn-config.js"></script>
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet">
// Valeurs en dur (hex) pour que les maquettes marchent sans tokens.css et que bg-primary/10 fonctionne.
// Garder synchronisé avec tokens.css (source de vérité, avec la provenance de chaque valeur).
// Note : le CDN v4 (@tailwindcss/browser) n'utilise pas cet objet → y coller tokens.theme.css
// dans un <style type="text/tailwindcss">.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#3a4be0", pressed: "#2f3fc4", subtle: "#eef0ff", on: "#ffffff" }, // conçu
        ink: "#14133b",                        // conçu (inspiré de #0E0D5D relevé wave.com)
        bg: "#f1f1f1",                         // relevé Polaris
        surface: { DEFAULT: "#ffffff", muted: "#f7f7f7", pressed: "#f3f3f3" }, // relevé Polaris
        text: { DEFAULT: "#303030", muted: "#616161", disabled: "#b5b5b5" },   // relevé Polaris
        line: { DEFAULT: "#e3e3e3", strong: "#8a8a8a" },                       // relevé Polaris (bordures)
        focus: "#005bd3",                      // relevé Polaris
        link: "#005bd3",                       // relevé Polaris (--p-color-text-link)
        success: { bg: "#affebf", text: "#014b40", fill: "#047b5d", surface: "#cdfed4" },   // relevé Polaris
        info: { bg: "#d5ebff", text: "#003a5a", surface: "#eaf4ff" },                       // relevé Polaris
        warning: { bg: "#ffd6a4", text: "#5e4200", fill: "#ffb800", surface: "#fff1e3" },   // relevé Polaris
        critical: { bg: "#fed1d7", text: "#8e0b21", fill: "#c70a24", surface: "#fee8eb" },  // relevé Polaris
        neutral: { bg: "#f0f0f0", text: "#616161" },                                        // relevé Polaris
        // Statuts métier (conçu) : Acompte en attente, Stock faible, À surveiller = warning ; En cours = info ;
        // Livrée, Fiable = success ; Annulée, Rupture = critical (doux) ; Faux client signalé = critical.fill + texte blanc ;
        // Nouveau = neutral.
        // Palette graphique catégorielle (conçu) — passe par les variables de tokens.css, hex en repli.
        // Exception au « tout hex » de ce fichier : pas de modificateur d'opacité (bg-chart-1/50) sur ces 5 couleurs.
        "chart-1": "var(--chart-1, #3a4be0)", // conçu : indigo = primaire (6.44:1 sur blanc)
        "chart-2": "var(--chart-2, #c4621e)", // conçu : cuivre (4.11:1)
        "chart-3": "var(--chart-3, #5b8fae)", // conçu : bleu acier (3.51:1)
        "chart-4": "var(--chart-4, #5c3052)", // conçu : prune (10.50:1)
        "chart-5": "var(--chart-5, #815848)", // conçu : brun noisette (6.14:1)
        // Couleurs de marques tierces — UNIQUEMENT pastilles d'identification, jamais en couleur d'interface
        pay: {
          orange: "#ff7900", // marque tierce, non relevé (valeur publique courante, à vérifier)
          mtn: "#ffcc00",    // marque tierce, non relevé (valeur publique courante, à vérifier)
          wave: "#1dc8ff",   // marque tierce, relevé wave.com
        },
        whatsapp: "#25d366", // marque tierce, non relevé — icône/pastille seulement
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Noto Sans", "sans-serif"], // Inter : relevé wave.com + Polaris
      },
      fontWeight: { regular: "450", medium: "550", semibold: "650", bold: "700" }, // relevé Polaris
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],     // relevé Polaris (mobile)
        sm: ["14px", { lineHeight: "20px" }],     // relevé Polaris (mobile)
        md: ["16px", { lineHeight: "24px" }],     // relevé Polaris (mobile) — texte par défaut
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],     // relevé Polaris (mobile)
        title: ["22px", { lineHeight: "28px", fontWeight: "650" }],                         // relevé Polaris (mobile)
        display: ["28px", { lineHeight: "36px", fontWeight: "700", letterSpacing: "-0.3px" }], // conçu
        amount: ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.3px" }],  // relevé Polaris (2rem/2.5rem)
        badge: ["14px", { lineHeight: "20px", fontWeight: "550" }],                          // conçu
      },
      spacing: {
        touch: "48px",  // conçu : cible tactile minimale
        cta: "56px",    // conçu : gros CTA
        gutter: "16px", // conçu : marge d'écran (= padding de carte Polaris, marge Wave mobile)
        "nav-bottom": "64px", // conçu
      },
      minHeight: { touch: "48px", cta: "56px" },
      minWidth: { touch: "48px" },
      borderRadius: {
        sm: "8px",    // relevé Polaris
        md: "12px",   // relevé Polaris
        lg: "16px",   // relevé Polaris
        xl: "20px",   // relevé Polaris
        pill: "9999px", // style CTA wave.com
      },
      boxShadow: {
        card: "0 1px 1px -0.5px rgba(0,0,0,0.03), 0 3px 3px -1.5px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.06)", // relevé Polaris
        cta: "0 12px 24px rgba(0,0,0,0.05)",   // relevé wave.com
        raised: "0 4px 8px rgba(0,0,0,0.05)",  // relevé wave.com
        sheet: "0 -8px 16px -4px rgba(26,26,26,0.22)", // conçu
        focus: "0 0 0 2px #ffffff, 0 0 0 4px #005bd3", // conçu (couleur relevé Polaris)
        control: "inset 0 0 0 1px #8a8a8a",    // relevé Polaris (épaisseur conçue)
      },
      transitionDuration: { fast: "100ms", DEFAULT: "150ms", slow: "250ms" }, // relevé Polaris
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.25, 0.1, 0.25, 1)", // relevé Polaris
        out: "cubic-bezier(0.19, 0.91, 0.38, 1)",    // relevé Polaris
      },
    },
  },
};
