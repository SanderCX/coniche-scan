"use client";

import { LEZING_NAAM, lezingVan } from "@/lib/benchmark";
import { use, useState } from "react";
import { useRespondentPerToegangscode } from "@/lib/db";
import { heeftMetingToegang, metingIdsMetWeergave } from "@/lib/lead-toegang";
import { useAssessment } from "@/lib/assessment-store";
import { ResultsView } from "@/components/ResultsView";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { DropdownKnop } from "@/components/DropdownKnop";
import { downloadPdf } from "@/lib/scan-export";
import { MetingWeergaven } from "@/components/visualisatie/MetingWeergaven";
import {
  aantalAfgerondInMeting,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isSamengesteld,
} from "@/lib/metingen";
import { useBenchmarks } from "@/lib/benchmark-store";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { metingAlsResultaat, quickscanMeting, quickscanScansVan } from "@/lib/quickscan-groep";
import { QuickscanResultaten } from "@/components/QuickscanResultaten";
import { benchmarkGeldigVoorOrganisatie, heeftBenchmarkToegang } from "@/lib/lead-toegang";

/**
 * Resultaten van één Meting, voor een Lead die het vinkje Resultaten voor deze Meting heeft (beheerpagina.md punt 6a,
 * "Wat de persoonlijke link laat zien"). Zelfde gemiddelde-berekening en resultaatcomponent als de beheer-Rapportage
 * (`/beheer/rapportage/[scanUitvoeringId]`), maar bereikbaar via de persoonlijke link in plaats van een beheerlogin. Spreiding en
 * Antwoorden zijn er alleen met hun eigen vinkje, en Exporteren alleen met het vinkje Exporteren.
 *
 * Beveiliging: Toont alleen iets als een Admin Resultaten van deze Meting voor déze Lead heeft aangevinkt (gekoppeld aan deze
 * toegangscode). Geen toegang tot willekeurige Metingen van de organisatie en niets dat erft van een andere Meting.
 */
