import { Assessment, Bouwblok } from "./types";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";
import { formatGewicht } from "./format";
import { gewichtVan } from "./scoring";

/** Standaardtitel en -tekst van de wegingskaart (`CLAUDE.md`, scherm 4). */
export const STANDAARD_WEGINGTITEL = "Gewogen scoring";
export const STANDAARD_WEGINGTEKST =
  "Binnen dit assessment wegen niet alle bouwblokken even zwaar mee in de totaalscore. De volgende bouwblokken tellen extra mee:";

/** Bouwblokken met een gewicht ongelijk aan 1, op volgorde van het bouwblok-nummer. Gearchiveerde blokken doen niet mee. */
export function bouwblokkenMetAfwijkendGewicht(assessment: Assessment): Bouwblok[] {
  return alleBouwblokkenMetGroep(assessment)
    .map((b) => b.bouwblok)
    .filter((b) => !b.gearchiveerd && gewichtVan(b) !== 1)
    .sort((a, b) => a.volgnummer - b.volgnummer);
}

/** "2×" of "1,5×". `null` bij gewicht 1: Dat wordt nergens getoond. */
export function gewichtMarkering(bouwblok: Bouwblok): string | null {
  const g = gewichtVan(bouwblok);
  return g === 1 ? null : `${formatGewicht(g)}×`;
}
