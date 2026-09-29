/**
 * Jeu fictif CoopTrace (campagne, pesée, parcelles près de Soubré).
 * Aucune coopérative, aucun producteur et aucune parcelle réels.
 */
import geo from "./cooptrace-geo";

export const FICTIONAL = true;
export const FICTIONAL_LABEL = "Données fictives — maquette";

export type Compliance = "conforme" | "a_verifier" | "non_conforme";
export type SyncStatus = "synchronise" | "en_attente" | "hors_ligne";
export type Grade = "grade_i" | "grade_ii" | "hors_norme";

export interface CampaignKpis {
  asOf: string;
  sections: number;
  tonnageT: number;
  tonnageDelta: string;
  lastWeekT: number;
  objectiveT: number;
  objectiveRatio: number;
  lots: number;
  lottedT: number;
  storeStockT: number;
  lotsConformes: number;
  lotsAVerifier: number;
  lotsNonConformes: number;
  producersActive: number;
  producersRegistered: number;
  newProducersWeek: number;
  parcelsMapped: number;
  parcelsTotal: number;
  parcelsLocalizedRatio: number;
  parcelsEudrRatio: number;
  parcelsConformes: number;
  parcelsAVerifier: number;
  parcelsNonConformes: number;
}

export interface WeekBar {
  label: string;
  tons: number;
  cumulative: number;
  partial?: boolean;
  highlight?: boolean;
}

export interface FieldAgent {
  initials: string;
  name: string;
  zone: string;
  status: SyncStatus;
  pending: number;
  syncedLabel: string;
  weighingsToday: number;
}

export interface LotRow {
  code: string;
  date: string;
  store: string;
  netKg: number;
  bags: number;
  producers: number;
  parcelCount: number;
  parcelCodes: string[];
  extraParcels: number;
  verifyCode?: string;
  compliance: Compliance;
  destination: string;
}

export interface AlertRow {
  tone: "danger" | "warn";
  title: string;
  detail: string;
  meta: string;
  action: string;
}

export interface WeighingParcel {
  code: string;
  ha: number;
  compliance: Compliance;
}

export interface WeighingDraft {
  recordedLabel: string;
  storeName: string;
  lotCode: string;
  producerName: string;
  producerCode: string;
  producerInitials: string;
  village: string;
  section: string;
  parcelCount: number;
  parcels: WeighingParcel[];
  selectedParcel: string;
  bags: number;
  grossKg: number;
  tarePerBagKg: number;
  moisturePct: number;
  moldPct: number;
  grade: Grade;
  priceFcfaPerKg: number;
}

export const cooperative = {
  name: "SCOOPS Awlan-Nawa",
  campaign: "Campagne 2026-2027",
  manager: "Touré Mamadou",
  managerRole: "Gérant · bureau Soubré",
  managerInitials: "TM",
};

export const kpis: CampaignKpis = {
  asOf: "jeu. 19/11/2026, 08:42",
  sections: 4,
  tonnageT: 1284.6,
  tonnageDelta: "+9,5 %",
  lastWeekT: 214.7,
  objectiveT: 3000,
  objectiveRatio: 42.8,
  lots: 92,
  lottedT: 1198.4,
  storeStockT: 86.2,
  lotsConformes: 81,
  lotsAVerifier: 9,
  lotsNonConformes: 2,
  producersActive: 1142,
  producersRegistered: 1310,
  newProducersWeek: 38,
  parcelsMapped: 2031,
  parcelsTotal: 2118,
  parcelsLocalizedRatio: 95.9,
  parcelsEudrRatio: 91.4,
  parcelsConformes: 1856,
  parcelsAVerifier: 162,
  parcelsNonConformes: 13,
};

export const weeks: WeekBar[] = [
  { label: "S40", tons: 96.4, cumulative: 96.4 },
  { label: "S41", tons: 138.2, cumulative: 234.6 },
  { label: "S42", tons: 171.5, cumulative: 406.1 },
  { label: "S43", tons: 189.3, cumulative: 595.4 },
  { label: "S44", tons: 204.8, cumulative: 800.2 },
  { label: "S45", tons: 196.1, cumulative: 996.3 },
  { label: "S46", tons: 214.7, cumulative: 1211, highlight: true },
  { label: "S47*", tons: 73.6, cumulative: 1284.6, partial: true },
];

export const weekStats = {
  average: "173,0 t",
  best: "S46 · 214,7 t",
  moisture: "7,3 %",
};

export const agents: FieldAgent[] = [
  { initials: "YK", name: "Yao Konan Serge", zone: "Soubré-Nord · Kpéhiri", status: "hors_ligne", pending: 3, syncedLabel: "depuis 06:20", weighingsToday: 12 },
  { initials: "BS", name: "Bamba Souleymane", zone: "Soubré-Nord · Gbalébouo", status: "synchronise", pending: 0, syncedLabel: "il y a 4 min", weighingsToday: 27 },
  { initials: "KM", name: "Koné Mariam", zone: "Méagui", status: "en_attente", pending: 7, syncedLabel: "08:10", weighingsToday: 19 },
  { initials: "DA", name: "Dosso Awa", zone: "San-Pédro · magasin", status: "synchronise", pending: 0, syncedLabel: "il y a 1 min", weighingsToday: 34 },
  { initials: "ZB", name: "Zadi Bléhoué Arsène", zone: "Duékoué", status: "synchronise", pending: 0, syncedLabel: "il y a 12 min", weighingsToday: 22 },
  { initials: "NA", name: "N'Guessan Ahou Estelle", zone: "Soubré-Sud · Zakoua", status: "en_attente", pending: 2, syncedLabel: "07:58", weighingsToday: 15 },
];

