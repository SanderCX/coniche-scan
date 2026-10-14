"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRespondentPerToegangscode, nodigLidUit, useOrganisaties } from "@/lib/db";
import { useBenchmarks } from "@/lib/benchmark-store";
import { leadViewsVoorBenchmark } from "@/lib/benchmark";
import { useInstellingen } from "@/lib/instellingen-store";
import { useAssessments } from "@/lib/assessment-store";
import { useAlgemeneTekst } from "@/lib/algemene-teksten-store";
import { voortgang } from "@/lib/scoring";
import { volgendeUrl } from "@/lib/scan-routing";
import { Organisatie, OrganisatieLid, ScanInvulling, ScanInvullingStatus, ScanUitvoering } from "@/lib/types";
import { aantalAfgerondInMeting, isSamengesteld, onderdeelVan, rondeVan, rondesNieuwsteEerst } from "@/lib/rondes";
import {
  benchmarkGeldigVoorOrganisatie,
  benchmarkIdsMetToegang,
  heeftMetingToegang,
  metingIdsMetWeergave,
  metingenMetToegang,
} from "@/lib/lead-toegang";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";

/**
 * De benchmarks die een Admin voor deze Lead heeft aangevinkt (`benchmark.md`, View voor een Lead; `beheerpagina.md`, punt 6a):
 * Een kaart per benchmark, alleen als er minstens één sectie te zien is (de groep voldoet aan de drempel van zijn niveau, bij
 * niveau 2 met Resultaten van een lid-Meting). Zonder zichtbare sectie staat er niets, ook geen kaart.
 */
