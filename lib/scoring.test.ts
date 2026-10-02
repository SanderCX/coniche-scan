import { describe, expect, it } from "vitest";
import { bouwblokScore, categorieScore, classificatie, overallScore, voortgang } from "./scoring";
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

  it("categorie- en overallscore negeren null en middelen de bouwblokscores", () => {
    expect(categorieScore([4, null, 2])).toBe(3);
    expect(categorieScore([null, null])).toBeNull();
    expect(overallScore([5, 3, null])).toBe(4);
    expect(overallScore([])).toBeNull();
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
