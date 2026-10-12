import { describe, expect, it } from "vitest";
import { gebruikteWaarden, kiesSpelling, optieLijst, waardeOpPad } from "./kenmerken-opties";

const pad = ["techstack", "techstack-contact-center", "leverancier"];
const org = (leverancier?: unknown) => ({
  kenmerken: leverancier === undefined ? {} : { techstack: { "techstack-contact-center": { leverancier } } },
});

describe("kenmerken-opties", () => {
  it("leest een waarde op een pad en geeft undefined bij een ontbrekende tak", () => {
    expect(waardeOpPad(org("Odigo").kenmerken, pad)).toBe("Odigo");
    expect(waardeOpPad({}, pad)).toBeUndefined();
    expect(waardeOpPad({ techstack: "tekst" }, pad)).toBeUndefined();
  });

  it("verzamelt gebruikte waarden getrimd en zonder dubbelen op hoofdletters", () => {
    const waarden = gebruikteWaarden([org(" Anywhere "), org("anywhere"), org(""), org(), org(5), org("Spotler")], pad);
    expect(waarden).toEqual(["Anywhere", "Spotler"]);
  });

  it("zet vaste opties en eigen invoer samen op alfabet, zonder dubbelen", () => {
    const lijst = optieLijst(["Genesys Cloud", "NICE CXone", "Odigo", "Five9"], ["Spotler", "Anywhere", "nice cxone"]);
    expect(lijst).toEqual(["Anywhere", "Five9", "Genesys Cloud", "NICE CXone", "Odigo", "Spotler"]);
  });

  it("sorteert hoofdletterongevoelig en behoudt de spelling van de vaste optie", () => {
    expect(optieLijst(["zendesk", "Puzzel"], ["ZENDESK", "amazon connect"])).toEqual(["amazon connect", "Puzzel", "zendesk"]);
  });

  it("neemt de huidige waarde altijd op, ook als niemand anders hem gebruikt", () => {
    expect(optieLijst(["Odigo"], [], "Eigen platform")).toEqual(["Eigen platform", "Odigo"]);
  });

  it("kiest bij een ingetypte waarde de spelling van een bestaande optie", () => {
    const lijst = ["Genesys Cloud", "Odigo"];
    expect(kiesSpelling("  genesys cloud ", lijst)).toBe("Genesys Cloud");
    expect(kiesSpelling("Nieuwe leverancier", lijst)).toBe("Nieuwe leverancier");
    expect(kiesSpelling("   ", lijst)).toBe("");
  });
});
