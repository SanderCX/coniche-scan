import { formatScore } from "@/lib/format";
import { Classificatie } from "@/lib/types";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { celStap, schaalFractie } from "@/lib/mijn-metingen";
import { ScoreRing } from "@/components/ScoreRing";

/**
 * De totaalscore van een scan met een schaal van 1 tot 5 als `.score-ring` (`stylesheet.md`, Resultaten). De naam is gebleven, de
 * oude classificatiecirkel is vervallen.
 */
export function ScoreCircle({
  score,
  classificatie,
}: {
  score: number;
  classificatie: Classificatie;
}) {
  const stap = celStap(score);
  return (
    <ScoreRing
      ring={{
        fractie: schaalFractie(score),
        kleur: `var(--score-${stap})`,
        getal: formatScore(score),
        klasseNaam: CLASSIFICATIE_INFO[classificatie].label,
        chipAchtergrond: `var(--score-${stap}-cel)`,
        chipTekst: `var(--score-${stap}-cel-tekst)`,
      }}
    />
  );
}
