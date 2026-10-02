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
import { exporteerScanIndesign, exporteerScanPdf, exporteerScansCsv } from "@/lib/scan-export";

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

  const context = { organisatie, scanUitvoering, lid, invulling, assessment };

  async function handleExportPdf() {
    setPdfBezig(true);
    const gelukt = await exporteerScanPdf(context);
    setPdfBezig(false);
    if (!gelukt) window.alert("Het exporteren als PDF is mislukt. Probeer het opnieuw.");
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
              { label: "Als CSV", onClick: () => exporteerScansCsv([context]) },
              { label: "Voor InDesign (XML)", onClick: () => exporteerScanIndesign(context) },
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
