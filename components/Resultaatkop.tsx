import { RingGegevens, ScoreRing } from "@/components/ScoreRing";

/**
 * De Resultaatkop (`stylesheet.md`, Resultaten, Resultaatkop, voorstel van 19 oktober 2026): Eén kop bovenaan elk resultaatscherm van een
 * scan, voor de schaalscans en de Quickscan dezelfde component. Hij heeft twee delen, omdat de resultatenpagina van een Meting er een
 * schakelaar tussen zet: `ResultaatKop` (eyebrow, titel en subregel) en `Totaalkaart` (de ring, de klassechip en de feiten).
 */
export function ResultaatKop({
  eyebrow,
  titel,
  subregel,
  rechts,
}: {
  eyebrow: string;
  titel: string;
  /** De gegevens, gescheiden door " · ". Lege delen vallen weg. */
  subregel?: (string | null | undefined | false)[];
  /** Alleen in de voorbeeld-output: De knop "← Terug". */
  rechts?: React.ReactNode;
}) {
  const regel = (subregel ?? []).filter(Boolean).join(" · ");
  return (
    <header className="resultaatkop">
      <span className="eyebrow">{eyebrow}</span>
      <div className="resultaatkop-titelrij">
        <h1 className="page-title">{titel}</h1>
        {rechts}
      </div>
      {regel && <p className="resultaatkop-sub">{regel}</p>}
    </header>
  );
}

/**
 * De totaalkaart: Links de ring van 128px met de score erin, rechts de klassenaam als chip, bij een schaalscan de uitleg van de klasse
 * en de feiten, elk op een eigen regel. Alleen de ring en de chip dragen scorekleur, alle tekst staat in `--ink`, `--ink-m` of `--ink-s`.
 * `extra` zijn de regels over weging en over afdelingen die niet meetelen, onder de feiten.
 */
export function Totaalkaart({
  ring,
  uitleg,
  feiten,
  extra,
  ringLabel,
  ringAlt,
}: {
  ring: RingGegevens;
  /** Het label onder het getal in de ring: Standaard "Totaalscore", bij de Spanningsmeter "Niveau". */
  ringLabel?: string;
  /** Het tekstalternatief van de ring. */
  ringAlt?: string;
  uitleg?: string;
  feiten: (string | null | undefined | false)[];
  extra?: (string | null | undefined | false)[];
}) {
  const f = feiten.filter(Boolean) as string[];
  const e = (extra ?? []).filter(Boolean) as string[];
  return (
    <section className="totaalkaart" aria-label={ringLabel ?? "Totaalscore"}>
      <ScoreRing ring={ring} klein metChip={false} label={ringLabel} alt={ringAlt} />
      <div className="totaalkaart-tekst">
        {ring.klasseNaam && (
          <span className="score-ring-chip" style={{ background: ring.chipAchtergrond, color: ring.chipTekst }}>
            {ring.klasseNaam}
          </span>
        )}
        {uitleg && <p className="totaalkaart-uitleg">{uitleg}</p>}
        {f.length > 0 && (
          <ul className="totaalkaart-feiten">
            {f.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        {e.map((t) => (
          <p key={t} className="totaalkaart-extra">
            {t}
          </p>
        ))}
      </div>
    </section>
  );
}
