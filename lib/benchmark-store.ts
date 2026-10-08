import { useSyncExternalStore } from "react";
import { Benchmark, BenchmarkLid, BenchmarkNiveau, BenchmarkToewijzing } from "./types";
import { nieuwId } from "./id";
import { logAudit } from "./audit-store";

/**
 * Opslag van benchmarks en hun toewijzingen (`datamodel.md` deel 3, `benchmark.md`). Alleen de samenstelling staat
 * hier, nooit scores: Die worden berekend (`lib/benchmark.ts`). Zelfde localStorage-patroon als de audit-log: Eén sleutel,
 * alleen in deze browser. De serveropslag (`/api/store/[key]`) kent deze sleutel nog niet, dus er is geen synchronisatie
 * tot de database er is (`azure-plan.md`).
 *
 * Deze module kent geen organisaties of assessments, zodat de verwijderacties in `lib/db` hier kunnen opruimen zonder
 * een kringverwijzing. Namen voor het audit-log geven de aanroepers mee.
 */
const KEY = "coniche-scan:benchmarks";
const SERVER_SENTINEL = "__server__";

interface Opslag {
  benchmarks: Benchmark[];
  toewijzingen: BenchmarkToewijzing[];
}

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void {
  listeners.forEach((l) => l());
}
function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  return window.localStorage.getItem(KEY) ?? "";
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

const LEEG: Opslag = { benchmarks: [], toewijzingen: [] };

function parse(snapshot: string): Opslag {
  if (!snapshot || snapshot === SERVER_SENTINEL) return LEEG;
  try {
    const w = JSON.parse(snapshot) as Partial<Opslag>;
    return {
      benchmarks: Array.isArray(w.benchmarks)
        ? w.benchmarks.map((b) => ({ ...b, leden: b.leden ?? [], assessmentIds: b.assessmentIds ?? [], meldingen: b.meldingen ?? [] }))
        : [],
      toewijzingen: Array.isArray(w.toewijzingen) ? w.toewijzingen : [],
    };
  } catch {
    return LEEG;
  }
}

function laad(): Opslag {
  return structuredClone(parse(getSnapshot()));
}

function bewaar(opslag: Opslag): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(opslag));
  emitChange();
}

/** Stabiele referentie per snapshot, zodat `useSyncExternalStore` niet bij elke render een nieuw object ziet. */
let laatsteSnapshot = "";
let laatsteOpslag: Opslag = LEEG;
function gecached(snapshot: string): Opslag {
  if (snapshot !== laatsteSnapshot) {
    laatsteSnapshot = snapshot;
    laatsteOpslag = parse(snapshot);
  }
  return laatsteOpslag;
}

export function useBenchmarks(): Benchmark[] {
  return gecached(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)).benchmarks;
}

export function useBenchmark(id: string): Benchmark | undefined {
  return useBenchmarks().find((b) => b.id === id);
}

export function useBenchmarkToewijzingen(): BenchmarkToewijzing[] {
  return gecached(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)).toewijzingen;
}

export function getBenchmarks(): Benchmark[] {
  return parse(getSnapshot()).benchmarks;
}

/** Namen zoals ze op dat moment waren, voor het audit-log (`datamodel.md`, Audit, Benchmark). */
export interface BenchmarkNamen {
  assessmentNamen: string[];
  organisatieNamen: string[];
  /** Alleen op de niveaus binnen een organisatie, waar een Meting het lid is. */
  metingLabels?: string[];
}

export function maakBenchmark(
  input: { naam: string; niveau?: BenchmarkNiveau; assessmentIds: string[]; leden: BenchmarkLid[]; aangemaaktDoor: string },
  namen: BenchmarkNamen
): Benchmark {
  const opslag = laad();
  const benchmark: Benchmark = {
    id: nieuwId(),
    naam: input.naam,
    niveau: input.niveau ?? "organisaties",
    assessmentIds: input.assessmentIds,
    leden: input.leden,
    meldingen: [],
    aangemaaktOp: new Date().toISOString(),
    aangemaaktDoor: input.aangemaaktDoor,
  };
  opslag.benchmarks.push(benchmark);
  bewaar(opslag);
  logAudit({
    actie: "benchmark.aangemaakt",
    entiteitType: "benchmark",
    entiteitId: benchmark.id,
    entiteitNaam: benchmark.naam,
    details: { benchmarkNaam: benchmark.naam, niveau: benchmark.niveau, ...namen },
  });
  return benchmark;
}

