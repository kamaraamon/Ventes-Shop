import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VendeurPro",
    short_name: "VendeurPro",
    description: "Commandes et acomptes pour vendeurs en Côte d’Ivoire.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f1f1",
    theme_color: "#3a4be0",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
