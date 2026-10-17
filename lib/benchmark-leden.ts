/**
 * De benchmarks met hun leden, buiten React om (`lib/verkenning-benchmark.ts`): Bij een vaste groep staan de leden in de opslag, bij
 * een opgeslagen verkenning worden ze berekend uit de filters en de organisaties. Voor de opslag in `lib/db`, die de vinkjes van
 * Leads kloppend houdt.
 */
import { Benchmark, Organisatie } from "./types";
import { getBenchmarks } from "./benchmark-store";
import { getInstellingen } from "./instellingen-store";
import { materialiseerBenchmarks } from "./verkenning-benchmark";

export function getBenchmarksMetLeden(organisaties: Organisatie[]): Benchmark[] {
  return materialiseerBenchmarks(getBenchmarks(), organisaties, getInstellingen().benchmarkMinScans);
}