/** Wijzigt de samenstelling. Leden van een Assessment dat niet meer gekozen is, vallen weg. */
export function wijzigBenchmark(
  id: string,
  input: { naam: string; assessmentIds: string[]; leden: BenchmarkLid[] },
  namen: BenchmarkNamen
): void {
  const opslag = laad();
  const benchmark = opslag.benchmarks.find((b) => b.id === id);
  if (!benchmark) return;
  benchmark.naam = input.naam;
  benchmark.assessmentIds = input.assessmentIds;
  benchmark.leden = input.leden.filter((l) => input.assessmentIds.includes(l.assessmentId));
  benchmark.meldingen = [];
  // Een toewijzing voor een lid dat niet meer meedoet, heeft geen view meer om te tonen.
  ruimToewijzingenOp(opslag, benchmark);
  bewaar(opslag);
  logAudit({
    actie: "benchmark.gewijzigd",
    entiteitType: "benchmark",
    entiteitId: id,
    entiteitNaam: benchmark.naam,
    details: { benchmarkNaam: benchmark.naam, niveau: benchmark.niveau ?? "organisaties", ...namen },
  });
}

export function sluitBenchmarkMeldingen(id: string): void {
  const opslag = laad();
  const benchmark = opslag.benchmarks.find((b) => b.id === id);
  if (!benchmark || benchmark.meldingen.length === 0) return;
  benchmark.meldingen = [];
  bewaar(opslag);
}

/** Verwijdert de benchmark met zijn toewijzingen. Organisaties, Metingen en scans blijven bestaan. */
export function verwijderBenchmark(id: string, namen: BenchmarkNamen): void {
  const opslag = laad();
  const benchmark = opslag.benchmarks.find((b) => b.id === id);
  if (!benchmark) return;
  const aantalToewijzingen = opslag.toewijzingen.filter((t) => t.benchmarkId === id).length;
  opslag.benchmarks = opslag.benchmarks.filter((b) => b.id !== id);
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => t.benchmarkId !== id);
  bewaar(opslag);
  logAudit({
    actie: "benchmark.verwijderd",
    entiteitType: "benchmark",
    entiteitId: id,
    entiteitNaam: benchmark.naam,
    details: { benchmarkNaam: benchmark.naam, niveau: benchmark.niveau ?? "organisaties", ...namen, aantalToewijzingen },
  });
}

/** Namen voor het audit-log van een toewijzing. Nooit de naam van de Lead of, op niveau 3, van de Respondent van de view. */
export interface ToewijzingNamen {
  benchmarkNaam: string;
  organisatieNaam: string;
  niveau?: BenchmarkNiveau;
  /** Niveau 2 en 3: Het label van de Meting (bij niveau 3 de Meting, geen Respondentnaam). */
  metingLabel?: string;
}

function toewijzingDetails(namen: ToewijzingNamen): Record<string, unknown> {
  return {
    benchmarkNaam: namen.benchmarkNaam,
    niveau: namen.niveau ?? "organisaties",
    organisatieNaam: namen.organisatieNaam,
    ...(namen.metingLabel ? { metingLabel: namen.metingLabel } : {}),
  };
}

/**
 * Wijst een view toe aan een Lead (`benchmark.md`, Toewijzen aan een Lead op alle niveaus): De view van een organisatie
 * (niveau 1), een Meting (niveau 2) of een scan (niveau 3). Uniek per combinatie van benchmark, onderwerp en Lead.
 */
export function wijsBenchmarkToe(
  input: {
    benchmarkId: string;
    organisatieId: string;
    metingId?: string;
    onderwerpRespondentId?: string;
    respondentId: string;
    toegewezenDoor: string;
  },
  namen: ToewijzingNamen
): BenchmarkToewijzing | null {
  const opslag = laad();
  const bestaand = opslag.toewijzingen.find(
    (t) =>
      t.benchmarkId === input.benchmarkId &&
      t.organisatieId === input.organisatieId &&
      (t.metingId ?? null) === (input.metingId ?? null) &&
      (t.onderwerpRespondentId ?? null) === (input.onderwerpRespondentId ?? null) &&
      t.respondentId === input.respondentId
  );
  if (bestaand) return bestaand;
  const toewijzing: BenchmarkToewijzing = { id: nieuwId(), ...input, toegewezenOp: new Date().toISOString() };
  opslag.toewijzingen.push(toewijzing);
  bewaar(opslag);
  // Geen naam of e-mailadres van de Lead in de log (`datamodel.md`, Audit).
  logAudit({
    actie: "benchmark.toegewezen",
    entiteitType: "benchmark",
    entiteitId: input.benchmarkId,
    entiteitNaam: namen.benchmarkNaam,
    details: toewijzingDetails(namen),
  });
  return toewijzing;
}