function BenchmarkKaarten({ code, organisatie, lid }: { code: string; organisatie: Organisatie; lid: OrganisatieLid }) {
  const benchmarks = useBenchmarks();
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const instellingen = useInstellingen();
  const drempels = {
    minOrganisaties: instellingen.benchmarkMinOrganisaties,
    minMetingen: instellingen.benchmarkMinMetingen,
    minRespondenten: instellingen.benchmarkMinRespondenten,
  };
  const resultatenIds = metingIdsMetWeergave(organisatie, lid.id, "resultaten");
  const kaarten = benchmarkIdsMetToegang(organisatie, lid.id).flatMap((id) => {
    const benchmark = benchmarks.find((b) => b.id === id);
    if (!benchmark || !benchmarkGeldigVoorOrganisatie(benchmark, organisatie.id)) return [];
    const resultaat = leadViewsVoorBenchmark(benchmark, assessments, organisaties, organisatie, resultatenIds, drempels);
    if (resultaat.length === 0) return [];
    // Wat de kaart zegt: Nooit de naam van een ander lid, wel zijn eigen Meting.
    const assessmentNamen = [...new Set(resultaat.flatMap((r) => r.views.map((v) => v.assessment.naam)))].join(" · ");
    const regel =
      resultaat[0].niveau === "metingen"
        ? `${assessmentNamen} · ${resultaat.map((r) => r.metingLabel).join(", ")}`
        : assessmentNamen;
    return [{ id: benchmark.id, regel }];
  });
  if (kaarten.length === 0) return null;
  return (
    <>
      <span className="eyebrow mt-10" style={{ display: "block" }}>
        Benchmark
      </span>
      <h2>Jouw organisatie tegenover de groep</h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {kaarten.map(({ id, regel }) => (
          <Link key={id} href={`/s/${code}/benchmark/${id}`} className="card" style={{ display: "block" }}>
            <p className="font-semibold text-ink">Benchmark</p>
            <p className="text-sm text-ink-m mt-1">{regel}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

/**
 * Eén Meting waarvoor een Admin minstens één weergave voor deze Lead heeft aangevinkt (`beheerpagina.md`, punt 6a). Los van "Mijn
 * metingen" hieronder: Een Lead kan hier staan zonder zelf ooit een vragenlijst te hebben ingevuld. Op de kaart staan alleen de
 * knoppen van de weergaven die aan staan: Resultaten, Spreiding, Antwoorden en Uitnodigen. Exporteren staat op de
 * resultatenpagina zelf. Een weergave die resultaten laat zien, is er pas bij minstens één afgeronde scan.
 */
function LeadMetingKaart({
  code,
  scanUitvoering,
  organisatie,
  lid,
  assessmentNaam,
}: {
  code: string;
  scanUitvoering: ScanUitvoering;
  organisatie: Organisatie;
  lid: OrganisatieLid;
  assessmentNaam: string;
}) {
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  // Een samengestelde Meting heeft geen Respondenten: Er is niets om uit te nodigen en de Lead ziet alleen het gemiddelde.
  const samengesteld = isSamengesteld(scanUitvoering);
  const afgerond = aantalAfgerondInMeting(organisatie, scanUitvoering);
  const aan = (w: "resultaten" | "spreiding" | "antwoorden" | "uitnodigen") =>
    heeftMetingToegang(organisatie, lid.id, w, scanUitvoering.id);
  const basis = `/s/${code}/resultaten/${scanUitvoering.id}`;

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
        {onderdeelVan(scanUitvoering)} <span className="text-ink-s font-normal">— {assessmentNaam}</span>
      </p>
      <p className="text-sm text-ink-m mt-1">
        {samengesteld ? (
          <>
            <span className="admin-badge status-uitgenodigd">Gemiddelde</span> {afgerond} afgeronde scans
          </>
        ) : (
          `${scanUitvoering.invullingen.length} respondenten, ${afgerond} afgerond`
        )}
      </p>
      {aan("uitnodigen") && !samengesteld && (
        <form onSubmit={handleUitnodigen} className="flex gap-2 mt-3">
          <div className="admin-field flex-1" style={{ marginBottom: 0 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@organisatie.nl"
              aria-label="E-mailadres om uit te nodigen"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-compact">
            Uitnodigen
          </button>
        </form>
      )}
      {melding && <p className="text-sm text-ink-m mt-2">{melding}</p>}
      {aan("resultaten") && (
        <div className="flex flex-wrap gap-2 mt-3">
          {afgerond > 0 ? (
            <>
              <Link href={basis} className="btn btn-or btn-compact">
                Resultaten
              </Link>
              {aan("spreiding") && !samengesteld && (
                <Link href={`${basis}?weergave=spreiding`} className="btn btn-outline btn-compact">
                  Spreiding
                </Link>
              )}
              {aan("antwoorden") && !samengesteld && (
                <Link href={`${basis}?weergave=antwoorden`} className="btn btn-outline btn-compact">
                  Antwoorden
                </Link>
              )}
            </>
          ) : (
            <span className="text-sm text-ink-m">Er zijn nog geen afgeronde scans, dus nog geen resultaten.</span>
          )}
        </div>
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
 * Valt een eigen Meting samen met een Meting waarvoor de Lead ook vinkjes heeft (beheerpagina.md punt 6a): Eén kaart, niet
 * twee, met naast elkaar "Bekijk jouw resultaten" (alleen als de eigen invulling afgerond is) of de weg naar de eigen scan, en de
 * weergaven van de hele Meting die aan staan.
 */
function EigenEnLeadMetingKaart({
  code,
  scanUitvoering,
  organisatie,
  lid,
  invulling,
  assessmentNaam,
}: {
  code: string;
  scanUitvoering: ScanUitvoering;
  organisatie: Organisatie;
  lid: OrganisatieLid;
  invulling: ScanInvulling;
  assessmentNaam: string;
}) {
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const afgerondInMeting = scanUitvoering.invullingen.filter((i) => i.status === "afgerond").length;
  const aan = (w: "resultaten" | "spreiding" | "antwoorden" | "uitnodigen") =>
    heeftMetingToegang(organisatie, lid.id, w, scanUitvoering.id);
  const basis = `/s/${code}/resultaten/${scanUitvoering.id}`;

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
      {aan("uitnodigen") && (
        <form onSubmit={handleUitnodigen} className="flex gap-2 mt-3">
          <div className="admin-field flex-1" style={{ marginBottom: 0 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@organisatie.nl"
              aria-label="E-mailadres om uit te nodigen"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-compact">
            Uitnodigen
          </button>
        </form>
      )}
      {melding && <p className="text-sm text-ink-m mt-2">{melding}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        {invulling.status === "afgerond" ? (
          <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-outline btn-compact">
            Bekijk jouw resultaten
          </Link>
        ) : (
          // Zonder deze link was er hier geen weg naar de eigen invulling zodra ook niemand anders in de meting al afgerond is.
          <Link href={volgendeUrl(invulling.id, invulling.status)} className="btn btn-outline btn-compact">
            {invulling.status === "bezig" ? "Ga verder met de scan" : "Start de intake"}
          </Link>
        )}
        {aan("resultaten") && afgerondInMeting > 0 && (
          <>
            <Link href={basis} className="btn btn-or btn-compact">
              Bekijk de resultaten van de hele meting
            </Link>
            {aan("spreiding") && (
              <Link href={`${basis}?weergave=spreiding`} className="btn btn-outline btn-compact">
                Spreiding
              </Link>
            )}
            {aan("antwoorden") && (
              <Link href={`${basis}?weergave=antwoorden`} className="btn btn-outline btn-compact">
                Antwoorden
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * De publieke respondent-link (v1-aanpassingen.md punt 2): alleen een toegangscode, geen gegevens. Gaat altijd eerst naar "Mijn
 * metingen" (CLAUDE.md sectie 3, scherm 4), ook bij precies één invulling. De 4 vaste links (Visie/Bouwstenen/AI/2030) staan in
 * de nav, niet meer als losse kaarten op de pagina zelf. Dit is de hub, dus zonder terugknop.
 *
 * Een Lead ziet alleen wat een Admin voor hem heeft aangevinkt (`beheerpagina.md`, punt 6a): Bovenaan de naam van de
 * organisatie, een kaart per Meting waarvoor minstens één vinkje aan staat (per ronde, de nieuwste bovenaan), een kaart per
 * benchmark die aan staat, en zijn eigen scans als hij ook respondent is. Een Lead die geen respondent is, ziet geen intake,
 * geen vragenlijst en geen lijst met eigen scans. Heeft hij niets aan staan en geen scans, dan staat er een korte melding.
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
  const leadMetingen = isLeadLid ? metingenMetToegang(organisatie, lid.id) : [];
  const assessmentNaam = (id: string) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend type";

  // beheerpagina.md punt 6a: Valt een eigen Meting samen met een Meting waarvoor de Lead vinkjes heeft, dan één kaart in plaats
  // van twee. De groepen hieronder laten die Metingen dus weg.
  const samenvallendeIds = new Set(
    leadMetingen.filter((s) => invullingen.some((i) => i.scanUitvoering.id === s.id)).map((s) => s.id)
  );
  const overigeLeadMetingen = leadMetingen.filter((s) => !samenvallendeIds.has(s.id));

  // De Metingen per ronde, de nieuwste ronde bovenaan, een Meting zonder ronde onderaan.
  const rondes = rondesNieuwsteEerst(organisatie);
  const groepen = [
    ...rondes.map((r) => ({ sleutel: r.id, naam: r.label, metingen: overigeLeadMetingen.filter((m) => m.rondeId === r.id) })),
    {
      sleutel: "__zonder__",
      naam: "",
      metingen: overigeLeadMetingen.filter((m) => !rondeVan(organisatie, m)),
    },
  ].filter((g) => g.metingen.length > 0);

  // Een kaart per benchmark die aan staat: Dezelfde berekening als `BenchmarkKaarten`, alleen om de lege toestand te kennen.
  const resultatenIds = isLeadLid ? metingIdsMetWeergave(organisatie, lid.id, "resultaten") : [];
  const heeftBenchmarkKaart =
    isLeadLid &&
    benchmarkIdsMetToegang(organisatie, lid.id).some((id) => {
      const benchmark = benchmarks.find((b) => b.id === id);
      return (
        !!benchmark &&
        benchmarkGeldigVoorOrganisatie(benchmark, organisatie.id) &&
        leadViewsVoorBenchmark(benchmark, assessments, organisaties, organisatie, resultatenIds, {
          minOrganisaties: instellingen.benchmarkMinOrganisaties,
          minMetingen: instellingen.benchmarkMinMetingen,
          minRespondenten: instellingen.benchmarkMinRespondenten,
        }).length > 0
      );
    });
  const leeg = isLeadLid && invullingen.length === 0 && leadMetingen.length === 0 && !heeftBenchmarkKaart;

  return (
    <PageWithChrome logoHref={`/s/${code}`} code={code} identiteitMenu={<MijnGegevensMenu lid={lid} />}>
      <div className="container section" style={{ maxWidth: "40rem" }}>
        <span className="eyebrow">Mijn metingen</span>
        <h1>Welkom terug{lid.naam ? `, ${lid.naam}` : ""}</h1>
        {isLeadLid && <p className="text-ink-m" style={{ margin: "0.2rem 0 0", fontWeight: 600 }}>{organisatie.naam}</p>}
        <p className="mt-2 text-ink-m">{intro}</p>

        {leeg && (
          <p className="mt-4">Er staat nog niets voor je klaar. Neem contact op met Coniche als je dit niet verwacht.</p>
        )}

        {/* Zijn eigen scans: Alleen als hij respondent is. Een Lead die geen respondent is, ziet hier niets. */}
        {invullingen.length === 0 ? (
          !isLeadLid && <p className="mt-4">Je hebt op dit moment geen lopende meting.</p>
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
                    organisatie={organisatie}
                    lid={lid}
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

        {groepen.length > 0 && (
          <>
            <span className="eyebrow mt-10" style={{ display: "block" }}>
              Wat voor jou klaarstaat
            </span>
            {groepen.map((g) => (
              <div key={g.sleutel}>
                {g.naam && <h2 style={{ marginTop: "1.2rem" }}>{g.naam}</h2>}
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {g.metingen.map((scanUitvoering) => (
                    <LeadMetingKaart
                      key={scanUitvoering.id}
                      code={code}
                      scanUitvoering={scanUitvoering}
                      organisatie={organisatie}
                      lid={lid}
                      assessmentNaam={assessmentNaam(scanUitvoering.assessmentId)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {isLeadLid && <BenchmarkKaarten code={code} organisatie={organisatie} lid={lid} />}
      </div>
    </PageWithChrome>
  );
}
