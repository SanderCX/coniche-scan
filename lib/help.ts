/**
 * Wat een gebruiker in de Help ziet en vindt (`help.md`, Rol en inhoud en Zoeken). Pure functies. De rol en de toegang komen van
 * de aanroeper: Een beheerder uit zijn sessie, een Respondent of Lead uit zijn persoonlijke link en de vinkjes van een Admin.
 */
import { HELP_GROEPEN, HelpOnderwerp, HelpRol, isAdminOnderwerp, leesArtikel, platteTekst, type HelpArtikel } from "./help-bron";
import type { LeadToegang, Organisatie, OrganisatieLid } from "./types";

export interface HelpGebruiker {
  rol: HelpRol;
  /** Alleen voor een Lead: De weergaven waarvoor hij een vinkje heeft (`LeadToegang.weergave`). */
  toegang: Set<string>;
}

/** De Help-rol van een beheerder (`Gebruiker.rol`). */
export function helpRolBeheer(rol: "admin" | "consultant"): HelpGebruiker {
  return { rol: rol === "admin" ? "Admin" : "Consultant", toegang: new Set() };
}

/** De Help-rol van een Respondent: Lead als hij de Lead-rol heeft, met de weergaven die een Admin voor hem aanzette. */
export function helpRolRespondent(lid: Pick<OrganisatieLid, "id" | "lead">, organisatie: Pick<Organisatie, "leadToegang">): HelpGebruiker {
  if (lid.lead !== true) return { rol: "Respondent", toegang: new Set() };
  const toegang = (organisatie.leadToegang ?? []).filter((t: LeadToegang) => t.respondentId === lid.id).map((t) => t.weergave as string);
  return { rol: "Lead", toegang: new Set(toegang) };
}

/** Mag deze gebruiker dit onderwerp zien? Een Lead alleen als hij minstens één van de weergaven heeft die het onderwerp noemt. */
export function magOnderwerp(g: HelpGebruiker, o: HelpOnderwerp): boolean {
  if (!o.rollen.includes(g.rol)) return false;
  if (g.rol === "Lead" && o.toegang.length > 0) return o.toegang.some((t) => g.toegang.has(t));
  return true;
}

export function onderwerpenVoor(g: HelpGebruiker, alle: HelpOnderwerp[]): HelpOnderwerp[] {
  return alle.filter((o) => magOnderwerp(g, o));
}

export interface HelpGroepLijst {
  groep: string;
  onderwerpen: HelpOnderwerp[];
}

/** De inhoudsopgave: Per groep in de vaste volgorde, met de onderwerpen op volgorde. Lege groepen vallen weg. */
export function inhoudsopgave(onderwerpen: HelpOnderwerp[]): HelpGroepLijst[] {
  return HELP_GROEPEN.map((g) => ({
    groep: g.naam,
    onderwerpen: onderwerpen.filter((o) => o.groep === g.naam).sort((a, b) => a.volgorde - b.volgorde),
  })).filter((g) => g.onderwerpen.length > 0);
}

/** Het label "Admin" in de inhoudsopgave van een Admin, bij een onderwerp dat een Consultant niet ziet. */
export function toonAdminLabel(g: HelpGebruiker, o: HelpOnderwerp): boolean {
  return g.rol === "Admin" && isAdminOnderwerp(o);
}

/** De zin onder de inhoudsopgave over wat de gebruiker wel en niet ziet. */
export function zichtbaarheidsZin(g: HelpGebruiker): string {
  return g.rol === "Respondent" || g.rol === "Lead"
    ? "Je ziet alleen uitleg over wat je zelf kunt gebruiken"
    : "Een Consultant ziet de onderdelen met het label Admin niet";
}

/** De badge boven de titel: Voor wie het onderwerp is. */
export function rolBadge(o: HelpOnderwerp): string {
  const r = o.rollen;
  const heeft = (...rollen: HelpRol[]) => rollen.length === r.length && rollen.every((x) => r.includes(x));
  if (heeft("Respondent", "Lead", "Consultant", "Admin")) return "Iedereen";
  if (heeft("Respondent", "Lead")) return "Respondent en Lead";
  if (heeft("Consultant", "Admin")) return "Admin en Consultant";
  return r.join(" en ");
}

/** De tekst die het zoekveld doorzoekt: Titel en de platte tekst van het onderwerp. */
function zoektekst(o: HelpOnderwerp): string {
  return `${o.titel} ${o.tekst.split("\n").map(platteTekst).join(" ")}`.toLowerCase();
}

/**
 * Het zoekveld filtert op titel en tekst (`help.md`, Zoeken). Elk woord moet erin voorkomen, in welke volgorde ook. Een lege
 * zoekopdracht laat alles staan.
 */
export function zoekOnderwerpen(onderwerpen: HelpOnderwerp[], zoek: string): HelpOnderwerp[] {
  const woorden = zoek.toLowerCase().split(/\s+/).filter(Boolean);
  if (!woorden.length) return onderwerpen;
  return onderwerpen.filter((o) => {
    const tekst = zoektekst(o);
    return woorden.every((w) => tekst.includes(w));
  });
}

export function artikelVan(o: HelpOnderwerp): HelpArtikel {
  return leesArtikel(o.tekst);
}
