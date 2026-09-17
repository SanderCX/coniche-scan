import { demoAntwoorden } from "./demo-antwoorden";
import { demoAntwoordenAiScan } from "./demo-antwoorden-ai-scan";

const perAssessment: Record<string, Record<string, number>> = {
  "klantcontact-volwassenheid": demoAntwoorden,
  "ai-volwassenheid": demoAntwoordenAiScan,
};

export function getDemoAntwoorden(assessmentId: string): Record<string, number> {
  return perAssessment[assessmentId] ?? {};
}

export const demoRespondentNaam = "Voorbeeldrespondent";
