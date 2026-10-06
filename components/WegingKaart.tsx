import { Assessment } from "@/lib/types";
import {
  STANDAARD_WEGINGTEKST,
  STANDAARD_WEGINGTITEL,
  bouwblokkenMetAfwijkendGewicht,
  gewichtMarkering,
} from "@/lib/weging";

/**
 * Wegingskaart bovenaan de intake (`CLAUDE.md`, scherm 4): Alleen als het
 * Assessment minstens één bouwblok met een gewicht ongelijk aan 1 heeft.
 * Titel en tekst per Assessment aanpasbaar (`Assessment.wegingTitel`,
 * `wegingToelichting`), leeg betekent de standaardtekst.
 */
export function WegingKaart({ assessment }: { assessment: Assessment }) {
  const bouwblokken = bouwblokkenMetAfwijkendGewicht(assessment);
  if (bouwblokken.length === 0) return null;
  return (
    <div className="card card-warm weging-kaart">
      <svg className="weging-icoon" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7zm14 0l-3 7a3.5 3.5 0 0 0 6 0l-3-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <h3>{assessment.wegingTitel?.trim() || STANDAARD_WEGINGTITEL}</h3>
        <p className="text-sm" style={{ color: "var(--ink-m)", whiteSpace: "pre-line" }}>
          {assessment.wegingToelichting?.trim() || STANDAARD_WEGINGTEKST}
        </p>
        <div className="tags-rij" style={{ marginTop: "0.8rem" }}>
          {bouwblokken.map((b) => (
            <span key={b.id} className="g-badge">
              {b.naam} ({gewichtMarkering(b)})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
