/**
 * Onderdeel, meetdatum en samengestelde Metingen (`datamodel.md`, Meting; `benchmark.md`, Onderdeel en samengestelde Meting).
 * Pure functies zonder opslag.
 *
 * Een Meting is één afname van één scan-type bij één organisatie, voor één onderdeel en op één meetdatum. Wat bij elkaar hoort
 * (een vergelijking, een gemiddelde) kiest de gebruiker zelf. Een samengestelde Meting is het gemiddelde van Metingen van één
 * organisatie en één Assessment, elk even zwaar.
 */
import { Assessment, Organisatie, ScanInvulling, ScanUitvoering } from "./types";
import { alleVragen } from "./assessment-structuur";
import { gemiddeldeAntwoordenVoorMeting } from "./scoring";

export const STANDAARD_ONDERDEEL = "Hele organisatie";

/** De tekst op de plek van de meetdatum bij een Meting zonder datum. */
export const DATUM_ONTBREEKT = "Datum ontbreekt";

export function onderdeelVan(meting: Pick<ScanUitvoering, "onderdeel">): string {
  const o = meting.onderdeel?.trim();
  return o ? o : STANDAARD_ONDERDEEL;
}

export function isSamengesteld(meting: Pick<ScanUitvoering, "samenstelling">): boolean {
  return Array.isArray(meting.samenstelling);
}

/* ---------- Meetdatum ---------- */

const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** Is dit een bestaande kalenderdag in de vorm `JJJJ-MM-DD`? */
export function isGeldigeDatum(waarde: unknown): waarde is string {
  if (typeof waarde !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(waarde)) return false;
  const [j, m, d] = waarde.split("-").map(Number);
  const datum = new Date(Date.UTC(j, m - 1, d));
  return datum.getUTCFullYear() === j && datum.getUTCMonth() === m - 1 && datum.getUTCDate() === d;
}

/** De meetdatum van een Meting, of `null` als die ontbreekt of niet klopt. */
export function meetdatumVan(meting: Pick<ScanUitvoering, "meetdatum">): string | null {
  return isGeldigeDatum(meting.meetdatum) ? meting.meetdatum : null;
}

/**
 * De dag van een tijdstip uit een bestand, zonder tijdstip en zonder tijdzone-verschuiving: Staat er `JJJJ-MM-DD` aan het begin
 * ("2026-01-14 09:12:00" of een ISO-tekst), dan is dat de dag. Anders de lokale dag van een andere datumnotatie. `undefined` als
 * er geen datum in te lezen is.
 */
export function dagVan(tijdstip: string | null | undefined): string | undefined {
  const tekst = tijdstip?.trim();
  if (!tekst) return undefined;
  const begin = /^(\d{4}-\d{2}-\d{2})(?![\d])/.exec(tekst)?.[1];
  if (begin) return isGeldigeDatum(begin) ? begin : undefined;
  const datum = new Date(tekst);
  if (Number.isNaN(datum.getTime())) return undefined;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${datum.getFullYear()}-${p(datum.getMonth() + 1)}-${p(datum.getDate())}`;
}

/** "okt 2026": De maand en het jaar van een meetdatum, voor de naam van een Meting. */
export function maandJaar(datum: string): string {
  const [j, m] = datum.split("-").map(Number);
  return `${MAANDEN[m - 1]} ${j}`;
}

/** "14-10-2026": De meetdatum zoals ze in lijsten staat, of "Datum ontbreekt". */
export function toonMeetdatum(datum: string | null | undefined): string {
  if (!isGeldigeDatum(datum)) return DATUM_ONTBREEKT;
  const [j, m, d] = datum.split("-");
  return `${d}-${m}-${j}`;
}

/** De dag van vandaag als `JJJJ-MM-DD` in de tijdzone van de gebruiker. */
export function vandaag(): string {
  const nu = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${nu.getFullYear()}-${p(nu.getMonth() + 1)}-${p(nu.getDate())}`;
}

/**
 * De naam van een Meting is standaard "{onderdeel} | {maand jaar}", en alleen "{maand jaar}" bij het onderdeel "Hele
 * organisatie" (`datamodel.md`, Naam van een Meting). Zonder meetdatum is het onderdeel de naam.
 */
