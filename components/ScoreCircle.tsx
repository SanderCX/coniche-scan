import { Classificatie } from "@/lib/types";
import { ringVanScore } from "@/lib/score-ring";
import { ScoreRing } from "@/components/ScoreRing";

/**
 * De totaalscore van een scan met een schaal van 1 tot 5 als `.score-ring` (`stylesheet.md`, Resultaten). De naam is gebleven, de
 * oude classificatiecirkel is vervallen. Het resultatenscherm zelf gebruikt de Resultaatkop (`components/Resultaatkop.tsx`).
 */
export function ScoreCircle({ score, classificatie }: { score: number; classificatie: Classificatie }) {
  return <ScoreRing ring={ringVanScore(score, classificatie)} />;
}
