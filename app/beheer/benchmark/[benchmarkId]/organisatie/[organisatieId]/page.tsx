"use client";

import { use } from "react";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmark } from "@/lib/benchmark-store";
import { bouwBenchmarkSecties, bouwOrganisatieView, leadViewsOnderdelen, niveauVan } from "@/lib/benchmark";
import { isVerkenning } from "@/lib/verkenning-benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magBenchmarkBeheren } from "@/lib/rechten";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { LeadsOpView } from "@/components/benchmark/LeadsOpView";
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
  // Bij een opgeslagen verkenning met de eenheid Onderdelen is er per eigen onderdeel een view: Het onderdeel tegenover de rest van
  // de groep, of bij een filter op één Organisatie tegenover de overige onderdelen (`benchmark.md`, Detail en perspectief).
  const onderdeelViews =
    isVerkenning(benchmark) && benchmark.eenheid === "onderdelen"
      ? leadViewsOnderdelen(benchmark, secties, organisatie, instellingen.benchmarkMinOrganisaties)
      : null;

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Resultaten", href: "/beheer/resultaten/metingen" },
          { label: "Benchmarks", href: "/beheer/benchmark" },
          { label: benchmark.naam, href: `/beheer/benchmark/${benchmark.id}` },
          { label: organisatie.naam },
        ]}
      />
      <h1>{organisatie.naam}</h1>
      <p className="text-sm text-ink-m">
        De view van deze organisatie tegenover de rest van de groep in {benchmark.naam}. Je ziet hem zoals een Lead hem ziet, zonder namen
        van andere organisaties.
      </p>

      {onderdeelViews ? (
        onderdeelViews.length === 0 ? (
          <p className="admin-notice" style={{ marginTop: "1.5rem" }}>
            Deze organisatie heeft in deze benchmark geen onderdeel met een eigen Meting in de groep.
          </p>
        ) : (
          onderdeelViews.flatMap((o) =>
            o.niveau === "organisaties"
              ? o.views.map((v) => (
                  <BenchmarkOrganisatieView key={`${o.eigenNaam}-${v.assessment.id}`} view={v} organisatieNaam={o.eigenNaam} peildatum={peildatum} />
                ))
              : []
          )
        )
      ) : views.length === 0 ? (
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

      <LeadsOpView organisatie={organisatie} benchmark={benchmark} />
    </div>
  );
}
