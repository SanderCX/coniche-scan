/**
 * Rondes, onderdelen en samengestelde Metingen (`datamodel.md`, Meting, Ronde en onderdeel; `benchmark.md`, Onderdeel en
 * samengestelde Meting). Pure functies zonder opslag.
 *
 * Een ronde is een moment waarop een organisatie meet. Een Meting is één onderdeel in één ronde voor één Assessment. Een
 * samengestelde Meting is het gemiddelde van Metingen van één ronde, elk even zwaar.
 */
import { Assessment, Organisatie, Ronde, ScanInvulling, ScanUitvoering } from "./types";
import { alleVragen } from "./assessment-structuur";
import { gemiddeldeAntwoordenVoorMeting } from "./scoring";

export const STANDAARD_ONDERDEEL = "Hele organisatie";

export function onderdeelVan(meting: Pick<ScanUitvoering, "onderdeel">): string {
  const o = meting.onderdeel?.trim();
  return o ? o : STANDAARD_ONDERDEEL;
}

export function rondesVan(organisatie: Pick<Organisatie, "rondes">): Ronde[] {
  return organisatie.rondes ?? [];
}

export function isSamengesteld(meting: Pick<ScanUitvoering, "samenstelling">): boolean {
  return Array.isArray(meting.samenstelling);
}

export function rondeVan(organisatie: Pick<Organisatie, "rondes">, meting: Pick<ScanUitvoering, "rondeId">): Ronde | undefined {
  return meting.rondeId ? rondesVan(organisatie).find((r) => r.id === meting.rondeId) : undefined;
}

/**
 * Het label van een Meting is standaard "{onderdeel} | {ronde}", of alleen de naam van de ronde bij het onderdeel "Hele
 * organisatie" (`datamodel.md`, Label).
 */
export function genereerLabel(onderdeel: string, rondeLabel: string): string {
  const o = onderdeel.trim() || STANDAARD_ONDERDEEL;
  return o === STANDAARD_ONDERDEEL ? rondeLabel : `${o} | ${rondeLabel}`;
}

