import { describe, expect, it } from "vitest";
import {
  DEEL_KLEUREN,
  BAND_PUNTEN,
  CENTRUM,
  DEEL_HOEK,
  DELEN,
  KORTE_NAMEN,
  LIJN,
  MAAT,
  QUICK_BOGEN,
  RINGEN,
  STIP_AFSTAND,
  PIL_B,
  PIL_H,
  BOOG_DIKTE,
  BOOG_HOEK,
  schaalStraal,
  deelWedges,
  labelPunt,
  bandPunten,
  bandVlak,
  delenMetAssessments,
  deelPad,
  kompas,
  lijnPunt,
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

  it("heeft per deel met een radar precies drie wedges van 24° in een selectie van de kleuren", () => {
    const wedges = (id: string) => deelWedges(DELEN.find((d) => d.assessmentId === id)!);
    for (const id of ["klantcontact-volwassenheid", "zorgscan", "ai-volwassenheid", "spanningsmeter"]) {
      const w = wedges(id);
      expect(w.map((x) => x.tot - x.van)).toEqual([24, 24, 24]);
      const d = DELEN.find((x) => x.assessmentId === id)!;
      expect(w[0].van).toBe(d.van);
      expect(w[2].tot).toBe(d.tot);
    }
    expect(DEEL_KLEUREN["klantcontact-volwassenheid"]).toEqual(["#ff671f", "#225ba0", "#197f4e"]);
    expect(DEEL_KLEUREN.zorgscan).toEqual(["#ff671f", "#225ba0", "#197f4e"]);
    expect(DEEL_KLEUREN["ai-volwassenheid"]).toEqual(["#ff671f", "#1f9aa0", "#d1467f"]);
    expect(DEEL_KLEUREN.spanningsmeter).toEqual(["#225ba0", "#1f9aa0", "#ffc043"]);
    expect(wedges("quickscan-ziekenhuis")).toEqual([]);
  });

  it("rekent de straal volgens één schaal: 48 + (score − 1) × 50 px, met de hulpcirkels op 2, 3, 4 en 5", () => {
    expect(RINGEN).toEqual([98, 148, 198, 248]);
    expect([schaalStraal(2.5), schaalStraal(3.5), schaalStraal(3.9), schaalStraal(5)]).toEqual([123, 173, 193, 248]);
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

  it("zet de hoekpunten van de lijn op de straal van de schaal: Een dal op 123px en een piek niet boven 193px", () => {
    const stralen = LIJN.map((_, i) => {
      const [x, y] = lijnPunt(i);
      return Math.round(Math.hypot(x - CENTRUM, y - CENTRUM));
    });
    expect(stralen).toEqual([128, 183, 143, 123, 163, 193, 133, 138, 178, 123, 188, 148, 128]);
  });

  it("heeft een band van 0,75 punt boven en onder de lijn in het deel van de Spanningsmeter", () => {
    expect(BAND_PUNTEN).toBe(0.75);
    const boven = bandPunten("boven").split(" ");
    const onder = bandPunten("onder").split(" ");
    // De hoekpunten van 162° tot en met 234°: Vier.
    expect(boven).toHaveLength(4);
    expect(onder).toHaveLength(4);
    const [bx, by] = boven[0].split(",").map(Number);
    expect(dicht(Math.hypot(bx - CENTRUM, by - CENTRUM), schaalStraal(2.6 + 0.75))).toBe(true);
    const [ox, oy] = onder[2].split(",").map(Number); // score 2,9 min 0,75 is 2,15
    expect(dicht(Math.hypot(ox - CENTRUM, oy - CENTRUM), schaalStraal(2.15))).toBe(true);
    expect(bandVlak().split(" ")).toHaveLength(8);
  });

  it("heeft vier bogen van de Quickscan in de klassekleuren en de stip op een hoekpunt of in de rode boog", () => {
    expect(QUICK_BOGEN.map((b) => b.r)).toEqual([56, 90, 124, 158]);
    expect([BOOG_DIKTE, BOOG_HOEK]).toEqual([14, 56]);
    expect(QUICK_BOGEN.map((b) => Math.round(b.score * 100))).toEqual([84, 62, 48, 71]);
    expect(QUICK_BOGEN.map((b) => b.kleur)).toEqual(["#22a06b", "#e8871e", "#dc2626", "#e8871e"]);
    expect(stipPunt("klantcontact-volwassenheid")).toEqual(lijnPunt(5));
    expect(stipPunt("zorgscan")).toEqual(lijnPunt(8));
    expect(stipPunt("ai-volwassenheid")).toEqual(lijnPunt(11));
    expect(stipPunt("spanningsmeter")).toEqual(lijnPunt(1));
    const [x, y] = stipPunt("quickscan-ziekenhuis");
    expect(dicht(Math.hypot(x - CENTRUM, y - CENTRUM), 124)).toBe(true);
  });

  it("zet de stip op de hoogste van de twee binnenste hoekpunten van het deel, nooit op een dal", () => {
    expect(stipIndex("spanningsmeter")).toBe(1); // 3,7 tegen 2,9
    expect(stipIndex("klantcontact-volwassenheid")).toBe(5); // 3,9 tegen 3,3
    expect(stipIndex("zorgscan")).toBe(8); // 3,6 tegen 2,8
    // De hoogste piek van AI (hoekpunt 11, 3,8) ligt onder de pil: De stip neemt hoekpunt 12 (3,0).
    expect(stipIndex("ai-volwassenheid")).toBe(11);
    expect(stipIndex("quickscan-ziekenhuis")).toBeNull();
    // Nooit een dal: De grenzen van de delen zijn nooit een stip.
    for (const id of ["spanningsmeter", "klantcontact-volwassenheid", "zorgscan", "ai-volwassenheid"]) {
      expect([0, 3, 6, 9, 12]).not.toContain(stipIndex(id));
    }
  });

  it("zet de label-pillen op 235px van het midden (Zorg 240px, Quickscan 200px, Klantcontact Volwassenheid 16px lager)", () => {
    const afstand = (id: string) => {
      const [x, y] = labelPunt(id);
      return Math.hypot(x - CENTRUM, y - CENTRUM);
    };
    expect(dicht(afstand("spanningsmeter"), 235)).toBe(true);
    expect(dicht(afstand("ai-volwassenheid"), 235)).toBe(true);
    expect(dicht(afstand("zorgscan"), 240)).toBe(true);
    expect(dicht(afstand("quickscan-ziekenhuis"), 200)).toBe(true);
    // Klantcontact Volwassenheid: Op 270° staat de pil 16px lager dan op 235px.
    const [, ky] = labelPunt("klantcontact-volwassenheid");
    expect(dicht(ky, CENTRUM + 16)).toBe(true);
  });

  it("laat de stip nooit in of tegen een label staan: Het midden minstens 8px buiten de pil", () => {
    for (const d of DELEN) {
      if (d.soort === "quick") continue;
      const [x, y] = stipPunt(d.assessmentId);
      const [lx, ly] = labelPunt(d.assessmentId);
      const dx = Math.max(Math.abs(x - lx) - PIL_B / 2, 0);
      const dy = Math.max(Math.abs(y - ly) - PIL_H / 2, 0);
      expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(STIP_AFSTAND);
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
      "AI-Volwassenheid in Klantcontact",
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
