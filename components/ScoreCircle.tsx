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
      <span className="score">{score.toFixed(1)}</span>
      <span className="label">{info.label}</span>
    </div>
  );
}
