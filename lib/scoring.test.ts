import { describe, expect, it } from "vitest";
import {
  alleGroepResultaten,
  alleBouwblokResultaten,
  bouwblokScore,
  categorieScore,
  classificatie,
  overallScore,
  overallScoreRuw,
  voortgang,
} from "./scoring";
import { Assessment, Bouwblok } from "./types";

function bouwblok(id: string, vraagIds: string[], gearchiveerd: string[] = []): Bouwblok {
  return {
    id,
    volgnummer: 1,
    naam: id,
    omschrijving: "",
    toelichting: "",
    tags: [],
    gewicht: 1,
    vragen: vraagIds.map((v, i) => ({ id: v, volgnummer: i + 1, tekst: v, gearchiveerd: gearchiveerd.includes(v) })),
  } as Bouwblok;
}

describe("scoring", () => {
  it("bouwblokScore is het gemiddelde van de beantwoorde vragen, op 1 decimaal", () => {
    const b = bouwblok("b", ["a", "b", "c", "d"]);
    expect(bouwblokScore(b, { a: 5, b: 4, c: 4, d: 4 })).toBe(4.3);
    expect(bouwblokScore(b, { a: 2, b: 2, c: 3, d: 3 })).toBe(2.5);
  });

  it("bouwblokScore telt alleen beantwoorde vragen mee en is null zonder antwoorden", () => {
    const b = bouwblok("b", ["a", "b"]);
    expect(bouwblokScore(b, { a: 3 })).toBe(3);
    expect(bouwblokScore(b, {})).toBeNull();
  });

  it("categoriescore negeert bouwblokken zonder antwoorden en is null zonder antwoorden", () => {
    const b1 = bouwblok("b1", ["a", "b"]);
    const b2 = bouwblok("b2", ["c", "d"]);
    const b3 = bouwblok("b3", ["e"]);
    expect(categorieScore([{ bouwblok: b1 }, { bouwblok: b2 }, { bouwblok: b3 }], { a: 4, b: 4, c: 2, d: 2 })).toBe(3);
    expect(categorieScore([{ bouwblok: b3 }], {})).toBeNull();
  });

  it("categoriescore weegt mee met Bouwblok.gewicht (Σ(g × score) / Σ g)", () => {
    const b1 = { ...bouwblok("b1", ["a"]), gewicht: 2 };
    const b2 = bouwblok("b2", ["b"]);
    // (2 × 5 + 1 × 2) / 3 = 4
    expect(categorieScore([{ bouwblok: b1 }, { bouwblok: b2 }], { a: 5, b: 2 })).toBe(4);
  });

  it("gewicht 1,5 (decimaal) telt mee", () => {
    const b1 = { ...bouwblok("b1", ["a"]), gewicht: 1.5 };
    const b2 = bouwblok("b2", ["b"]);
    // (1,5 × 4 + 1 × 2) / 2,5 = 3,2
    expect(categorieScore([{ bouwblok: b1 }, { bouwblok: b2 }], { a: 4, b: 2 })).toBe(3.2);
  });

  it("overall: Zorgscan-rekenvoorbeeld uit datamodel.md (som 172 over 60 vragen)", () => {
    // 15 blokken met 4 vragen. Bouwblok 4, 10 en 11 samen 43 punten, de andere 12 samen 129.
    const sommen = [11, 11, 11, 14, 11, 11, 11, 10, 10, 14, 15, 10, 11, 11, 11];
    expect(sommen.reduce((a, b) => a + b, 0)).toBe(172);
    const maakAssessment = (gewichten: Record<number, number>) => {
      const bouwblokken = sommen.map((_, i) => ({
        ...bouwblok(`b${i + 1}`, [0, 1, 2, 3].map((v) => `b${i + 1}-v${v}`)),
        volgnummer: i + 1,
        gewicht: gewichten[i + 1] ?? 1,
      }));
      return { categorieen: null, bouwblokken } as unknown as Assessment;
    };
    const antwoorden: Record<string, number> = {};
    sommen.forEach((som, i) => {
      // Verdeel de som over 4 vragen: som = 3×basis + rest
      const basis = Math.floor(som / 4);
      const rest = som - basis * 4;
      for (let v = 0; v < 4; v++) antwoorden[`b${i + 1}-v${v}`] = basis + (v < rest ? 1 : 0);
    });
    const ongewogen = maakAssessment({});
    expect(overallScoreRuw(ongewogen, antwoorden)).toBeCloseTo(172 / 60, 6);
    expect(overallScore(ongewogen, antwoorden)).toBe(2.9);
    const gewogen = maakAssessment({ 4: 2, 10: 2, 11: 2 });
    expect(overallScoreRuw(gewogen, antwoorden)).toBeCloseTo(215 / 72, 6);
    expect(overallScore(gewogen, antwoorden)).toBe(3);
  });

  it("overall is null zonder antwoorden", () => {
    const a = { categorieen: null, bouwblokken: [bouwblok("b", ["a"])] } as unknown as Assessment;
    expect(overallScore(a, {})).toBeNull();
  });

  it("groepsresultaten rekenen gewogen en bouwblokresultaten bevatten het gewicht", () => {
    const b1 = { ...bouwblok("b1", ["a"]), gewicht: 2 };
    const b2 = bouwblok("b2", ["b"]);
    const a = {
      categorieen: [{ id: "c", naam: "C", kleur: "x", volgorde: 1, bouwblokken: [b1, b2] }],
      bouwblokken: null,
      scoresPerGroepGesorteerd: false,
    } as unknown as Assessment;
    const antwoorden = { a: 5, b: 2 };
    const bouwblokResultaten = alleBouwblokResultaten(a, antwoorden);
    expect(bouwblokResultaten.map((r) => r.gewicht)).toEqual([2, 1]);
    expect(bouwblokResultaten.map((r) => r.score)).toEqual([5, 2]);
    expect(alleGroepResultaten(a, bouwblokResultaten, antwoorden)[0].score).toBe(4);
  });

  it("classificatie volgt de grenzen 2,5 en 3,5 (CLAUDE.md, Classificatie)", () => {
    expect(classificatie(1)).toBe("rood");
    expect(classificatie(2.49)).toBe("rood");
    expect(classificatie(2.5)).toBe("oranje");
    expect(classificatie(3.49)).toBe("oranje");
    expect(classificatie(3.5)).toBe("groen");
    expect(classificatie(5)).toBe("groen");
  });

  it("voortgang telt gearchiveerde vragen niet mee", () => {
    const assessment = {
      categorieen: null,
      bouwblokken: [bouwblok("b", ["a", "b", "c"], ["c"])],
    } as unknown as Assessment;
    expect(voortgang(assessment, { a: 3 })).toEqual({ beantwoord: 1, totaal: 2, percentage: 50 });
    expect(voortgang(assessment, { a: 3, b: 4 }).percentage).toBe(100);
  });
});
