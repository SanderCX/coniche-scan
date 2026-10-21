"use client";

import { BouwblokResultaat, classificatie } from "@/lib/scoring";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO, tekstOpKleur } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { gewichtMarkering } from "@/lib/weging";
import { GrafiekActief, ZetActief, groepSleutel, staatVan, useGrafiekActief } from "@/lib/grafiek-actief";

/**
 * De radar met genummerde knooppunten (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm): Rond de radar staat per bouwblok een
 * cirkel van 26px met alleen het nummer, wit met een rand in de categoriekleur. De namen staan in de tooltip. De score loopt van 1 in het midden
 * tot 5 aan de rand (straal 130 in een tekening van 432), met het vlak in `--or`, taartpunten in de categoriekleur (20%) en de klassegrenzen 2,5
 * en 3,5 als stippellijnen. Onder de radar staat een legenda met de lijnen.
 *
 * Hover of focus op een knooppunt (of op de balk of kolom ernaast, via `actief`) laat de radar en het staafdiagram elkaar oplichten: De
 * taartpunt gaat naar 50%, de score-stip verschijnt op de veelhoek en wat bij een andere categorie hoort, dimt. De tooltip staat buiten de
 * radar: Boven of onder een knooppunt dichtbij de verticale as, anders in de hoek van het kwadrant.
 *
 * `filter` (de filtermodus op de Dossierpagina, `stylesheet.md`, Filtermodus op de Dossierpagina; `dossier.md`, Radar met filter): Alleen de
 * bouwblokken in `actief` zijn knoppen (gevuld in de categoriekleur, `aria-pressed`), de rest staat op 40% en heeft alleen de tooltip. Een klik
 * kiest dat bouwblok, een tweede klik heft de keuze op. Het gekozen bouwblok krijgt een tweede ring en 50% dekking in de taartpunt, en de
 * score-stip staat alleen bij de actieve bouwblokken. Zonder scores (`score: null` bij alle bouwblokken) ontbreken de veelhoek, de stippen en de
 * reeks in de legenda.
 *
 * `vergelijking`: Een tweede reeks, bijvoorbeeld de rest van de groep in een benchmark (`benchmark.md`, View per organisatie): Een lijn met
 * streepjes in `--ink`, en de tooltip toont beide scores.
 */
const MAAT = 432;
const MIDDEN = MAAT / 2;
const STRAAL = 130;
const KNOOP = 26;
const KNOOP_STRAAL = STRAAL + KNOOP;
/** Dichter dan dit bij de verticale as (90px in een tekening van 440px) staat de tooltip boven of onder het knooppunt. */
const AS_AFSTAND = (90 * MAAT) / 440;
const SCHAAL_MIN = 1;
const SCHAAL_MAX = 5;

const radiaal = (score: number) => ((Math.min(SCHAAL_MAX, Math.max(SCHAAL_MIN, score)) - SCHAAL_MIN) / (SCHAAL_MAX - SCHAAL_MIN)) * STRAAL;
/** De hoek van bouwblok `i` van `n`: Bovenaan beginnen, met de klok mee. */
const hoek = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
const punt = (straal: number, h: number) => [MIDDEN + straal * Math.cos(h), MIDDEN + straal * Math.sin(h)] as const;

/** De dekking van een taartpunt: 20% standaard, 50% voor wat actief is en 9% voor wat bij een andere categorie hoort. */
const TAART_DEKKING = { normaal: 0.2, actief: 0.5, groep: 0.2, gedimd: 0.09 } as const;

/** De filtermodus van de radar (`dossier.md`, Radar met filter). */
export interface RadarFilter {
  /** `Bouwblok.id` van de bouwblokken die een filter zijn. */
  actief: ReadonlySet<string>;
  /** Het gekozen bouwblok, of `null`. */
  gekozen: string | null;
  onKies: (bouwblokId: string | null) => void;
}

