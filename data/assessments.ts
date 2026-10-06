import { Assessment } from "@/lib/types";
import { klantcontactVolwassenheid } from "./klantcontact-assessment";
import { aiVolwassenheid } from "./ai-scan-assessment";
import { zorgscan } from "./zorgscan-assessment";
import { verrijkAssessment } from "@/lib/assessment-migratie";

export const assessments: Assessment[] = [klantcontactVolwassenheid, aiVolwassenheid, zorgscan].map(verrijkAssessment);

export function getAssessment(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}
