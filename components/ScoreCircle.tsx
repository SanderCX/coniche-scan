import { formatScore } from "@/lib/format";
import { Classificatie } from "@/lib/types";
import { CLASSIFICATIE_INFO, scoreKleur } from "@/lib/colors";

export function ScoreCircle({
  score,
  classificatie,
}: {
  score: number;
  classificatie: Classificatie;
}) {
  const info = CLASSIFICATIE_INFO[classificatie];
  return (
    <div
      className="classificatie-cirkel"
      style={{ ["--kleur" as string]: scoreKleur(score) } as React.CSSProperties}
    >
      <span className="score">{formatScore(score)}</span>
      <span className="label">{info.label}</span>
    </div>
  );
}
