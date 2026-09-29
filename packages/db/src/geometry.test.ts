import { describe, expect, it } from "vitest";
import { validateParcelGeometry } from "./geometry";

describe("géométrie de parcelle", () => {
  it("accepte un point en dessous de 4 ha et un polygone au-dessus", () => {
    expect(validateParcelGeometry(1.2, { type: "Point" })).toEqual({ ok: true });
    expect(validateParcelGeometry(4, { type: "Point" })).toEqual({ ok: true });
    expect(validateParcelGeometry(4.01, { type: "Polygon" })).toEqual({ ok: true });
  });

  it("refuse un point au-delà de 4 ha", () => {
    expect(validateParcelGeometry(4.2, { type: "Point" })).toEqual({
      ok: false,
      reason: "polygon_required_above_4ha",
    });
  });
});
