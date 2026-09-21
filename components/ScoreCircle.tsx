import { Classificatie } from "@/lib/types";
import { CLASSIFICATIE_INFO } from "@/lib/colors";

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
      style={{ ["--kleur" as string]: info.kleur } as React.CSSProperties}
    >
      <span className="score">{score.toFixed(1)}</span>
      <span className="label">{info.label}</span>
    </div>
  );
}
