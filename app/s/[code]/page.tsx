"use client";

import { use } from "react";
import { useRespondentPerToegangscode, useOrganisaties } from "@/lib/db";
import { useBenchmarks } from "@/lib/benchmark-store";
import { leadViewsVoorBenchmark } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useAssessments } from "@/lib/assessment-store";
import { useAlgemeneTekst } from "@/lib/algemene-teksten-store";
import { nieuwsteEerst } from "@/lib/metingen";
import { sorteerAfgerond, sorteerNogTeDoen, voornaamVan } from "@/lib/mijn-metingen";
import {
  benchmarkGeldigVoorOrganisatie,
  benchmarkIdsMetToegang,
  metingIdsMetWeergave,
  metingenMetToegang,
} from "@/lib/lead-toegang";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import {
  BenchmarkKaart,
  LeadEnRespondentKaart,
  LeadKaart,
  RespondentKaart,
} from "@/components/mijn-metingen/MijnMetingenOnderdelen";

/**
 * De publieke respondent-link (v1-aanpassingen.md punt 2): alleen een toegangscode, geen gegevens. Gaat altijd eerst naar "Mijn
 * metingen" (CLAUDE.md sectie 3, scherm 4), ook bij precies één invulling. De 4 vaste links (Visie/Bouwstenen/AI/2030) staan in
 * de nav. Dit is de hub, dus zonder terugknop. De opmaak staat in `visualisatie-mijn-metingen.md`.
 *
 * Secties per rol: Een respondent heeft Nog te doen en Afgerond. Een Lead heeft Metingen en Vergelijkingen. Een Lead die ook
 * respondent is, ziet een eigen scan die samenvalt met een Meting op zijn pagina als één kaart met twee blokken, en de overige
 * eigen scans als gewone kaarten boven de Metingen. Een Lead ziet alleen wat een Admin voor hem heeft aangevinkt
 * (`beheerpagina.md`, punt 6a).
 */
