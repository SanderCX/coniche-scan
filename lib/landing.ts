import { Assessment } from "./types";
import { bouwblokWoorden } from "./visualisatie";
import { actieveBouwblokkenMetGroep, actieveVragen } from "./assessment-structuur";

/**
 * De uitleg in de hero van de landingspagina (`CLAUDE.md`, scherm 2, Bovenkant, besloten door Joost op 20 oktober 2026): Eén zin, de eerste van
 * `Assessment.beschrijving`. De tweede zin komt niet meer in de hero voor. Bij een tekst uit de tijd van de oude hero, waarin de eerste zin
 * "op 15 bouwblokken, verdeeld over 5 pijlers — van strategie tot cultuur" noemt, vervalt dat stuk: Het staat in de link eronder.
 */
export function heroUitleg(beschrijving: string): string {
  const eerste = beschrijving.trim().split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/)[0] ?? "";
  return eerste.replace(/\s+op \d+ bouw(?:blokken|stenen), verdeeld over \d+ pijlers( — van strategie tot cultuur)?/, "");
}

/**
 * De ankerlink onder de uitleg (`CLAUDE.md`, scherm 2, Herontwerp): "15 bouwblokken in 5 pijlers" naar de sectie "De 15 bouwblokken" op dezelfde
 * pagina, bij de Klantcontact Volwassenheidsscan en de Zorgscan, en "8 domeinen"
 * naar de sectie "AI in klantcontact" bij de AI-scan. Het aantal komt uit de actieve content.
 */
export function bouwstenenLink(assessment: Assessment): { tekst: string; href: string } | null {
  const soort = contentSoort(assessment);
  if (soort === "ai") {
    const n = actieveBouwblokkenMetGroep(assessment).length;
    return { tekst: `${n} domeinen`, href: "#ai" };
  }
  if (soort !== "volwassenheid") return null;
  const categorieen = (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd);
  const aantal = categorieen.reduce((som, c) => som + c.bouwblokken.filter((b) => !b.gearchiveerd).length, 0);
  return { tekst: `${aantal} ${bouwblokWoorden(assessment).meervoud} in ${categorieen.length} pijlers`, href: "#bouwblokken" };
}

/**
 * Welke content een Assessment op zijn pagina heeft (`CLAUDE.md`, scherm 2, Secties per Assessment): "volwassenheid" (Visie en de 15 bouwblokken)
 * bij de Klantcontact Volwassenheidsscan en de Zorgscan (de sector-variant ervan), "ai" (AI in klantcontact en 2030) bij
 * de AI-domeinen, "spanning" (De spanningsvelden, Praktisch, Wat krijg ik en Visie) bij de Spanningsmeter. De Quickscan en elk ander type hebben voorlopig geen extra content: `null`, en dan ook geen sub-nav.
 */
export type ContentSoort = "volwassenheid" | "ai" | "spanning" | "quickscan";

export function contentSoort(assessment: Assessment): ContentSoort | null {
  if (assessment.antwoordType === "spanning") return "spanning";
  // De Quickscan (Ja / Nee / Weet ik niet) heeft sinds PR 166 dezelfde kop en sub-nav, met de sectie "De 4 afdelingen" als inhoud.
  if (assessment.antwoordType === "ja-nee-weetniet") return "quickscan";
  if (assessment.bouwblokLabel === "AI-domein") return "ai";
  // De Klantcontact Volwassenheidsscan en de sector-varianten ervan (de Zorgscan): Niet langer herkend aan het label "Bouwsteen", dat nu "Bouwblok" heet en door een Admin aan te passen is.
  const isVolwassenheid = assessment.id === "klantcontact-volwassenheid" || assessment.afgeleidVanAssessmentId === "klantcontact-volwassenheid";
  if (isVolwassenheid && (assessment.categorieen ?? []).some((c) => !c.gearchiveerd)) return "volwassenheid";
  return null;
}

export interface PaginaSectie {
  id: string;
  label: string;
}

/** De secties van de sub-nav, in volgorde. Leeg als het Assessment geen content heeft (dan geen sub-nav). */
export function paginaSecties(assessment: Assessment): PaginaSectie[] {
  const soort = contentSoort(assessment);
  if (!soort) return [];
  // De volgorde van 21 oktober 2026: De inhoudssectie, Praktisch, Wat krijg ik en als laatste de Visie (bij AI: Klantcontact richting 2030).
  const eerste: PaginaSectie =
    soort === "ai"
      ? { id: "ai", label: "AI in klantcontact" }
      : soort === "spanning"
        ? { id: "velden", label: `De ${actieveBouwblokkenMetGroep(assessment).length} spanningsvelden` }
        : soort === "quickscan"
          ? { id: "afdelingen", label: `De ${(assessment.categorieen ?? []).filter((c) => !c.gearchiveerd).length} afdelingen` }
          : { id: "bouwblokken", label: "De 15 bouwstenen" };
  const laatste: PaginaSectie = soort === "ai" ? { id: "2030", label: "Klantcontact richting 2030" } : { id: "visie", label: "Visie" };
  return [eerste, { id: "praktisch", label: "Praktisch" }, { id: "wat", label: "Wat krijg ik" }, laatste];
}

