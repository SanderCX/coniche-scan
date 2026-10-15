import { Assessment } from "@/lib/types";
import { BouwblokRij, klasseVan, KLASSE_LABEL } from "@/lib/visualisatie";
import { Heatmap, HeatmapCel } from "@/lib/verkennen";
import { toon } from "@/components/visualisatie/gedeeld";

const SCHAAL = 0.9;

function celStijl(c: HeatmapCel): React.CSSProperties {
  if (c.verschil === null) return {};
  const sterkte = Math.min(1, Math.abs(c.verschil) / SCHAAL) * 0.75;
  if (c.verschil === 0) return { background: "var(--bg-mid)" };
  return {
    background: c.verschil > 0 ? `rgba(34, 91, 160, ${sterkte})` : `rgba(255, 103, 31, ${sterkte})`,
    color: sterkte > 0.45 ? "#fff" : "var(--ink)",
  };
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
}: {
  assessment: Assessment;
  rijen: BouwblokRij[];
  heatmap: Heatmap;
  minGroep: number;
  onFocus: (sleutel: string) => void;
}) {
  if (heatmap.groepen.length === 0) return <p className="admin-notice">Er zijn geen groepen om naast elkaar te zetten.</p>;
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
              <th>
                Hele pool
                <span className="vis-matrix-aantal">gemiddelde</span>
              </th>
              {heatmap.groepen.map((g) => (
                <th key={g.groep.sleutel}>
                  <button
                    type="button"
                    className="btn btn-outline btn-compact"
                    onClick={() => onFocus(g.groep.sleutel)}
                    title="Maak deze groep de focus"
                  >
                    {g.groep.naam}
                  </button>
                  <span className="vis-matrix-aantal">{g.groep.leden.length} Organisaties</span>
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
                  <td className="vis-matrix-naam">
                    <span className="text-ink-s font-bold">{r.bouwblok.volgnummer}</span> {r.bouwblok.naam}
                  </td>
                  <td className={`vis-cel ${klasse ? `vis-cel--${klasse}` : "vis-cel--leeg"}`} title={klasse ? KLASSE_LABEL[klasse] : undefined}>
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
                  <td className={`vis-cel ${klasse ? `vis-cel--${klasse}` : "vis-cel--leeg"}`}>
                    {toon(o === null ? null : Math.round(o * 10) / 10)}
                  </td>
                );
              })()}
              {heatmap.groepen.map((g) => toonCel(g.groep.sleutel, g.overall, g.teKlein, `${g.groep.naam}: ${toon(g.overall.gemiddelde)}`))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="vis-onderschrift">
        De eerste kolom is het gemiddelde van de hele pool, de andere kolommen tonen het verschil van de groep met dat gemiddelde:
        Blauw is hoger, oranje lager. De groep telt zelf mee in het gemiddelde van de pool.
      </p>
    </div>
  );
}
