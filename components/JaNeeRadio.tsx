import { Antwoord } from "@/lib/types";

const OPTIES: { waarde: "ja" | "nee" | "weet-niet"; label: string }[] = [
  { waarde: "ja", label: "Ja" },
  { waarde: "nee", label: "Nee" },
  { waarde: "weet-niet", label: "Weet ik niet" },
];

/**
 * Een rij antwoordpillen van 40px hoog, één keuze per rij (`content-ziekenhuis-quickscan.md`, Doorloop per afdeling; `stylesheet.md`,
 * Doorloopflow, Quickscan): De gekozen pil is massief `--or`. Het zijn echte radioknoppen, visueel verborgen, zodat het toetsenbord en
 * de schermlezer werken.
 */
export function AntwoordPillen<T extends string>({
  naam,
  label,
  opties,
  waarde,
  onChange,
}: {
  naam: string;
  label?: string;
  opties: { waarde: T; label: string }[];
  waarde: T | undefined;
  onChange: (waarde: T) => void;
}) {
  return (
    <div className="antwoord-pillen" role="radiogroup" aria-label={label}>
      {opties.map((o) => (
        <label key={o.waarde} className={`antwoord-pil ${waarde === o.waarde ? "is-gekozen" : ""}`}>
          <input
            type="radio"
            className="sr-only"
            name={naam}
            value={o.waarde}
            checked={waarde === o.waarde}
            onChange={() => onChange(o.waarde)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/**
 * De drie antwoorden bij een vraag van een Assessment met antwoordType "ja-nee-weetniet" (`datamodel.md`, Antwoordtype), in
 * plaats van de 1–5-schaal: Ja, Nee en Weet ik niet als pillen onder de vraag.
 */
export function JaNeeRadio({
  naam,
  waarde,
  onChange,
}: {
  naam: string;
  waarde: Antwoord | undefined;
  onChange: (waarde: "ja" | "nee" | "weet-niet") => void;
}) {
  return (
    <AntwoordPillen
      naam={naam}
      opties={OPTIES}
      waarde={typeof waarde === "string" ? (waarde as "ja" | "nee" | "weet-niet") : undefined}
      onChange={onChange}
    />
  );
}
