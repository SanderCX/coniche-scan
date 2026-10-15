import { describe, expect, it } from "vitest";
import { ziekenhuisQuickscan as qs } from "@/data/ziekenhuis-quickscan-assessment";
import { Antwoord } from "./types";
import {
  QuickscanScan,
  metingAlsResultaat,
  quickscanBenchmark,
  quickscanMeting,
  quickscanVerdeling,
  spreidingLabelQs,
  steekproefSdQs,
} from "./quickscan-groep";

const afdelingen = (qs.categorieen ?? []).map((c) => c.id);
const [POLI, VERPLEEG, RECEPTIE, SERVICE] = afdelingen;

/** Een scan met per afdeling de eerste `ja[afdeling]` vragen Ja en de rest Nee, of Weet ik niet als `rest` zo staat. */
function scan(id: string, ja: Record<string, number>, opties: { rest?: Antwoord; nvt?: string[] } = {}): QuickscanScan {
  const antwoorden: Record<string, Antwoord> = {};
  for (const c of qs.categorieen ?? []) {
    let over = ja[c.id] ?? 0;
    for (const b of c.bouwblokken)
      for (const v of b.vragen) {
        antwoorden[v.id] = over > 0 ? "ja" : (opties.rest ?? "nee");
        over -= 1;
      }
  }
  const relevantie = Object.fromEntries(afdelingen.map((a) => [a, !(opties.nvt ?? []).includes(a)]));
  return { id, antwoorden, relevantie };
}

describe("spreidingslabel", () => {
  it("grenzen in procentpunten", () => {
    expect(spreidingLabelQs(13.9)).toBe("Eensgezind");
    expect(spreidingLabelQs(14)).toBe("Wisselend");
    expect(spreidingLabelQs(19.9)).toBe("Wisselend");
    expect(spreidingLabelQs(20)).toBe("Verdeeld");
  });
  it("steekproefafwijking met n − 1", () => {
    expect(steekproefSdQs([10])).toBeNull();
    expect(steekproefSdQs([0, 100])).toBeCloseTo(70.71, 1);
  });
});

describe("Gemiddelde en spreiding over een Meting", () => {
  it("het gemiddelde van een afdeling en het totaal volgen uit de scans", () => {
    const m = quickscanMeting(qs, [scan("a", { [POLI]: 15, [VERPLEEG]: 0, [RECEPTIE]: 15, [SERVICE]: 0 }), scan("b", { [POLI]: 0, [VERPLEEG]: 0, [RECEPTIE]: 0, [SERVICE]: 0 })]);
    expect(m.aantalScans).toBe(2);
    const poli = m.afdelingen[0];
    expect(poli.relevanteScans).toBe(2);
    expect(poli.percentage).toBe(50);
    expect(m.percentage).toBe(25);
    // Het totaal in punten per scan: (30 van 120) gedeeld door 2 scans.
    expect(m.punten).toBe(15);
    expect(m.maximum).toBe(60);
  });

  it("een afdeling die in een scan niet van toepassing is, telt voor die scan niet mee", () => {
    const m = quickscanMeting(qs, [
      scan("a", { [POLI]: 15, [VERPLEEG]: 15, [RECEPTIE]: 15, [SERVICE]: 15 }),
      scan("b", { [POLI]: 0, [VERPLEEG]: 0, [RECEPTIE]: 0, [SERVICE]: 0 }, { nvt: [SERVICE] }),
    ]);
    const service = m.afdelingen[3];
    expect(service.relevanteScans).toBe(1);
    expect(service.alleScans).toBe(2);
    expect(service.percentage).toBe(100);
    // Totaal: 60 + 0 punten van 60 + 45 mogelijke punten.
    expect(m.percentage).toBe(57);
  });

  it("een afdeling zonder relevante scans is niet van toepassing", () => {
    const m = quickscanMeting(qs, [scan("a", { [POLI]: 5 }, { nvt: [POLI] })]);
    expect(m.afdelingen[0].vanToepassing).toBe(false);
    expect(m.aantalVanToepassing).toBe(3);
  });

  it("het spreidingslabel vraagt minstens 3 relevante scans en 3 vragen", () => {
    const scans = [0, 5, 10, 15].map((n, i) => scan(`s${i}`, { [POLI]: n }));
    const m = quickscanMeting(qs, scans);
    const organisatie = m.afdelingen[0].bouwblokken[0];
    // Organisatie in Poliklinieken heeft 4 vragen, de scores zijn 100, 100, 100, 100 of 0 afhankelijk van de volgorde.
    expect(organisatie.spreiding?.soort).toBe("label");
    const mensen = m.afdelingen[0].bouwblokken[2];
    expect(mensen.vragen).toBe(1);
    expect(mensen.spreiding).toEqual({ soort: "weinigVragen", vragen: 1 });
    const weinig = quickscanMeting(qs, scans.slice(0, 2));
    expect(weinig.afdelingen[0].spreiding).toEqual({ soort: "weinigAntwoorden" });
  });

  it("bollen tellen het aantal scans per afgerond percentage", () => {
    const m = quickscanMeting(qs, [scan("a", { [POLI]: 15 }), scan("b", { [POLI]: 15 }), scan("c", { [POLI]: 0 })]);
    expect(m.afdelingen[0].bollen).toEqual([
      { percentage: 0, aantal: 1 },
      { percentage: 100, aantal: 2 },
    ]);
  });

  it("de Meting als resultaat geeft hetzelfde schermmodel als één scan", () => {
    const m = quickscanMeting(qs, [scan("a", { [POLI]: 15 })]);
    const r = metingAlsResultaat(m);
    expect(r.afdelingen).toHaveLength(4);
    expect(r.afdelingen[0].percentage).toBe(100);
    expect(r.percentage).toBe(m.percentage);
  });
});

