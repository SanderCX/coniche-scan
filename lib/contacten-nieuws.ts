/**
 * Contactpersonen en nieuwsartikelen bij een Organisatie (`datamodel.md`, Contactpersoon en Nieuwsartikel): De regels voor de velden,
 * de adressen en de volgorde. Pure functies zonder opslag.
 */
import { Contactpersoon, Nieuwsartikel } from "./types";

export const NAAM_MAX = 80;
export const FUNCTIE_MAX = 80;
export const TITEL_MAX = 200;
export const BRON_MAX = 80;
export const NOTITIE_MAX = 300;

/** Spaties getrimd en samengevoegd. */
const schoon = (s: string) => s.trim().replace(/\s+/g, " ");

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

export interface NieuwsartikelInvoer {
  titel: string;
  url: string;
  bron: string;
  gepubliceerdOp: string;
  notitie: string;
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

/** De invoer van een nieuwsartikel controleren: De titel en een geldig adres zijn verplicht, de datum is optioneel. */
export function controleerNieuwsartikel(invoer: NieuwsartikelInvoer): Controle<NieuwsartikelInvoer> {
  const titel = schoon(invoer.titel);
  if (!titel) return { ok: false, reden: "Vul een titel in." };
  if (titel.length > TITEL_MAX) return { ok: false, reden: `De titel mag maximaal ${TITEL_MAX} tekens hebben.` };
  if (!invoer.url.trim()) return { ok: false, reden: "Vul het adres van het artikel in." };
  const url = normaliseerUrl(invoer.url);
  if (!url) return { ok: false, reden: "Dit is geen geldig adres. Gebruik een adres dat met http of https begint." };
  const bron = schoon(invoer.bron);
  if (bron.length > BRON_MAX) return { ok: false, reden: `De bron mag maximaal ${BRON_MAX} tekens hebben.` };
  const gepubliceerdOp = invoer.gepubliceerdOp.trim();
  if (gepubliceerdOp && (!DATUM.test(gepubliceerdOp) || Number.isNaN(Date.parse(gepubliceerdOp)))) {
    return { ok: false, reden: "De datum klopt niet." };
  }
  const notitie = invoer.notitie.trim();
  if (notitie.length > NOTITIE_MAX) return { ok: false, reden: `De notitie mag maximaal ${NOTITIE_MAX} tekens hebben.` };
  return { ok: true, waarde: { titel, url, bron, gepubliceerdOp, notitie } };
}

/** De contactpersonen op alfabet, hoofdletterongevoelig. */
export function contactpersonenOpAlfabet(lijst: Contactpersoon[] | undefined): Contactpersoon[] {
  return [...(lijst ?? [])].sort((a, b) => a.naam.localeCompare(b.naam, "nl", { sensitivity: "base" }));
}

/** De nieuwsartikelen met het nieuwste bovenaan: Op publicatiedatum, en zonder datum op het moment van toevoegen. */
export function nieuwsNieuwsteEerst(lijst: Nieuwsartikel[] | undefined): Nieuwsartikel[] {
  const sleutel = (n: Nieuwsartikel) => n.gepubliceerdOp || n.aangemaaktOp.slice(0, 10);
  return [...(lijst ?? [])].sort((a, b) => sleutel(b).localeCompare(sleutel(a)) || b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}
