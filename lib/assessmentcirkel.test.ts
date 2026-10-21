import { describe, expect, it } from "vitest";
import {
  AI_WEDGES,
  BAND_PUNTEN,
  CENTRUM,
  DEEL_HOEK,
  DELEN,
  KORTE_NAMEN,
  LIJN,
  MAAT,
  QUICK_BOGEN,
  RINGEN,
  SPANNING_WEDGES,
  VOLWASSENHEID_WEDGES,
  bandPunten,
  bandVlak,
  delenMetAssessments,
  deelPad,
  kompas,
  lijnPunt,
  lijnStraal,
  stipIndex,
  stipPunt,
  volgendeKeuze,
} from "./assessmentcirkel";

const dicht = (a: number, b: number) => Math.abs(a - b) < 0.01;

describe("de geometrie van de Assessmentcirkel met vijf delen", () => {
  it("is een vlak van 568px met vijf delen van 72° die samen de cirkel vullen", () => {
    expect(MAAT).toBe(568);
    expect(DEEL_HOEK * DELEN.length).toBe(360);
    expect(DELEN.map((d) => d.tot - d.van)).toEqual([72, 72, 72, 72, 72]);
    for (let i = 1; i < DELEN.length; i++) expect(DELEN[i].van).toBe(DELEN[i - 1].tot);
  });

  it("legt de delen met de klok mee vanaf links, met Klantcontact Volwassenheid op links (variant E2)", () => {
    expect(DELEN.map((d) => d.assessmentId)).toEqual([
      "klantcontact-volwassenheid",
      "zorgscan",
      "ai-volwassenheid",
      "quickscan-ziekenhuis",
      "spanningsmeter",
    ]);
    expect(DELEN.map((d) => d.midden % 360)).toEqual([270, 342, 54, 126, 198]);
    expect(DELEN.map((d) => d.soort)).toEqual(["volwassenheid", "volwassenheid", "ai", "quick", "spanning"]);
  });

  it("legt kompashoeken met de klok mee vanaf 12 uur", () => {
    const [x, y] = kompas(100, 90);
    expect(dicht(x, CENTRUM + 100) && dicht(y, CENTRUM)).toBe(true);
    const [x2, y2] = kompas(100, 270);
    expect(dicht(x2, CENTRUM - 100) && dicht(y2, CENTRUM)).toBe(true);
    const [x3, y3] = kompas(100, 180);
    expect(dicht(x3, CENTRUM) && dicht(y3, CENTRUM + 100)).toBe(true);
  });

  it("maakt delen met een spleet van 8px: De top ligt 4 / sin(36°) naar buiten en het pad is gesloten", () => {
    const pad = deelPad(234, 306);
    expect(pad).toMatch(/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+ A284,284 0 0 1 [\d.]+,[\d.]+ Z$/);
    const [ax, ay] = pad.slice(1).split(" ")[0].split(",").map(Number);
    // De top van het deel op 270° ligt links van het midden.
    expect(ax).toBeLessThan(CENTRUM);
    expect(dicht(ay, CENTRUM)).toBe(true);
    expect(dicht(CENTRUM - ax, 4 / Math.sin((36 * Math.PI) / 180))).toBe(true);
  });

  it("heeft vijf wedges van 28,8° voor de twee Volwassenheid-delen met Fundament op de scheiding (306°)", () => {
    expect(VOLWASSENHEID_WEDGES.map((w) => Math.round((w.tot - w.van) * 10) / 10)).toEqual([28.8, 28.8, 28.8, 28.8, 28.8]);
    const fundament = VOLWASSENHEID_WEDGES.find((w) => w.naam === "Fundament")!;
    expect((fundament.van + fundament.tot) / 2).toBeCloseTo(306);
    expect(VOLWASSENHEID_WEDGES[0].van).toBe(234);
    expect(VOLWASSENHEID_WEDGES[4].tot).toBe(378);
  });

  it("heeft vijf wedges van 14,4° bij AI en drie van 24° bij de Spanningsmeter", () => {
    expect(AI_WEDGES.map((w) => Math.round((w.tot - w.van) * 10) / 10)).toEqual([14.4, 14.4, 14.4, 14.4, 14.4]);
    expect(AI_WEDGES[0].van).toBe(378);
    expect(AI_WEDGES[4].tot).toBeCloseTo(450);
    expect(AI_WEDGES.map((w) => w.kleur).slice(2)).toEqual(["#1f9aa0", "#d1467f", "#8a7bb8"]);
    expect(SPANNING_WEDGES.map((w) => w.tot - w.van)).toEqual([24, 24, 24]);
    expect(SPANNING_WEDGES.map((w) => w.kleur)).toEqual(["#225ba0", "#1f9aa0", "#ffc043"]);
    expect(SPANNING_WEDGES[0].van).toBe(162);
    expect(SPANNING_WEDGES[2].tot).toBe(234);
  });

  it("heeft vier hulpcirkels op 25, 50, 75 en 100% van 215px", () => {
    expect(RINGEN).toEqual([53.75, 107.5, 161.25, 215]);
  });

  it("laat de lijn van 162° tot 450° lopen met 13 hoekpunten op 24° van elkaar en de Quickscan overslaan", () => {
    expect(LIJN).toHaveLength(13);
    expect(LIJN[0][0]).toBe(162);
    expect(LIJN[LIJN.length - 1][0]).toBe(450);
    LIJN.forEach(([h], i) => expect(h).toBe(162 + i * 24));
    expect(LIJN.map(([, sc]) => sc)).toEqual([2.6, 3.7, 2.9, 2.5, 3.3, 3.9, 2.7, 2.8, 3.6, 2.5, 3.8, 3.0, 2.6]);
    for (const grens of [234, 306, 378]) expect(LIJN.some(([h]) => h === grens)).toBe(true);
    // Geen hoekpunt in het deel van de Quickscan (90° tot 162° is 450° tot 522°).
    expect(LIJN.every(([h]) => h < 450 + 1e-9)).toBe(true);
    // Regel 1: Een dal gaat nooit onder 2,5 en een piek komt niet hoger dan bijna 4.
    expect(LIJN.every(([, sc]) => sc >= 2.5 && sc <= 3.9)).toBe(true);
    for (let i = 1; i < LIJN.length; i++) expect(LIJN[i][0]).toBeGreaterThan(LIJN[i - 1][0]);
  });

  it("zet op elke deelgrens een dal en de pieken binnen een deel", () => {
    // De deelgrenzen zijn het eerste, vierde, zevende, tiende en dertiende hoekpunt.
    const grenzen = [0, 3, 6, 9, 12];
    for (const i of grenzen) {
      const buren = [LIJN[i - 1], LIJN[i + 1]].filter(Boolean).map(([, sc]) => sc);
      for (const b of buren) expect(LIJN[i][1]).toBeLessThan(b);
    }
    // De hoogste piek van elk deel ligt binnen het deel, niet op een grens.
    for (let deel = 0; deel < 4; deel++) {
      const bereik = LIJN.slice(deel * 3, deel * 3 + 4);
      const hoogste = Math.max(...bereik.map(([, sc]) => sc));
      expect(hoogste).toBeGreaterThan(bereik[0][1]);
      expect(hoogste).toBeGreaterThan(bereik[3][1]);
    }
  });

  it("rekent de straal van een hoekpunt als (score − 1) / 4 × 215 zodat 2, 3, 4 en 5 op de hulpcirkels liggen", () => {
    RINGEN.forEach((r, i) => expect(dicht(lijnStraal(i + 2), r)).toBe(true));
    expect(lijnStraal(1)).toBe(0);
    const [x, y] = lijnPunt(3); // 234°, score 2,5
    expect(dicht(Math.hypot(x - CENTRUM, y - CENTRUM), lijnStraal(2.5))).toBe(true);
  });

  it("heeft een band van 0,75 punt boven en onder de lijn in het deel van de Spanningsmeter", () => {
    expect(BAND_PUNTEN).toBe(0.75);
    const boven = bandPunten("boven").split(" ");
    const onder = bandPunten("onder").split(" ");
    // De hoekpunten van 162° tot en met 234°: Vier.
    expect(boven).toHaveLength(4);
    expect(onder).toHaveLength(4);
    const [bx, by] = boven[0].split(",").map(Number);
    expect(dicht(Math.hypot(bx - CENTRUM, by - CENTRUM), lijnStraal(2.6 + 0.75))).toBe(true);
    const [ox, oy] = onder[2].split(",").map(Number); // score 2,9 min 0,75 is 2,15
    expect(dicht(Math.hypot(ox - CENTRUM, oy - CENTRUM), lijnStraal(2.15))).toBe(true);
    expect(bandVlak().split(" ")).toHaveLength(8);
  });

  it("heeft vier bogen van de Quickscan in de klassekleuren en de stip op een hoekpunt of in de rode boog", () => {
    expect(QUICK_BOGEN.map((b) => b.r)).toEqual([70, 112, 154, 196]);
    expect(QUICK_BOGEN.map((b) => Math.round(b.score * 100))).toEqual([84, 62, 48, 71]);
    expect(QUICK_BOGEN.map((b) => b.kleur)).toEqual(["#22a06b", "#e8871e", "#dc2626", "#e8871e"]);
    expect(stipPunt("klantcontact-volwassenheid")).toEqual(lijnPunt(5));
    expect(stipPunt("zorgscan")).toEqual(lijnPunt(8));
    expect(stipPunt("ai-volwassenheid")).toEqual(lijnPunt(10));
    expect(stipPunt("spanningsmeter")).toEqual(lijnPunt(1));
    const [x, y] = stipPunt("quickscan-ziekenhuis");
    expect(dicht(Math.hypot(x - CENTRUM, y - CENTRUM), 154)).toBe(true);
  });

  it("zet de stip op de hoogste van de twee binnenste hoekpunten van het deel, nooit op een dal", () => {
    expect(stipIndex("spanningsmeter")).toBe(1); // 3,7 tegen 2,9
    expect(stipIndex("klantcontact-volwassenheid")).toBe(5); // 3,9 tegen 3,3
    expect(stipIndex("zorgscan")).toBe(8); // 3,6 tegen 2,8
    expect(stipIndex("ai-volwassenheid")).toBe(10); // 3,8 tegen 3,0
    expect(stipIndex("quickscan-ziekenhuis")).toBeNull();
    for (const id of ["spanningsmeter", "klantcontact-volwassenheid", "zorgscan", "ai-volwassenheid"]) {
      const i = stipIndex(id) as number;
      expect(LIJN[i][1]).toBeGreaterThanOrEqual(3.6);
    }
  });

  it("zet elke stip in het deel dat hoort bij zijn Assessment", () => {
    for (const d of DELEN) {
      const [x, y] = stipPunt(d.assessmentId);
      let hoek = (Math.atan2(x - CENTRUM, CENTRUM - y) * 180) / Math.PI;
      if (hoek < d.van - 360) hoek += 360;
      while (hoek < d.van - 1) hoek += 360;
      expect(hoek).toBeGreaterThanOrEqual(d.van - 0.5);
      expect(hoek).toBeLessThanOrEqual(d.tot + 0.5);
    }
  });

  it("noemt de korte namen van de vijf Assessments", () => {
    expect(Object.values(KORTE_NAMEN)).toEqual([
      "Klantcontact Volwassenheid",
      "Volwassenheid Zorg",
      "AI-Volwassenheid",
      "Quickscan Ziekenhuis",
      "Spanningsmeter",
    ].sort((a, b) => Object.values(KORTE_NAMEN).indexOf(a) - Object.values(KORTE_NAMEN).indexOf(b)));
    expect(KORTE_NAMEN.spanningsmeter).toBe("Spanningsmeter");
  });

  it("zet een Assessment op zijn vaste plek en een onbekend type op de eerste vrije plek", () => {
    const a = (id: string) => ({ id });
    expect(delenMetAssessments([a("spanningsmeter"), a("zorgscan")]).map((x) => x?.id ?? null)).toEqual([null, "zorgscan", null, null, "spanningsmeter"]);
    expect(delenMetAssessments([a("eigen"), a("spanningsmeter")]).map((x) => x?.id ?? null)).toEqual(["eigen", null, null, null, "spanningsmeter"]);
    expect(delenMetAssessments([a("e1"), a("e2"), a("e3"), a("e4"), a("e5"), a("e6")]).map((x) => x?.id)).toEqual(["e1", "e2", "e3", "e4", "e5"]);
  });

  it("wisselt met de pijltoetsen rondlopend", () => {
    expect(volgendeKeuze(null, 5, "ArrowRight")).toBe(0);
    expect(volgendeKeuze(null, 5, "ArrowLeft")).toBe(4);
    expect(volgendeKeuze(4, 5, "ArrowDown")).toBe(0);
    expect(volgendeKeuze(0, 5, "ArrowUp")).toBe(4);
    expect(volgendeKeuze(1, 5, "a")).toBeNull();
  });
});
