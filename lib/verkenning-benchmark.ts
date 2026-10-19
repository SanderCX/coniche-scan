/**
 * Een opgeslagen verkenning als benchmark (`benchmark.md`, Opgeslagen verkenning; `visualisatie-verkennen.md`, Opslaan als
 * benchmark). Een Benchmark met `soort: "verkenning"` slaat geen leden op maar filters: De leden worden bij elk gebruik bepaald met
 * de poolregels van Verkennen. Pure functies, zodat de opslag (`lib/db`), de schermen en de Lead-view dezelfde leden zien.
 */
import { Benchmark, BenchmarkLid, Organisatie, VerkenEenheid, VerkenningFilter } from "./types";
import {
  FilterStand,
  KANALEN_ID,
  LEGE_FILTERS,
  PoolLid,
  filterVelden,
  kanaalVelden,
  kiesPoolMetingen,
  onderdeelVelden,
  pasFiltersToe,
} from "./verkennen";

export function isVerkenning(benchmark: Pick<Benchmark, "soort" | "niveau">): boolean {
  return (benchmark.niveau ?? "organisaties") === "organisaties" && benchmark.soort === "verkenning";
}

/** De filters van het scherm Verkennen als op te slaan filters: Alleen een kenmerk met gekozen waarden, een filter zonder waarde filtert niets. */
export function filtersVanStand(stand: FilterStand): VerkenningFilter[] {
  const uit: VerkenningFilter[] = [];
  for (const [kenmerk, waarden] of Object.entries(stand.select)) if (waarden.length > 0) uit.push({ kenmerk, waarden: [...waarden] });
  if (stand.kanalen.length > 0) uit.push({ kenmerk: KANALEN_ID, waarden: [...stand.kanalen] });
  return uit;
}

/** De filters van een opgeslagen verkenning als filterstand van Verkennen. */
export function standVanFilters(filters: VerkenningFilter[]): FilterStand {
  const stand: FilterStand = { select: {}, bereik: {}, kanalen: [] };
  for (const f of filters) {
    if (f.kenmerk === KANALEN_ID) stand.kanalen = [...f.waarden];
    else stand.select[f.kenmerk] = [...f.waarden];
  }
  return stand;
}

/** Bestaan alle kenmerken van de filters nog? Een kenmerk dat uit de organisatievelden is verdwenen, maakt de groep leeg (`benchmark.md`, Open punten). */
export function onbekendeKenmerken(filters: VerkenningFilter[], eenheid: VerkenEenheid = "organisaties"): string[] {
  const bekend = new Set([
    ...filterVelden().map((v) => v.id),
    KANALEN_ID,
    ...(eenheid === "onderdelen" ? onderdeelVelden().map((v) => v.id) : []),
  ]);
  return filters.filter((f) => !bekend.has(f.kenmerk)).map((f) => f.kenmerk);
}

/** Een lid zonder scores: Genoeg voor de filters. */
function alsPoolLid(lid: Omit<PoolLid, "aantalScans" | "scores" | "overall">): PoolLid {
  return { ...lid, aantalScans: 0, scores: [], overall: null };
}

/**
 * De leden van een verkenning (`benchmark.md`, Opgeslagen verkenning, Leden): De pool van het Assessment (organisaties met
 * `benchmarkToegestaan` en de meest recente Meting met minstens `minScans` afgeronde scans, bij Onderdelen per onderdeel) na de
 * filters. Verwijst een filter naar een kenmerk dat niet meer bestaat, dan is de groep leeg.
 */
export function ledenVoorVerkenning(
  organisaties: Organisatie[],
  benchmark: Pick<Benchmark, "assessmentIds" | "eenheid" | "filters" | "meetperiode">,
  minScans: number
): BenchmarkLid[] {
  const assessmentId = benchmark.assessmentIds[0];
  const filters = benchmark.filters ?? [];
  const eenheid = benchmark.eenheid ?? "organisaties";
  if (!assessmentId || filters.length === 0) return [];
  if (onbekendeKenmerken(filters, eenheid).length > 0) return [];
  const { gekozen } = kiesPoolMetingen(organisaties, assessmentId, minScans, eenheid, benchmark.meetperiode);
  const velden = [...filterVelden(), ...onderdeelVelden()];
  const leden = pasFiltersToe(gekozen.map(alsPoolLid), standVanFilters(filters), velden);
  return leden.map((l) => ({ organisatieId: l.organisatie.id, assessmentId, metingId: l.meting.id }));
}

export const REDEN_GEEN_METING_IN_PERIODE = "Geen Meting in de Meetperiode";

