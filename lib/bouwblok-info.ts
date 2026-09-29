import { Bouwblok } from "./types";
import { alleBouwstenen } from "@/data/bouwstenen-content";
import { aiDomeinen } from "@/data/ai-domeinen-content";
import { CATEGORIE_COLORS } from "./colors";

export interface ToelichtingInfo {
  eyebrow: string;
  accentColor: string;
  titel: string;
  centraleVraag: string;
  beschrijving: string[];
}

/**
 * Volledige toelichting per bouwblok (eyebrow, titel, centrale vraag,
 * beschrijving), uit dezelfde content-bronnen als de toelichting-overlay
 * (`components/BouwblokForm.tsx`, `bouwsteenInfo`/`aiDomeinInfo`) en de
 * interactieve visuals (`/bouwstenen`, `/ai-scan`): Klantcontact-
 * bouwblokken ("bb…") uit `visie-coniche.md` deel 2, AI-domeinen ("ai…")
 * uit `visie-ai-klantcontact.md`. Geen match (nog niet bestaande content)
 * geeft `undefined`.
 */
export function toelichtingVoor(bouwblok: Bouwblok): ToelichtingInfo | undefined {
  if (bouwblok.id.startsWith("bb")) {
    const info = alleBouwstenen.find((b) => b.nummer === bouwblok.volgnummer);
    if (!info) return undefined;
    return {
      eyebrow: `${info.groepNaam.toUpperCase()} · BOUWSTEEN ${info.nummer}`,
      accentColor: CATEGORIE_COLORS[info.kleur]?.hex ?? "#ff671f",
      titel: info.naam,
      centraleVraag: info.centraleVraag,
      beschrijving: info.beschrijving,
    };
  }
  if (bouwblok.id.startsWith("ai")) {
    const info = aiDomeinen.find((d) => d.nummer === bouwblok.volgnummer);
    if (!info) return undefined;
    return {
      eyebrow: `AI-DOMEIN ${info.nummer}`,
      accentColor: "#ff671f",
      titel: info.naam,
      centraleVraag: info.centraleVraag,
      beschrijving: info.beschrijving,
    };
  }
  return undefined;
}

/** Centrale vraag per bouwblok — zie `toelichtingVoor` voor de volledige info. */
export function centraleVraagVoor(bouwblok: Bouwblok): string | undefined {
  return toelichtingVoor(bouwblok)?.centraleVraag;
}
