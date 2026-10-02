"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScanInvulling } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { ResultsView } from "@/components/ResultsView";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenu } from "@/components/MijnGegevensMenu";
import { DropdownKnop } from "@/components/DropdownKnop";
import { pdfBestandsnaam } from "@/lib/pdf/bestandsnaam";
import type { ExportPdfPayload } from "@/lib/pdf/build-html";
import { csvBestandsnaamEnkel, downloadTekstBestand, genereerScansCsv } from "@/lib/csv-export";
import { buildIndesignExport } from "@/lib/indesign/build-xml";
import { downloadIndesignExport } from "@/lib/indesign/export";

export default function ResultatenPage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useScanInvulling(respondentId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const router = useRouter();
  const [pdfBezig, setPdfBezig] = useState(false);

  useEffect(() => {
    if (!gegevens) return;
    if (gegevens.invulling.status === "uitgenodigd") {
      router.replace(`/scan/${respondentId}/intake`);
    } else if (gegevens.invulling.status === "bezig") {
      router.replace(`/scan/${respondentId}/doorloop`);
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens || !assessment) {
    return (
      <PageWithChrome>
        <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
      </PageWithChrome>
    );
  }

  if (gegevens.invulling.status !== "afgerond") {
    return null;
  }

  const { organisatie, scanUitvoering, lid, invulling } = gegevens;

  function handleExportCsv() {
    const csv = genereerScansCsv([{ organisatie, scanUitvoering, lid, invulling, assessment: assessment! }]);
    downloadTekstBestand(csv, csvBestandsnaamEnkel({ organisatie, scanUitvoering, lid, invulling, assessment: assessment! }), "text/csv;charset=utf-8");
  }

  function handleExportIndesign() {
    const resultaat = buildIndesignExport({
      assessment: assessment!,
      antwoorden: invulling.antwoorden,
      organisatieNaam: organisatie.naam,
      organisatieKenmerken: organisatie.kenmerken,
      respondentNaam: lid.naam ?? lid.email,
      respondentFunctie: lid.functie,
      respondentTeam: lid.team,
      metingLabel: scanUitvoering.label,
      afgerondOp: invulling.afgerondOp,
    });
    downloadIndesignExport(resultaat);
  }

  async function handleExportPdf() {
    setPdfBezig(true);
    try {
      const payload: ExportPdfPayload = {
        assessment: assessment!,
        antwoorden: invulling.antwoorden,
        opmerkingenPerBouwblok: invulling.opmerkingenPerBouwblok,
        organisatieNaam: organisatie.naam,
        respondentNaam: lid.naam ?? lid.email,
        afgerondOp: invulling.afgerondOp,
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
      link.download = pdfBestandsnaam(assessment!, organisatie.naam);
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
      logoHref={`/s/${lid.toegangscode}`}
      code={lid.toegangscode}
      toonTerug
      navRight={
        <>
          <Link href={`/scan/${respondentId}/doorloop`}>← Terug naar de scan</Link>
          <DropdownKnop
            label={pdfBezig ? "Bezig…" : "Exporteren"}
            opties={[
              {
                label: "Als PDF",
                onClick: handleExportPdf,
                disabled: pdfBezig,
                title: pdfBezig ? "PDF wordt gemaakt…" : undefined,
              },
              { label: "Als CSV", onClick: handleExportCsv },
              { label: "Voor InDesign (XML)", onClick: handleExportIndesign },
            ]}
          />
        </>
      }
      identiteitMenu={<MijnGegevensMenu lid={lid} />}
    >
      <div className="container section">
        <ResultsView
          assessment={assessment}
          antwoorden={invulling.antwoorden}
          respondentNaam={lid.naam}
          bouwblokHref={(bouwblokId) => `/scan/${respondentId}/doorloop?bouwblok=${bouwblokId}`}
        />
      </div>
    </PageWithChrome>
  );
}
