import { OrganisatieLid } from "./types";

/**
 * Bouwt de "Publieke link" (v1-aanpassingen.md punt 2): één link per
 * respondent, niet per ingevulde scan. Bevat alleen de toegangscode —
 * geen id's, e-mailadres of organisatiegegevens, ook niet gecodeerd.
 * Wordt niet automatisch gemaild; de admin kopieert en deelt 'm zelf.
 *
 * Gevolg zolang er geen database is: zonder gegevens in de link kan een
 * andere browser zich niet meer "bootstrappen" (zie de oude versie van dit
 * bestand, git-historie) — de link werkt dan alleen in de browser waar de
 * data staat. Bewuste keuze, zie v1-aanpassingen.md punt 2.
 */
export function maakPubliekeLink(origin: string, lid: OrganisatieLid): string {
  return `${origin}/s/${lid.toegangscode}`;
}
