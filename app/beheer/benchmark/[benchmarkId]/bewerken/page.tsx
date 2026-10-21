"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { BenchmarkLezing } from "@/lib/types";
import { heeftEigenResultaat } from "@/lib/assessment-structuur";
import { ruimBenchmarkVinkjesOp, useOrganisaties } from "@/lib/db";
import { wijzigBenchmark } from "@/lib/benchmark-store";
import { useBenchmarkMetLeden } from "@/lib/use-benchmarks";
import { filterRegels, isVerkenning, ledenVoorVerkenning } from "@/lib/verkenning-benchmark";
import { maakFilterNamen } from "@/lib/verkenning-namen";
import { VerkenningBewerken } from "@/components/beheer/VerkenningBewerken";
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
  const benchmark = useBenchmarkMetLeden(benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  // Tussen organisaties (niveau 1) doet ook een Assessment met Ja / Nee / Weet ik niet mee (`visualisatie-quickscan.md`, 5). Binnen
  // een organisatie en binnen een Meting rekenen de weergaven nog met de 1–5-schaal (`backlog.md`, Quickscan Ziekenhuis).
  const voorBenchmark = assessments.filter((a) => !heeftEigenResultaat(a));
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
          { label: "Bewerken" },
        ]}
      />
      <h1>{isVerkenning(benchmark) ? "Verkenning bewerken" : "Benchmark bewerken"}</h1>
      {isVerkenning(benchmark) && (
        <VerkenningBewerken
          benchmark={benchmark}
          onAnnuleren={() => router.push(`/beheer/benchmark/${benchmark.id}`)}
          onOpslaan={(w) => {
            const leden = ledenVoorVerkenning(
              organisaties,
              { ...benchmark, filters: w.filters, meetperiode: w.meetperiode ?? undefined },
              instellingen.benchmarkMinScans
            );
            wijzigBenchmark(
              benchmark.id,
              { naam: w.naam, assessmentIds: benchmark.assessmentIds, leden: [], filters: w.filters, meetperiode: w.meetperiode },
              {
                ...benchmarkNamen(benchmark.assessmentIds, leden, organisaties, assessments, "organisaties"),
                filters: filterRegels(w.filters, maakFilterNamen(instellingen.korteNamen, organisaties)),
              }
            );
            ruimBenchmarkVinkjesOp();
            router.push(`/beheer/benchmark/${benchmark.id}`);
          }}
        />
      )}
      {niveauVan(benchmark) === "organisaties" && !isVerkenning(benchmark) && (
        <BenchmarkForm
          organisaties={organisaties}
          assessments={assessments}
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
