"use client";

import { use } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmark } from "@/lib/benchmark-store";
import { useInstellingen } from "@/lib/instellingen-store";
import { bouwBenchmarkSecties, bouwMetingView, MIN_METINGEN_PER_ASSESSMENT, niveauVan } from "@/lib/benchmark";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";
import { ToewijzenBlok } from "@/components/benchmark/ToewijzenBlok";

/**
 * Benchmark binnen een organisatie, de view van één Meting (`benchmark.md`, Niveau 2): De Meting naast het gemiddelde van de
 * overige Metingen, zonder de Meting zelf, in dezelfde opbouw als de view per organisatie. Binnen één organisatie is
 * anonimiteit geen probleem voor de Admin, dus de namen van de Metingen staan erbij. Alleen een Admin.
 */
export default function BenchmarkMetingPage({ params }: { params: Promise<{ benchmarkId: string; metingId: string }> }) {
  const { benchmarkId, metingId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const benchmark = useBenchmark(benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();

  if (!magBenchmarkBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Benchmark.</p>
      </div>
    );
  }
  if (!benchmark || niveauVan(benchmark) !== "metingen") {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Benchmark niet gevonden.</p>
      </div>
    );
  }

  const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
  const views = secties.map((s) => bouwMetingView(s, metingId, instellingen.benchmarkMinMetingen)).filter((v) => v !== null);
  const meting = secties.flatMap((s) => s.rijen).find((r) => r.meting.id === metingId);
  if (!meting || views.length === 0) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Deze Meting doet niet meer mee aan de benchmark.</p>
      </div>
    );
  }
  const peildatum = new Date();

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Benchmark", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: meting.meting.label },
        ]}
      />
      <h1>{meting.meting.label}</h1>
      <p className="text-sm text-ink-m">
        De view van deze Meting van {meting.organisatie.naam} tegenover de overige Metingen in {benchmark.naam}.
      </p>
      <ToewijzenBlok
        benchmark={benchmark}
        onderwerp={{ organisatie: meting.organisatie, meting: meting.meting }}
        voldoetAanDrempel={views.some((v) => v.voldoetAanDrempel)}
        gebruikerId={gebruiker!.id}
      />
      {views.map((v) => (
        <div key={v.assessment.id}>
          {!v.voldoetAanDrempel && (
            <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
              {v.assessment.naam}:{" "}
              {v.aantalAnderen === 0
                ? `Er zijn minder dan ${MIN_METINGEN_PER_ASSESSMENT} Metingen in de benchmark, dus er valt niets te vergelijken.`
                : `De groep telt ${v.aantalInGroep} Metingen, onder de minimale groepsgrootte van ${instellingen.benchmarkMinMetingen}. Jij ziet deze view, een Lead niet.`}
            </p>
          )}
          <BenchmarkOrganisatieView view={v} organisatieNaam={meting.meting.label} peildatum={peildatum} niveau="metingen" />
        </div>
      ))}
    </div>
  );
}
