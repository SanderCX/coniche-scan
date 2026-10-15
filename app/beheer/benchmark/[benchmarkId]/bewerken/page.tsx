"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { BenchmarkLezing } from "@/lib/types";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { ruimBenchmarkVinkjesOp, useOrganisaties } from "@/lib/db";
import { useBenchmark, wijzigBenchmark } from "@/lib/benchmark-store";
import { benchmarkNamen, niveauVan } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { BenchmarkForm } from "@/components/beheer/BenchmarkForm";
import { MetingenBenchmarkForm } from "@/components/beheer/MetingenBenchmarkForm";
import { ScanBenchmarkForm } from "@/components/beheer/ScanBenchmarkForm";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";

/** Benchmark wijzigen: De samenstelling kan altijd gewijzigd worden (`beheerpagina.md`, punt 14). */
export default function BenchmarkBewerkenPage({ params }: { params: Promise<{ benchmarkId: string }> }) {
  const { benchmarkId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const benchmark = useBenchmark(benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  // Een benchmark rekent met gemiddelden en spreiding van de 1–5-schaal: Voor Ja / Nee / Weet ik niet is dat nog niet uitgewerkt
  // (`backlog.md`, Quickscan Ziekenhuis).
  const voorBenchmark = assessments.filter((a) => !isJaNeeWeetNiet(a));
  const instellingen = useInstellingen();
  const router = useRouter();

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin wijzigt een benchmark.</p>
      </div>
    );
  }
  if (!benchmark) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Benchmark niet gevonden.</p>
      </div>
    );
  }

  // Het niveau staat vast na het aanmaken: Een ander niveau heeft andere leden.
  function opslaan(w: {
    naam: string;
    lezing?: BenchmarkLezing;
    assessmentIds: string[];
    leden: Parameters<typeof benchmarkNamen>[1];
  }) {
    wijzigBenchmark(benchmark!.id, w, benchmarkNamen(w.assessmentIds, w.leden, organisaties, assessments, niveauVan(benchmark!)));
    ruimBenchmarkVinkjesOp();
    router.push(`/beheer/benchmark/${benchmark!.id}`);
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Resultaten", href: "/beheer/resultaten/metingen" },
          { label: "Benchmarks", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: "Wijzigen" },
        ]}
      />
      <h1>Benchmark wijzigen</h1>
      {niveauVan(benchmark) === "organisaties" && (
        <BenchmarkForm
          organisaties={organisaties}
          assessments={voorBenchmark}
          minScans={instellingen.benchmarkMinScans}
          minOrganisaties={instellingen.benchmarkMinOrganisaties}
          begin={benchmark}
          bevestigLabel="Opslaan"
          onOpslaan={opslaan}
        />
      )}
      {niveauVan(benchmark) === "metingen" && (
        <MetingenBenchmarkForm
          organisaties={organisaties}
          assessments={voorBenchmark}
          minScans={instellingen.benchmarkMinScans}
          maxDagen={instellingen.benchmarkMaxDagenTussenMetingen}
          begin={benchmark}
          bevestigLabel="Opslaan"
          onOpslaan={opslaan}
        />
      )}
      {niveauVan(benchmark) === "scans" && (
        <ScanBenchmarkForm
          organisaties={organisaties}
          assessments={voorBenchmark}
          minScans={instellingen.benchmarkMinScans}
          begin={benchmark}
          bevestigLabel="Opslaan"
          onOpslaan={opslaan}
        />
      )}
    </div>
  );
}
