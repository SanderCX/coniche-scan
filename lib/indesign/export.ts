import { zipSync, strToU8 } from "fflate";
import { IndesignExportResultaat } from "./build-xml";

/** Bouwt de ZIP client-side (fflate, geen server nodig) en triggert de download. */
export function downloadIndesignExport(resultaat: IndesignExportResultaat): void {
  const bestanden: Record<string, Uint8Array> = {};
  for (const [pad, inhoud] of Object.entries(resultaat.bestanden)) {
    bestanden[pad] = strToU8(inhoud);
  }
  const zip = zipSync(bestanden, { level: 6 });
  const blob = new Blob([zip.slice()], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = resultaat.bestandsnaam;
  link.click();
  URL.revokeObjectURL(url);
}
