import { Antwoord } from "@/lib/types";
import { ziekenhuisQuickscan } from "./ziekenhuis-quickscan-assessment";

/**
 * Demo-antwoorden voor de voorbeeld-output van de Quickscan Ziekenhuis: Dezelfde verdeling als de fictieve proefscan uit de
 * oude tool (`datamodel.md`, Scoreberekening, Rekenvoorbeeld): Poliklinieken 5, Verpleegafdelingen 3, Receptie / Centrale 5
 * en Patiëntenservice 4 punten van 15, samen 17 van 60. De Ja's staan vooraan, de rest is afwisselend Nee en Weet ik niet.
 */
const JA_PER_AFDELING: Record<string, number> = {
  "qs-poliklinieken": 5,
  "qs-verpleegafdelingen": 3,
  "qs-receptie": 5,
  "qs-patientenservice": 4,
};

function bouw(): Record<string, Antwoord> {
  const uit: Record<string, Antwoord> = {};
  for (const categorie of ziekenhuisQuickscan.categorieen ?? []) {
    let ja = JA_PER_AFDELING[categorie.id] ?? 0;
    let teller = 0;
    for (const bouwblok of categorie.bouwblokken) {
      for (const vraag of bouwblok.vragen) {
        if (ja > 0) {
          uit[vraag.id] = "ja";
          ja -= 1;
        } else {
          uit[vraag.id] = teller % 3 === 0 ? "weet-niet" : "nee";
          teller += 1;
        }
      }
    }
  }
  return uit;
}

export const demoAntwoordenQuickscan: Record<string, Antwoord> = bouw();

/** Alle vier de afdelingen zijn van toepassing. */
export const demoRelevantieQuickscan: Record<string, boolean> = Object.fromEntries(
  (ziekenhuisQuickscan.categorieen ?? []).map((c) => [c.id, true])
);
