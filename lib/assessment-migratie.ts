import { Assessment, Bouwblok } from "./types";
import { alleBouwstenen } from "@/data/bouwstenen-content";
import { aiDomeinen } from "@/data/ai-domeinen-content";

/**
 * Eenmalige aanvulling van een Assessment met de velden die later aan het
 * datamodel zijn toegevoegd (`datamodel.md`: `Bouwblok.centraleVraag`,
 * `Bouwblok.toelichting`, `Assessment.bouwblokLabel`, `wegingTitel`,
 * `wegingToelichting`). De rijke content stond eerder in twee opzoektabellen
 * (`data/bouwstenen-content.ts`, `data/ai-domeinen-content.ts`), gekoppeld
 * via voorvoegsel en `volgnummer`. Die tabellen worden hier alleen nog
 * gebruikt om een bouwblok dat het veld nog niet kent één keer te vullen:
 * daarna is het veld de bron en beheerbaar.
 *
 * Alleen `undefined` wordt aangevuld. Een veld dat leeg is gemaakt (`null`
 * of lege tekst) blijft leeg.
 */
function lookupVoor(bouwblok: Bouwblok): { centraleVraag: string; beschrijving: string[] } | undefined {
  if (bouwblok.id.startsWith("bb") || bouwblok.id.startsWith("zorg-")) {
    return alleBouwstenen.find((b) => b.nummer === bouwblok.volgnummer);
  }
  if (bouwblok.id.startsWith("ai")) {
    return aiDomeinen.find((d) => d.nummer === bouwblok.volgnummer);
  }
  return undefined;
}

function verrijkBouwblok(bouwblok: Bouwblok): Bouwblok {
  if (bouwblok.centraleVraag !== undefined) return bouwblok;
  const info = lookupVoor(bouwblok);
  return {
    ...bouwblok,
    centraleVraag: info?.centraleVraag ?? null,
    toelichting: info ? info.beschrijving.join("\n\n") : bouwblok.toelichting || null,
  };
}

export function verrijkAssessment(assessment: Assessment): Assessment {
  const alleBouwblokken = [
    ...(assessment.categorieen ?? []).flatMap((c) => c.bouwblokken),
    ...(assessment.bouwblokken ?? []),
  ];
  const isAi = alleBouwblokken.some((b) => b.id.startsWith("ai"));
  return {
    ...assessment,
    bouwblokLabel: assessment.bouwblokLabel ?? (isAi ? "AI-domein" : "Bouwsteen"),
    wegingTitel: assessment.wegingTitel ?? null,
    wegingToelichting: assessment.wegingToelichting ?? null,
    categorieen: assessment.categorieen
      ? assessment.categorieen.map((c) => ({ ...c, bouwblokken: c.bouwblokken.map(verrijkBouwblok) }))
      : null,
    bouwblokken: assessment.bouwblokken ? assessment.bouwblokken.map(verrijkBouwblok) : null,
  };
}