export const lots: LotRow[] = [
  { code: "LOT-26-0192", date: "18/11/2026", store: "Zakoua", netKg: 12968.2, bags: 201, producers: 26, parcelCount: 33, parcelCodes: ["P-0418", "P-0353"], extraParcels: 31, compliance: "conforme", destination: "Stock magasin" },
  { code: "LOT-26-0191", date: "18/11/2026", store: "Kpéhiri", netKg: 12846.5, bags: 198, producers: 31, parcelCount: 38, parcelCodes: ["P-0412", "P-0413"], extraParcels: 36, compliance: "a_verifier", destination: "Nawa Négoce SA" },
  { code: "LOT-26-0190", date: "17/11/2026", store: "Duékoué", netKg: 13277.8, bags: 205, producers: 32, parcelCount: 38, parcelCodes: ["P-0350", "P-0351"], extraParcels: 36, compliance: "conforme", destination: "Nawa Négoce SA" },
  { code: "LOT-26-0189", date: "17/11/2026", store: "Duékoué", netKg: 14913.2, bags: 231, producers: 21, parcelCount: 25, parcelCodes: ["P-0412", "P-0341"], extraParcels: 23, compliance: "conforme", destination: "Atlantique Cacao SA" },
  { code: "LOT-26-0188", date: "16/11/2026", store: "Zakoua", netKg: 11350.2, bags: 175, producers: 17, parcelCount: 22, parcelCodes: ["P-0344", "P-0346"], extraParcels: 20, verifyCode: "P-0344", compliance: "a_verifier", destination: "Ivoire Fèves Export" },
  { code: "LOT-26-0187", date: "14/11/2026", store: "Méagui", netKg: 12070.8, bags: 187, producers: 24, parcelCount: 29, parcelCodes: ["P-0415", "P-0376"], extraParcels: 27, compliance: "conforme", destination: "Ivoire Fèves Export" },
];

export const alerts: AlertRow[] = [
  { tone: "danger", title: "Alerte déforestation · ALD-26-014", detail: "P-0416 · Kouamé N’Guessan Paul · Kpéhiri", meta: "Recouvrement estimé 0,6 ha · détectée le 12/11/2026", action: "Examiner" },
  { tone: "danger", title: "Alerte déforestation · ALD-26-015", detail: "P-0505 · Niambli · lisière forêt classée", meta: "Recouvrement estimé 0,4 ha · détectée le 15/11/2026", action: "Examiner" },
  { tone: "warn", title: "Tracé GPS à reprendre", detail: "P-0414 · Koffi Kouadio Emmanuel", meta: "Polygone incomplet (6 points) · saisi hors ligne", action: "Planifier" },
  { tone: "warn", title: "Superposition de parcelles", detail: "P-0306 / P-0307 · Gbalébouo", meta: "Chevauchement 0,12 ha entre deux producteurs", action: "Arbitrer" },
  { tone: "warn", title: "Producteur sans parcelle cartographiée", detail: "87 producteurs actifs · 5 sections", meta: "Pesées acceptées, lots marqués « à vérifier »", action: "Voir la liste" },
];

export const weighingDraft: WeighingDraft = {
  recordedLabel: "19/11 · 09:14",
  storeName: "Magasin Kpéhiri",
  lotCode: "LOT-26-0193",
  producerName: "Koffi Kouadio Emmanuel",
  producerCode: "PRD-SBR-00417",
  producerInitials: "KE",
  village: "Kpéhiri",
  section: "Soubré-Nord",
  parcelCount: 4,
  parcels: [
    { code: "P-0413", ha: 1.69, compliance: "conforme" },
    { code: "P-0412", ha: 1.75, compliance: "conforme" },
    { code: "P-0414", ha: 1.44, compliance: "a_verifier" },
    { code: "P-0418", ha: 0.43, compliance: "conforme" },
  ],
  selectedParcel: "P-0413",
  bags: 12,
  grossKg: 812,
  tarePerBagKg: 1,
  moisturePct: 7.2,
  moldPct: 2,
  grade: "grade_i",
  priceFcfaPerKg: 2450,
};

export const fictionalGeo = geo;

export const selectedParcelCode = "P-0416";

/** Trois saisies fictives déjà dans la file, pour l’état « hors ligne » de la maquette. */
export const seededPendingWeighings = [
  { clientId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1", bags: 8, netKg: 510 },
  { clientId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2", bags: 6, netKg: 390 },
  { clientId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3", bags: 10, netKg: 640 },
];
