/**
 * Het profiel van een Organisatie voor het organisatiepaneel en voor de Lead (`beheerpagina.md`, Organisatiepaneel; `dossier.md`, Profiel van de
 * Organisatie): De ingevulde organisatievelden in vier blokken, de cijferrij, de Kanalen, de Techstack en de overige velden, met de teksten zoals
 * ze op het scherm staan. Pure functies. Een veld zonder waarde valt weg, een blok zonder inhoud ook. Het organisatiepaneel toont alle vier de
 * blokken, de Lead alleen de blokken in `Dossier.toonProfiel`.
 */
import type { Kanaal, Organisatie } from "./types";
import { KPI_CONTACTEN, kpiWaardeVan } from "./kpi";
import { KorteNamen, korteNaamWaarde } from "./korte-namen";
import { getalTekst } from "./kenmerken-weergave";

type Obj = Record<string, unknown>;
const obj = (w: unknown): Obj => (typeof w === "object" && w !== null ? (w as Obj) : {});
const tekst = (w: unknown): string => (typeof w === "string" ? w.trim() : "");
const getal = (w: unknown): number | null => {
  if (w === "" || w === null || w === undefined) return null;
  const n = typeof w === "number" ? w : Number(String(w).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const procent = (w: unknown): string | null => {
  const t = getalTekst(w);
  return t === null ? null : `${t}%`;
};

/** De vijf blokken die een Lead kan zien (`Dossier.toonProfiel`). */
export const PROFIEL_BLOKKEN = ["cijfers", "kanalen", "techstack", "overig", "kpis"] as const;
export type ProfielBlok = (typeof PROFIEL_BLOKKEN)[number];

export const PROFIEL_BLOK_LABEL: Record<ProfielBlok, string> = {
  cijfers: "Cijfers",
  kanalen: "Kanalen",
  techstack: "Techstack",
  overig: "Overige velden",
  kpis: "KPI's",
};

/** Een getal in de cijferrij: Vanaf een miljoen "2,4 mln", vanaf duizend "850k" (alleen bij de kanalen), anders met duizendtalpunt. */
export function compactGetal(n: number, metK = false): string {
  const nl = (x: number) => x.toLocaleString("nl-NL", { maximumFractionDigits: 1 });
  if (n >= 1_000_000) return `${nl(n / 1_000_000)} mln`;
  if (metK && n >= 1000) {
    const k = Math.round((n / 1000) * 10) / 10;
    return k >= 1000 ? `${nl(n / 1_000_000)} mln` : `${nl(k)}k`;
  }
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 2 });
}

export interface ProfielCijfer {
  /** `klanten`, `fte`, `contacten` of `digitalisering`. */
  id: string;
  waarde: string;
  toelichting: string;
}

export interface ProfielKanaal {
  id: string;
  naam: string;
  ingezet: boolean;
  /** Contacten per jaar, alleen bij een ingezet kanaal ("850k"). */
  aantal: string | null;
  /** Het kanaal is te kiezen voor de KPI-ringen: Het is ingezet bij de gekozen plek (`profielKanalen` met `plek`). */
  klikbaar?: boolean;
}

export interface ProfielTegel {
  categorie: string;
  oplossing: string;
  /** De volledige naam als `oplossing` een korte naam is: Staat in de tooltip. */
  origineel?: string;
}

export interface ProfielOverig {
  label: string;
  waarde: string;
}

export interface OrganisatieProfiel {
  naam: string;
  letter: string;
  sector: { tekst: string; origineel?: string } | null;
  subsector: { tekst: string; origineel?: string } | null;
  cijfers: ProfielCijfer[];
  kanalen: ProfielKanaal[];
  techstack: ProfielTegel[];
  overig: ProfielOverig[];
}

/** De cijferrij: Vier kolommen waarvan er een wegvalt zonder waarde (`beheerpagina.md`, Cijferrij). */
export function profielCijfers(organisatie: Pick<Organisatie, "kenmerken" | "kpiWaarden">): ProfielCijfer[] {
  const k = obj(organisatie.kenmerken);
  const cijfers: ProfielCijfer[] = [];

  const klanten = obj(obj(k["volume-klantbasis"])["totaal-klanten"]);
  const aantalKlanten = getal(klanten.totaal);
  if (aantalKlanten !== null) {
    const b2c = procent(klanten["b2c-percentage"]);
    cijfers.push({ id: "klanten", waarde: compactGetal(aantalKlanten), toelichting: b2c ? `klanten, ${b2c} B2C` : "klanten" });
  }

  const fte = obj(obj(k.fte)["fte-klantcontact"]);
  const aantalFte = getal(fte.aantal);
  if (aantalFte !== null) {
    const inhouse = procent(fte["inhouse-percentage"]);
    cijfers.push({ id: "fte", waarde: compactGetal(aantalFte), toelichting: inhouse ? `FTE klantcontact, ${inhouse} inhouse` : "FTE klantcontact" });
  }

  const contacten = kpiWaardeVan(organisatie, KPI_CONTACTEN, { onderdeelId: null, kanaalId: null });
  if (contacten !== null) cijfers.push({ id: "contacten", waarde: compactGetal(contacten), toelichting: "contacten per jaar" });

  const dig = obj(k.digitalisering);
  const nu = procent(dig["percentage-2026"]);
  const ambitie = procent(dig["ambitie-2030"]);
  if (nu && ambitie) cijfers.push({ id: "digitalisering", waarde: `${nu} → ${ambitie}`, toelichting: "digitalisering 2026 en 2030" });
  else if (nu) cijfers.push({ id: "digitalisering", waarde: nu, toelichting: "digitalisering 2026" });
  else if (ambitie) cijfers.push({ id: "digitalisering", waarde: ambitie, toelichting: "ambitie digitalisering 2030" });
  return cijfers;
}

