"use client";

import { use, useState } from "react";
import { useRespondentPerToegangscode } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { gemiddeldeAntwoordenVoorMeting } from "@/lib/scoring";
import { ResultsView } from "@/components/ResultsView";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { DropdownKnop } from "@/components/DropdownKnop";
import { pdfBestandsnaam } from "@/lib/pdf/bestandsnaam";
import type { ExportPdfPayload } from "@/lib/pdf/build-html";

/**
 * Resultaten van één Meting, voor een Lead die er Lead-toegang toe heeft
 * (beheerpagina.md punt 6a, "Wat de persoonlijke link laat zien"). Zelfde
 * gemiddelde-berekening en resultaatcomponent als de beheer-Rapportage
 * (`/beheer/rapportage/[scanUitvoeringId]`), maar bereikbaar via de
 * persoonlijke link in plaats van een beheerlogin.
 *
 * Beveiliging: toont alleen iets als `lid.leadMetingIds` (gekoppeld aan
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

  const afgerond = scanUitvoering.invullingen.filter((i) => i.status === "afgerond");

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

  const gemiddeldeAntwoorden = gemiddeldeAntwoordenVoorMeting(assessment, scanUitvoering.invullingen);

  // export.uitvoeren voor een Lead (datamodel.md deel 2, Rechtenmatrix):
  // mag exporteren wat hij hier al ziet, dus het gemiddelde van deze Meting
  // — geen losse respondent, dus geen CSV/InDesign (die verwachten één
  // ingevulde scan van één respondent). PDF leent zich wel voor een
  // gemiddelde: zelfde payload-vorm als een individuele scan, met een
  // omschrijvende naam in plaats van een respondentnaam.
  async function handleExportPdf() {
    setPdfBezig(true);
    try {
      const payload: ExportPdfPayload = {
        assessment: assessment!,
        antwoorden: gemiddeldeAntwoorden,
        opmerkingenPerBouwblok: {},
        organisatieNaam: gegevens!.organisatie.naam,
        respondentNaam: `Gemiddelde van ${afgerond.length} ${afgerond.length === 1 ? "respondent" : "respondenten"}`,
        afgerondOp: new Date().toISOString(),
      };
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("export mislukt");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfBestandsnaam(assessment!, gegevens!.organisatie.naam);
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Het exporteren als PDF is mislukt. Probeer het opnieuw.");
    } finally {
      setPdfBezig(false);
    }
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
        <span className="eyebrow">{scanUitvoering.label}</span>
        <h1>{assessment.naam}</h1>
        <p className="text-sm text-ink-m">
          Gemiddelde over {afgerond.length}{" "}
          {afgerond.length === 1 ? "afgeronde respondent" : "afgeronde respondenten"}
        </p>
        <div className="mt-8">
          <ResultsView assessment={assessment} antwoorden={gemiddeldeAntwoorden} />
        </div>
      </div>
    </PageWithChrome>
  );
}
