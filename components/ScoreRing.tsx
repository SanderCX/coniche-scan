import { Teaser } from "@/lib/mijn-metingen";

/**
 * De ring van de totaalscore (`stylesheet.md`, Resultaten, `.score-ring`, besloten op 19 oktober 2026): Eén component voor Mijn metingen en
 * het resultatenscherm, in plaats van de classificatiecirkel. 156px, een spoor in `--bg-mid` en een boog van 14px met afgeronde uiteinden,
 * beginnend bovenaan en met de klok mee. De vulling is `(score − 1) / 4` bij een score van 1 tot 5 en `percentage / 100` bij een
 * percentage. Het getal staat in de ring, de klassenchip in de celkleur eronder. Een groepsstip staat alleen waar een groep zichtbaar is.
 */
const GROOTTE = 156;
const DIKTE = 14;
const STRAAL = (GROOTTE - DIKTE) / 2;
const OMTREK = 2 * Math.PI * STRAAL;

export interface RingGegevens {
  /** 0 tot en met 1. */
  fractie: number;
  /** De volle kleur van de afgeronde score of klasse (een CSS-waarde). */
  kleur: string;
  /** Het getal in de ring: "3,4" of "58%". */
  getal: string;
  /** De klassenaam in de chip. */
  klasseNaam: string;
  chipAchtergrond: string;
  chipTekst: string;
}

/** De ring van een teaser (`lib/mijn-metingen.ts`). */
export function ringVanTeaser(t: Teaser): RingGegevens {
  return { ...t.ring, getal: t.getal, klasseNaam: t.klasseNaam ?? "" };
}

export function ScoreRing({
  ring,
  stipFractie,
  alt,
  klein = false,
  mini = false,
  tegel = false,
  metChip = true,
  label = "Totaalscore",
}: {
  ring: RingGegevens;
  stipFractie?: number;
  alt?: string;
  /** De ring van 128px in de Resultaatkop, met het getal in 32px. */
  klein?: boolean;
  /** De ring van 44px in een rij van de top 3: Alleen het getal in de ring, zonder label en zonder chip. */
  mini?: boolean;
  /** De ring van 64px in een tegel boven een weergave: Alleen het getal in de ring (16px), zonder label en zonder chip. */
  tegel?: boolean;
  /** De klassenchip onder de ring. In de Resultaatkop staat hij rechts ervan. */
  metChip?: boolean;
  /** Het label onder het getal. Bij de Spanningsmeter "Niveau": Daar is het getal het gemiddeld niveau en geen totaalscore. */
  label?: string;
}) {
  const fractie = Math.min(1, Math.max(0, ring.fractie));
  const midden = GROOTTE / 2;
  const hoek = (stipFractie ?? 0) * 2 * Math.PI;
  return (
    <div className={`score-ring-blok ${klein ? "score-ring--klein" : ""} ${mini ? "score-ring--mini" : ""} ${tegel ? "score-ring--tegel" : ""}`}>
      <div className="score-ring" role="img" aria-label={alt ?? `${label} ${ring.getal}${ring.klasseNaam ? `, ${ring.klasseNaam}` : ""}`}>
        <svg width="100%" height="100%" viewBox={`0 0 ${GROOTTE} ${GROOTTE}`} aria-hidden="true">
          <circle cx={midden} cy={midden} r={STRAAL} fill="none" stroke="var(--bg-mid)" strokeWidth={DIKTE} />
          {fractie > 0 && (
            <circle
              cx={midden}
              cy={midden}
              r={STRAAL}
              fill="none"
              stroke={ring.kleur}
              strokeWidth={DIKTE}
              strokeLinecap="round"
              strokeDasharray={`${fractie * OMTREK} ${OMTREK}`}
              transform={`rotate(-90 ${midden} ${midden})`}
            />
          )}
          {stipFractie !== undefined && (
            <circle
              cx={midden + STRAAL * Math.sin(hoek)}
              cy={midden - STRAAL * Math.cos(hoek)}
              r={7}
              fill="var(--ink-m)"
              stroke="var(--bg)"
              strokeWidth={2}
            />
          )}
        </svg>
        <div className="score-ring-tekst">
          <span className="score-ring-getal" style={mini && ring.getal.length > 3 ? { fontSize: "var(--fs-12)" } : undefined}>
            {ring.getal}
          </span>
          {!mini && !tegel && <span className="score-ring-label">{label}</span>}
        </div>
      </div>
      {metChip && !mini && !tegel && ring.klasseNaam && (
        <span className="score-ring-chip" style={{ background: ring.chipAchtergrond, color: ring.chipTekst }}>
          {ring.klasseNaam}
        </span>
      )}
    </div>
  );
}
