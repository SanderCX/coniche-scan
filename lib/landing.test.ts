import { describe, expect, it } from "vitest";
import { klantcontactVolwassenheid } from "@/data/klantcontact-assessment";
import { aiVolwassenheid as aiScan } from "@/data/ai-scan-assessment";
import { zorgscan } from "@/data/zorgscan-assessment";
import { ziekenhuisQuickscan } from "@/data/ziekenhuis-quickscan-assessment";
import { actieveSectie } from "@/components/assessment/AssessmentSubNav";
import { bouwstenenLink, contentSoort, heroUitleg, overDezeScan, paginaSecties, tegelInhoud } from "./landing";

describe("de hero van de landingspagina", () => {
  it("toont alleen de eerste zin en laat het stuk over de bouwblokken uit de oude tekst weg", () => {
    expect(heroUitleg("Breng in kaart hoe volwassen jouw klantcontactorganisatie is op 15 bouwblokken, verdeeld over 5 pijlers — van strategie tot cultuur. Elke vraag is gebaseerd op bewijs.")).toBe(
      "Breng in kaart hoe volwassen jouw klantcontactorganisatie is.",
    );
    expect(heroUitleg("Breng in kaart hoe volwassen jouw organisatie is. Elke vraag is gebaseerd op bewijs.")).toBe("Breng in kaart hoe volwassen jouw organisatie is.");
    expect(heroUitleg("Eén zin zonder tweede.")).toBe("Eén zin zonder tweede.");
  });
  it("noemt het aantal bouwblokken en pijlers als ankerlink naar de sectie, en bij de AI-scan het aantal domeinen", () => {
    expect(bouwstenenLink(klantcontactVolwassenheid)).toEqual({ tekst: "15 bouwblokken in 5 pijlers", href: "#bouwblokken" });
    expect(bouwstenenLink(aiScan)).toEqual({ tekst: "8 domeinen", href: "#ai" });
    expect(bouwstenenLink(ziekenhuisQuickscan)).toBeNull();
  });
});

describe("de content op de Assessment-pagina", () => {
  it("kiest de content op het type: Volwassenheid en Zorg, AI, en niets bij de Quickscan", () => {
    expect(contentSoort(klantcontactVolwassenheid)).toBe("volwassenheid");
    expect(contentSoort(zorgscan)).toBe("volwassenheid");
    expect(contentSoort(aiScan)).toBe("ai");
    expect(contentSoort(ziekenhuisQuickscan)).toBeNull();
  });
  it("heeft per type de secties van de sub-nav en bij de Quickscan geen sub-nav", () => {
    expect(paginaSecties(klantcontactVolwassenheid).map((s) => s.label)).toEqual(["Visie", "De 15 bouwblokken", "Wat krijg ik", "Praktisch"]);
    expect(paginaSecties(aiScan).map((s) => s.id)).toEqual(["ai", "2030", "wat", "praktisch"]);
    expect(paginaSecties(ziekenhuisQuickscan)).toEqual([]);
  });
  it("geeft de link Over deze scan met de tekst per type en niet bij de Quickscan", () => {
    expect(overDezeScan(klantcontactVolwassenheid)).toEqual({ tekst: "Over deze scan: visie en bouwblokken", href: "/klantcontact-volwassenheid" });
    expect(overDezeScan(zorgscan)?.tekst).toBe("Over deze scan: visie en bouwblokken");
    expect(overDezeScan(aiScan)?.tekst).toBe("Over deze scan: AI-domeinen en 2030");
    expect(overDezeScan(ziekenhuisQuickscan)).toBeNull();
    expect(overDezeScan(undefined)).toBeNull();
  });
});

describe("de tegels op scherm 1", () => {
  it("noemt de aantallen uit het Assessment in het eerste en tweede punt", () => {
    const t = tegelInhoud(klantcontactVolwassenheid);
    expect(t.zin).toBe("Breng in kaart hoe volwassen jouw klantcontactorganisatie is.");
    expect(t.punten.map((p) => p.tekst)).toEqual(["60 vragen, ±30 minuten", "15 bouwblokken in 5 categorieën", "Concrete stappen op basis van je scores"]);
  });
  it("heeft per Assessment eigen punten", () => {
    expect(tegelInhoud(aiScan).punten.map((p) => p.tekst)).toEqual(["40 vragen, ±20 minuten", "8 AI-domeinen", "Concrete stappen per domein"]);
    expect(tegelInhoud(zorgscan).punten[2].tekst).toBe("Scores gewogen voor de zorg, met concrete stappen");
    expect(tegelInhoud(ziekenhuisQuickscan).punten.map((p) => p.icoon)).toEqual(["klok", "lagen", "staafjes"]);
    expect(tegelInhoud(ziekenhuisQuickscan).punten[1].tekst).toBe("10 dimensies");
  });
});

describe("de actieve sectie van de sub-nav", () => {
  const tops = (...t: number[]) => ["visie", "bouwblokken", "wat", "praktisch"].map((id, i) => ({ id, top: t[i] }));
  it("is de laatste sectie waarvan de bovenkant minder dan 170px onder de bovenkant van het venster staat", () => {
    expect(actieveSectie(tops(900, 1700, 2500, 3300))).toBeNull();
    expect(actieveSectie(tops(160, 900, 1700, 2500))).toBe("visie");
    expect(actieveSectie(tops(-800, 169, 900, 1700))).toBe("bouwblokken");
    expect(actieveSectie(tops(-800, 170, 900, 1700))).toBe("visie");
    expect(actieveSectie(tops(-3000, -2000, -1000, 100))).toBe("praktisch");
  });
});
