import { useSyncExternalStore } from "react";
import { Benchmark, BenchmarkLezing, Meetperiode, BenchmarkLid, BenchmarkNiveau, BenchmarkSoort, BenchmarkToewijzing, VerkenEenheid, VerkenningFilter } from "./types";
import { nieuwId } from "./id";
import { geldigeMeetperiode, meetperiodeTekst } from "./verkennen";
import { logAudit } from "./audit-store";

/**
 * Opslag van benchmarks (`datamodel.md` deel 3, `benchmark.md`). Alleen de samenstelling staat hier, nooit scores: Die worden
 * berekend (`lib/benchmark.ts`). Wie een view ziet, staat niet hier maar in `Organisatie.leadToegang` (`lib/lead-toegang.ts`):
 * De toewijzingen van vóór 14 oktober 2026 staan hier nog tot de overgang ze heeft omgezet (`legeToewijzingen`). Zelfde
 * localStorage-patroon als de audit-log: Eén sleutel,
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

const naWijziging: (() => void)[] = [];
/**
 * Roept `fn` aan na elke wijziging van de benchmarks. De opslag van organisaties gebruikt dit om de adviesverlopen kloppend te houden als de Benchmark voor een
 * koppeling verdwijnt (`datamodel.md`, Ander Assessment): Deze module kan de organisaties niet zelf importeren.
 */
export function bijBenchmarkWijziging(fn: () => void): void {
  naWijziging.push(fn);
}

function bewaar(opslag: Opslag): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(opslag));
  emitChange();
  for (const fn of naWijziging) fn();
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

export function getBenchmarks(): Benchmark[] {
  return parse(getSnapshot()).benchmarks;
}

/** Namen zoals ze op dat moment waren, voor het audit-log (`datamodel.md`, Audit, Benchmark). */
export interface BenchmarkNamen {
  assessmentNamen: string[];
  organisatieNamen: string[];
  /** Alleen op de niveaus binnen een organisatie, waar een Meting het lid is. */
  metingLabels?: string[];
  /** Alleen bij een opgeslagen verkenning: De filters als regels, zonder persoonsgegevens. */
  filters?: string[];
}

export function maakBenchmark(
  input: {
    naam: string;
    niveau?: BenchmarkNiveau;
    lezing?: BenchmarkLezing;
    /** Alleen bij niveau `organisaties`: Een verkenning heeft filters en een eenheid in plaats van leden. */
    soort?: BenchmarkSoort;
    eenheid?: VerkenEenheid;
    filters?: VerkenningFilter[];
    /** Alleen bij een verkenning (voorstel van 19 oktober 2026): Leeg betekent dat de meest recente Meting telt. */
    meetperiode?: Meetperiode | null;
    assessmentIds: string[];
    leden: BenchmarkLid[];
    aangemaaktDoor: string;
  },
  namen: BenchmarkNamen
): Benchmark {
  const opslag = laad();
  const benchmark: Benchmark = {
    id: nieuwId(),
    naam: input.naam,
    niveau: input.niveau ?? "organisaties",
    ...(input.lezing ? { lezing: input.lezing } : {}),
    ...(input.soort === "verkenning"
      ? {
          soort: "verkenning" as const,
          eenheid: input.eenheid ?? "organisaties",
          filters: input.filters ?? [],
          ...(geldigeMeetperiode(input.meetperiode) ? { meetperiode: { van: input.meetperiode.van, totEnMet: input.meetperiode.totEnMet } } : {}),
        }
      : {}),
    assessmentIds: input.assessmentIds,
    // Bij een verkenning volgen de leden uit de filters en staan ze niet in de opslag.
    leden: input.soort === "verkenning" ? [] : input.leden,
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
    details: {
      benchmarkNaam: benchmark.naam,
      niveau: benchmark.niveau,
      ...(benchmark.soort === "verkenning" ? { soort: "verkenning", eenheid: benchmark.eenheid } : {}),
      ...(benchmark.meetperiode ? { meetperiode: meetperiodeTekst(benchmark.meetperiode) } : {}),
      ...(benchmark.lezing ? { lezing: benchmark.lezing } : {}),
      ...namen,
    },
  });
  return benchmark;
}

