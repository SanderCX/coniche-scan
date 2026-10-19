import { Vorm, VORM_NAAM } from "@/lib/visualisatie";

/** Een vorm in de legenda (`visualisatie-scores.md`, I). De vorm staat in een stip op het spoor als `vis-stip vis-vorm--<vorm>`. */
export function VormTeken({ vorm, kleur }: { vorm: Vorm; kleur?: string }) {
  return (
    <span
      className={`vis-vorm-teken vis-vorm--${vorm}`}
      role="img"
      aria-label={VORM_NAAM[vorm]}
      style={kleur ? ({ ["--vis-kleur" as string]: kleur } as React.CSSProperties) : undefined}
    />
  );
}
