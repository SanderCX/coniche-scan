"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmark, wijzigBenchmark } from "@/lib/benchmark-store";
import { benchmarkNamen } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { BenchmarkForm } from "@/components/beheer/BenchmarkForm";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";

/** Benchmark wijzigen: De samenstelling kan altijd gewijzigd worden (`beheerpagina.md`, punt 14). */
export default function BenchmarkBewerkenPage({ params }: { params: Promise<{ benchmarkId: string }> }) {
  const { benchmarkId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const benchmark = useBenchmark(benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
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

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Benchmark", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: "Wijzigen" },
        ]}
      />
      <h1>Benchmark wijzigen</h1>
      <BenchmarkForm
        organisaties={organisaties}
        assessments={assessments}
        minScans={instellingen.benchmarkMinScans}
        minOrganisaties={instellingen.benchmarkMinOrganisaties}
        begin={benchmark}
        bevestigLabel="Opslaan"
        onOpslaan={(w) => {
          wijzigBenchmark(benchmark.id, w, benchmarkNamen(w.assessmentIds, w.leden, organisaties, assessments));
          router.push(`/beheer/benchmark/${benchmark.id}`);
        }}
      />
    </div>
  );
}