/** De rondes van nieuw naar oud (op `aangemaaktOp`, `datamodel.md`, Volgorde). */
export function rondesNieuwsteEerst(organisatie: Pick<Organisatie, "rondes">): Ronde[] {
  return [...rondesVan(organisatie)].sort((a, b) => b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

export function metingenInRonde(organisatie: Pick<Organisatie, "scanUitvoeringen">, rondeId: string): ScanUitvoering[] {
  return organisatie.scanUitvoeringen.filter((m) => m.rondeId === rondeId);
}

/** De Meting in een ronde met dit onderdeel en Assessment, behalve `uitgezonderd`: De uniekheid per ronde. */
export function metingMetCombinatie(
  organisatie: Pick<Organisatie, "scanUitvoeringen">,
  rondeId: string,
  onderdeel: string,
  assessmentId: string,
  uitgezonderd?: string
): ScanUitvoering | undefined {
  const o = onderdeel.trim() || STANDAARD_ONDERDEEL;
  return organisatie.scanUitvoeringen.find(
    (m) => m.id !== uitgezonderd && m.rondeId === rondeId && m.assessmentId === assessmentId && onderdeelVan(m) === o
  );
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
  verwijderdeRondeIds: string[];
}

/**
 * Houdt de rondes en samenstellingen van een organisatie kloppend na elke wijziging (muteert de organisatie):
 * - Een samengestelde Meting verliest onderliggende Metingen die niet meer bestaan.
 * - Een samengestelde Meting zonder onderliggende Metingen verdwijnt.
 * - Een Meting met een ronde die niet meer bestaat, krijgt geen ronde.
 * - Een ronde zonder Metingen verdwijnt vanzelf (`datamodel.md`, Lege ronde).
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
  const rest = organisatie.scanUitvoeringen.filter((m) => {
    if (isSamengesteld(m) && m.samenstelling!.length === 0) {
      verwijderdeSamengesteldeIds.push(m.id);
      return false;
    }
    return true;
  });
  organisatie.scanUitvoeringen = rest;

  const rondes = rondesVan(organisatie);
  const rondeIds = new Set(rondes.map((r) => r.id));
  for (const m of organisatie.scanUitvoeringen) if (m.rondeId && !rondeIds.has(m.rondeId)) delete m.rondeId;
  const gebruikt = new Set(organisatie.scanUitvoeringen.map((m) => m.rondeId).filter((id): id is string => !!id));
  const verwijderdeRondeIds = rondes.filter((r) => !gebruikt.has(r.id)).map((r) => r.id);
  if (organisatie.rondes) organisatie.rondes = rondes.filter((r) => gebruikt.has(r.id));
  return { verwijderdeSamengesteldeIds, verwijderdeRondeIds };
}

/* ---------- Vergelijken ---------- */

export interface VergelijkbareMeting {
  meting: ScanUitvoering;
  ronde: Ronde | undefined;
  onderdeel: string;
  /** Hetzelfde onderdeel en Assessment in een andere ronde: Een ontwikkeling. Anders is het verschil geen ontwikkeling. */
  ontwikkeling: boolean;
}

/**
 * De Metingen waarmee een Meting te vergelijken is (`visualisatie-scores.md`, C): Alle eerdere Metingen van hetzelfde
 * Assessment. De eerste is de voorgestelde vorige Meting: Dezelfde combinatie van onderdeel en Assessment in de vorige
 * ronde. Zit de Meting niet in een ronde, of is er geen Meting in de vorige ronde, dan geldt de bestaande regel: De meest
 * recente eerdere Meting van hetzelfde Assessment.
 */
export function vergelijkbareMetingen(organisatie: Organisatie, meting: ScanUitvoering): VergelijkbareMeting[] {
  const ronde = rondeVan(organisatie, meting);
  const onderdeel = onderdeelVan(meting);
  // Eerder: Zitten beide in een ronde, dan beslist de volgorde van de rondes, anders het moment van aanmaken.
  const eerder = organisatie.scanUitvoeringen.filter((m) => {
    if (m.id === meting.id || m.assessmentId !== meting.assessmentId) return false;
    const r = rondeVan(organisatie, m);
    if (r && ronde) return r.id !== ronde.id && r.aangemaaktOp < ronde.aangemaaktOp;
    return m.aangemaaktOp < meting.aangemaaktOp;
  });
  const naarItem = (m: ScanUitvoering): VergelijkbareMeting => {
    const r = rondeVan(organisatie, m);
    return {
      meting: m,
      ronde: r,
      onderdeel: onderdeelVan(m),
      ontwikkeling: onderdeelVan(m) === onderdeel && !!r && !!ronde && r.id !== ronde.id,
    };
  };
  const items = eerder.map(naarItem);
  // Eerst de voorgestelde Meting (dezelfde combinatie in de vorige ronde), daarna de rest van nieuw naar oud.
  const nieuwsteEerst = (a: VergelijkbareMeting, b: VergelijkbareMeting) =>
    (b.ronde?.aangemaaktOp ?? b.meting.aangemaaktOp).localeCompare(a.ronde?.aangemaaktOp ?? a.meting.aangemaaktOp) ||
    b.meting.aangemaaktOp.localeCompare(a.meting.aangemaaktOp);
  return items.sort((a, b) => Number(b.ontwikkeling) - Number(a.ontwikkeling) || nieuwsteEerst(a, b));
}

/* ---------- Matrix ---------- */

/**
 * De volgorde van de kolommen in de matrix bij Metingen met verschillende onderdelen (`visualisatie-scores.md`, E, Volgorde
 * van de kolommen): Gegroepeerd per onderdeel, en binnen een onderdeel op volgorde van ronde. Is er maar één onderdeel, dan
 * blijft de volgorde zoals ze was.
 */
export function sorteerPerOnderdeel<T extends { meting: ScanUitvoering; organisatie: Organisatie }>(rijen: T[]): T[] {
  if (new Set(rijen.map((r) => onderdeelVan(r.meting))).size < 2) return rijen;
  const moment = (r: T) => rondeVan(r.organisatie, r.meting)?.aangemaaktOp ?? r.meting.aangemaaktOp;
  return [...rijen].sort(
    (a, b) => onderdeelVan(a.meting).localeCompare(onderdeelVan(b.meting), "nl") || moment(a).localeCompare(moment(b))
  );
}
