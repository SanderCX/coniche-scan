import type { Organisatie } from "./types";

/**
 * "Klantcontact management & support" was een los getal en is een groep met het veld "Aantal FTE", net als IT DevOps
 * (`datamodel.md`, FTE): Een bestaande waarde `28` wordt `{ aantal: 28 }`. Een waarde die al een groep is, blijft staan.
 */
export function migreerFteManagementSupport(kenmerken: Organisatie["kenmerken"]): Organisatie["kenmerken"] {
  const fte = kenmerken.fte;
  if (!fte || typeof fte !== "object") return kenmerken;
  const waarde = (fte as Record<string, unknown>)["fte-management-support"];
  if (waarde === undefined || (typeof waarde === "object" && waarde !== null)) return kenmerken;
  return { ...kenmerken, fte: { ...fte, "fte-management-support": { aantal: waarde } } };
}