export function trekBenchmarkToewijzingIn(toewijzingId: string, namen: ToewijzingNamen): void {
  const opslag = laad();
  const toewijzing = opslag.toewijzingen.find((t) => t.id === toewijzingId);
  if (!toewijzing) return;
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => t.id !== toewijzingId);
  bewaar(opslag);
  logAudit({
    actie: "benchmark.toewijzingIngetrokken",
    entiteitType: "benchmark",
    entiteitId: toewijzing.benchmarkId,
    entiteitNaam: namen.benchmarkNaam,
    details: toewijzingDetails(namen),
  });
}

/* ---------- Opruimen bij verwijderen en intrekken (datamodel.md, Verwijderen en datakoppelingen) ---------- */

const isTussenOrganisaties = (b: Benchmark): boolean => (b.niveau ?? "organisaties") === "organisaties";

/**
 * Heeft een toewijzing nog een view om te tonen? Niveau 1: De organisatie moet nog lid zijn. Niveau 2 en 3: De Meting van de
 * view moet nog lid zijn. Een toewijzing voor een lid dat uit de benchmark is gevallen, vervalt (`benchmark.md`, Verwijderen
 * en intrekken).
 */
function toewijzingGeldig(b: Benchmark, t: BenchmarkToewijzing): boolean {
  if (isTussenOrganisaties(b)) return b.leden.some((l) => l.organisatieId === t.organisatieId);
  return Boolean(t.metingId) && b.leden.some((l) => l.metingId === t.metingId);
}

/** Ruimt de toewijzingen van één benchmark op nadat zijn leden zijn gewijzigd. */
function ruimToewijzingenOp(opslag: Opslag, benchmark: Benchmark): void {
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => t.benchmarkId !== benchmark.id || toewijzingGeldig(benchmark, t));
}

/**
 * Aantal benchmarks waarin een organisatie meedoet, voor de bevestiging bij het uitzetten van de vlag of verwijderen. De
 * vlag geldt alleen voor de benchmark tussen organisaties: Op de niveaus binnen een organisatie verlaten de gegevens de
 * organisatie niet (`benchmark.md`, Niveau 2). Bij `alleenTussenOrganisaties` telt dus alleen niveau 1.
 */
export function aantalBenchmarksMetOrganisatie(organisatieId: string, alleenTussenOrganisaties = false): number {
  return getBenchmarks().filter(
    (b) => b.leden.some((l) => l.organisatieId === organisatieId) && (!alleenTussenOrganisaties || isTussenOrganisaties(b))
  ).length;
}

/** Aantal benchmarks waarin een Meting meedoet. */
export function aantalBenchmarksMetMeting(metingId: string): number {
  return getBenchmarks().filter((b) => b.leden.some((l) => l.metingId === metingId)).length;
}

function haalLedenWeg(
  welke: (lid: BenchmarkLid) => boolean,
  reden: string,
  naamVan: (lid: BenchmarkLid) => string,
  alleenTussenOrganisaties = false
): void {
  const opslag = laad();
  let gewijzigd = false;
  for (const benchmark of opslag.benchmarks) {
    if (alleenTussenOrganisaties && !isTussenOrganisaties(benchmark)) continue;
    const weg = benchmark.leden.filter(welke);
    if (weg.length === 0) continue;
    gewijzigd = true;
    benchmark.leden = benchmark.leden.filter((l) => !welke(l));
    const op = new Date().toISOString();
    const noemer = [...new Set(weg.map(naamVan))].join(", ");
    benchmark.meldingen.push({ tekst: `${noemer} is uit de benchmark gehaald: ${reden}.`, op });
    // Een toewijzing voor een lid dat niet meer meedoet, heeft geen view meer.
    ruimToewijzingenOp(opslag, benchmark);
    logAudit({
      actie: "benchmark.gewijzigd",
      entiteitType: "benchmark",
      entiteitId: benchmark.id,
      entiteitNaam: benchmark.naam,
      details: { benchmarkNaam: benchmark.naam, automatisch: true, reden, organisatieNamen: [...new Set(weg.map(naamVan))] },
    });
  }
  if (gewijzigd) bewaar(opslag);
}

