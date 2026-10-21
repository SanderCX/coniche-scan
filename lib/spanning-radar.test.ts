import { describe, expect, it } from "vitest";
import { RADAR, hoekVoorAs, puntVoorScore, straalVoorScore, veelhoekPad, wedgePad } from "./spanning-radar";

describe("de radar van het Spanningsprofiel", () => {
  it("laat de score van 1 op straal 20 beginnen en van 5 op straal 250 eindigen", () => {
    expect(straalVoorScore(1)).toBe(20);
    expect(straalVoorScore(5)).toBe(250);
    expect(straalVoorScore(3)).toBe(135);
    expect(straalVoorScore(0)).toBe(20);
    expect(straalVoorScore(9)).toBe(250);
  });

  it("zet de eerste as bovenaan en loopt met de klok mee", () => {
    const boven = puntVoorScore(0, 6, 5);
    expect(boven.x).toBeCloseTo(RADAR.midden);
    expect(boven.y).toBeCloseTo(RADAR.midden - 250);
    expect(hoekVoorAs(1, 6) - hoekVoorAs(0, 6)).toBeCloseTo(Math.PI / 3);
    const tweede = puntVoorScore(1, 6, 5);
    expect(tweede.x).toBeGreaterThan(RADAR.midden);
  });

  it("maakt een wedge van het midden naar de rand en een gesloten veelhoek", () => {
    expect(wedgePad(0, 6)).toMatch(/^M 300 300 L .* A 250 250 0 0 1 .* Z$/);
    expect(veelhoekPad([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])).toBe("M 1 2 L 3 4 L 5 6 Z");
  });
});
