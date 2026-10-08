"use client";

import { use } from "react";
import { useRespondentPerToegangscode, useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useBenchmarks, useBenchmarkToewijzingen } from "@/lib/benchmark-store";
import { bouwBenchmarkSecties, viewsVoorLead } from "@/lib/benchmark";
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

  const organisatie = organisaties.find((o) => o.id === toewijzing.organisatieId);
  const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
  const views = viewsVoorLead(secties, toewijzing.organisatieId, gegevens.lid.leadMetingIds, instellingen.benchmarkMinOrganisaties);

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug identiteitMenu={<MijnGegevensMenu lid={gegevens.lid} />}>
      <div className="container section" style={{ maxWidth: "64rem" }}>
        <span className="eyebrow">Benchmark</span>
        <h1>Jouw organisatie tegenover de groep</h1>
        {views.length === 0 || !organisatie ? (
          <p className="mt-4">Er is op dit moment geen vergelijking beschikbaar.</p>
        ) : (
          views.map((v) => (
            <BenchmarkOrganisatieView key={v.assessment.id} view={v} organisatieNaam={organisatie.naam} peildatum={new Date()} />
          ))
        )}
      </div>
    </PageWithChrome>
  );
}
