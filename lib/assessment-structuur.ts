import { Assessment, Bouwblok } from "./types";

/**
 * Normaliseert een Assessment naar "groepen" van bouwblokken: categorieën als
 * die er zijn, anders één virtuele groep zonder naam/kleur die de platte
 * bouwblokkenlijst bevat. Alle flow-, sidebar- en scoringlogica navigeert
 * hierdoorheen in plaats van rechtstreeks over `categorieen` aan te nemen.
 */
export interface Groep {
  id: string;
  naam: string | null;
  kleur: string | null;
  volgorde: number;
  bouwblokken: Bouwblok[];
}

export function isVlakkeAssessment(assessment: Assessment): boolean {
  return !assessment.categorieen || assessment.categorieen.length === 0;
}

export function getGroepen(assessment: Assessment): Groep[] {
  if (assessment.categorieen && assessment.categorieen.length > 0) {
    return [...assessment.categorieen]
      .sort((a, b) => a.volgorde - b.volgorde)
      .map((c) => ({
        id: c.id,
        naam: c.naam,
        kleur: c.kleur,
        volgorde: c.volgorde,
        bouwblokken: c.bouwblokken,
      }));
  }
  return [
    {
      id: "_vlak",
      naam: null,
      kleur: null,
      volgorde: 0,
      bouwblokken: assessment.bouwblokken ?? [],
    },
  ];
}

export interface BouwblokMetGroep {
  bouwblok: Bouwblok;
  groepId: string;
  groepNaam: string | null;
  groepKleur: string | null;
}

export function alleBouwblokkenMetGroep(assessment: Assessment): BouwblokMetGroep[] {
  return getGroepen(assessment).flatMap((groep) =>
    groep.bouwblokken.map((bouwblok) => ({
      bouwblok,
      groepId: groep.id,
      groepNaam: groep.naam,
      groepKleur: groep.kleur,
    }))
  );
}

export function alleVragen(assessment: Assessment) {
  return alleBouwblokkenMetGroep(assessment).flatMap((b) => b.bouwblok.vragen);
}
