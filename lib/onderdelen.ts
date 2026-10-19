/**
 * Onderdelen van een Organisatie (`datamodel.md`, Onderdeel, voorstel van 19 oktober 2026): Een deel van de Organisatie waarover
 * een Meting gaat, zoals "Particulier" of "Team A". Pure functies zonder opslag.
 *
 * Een Onderdeel bestaat één keer per Organisatie en Metingen en KPI-waarden gebruiken dezelfde lijst. "Hele organisatie" is geen
 * Onderdeel maar de vaste standaard (`onderdeelId: null`) en de naam is gereserveerd. De naam is verplicht, getrimd en uniek
 * binnen de Organisatie zonder verschil tussen hoofdletters en kleine letters.
 *
 * Een Meting verwijst met `onderdeelId` naar haar Onderdeel en heeft zelf geen naam van het Onderdeel meer (besloten op 19 oktober
 * 2026): Plekken die de naam tonen, zoeken het Onderdeel op (`onderdeelNaamVan`). Alleen bij het laden van oude data wordt de tekst
 * `onderdeel` nog één keer gelezen om de Onderdelen aan te maken (`zorgOnderdelenKloppend`) en daarna verwijderd.
 */
import { Onderdeel, Organisatie, ScanUitvoering } from "./types";
import { nieuwId } from "./id";

/** De standaard voor een Meting zonder Onderdeel. Gereserveerd, ook in andere hoofdletters. */
export const HELE_ORGANISATIE = "Hele organisatie";

export const ONDERDEEL_NAAM_MAX = 60;