export function genereerLabel(onderdeel: string, meetdatum?: string | null): string {
  const o = onderdeel.trim() || STANDAARD_ONDERDEEL;
  if (!isGeldigeDatum(meetdatum)) return o;
  const tijd = maandJaar(meetdatum);
  return o === STANDAARD_ONDERDEEL ? tijd : `${o} | ${tijd}`;
}

/** De naam die de app zelf zou maken voor deze Meting, uit haar huidige onderdeel en meetdatum. */
export function standaardLabel(meting: Pick<ScanUitvoering, "onderdeel" | "meetdatum">): string {
  return genereerLabel(onderdeelVan(meting), meetdatumVan(meting));
}

/** Vergelijkt twee Metingen voor "nieuwste eerst": Op meetdatum, een Meting zonder meetdatum achteraan, dan op naam. */
export function vergelijkNieuwsteEerst(
  a: Pick<ScanUitvoering, "meetdatum" | "label">,
  b: Pick<ScanUitvoering, "meetdatum" | "label">
): number {
  const da = meetdatumVan(a);
  const db = meetdatumVan(b);
  if (da && db) return db.localeCompare(da) || a.label.localeCompare(b.label, "nl");
  if (da) return -1;
  if (db) return 1;
  return a.label.localeCompare(b.label, "nl");
}

/** Op meetdatum, de nieuwste bovenaan, een Meting zonder meetdatum onderaan (`beheerpagina.md`, punt 5). */
export function nieuwsteEerst<T extends Pick<ScanUitvoering, "meetdatum" | "label">>(metingen: T[]): T[] {
  return [...metingen].sort(vergelijkNieuwsteEerst);
}

/** Vergelijkt twee Metingen voor "oudste eerst": Op meetdatum, een Meting zonder meetdatum achteraan, dan op naam. */
export function vergelijkOudsteEerst(
  a: Pick<ScanUitvoering, "meetdatum" | "label">,
  b: Pick<ScanUitvoering, "meetdatum" | "label">
): number {
  const da = meetdatumVan(a);
  const db = meetdatumVan(b);
  if (da && db) return da.localeCompare(db) || a.label.localeCompare(b.label, "nl");
  if (da) return -1;
  if (db) return 1;
  return a.label.localeCompare(b.label, "nl");
}

/** Op meetdatum, de oudste eerst, bij dezelfde datum op naam (`benchmark.md`, Niveau 2, Volgorde). Zonder datum onderaan. */
export function oudsteEerst<T extends Pick<ScanUitvoering, "meetdatum" | "label">>(metingen: T[]): T[] {
  return [...metingen].sort(vergelijkOudsteEerst);
}

/** De laatste meetdatum van een aantal Metingen, of `null` als geen ervan er een heeft. */
export function laatsteMeetdatum(metingen: Pick<ScanUitvoering, "meetdatum">[]): string | null {
  const datums = metingen.map(meetdatumVan).filter((d): d is string => d !== null);
  return datums.length === 0 ? null : datums.sort()[datums.length - 1];
}

/**
 * Het onderdeel dat "Scans samenbrengen" en Wijzigen voorstellen (`datamodel.md`, Onderdeel uit het label voorstellen).
 * Heeft de Meting al een eigen onderdeel, dan blijft dat. Anders de tekst vóór " | " in het label ("Zuid-Nederland |
 * 0-meting" geeft "Zuid-Nederland"), en zonder " | " "Hele organisatie". Het is een voorstel dat de beheerder ziet en kan
 * aanpassen, nooit een stille wijziging.
 */
export function stelOnderdeelVoor(meting: Pick<ScanUitvoering, "label" | "onderdeel">): string {
  const eigen = meting.onderdeel?.trim();
  if (eigen && eigen !== STANDAARD_ONDERDEEL) return eigen;
  const index = meting.label.indexOf(" | ");
  const voor = index > 0 ? meting.label.slice(0, index).trim() : "";
  return voor || STANDAARD_ONDERDEEL;
}

