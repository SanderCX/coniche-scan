import { Bouwblok } from "./types";
import { CATEGORIE_COLORS } from "./colors";

export interface ToelichtingInfo {
  eyebrow: string;
  accentColor: string;
  /** Het volgnummer van het bouwblok, voor de cirkel in de kop van de Toelichtingsmodal. */
  nummer: number;
  /** De naam van de categorie, `null` zonder categorielaag. */
  categorie: string | null;
  /** De hex van de categoriekleur, `null` zonder categorielaag (dan geldt `--or`). */
  kleur: string | null;
  titel: string;
  /** Leeg: het blok "CENTRALE VRAAG" ontbreekt. */
  centraleVraag: string | null;
  /** Alinea's van `Bouwblok.toelichting`. Leeg: dat onderdeel ontbreekt. */
  beschrijving: string[];
}

/**
 * Inhoud van de Toelichtingsmodal en van de uitleg in de PDF, uit de velden
 * `Bouwblok.toelichting` en `Bouwblok.centraleVraag` (`datamodel.md`,
 * Bouwblok). Eyebrow: `<categorie> · <Assessment.bouwblokLabel> <volgnummer>`,
 * zonder categorie alleen label en nummer. Zonder toelichting en zonder
 * centrale vraag geeft dit `undefined`.
 */
export function toelichtingVoor(
  bouwblok: Bouwblok,
  opties: { bouwblokLabel: string; groepNaam: string | null; groepKleur: string | null }
): ToelichtingInfo | undefined {
  const toelichting = bouwblok.toelichting?.trim() ?? "";
  const centraleVraag = bouwblok.centraleVraag?.trim() || null;
  if (!toelichting && !centraleVraag) return undefined;
  const eyebrow = [opties.groepNaam, `${opties.bouwblokLabel} ${bouwblok.volgnummer}`]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  return {
    eyebrow,
    accentColor: (opties.groepKleur && CATEGORIE_COLORS[opties.groepKleur]?.hex) || "#ff671f",
    nummer: bouwblok.volgnummer,
    categorie: opties.groepNaam,
    kleur: (opties.groepKleur && CATEGORIE_COLORS[opties.groepKleur]?.hex) || null,
    titel: bouwblok.naam,
    centraleVraag,
    beschrijving: toelichting ? toelichting.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean) : [],
  };
}
