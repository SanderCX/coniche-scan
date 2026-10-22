import { describe, expect, it } from "vitest";
import { Antwoord, Assessment } from "./types";
import { ziekenhuisQuickscan } from "@/data/ziekenhuis-quickscan-assessment";
import { demoAntwoordenQuickscan, demoRelevantieQuickscan } from "@/data/demo-antwoorden-quickscan";
import { afdelingenHebbenEvenveelVragen, klasseVanPercentage, procent, puntenRange, quickscanResultaat } from "./quickscan";
import { isVolledigIngevuld, voortgang } from "./scoring";
import { alleVragen } from "./assessment-structuur";

const qs = ziekenhuisQuickscan;
const alleRelevant = Object.fromEntries((qs.categorieen ?? []).map((c) => [c.id, true]));

/** Antwoorden waarin in elke afdeling de eerste `ja[id]` vragen Ja zijn en de rest Nee. */
function antwoorden(ja: Record<string, number>, rest: Antwoord = "nee"): Record<string, Antwoord> {
  const uit: Record<string, Antwoord> = {};
  for (const c of qs.categorieen ?? []) {
    let over = ja[c.id] ?? 0;
    for (const b of c.bouwblokken)
      for (const v of b.vragen) {
        uit[v.id] = over > 0 ? "ja" : rest;
        over -= 1;
      }
  }
  return uit;
}

describe("Quickscan: score", () => {
  it("de proefscan geeft 17 van 60 punten, 28%, met afdelingen 5, 3, 5 en 4 van 15", () => {
    const r = quickscanResultaat(qs, demoAntwoordenQuickscan, demoRelevantieQuickscan);
    expect(r.punten).toBe(17);
    expect(r.maximum).toBe(60);
    expect(r.percentage).toBe(28);
    expect(r.klasse).toBe("rood");
    expect(r.afdelingen.map((a) => [a.punten, a.maximum])).toEqual([[5, 15], [3, 15], [5, 15], [4, 15]]);
    expect(r.afdelingen[0].percentage).toBe(33);
  });

  it("met gewicht 2 op de bouwstenen van de tweede afdeling is het 20 van 75, 27%", () => {
    const gewogen: Assessment = structuredClone(qs);
    for (const b of gewogen.categorieen![1].bouwblokken) b.gewicht = 2;
    const r = quickscanResultaat(gewogen, demoAntwoordenQuickscan, demoRelevantieQuickscan);
    expect(r.punten).toBe(20);
    expect(r.maximum).toBe(75);
    expect(r.percentage).toBe(27);
  });

  it("een afdeling die niet van toepassing is doet niet mee: 14 van 15 is 93%", () => {
    const ja = antwoorden({ "qs-patientenservice": 14 });
    const relevantie = { ...alleRelevant, "qs-poliklinieken": false, "qs-verpleegafdelingen": false, "qs-receptie": false };
    const r = quickscanResultaat(qs, ja, relevantie);
    expect(r.punten).toBe(14);
    expect(r.maximum).toBe(15);
    expect(r.percentage).toBe(93);
    expect(r.aantalVanToepassing).toBe(1);
    expect(r.sterkste).toEqual([]);
  });

  it("Weet ik niet telt als 0 punten en blijft apart geteld", () => {
    const r = quickscanResultaat(qs, antwoorden({ "qs-poliklinieken": 2 }, "weet-niet"), alleRelevant);
    const poli = r.afdelingen[0];
    expect(poli.punten).toBe(2);
    expect(poli.tellingen).toEqual({ ja: 2, nee: 0, weetNiet: 13 });
  });
});

describe("Quickscan: klassen en afronding", () => {
  it("grenzen op afgeronde hele procenten", () => {
    expect(klasseVanPercentage(80)).toBe("groen");
    expect(klasseVanPercentage(79)).toBe("oranje");
    expect(klasseVanPercentage(50)).toBe("oranje");
    expect(klasseVanPercentage(49)).toBe("rood");
    expect(procent(0.795)).toBe(80);
    expect(procent(17 / 60)).toBe(28);
  });

  it("puntenbereik per klasse bij 15 vragen", () => {
    expect(puntenRange(15, "groen")).toEqual([12, 15]);
    expect(puntenRange(15, "oranje")).toEqual([8, 11]);
    expect(puntenRange(15, "rood")).toEqual([0, 7]);
  });
});

describe("Quickscan: aandachtspunt en sterkste basis", () => {
  it("geeft de bouwsteen met de laagste score en bij gelijkstand geen chip", () => {
    const lijn = quickscanResultaat(qs, antwoorden({ "qs-poliklinieken": 4 }), alleRelevant).afdelingen[0];
    // Alleen Organisatie (4 vragen) is volledig Ja: de rest is 0, dus de laagste is niet uniek.
    expect(lijn.aandachtspunt).toBeNull();
    const een = quickscanResultaat(qs, antwoorden({ "qs-poliklinieken": 8 }), alleRelevant).afdelingen[0];
    expect(een.bouwblokken.map((b) => b.punten)[0]).toBe(4);
  });

  it("de sterkste basis vraagt minstens 3 vragen", () => {
    const poli = quickscanResultaat(qs, antwoorden({ "qs-poliklinieken": 4 }), alleRelevant).afdelingen[0];
    expect(poli.sterksteBasis?.bouwblok.naam).toBe("Organisatie");
    for (const b of qs.categorieen!.flatMap((c) => c.bouwblokken)) expect(b.vragen.length).toBeGreaterThan(0);
  });
});

describe("Quickscan: relevantie en voortgang", () => {
  it("een niet-relevante afdeling telt niet mee in de voortgang", () => {
    const totaal = alleVragen(qs).length;
    expect(totaal).toBe(60);
    expect(voortgang(qs, {}, alleRelevant).totaal).toBe(60);
    const v = voortgang(qs, {}, { ...alleRelevant, "qs-receptie": false });
    expect(v.totaal).toBe(45);
  });

  it("is pas volledig als elke afdeling beoordeeld is", () => {
    const alles = antwoorden({}, "nee");
    expect(isVolledigIngevuld(alles, qs, undefined)).toBe(false);
    expect(isVolledigIngevuld(alles, qs, alleRelevant)).toBe(true);
    expect(isVolledigIngevuld({}, qs, Object.fromEntries((qs.categorieen ?? []).map((c) => [c.id, false])))).toBe(false);
  });

  it("de afdelingen hebben evenveel vragen", () => {
    expect(afdelingenHebbenEvenveelVragen(quickscanResultaat(qs, {}, alleRelevant))).toBe(true);
  });
});
