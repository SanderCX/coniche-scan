import { BouwblokResultaat, classificatie } from "@/lib/scoring";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { gewichtMarkering } from "@/lib/weging";

/**
 * De radar met genummerde knooppunten (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm, voorstel van 19 oktober 2026):
 * Rond de radar staat per bouwblok een cirkel van 26px met alleen het nummer, wit met een rand in de categoriekleur. De namen staan
 * in de tooltip, die bij hover en bij toetsenbordfocus verschijnt (met Tab bereikbaar, een tik op een aanraakscherm opent hem ook).
 * De score loopt van 1 in het midden tot 5 aan de rand (straal 130px), met het vlak in `--or`, taartpunten in de categoriekleur en de
 * klassegrenzen 2,5 en 3,5 als stippellijnen. Onder de radar staat één regel met de categorieën en hun nummers.
 *
 * `vergelijking`: Een tweede reeks, bijvoorbeeld de rest van de groep in een benchmark (`benchmark.md`, View per organisatie): Een
 * gestippelde lijn, en de tooltip toont beide scores. De namen geven de reeksen; zonder `vergelijking` is dit één reeks.
 */
const MAAT = 432;
const MIDDEN = MAAT / 2;
const STRAAL = 130;
const KNOOP = 26;
const KNOOP_STRAAL = STRAAL + KNOOP;
const SCHAAL_MIN = 1;
const SCHAAL_MAX = 5;

const radiaal = (score: number) => ((Math.min(SCHAAL_MAX, Math.max(SCHAAL_MIN, score)) - SCHAAL_MIN) / (SCHAAL_MAX - SCHAAL_MIN)) * STRAAL;
/** De hoek van bouwblok `i` van `n`: Bovenaan beginnen, met de klok mee. */
const hoek = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
const punt = (straal: number, h: number) => [MIDDEN + straal * Math.cos(h), MIDDEN + straal * Math.sin(h)] as const;

export function RadarChartView({
  resultaten,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Vergelijking",
}: {
  resultaten: BouwblokResultaat[];
  vergelijking?: BouwblokResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
}) {
  const n = resultaten.length;
  if (n === 0) return null;
  const stap = (2 * Math.PI) / n;
  const kleurVan = (r: BouwblokResultaat) => (r.groepKleur && CATEGORIE_COLORS[r.groepKleur]?.hex) || "var(--or)";
  const polygoon = (lijst: BouwblokResultaat[]) =>
    lijst
      .map((r, i) => punt(radiaal(r.score ?? SCHAAL_MIN), hoek(i, n)).map((v) => v.toFixed(1)).join(","))
      .join(" ");

  // De categorieën in volgorde met hun nummers ("Organisatie · 3–6"): Alleen bij een Assessment met een categorielaag.
  const groepen: { id: string; naam: string; kleur: string; van: number; tot: number }[] = [];
  for (const r of resultaten) {
    const laatste = groepen[groepen.length - 1];
    if (laatste && laatste.id === r.groepId) laatste.tot = r.bouwblok.volgnummer;
    else groepen.push({ id: r.groepId, naam: r.groepNaam ?? "", kleur: kleurVan(r), van: r.bouwblok.volgnummer, tot: r.bouwblok.volgnummer });
  }
  const metCategorieen = groepen.length < n && groepen.every((g) => g.naam);

  return (
    <div className="radar">
      <div className="radar-vlak" style={{ aspectRatio: "1 / 1" }}>
        <svg viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-label={`Radar van ${n} scores`} width="100%" height="100%">
          {/* Taartpunten in de categoriekleur (9%) met witte scheidslijnen tussen de bouwblokken. */}
          {resultaten.map((r, i) => {
            const h = hoek(i, n);
            const [x1, y1] = punt(STRAAL, h - stap / 2);
            const [x2, y2] = punt(STRAAL, h + stap / 2);
            return (
              <path
                key={r.bouwblok.id}
                d={`M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${STRAAL},${STRAAL} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
                fill={kleurVan(r)}
                fillOpacity={0.09}
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
            <circle key={s} cx={MIDDEN} cy={MIDDEN} r={radiaal(s)} fill="none" stroke="#9a978f" strokeWidth={1} strokeDasharray="4 4" />
          ))}
          {vergelijking && (
            <polygon points={polygoon(vergelijking)} fill="#4d4d49" fillOpacity={0.12} stroke="#4d4d49" strokeWidth={2} strokeDasharray="4 3" />
          )}
          <polygon points={polygoon(resultaten)} fill="var(--or)" fillOpacity={0.18} stroke="var(--or)" strokeWidth={2} strokeLinejoin="round" />
        </svg>
        {resultaten.map((r, i) => {
          const [x, y] = punt(KNOOP_STRAAL, hoek(i, n));
          const score = r.score;
          const klasse = score === null ? null : CLASSIFICATIE_INFO[classificatie(score)].label;
          const factor = gewichtMarkering(r.bouwblok);
          const vgl = vergelijking?.[i]?.score ?? null;
          const rechts = x > MIDDEN;
          const label = [
            `${r.bouwblok.volgnummer}, ${r.bouwblok.naam}${factor ? `, ${factor}` : ""}`,
            score === null ? "geen score" : `${formatScore(score)}${klasse ? `, ${klasse}` : ""}`,
            vgl !== null ? `${vergelijkingNaam} ${formatScore(vgl)}` : "",
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <button
              key={r.bouwblok.id}
              type="button"
              className={`radar-knoop ${rechts ? "radar-knoop--rechts" : "radar-knoop--links"}`}
              style={{
                left: `${(x / MAAT) * 100}%`,
                top: `${(y / MAAT) * 100}%`,
                ["--knoop-kleur" as string]: kleurVan(r),
                ["--knoop-tekst" as string]: kleurVan(r) === CATEGORIE_COLORS.antraciet.hex ? "var(--ink)" : "#fff",
              }}
              aria-label={label}
            >
              <span aria-hidden="true">{r.bouwblok.volgnummer}</span>
              <span className="grafiek-tooltip" role="tooltip">
                <strong>
                  {r.bouwblok.volgnummer} · {r.bouwblok.naam}
                  {factor ? ` ${factor}` : ""}
                </strong>
                {vergelijking ? (
                  <>
                    <span>
                      {naam} {score === null ? "–" : formatScore(score)}
                    </span>
                    <span>
                      {vergelijkingNaam} {vgl === null ? "–" : formatScore(vgl)}
                    </span>
                  </>
                ) : (
                  <span>
                    {score === null ? "–" : formatScore(score)}
                    {klasse ? ` · ${klasse}` : ""}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {metCategorieen && (
        <p className="radar-categorieen">
          {groepen.map((g) => (
            <span key={g.id}>
              <i style={{ background: g.kleur }} aria-hidden="true" />
              {g.naam} · {g.van === g.tot ? g.van : `${g.van}–${g.tot}`}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
