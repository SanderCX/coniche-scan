import { Assessment } from "@/lib/types";
import { klantcontactVolwassenheid } from "./klantcontact-assessment";

export const assessments: Assessment[] = [klantcontactVolwassenheid];

export function getAssessment(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}