/**
 * De Meting met dezelfde combinatie van onderdeel, Assessment en meetdatum, behalve `uitgezonderd`
 * (`datamodel.md`, Uniek). Er is geen harde regel: De aanroeper toont er een waarschuwing van. Zonder meetdatum is er geen
 * combinatie om te vergelijken.
 */
export function metingMetCombinatie(
  organisatie: Pick<Organisatie, "scanUitvoeringen">,
  onderdeel: string,
  assessmentId: string,
  meetdatum: string | null | undefined,
  uitgezonderd?: string
): ScanUitvoering | undefined {
  if (!isGeldigeDatum(meetdatum)) return undefined;
  const o = onderdeel.trim() || STANDAARD_ONDERDEEL;
  return organisatie.scanUitvoeringen.find(
    (m) => m.id !== uitgezonderd && m.assessmentId === assessmentId && onderdeelVan(m) === o && meetdatumVan(m) === meetdatum
  );
}

/** De waarschuwing bij dezelfde combinatie (`beheerpagina.md`, punt 5, Dezelfde combinatie). */
export function dubbeleCombinatieTekst(bestaandLabel: string): string {
  return `Er is al een Meting met dit onderdeel, dit Assessment en deze meetdatum: "${bestaandLabel}". Opslaan kan, maar controleer of je niet dubbel meet.`;
}

/**
 * Staan er in een selectie twee Metingen met hetzelfde onderdeel en Assessment? Dan zegt een gemiddelde over twee momenten
 * van hetzelfde onderdeel weinig over de ontwikkeling (`benchmark.md`, Waarschuwing bij dezelfde combinatie).
 */
export function selectieHeeftZelfdeOnderdeel(metingen: Pick<ScanUitvoering, "onderdeel" | "assessmentId">[]): boolean {
  const gezien = new Set<string>();
  for (const m of metingen) {
    const k = `${m.assessmentId}::${onderdeelVan(m)}`;
    if (gezien.has(k)) return true;
    gezien.add(k);
  }
  return false;
}

/** De onderdelen die in deze organisatie al voorkomen, als suggestie bij een nieuwe Meting. */
export function bestaandeOnderdelen(organisatie: Pick<Organisatie, "scanUitvoeringen">): string[] {
  const set = new Set<string>();
  for (const m of organisatie.scanUitvoeringen) set.add(onderdeelVan(m));
  return [...set].sort((a, b) => a.localeCompare(b, "nl"));
}

/* ---------- Samengestelde Meting ---------- */

/** De onderliggende Metingen van een samengestelde Meting die nog bestaan. */
export function onderliggendeMetingen(organisatie: Pick<Organisatie, "scanUitvoeringen">, meting: ScanUitvoering): ScanUitvoering[] {
  if (!isSamengesteld(meting)) return [];
  const ids = new Set(meting.samenstelling);
  return organisatie.scanUitvoeringen.filter((m) => ids.has(m.id) && !isSamengesteld(m));
}

/** Samengestelde Metingen waarin deze Meting zit. */
export function samengesteldeMetingenMet(organisatie: Pick<Organisatie, "scanUitvoeringen">, metingId: string): ScanUitvoering[] {
  return organisatie.scanUitvoeringen.filter((m) => isSamengesteld(m) && m.samenstelling!.includes(metingId));
}

function afgerond(invullingen: ScanInvulling[]): number {
  return invullingen.filter((i) => i.status === "afgerond").length;
}

/** Afgeronde scans in een Meting. Bij een samengestelde Meting het totaal van de onderliggende Metingen. */
export function aantalAfgerondInMeting(organisatie: Pick<Organisatie, "scanUitvoeringen">, meting: ScanUitvoering): number {
  if (!isSamengesteld(meting)) return afgerond(meting.invullingen);
  return onderliggendeMetingen(organisatie, meting).reduce((n, m) => n + afgerond(m.invullingen), 0);
}

/**
 * Voldoet de Meting aan `benchmarkMinScans`? Bij een samengestelde Meting moet elke onderliggende Meting eraan voldoen
 * (`benchmark.md`, Samengestelde Meting, Samenstelling).
 */
