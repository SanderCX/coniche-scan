"use client";

import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { maakBenchmark } from "@/lib/benchmark-store";
import { benchmarkNamen } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { BenchmarkForm } from "@/components/beheer/BenchmarkForm";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";

/** Benchmark aanmaken (`beheerpagina.md`, punt 14, Aanmaken en wijzigen). */
export default function NieuweBenchmarkPage() {
  const gebruiker = useIngelogdeGebruiker();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();
  const router = useRouter();

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin maakt een benchmark.</p>
      </div>
    );
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={[{ label: "Benchmark", href: "/beheer/benchmark" }, { label: "Nieuwe benchmark" }]} />
      <h1>Nieuwe benchmark</h1>
      <BenchmarkForm
        organisaties={organisaties}
        assessments={assessments}
        minScans={instellingen.benchmarkMinScans}
        minOrganisaties={instellingen.benchmarkMinOrganisaties}
        bevestigLabel="Benchmark aanmaken"
        onOpslaan={(w) => {
          const b = maakBenchmark(
            { ...w, aangemaaktDoor: gebruiker!.id },
            benchmarkNamen(w.assessmentIds, w.leden, organisaties, assessments)
          );
          router.push(`/beheer/benchmark/${b.id}`);
        }}
      />
    </div>
  );
}
