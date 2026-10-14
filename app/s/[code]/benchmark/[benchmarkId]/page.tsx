"use client";

import { use } from "react";
import { useRespondentPerToegangscode, useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarks } from "@/lib/benchmark-store";
import { leadViewsVoorBenchmark } from "@/lib/benchmark";
import { benchmarkGeldigVoorOrganisatie, heeftBenchmarkToegang, metingIdsMetWeergave } from "@/lib/lead-toegang";
import { useInstellingen } from "@/lib/instellingen-store";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";

/**
 * De benchmarkview van een Lead (`benchmark.md`, View voor een Lead): Zijn eigen organisatie naast het gemiddelde van de rest
 * van de groep (niveau 1), of voor elke Meting waarvoor hij Resultaten heeft die Meting naast de overige Metingen (niveau 2),
 * per Assessment waarvan de groep groot genoeg is. Nooit de namen van andere leden, en ook niet de naam van de benchmark zelf,
 * want die is vrije tekst van een Admin. Alleen bereikbaar voor een Lead met het vinkje voor deze benchmark.
 */
export default function LeadBenchmarkPage({ params }: { params: Promise<{ code: string; benchmarkId: string }> }) {
  const { code, benchmarkId } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const benchmark = useBenchmarks().find((b) => b.id === benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();

  const toegang =
    !!gegevens &&
    !!benchmark &&
    gegevens.lid.lead === true &&
    benchmarkGeldigVoorOrganisatie(benchmark, gegevens.organisatie.id) &&
    heeftBenchmarkToegang(gegevens.organisatie, gegevens.lid.id, benchmark.id);
  if (!gegevens || !benchmark || !toegang) {
    return (
      <PageWithChrome code={code}>
        <div className="container section" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1>Geen toegang</h1>
          <p>Deze benchmark staat niet voor jou klaar.</p>
        </div>
      </PageWithChrome>
    );
  }

  const resultaten = leadViewsVoorBenchmark(
    benchmark,
    assessments,
    organisaties,
    gegevens.organisatie,
    metingIdsMetWeergave(gegevens.organisatie, gegevens.lid.id, "resultaten"),
    {
      minOrganisaties: instellingen.benchmarkMinOrganisaties,
      minMetingen: instellingen.benchmarkMinMetingen,
      minRespondenten: instellingen.benchmarkMinRespondenten,
    }
  );
  const niveau = resultaten[0]?.niveau ?? (benchmark.niveau === "metingen" ? "metingen" : "organisaties");
  const kop = niveau === "metingen" ? "Jouw Meting tegenover de overige Metingen" : "Jouw organisatie tegenover de groep";

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug identiteitMenu={<MijnGegevensMenu lid={gegevens.lid} />}>
      <div className="container section" style={{ maxWidth: "64rem" }}>
        <span className="eyebrow">Benchmark</span>
        <h1>{kop}</h1>
        {resultaten.length === 0 ? (
          <p className="mt-4">Er is op dit moment geen vergelijking beschikbaar.</p>
        ) : (
          resultaten.flatMap((r) =>
            r.views.map((v) => (
              <BenchmarkOrganisatieView
                key={`${r.eigenNaam}-${v.assessment.id}`}
                view={v}
                organisatieNaam={r.eigenNaam}
                peildatum={new Date()}
                niveau={r.niveau}
              />
            ))
          )
        )}
      </div>
    </PageWithChrome>
  );
}
