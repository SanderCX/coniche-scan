"use client";

import { use } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmark } from "@/lib/benchmark-store";
import { bouwBenchmarkSecties, bouwOrganisatieView, niveauVan } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { ToewijzenBlok } from "@/components/benchmark/ToewijzenBlok";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";

/**
 * Benchmark, de view van één organisatie (`beheerpagina.md`, punt 14; `benchmark.md`, View per organisatie): De Admin
 * bekijkt de view eerst zelf, per Assessment waar de organisatie lid van is. Daaronder kiest hij een bestaande Lead van
 * die organisatie om de view aan toe te wijzen, of trekt een toewijzing in. Toewijzen kan alleen als minstens één
 * Assessment aan de minimale groepsgrootte voldoet (`benchmarkMinOrganisaties`).
 */
export default function BenchmarkOrganisatiePage({
  params,
}: {
  params: Promise<{ benchmarkId: string; organisatieId: string }>;
}) {
  const { benchmarkId, organisatieId } = use(params);
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
  const organisatie = organisaties.find((o) => o.id === organisatieId);
  if (!benchmark || !organisatie || niveauVan(benchmark) !== "organisaties") {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Benchmark of organisatie niet gevonden.</p>
      </div>
    );
  }

  const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
  const views = secties
    .map((s) => bouwOrganisatieView(s, organisatie.id, instellingen.benchmarkMinOrganisaties))
    .filter((v) => v !== null);
  const peildatum = new Date();
  const voldoet = views.some((v) => v.voldoetAanDrempel);


  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Benchmark", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: organisatie.naam },
        ]}
      />
      <h1>{organisatie.naam}</h1>
      <p className="text-sm text-ink-m">
        De view van deze organisatie tegenover de rest van de groep in {benchmark.naam}. Je ziet hem zoals een Lead hem ziet, zonder namen
        van andere organisaties.
      </p>

      <ToewijzenBlok
        benchmark={benchmark}
        onderwerp={{ organisatie }}
        voldoetAanDrempel={voldoet}
        gebruikerId={gebruiker!.id}
      />

      {views.length === 0 ? (
        <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
          Deze organisatie heeft in deze benchmark geen lid meer.
        </p>
      ) : (
        views.map((v) => (
          <div key={v.assessment.id}>
            {!v.voldoetAanDrempel && (
              <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
                {v.assessment.naam}: De groep telt {v.aantalInGroep} organisaties, onder de minimale groepsgrootte van{" "}
                {instellingen.benchmarkMinOrganisaties}. Jij ziet deze view, een Lead niet.
              </p>
            )}
            <BenchmarkOrganisatieView view={v} organisatieNaam={organisatie.naam} peildatum={peildatum} />
          </div>
        ))
      )}
    </div>
  );
}
