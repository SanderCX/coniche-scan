/**
 * Contactpersonen bij een Organisatie (`datamodel.md`, Contactpersoon): De regels voor de velden, de adressen en de volgorde. Pure
 * functies zonder opslag. De regels voor het adres (`normaliseerUrl`) gelden ook voor het Dossier (`lib/dossier.ts`).
 */
import { Contactpersoon } from "./types";

export const NAAM_MAX = 80;
export const FUNCTIE_MAX = 80;
export const NOTITIE_MAX = 300;

/** Spaties getrimd en samengevoegd. */
export const schoon = (s: string) => s.trim().replace(/\s+/g, " ");

/** Een adres met http of https, zonder voor- en achterspaties. Zonder schema wordt het https://. Geeft `null` bij een ongeldig adres. */
export function normaliseerUrl(invoer: string): string | null {
  const tekst = invoer.trim();
  if (!tekst) return null;
  const met = /^[a-z][a-z0-9+.-]*:/i.test(tekst) ? tekst : `https://${tekst}`;
  try {
    const u = new URL(met);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Of een adres bij LinkedIn hoort: linkedin.com of een subdomein daarvan. */
export function isLinkedinAdres(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h === "linkedin.com" || h.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

export type Controle<T> = { ok: true; waarde: T } | { ok: false; reden: string };

export interface ContactpersoonInvoer {
  naam: string;
  functie: string;
  linkedinUrl: string;
  notitie: string;
}

/** De invoer van een contactpersoon controleren: De naam is verplicht, het LinkedIn-adres is optioneel maar moet een LinkedIn-adres zijn. */
export function controleerContactpersoon(invoer: ContactpersoonInvoer): Controle<ContactpersoonInvoer> {
  const naam = schoon(invoer.naam);
  if (!naam) return { ok: false, reden: "Vul een naam in." };
  if (naam.length > NAAM_MAX) return { ok: false, reden: `De naam mag maximaal ${NAAM_MAX} tekens hebben.` };
  const functie = schoon(invoer.functie);
  if (functie.length > FUNCTIE_MAX) return { ok: false, reden: `De functie mag maximaal ${FUNCTIE_MAX} tekens hebben.` };
  const notitie = invoer.notitie.trim();
  if (notitie.length > NOTITIE_MAX) return { ok: false, reden: `De notitie mag maximaal ${NOTITIE_MAX} tekens hebben.` };
  let linkedinUrl = "";
  if (invoer.linkedinUrl.trim()) {
    const url = normaliseerUrl(invoer.linkedinUrl);
    if (!url || !isLinkedinAdres(url)) return { ok: false, reden: "Dit is geen LinkedIn-adres. Plak het adres van het profiel, bijvoorbeeld https://www.linkedin.com/in/naam." };
    linkedinUrl = url;
  }
  return { ok: true, waarde: { naam, functie, linkedinUrl, notitie } };
}

/** De contactpersonen op alfabet, hoofdletterongevoelig. */
export function contactpersonenOpAlfabet(lijst: Contactpersoon[] | undefined): Contactpersoon[] {
  return [...(lijst ?? [])].sort((a, b) => a.naam.localeCompare(b.naam, "nl", { sensitivity: "base" }));
}
