import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bouwBestand, leesHelpMap } from "../scripts/bouw-help";
import { HelpOnderwerp, controleerHelp, leesArtikel, leesInline, leesKopgegevens, leesOnderwerp } from "./help-bron";
import { HelpGebruiker, inhoudsopgave, magOnderwerp, onderwerpenVoor, rolBadge, zoekOnderwerpen } from "./help";
import { HELP_ONDERWERPEN } from "@/data/help-onderwerpen";

const WORTEL = join(__dirname, "..");
const bron = leesHelpMap(WORTEL);

const geen = new Set<string>();
const respondent: HelpGebruiker = { rol: "Respondent", toegang: geen };
const lead = (...toegang: string[]): HelpGebruiker => ({ rol: "Lead", toegang: new Set(toegang) });
const consultant: HelpGebruiker = { rol: "Consultant", toegang: geen };
const admin: HelpGebruiker = { rol: "Admin", toegang: geen };

const GELDIG = `---
titel: Voorbeeld
groep: Beginnen
volgorde: 1
rollen: [Respondent, Lead, Consultant, Admin]
afbeelding:
film:
bronnen: [CLAUDE.md]
bijgewerkt: 2026-10-19
---
Waar het over gaat.

## In het kort
Kort.

## Wat je ziet
1. Eerste.
2. Tweede.

## Zie ook
- [Ander](ander)
`;

function onderwerp(slug: string, tekst = GELDIG, patch: Partial<HelpOnderwerp> = {}): HelpOnderwerp {
  const { onderwerp: o, fouten } = leesOnderwerp(slug, tekst);
  expect(fouten).toEqual([]);
  return { ...o!, ...patch };
}
const ctx = { bronBestaat: () => true };

