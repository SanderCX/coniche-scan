"use client";

import { LEZING_NAAM, lezingVan } from "@/lib/benchmark";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useScanUitvoering } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { isAdmin, magOrganisatieToegang } from "@/lib/rechten";
import { ResultaatKop } from "@/components/Resultaatkop";
import { ResultsView } from "@/components/ResultsView";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { MetingWeergaven } from "@/components/visualisatie/MetingWeergaven";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";
import { matrix } from "@/lib/visualisatie";
import {
  aantalAfgerondInMeting,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isSamengesteld,
  onderdeelVan,
  onderliggendeMetingen,
  STANDAARD_ONDERDEEL,
  oudsteEerst,
  onderdeelEenheden,
  toonMeetdatum,
} from "@/lib/metingen";
import { useBenchmarks } from "@/lib/benchmark-store";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { isSpanning, spanningScansVan } from "@/lib/spanning";
import { SpanningResultaat } from "@/components/spanning/SpanningResultaat";
import { metingAlsResultaat, quickscanMeting, quickscanScansVan } from "@/lib/quickscan-groep";
import { QuickscanResultaten } from "@/components/QuickscanResultaten";
import { kruimelsVoorMeting, VIA_RESULTATEN } from "@/lib/resultaten-nav";

/**
 * Rapportage over één meting: het gemiddelde per vraag over alle
 * afgeronde invullingen van die meting, getoond met dezelfde
 * resultaatcomponent als een individuele scan (backlog.md, "Aggregatie
 * over meerdere respondenten binnen een meting" — hier de eenvoudigste
 * invulling: het gemiddelde, geen spreiding/afwijking).
 */
