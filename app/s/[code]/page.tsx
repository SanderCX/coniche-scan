"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRespondentPerToegangscode, nodigLidUit, useOrganisaties } from "@/lib/db";
import { useBenchmarks, useBenchmarkToewijzingen } from "@/lib/benchmark-store";
import { bouwBenchmarkSecties, viewsVoorLead } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useAssessments } from "@/lib/assessment-store";
import { useAlgemeneTekst } from "@/lib/algemene-teksten-store";
import { voortgang } from "@/lib/scoring";
import { volgendeUrl } from "@/lib/scan-routing";
import { OrganisatieLid, ScanInvulling, ScanInvullingStatus, ScanUitvoering } from "@/lib/types";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";

/**
 * De benchmarkviews die een Admin aan deze Lead heeft toegewezen (`benchmark.md`, Toewijzen aan een Lead; `beheerpagina.md`,
 * punt 6a): Een kaart per toewijzing, alleen als er minstens één sectie te zien is. Een sectie is voor een Lead alleen
 * zichtbaar voor Assessments waarvan hij de Meting mag inzien en waarvan de groep aan de minimale groepsgrootte voldoet.
 * Zonder zichtbare sectie staat er niets, ook geen kaart.
 */
function BenchmarkKaarten({ code, lid }: { code: string; lid: OrganisatieLid }) {
  const toewijzingen = useBenchmarkToewijzingen().filter((t) => t.respondentId === lid.id);
  const benchmarks = useBenchmarks();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();
  if (lid.leadMetingIds.length === 0) return null;
  const kaarten = toewijzingen.flatMap((t) => {
    const benchmark = benchmarks.find((b) => b.id === t.benchmarkId);
    if (!benchmark) return [];
    const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
    const views = viewsVoorLead(secties, t.organisatieId, lid.leadMetingIds, instellingen.benchmarkMinOrganisaties);
    return views.length > 0 ? [{ toewijzing: t, assessmentNamen: views.map((v) => v.assessment.naam) }] : [];
  });
  if (kaarten.length === 0) return null;
  return (
    <>
      <span className="eyebrow mt-10" style={{ display: "block" }}>
        Benchmark
      </span>
      <h2>Jouw organisatie tegenover de groep</h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {kaarten.map(({ toewijzing, assessmentNamen }) => (
          <Link key={toewijzing.id} href={`/s/${code}/benchmark/${toewijzing.id}`} className="card" style={{ display: "block" }}>
            <p className="font-semibold text-ink">Benchmark</p>
            <p className="text-sm text-ink-m mt-1">{assessmentNamen.join(" · ")}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

/**
 * Eén Meting waar de ingelogde Lead toegang toe heeft (beheerpagina.md
 * punt 6a). Los van "Mijn metingen" hierboven: een Lead kan hier staan
 * zonder zelf ooit een vragenlijst te hebben ingevuld. Bevat een compact
 * uitnodigen-formulier (`respondenten.uitnodigen: toegewezen metingen`,
 * datamodel.md deel 2, Rechtenmatrix) en een link naar de resultaten,
 * alleen als er al minstens 1 afgeronde scan is.
 */
function LeadMetingKaart({ code, scanUitvoering }: { code: string; scanUitvoering: ScanUitvoering }) {
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const afgerond = scanUitvoering.invullingen.filter((i) => i.status === "afgerond").length;

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const resultaat = nodigLidUit(scanUitvoering.id, email.trim());
    if (!resultaat) return;
    setMelding(`Uitgenodigd: ${resultaat.lid.email}`);
    setEmail("");
    setTimeout(() => setMelding(null), 2400);
  }

  return (
    <div className="card">
      <p className="font-semibold text-ink">{scanUitvoering.label}</p>
      <p className="text-sm text-ink-m mt-1">
        {scanUitvoering.invullingen.length} respondenten, {afgerond} afgerond
      </p>
      <form onSubmit={handleUitnodigen} className="flex gap-2 mt-3">
        <div className="admin-field flex-1" style={{ marginBottom: 0 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@organisatie.nl"
          />
        </div>
        <button type="submit" className="btn btn-outline btn-compact">
          Uitnodigen
        </button>
      </form>
      {melding && <p className="text-sm text-ink-m mt-2">{melding}</p>}
      {afgerond > 0 && (
        <Link
          href={`/s/${code}/resultaten/${scanUitvoering.id}`}
          className="btn btn-or btn-compact mt-3"
          style={{ display: "inline-block" }}
        >
          Bekijk resultaten
        </Link>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<ScanInvullingStatus, string> = {
  uitgenodigd: "Nog te starten",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

/**
 * Valt een eigen Meting samen met een Meting waar dit lid ook Lead-
 * toegang toe heeft (beheerpagina.md punt 6a, "Valt een eigen Meting
 * samen met een toegewezen Meting"): één kaart, niet twee, met naast
 * elkaar "Bekijk jouw resultaten" (alleen als de eigen invulling
 * afgerond is) en "Bekijk de resultaten van de hele meting".
 */
function EigenEnLeadMetingKaart({
  code,
  scanUitvoering,
  invulling,
  assessmentNaam,
}: {
  code: string;
  scanUitvoering: ScanUitvoering;
  invulling: ScanInvulling;
  assessmentNaam: string;
}) {
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const afgerondInMeting = scanUitvoering.invullingen.filter((i) => i.status === "afgerond").length;

  function handleUitnodigen(e: React.FormEvent) {
    e.preventDefault();
    const resultaat = nodigLidUit(scanUitvoering.id, email.trim());
    if (!resultaat) return;
    setMelding(`Uitgenodigd: ${resultaat.lid.email}`);
    setEmail("");
    setTimeout(() => setMelding(null), 2400);
  }

  return (
    <div className="card">
      <p className="font-semibold text-ink">
        {scanUitvoering.label} — {assessmentNaam}
      </p>
      <p className="text-sm text-ink-m mt-1">
        Je bent zelf respondent én Lead van deze meting ({STATUS_LABEL[invulling.status]}).
      </p>
      <form onSubmit={handleUitnodigen} className="flex gap-2 mt-3">
        <div className="admin-field flex-1" style={{ marginBottom: 0 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@organisatie.nl"
          />
        </div>
        <button type="submit" className="btn btn-outline btn-compact">
          Uitnodigen
        </button>
      </form>
      {melding && <p className="text-sm text-ink-m mt-2">{melding}</p>}
      <div className="flex gap-2 mt-3">
        {invulling.status === "afgerond" ? (
          <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-outline btn-compact">
            Bekijk jouw resultaten
          </Link>
        ) : (
          // Zonder deze link was er hier geen weg naar de eigen invulling
          // zodra ook niemand anders in de meting al afgerond is: beide
          // knoppen hierboven bleven dan onzichtbaar, een doodlopend eind
          // t.o.v. de gewone (niet-samengevoegde) kaart, die altijd naar
          // `volgendeUrl` linkt.
          <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-outline btn-compact">
            {invulling.status === "bezig" ? "Ga verder met de scan" : "Start de intake"}
          </Link>
        )}
        {afgerondInMeting > 0 && (
          <Link href={`/s/${code}/resultaten/${scanUitvoering.id}`} className="btn btn-or btn-compact">
            Bekijk de resultaten van de hele meting
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * De publieke respondent-link (v1-aanpassingen.md punt 2): alleen een
 * toegangscode, geen gegevens. Gaat altijd eerst naar "Mijn metingen"
 * (CLAUDE.md sectie 3, scherm 4), ook bij precies één invulling. De 4
 * vaste links (Visie/Bouwstenen/AI/2030) staan in de nav, niet meer als
 * losse kaarten op de pagina zelf — dit is de hub, dus zonder terugknop.
 */
export default function ToegangscodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const assessments = useAssessments();
  const intro = useAlgemeneTekst("mijnMetingenIntro");

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

  const { lid, invullingen, leadMetingen } = gegevens;

  // beheerpagina.md punt 6a, "Valt een eigen Meting samen met een
  // toegewezen Meting": één kaart in plaats van twee losse. De
  // Lead-toegang-sectie hieronder laat deze Metingen dus weg.
  const samenvallendeIds = new Set(
    leadMetingen.filter((s) => invullingen.some((i) => i.scanUitvoering.id === s.id)).map((s) => s.id)
  );
  const overigeLeadMetingen = leadMetingen.filter((s) => !samenvallendeIds.has(s.id));

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} identiteitMenu={<MijnGegevensMenu lid={lid} />}>
      <div className="container section" style={{ maxWidth: "40rem" }}>
        <span className="eyebrow">Mijn metingen</span>
        <h1>Welkom terug{lid.naam ? `, ${lid.naam}` : ""}</h1>
        <p className="mt-2 text-ink-m">{intro}</p>

        {invullingen.length === 0 ? (
          <p className="mt-4">Je hebt op dit moment geen lopende meting.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {invullingen.map(({ scanUitvoering, invulling }) => {
              const assessment = assessments.find((a) => a.id === scanUitvoering.assessmentId);
              if (samenvallendeIds.has(scanUitvoering.id)) {
                return (
                  <EigenEnLeadMetingKaart
                    key={invulling.id}
                    code={code}
                    scanUitvoering={scanUitvoering}
                    invulling={invulling}
                    assessmentNaam={assessment?.naam ?? "Onbekend type"}
                  />
                );
              }
              const { percentage } = assessment
                ? voortgang(assessment, invulling.antwoorden)
                : { percentage: 0 };
              return (
                <Link
                  key={invulling.id}
                  href={volgendeUrl(invulling.id, invulling.status)}
                  className="card"
                  style={{ display: "block" }}
                >
                  <p className="font-semibold text-ink">
                    {scanUitvoering.label} — {assessment?.naam ?? "Onbekend type"}
                  </p>
                  <p className="text-sm text-ink-m mt-1">
                    {STATUS_LABEL[invulling.status]}
                    {invulling.status !== "afgerond" && ` · ${percentage}%`}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {overigeLeadMetingen.length > 0 && (
          <>
            <span className="eyebrow mt-10" style={{ display: "block" }}>
              Lead-toegang
            </span>
            <h2>Metingen waar je Lead van bent</h2>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {overigeLeadMetingen.map((scanUitvoering) => (
                <LeadMetingKaart key={scanUitvoering.id} code={code} scanUitvoering={scanUitvoering} />
              ))}
            </div>
          </>
        )}

        <BenchmarkKaarten code={code} lid={lid} />
      </div>
    </PageWithChrome>
  );
}