describe("Antwoorden per vraag", () => {
  it("telt Ja, Nee en Weet ik niet per vraag over de relevante scans", () => {
    const scans = [scan("a", { [POLI]: 15 }), scan("b", { [POLI]: 0 }, { rest: "weet-niet" }), scan("c", { [POLI]: 0 }, { rest: "nee" })];
    const v = quickscanVerdeling(qs, scans);
    const vraag = v[0].dimensies[0].vragen[0];
    expect(vraag.ja).toBe(1);
    expect(vraag.weetNiet).toBe(1);
    expect(vraag.nee).toBe(1);
    expect(vraag.respondenten).toBe(3);
    expect(vraag.jaPercentage).toBe(33);
  });

  it("Onbekend bij x van y vanaf 40% en minstens drie", () => {
    const wn = [1, 2, 3].map((i) => scan(`w${i}`, {}, { rest: "weet-niet" }));
    const ja = scan("j", { [POLI]: 15 });
    const vraag = quickscanVerdeling(qs, [...wn, ja])[0].dimensies[0].vragen[0];
    expect(vraag.weetNiet).toBe(3);
    expect(vraag.onbekend).toBe(true);
    const twee = quickscanVerdeling(qs, [wn[0], wn[1], ja, scan("n", {})])[0].dimensies[0].vragen[0];
    expect(twee.weetNiet).toBe(2);
    expect(twee.onbekend).toBe(false);
  });

  it("een afdeling die een scan niet relevant vond, telt die scan niet", () => {
    const v = quickscanVerdeling(qs, [scan("a", { [POLI]: 15 }), scan("b", {}, { nvt: [POLI] })]);
    expect(v[0].respondenten).toBe(1);
  });
});

describe("Benchmark in percentages", () => {
  const lid = (id: string, ja: number) => ({
    organisatieId: id,
    meting: quickscanMeting(qs, [scan(id, { [POLI]: ja, [VERPLEEG]: ja, [RECEPTIE]: ja, [SERVICE]: ja })]),
  });

  it("zet X naast de overige leden met positie en verschil", () => {
    const v = quickscanBenchmark(qs, lid("x", 15), [lid("a", 0), lid("b", 3), lid("c", 6), lid("d", 9), lid("e", 12)], 3);
    const totaal = v.rijen[0];
    expect(totaal.eigen).toBe(100);
    expect(totaal.positie).toBe("Bovenste kwart");
    expect(totaal.verschil).toBe(60);
    expect(v.groepsgrootte).toBe(6);
    expect(v.inBovensteKwart).toBeGreaterThan(0);
  });

  it("een groep onder de drempel geeft Te weinig en geen vergelijking", () => {
    const v = quickscanBenchmark(qs, lid("x", 15), [lid("a", 0)], 5);
    expect(v.rijen[0].teWeinig).toBe(true);
    expect(v.rijen[0].groep).toBeNull();
    expect(v.rijen[0].positie).toBeNull();
  });

  it("een lid dat een afdeling niet van toepassing vond doet voor die afdeling niet mee", () => {
    const zonder = {
      organisatieId: "z",
      meting: quickscanMeting(qs, [scan("z", { [POLI]: 0 }, { nvt: [POLI] })]),
    };
    const v = quickscanBenchmark(qs, lid("x", 15), [zonder, lid("a", 15), lid("b", 15)], 2);
    const poli = v.rijen.find((r) => r.sleutel === POLI)!;
    expect(poli.aantalAnderen).toBe(2);
    const eigenNvt = quickscanBenchmark(qs, zonder, [lid("a", 15)], 2).rijen.find((r) => r.sleutel === POLI)!;
    expect(eigenNvt.nietVanToepassing).toBe(true);
    expect(eigenNvt.eigen).toBeNull();
  });
});