/** De Kanalen in de volgorde van `Kanaal.volgorde`: Ingezet als Contacten per jaar bij dat kanaal boven 0 ligt (`datamodel.md`, KPI's en kanalen). */
export function profielKanalen(organisatie: Pick<Organisatie, "kpiWaarden">, kanalen: Kanaal[], klikPlek?: { onderdeelId: string | null }): ProfielKanaal[] {
  return [...kanalen]
    .sort((a, b) => a.volgorde - b.volgorde)
    .map((kanaal) => {
      const waarde = kpiWaardeVan(organisatie, KPI_CONTACTEN, { onderdeelId: null, kanaalId: kanaal.id });
      const ingezet = waarde !== null && waarde > 0;
      // Of het kanaal te kiezen is: Ingezet bij de gekozen plek (een Onderdeel, of de hele Organisatie).
      const bijPlek = klikPlek ? kpiWaardeVan(organisatie, KPI_CONTACTEN, { onderdeelId: klikPlek.onderdeelId, kanaalId: kanaal.id }) : null;
      return {
        id: kanaal.id,
        naam: kanaal.naam,
        ingezet,
        aantal: ingezet ? compactGetal(waarde, true) : null,
        ...(klikPlek ? { klikbaar: bijPlek !== null && bijPlek > 0 } : {}),
      };
    });
}

/** De Techstack: Een tegel per categorie met een oplossing, alleen de oplossing (de korte naam als die er is). */
export function profielTechstack(
  organisatie: Pick<Organisatie, "kenmerken">,
  techstackVeld: { subvelden?: { id: string; label: string }[] } | undefined,
  korteNamen?: KorteNamen
): ProfielTegel[] {
  const techstack = obj(obj(organisatie.kenmerken).techstack);
  return (techstackVeld?.subvelden ?? []).flatMap((cat) => {
    const origineel = tekst(obj(techstack[cat.id]).leverancier);
    if (!origineel) return [];
    const kort = korteNaamWaarde(korteNamen, `techstack.${cat.id}.leverancier`, origineel);
    return [{ categorie: cat.label, oplossing: kort, ...(kort !== origineel ? { origineel } : {}) }];
  });
}

/** De overige velden: Adoptie mijnomgeving/app, Klantcontact management & support en IT DevOps-medewerkers. */
export function profielOverig(organisatie: Pick<Organisatie, "kenmerken">): ProfielOverig[] {
  const k = obj(organisatie.kenmerken);
  const overig: ProfielOverig[] = [];
  const adoptie = procent(obj(k["volume-klantbasis"])["adoptie-mijnomgeving"]);
  if (adoptie) overig.push({ label: "Adoptie mijnomgeving/app", waarde: adoptie });
  const fte = obj(k.fte);
  const ms = getalTekst(obj(fte["fte-management-support"]).aantal);
  if (ms) overig.push({ label: "Klantcontact management & support", waarde: ms });
  const it = obj(fte["fte-it-devops"]);
  const itAantal = getalTekst(it.aantal);
  if (itAantal) {
    const digital = procent(it["digital-percentage"]);
    overig.push({ label: "IT DevOps-medewerkers", waarde: digital ? `${itAantal}, ${digital} Digital` : itAantal });
  }
  return overig;
}

export interface ProfielBronnen {
  kanalen: Kanaal[];
  techstackVeld?: { subvelden?: { id: string; label: string }[] };
  korteNamen?: KorteNamen;
}

/** Het hele profiel van een Organisatie, met alle blokken. Voor een Lead filtert `leadProfiel` (`lib/dossier.ts`) de blokken die uit staan weg. */
export function organisatieProfiel(organisatie: Organisatie, bronnen: ProfielBronnen): OrganisatieProfiel {
  const sector = obj(obj(organisatie.kenmerken)["sector-subsector"]);
  const pil = (veldId: string, waarde: unknown) => {
    const origineel = tekst(waarde);
    if (!origineel) return null;
    const kort = korteNaamWaarde(bronnen.korteNamen, veldId, origineel);
    return { tekst: kort, ...(kort !== origineel ? { origineel } : {}) };
  };
  const naam = (organisatie.korteNaam?.trim() || organisatie.naam).trim();
  return {
    naam: organisatie.naam,
    letter: (naam.charAt(0) || "?").toLocaleUpperCase("nl-NL"),
    sector: pil("sector-subsector.sector", sector.sector),
    subsector: pil("sector-subsector.subsector", sector.subsector),
    cijfers: profielCijfers(organisatie),
    kanalen: profielKanalen(organisatie, bronnen.kanalen),
    techstack: profielTechstack(organisatie, bronnen.techstackVeld, bronnen.korteNamen),
    overig: profielOverig(organisatie),
  };
}
