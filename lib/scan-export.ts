import {
  CsvRijContext,
  csvBestandsnaamBulk,
  csvBestandsnaamEnkel,
  downloadTekstBestand,
  genereerScansCsv,
} from "./csv-export";
import { pdfBestandsnaam } from "./pdf/bestandsnaam";
import type { ExportPdfPayload } from "./pdf/build-html";
import { buildIndesignExport } from "./indesign/build-xml";
import { downloadIndesignExport } from "./indesign/export";

/** CSV van één of meer scans binnen één organisatie (export-csv.md). */
export function exporteerScansCsv(rijen: CsvRijContext[]): void {
  if (rijen.length === 0) return;
  const csv = genereerScansCsv(rijen);
  const bestandsnaam = rijen.length === 1 ? csvBestandsnaamEnkel(rijen[0]) : csvBestandsnaamBulk();
  downloadTekstBestand(csv, bestandsnaam, "text/csv;charset=utf-8");
}

/** Vraagt de PDF aan bij de server en laat de browser hem downloaden; `false` bij een mislukte export, de aanroeper meldt dat. */
export async function downloadPdf(payload: ExportPdfPayload): Promise<boolean> {
  try {
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return false;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdfBestandsnaam(payload.assessment, payload.organisatieNaam);
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

/** PDF van precies één scan. */
export function exporteerScanPdf({ organisatie, lid, invulling, assessment }: CsvRijContext): Promise<boolean> {
  return downloadPdf({
    assessment,
    antwoorden: invulling.antwoorden,
    opmerkingenPerBouwblok: invulling.opmerkingenPerBouwblok,
    organisatieNaam: organisatie.naam,
    respondentNaam: lid.naam ?? lid.email,
    afgerondOp: invulling.afgerondOp,
  });
}

/** InDesign-export (XML + charts) van precies één scan. */
export function exporteerScanIndesign({ organisatie, scanUitvoering, lid, invulling, assessment }: CsvRijContext): void {
  const resultaat = buildIndesignExport({
    assessment,
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
