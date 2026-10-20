import { GroepResultaat, classificatie } from "@/lib/scoring";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO, scoreKleur } from "@/lib/colors";
import { formatGewicht, formatScore } from "@/lib/format";

/**
 * Het staafdiagram per categorie op het resultaatscherm (`stylesheet.md`, Categoriekleuren, Staafdiagram per categorie, en Radar en
 * staafdiagram op het resultaatscherm): De balken in de categoriekleur op een as van 1 tot 5, de klassegrenzen 2,5 en 3,5 als grijze
 * stippellijn en geen getal boven de balk. Het getal staat in de tooltip (naam, dan getal en klasse), bij hover en bij toetsenbordfocus op
 * de balk, die met Tab bereikbaar is en een `aria-label` heeft. Alle namen staan onder hun balk op één regel, de plot is minstens 104px
 * per categorie breed en onder 640px schermbreedte is het diagram horizontaal (`app/styles/charts.css`).
 */
export function CategorieStaafdiagram({ resultaten }: { resultaten: GroepResultaat[] }) {
  return (
    <div className="cat-chart">
      <div className="cat-plot">
        <div className="cat-as" aria-hidden="true">
          {[5, 4, 3, 2, 1].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="cat-gebied">
          <div className="cat-raster" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((p) => (
              <i key={p} className="cat-lijn" style={{ ["--q" as string]: `${p}` }} />
            ))}
            {[37.5, 62.5].map((p) => (
              <i key={p} className="cat-lijn cat-lijn--klasse" style={{ ["--q" as string]: `${p}` }} />
            ))}
          </div>
          <div className="cat-kolommen">
            {resultaten.map((r) => {
              const score = r.score;
              const naam = r.gewicht && r.gewicht !== 1 ? `${r.groepNaam} (${formatGewicht(r.gewicht)}×)` : r.groepNaam;
              const klasse = score === null ? null : CLASSIFICATIE_INFO[classificatie(score)].label;
              const kleur =
                score === null ? "#e8e6e1" : (r.kleur && CATEGORIE_COLORS[r.kleur]?.hex) || scoreKleur(score);
              const p = score === null ? 0 : ((Math.min(5, Math.max(1, score)) - 1) / 4) * 100;
              return (
                <div key={r.groepId} className="cat-item">
                  <div className="cat-spoor">
                    <button
                      type="button"
                      className="cat-balk"
                      style={{ ["--p" as string]: p, background: kleur }}
                      aria-label={`${naam}, ${score === null ? "geen score" : formatScore(score)}${klasse ? `, ${klasse}` : ""}`}
                    >
                      <span className="grafiek-tooltip" role="tooltip">
                        <strong>{naam}</strong>
                        <span>
                          {score === null ? "–" : formatScore(score)}
                          {klasse ? ` · ${klasse}` : ""}
                        </span>
                      </span>
                    </button>
                  </div>
                  <span className="cat-naam" title={r.nummers ? `${naam} · bouwblok ${r.nummers}` : naam}>
                    {naam}
                    {r.nummers && <span className="cat-nummers">{r.nummers}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="cat-uitleg">De stippellijnen bij 2,5 en 3,5 zijn de grenzen tussen Basis op Orde, Uitbouwen en Sterk punt.</p>
    </div>
  );
}
