"use client";

/**
 * De benchmarks met hun leden voor de schermen (`lib/verkenning-benchmark.ts`): Bij een opgeslagen verkenning worden de leden bij
 * elke render berekend uit de filters, zodat een organisatie die erbij komt of afvalt direct meetelt. `useBenchmarks` uit
 * `lib/benchmark-store.ts` geeft de ruwe opslag, zonder die leden.
 */
import { Benchmark } from "./types";
import { useBenchmarks as useBenchmarksRuw } from "./benchmark-store";
import { useOrganisaties } from "./db";
import { useInstellingen } from "./instellingen-store";
import { materialiseerBenchmarks } from "./verkenning-benchmark";

export function useBenchmarksMetLeden(): Benchmark[] {
  const benchmarks = useBenchmarksRuw();
  const organisaties = useOrganisaties();
  const { benchmarkMinScans } = useInstellingen();
  return materialiseerBenchmarks(benchmarks, organisaties, benchmarkMinScans);
}

export function useBenchmarkMetLeden(id: string): Benchmark | undefined {
  return useBenchmarksMetLeden().find((b) => b.id === id);
}
