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

/**
 * Alleen niet-gearchiveerde groepen/bouwblokken/vragen (`Bouwblok.
 * gearchiveerd`, datamodel.md "Content bewerken"): wat een NIEUWE
 * invulling nog te zien krijgt en moet afronden. Gebruikt door de
 * doorloopflow, de sidebar, `voortgang()` en de tellingen op de
 * landingspagina/contentbeheer-overzicht — nooit door scoring/exports op
 * een BESTAANDE invulling, die lezen bewust de ongefilterde
 * `alleBouwblokkenMetGroep`/`alleVragen` hierboven, zodat een antwoord op
 * een inmiddels gearchiveerde vraag in de score blijft meetellen.
 */
export function actieveGroepen(assessment: Assessment): Groep[] {
  return getGroepen(assessment)
    .filter((groep) => groep.id === "_vlak" || !(assessment.categorieen ?? []).find((c) => c.id === groep.id)?.gearchiveerd)
    .map((groep) => ({
      ...groep,
      bouwblokken: groep.bouwblokken.filter((b) => !b.gearchiveerd),
    }));
}

export function actieveBouwblokkenMetGroep(assessment: Assessment): BouwblokMetGroep[] {
  return actieveGroepen(assessment).flatMap((groep) =>
    groep.bouwblokken.map((bouwblok) => ({
      bouwblok: { ...bouwblok, vragen: bouwblok.vragen.filter((v) => !v.gearchiveerd) },
      groepId: groep.id,
      groepNaam: groep.naam,
      groepKleur: groep.kleur,
    }))
  );
}

export function actieveVragen(assessment: Assessment) {
  return actieveBouwblokkenMetGroep(assessment).flatMap((b) => b.bouwblok.vragen);
}