export default function RapportagePage({
  params,
}: {
  params: Promise<{ scanUitvoeringId: string }>;
}) {
  const { scanUitvoeringId } = use(params);
  const gegevens = useScanUitvoering(scanUitvoeringId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const ingelogd = useIngelogdeGebruiker();
  const via = useSearchParams().get("via") === VIA_RESULTATEN;
  const benchmarks = useBenchmarks();

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Meting niet gevonden.</p>
      </div>
    );
  }

  const { organisatie, scanUitvoering } = gegevens;

  // Bereik "eigen" (datamodel.md deel 2, Rechtenmatrix, resultaten.inzien):
  // een Consultant mag alleen rapportages inzien van organisaties die hij
  // zelf aanmaakte of waaraan een Admin hem toewees.
  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze meting hoort bij een organisatie die niet door
          jou aangemaakt is en ook niet aan jou toegewezen.
        </p>
      </div>
    );
  }
  const samengesteld = isSamengesteld(scanUitvoering);
  const onderliggend = onderliggendeMetingen(organisatie, scanUitvoering);
  // Bij een samengestelde Meting zijn de afgeronde scans die van de onderliggende Metingen.
  const aantalAfgerond = aantalAfgerondInMeting(organisatie, scanUitvoering);

  if (aantalAfgerond === 0) {
    return (
      <div className="admin-main">
        <Kruimelpad
          delen={kruimelsVoorMeting(organisatie, scanUitvoering, via, "Resultaten van de Meting")}
        />
        <span className="eyebrow">{scanUitvoering.label}</span>
        <h1>{assessment.naam}</h1>
        <p className="admin-notice">
          Nog geen afgeronde scans voor {scanUitvoering.label} — {assessment.naam}.
        </p>
      </div>
    );
  }

  // De Digitale Spanningsmeter: Het profiel van de groep, zonder de weergaven van de schaalscans (`visualisatie-spanningsmeter.md`,
  // Resultaat). Een Admin of Consultant ziet de groep altijd; de drempel geldt voor een Lead.
  if (isSpanning(assessment)) {
    return (
      <div className="admin-main admin-main--breed">
        <Kruimelpad delen={kruimelsVoorMeting(organisatie, scanUitvoering, via, "Resultaten van de Meting")} />
        <SpanningResultaat
          assessment={assessment}
          groep={{
            scans: spanningScansVan(scanUitvoering.invullingen),
            subregel: [scanUitvoering.label, organisatie.naam, `Gemiddelde van ${aantalAfgerond} ${aantalAfgerond === 1 ? "afgeronde scan" : "afgeronde scans"}`],
          }}
        />
      </div>
    );
  }

  // Elke onderliggende Meting telt één keer mee (`datamodel.md`, Scoreberekening).
  const gemiddeldeAntwoorden = gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, scanUitvoering);
  // Een Assessment met Ja / Nee / Weet ik niet rekent in punten en procenten (`visualisatie-quickscan.md`, 3 en 4): Het
  // gemiddelde, de spreiding en de antwoorden komen uit `lib/quickscan-groep.ts`. Een samengestelde Meting bestaat er niet voor.
  const quickscanScans = isJaNeeWeetNiet(assessment) ? quickscanScansVan(scanUitvoering.invullingen) : null;
  const quickscanMetingData = quickscanScans ? quickscanMeting(assessment, quickscanScans) : null;
  const quickscan =
    quickscanScans && quickscanMetingData
      ? {
          meting: quickscanMetingData,
          scans: quickscanScans,
          namen: Object.fromEntries(
            scanUitvoering.invullingen.map((i) => {
              const lid = organisatie.leden.find((l) => l.id === i.organisatieLidId);
              return [i.id, lid ? lid.naam || lid.email : "Onbekende respondent"];
            })
          ),
          uitgenodigd: scanUitvoering.invullingen.length,
        }
      : undefined;
  // De knop "Vergelijking" (`benchmark.md`, Niveau 2): Alleen een Admin opent benchmarks. De vergelijking zelf staat in de
  // benchmark. Een Consultant krijgt de knop niet.
  const vergelijkingen = isAdmin(ingelogd)
    ? benchmarks
        .filter((b) => b.niveau === "metingen" && b.leden.some((l) => l.metingId === scanUitvoering.id))
        .map((b) => ({ id: b.id, naam: `${b.naam} (${LEZING_NAAM[lezingVan(b, [organisatie])]})`, href: `/beheer/benchmark/${b.id}` }))
    : undefined;

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={kruimelsVoorMeting(organisatie, scanUitvoering, via, "Resultaten van de Meting")}
      />
      <ResultaatKop
        eyebrow="Resultaat van de Meting"
        titel={assessment.naam}
        subregel={[
          scanUitvoering.label,
          organisatie.naam,
          samengesteld
            ? `Gemiddelde van ${onderliggend.length} ${onderliggend.length === 1 ? "Meting" : "Metingen"}, elk even zwaar`
            : `${aantalAfgerond} ${aantalAfgerond === 1 ? "afgeronde scan" : "afgeronde scans"}`,
        ]}
      />

      <div className="mt-8">
        <MetingWeergaven
          assessment={assessment}
          organisatie={organisatie}
          scanUitvoering={scanUitvoering}
          overzicht={
            quickscanMetingData ? (
              <QuickscanResultaten
                assessment={assessment}
                resultaat={metingAlsResultaat(quickscanMetingData)}
                toonKop={false}
                toonSchakelaar={false}
                toonTellingen={false}
                ondertitel={`Gemiddelde van ${aantalAfgerond} afgeronde ${aantalAfgerond === 1 ? "scan" : "scans"}`}
              />
            ) : (
              <ResultsView assessment={assessment} antwoorden={gemiddeldeAntwoorden} toonKop={false} gemiddeldeVan={aantalAfgerond} />
            )
          }
          quickscan={quickscan}
          spreidingToegestaan={!samengesteld}
          // Bij een samengestelde Meting staat Antwoorden uitgeschakeld in de schakelaar, met een Info-icoon (`visualisatie-scores.md`, I).
          antwoordenToegestaan
          onderdelen={samengesteld ? onderdeelEenheden(assessment, organisatie, scanUitvoering) : undefined}
          bereikAltijd
          vergelijkingen={vergelijkingen}
          toonBenchmarkLink={isAdmin(ingelogd)}
        />
      </div>
      {samengesteld && isAdmin(ingelogd) && (
        // De matrix met de onderliggende Metingen als kolommen, alleen voor de Admin (`visualisatie-scores.md`, E).
        <div className="mt-8">
          <h2>Per bouwblok en per Meting</h2>
          <WeergaveMatrix
            assessment={assessment}
            weergave={matrix(
              assessment,
              // Op meetdatum, de oudste links (`visualisatie-scores.md`, E, Volgorde van de kolommen).
              oudsteEerst(onderliggend).map((m) => ({
                label: onderdeelVan(organisatie, m) === STANDAARD_ONDERDEEL ? m.label : onderdeelVan(organisatie, m),
                sublabel: toonMeetdatum(m.meetdatum),
                volledigeNaam: `${m.label} · ${onderdeelVan(organisatie, m)}`,
                aantalScans: aantalAfgerondInMeting(organisatie, m),
                antwoorden: gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, m),
              })),
              { groepsvergelijking: false }
            )}
          />
        </div>
      )}
    </div>
  );
}