export function RadarChartView({
  resultaten,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Rest van de groep",
  actief,
  onActief,
  filter,
}: {
  resultaten: BouwblokResultaat[];
  vergelijking?: BouwblokResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
  /** De actieve staat van de ouder, zodat de radar en het staafdiagram elkaar oplichten. Zonder: Een eigen staat. */
  actief?: GrafiekActief | null;
  onActief?: ZetActief;
  filter?: RadarFilter;
}) {
  const { actief: a, zet } = useGrafiekActief({ actief, onActief });
  const n = resultaten.length;
  if (n === 0) return null;
  const stap = (2 * Math.PI) / n;
  const kleurVan = (r: BouwblokResultaat) => (r.groepKleur && CATEGORIE_COLORS[r.groepKleur]?.hex) || "#ff671f";
  const polygoon = (lijst: BouwblokResultaat[]) =>
    lijst
      .map((r, i) => punt(radiaal(r.score ?? SCHAAL_MIN), hoek(i, n)).map((v) => v.toFixed(1)).join(","))
      .join(" ");
  const sleutelVan = (r: BouwblokResultaat) => groepSleutel(r.groepId, r.bouwblok.id);
  // In de filtermodus zonder scores (de Lead mag geen Resultaten zien) staat er geen veelhoek.
  const toonVlak = !filter || resultaten.some((r) => r.score !== null);

  return (
    <div className="radar">
      <div className="radar-vlak" style={{ aspectRatio: "1 / 1" }}>
        <svg viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-label={`Radar van ${n} scores`} width="100%" height="100%">
          {/* Taartpunten in de categoriekleur (20%) met witte scheidslijnen tussen de bouwblokken. */}
          {resultaten.map((r, i) => {
            const h = hoek(i, n);
            const [x1, y1] = punt(STRAAL, h - stap / 2);
            const [x2, y2] = punt(STRAAL, h + stap / 2);
            return (
              <path
                key={r.bouwblok.id}
                className="radar-taart"
                d={`M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${STRAAL},${STRAAL} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
                fill={kleurVan(r)}
                fillOpacity={
                  filter ? (filter.gekozen === r.bouwblok.id ? TAART_DEKKING.actief : TAART_DEKKING.normaal) : TAART_DEKKING[staatVan(a, sleutelVan(r), r.bouwblok.id)]
                }
                stroke="#fff"
                strokeWidth={1}
              />
            );
          })}
          {[2, 3, 4, 5].map((s) => (
            <circle key={s} cx={MIDDEN} cy={MIDDEN} r={radiaal(s)} fill="none" stroke="var(--border)" strokeWidth={1} />
          ))}
          {/* De klassegrenzen 2,5 en 3,5. */}
          {[2.5, 3.5].map((s) => (
            <circle key={s} cx={MIDDEN} cy={MIDDEN} r={radiaal(s)} fill="none" stroke="#9a978f" strokeWidth={1} strokeDasharray="3 3" />
          ))}
          {vergelijking && <polygon points={polygoon(vergelijking)} fill="var(--ink)" fillOpacity={0.08} stroke="var(--ink)" strokeWidth={2} strokeDasharray="4 3" />}
          {toonVlak && <polygon points={polygoon(resultaten)} fill="var(--or)" fillOpacity={0.18} stroke="var(--or)" strokeWidth={2} strokeLinejoin="round" />}
          {/* De score-stippen van wat actief is: 10px met een witte rand van 2px, `--or` voor de reeks Organisatie en `--ink` voor de rest van de groep. */}
          {resultaten.map((r, i) => {
            if (filter ? !filter.actief.has(r.bouwblok.id) || r.score === null : staatVan(a, sleutelVan(r), r.bouwblok.id) !== "actief") return null;
            const h = hoek(i, n);
            const [x, y] = punt(radiaal(r.score ?? SCHAAL_MIN), h);
            const vgl = vergelijking?.[i];
            const [vx, vy] = vgl ? punt(radiaal(vgl.score ?? SCHAAL_MIN), h) : [0, 0];
            return (
              <g key={r.bouwblok.id} className="radar-stip" aria-hidden="true">
                {vgl && vgl.score !== null && <circle cx={vx} cy={vy} r={5} fill="var(--ink)" stroke="#fff" strokeWidth={2} />}
                {r.score !== null && <circle cx={x} cy={y} r={5} fill="var(--or)" stroke="#fff" strokeWidth={2} />}
              </g>
            );
          })}
        </svg>
        {resultaten.map((r, i) => {
          const [x, y] = punt(KNOOP_STRAAL, hoek(i, n));
          const score = r.score;
          const klasse = score === null ? null : CLASSIFICATIE_INFO[classificatie(score)].label;
          const factor = gewichtMarkering(r.bouwblok);
          const vgl = vergelijking?.[i]?.score ?? null;
          const vglKlasse = vgl === null ? null : CLASSIFICATIE_INFO[classificatie(vgl)].label;
          const sleutel = sleutelVan(r);
          const staat = staatVan(a, sleutel, r.bouwblok.id);
          const zichtbaar = a?.bouwblokId === r.bouwblok.id;
          const isFilter = !!filter && filter.actief.has(r.bouwblok.id);
          const isGekozen = !!filter && filter.gekozen === r.bouwblok.id;
          const knoopKlasse = filter
            ? `${isFilter ? "is-filter" : "is-gedimd is-inactief"} ${isGekozen ? "is-gekozen" : ""}`
            : staat === "actief"
              ? "is-actief"
              : staat === "gedimd"
                ? "is-gedimd"
                : "";
          const label = [
            `${r.bouwblok.volgnummer}, ${r.bouwblok.naam}${factor ? `, ${factor}` : ""}`,
            score === null ? "geen score" : `${formatScore(score)}${klasse ? `, ${klasse}` : ""}`,
            vgl !== null ? `${vergelijkingNaam} ${formatScore(vgl)}` : "",
          ]
            .filter(Boolean)
            .join(", ");
          const kleur = kleurVan(r);
          const dx = x - MIDDEN;
          const dy = y - MIDDEN;
          // Dichtbij de verticale as: Boven of onder het knooppunt met een pijltje. Verder weg: In de hoek van het kwadrant, zonder pijltje.
          const nabijAs = Math.abs(dx) < AS_AFSTAND;
          const tipKlasse = nabijAs
            ? `radar-tip radar-tip--${dy < 0 ? "boven" : "onder"}`
            : `radar-tip radar-tip--hoek radar-tip--${dx < 0 ? "l" : "r"}${dy < 0 ? "t" : "b"}`;
          const tipStijl = nabijAs ? { left: `${(x / MAAT) * 100}%`, top: `${(y / MAAT) * 100}%` } : undefined;
          const zet_ = () => zet({ groepKey: sleutel, bouwblokId: r.bouwblok.id });
          return (
            <span key={r.bouwblok.id}>
              <button
                type="button"
                className={`radar-knoop ${knoopKlasse}`}
                style={{
                  left: `${(x / MAAT) * 100}%`,
                  top: `${(y / MAAT) * 100}%`,
                  ["--knoop-kleur" as string]: kleur,
                  ["--knoop-tekst" as string]: tekstOpKleur(kleur),
                }}
                aria-label={label}
                aria-pressed={filter && isFilter ? isGekozen : undefined}
                aria-disabled={filter && !isFilter ? true : undefined}
                onClick={filter && isFilter ? () => filter.onKies(isGekozen ? null : r.bouwblok.id) : undefined}
                onMouseEnter={zet_}
                onMouseLeave={() => zet(null)}
                onFocus={zet_}
                onBlur={() => zet(null)}
              >
                <span aria-hidden="true">{r.bouwblok.volgnummer}</span>
              </button>
              <span className={`grafiek-tooltip ${tipKlasse} ${zichtbaar ? "is-zichtbaar" : ""}`} style={tipStijl} role="tooltip">
                <strong>
                  {r.bouwblok.volgnummer} · {r.bouwblok.naam}
                  {factor ? ` ${factor}` : ""}
                </strong>
                {vergelijking ? (
                  <>
                    <span>
                      {naam} {score === null ? "–" : formatScore(score)}
                      {klasse ? ` · ${klasse}` : ""}
                    </span>
                    <span>
                      {vergelijkingNaam} {vgl === null ? "–" : formatScore(vgl)}
                      {vglKlasse ? ` · ${vglKlasse}` : ""}
                    </span>
                  </>
                ) : (
                  (!filter || score !== null) && (
                    <span>
                      {score === null ? "–" : formatScore(score)}
                      {klasse ? ` · ${klasse}` : ""}
                    </span>
                  )
                )}
              </span>
            </span>
          );
        })}
      </div>
      <ul className="radar-legenda" aria-label="Legenda">
        {toonVlak && (
          <li>
            <svg width="28" height="4" viewBox="0 0 28 4" aria-hidden="true">
              <line x1="0" y1="2" x2="28" y2="2" stroke="var(--or)" strokeWidth="2" />
            </svg>
            {naam}
          </li>
        )}
        {vergelijking && (
          <li>
            <svg width="28" height="4" viewBox="0 0 28 4" aria-hidden="true">
              <line x1="0" y1="2" x2="28" y2="2" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            {vergelijkingNaam}
          </li>
        )}
        <li>
          <svg width="28" height="4" viewBox="0 0 28 4" aria-hidden="true">
            <line x1="0" y1="2" x2="28" y2="2" stroke="#888884" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
          Grenzen 2,5 en 3,5
        </li>
      </ul>
    </div>
  );
}