/** Wijzigt de samenstelling. Leden van een Assessment dat niet meer gekozen is, vallen weg. */
export function wijzigBenchmark(
  id: string,
  input: {
    naam: string;
    assessmentIds: string[];
    leden: BenchmarkLid[];
    lezing?: BenchmarkLezing;
    filters?: VerkenningFilter[];
    /** Alleen bij een verkenning: `null` haalt de periode weg, ontbreekt het veld dan blijft ze zoals ze was. */
    meetperiode?: Meetperiode | null;
  },
  namen: BenchmarkNamen
): void {
  const opslag = laad();
  const benchmark = opslag.benchmarks.find((b) => b.id === id);
  if (!benchmark) return;
  benchmark.naam = input.naam;
  if (benchmark.soort === "verkenning") {
    // Alleen de naam en de filters zijn te wijzigen: Het Assessment en de eenheid blijven (`benchmark.md`, Opgeslagen verkenning, Aanpassen).
    if (input.filters) benchmark.filters = input.filters;
    if (input.meetperiode !== undefined) {
      if (geldigeMeetperiode(input.meetperiode)) benchmark.meetperiode = { van: input.meetperiode.van, totEnMet: input.meetperiode.totEnMet };
      else delete benchmark.meetperiode;
    }
  } else {
    benchmark.assessmentIds = input.assessmentIds;
    benchmark.leden = input.leden.filter((l) => input.assessmentIds.includes(l.assessmentId));
  }
  if (input.lezing) benchmark.lezing = input.lezing;
  benchmark.meldingen = [];
  // De vinkjes van Leads voor een organisatie die niet meer meedoet, vallen bij het volgende opslaan van de organisaties weg
  // (`ruimLeadToegangOp`) en tellen intussen niet meer mee (`benchmarkGeldigVoorOrganisatie`).
  bewaar(opslag);
  logAudit({
    actie: "benchmark.gewijzigd",
    entiteitType: "benchmark",
    entiteitId: id,
    entiteitNaam: benchmark.naam,
    details: {
      benchmarkNaam: benchmark.naam,
      niveau: benchmark.niveau ?? "organisaties",
      ...(benchmark.soort === "verkenning" ? { soort: "verkenning", eenheid: benchmark.eenheid } : {}),
      ...(benchmark.meetperiode ? { meetperiode: meetperiodeTekst(benchmark.meetperiode) } : {}),
      ...(benchmark.lezing ? { lezing: benchmark.lezing } : {}),
      ...namen,
    },
  });
}

export function sluitBenchmarkMeldingen(id: string): void {
  const opslag = laad();
  const benchmark = opslag.benchmarks.find((b) => b.id === id);
  if (!benchmark || benchmark.meldingen.length === 0) return;
  benchmark.meldingen = [];
  bewaar(opslag);
}

/** Verwijdert de benchmark. De vinkjes van Leads voor deze benchmark vallen weg, organisaties, Metingen en scans blijven bestaan. */
export function verwijderBenchmark(id: string, namen: BenchmarkNamen): void {
  const opslag = laad();
  const benchmark = opslag.benchmarks.find((b) => b.id === id);
  if (!benchmark) return;
  opslag.benchmarks = opslag.benchmarks.filter((b) => b.id !== id);
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => t.benchmarkId !== id);
  bewaar(opslag);
  logAudit({
    actie: "benchmark.verwijderd",
    entiteitType: "benchmark",
    entiteitId: id,
    entiteitNaam: benchmark.naam,
    details: { benchmarkNaam: benchmark.naam, niveau: benchmark.niveau ?? "organisaties", ...namen },
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

/** Organisaties zijn verwijderd of hebben de vlag verloren: Hun leden verdwijnen uit de benchmarks. */
export function haalOrganisatiesUitBenchmarks(
  organisaties: { organisatieId: string; organisatieNaam: string }[],
  reden: string,
  /** Bij het intrekken van de vlag: Alleen de benchmarks tussen organisaties, want de andere niveaus kennen de vlag niet. */
  alleenTussenOrganisaties = false
): void {
  const naam = new Map(organisaties.map((o) => [o.organisatieId, o.organisatieNaam]));
  haalLedenWeg((l) => naam.has(l.organisatieId), reden, (l) => naam.get(l.organisatieId) ?? "Een organisatie", alleenTussenOrganisaties);
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
  }
  if (geraakt.length > 0) bewaar(opslag);
  return geraakt;
}


/* ---------- De overgang van de toewijzingen (14 oktober 2026) ---------- */

/** De toewijzingen van vóór de tabel Leads die nog niet zijn omgezet in vinkjes. Leeg zodra de overgang ze heeft verwerkt. */
export function legeToewijzingen(): BenchmarkToewijzing[] {
  return parse(getSnapshot()).toewijzingen;
}

/** Verwijdert de toewijzingen die zijn omgezet in vinkjes, en laat de rest staan tot hun organisatie bekend is. */
export function wisOmgezetteToewijzingen(ids: string[]): void {
  if (ids.length === 0) return;
  const opslag = laad();
  const weg = new Set(ids);
  opslag.toewijzingen = opslag.toewijzingen.filter((t) => !weg.has(t.id));
  bewaar(opslag);
}