/** De link "Over deze scan" op een Meting-kaart (`CLAUDE.md`, scherm 5): Met de tekst per type, en niets bij een Assessment zonder content. */
export function overDezeScan(assessment: Assessment | undefined): { tekst: string; href: string } | null {
  if (!assessment) return null;
  const soort = contentSoort(assessment);
  // Bij de Quickscan staat de link er niet (`CLAUDE.md`, scherm 5).
  if (!soort || soort === "quickscan") return null;
  return {
    tekst: soort === "ai" ? "Over deze scan: AI-domeinen en 2030" : soort === "spanning" ? "Over deze scan: Spanningsvelden en visie" : "Over deze scan: Visie en bouwstenen",
    href: `/${assessment.id}`,
  };
}

export type TegelIcoon = "klok" | "lagen" | "vlag" | "staafjes";

export interface TegelInhoud {
  zin: string;
  punten: { tekst: string; icoon: TegelIcoon }[];
}

const TEGELS: Record<string, (n: { vragen: number; duur: string; bouwblokken: number; categorieen: number }) => TegelInhoud> = {
  "klantcontact-volwassenheid": (n) => ({
    zin: "Breng in kaart hoe volwassen jouw klantcontactorganisatie is.",
    punten: [
      { tekst: `${n.vragen} vragen, ${n.duur}`, icoon: "klok" },
      { tekst: `${n.bouwblokken} bouwstenen in ${n.categorieen} categorieën`, icoon: "lagen" },
      { tekst: "Concrete stappen op basis van je scores", icoon: "vlag" },
    ],
  }),
  "ai-volwassenheid": (n) => ({
    zin: "Zie hoe ver jouw organisatie is met AI in klantcontact.",
    punten: [
      { tekst: `${n.vragen} vragen, ${n.duur}`, icoon: "klok" },
      { tekst: `${n.bouwblokken} AI-domeinen`, icoon: "lagen" },
      { tekst: "Concrete stappen per domein", icoon: "vlag" },
    ],
  }),
  zorgscan: (n) => ({
    zin: "Breng in kaart hoe volwassen het patiënt- of cliëntcontact van jouw zorg- of welzijnsorganisatie is.",
    punten: [
      { tekst: `${n.vragen} vragen, ${n.duur}`, icoon: "klok" },
      { tekst: `${n.bouwblokken} bouwstenen in ${n.categorieen} categorieën`, icoon: "lagen" },
      { tekst: "Scores gewogen voor de zorg, met concrete stappen", icoon: "vlag" },
    ],
  }),
  spanningsmeter: (n) => ({
    zin: "Zie waar de spanning zit tussen verhaal, regie, gedrag, data, processen en technologie.",
    punten: [
      { tekst: `${n.vragen} vragen, ${n.duur}`, icoon: "klok" },
      { tekst: `${n.bouwblokken} spanningsvelden`, icoon: "lagen" },
      { tekst: "Je eigen Spanningsprofiel, daarna de groep naast elkaar", icoon: "vlag" },
    ],
  }),
  "quickscan-ziekenhuis": (n) => ({
    zin: "Zie snel waar jouw ziekenhuis staat in klantcontact.",
    punten: [
      { tekst: `${n.vragen} vragen, ${n.duur}`, icoon: "klok" },
      { tekst: `${n.bouwblokken} dimensies`, icoon: "lagen" },
      { tekst: "Gemiddelde en spreiding per afdeling", icoon: "staafjes" },
    ],
  }),
};

/**
 * De inhoud van een tegel op scherm 1 (`CLAUDE.md`, scherm 1, Tegels): Eén zin en drie punten. Het eerste punt noemt het aantal vragen en de
 * invultijd, het tweede de opbouw en het derde wat je in het resultaat terugziet. De aantallen komen uit het Assessment. De teksten staan
 * hier in de code (open punt: Of ze beheerbaar worden, `CLAUDE.md`, sectie 5). Een Assessment zonder eigen tekst valt terug op de eerste zin van
 * de beschrijving en de gegevens.
 */
export function tegelInhoud(assessment: Assessment): TegelInhoud {
  const n = {
    vragen: actieveVragen(assessment).length,
    duur: assessment.geschatteDuur,
    bouwblokken: actieveBouwblokkenMetGroep(assessment).length,
    categorieen: (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd).length,
  };
  const eigen = TEGELS[assessment.id];
  if (eigen) return eigen(n);
  return {
    zin: heroUitleg(assessment.beschrijving),
    punten: [
      { tekst: `${n.vragen} vragen, ${n.duur}`, icoon: "klok" },
      { tekst: `${n.bouwblokken} ${bouwblokWoorden(assessment).meervoud}`, icoon: "lagen" },
      { tekst: "Concrete verbeterkansen", icoon: "vlag" },
    ],
  };
}

/**
 * De definitie van een afdeling in een zin, zonder de aanloop "Polikliniek = " (`content-ziekenhuis-quickscan.md`, De 4 afdelingen, besloten door
 * Joost op 21 oktober 2026): De tekst na het eerste "=", met een hoofdletter en een punt aan het einde.
 */
export function afdelingDefinitie(omschrijving: string | null | undefined): string {
  const tekst = (omschrijving ?? "").trim();
  if (!tekst) return "";
  const naGelijk = tekst.replace(/^[^=]{1,60}=\s*/, "").trim();
  const zin = naGelijk.charAt(0).toUpperCase() + naGelijk.slice(1);
  return /[.!?]$/.test(zin) ? zin : `${zin}.`;
}