describe("de bron van de Help", () => {
  it("de map help/ kent geen fouten", () => {
    expect(bron.fouten).toEqual([]);
    expect(bron.onderwerpen.length).toBeGreaterThan(0);
  });

  it("data/help-onderwerpen.ts is bijgewerkt met de bestanden in help/ (draai npm run help)", () => {
    const opslag = readFileSync(join(WORTEL, "data", "help-onderwerpen.ts"), "utf8");
    expect(opslag).toBe(bouwBestand(bron.onderwerpen));
    expect(HELP_ONDERWERPEN.length).toBe(bron.onderwerpen.length);
  });

  it("de twee uitgewerkte onderwerpen hebben een afbeelding en een film", () => {
    const lezen = bron.onderwerpen.find((o) => o.slug === "resultaten-lezen");
    const verkennen = bron.onderwerpen.find((o) => o.slug === "verkennen");
    expect(lezen).toMatchObject({ film: "wat-krijg-ik" });
    expect(lezen?.svg).toContain("data-nr=\"4\"");
    expect(verkennen).toMatchObject({ film: "meetperiode" });
    expect(verkennen?.svg).toContain("data-nr=\"4\"");
  });

  it("de teksten volgen de schrijfregels: geen gedachtestreepjes en geen bouwdetails", () => {
    for (const o of bron.onderwerpen) {
      expect(o.tekst, o.slug).not.toMatch(/[—–]/);
      expect(o.tekst, o.slug).not.toMatch(/benchmarkMin|verkennenMin|`/);
      expect(o.tekst, o.slug).not.toMatch(/Bouwsteen/);
    }
  });
});

describe("kopgegevens en artikel lezen", () => {
  it("leest tekst en lijsten uit de kopgegevens", () => {
    const g = leesKopgegevens(GELDIG)!;
    expect(g.kop.rollen).toEqual(["Respondent", "Lead", "Consultant", "Admin"]);
    expect(g.kop.titel).toBe("Voorbeeld");
    expect(leesKopgegevens("geen kopgegevens")).toBeNull();
  });

  it("splitst de intro, de koppen en de genummerde lijst", () => {
    const a = leesArtikel(leesKopgegevens(GELDIG)!.tekst);
    expect(a.intro).toEqual([{ soort: "alinea", tekst: "Waar het over gaat." }]);
    expect(a.secties.map((s) => s.kop)).toEqual(["In het kort", "Wat je ziet", "Zie ook"]);
    expect(a.secties[1].blokken[0]).toEqual({ soort: "genummerd", items: ["Eerste.", "Tweede."] });
    expect(a.secties[2].blokken[0]).toEqual({ soort: "lijst", items: ["[Ander](ander)"] });
  });

  it("leest vet en verwijzingen in een zin", () => {
    expect(leesInline("**Staaf.** Zie [Ander](ander) nu.")).toEqual([
      { soort: "vet", tekst: "Staaf." },
      { soort: "tekst", tekst: " Zie " },
      { soort: "verwijzing", tekst: "Ander", slug: "ander" },
      { soort: "tekst", tekst: " nu." },
    ]);
  });
});

describe("de controle bij het bouwen", () => {
  it("een geldig onderwerp met een bestaande verwijzing is goed", () => {
    const a = onderwerp("voorbeeld");
    const b = onderwerp("ander");
    expect(controleerHelp([a, b], ctx).fouten).toEqual([]);
  });

  it("meldt een verwijzing naar een onderwerp dat niet bestaat", () => {
    expect(controleerHelp([onderwerp("voorbeeld")], ctx).fouten.join()).toContain('"ander" wijst naar een onderwerp dat niet bestaat');
  });

  it("meldt een verwijzing die een rol niet mag volgen", () => {
    const a = onderwerp("voorbeeld");
    const b = onderwerp("ander", GELDIG, { rollen: ["Admin"], groep: "Instellingen" });
    expect(controleerHelp([a, b], ctx).fouten.join()).toContain("niet te volgen voor de rol Respondent");
  });

  it("meldt een groep die de rol niet mag zien, een ontbrekende bron en een kop in de verkeerde volgorde", () => {
    const a = onderwerp("voorbeeld", GELDIG.replace("[Respondent, Lead, Consultant, Admin]", "[Respondent]").replace("Beginnen", "Instellingen").replace("[Ander](ander)", "[Voorbeeld](voorbeeld)"));
    expect(controleerHelp([a], ctx).fouten.join()).toContain("De rol Respondent mag de groep");
    expect(controleerHelp([onderwerp("voorbeeld", GELDIG.replace("[Ander](ander)", "[Voorbeeld](voorbeeld)"))], { bronBestaat: () => false }).fouten.join()).toContain("De bron CLAUDE.md bestaat niet");
    const omgekeerd = GELDIG.replace("## In het kort\nKort.\n\n## Wat je ziet", "## Wat je ziet").replace("## Zie ook", "## In het kort\nKort.\n\n## Zie ook").replace("[Ander](ander)", "[Voorbeeld](voorbeeld)");
    expect(controleerHelp([onderwerp("voorbeeld", omgekeerd)], ctx).fouten.join()).toContain("niet in de vaste volgorde");
  });

  it("meldt een nummer dat niet als markering in de afbeelding staat", () => {
    const eigen = GELDIG.replace("[Ander](ander)", "[Voorbeeld](voorbeeld)");
    const mist = onderwerp("voorbeeld", eigen, { afbeelding: "x.svg", svg: '<svg><g data-nr="1"></g></svg>' });
    expect(controleerHelp([mist], ctx).fouten.join()).toContain("Nummer 2 staat niet als markering");
    const goed = onderwerp("voorbeeld", eigen, { afbeelding: "x.svg", svg: '<svg><g data-nr="1"></g><g data-nr="2"></g></svg>' });
    expect(controleerHelp([goed], ctx).fouten).toEqual([]);
  });

  it("geeft een waarschuwing, geen fout, als een bron nieuwer is dan bijgewerkt", () => {
    const o = onderwerp("voorbeeld", GELDIG.replace("[Ander](ander)", "[Voorbeeld](voorbeeld)"));
    const r = controleerHelp([o], { bronBestaat: () => true, bronDatum: () => "2026-11-01" });
    expect(r.fouten).toEqual([]);
    expect(r.waarschuwingen.join()).toContain("nieuwer");
  });
});

describe("wie welk onderwerp ziet", () => {
  const alle = bron.onderwerpen;
  const slugs = (g: HelpGebruiker) => onderwerpenVoor(g, alle).map((o) => o.slug);

  it("een Respondent ziet alleen Beginnen en Je resultaten", () => {
    const groepen = new Set(onderwerpenVoor(respondent, alle).map((o) => o.groep));
    expect([...groepen].sort()).toEqual(["Beginnen", "Je resultaten"]);
    expect(slugs(respondent)).not.toContain("zo-werkt-coniche-scan");
  });

  it("een Lead ziet een onderwerp over Spreiding alleen met het vinkje Spreiding", () => {
    expect(slugs(lead())).not.toContain("spreiding-meting");
    expect(slugs(lead("resultaten"))).toContain("resultaten-organisatie");
    expect(slugs(lead("resultaten"))).not.toContain("spreiding-meting");
    expect(slugs(lead("resultaten", "spreiding"))).toContain("spreiding-meting");
    expect(slugs(lead("benchmark"))).toContain("benchmark-vergelijking");
    expect(slugs(lead("antwoorden"))).toContain("antwoorden-per-vraag");
  });

  it("een Lead ziet niets uit beheer", () => {
    const g = new Set(onderwerpenVoor(lead("resultaten", "spreiding", "antwoorden", "uitnodigen", "exporteren", "benchmark"), alle).map((o) => o.groep));
    expect([...g].sort()).toEqual(["Beginnen", "Je resultaten", "Voor Leads"]);
  });

  it("een Consultant ziet de onderwerpen met alleen Admin niet, een Admin wel", () => {
    expect(slugs(consultant)).not.toContain("verkennen");
    expect(slugs(consultant)).not.toContain("leads-toegang");
    expect(slugs(consultant)).toContain("resultaten-meting");
    expect(slugs(admin)).toEqual(expect.arrayContaining(["verkennen", "benchmarks", "gebruikers", "drempels-en-termijnen", "leads-toegang"]));
    expect(slugs(admin).length).toBeGreaterThan(slugs(consultant).length);
  });

  it("een onderwerp dat een rol niet mag zien, is er ook niet met de directe naam", () => {
    const verkennen = alle.find((o) => o.slug === "verkennen")!;
    expect(magOnderwerp(consultant, verkennen)).toBe(false);
    expect(magOnderwerp(lead("benchmark"), verkennen)).toBe(false);
  });

  it("de inhoudsopgave staat per groep in de vaste volgorde en laat lege groepen weg", () => {
    const o = inhoudsopgave(onderwerpenVoor(respondent, alle));
    expect(o.map((g) => g.groep)).toEqual(["Beginnen", "Je resultaten"]);
    const volgorde = o[0].onderwerpen.map((x) => x.volgorde);
    expect(volgorde).toEqual([...volgorde].sort((a, b) => a - b));
  });

  it("het zoekveld filtert op titel en tekst, elk woord moet erin voorkomen", () => {
    const voor = onderwerpenVoor(admin, alle);
    expect(zoekOnderwerpen(voor, "").length).toBe(voor.length);
    expect(zoekOnderwerpen(voor, "meetperiode").map((o) => o.slug)).toContain("verkennen");
    expect(zoekOnderwerpen(voor, "MEETPERIODE pool").map((o) => o.slug)).toContain("verkennen");
    expect(zoekOnderwerpen(voor, "bestaatniet")).toEqual([]);
  });

  it("de badge zegt voor wie het onderwerp is", () => {
    expect(rolBadge(alle.find((o) => o.slug === "mijn-metingen")!)).toBe("Iedereen");
    expect(rolBadge(alle.find((o) => o.slug === "verkennen")!)).toBe("Admin");
    expect(rolBadge(alle.find((o) => o.slug === "scan-aanmaken")!)).toBe("Admin en Consultant");
    expect(rolBadge(alle.find((o) => o.slug === "spreiding-meting")!)).toBe("Lead");
  });
});
