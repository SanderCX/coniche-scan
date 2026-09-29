import { demoAntwoorden } from "./demo-antwoorden";
import { demoAntwoordenAiScan } from "./demo-antwoorden-ai-scan";
import { demoAntwoordenZorgscan } from "./demo-antwoorden-zorgscan";

const perAssessment: Record<string, Record<string, number>> = {
  "klantcontact-volwassenheid": demoAntwoorden,
  "ai-volwassenheid": demoAntwoordenAiScan,
  zorgscan: demoAntwoordenZorgscan,
};

export function getDemoAntwoorden(assessmentId: string): Record<string, number> {
  return perAssessment[assessmentId] ?? {};
}

export const demoRespondentNaam = "Voorbeeldrespondent";
