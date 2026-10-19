import { formatScore } from "./format";
import { CLASSIFICATIE_INFO } from "./colors";
import { celStap, schaalFractie } from "./mijn-metingen";
import type { RingGegevens } from "@/components/ScoreRing";
import type { Classificatie } from "./types";

/** De ring voor een score van 1 tot 5: Gevuld tot (score − 1) / 4, in de volle kleur en de celkleur van de afgeronde score. */
export function ringVanScore(score: number, klasse: Classificatie): RingGegevens {
  const stap = celStap(score);
  return {
    fractie: schaalFractie(score),
    kleur: `var(--score-${stap})`,
    getal: formatScore(score),
    klasseNaam: CLASSIFICATIE_INFO[klasse].label,
    chipAchtergrond: `var(--score-${stap}-cel)`,
    chipTekst: `var(--score-${stap}-cel-tekst)`,
  };
}
