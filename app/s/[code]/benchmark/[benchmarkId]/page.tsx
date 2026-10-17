"use client";

import { use } from "react";
import { useRespondentPerToegangscode, useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarkMetLeden } from "@/lib/use-benchmarks";
import { filterRegels, isVerkenning } from "@/lib/verkenning-benchmark";
import { maakFilterNamen } from "@/lib/verkenning-namen";
import { leadViewsVoorBenchmark } from "@/lib/benchmark";
import { benchmarkGeldigVoorOrganisatie, heeftBenchmarkToegang, metingIdsMetWeergave } from "@/lib/lead-toegang";
import { useInstellingen } from "@/lib/instellingen-store";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";
import { MetingenVergelijkingView } from "@/components/benchmark/MetingenVergelijkingView";

/**
 * De benchmarkview van een Lead (`benchmark.md`, View voor een Lead): Zijn eigen organisatie naast het gemiddelde van de rest
 * van de groep (niveau 1), of de vergelijking van de Metingen waarvoor hij Resultaten heeft (niveau 2, weergave C), per
 * Assessment. Nooit de namen van andere leden. Bij een vaste groep ook niet de naam van de benchmark zelf, want die is vrije tekst
 * van een Admin. Bij een opgeslagen verkenning staan de naam en de filters er wel (`benchmark.md`, Opgeslagen verkenning). Alleen bereikbaar voor een Lead met het vinkje voor deze benchmark.
 */
export default function LeadBenchmarkPage({ params }: { params: Promise<{ code: string; benchmarkId: string }> }) {
  const { code, benchmarkId } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const benchmark = useBenchmarkMetLeden(benchmarkId);
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
      minRespondenten: instellingen.benchmarkMinRespondenten,
    }
  );
  const niveau = resultaten[0]?.niveau ?? (benchmark.niveau === "metingen" ? "metingen" : "organisaties");
  const kop = niveau === "metingen" ? "Jouw Metingen naast elkaar" : "Jouw organisatie tegenover de groep";
  // Bij een opgeslagen verkenning zijn de naam en de filters zichtbaar voor de Lead, de ledenlijst niet (`benchmark.md`, Opgeslagen
  // verkenning, Wat de Lead ziet). Bij een vaste groep blijft de naam verborgen: Die is vrije tekst en kan een lid noemen.
  const regels = isVerkenning(benchmark) ? filterRegels(benchmark.filters ?? [], maakFilterNamen(instellingen.korteNamen, organisaties)) : [];

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug identiteitMenu={<MijnGegevensMenu lid={gegevens.lid} />}>
      <div className="container section" style={{ maxWidth: "64rem" }}>
        <span className="eyebrow">Benchmark</span>
        <h1>{kop}</h1>
        {isVerkenning(benchmark) && (
          <div className="vk-opslaan-paneel" style={{ marginTop: "var(--sp-4)", maxWidth: "40rem" }}>
            <strong>{benchmark.naam}</strong>
            <ul className="vk-regels" style={{ marginTop: "var(--sp-2)" }}>
              {regels.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {resultaten.length === 0 ? (
          <p className="mt-4">Er is op dit moment geen vergelijking beschikbaar.</p>
        ) : (
          resultaten.flatMap((r) =>
            r.niveau === "metingen"
              ? r.vergelijkingen.map((v) => <MetingenVergelijkingView key={v.assessment.id} vergelijking={v} beheer={false} />)
              : r.views.map((v) => (
                  <BenchmarkOrganisatieView
                    key={`${r.eigenNaam}-${v.assessment.id}`}
                    view={v}
                    organisatieNaam={r.eigenNaam}
                    peildatum={new Date()}
                    niveau="organisaties"
                  />
                ))
          )
        )}
      </div>
    </PageWithChrome>
  );
}