export default function LeadResultatenPage({
  params,
}: {
  params: Promise<{ code: string; scanUitvoeringId: string }>;
}) {
  const { code, scanUitvoeringId } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const resultatenIds = gegevens ? metingIdsMetWeergave(gegevens.organisatie, gegevens.lid.id, "resultaten") : [];
  const scanUitvoering =
    gegevens?.lid.lead === true ? gegevens.leadMetingen.find((s) => s.id === scanUitvoeringId && resultatenIds.includes(s.id)) : undefined;
  const assessment = useAssessment(scanUitvoering?.assessmentId ?? "");
  const [pdfBezig, setPdfBezig] = useState(false);
  const benchmarks = useBenchmarks();

  if (!gegevens || !scanUitvoering || !assessment) {
    return (
      <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug>
        <div className="container section" style={{ maxWidth: "40rem" }}>
          <h1>Geen toegang</h1>
          <p>Deze meting bestaat niet (meer), of de resultaten ervan staan niet voor jou klaar.</p>
        </div>
      </PageWithChrome>
    );
  }

  // Bij een samengestelde Meting ziet de Lead alleen het gemiddelde, niet de onderliggende Metingen (`benchmark.md`).
  const samengesteld = isSamengesteld(scanUitvoering);
  const magExporteren = heeftMetingToegang(gegevens.organisatie, gegevens.lid.id, "exporteren", scanUitvoering.id);
  const magSpreiding = !samengesteld && heeftMetingToegang(gegevens.organisatie, gegevens.lid.id, "spreiding", scanUitvoering.id);
  const magAntwoorden = !samengesteld && heeftMetingToegang(gegevens.organisatie, gegevens.lid.id, "antwoorden", scanUitvoering.id);
  const aantalAfgerond = aantalAfgerondInMeting(gegevens.organisatie, scanUitvoering);
  const afgerond = { length: aantalAfgerond };

  if (afgerond.length === 0) {
    return (
      <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug>
        <div className="container section" style={{ maxWidth: "40rem" }}>
          <span className="eyebrow">{scanUitvoering.label}</span>
          <h1>Nog geen resultaten</h1>
          <p>Nog geen afgeronde scans voor {scanUitvoering.label} — {assessment.naam}.</p>
        </div>
      </PageWithChrome>
    );
  }

  const gemiddeldeAntwoorden = gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, gegevens.organisatie, scanUitvoering);
  // Een Assessment met Ja / Nee / Weet ik niet rekent in punten en procenten (`visualisatie-quickscan.md`, 3 en 4).
  const quickscanScans = isJaNeeWeetNiet(assessment) ? quickscanScansVan(scanUitvoering.invullingen) : null;
  const quickscanData = quickscanScans ? quickscanMeting(assessment, quickscanScans) : null;
  const quickscan =
    quickscanScans && quickscanData
      ? {
          meting: quickscanData,
          scans: quickscanScans,
          namen: Object.fromEntries(
            scanUitvoering.invullingen.map((i) => {
              const lid = gegevens.organisatie.leden.find((l) => l.id === i.organisatieLidId);
              return [i.id, lid ? lid.naam || lid.email : ""];
            })
          ),
          uitgenodigd: scanUitvoering.invullingen.length,
        }
      : undefined;
  // De knop "Vergelijking" (`benchmark.md`, Niveau 2): De benchmarks binnen een organisatie waarvan deze Meting lid is, met het
  // vinkje voor de Lead en Resultaten op minstens twee van de leden. De vergelijking zelf staat op zijn benchmarkpagina.
  const vergelijkingen = benchmarks
    .filter(
      (b) =>
        b.niveau === "metingen" &&
        b.leden.some((l) => l.metingId === scanUitvoering.id) &&
        benchmarkGeldigVoorOrganisatie(b, gegevens.organisatie.id) &&
        heeftBenchmarkToegang(gegevens.organisatie, gegevens.lid.id, b.id) &&
        b.leden.filter((l) => resultatenIds.includes(l.metingId)).length >= 2
    )
    .map((b) => ({
      id: b.id,
      // De naam van de benchmark is vrije tekst van een Admin: Een Lead ziet alleen de lezing.
      naam: `Vergelijking (${LEZING_NAAM[lezingVan(b, [gegevens.organisatie])]})`,
      href: `/s/${code}/benchmark/${b.id}`,
    }));

  // export.uitvoeren voor een Lead (datamodel.md deel 2, Rechtenmatrix): Alleen met het vinkje Exporteren voor deze Meting.
  // Mag exporteren wat hij hier al ziet, dus het gemiddelde van deze Meting
  // — geen losse respondent, dus geen CSV/InDesign (die verwachten één
  // ingevulde scan van één respondent). PDF leent zich wel voor een
  // gemiddelde: zelfde payload-vorm als een individuele scan, met een
  // omschrijvende naam in plaats van een respondentnaam.
  async function handleExportPdf() {
    setPdfBezig(true);
    const gelukt = await downloadPdf({
      assessment: assessment!,
      antwoorden: gemiddeldeAntwoorden,
      opmerkingenPerBouwblok: {},
      organisatieNaam: gegevens!.organisatie.naam,
      respondentNaam: `Gemiddelde van ${afgerond.length} ${afgerond.length === 1 ? "respondent" : "respondenten"}`,
      afgerondOp: new Date().toISOString(),
    });
    setPdfBezig(false);
    if (!gelukt) window.alert("Het exporteren als PDF is mislukt. Probeer het opnieuw.");
  }

  return (
    <PageWithChrome
      logoHref={`/s/${code}`}
      code={code}
      toonTerug
      navRight={
        // De export kent de 1–5-schaal: Voor een Assessment met Ja / Nee / Weet ik niet is er nog geen export.
        magExporteren && !quickscanData ? (
          <DropdownKnop
            label={pdfBezig ? "Bezig…" : "Exporteren"}
            opties={[
              {
                label: "Als PDF",
                onClick: handleExportPdf,
                disabled: pdfBezig,
                title: pdfBezig ? "PDF wordt gemaakt…" : undefined,
              },
            ]}
          />
        ) : undefined
      }
      identiteitMenu={<MijnGegevensMenu lid={gegevens.lid} />}
    >
      <div className="container section" style={{ maxWidth: "64rem" }}>
        <span className="eyebrow">{scanUitvoering.label}</span>
        <h1>{assessment.naam}</h1>
        <p className="text-sm text-ink-m">
          {samengesteld
            ? "Gemiddelde van de onderdelen, elk even zwaar"
            : `Gemiddelde over ${afgerond.length} ${afgerond.length === 1 ? "afgeronde respondent" : "afgeronde respondenten"}`}
        </p>
        <div className="mt-8">
          <MetingWeergaven
            assessment={assessment}
            organisatie={gegevens.organisatie}
            scanUitvoering={scanUitvoering}
            overzicht={
              quickscanData ? (
                <QuickscanResultaten
                  assessment={assessment}
                  resultaat={metingAlsResultaat(quickscanData)}
                  toonKop={false}
                  toonSchakelaar={false}
                  toonTellingen={false}
                  ondertitel={`Gemiddelde van ${afgerond.length} afgeronde ${afgerond.length === 1 ? "scan" : "scans"}`}
                />
              ) : (
                <ResultsView assessment={assessment} antwoorden={gemiddeldeAntwoorden} toonKop={false} />
              )
            }
            quickscan={quickscan}
            spreidingToegestaan={magSpreiding}
            antwoordenToegestaan={magAntwoorden}
            antwoordenAnoniem={gegevens.organisatie.antwoordenMetNamen !== true}
            bereikAltijd={false}
            vergelijkingen={vergelijkingen}
            toonBenchmarkLink={false}
          />
        </div>
      </div>
    </PageWithChrome>
  );
}
