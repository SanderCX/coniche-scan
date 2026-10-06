import { getAssessment } from "./assessment-store";
import { Organisatie, ScanUitvoering } from "./types";

/**
 * Namen voor `AuditEvent.details` (`datamodel.md`, Audit, Namen bij loggen): De naam van
 * Organisatie, Assessment en Meting zoals die op dat moment is, zodat het overzicht ook
 * leesbaar blijft als het record later is verwijderd of van naam verandert.
 * Nooit een naam, e-mailadres, functie, team, notitie of antwoord van een Respondent.
 */
export function organisatieContext(organisatie: Pick<Organisatie, "id" | "naam">) {
  return { organisatieId: organisatie.id, organisatieNaam: organisatie.naam };
}

export function metingContext(organisatie: Pick<Organisatie, "id" | "naam">, meting: ScanUitvoering) {
  return {
    ...organisatieContext(organisatie),
    metingId: meting.id,
    metingLabel: meting.label,
    assessmentId: meting.assessmentId,
    assessmentNaam: getAssessment(meting.assessmentId)?.naam ?? null,
  };
}
