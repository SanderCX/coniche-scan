import { assessmentKlantcontact } from "./assessment-klantcontact.js";
import { assessmentAi } from "./assessment-ai.js";

export const assessments = [assessmentKlantcontact, assessmentAi];

export function getAssessment(id) {
  return assessments.find((a) => a.id === id) || null;
}

// Alle bouwblokken van een assessment, plat, ongeacht of ze onder categorieen
// hangen of los staan (bouwblokken).
export function alleBouwblokken(assessment) {
  if (assessment.categorieen && assessment.categorieen.length) {
    return assessment.categorieen
      .slice()
      .sort((a, b) => a.volgorde - b.volgorde)
      .flatMap((c) => c.bouwblokken.map((b) => ({ ...b, categorieId: c.id, categorieKleur: c.kleur })));
  }
  return (assessment.bouwblokken || []).map((b) => ({ ...b, categorieId: null, categorieKleur: null }));
}

export function totaalAantalVragen(assessment) {
  return alleBouwblokken(assessment).reduce((sum, b) => sum + b.vragen.length, 0);
}

export function vindBouwblok(assessment, bouwblokId) {
  return alleBouwblokken(assessment).find((b) => b.id === bouwblokId) || null;
}
