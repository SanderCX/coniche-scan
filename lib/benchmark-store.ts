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
  // Een toewijzing voor een organisatie die niet meer meedoet, heeft geen view meer om te tonen.
  const doet = new Set(benchmark.leden.map((l) => l.organisatieId));
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => t.benchmarkId !== id || doet.has(t.organisatieId));
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

/** Wijst de view van `organisatieId` toe aan een Lead. Uniek per combinatie van benchmark, organisatie en Lead. */
export function wijsBenchmarkToe(
  input: { benchmarkId: string; organisatieId: string; respondentId: string; toegewezenDoor: string },
  namen: { benchmarkNaam: string; organisatieNaam: string }
): BenchmarkToewijzing | null {
  const opslag = laad();
  const bestaand = opslag.toewijzingen.find(
    (t) =>
      t.benchmarkId === input.benchmarkId && t.organisatieId === input.organisatieId && t.respondentId === input.respondentId
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
    details: { benchmarkNaam: namen.benchmarkNaam, organisatieNaam: namen.organisatieNaam },
  });
  return toewijzing;
}

export function trekBenchmarkToewijzingIn(toewijzingId: string, namen: { benchmarkNaam: string; organisatieNaam: string }): void {
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
    details: { benchmarkNaam: namen.benchmarkNaam, organisatieNaam: namen.organisatieNaam },
  });
}

/* ---------- Opruimen bij verwijderen en intrekken (datamodel.md, Verwijderen en datakoppelingen) ---------- */

const isTussenOrganisaties = (b: Benchmark): boolean => (b.niveau ?? "organisaties") === "organisaties";

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
    // Een toewijzing voor een organisatie die niet meer meedoet, heeft geen view meer.
    const doet = new Set(benchmark.leden.map((l) => l.organisatieId));
    opslag.toewijzingen = opslag.toewijzingen.filter((t) => t.benchmarkId !== benchmark.id || doet.has(t.organisatieId));
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
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => !ids.has(t.respondentId));
  if (opslag.toewijzingen.length !== voor) bewaar(opslag);
}
