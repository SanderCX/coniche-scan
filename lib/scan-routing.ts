import { ScanInvullingStatus } from "./types";

/** Welk scherm bij een scan-invulling hoort, op basis van de status. */
export function volgendeUrl(invullingId: string, status: ScanInvullingStatus): string {
  if (status === "afgerond") return `/scan/${invullingId}/resultaten`;
  if (status === "bezig") return `/scan/${invullingId}/doorloop`;
  return `/scan/${invullingId}/intake`;
}
