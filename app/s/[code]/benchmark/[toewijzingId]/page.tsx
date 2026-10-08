"use client";

import { use } from "react";
import { useRespondentPerToegangscode, useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarks, useBenchmarkToewijzingen } from "@/lib/benchmark-store";
import { leadViewVoorToewijzing } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { BenchmarkOrganisatieView } from "@/components/benchmark/BenchmarkOrganisatieView";

/**
 * De benchmarkview van een Lead (`benchmark.md`, Toewijzen aan een Lead): Zijn eigen organisatie naast het gemiddelde van de
 * rest van de groep, per Assessment waarvan hij de Meting mag inzien en waarvan de groep groot genoeg is. Nooit de
 * namen van andere organisaties, en ook niet de naam van de benchmark zelf, want die is vrije tekst van een Admin.
 * Alleen bereikbaar voor de Lead aan wie de view is toegewezen.
 */
export default function LeadBenchmarkPage({ params }: { params: Promise<{ code: string; toewijzingId: string }> }) {
  const { code, toewijzingId } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const toewijzing = useBenchmarkToewijzingen().find((t) => t.id === toewijzingId);
  const benchmark = useBenchmarks().find((b) => b.id === toewijzing?.benchmarkId);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();

  const toegang = gegevens && toewijzing && benchmark && toewijzing.respondentId === gegevens.lid.id && gegevens.lid.leadMetingIds.length > 0;
  if (!gegevens || !toegang) {
    return (
      <PageWithChrome code={code}>
        <div className="container section" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1>Geen toegang</h1>
          <p>Deze benchmark is niet aan jou toegewezen.</p>
        </div>
      </PageWithChrome>
    );
  }

  const resultaat = leadViewVoorToewijzing(toewijzing, benchmark, assessments, organisaties, gegevens.lid.leadMetingIds, {
    minOrganisaties: instellingen.benchmarkMinOrganisaties,
    minMetingen: instellingen.benchmarkMinMetingen,
    minRespondenten: instellingen.benchmarkMinRespondenten,
  });
  const koppen = {
    organisaties: "Jouw organisatie tegenover de groep",
    metingen: "Jouw Meting tegenover de overige Metingen",
    scans: "Een scan tegenover de overige scans",
  } as const;
  const views = resultaat?.views ?? [];

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug identiteitMenu={<MijnGegevensMenu lid={gegevens.lid} />}>
      <div className="container section" style={{ maxWidth: "64rem" }}>
        <span className="eyebrow">Benchmark</span>
        <h1>{koppen[resultaat?.niveau ?? "organisaties"]}</h1>
        {!resultaat || views.length === 0 ? (
          <p className="mt-4">Er is op dit moment geen vergelijking beschikbaar.</p>
        ) : (
          views.map((v) => (
            <BenchmarkOrganisatieView
              key={v.assessment.id}
              view={v}
              organisatieNaam={resultaat.eigenNaam}
              peildatum={new Date()}
              niveau={resultaat.niveau}
            />
          ))
        )}
      </div>
    </PageWithChrome>
  );
}
