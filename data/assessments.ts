import { Assessment } from "@/lib/types";
import { klantcontactVolwassenheid } from "./klantcontact-assessment";
import { aiVolwassenheid } from "./ai-scan-assessment";

export const assessments: Assessment[] = [klantcontactVolwassenheid, aiVolwassenheid];

export function getAssessment(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}
