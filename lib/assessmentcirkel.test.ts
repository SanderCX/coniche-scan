import { describe, expect, it } from "vitest";
import {
  AI_WEDGES,
  CENTRUM,
  KORTE_NAMEN,
  KWARTEN,
  LIJN,
  LINKS_WEDGES,
  MAAT,
  QUICK_BOGEN,
  RINGEN,
  kompas,
  lijnPunt,
  lijnStraal,
  stipPunt,
  volgendeKeuze,
} from "./assessmentcirkel";

const dicht = (a: number, b: number) => Math.abs(a - b) < 0.01;

describe("de geometrie van de Assessmentcirkel", () => {
  it("is een vlak van 568px met vier kwarten van 280px en 8px ertussen", () => {
    expect(MAAT).toBe(568);
    expect(KWARTEN.map((k) => [k.x0, k.y0])).toEqual([[0, 0], [288, 0], [0, 288], [288, 288]]);
  });
  it("legt kompashoeken met de klok mee vanaf 12 uur", () => {
    const [x, y] = kompas(100, 90);
    expect(dicht(x, CENTRUM + 100) && dicht(y, CENTRUM)).toBe(true);
    const [x2, y2] = kompas(100, 270);
    expect(dicht(x2, CENTRUM - 100) && dicht(y2, CENTRUM)).toBe(true);
    const [x3, y3] = kompas(100, 180);
    expect(dicht(x3, CENTRUM) && dicht(y3, CENTRUM + 100)).toBe(true);
  });
  it("heeft vijf wedges van 36° links (Fundament op de scheiding) en vijf van 18° rechtsboven", () => {
    expect(LINKS_WEDGES.map((w) => w.tot - w.van)).toEqual([36, 36, 36, 36, 36]);
    const fundament = LINKS_WEDGES.find((w) => w.naam === "Fundament")!;
    expect((fundament.van + fundament.tot) / 2).toBe(270);
    expect(AI_WEDGES.map((w) => w.tot - w.van)).toEqual([18, 18, 18, 18, 18]);
    expect(AI_WEDGES[0].van).toBe(0);
    expect(AI_WEDGES[4].tot).toBe(90);
    expect(AI_WEDGES.map((w) => w.kleur).slice(2)).toEqual(["#1f9aa0", "#d1467f", "#8a7bb8"]);
  });
  it("heeft vier hulpcirkels op 25, 50, 75 en 100% van 215px", () => {
    expect(RINGEN).toEqual([53.75, 107.5, 161.25, 215]);
  });
  it("heeft een lijn met 13 hoekpunten van 180° tot 450° en hoekpunten op de grenzen 270° en 360°", () => {
    expect(LIJN).toHaveLength(13);
    expect(LIJN[0][0]).toBe(180);
    expect(LIJN[12][0]).toBe(450);
    expect(LIJN.some(([h]) => h === 270)).toBe(true);
    expect(LIJN.some(([h]) => h === 360)).toBe(true);
  });
  it("rekent de straal van een hoekpunt als (score − 1) / 4 × 262 × 0,95", () => {
    expect(dicht(lijnStraal(5), 262 * 0.95)).toBe(true);
    expect(lijnStraal(1)).toBe(0);
    const [x, y] = lijnPunt(4); // 270°, score 2,3
    expect(dicht(x, CENTRUM - lijnStraal(2.3)) && dicht(y, CENTRUM)).toBe(true);
  });
  it("heeft vier bogen van de Quickscan in de klassekleuren en de stip op een hoekpunt of in de rode boog", () => {
    expect(QUICK_BOGEN.map((b) => b.r)).toEqual([70, 112, 154, 196]);
    expect(QUICK_BOGEN.map((b) => Math.round(b.score * 100))).toEqual([84, 62, 48, 71]);
    expect(QUICK_BOGEN.map((b) => b.kleur)).toEqual(["#22a06b", "#e8871e", "#dc2626", "#e8871e"]);
    expect(stipPunt("tl")).toEqual(lijnPunt(5));
    expect(stipPunt("bl")).toEqual(lijnPunt(3));
    expect(stipPunt("tr")).toEqual(lijnPunt(11));
    const [x, y] = stipPunt("br");
    expect(dicht(Math.hypot(x - CENTRUM, y - CENTRUM), 154)).toBe(true);
  });
  it("noemt de korte namen van de vier Assessments", () => {
    expect(Object.values(KORTE_NAMEN)).toEqual(["Klantcontact Volwassenheid", "AI-Volwassenheid", "Volwassenheid Zorg", "Quickscan Ziekenhuis"]);
  });
  it("wisselt met de pijltoetsen rondlopend", () => {
    expect(volgendeKeuze(null, 4, "ArrowRight")).toBe(0);
    expect(volgendeKeuze(null, 4, "ArrowLeft")).toBe(3);
    expect(volgendeKeuze(3, 4, "ArrowDown")).toBe(0);
    expect(volgendeKeuze(0, 4, "ArrowUp")).toBe(3);
    expect(volgendeKeuze(1, 4, "a")).toBeNull();
  });
});
