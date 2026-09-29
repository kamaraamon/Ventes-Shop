export interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

/** Point ou polygone, WGS 84. Au-delà de 4 ha, EUDR demande un polygone. */
export type ParcelGeometry = GeoJsonPoint | GeoJsonPolygon;

export const EUDR_POLYGON_ABOVE_HA = 4;

export type GeometryCheck =
  | { ok: true }
  | { ok: false; reason: "area_invalid" | "polygon_required_above_4ha" | "unsupported_geometry" };

export function validateParcelGeometry(areaHa: number, geometry: { type: string }): GeometryCheck {
  if (!Number.isFinite(areaHa) || areaHa <= 0) return { ok: false, reason: "area_invalid" };
  if (geometry.type !== "Point" && geometry.type !== "Polygon") {
    return { ok: false, reason: "unsupported_geometry" };
  }
  if (areaHa > EUDR_POLYGON_ABOVE_HA && geometry.type !== "Polygon") {
    return { ok: false, reason: "polygon_required_above_4ha" };
  }
  return { ok: true };
}
