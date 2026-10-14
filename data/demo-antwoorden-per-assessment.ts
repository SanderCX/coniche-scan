import { demoAntwoorden } from "./demo-antwoorden";
import { demoAntwoordenAiScan } from "./demo-antwoorden-ai-scan";
import { demoAntwoordenZorgscan } from "./demo-antwoorden-zorgscan";
import { demoAntwoordenQuickscan, demoRelevantieQuickscan } from "./demo-antwoorden-quickscan";
import { Antwoord } from "@/lib/types";

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
