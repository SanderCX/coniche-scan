import { Assessment } from "@/lib/types";
import { BouwblokRij, klasseVan, KLASSE_LABEL } from "@/lib/visualisatie";
import { Heatmap, HeatmapCel } from "@/lib/verkennen";
import { toon } from "@/components/visualisatie/gedeeld";

/** Een verschil van 1,0 of meer krijgt de volle 35% dekking (`stylesheet.md`, Verschil en afwijking): Nooit harder dan een score. */
const MAX_DEKKING = 0.35;

function celStijl(c: HeatmapCel): React.CSSProperties {
  if (c.verschil === null) return {};
  if (c.verschil === 0) return { background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" };
  const dekking = Math.min(1, Math.abs(c.verschil) / 1) * MAX_DEKKING;
  return {
    background: c.verschil > 0 ? `rgba(34, 91, 160, ${dekking})` : `rgba(194, 87, 12, ${dekking})`,
    color: "var(--ink)",
  };
}

/** De celtint van een score (`stylesheet.md`, Drie niveaus van scorekleur): De vijf stappen, afgerond half-away-from-zero. */
function scoreCel(score: number | null): React.CSSProperties {
  if (score === null) return {};
  const stap = Math.min(5, Math.max(1, Math.round(Math.round(score * 10) / 10)));
  return { background: `var(--score-${stap}-cel)`, color: `var(--score-${stap}-cel-tekst)` };
}

const verschilTekst = (v: number) => (Math.abs(v) < 0.05 ? "0,0" : `${v > 0 ? "+" : "−"}${toon(Math.abs(v))}`);

/**
 * Weergave 3, Alle groepen naast elkaar (`visualisatie-verkennen.md`, 3): Een heatmap met de bouwblokken als rijen. De eerste
 * kolom is de hele pool met het gemiddelde in de klassekleuren, de andere kolommen het verschil van de groep met dat gemiddelde:
 * Blauw boven, oranje onder, met een sterkte die meegroeit tot een verschil van 0,9. Een groep met te weinig Organisaties is grijs
 * met "n<". Een klik op een kolomkop maakt die groep de focus.
 */
export function WeergaveHeatmap({
  assessment,
  rijen,
  heatmap,
  minGroep,
  onFocus,
  hint,
}: {
  assessment: Assessment;
  rijen: BouwblokRij[];
  heatmap: Heatmap;
  minGroep: number;
  onFocus: (sleutel: string) => void;
  /** Zonder groepering staat er alleen de kolom Hele pool, met deze hint eronder (`visualisatie-verkennen.md`, Zonder groepering). */
  hint?: string;
}) {
  const toonCel = (sleutel: string, c: HeatmapCel, teKlein: boolean, titel: string) =>
    teKlein ? (
      <td key={sleutel} className="vk-heat vk-heat--klein" title="Te weinig Organisaties in de groep">
        n&lt;{minGroep}
      </td>
    ) : (
      <td key={sleutel} className="vk-heat" style={celStijl(c)} title={titel}>
        {c.verschil === null ? "–" : verschilTekst(c.verschil)}
      </td>
    );
  return (
    <div className="vis" data-weergave="verkennen-heatmap">
      <div style={{ overflowX: "auto" }}>
        <table className="vis-matrix">
          <thead>
            <tr>
              <th className="vis-matrix-naam">{assessment.bouwblokLabel}</th>
              <th className="vis-kolomkop">
                <span className="vis-kolomkop-naam">Hele pool</span>
                <span className="vis-kolomkop-sub">gemiddelde</span>
              </th>
              {heatmap.groepen.map((g) => (
                <th key={g.groep.sleutel} className="vis-kolomkop" title={`${g.groep.volledigeNaam ?? g.groep.naam}: ${g.groep.leden.length} Organisaties. Klik om deze groep de focus te maken.`}>
                  <button type="button" className="vis-kolomkop-knop" onClick={() => onFocus(g.groep.sleutel)}>
                    {g.groep.naam}
                  </button>
                  <span className="vis-kolomkop-sub">n = {g.groep.leden.length}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rijen.map((r, i) => {
              const gem = heatmap.pool.gemiddelde[i];
              const klasse = klasseVan(gem);
              return (
                <tr key={r.bouwblok.id}>
                  <td className="vis-matrix-naam" title={r.bouwblok.naam}>
                    <span className="text-ink-s font-bold">{r.bouwblok.volgnummer}</span> {r.bouwblok.naam}
                  </td>
                  <td className="vis-cel" style={scoreCel(gem)} title={klasse ? KLASSE_LABEL[klasse] : undefined}>
                    {toon(gem === null ? null : Math.round(gem * 10) / 10)}
                  </td>
                  {heatmap.groepen.map((g) =>
                    toonCel(
                      g.groep.sleutel,
                      g.cellen[i],
                      g.teKlein,
                      `${g.groep.naam}: ${toon(g.cellen[i].gemiddelde)} · hele pool: ${toon(gem === null ? null : Math.round(gem * 10) / 10)}`
                    )
                  )}
                </tr>
              );
            })}
            <tr className="vis-matrix-totaal">
              <td className="vis-matrix-naam font-bold">Overall</td>
              {(() => {
                const o = heatmap.pool.overall;
                const klasse = klasseVan(o);
                return (
                  <td className="vis-cel" style={scoreCel(o)} title={klasse ? KLASSE_LABEL[klasse] : undefined}>
                    {toon(o === null ? null : Math.round(o * 10) / 10)}
                  </td>
                );
              })()}
              {heatmap.groepen.map((g) => toonCel(g.groep.sleutel, g.overall, g.teKlein, `${g.groep.naam}: ${toon(g.overall.gemiddelde)}`))}
            </tr>
          </tbody>
        </table>
      </div>
      {hint && <p className="vk-reden">{hint}</p>}
      <p className="vis-onderschrift">
        De eerste kolom is het gemiddelde van de hele pool, de andere kolommen tonen het verschil van de groep met dat gemiddelde:
        Blauw is hoger, donkeroranje lager. De groep telt zelf mee in het gemiddelde van de pool.
      </p>
    </div>
  );
}
