"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { maakBenchmark } from "@/lib/benchmark-store";
import { benchmarkNamen } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { BenchmarkNiveau } from "@/lib/types";
import { BenchmarkForm } from "@/components/beheer/BenchmarkForm";
import { MetingenBenchmarkForm } from "@/components/beheer/MetingenBenchmarkForm";
import { ScanBenchmarkForm } from "@/components/beheer/ScanBenchmarkForm";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";

const NIVEAUS: { waarde: BenchmarkNiveau; titel: string; uitleg: string }[] = [
  { waarde: "organisaties", titel: "Tussen organisaties", uitleg: "Een groep organisaties naast elkaar, anoniem voor de Lead." },
  { waarde: "metingen", titel: "Binnen een organisatie", uitleg: "De Metingen van één organisatie naast elkaar, bijvoorbeeld een Meting per bedrijfsonderdeel." },
  { waarde: "scans", titel: "Binnen een Meting", uitleg: "De scans in één Meting naast elkaar." },
];

/** Benchmark aanmaken (`beheerpagina.md`, punt 14, Aanmaken en wijzigen): Eerst het niveau, dan de samenstelling. */
export default function NieuweBenchmarkPage() {
  const gebruiker = useIngelogdeGebruiker();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();
  const router = useRouter();
  const [niveau, setNiveau] = useState<BenchmarkNiveau>("organisaties");

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin maakt een benchmark.</p>
      </div>
    );
  }

  function opslaan(w: { naam: string; assessmentIds: string[]; leden: Parameters<typeof benchmarkNamen>[1] }) {
    const b = maakBenchmark(
      { ...w, niveau, aangemaaktDoor: gebruiker!.id },
      benchmarkNamen(w.assessmentIds, w.leden, organisaties, assessments, niveau)
    );
    router.push(`/beheer/benchmark/${b.id}`);
  }

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad delen={[{ label: "Benchmark", href: "/beheer/benchmark" }, { label: "Nieuwe benchmark" }]} />
      <h1>Nieuwe benchmark</h1>

      <h2>Niveau</h2>
      <div className="benchmark-keuzes" role="radiogroup" aria-label="Niveau">
        {NIVEAUS.map((n) => (
          <label key={n.waarde} className="benchmark-keuze">
            <input type="radio" name="niveau" checked={niveau === n.waarde} onChange={() => setNiveau(n.waarde)} />
            <span>{n.titel}</span>
            <span className="text-sm text-ink-s" style={{ fontWeight: 400 }}>
              {n.uitleg}
            </span>
          </label>
        ))}
      </div>

      {niveau === "organisaties" && (
        <BenchmarkForm
          key="organisaties"
          organisaties={organisaties}
          assessments={assessments}
          minScans={instellingen.benchmarkMinScans}
          minOrganisaties={instellingen.benchmarkMinOrganisaties}
          bevestigLabel="Benchmark aanmaken"
          onOpslaan={opslaan}
        />
      )}
      {niveau === "metingen" && (
        <MetingenBenchmarkForm
          key="metingen"
          organisaties={organisaties}
          assessments={assessments}
          minScans={instellingen.benchmarkMinScans}
          bevestigLabel="Benchmark aanmaken"
          onOpslaan={opslaan}
        />
      )}
      {niveau === "scans" && (
        <ScanBenchmarkForm
          key="scans"
          organisaties={organisaties}
          assessments={assessments}
          minScans={instellingen.benchmarkMinScans}
          bevestigLabel="Benchmark aanmaken"
          onOpslaan={opslaan}
        />
      )}
    </div>
  );
}
