import { Antwoord } from "@/lib/types";

const OPTIES: { waarde: "ja" | "nee" | "weet-niet"; label: string }[] = [
  { waarde: "ja", label: "Ja" },
  { waarde: "nee", label: "Nee" },
  { waarde: "weet-niet", label: "Weet ik niet" },
];

/**
 * De drie antwoorden bij een vraag van een Assessment met antwoordType "ja-nee-weetniet" (`datamodel.md`, Antwoordtype), in
 * plaats van de 1–5-schaal. Zelfde opmaak als `ScaleRadio`: Eén keuze per vraag, in de categoriekleur.
 */
export function JaNeeRadio({
  naam,
  waarde,
  onChange,
  accentHex,
}: {
  naam: string;
  waarde: Antwoord | undefined;
  onChange: (waarde: "ja" | "nee" | "weet-niet") => void;
  accentHex?: string;
}) {
  return (
    <div
      className="schaal"
      role="radiogroup"
      style={accentHex ? ({ ["--accent" as string]: accentHex } as React.CSSProperties) : undefined}
    >
      {OPTIES.map((o) => (
        <label key={o.waarde} className="schaal-optie">
          <input type="radio" name={naam} value={o.waarde} checked={waarde === o.waarde} onChange={() => onChange(o.waarde)} />
          <span className="optie-tekst">
            <strong className="text-ink">{o.label}</strong>
          </span>
        </label>
      ))}
    </div>
  );
}
