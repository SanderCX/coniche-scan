import { Organisatie, Respondent } from "./types";

export interface UitnodigingBootstrap {
  organisatie: Omit<Organisatie, "respondenten">;
  respondent: Respondent;
}

/**
 * Bouwt de uitnodigingslink met de organisatie- en respondentgegevens
 * zelf meegecodeerd, zodat de link ook werkt in een browser die nog geen
 * lokale data heeft (bijv. de respondent die 'm vanuit zijn eigen
 * e-mailclient opent) — zie lib/db.ts `importRespondent`.
 */
export function maakUitnodigingUrl(
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
  return `${origin}/uitnodiging/${respondent.id}?b=${encoded}`;
}

export function decodeBootstrap(param: string): UitnodigingBootstrap | null {
  try {
    return JSON.parse(decodeURIComponent(param)) as UitnodigingBootstrap;
  } catch {
    return null;
  }
}
