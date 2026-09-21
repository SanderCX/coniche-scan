import { SchaalLabel } from "@/lib/types";

export function ScaleRadio({
  naam,
  schaal,
  waarde,
  onChange,
  accentHex,
}: {
  naam: string;
  schaal: SchaalLabel[];
  waarde: number | undefined;
  onChange: (waarde: number) => void;
  /** Categoriekleur — radiobutton-rand/stip volgt de categorie, niet vast oranje. */
  accentHex?: string;
}) {
  return (
    <div
      className="schaal"
      style={accentHex ? ({ ["--accent" as string]: accentHex } as React.CSSProperties) : undefined}
    >
      {schaal.map((s) => (
        <label key={s.waarde} className="schaal-optie">
          <input
            type="radio"
            name={naam}
            value={s.waarde}
            checked={waarde === s.waarde}
            onChange={() => onChange(s.waarde)}
          />
          <span className="optie-tekst">
            <strong className="text-ink">{s.waarde}.</strong> {s.label}
          </span>
        </label>
      ))}
    </div>
  );
}
