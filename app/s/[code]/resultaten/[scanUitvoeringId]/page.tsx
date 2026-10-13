"use client";

import { use, useState } from "react";
import { useRespondentPerToegangscode } from "@/lib/db";
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
  vergelijkbareMetingen,
} from "@/lib/rondes";
import { VergelijkingEyebrow } from "@/components/visualisatie/VergelijkingEyebrow";

/**
 * Resultaten van één Meting, voor een Lead die er Lead-toegang toe heeft
 * (beheerpagina.md punt 6a, "Wat de persoonlijke link laat zien"). Zelfde
 * gemiddelde-berekening en resultaatcomponent als de beheer-Rapportage
 * (`/beheer/rapportage/[scanUitvoeringId]`), maar bereikbaar via de
 * persoonlijke link in plaats van een beheerlogin.
 *
 * Beveiliging: toont alleen iets als het bereik van de Lead (`leadMetingIdsVan`, gekoppeld aan
 * déze toegangscode) deze scanUitvoeringId bevat — geen toegang tot
 * willekeurige metingen van de organisatie, alleen de toegewezen.
 */
export default function LeadResultatenPage({
  params,
}: {
  params: Promise<{ code: string; scanUitvoeringId: string }>;
}) {
  const { code, scanUitvoeringId } = use(params);
  const gegevens = useRespondentPerToegangscode(code);
  const scanUitvoering = gegevens?.leadMetingen.find((s) => s.id === scanUitvoeringId);
  const assessment = useAssessment(scanUitvoering?.assessmentId ?? "");
  const [pdfBezig, setPdfBezig] = useState(false);

  if (!gegevens || !scanUitvoering || !assessment) {
    return (
      <PageWithChrome logoHref={`/s/${code}`} code={code} toonTerug>
        <div className="container section" style={{ maxWidth: "40rem" }}>
          <h1>Geen toegang</h1>
          <p>Deze meting bestaat niet (meer), of je hebt er geen Lead-toegang toe.</p>
        </div>
      </PageWithChrome>
    );
  }

  // Bij een samengestelde Meting ziet de Lead alleen het gemiddelde, niet de onderliggende Metingen (`benchmark.md`).
  const samengesteld = isSamengesteld(scanUitvoering);
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
  // Alleen een eerdere Meting waarop de Lead ook bereik heeft (`visualisatie-scores.md`, C).
  const toegestaneIds = gegevens.leadMetingen.map((m) => m.id);
  const eerdereMetingen = vergelijkbareMetingen(gegevens.organisatie, scanUitvoering)
    .map((v) => v.meting)
    .filter((m) => toegestaneIds.includes(m.id));

  // export.uitvoeren voor een Lead (datamodel.md deel 2, Rechtenmatrix):
  // mag exporteren wat hij hier al ziet, dus het gemiddelde van deze Meting
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
      }
      identiteitMenu={<MijnGegevensMenu lid={gegevens.lid} />}
    >
      <div className="container section" style={{ maxWidth: "64rem" }}>
        <VergelijkingEyebrow label={scanUitvoering.label} eerdereMetingen={eerdereMetingen} />
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
            overzicht={<ResultsView assessment={assessment} antwoorden={gemiddeldeAntwoorden} toonKop={false} />}
            spreidingToegestaan={false}
            bereikAltijd={false}
            toonBenchmarkLink={false}
            toegestaneMetingIds={toegestaneIds}
          />
        </div>
      </div>
    </PageWithChrome>
  );
}
