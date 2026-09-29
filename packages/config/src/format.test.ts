import { describe, expect, it } from "vitest";
import { formatFcfa, formatNumber } from "./format";

describe("formatNumber", () => {
  it("remplace U+202F par U+00A0 pour IBM Plex", () => {
    const plex = formatNumber(1284.6, 1, "nbsp");
    expect(plex).not.toContain("\u202F");
    expect(plex).toBe("1\u00A0284,6");
  });

  it("formate les FCFA sans le style currency XOF", () => {
    const value = formatFcfa(87500, "nbsp");
    expect(value.endsWith("\u00A0FCFA")).toBe(true);
    expect(value).not.toContain("F CFA");
    expect(value).not.toContain("\u202F");
    expect(value.startsWith("87\u00A0500")).toBe(true);
  });
});