/** Een naam om te vergelijken: Getrimd, lege ruimte samengevoegd en kleine letters. */
export function sleutelVan(naam: string): string {
  return naam.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isHeleOrganisatie(naam: string | null | undefined): boolean {
  return !naam || sleutelVan(naam) === sleutelVan(HELE_ORGANISATIE);
}

export function onderdelenVan(organisatie: Pick<Organisatie, "onderdelen">): Onderdeel[] {
  return organisatie.onderdelen ?? [];
}

/** Het Onderdeel met deze naam, hoofdletterongevoelig. */
export function vindOnderdeel(organisatie: Pick<Organisatie, "onderdelen">, naam: string): Onderdeel | undefined {
  const s = sleutelVan(naam);
  return onderdelenVan(organisatie).find((o) => sleutelVan(o.naam) === s);
}

/** De Onderdelen op alfabet, hoofdletterongevoelig. */
export function onderdelenOpAlfabet(organisatie: Pick<Organisatie, "onderdelen">): Onderdeel[] {
  return [...onderdelenVan(organisatie)].sort((a, b) => a.naam.localeCompare(b.naam, "nl", { sensitivity: "base" }));
}

/**
 * Of een naam bruikbaar is voor een nieuw of hernoemd Onderdeel. Komt hij hoofdletterongevoelig overeen met een bestaand
 * Onderdeel, dan geldt dat Onderdeel (`bestaand`, met zijn eigen spelling): Dat is geen fout bij het kiezen in een formulier, wel bij
 * hernoemen. De naam "Hele organisatie" kiest de standaard (`hele: true`).
 */
export type NaamControle =
  | { ok: true; naam: string; bestaand?: Onderdeel; hele?: boolean }
  | { ok: false; reden: string };

export function controleerOnderdeelNaam(organisatie: Pick<Organisatie, "onderdelen">, invoer: string): NaamControle {
  const naam = invoer.trim().replace(/\s+/g, " ");
  if (!naam) return { ok: false, reden: "Vul een naam in." };
  if (naam.length > ONDERDEEL_NAAM_MAX) return { ok: false, reden: `De naam mag maximaal ${ONDERDEEL_NAAM_MAX} tekens hebben.` };
  if (isHeleOrganisatie(naam)) return { ok: true, naam: HELE_ORGANISATIE, hele: true };
  const bestaand = vindOnderdeel(organisatie, naam);
  return bestaand ? { ok: true, naam: bestaand.naam, bestaand } : { ok: true, naam };
}

/** Een vaste, korte hash voor een stabiel id van een Onderdeel dat uit bestaande data ontstaat (FNV-1a). */
function hash(tekst: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/** Het id van een Onderdeel dat uit bestaande data ontstaat: Stabiel, zodat het bij elke keer laden hetzelfde is voor het is opgeslagen. */
export function stabielOnderdeelId(organisatieId: string, naam: string): string {
  return `od-${hash(`${organisatieId}:${sleutelVan(naam)}`)}`;
}

/** Een nieuw Onderdeel, met een willekeurig id. */
export function nieuwOnderdeel(organisatieId: string, naam: string): Onderdeel {
  return { id: nieuwId(), organisatieId, naam, aangemaaktOp: new Date().toISOString() };
}

/** Een Meting zoals ze vóór 19 oktober 2026 werd bewaard, met de naam van het Onderdeel als tekst. Alleen voor de overgang. */
type MetingMetTekst = ScanUitvoering & { onderdeel?: string };

/**
 * De overgang van de tekst op de Meting naar Onderdelen (`datamodel.md`, Onderdeel en KPI's en kanalen, Overgang). Per Organisatie wordt
 * elke naam in de oude tekst `onderdeel` die niet "Hele organisatie" is, een Onderdeel. Namen die hoofdletterongevoelig en zonder voor- en
 * achterspaties gelijk zijn, worden één Onderdeel, met de spelling die het vaakst voorkomt (bij gelijke aantallen die van de oudste Meting).
 * Daarna krijgt de Meting haar `onderdeelId` en verdwijnt de tekst. Een Meting die al een `onderdeelId` heeft, verliest alleen de tekst.
 * Idempotent. Muteert de organisatie.
 */
export function zorgOnderdelenKloppend(organisatie: Organisatie): void {
  const lijst = Array.isArray(organisatie.onderdelen) ? organisatie.onderdelen : [];
  organisatie.onderdelen = lijst;
  const metingen = organisatie.scanUitvoeringen as MetingMetTekst[];
  // Welke spelling wint voor een naam die nog geen Onderdeel is: De meest voorkomende, bij gelijkspel die van de oudste Meting.
  const onbekend = new Map<string, { telling: Map<string, number>; oudste: { spelling: string; aangemaaktOp: string } }>();
  for (const m of metingen) {
    if (m.onderdeelId) continue;
    const ruw = m.onderdeel?.trim().replace(/\s+/g, " ");
    if (!ruw || isHeleOrganisatie(ruw) || vindOnderdeel(organisatie, ruw)) continue;
    const s = sleutelVan(ruw);
    const e = onbekend.get(s) ?? { telling: new Map(), oudste: { spelling: ruw, aangemaaktOp: m.aangemaaktOp } };
    e.telling.set(ruw, (e.telling.get(ruw) ?? 0) + 1);
    if (m.aangemaaktOp < e.oudste.aangemaaktOp) e.oudste = { spelling: ruw, aangemaaktOp: m.aangemaaktOp };
    onbekend.set(s, e);
  }
  for (const [, e] of onbekend) {
    const hoogste = Math.max(...e.telling.values());
    const kandidaten = [...e.telling.entries()].filter(([, n]) => n === hoogste).map(([sp]) => sp);
    const spelling = kandidaten.includes(e.oudste.spelling) ? e.oudste.spelling : kandidaten[0];
    lijst.push({
      id: stabielOnderdeelId(organisatie.id, spelling),
      organisatieId: organisatie.id,
      naam: spelling,
      aangemaaktOp: e.oudste.aangemaaktOp,
    });
  }
  for (const m of metingen) koppelMeting(organisatie, m);
}

/** Geeft de Meting haar `onderdeelId` uit de oude tekst en haalt de tekst weg. */
function koppelMeting(organisatie: Organisatie, meting: MetingMetTekst): void {
  const ruw = meting.onderdeel?.trim();
  if (meting.onderdeelId === undefined || meting.onderdeelId === null) {
    if (!ruw || isHeleOrganisatie(ruw)) meting.onderdeelId = null;
    else meting.onderdeelId = vindOnderdeel(organisatie, ruw)?.id ?? null;
  }
  delete meting.onderdeel;
}

/** De naam van het Onderdeel van een Meting: "Hele organisatie" bij `onderdeelId: null` of een Onderdeel dat er niet meer is. */
export function onderdeelNaamVan(organisatie: Pick<Organisatie, "onderdelen">, meting: Pick<ScanUitvoering, "onderdeelId">): string {
  if (!meting.onderdeelId) return HELE_ORGANISATIE;
  return onderdelenVan(organisatie).find((o) => o.id === meting.onderdeelId)?.naam ?? HELE_ORGANISATIE;
}

/**
 * Zorgt dat een naam een Onderdeel is en geeft het terug (of `null` voor "Hele organisatie"). Bestaat de naam nog niet, dan
 * ontstaat het Onderdeel hier. Voor wie een Meting maakt of wijzigt en de naam al heeft gecontroleerd.
 */
export function zorgVoorOnderdeel(organisatie: Organisatie, invoer: string): Onderdeel | null {
  const c = controleerOnderdeelNaam(organisatie, invoer);
  if (!c.ok || c.hele) return null;
  if (c.bestaand) return c.bestaand;
  const o = nieuwOnderdeel(organisatie.id, c.naam);
  organisatie.onderdelen = [...onderdelenVan(organisatie), o];
  return o;
}

/** De Metingen die aan dit Onderdeel hangen. */
export function metingenVanOnderdeel(organisatie: Pick<Organisatie, "scanUitvoeringen">, onderdeelId: string): ScanUitvoering[] {
  return organisatie.scanUitvoeringen.filter((m) => m.onderdeelId === onderdeelId);
}
