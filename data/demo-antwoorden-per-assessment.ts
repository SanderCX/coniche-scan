import { demoAntwoorden } from "./demo-antwoorden";
import { demoAntwoordenAiScan } from "./demo-antwoorden-ai-scan";
import { demoAntwoordenZorgscan } from "./demo-antwoorden-zorgscan";
import { demoAntwoordenQuickscan, demoRelevantieQuickscan } from "./demo-antwoorden-quickscan";
import { Antwoord, ScanInvulling } from "@/lib/types";

const perAssessment: Record<string, Record<string, Antwoord>> = {
  "klantcontact-volwassenheid": demoAntwoorden,
  "ai-volwassenheid": demoAntwoordenAiScan,
  zorgscan: demoAntwoordenZorgscan,
  "quickscan-ziekenhuis": demoAntwoordenQuickscan,
};

export function getDemoAntwoorden(assessmentId: string): Record<string, Antwoord> {
  return perAssessment[assessmentId] ?? {};
}

/** Welke afdelingen van toepassing zijn in de demo: Alleen bij een Assessment met optionele categorieën. */
export function getDemoRelevantie(assessmentId: string): Record<string, boolean> | undefined {
  return assessmentId === "quickscan-ziekenhuis" ? demoRelevantieQuickscan : undefined;
}

export const demoRespondentNaam = "Voorbeeldrespondent";

/**
 * Demo-scans van één Meting voor de voorbeeld-output: Zes respondenten die afwijken van de vaste demo-antwoorden, zodat het
 * gemiddelde en de afwijking daarop (de lijn van laagste tot hoogste score per bouwblok) te zien zijn. Het gemiddelde ligt vlak bij
 * de demo-antwoorden. Voor de Klantcontact Volwassenheidsscan, de AI-volwassenheidsscan en de Zorgscan, anders `null`.
 */
const AFWIJKINGEN: number[][] = [
  [0, 1, -1, 0, 1, 0, -1, 1],
  [1, 0, 0, -1, 0, 1, 1, -1],
  [-1, 0, 1, 0, -1, 0, 0, 1],
  [0, -1, 0, 1, 0, -1, 1, 0],
  [1, 1, 0, 0, -1, 0, -1, 0],
  [0, 0, -1, -1, 0, 1, 0, 1],
];

/** De Assessments met een demo van een Meting, en de vaste demo-antwoorden waar de respondenten van afwijken. */
const metingBasis: Record<string, Record<string, number>> = {
  "klantcontact-volwassenheid": demoAntwoorden,
  "ai-volwassenheid": demoAntwoordenAiScan,
  zorgscan: demoAntwoordenZorgscan,
};

export function getDemoMetingScans(assessmentId: string): ScanInvulling[] | null {
  const basis = metingBasis[assessmentId];
  if (!basis) return null;
  const vraagIds = Object.keys(basis);
  return AFWIJKINGEN.map((afwijking, r) => ({
    id: `demo-scan-${r + 1}`,
    scanUitvoeringId: "demo-meting",
    organisatieLidId: `demo-lid-${r + 1}`,
    status: "afgerond" as const,
    aangemaaktOp: "2026-01-01T00:00:00.000Z",
    uitgenodigdOp: "2026-01-01T00:00:00.000Z",
    gestartOp: "2026-01-01T00:00:00.000Z",
    afgerondOp: "2026-01-02T00:00:00.000Z",
    antwoorden: Object.fromEntries(
      vraagIds.map((id, i) => [id, Math.min(5, Math.max(1, basis[id] + afwijking[(i + r) % afwijking.length]))])
    ),
    opmerkingenPerBouwblok: {},
    bewaarVerlengdTot: null,
  }));
}