/** Een Meting is verwijderd: Het lid met die Meting verdwijnt uit de benchmark. */
export function haalMetingenUitBenchmarks(metingen: { metingId: string; organisatieNaam: string }[]): void {
  const naam = new Map(metingen.map((m) => [m.metingId, m.organisatieNaam]));
  haalLedenWeg((l) => naam.has(l.metingId), "de Meting is verwijderd", (l) => naam.get(l.metingId) ?? "Een organisatie");
}

/** Organisaties zijn verwijderd of hebben de vlag verloren: Hun leden en toewijzingen verdwijnen uit de benchmarks. */
export function haalOrganisatiesUitBenchmarks(
  organisaties: { organisatieId: string; organisatieNaam: string }[],
  reden: string,
  /** Bij het intrekken van de vlag: Alleen de benchmarks tussen organisaties, want de andere niveaus kennen de vlag niet. */
  alleenTussenOrganisaties = false
): void {
  const naam = new Map(organisaties.map((o) => [o.organisatieId, o.organisatieNaam]));
  haalLedenWeg((l) => naam.has(l.organisatieId), reden, (l) => naam.get(l.organisatieId) ?? "Een organisatie", alleenTussenOrganisaties);
  // Ook een toewijzing zonder lid (bijv. alle leden al weg) gaat mee.
  const opslag = laad();
  const voor = opslag.toewijzingen.length;
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => !naam.has(t.organisatieId));
  if (opslag.toewijzingen.length !== voor) bewaar(opslag);
}

/** Respondenten met een Lead-rol zijn verwijderd of verplaatst: Hun toewijzingen verdwijnen. */
export function verwijderToewijzingenVanRespondenten(respondentIds: string[]): void {
  const ids = new Set(respondentIds);
  const opslag = laad();
  const voor = opslag.toewijzingen.length;
  // Zowel de Lead als, op niveau 3, de Respondent van wie de scan de view is.
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => !ids.has(t.respondentId) && !(t.onderwerpRespondentId && ids.has(t.onderwerpRespondentId)));
  if (opslag.toewijzingen.length !== voor) bewaar(opslag);
}

/** Een scan is verwijderd (niveau 3): De toewijzingen met die Respondent als onderwerp in die Meting vervallen. */
export function verwijderToewijzingenVanScans(scans: { metingId: string; respondentId: string }[]): void {
  if (scans.length === 0) return;
  const opslag = laad();
  const voor = opslag.toewijzingen.length;
  opslag.toewijzingen = opslag.toewijzingen.filter(
    (t) => !(t.onderwerpRespondentId && scans.some((s) => s.metingId === t.metingId && s.respondentId === t.onderwerpRespondentId))
  );
  if (opslag.toewijzingen.length !== voor) bewaar(opslag);
}

/**
 * Een Lead verliest de Lead-rol op een Meting: Zijn toewijzingen van views van die Meting (niveau 2 en 3) vervallen. Op
 * niveau 1 hangt de zichtbaarheid van `leadMetingIds` af op het moment van tonen (`viewsVoorLead`), dus die blijven staan.
 */
export function verwijderToewijzingenVoorVerlorenLeadMetingen(leadId: string, behoudenMetingIds: string[]): void {
  const opslag = laad();
  const voor = opslag.toewijzingen.length;
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => {
    if (t.respondentId !== leadId || !t.metingId) return true;
    return behoudenMetingIds.includes(t.metingId);
  });
  if (opslag.toewijzingen.length !== voor) bewaar(opslag);
}

/**
 * Een Assessment is verwijderd (`datamodel.md`, Verwijderen en datakoppelingen): Het valt weg uit `Benchmark.assessmentIds`
 * en de leden van dat Assessment verdwijnen, met een melding in de benchmark. Geeft de namen van de benchmarks terug.
 */
export function haalAssessmentUitBenchmarks(assessmentId: string, assessmentNaam: string): string[] {
  const opslag = laad();
  const geraakt: string[] = [];
  for (const benchmark of opslag.benchmarks) {
    if (!benchmark.assessmentIds.includes(assessmentId) && !benchmark.leden.some((l) => l.assessmentId === assessmentId)) continue;
    geraakt.push(benchmark.naam);
    benchmark.assessmentIds = benchmark.assessmentIds.filter((id) => id !== assessmentId);
    benchmark.leden = benchmark.leden.filter((l) => l.assessmentId !== assessmentId);
    benchmark.meldingen.push({ tekst: `${assessmentNaam} is uit de benchmark gehaald: het Assessment is verwijderd.`, op: new Date().toISOString() });
    ruimToewijzingenOp(opslag, benchmark);
  }
  if (geraakt.length > 0) bewaar(opslag);
  return geraakt;
}