export default function ToegangscodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const assessments = useAssessments();
  const intro = useAlgemeneTekst("mijnMetingenIntro");
  const benchmarks = useBenchmarks();
  const organisaties = useOrganisaties();
  const instellingen = useInstellingen();

  if (!gegevens) {
    return (
      <PageWithChrome>
        <div className="container section" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1>Ongeldige link</h1>
          <p>Deze link bestaat niet (meer). Neem contact op met Coniche voor een nieuwe link.</p>
        </div>
      </PageWithChrome>
    );
  }

  const { lid, invullingen, organisatie } = gegevens;
  const isLeadLid = lid.lead === true;
  const assessmentVan = (id: string) => assessments.find((a) => a.id === id);
  const leadMetingen = isLeadLid ? nieuwsteEerst(metingenMetToegang(organisatie, lid.id)) : [];

  // beheerpagina.md punt 6a: Valt een eigen Meting samen met een Meting waarvoor de Lead vinkjes heeft, dan één kaart.
  const eigenPerMeting = new Map(invullingen.map((i) => [i.scanUitvoering.id, i.invulling]));
  const samenvallendeIds = new Set(leadMetingen.filter((s) => eigenPerMeting.has(s.id)).map((s) => s.id));
  const losseEigen = invullingen.filter((i) => !samenvallendeIds.has(i.scanUitvoering.id));
  const nogTeDoen = sorteerNogTeDoen(losseEigen);
  const afgerond = sorteerAfgerond(losseEigen);

  // Een kaart per benchmark die aan staat, alleen als er minstens één sectie te zien is (`benchmark.md`, View voor een Lead).
  // Nooit de naam van een ander lid. Het aantal organisaties staat er alleen bij minstens `benchmarkMinOrganisaties`.
  const drempels = {
    minOrganisaties: instellingen.benchmarkMinOrganisaties,
    minRespondenten: instellingen.benchmarkMinRespondenten,
  };
  const resultatenIds = isLeadLid ? metingIdsMetWeergave(organisatie, lid.id, "resultaten") : [];
  const benchmarkKaarten = isLeadLid
    ? benchmarkIdsMetToegang(organisatie, lid.id).flatMap((id) => {
        const benchmark = benchmarks.find((b) => b.id === id);
        if (!benchmark || !benchmarkGeldigVoorOrganisatie(benchmark, organisatie.id)) return [];
        const resultaat = leadViewsVoorBenchmark(benchmark, assessments, organisaties, organisatie, resultatenIds, drempels);
        if (resultaat.length === 0) return [];
        const assessmentNamen = [
          ...new Set(
            resultaat.flatMap((r) =>
              r.niveau === "metingen" ? r.vergelijkingen.map((v) => v.assessment.naam) : r.views.map((v) => v.assessment.naam)
            )
          ),
        ].join(", ");
        const aantalOrganisaties = new Set(benchmark.leden.map((l) => l.organisatieId)).size;
        const regel =
          resultaat[0].niveau === "organisaties"
            ? aantalOrganisaties >= instellingen.benchmarkMinOrganisaties
              ? `Vergelijking van ${aantalOrganisaties} organisaties, ${assessmentNamen}`
              : `Vergelijking, ${assessmentNamen}`
            : `Vergelijking van Metingen, ${assessmentNamen}`;
        return [{ id: benchmark.id, naam: benchmark.naam, regel }];
      })
    : [];

  const heeftEigen = invullingen.length > 0;
  const leeg = !heeftEigen && leadMetingen.length === 0 && benchmarkKaarten.length === 0;
  const leadInvoer = (scanUitvoering: (typeof leadMetingen)[number]) => ({
    code,
    assessment: assessmentVan(scanUitvoering.assessmentId),
    scanUitvoering,
    organisatie,
    lid,
    minRespondenten: instellingen.benchmarkMinRespondenten,
  });
  const voornaam = voornaamVan(lid.naam);

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} identiteitMenu={<MijnGegevensMenu lid={lid} />}>
      <div className="container mm-pagina">
        <span className="eyebrow">Mijn metingen</span>
        <h1>Welkom terug{voornaam ? `, ${voornaam}` : ""}</h1>
        <p className="mm-organisatie">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2 21h20M8 8h2M8 12h2M8 16h2" />
          </svg>
          {organisatie.naam}
        </p>
        <p className="mt-2 text-ink-m" style={{ maxWidth: "46rem" }}>
          {intro}
        </p>

        {leeg && (
          <p className="mm-leeg mt-6">Er staat nog niets voor je klaar. Neem contact op met Coniche als je dit niet verwacht.</p>
        )}

        {nogTeDoen.length > 0 && (
          <>
            <span className="mm-label">Nog te doen, {nogTeDoen.length}</span>
            <div className="mm-grid">
              {nogTeDoen.map(({ scanUitvoering, invulling }) => (
                <RespondentKaart
                  key={invulling.id}
                  assessment={assessmentVan(scanUitvoering.assessmentId)}
                  scanUitvoering={scanUitvoering}
                  invulling={invulling}
                />
              ))}
            </div>
          </>
        )}

        {afgerond.length > 0 && (
          <>
            <span className="mm-label">Afgerond, {afgerond.length}</span>
            <div className="mm-grid">
              {afgerond.map(({ scanUitvoering, invulling }) => (
                <RespondentKaart
                  key={invulling.id}
                  assessment={assessmentVan(scanUitvoering.assessmentId)}
                  scanUitvoering={scanUitvoering}
                  invulling={invulling}
                />
              ))}
            </div>
          </>
        )}

        {leadMetingen.length > 0 && (
          <>
            <span className="mm-label">Metingen, {leadMetingen.length}</span>
            <div className="mm-grid">
              {leadMetingen.map((scanUitvoering) => {
                const eigen = eigenPerMeting.get(scanUitvoering.id);
                return eigen ? (
                  <LeadEnRespondentKaart key={scanUitvoering.id} {...leadInvoer(scanUitvoering)} invulling={eigen} />
                ) : (
                  <LeadKaart key={scanUitvoering.id} {...leadInvoer(scanUitvoering)} />
                );
              })}
            </div>
          </>
        )}

        {benchmarkKaarten.length > 0 && (
          <>
            <span className="mm-label">Vergelijkingen, {benchmarkKaarten.length}</span>
            <div className="mm-grid">
              {benchmarkKaarten.map((k) => (
                <BenchmarkKaart key={k.id} code={code} id={k.id} naam={k.naam} regel={k.regel} />
              ))}
            </div>
          </>
        )}
      </div>
    </PageWithChrome>
  );
}