export function voldoetAanMinScans(organisatie: Pick<Organisatie, "scanUitvoeringen">, meting: ScanUitvoering, minScans: number): boolean {
  if (!isSamengesteld(meting)) return afgerond(meting.invullingen) >= minScans;
  const onder = onderliggendeMetingen(organisatie, meting);
  return onder.length > 0 && onder.every((m) => afgerond(m.invullingen) >= minScans);
}

/** Het gemiddelde per vraag van een aantal antwoordensets, elke set even zwaar. Een vraag zonder antwoord ontbreekt. */
export function middelAntwoordenVanSets(assessment: Assessment, sets: Record<string, number>[]): Record<string, number> {
  const uit: Record<string, number> = {};
  for (const vraag of alleVragen(assessment)) {
    const waarden = sets.map((s) => s[vraag.id]).filter((w): w is number => typeof w === "number");
    if (waarden.length > 0) uit[vraag.id] = waarden.reduce((a, b) => a + b, 0) / waarden.length;
  }
  return uit;
}

/**
 * Het gemiddelde per vraag van een Meting. Bij een samengestelde Meting is dat het gemiddelde van de gemiddelden van de
 * onderliggende Metingen: Elke Meting telt één keer mee, ongeacht het aantal scans (`datamodel.md`, Scoreberekening). Een
 * onderliggende Meting zonder afgeronde scans telt niet mee.
 */
export function gemiddeldeAntwoordenVoorMetingMetSamenstelling(
  assessment: Assessment,
  organisatie: Pick<Organisatie, "scanUitvoeringen">,
  meting: ScanUitvoering
): Record<string, number> {
  if (!isSamengesteld(meting)) return gemiddeldeAntwoordenVoorMeting(assessment, meting.invullingen);
  const sets = onderliggendeMetingen(organisatie, meting)
    .filter((m) => afgerond(m.invullingen) > 0)
    .map((m) => gemiddeldeAntwoordenVoorMeting(assessment, m.invullingen));
  return middelAntwoordenVanSets(assessment, sets);
}

/* ---------- Opruimen ---------- */

export interface OpruimResultaat {
  verwijderdeSamengesteldeIds: string[];
}

/**
 * Houdt de samenstellingen van een organisatie kloppend na elke wijziging (muteert de organisatie):
 * - Een samengestelde Meting verliest onderliggende Metingen die niet meer bestaan.
 * - Een samengestelde Meting zonder onderliggende Metingen verdwijnt.
 * - Haar meetdatum volgt de onderliggende Metingen: De laatste meetdatum van de selectie (`datamodel.md`, Samengestelde Meting).
 * Eén onderliggende Meting laat de samengestelde Meting staan: De UI meldt dat en de Admin past haar aan of verwijdert haar.
 */
export function ruimOrganisatieOp(organisatie: Organisatie): OpruimResultaat {
  const bestaand = new Set(organisatie.scanUitvoeringen.map((m) => m.id));
  const verwijderdeSamengesteldeIds: string[] = [];
  for (const m of organisatie.scanUitvoeringen) {
    if (!isSamengesteld(m)) continue;
    m.samenstelling = m.samenstelling!.filter((id) => bestaand.has(id) && id !== m.id);
  }
  // Een samengestelde Meting in een samengestelde Meting bestaat niet: Ze valt eruit.
  const samengesteld = new Set(organisatie.scanUitvoeringen.filter(isSamengesteld).map((m) => m.id));
  for (const m of organisatie.scanUitvoeringen) {
    if (isSamengesteld(m)) m.samenstelling = m.samenstelling!.filter((id) => !samengesteld.has(id));
  }
  organisatie.scanUitvoeringen = organisatie.scanUitvoeringen.filter((m) => {
    if (isSamengesteld(m) && m.samenstelling!.length === 0) {
      verwijderdeSamengesteldeIds.push(m.id);
      return false;
    }
    return true;
  });
  for (const m of organisatie.scanUitvoeringen) {
    if (!isSamengesteld(m)) continue;
    const datum = laatsteMeetdatum(onderliggendeMetingen(organisatie, m));
    if (datum) m.meetdatum = datum;
    else delete m.meetdatum;
  }
  return { verwijderdeSamengesteldeIds };
}
