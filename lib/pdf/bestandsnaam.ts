import { Assessment } from "@/lib/types";

/**
 * Bestandsnaam van de PDF-export: "{bedrijfsnaam} {kortLabel} Report", dus
 * per scan-type een eigen naam (bijv. "<Organisatie> Volwassenheidsscan Report.pdf"
 * en "<Organisatie> AI-scan Report.pdf"). Valt terug op de volledige assessment-naam
 * als een (oud opgeslagen) assessment nog geen kortLabel heeft.
 */
export function pdfBestandsnaam(
  assessment: Pick<Assessment, "kortLabel" | "naam">,
  organisatieNaam: string
): string {
  const naam = `${organisatieNaam} ${assessment.kortLabel ?? assessment.naam} Report`;
  return `${naam.replace(/[^\p{L}\p{N} ._-]/gu, "")}.pdf`;
}
