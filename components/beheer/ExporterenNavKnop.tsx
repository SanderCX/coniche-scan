"use client";

import { useState } from "react";
import { useScanInvulling } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { exporteerScanIndesign, exporteerScanPdf, exporteerScansCsv } from "@/lib/scan-export";
import { DropdownKnop } from "@/components/DropdownKnop";

/**
 * "Exporteren" als scherm-specifieke actie in `.nav-right` op de
 * resultatenpagina in beheer (CLAUDE.md sectie 3, scherm 6, beheerpagina.md
 * "Navigatie in beheer"). Leest zijn eigen data i.p.v. props door te geven
 * via `useBeheerNavActions`, dat zijn inhoud maar één keer registreert.
 */
export function ExporterenNavKnop({ scanInvullingId }: { scanInvullingId: string }) {
  const gegevens = useScanInvulling(scanInvullingId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const [pdfBezig, setPdfBezig] = useState(false);

  if (!gegevens || !assessment) return null;
  const context = { ...gegevens, assessment };

  async function handlePdf() {
    setPdfBezig(true);
    const gelukt = await exporteerScanPdf(context);
    setPdfBezig(false);
    if (!gelukt) window.alert("Het exporteren als PDF is mislukt. Probeer het opnieuw.");
  }

  return (
    <DropdownKnop
      label={pdfBezig ? "Bezig…" : "Exporteren"}
      opties={[
        { label: "Als PDF", onClick: handlePdf, disabled: pdfBezig, title: pdfBezig ? "PDF wordt gemaakt…" : undefined },
        { label: "Als CSV", onClick: () => exporteerScansCsv([context]) },
        { label: "Voor InDesign (XML)", onClick: () => exporteerScanIndesign(context) },
      ]}
    />
  );
}