/**
 * Waarom een Organisatie niet in een verkenning zit terwijl ze aan de filters voldoet (`benchmark.md`, Opgeslagen verkenning, Onder
 * de drempel): "Geen Meting in de Meetperiode" als de periode haar Meting uitsluit. `null` als de Organisatie meedoet of niet aan de
 * filters voldoet. Filters op Organisatie of Onderdeel doen hier niet mee: Die zeggen niets over de Meting. De tweede reden uit de
 * spec, "Geen onderdelen met een eigen Meting" bij een Organisatie met alleen een samengestelde Meting, komt niet voor: Een
 * samengestelde Meting voldoet alleen aan `benchmarkMinScans` als haar onderliggende Metingen dat doen, en die tellen dan zelf mee.
 */
export function redenGeenLid(
  organisaties: Organisatie[],
  benchmark: Pick<Benchmark, "assessmentIds" | "eenheid" | "filters" | "meetperiode">,
  organisatieId: string,
  minScans: number
): string | null {
  const assessmentId = benchmark.assessmentIds[0];
  const filters = (benchmark.filters ?? []).filter((f) => f.kenmerk !== "__organisatie" && f.kenmerk !== "__onderdeel");
  if (!assessmentId || filters.length === 0) return null;
  if (onbekendeKenmerken(filters, "organisaties").length > 0) return null;
  const doetMee = (b: typeof benchmark) => ledenVoorVerkenning(organisaties, b, minScans).some((l) => l.organisatieId === organisatieId);
  if (doetMee(benchmark)) return null;
  if (!benchmark.meetperiode) return null;
  // Zonder periode zou ze meedoen? Dan ligt het aan de periode. De virtuele filters laten we weg: Die gaan over onderdeel, niet over de Meting.
  const zonderPeriode = { ...benchmark, filters, meetperiode: undefined };
  return doetMee(zonderPeriode) ? REDEN_GEEN_METING_IN_PERIODE : null;
}

/** De benchmark met de berekende leden bij een verkenning. Een vaste groep blijft zoals ze is. */
export function materialiseerBenchmark(benchmark: Benchmark, organisaties: Organisatie[], minScans: number): Benchmark {
  if (!isVerkenning(benchmark)) return benchmark;
  return { ...benchmark, leden: ledenVoorVerkenning(organisaties, benchmark, minScans) };
}

export function materialiseerBenchmarks(benchmarks: Benchmark[], organisaties: Organisatie[], minScans: number): Benchmark[] {
  return benchmarks.map((b) => materialiseerBenchmark(b, organisaties, minScans));
}

/** Het aantal verschillende organisaties in de leden. */
export function aantalOrganisatiesInLeden(leden: BenchmarkLid[]): number {
  return new Set(leden.map((l) => l.organisatieId)).size;
}

/** Kan een verkenning worden opgeslagen? Alleen met minstens één filter (`visualisatie-verkennen.md`, Opslaan als benchmark). */
export function redenNietOpslaan(stand: FilterStand, poolGrootte: number, minPool: number, eenheidWoord: string): string | null {
  if (filtersVanStand(stand).length === 0) return "Zet eerst een filter, anders is de groep de hele pool";
  if (poolGrootte < minPool) return `Minder dan ${minPool} ${eenheidWoord} in de pool`;
  return null;
}

/** Een voorgevulde naam: Bij precies één filter met één waarde "Organisaties met {waarde}", anders leeg. */
export function voorgesteldeNaam(regelWaarden: { veld: string; waarde: string }[]): string {
  return regelWaarden.length === 1 ? `Organisaties met ${regelWaarden[0].waarde}` : "";
}

/**
 * De filters als regels voor het paneel, de lijst en de Lead ("CRM-pakket is Salesforce", bij meerdere waarden "of", bij Ingezette
 * kanalen "alle van"). De namen komen van de aanroeper, zodat de korte namen gelden.
 */
export function filterRegels(
  filters: VerkenningFilter[],
  namen: {
    veld: (kenmerk: string) => string;
    waarde: (kenmerk: string, waarde: string) => string;
  }
): string[] {
  return filters.map((f) => {
    const veld = namen.veld(f.kenmerk);
    const waarden = f.waarden.map((w) => namen.waarde(f.kenmerk, w));
    if (f.kenmerk === KANALEN_ID) return `${veld}: alle van ${waarden.join(", ")}`;
    return `${veld} is ${waarden.join(" of ")}`;
  });
}

/** De naam van een kanaal-id, voor de regels. */
export function kanaalNaam(id: string): string {
  return kanaalVelden().find((k) => k.id === id)?.naam ?? id;
}

export { LEGE_FILTERS };
