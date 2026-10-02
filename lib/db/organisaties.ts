import { Organisatie } from "../types";
import { nieuwId } from "../id";
import { laadAlles, slaAlles, useOrganisaties } from "./store";

/** Organisaties: aanmaken, bijwerken, verwijderen en overzetten naar een andere eigenaar. */

export function useOrganisatie(id: string): Organisatie | undefined {
  return useOrganisaties().find((o) => o.id === id);
}

export function maakOrganisatie(input: {
  naam: string;
  kenmerken: Record<string, unknown>;
  /** `Gebruiker.id` van de Consultant/Admin die aanmaakt — bepaalt het bereik "eigen" (`lib/rechten.ts`). */
  aangemaaktDoor: string;
}): Organisatie {
  const nu = new Date().toISOString();
  const organisatie: Organisatie = {
    id: nieuwId(),
    naam: input.naam,
    kenmerken: input.kenmerken,
    leden: [],
    scanUitvoeringen: [],
    aangemaaktDoor: input.aangemaaktDoor,
    toegewezenAan: [],
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  };
  const alles = laadAlles();
  alles.push(organisatie);
  slaAlles(alles);
  return organisatie;
}

/** Cascadeert naar alle leden, scanuitvoeringen en invullingen van elke organisatie. */
export function verwijderOrganisaties(organisatieIds: string[]): void {
  const ids = new Set(organisatieIds);
  slaAlles(laadAlles().filter((o) => !ids.has(o.id)));
}

export function updateOrganisatie(
  organisatieId: string,
  updater: (organisatie: Organisatie) => Organisatie
): void {
  const alles = laadAlles();
  const index = alles.findIndex((o) => o.id === organisatieId);
  if (index === -1) return;
  const { leden, scanUitvoeringen } = alles[index];
  alles[index] = {
    ...updater(structuredClone(alles[index])),
    leden,
    scanUitvoeringen,
    gewijzigdOp: new Date().toISOString(),
  };
  slaAlles(alles);
}

/**
 * "Eigenaarschap overzetten" bij het deactiveren van een Consultant
 * (`beheerpagina.md` punt 9): Alle organisaties die de oude
 * gebruiker aanmaakte, gaan naar de nieuwe — nodig zodat het bereik
 * "aangemaakt" (`lib/rechten.ts`) niet ineens niemand meer toelaat.
 */
export function zetOrganisatiesOver(vanGebruikerId: string, naarGebruikerId: string): number {
  const alles = laadAlles();
  let aantal = 0;
  for (const organisatie of alles) {
    if (organisatie.aangemaaktDoor === vanGebruikerId) {
      organisatie.aangemaaktDoor = naarGebruikerId;
      aantal++;
    }
  }
  if (aantal > 0) slaAlles(alles);
  return aantal;
}
