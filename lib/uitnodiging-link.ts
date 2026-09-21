import { Organisatie, Respondent } from "./types";

export interface UitnodigingBootstrap {
  organisatie: Omit<Organisatie, "respondenten">;
  respondent: Respondent;
}

/**
 * Bouwt de "Publieke link" (v1-aanpassingen.md punt 2a) met de organisatie-
 * en respondentgegevens zelf meegecodeerd, zodat de link ook werkt in een
 * browser die nog geen lokale data heeft (bijv. de respondent die 'm vanuit
 * zijn eigen e-mailclient opent) — zie lib/db.ts `importRespondent`. Wordt
 * niet automatisch gemaild; de admin kopieert en deelt 'm zelf.
 */
export function maakPubliekeLink(
  origin: string,
  organisatie: Organisatie,
  respondent: Respondent
): string {
  const payload: UitnodigingBootstrap = {
    organisatie: {
      id: organisatie.id,
      assessmentId: organisatie.assessmentId,
      naam: organisatie.naam,
      kenmerken: organisatie.kenmerken,
    },
    respondent,
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `${origin}/scan/${respondent.id}?b=${encoded}`;
}

export function decodeBootstrap(param: string): UitnodigingBootstrap | null {
  try {
    return JSON.parse(decodeURIComponent(param)) as UitnodigingBootstrap;
  } catch {
    return null;
  }
}
