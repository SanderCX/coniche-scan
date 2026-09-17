import { Classificatie } from "@/lib/types";
import { CLASSIFICATIE_HEX, CLASSIFICATIE_INFO } from "@/lib/colors";

export function ScoreCircle({
  score,
  classificatie,
  size = "lg",
}: {
  score: number;
  classificatie: Classificatie;
  size?: "lg" | "md";
}) {
  const info = CLASSIFICATIE_INFO[classificatie];
  const dims = size === "lg" ? "h-36 w-36 text-5xl" : "h-20 w-20 text-2xl";
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`flex ${dims} items-center justify-center rounded-full border-8 font-bold text-slate-900`}
        style={{ borderColor: CLASSIFICATIE_HEX[classificatie] }}
      >
        {score.toFixed(1)}
      </div>
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold text-white ${info.bg}`}
      >
        {info.label}
      </span>
    </div>
  );
}
