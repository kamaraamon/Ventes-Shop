// CoopTrace — géodonnées FICTIVES pour maquettes (parcelles P-0412…P-0418 reprises de style-scout/map-demo, près de Soubré).
import { part as plots_0 } from "./geo-parts/plots-0";
import { part as plots_1 } from "./geo-parts/plots-1";
import { part as plots_2 } from "./geo-parts/plots-2";
import { part as plots_3 } from "./geo-parts/plots-3";
import { part as plots_4 } from "./geo-parts/plots-4";
import { part as plots_5 } from "./geo-parts/plots-5";
import { part as plots_6 } from "./geo-parts/plots-6";
import { part as plots_7 } from "./geo-parts/plots-7";
import { part as alerts_0 } from "./geo-parts/alerts-0";
import { part as prot } from "./geo-parts/prot";
import { part as pts } from "./geo-parts/pts";

const geo = {
  plots: { type: "FeatureCollection", features: [...plots_0, ...plots_1, ...plots_2, ...plots_3, ...plots_4, ...plots_5, ...plots_6, ...plots_7] },
  alerts: { type: "FeatureCollection", features: [...alerts_0] },
  prot,
  pts,
};

export default geo;
