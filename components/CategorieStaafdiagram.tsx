"use client";

import { GroepResultaat, classificatie } from "@/lib/scoring";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO, scoreKleur } from "@/lib/colors";
import { formatGewicht, formatScore } from "@/lib/format";
import { GrafiekActief, ZetActief, staatVan, useGrafiekActief } from "@/lib/grafiek-actief";

/**
 * Het staafdiagram per categorie op het resultaatscherm (`stylesheet.md`, Categoriekleuren, Staafdiagram per categorie, en Radar en
 * staafdiagram op het resultaatscherm): De balken in de categoriekleur op een as van 1 tot 5, de klassegrenzen 2,5 en 3,5 als grijze
 * stippellijn en geen getal boven de balk. Het getal staat in de tooltip (naam, dan getal en klasse), bij hover en bij toetsenbordfocus op
 * de balk, die met Tab bereikbaar is en een `aria-label` heeft. De legenda onder de radar legt de stippellijnen uit. Alle namen staan onder hun balk op
 * één regel, de plot is minstens 104px per categorie breed en onder 640px schermbreedte is het diagram horizontaal (`app/styles/charts.css`).
 *
 * Hover of focus op een balk laat de radar ernaast oplichten, en andersom (`lib/grafiek-actief.ts`): De balk van de actieve categorie krijgt
 * een ring van 3px in de categoriekleur (30%), de andere balken en hun labels dimmen, en de naam en de nummers van de categorie worden vet
 * (`stylesheet.md`, Uitlijning en nadruk). De namen en nummers staan gecentreerd onder hun balk of balkgroep, de getallen op de as staan rechts
 * uitgelijnd en hebben allemaal dezelfde kleur.
 *
 * Met `vergelijking` (een tweede reeks, de rest van de groep in een benchmark, `benchmark.md`) staan er twee balken per categorie: De organisatie in
 * de categoriekleur en de rest van de groep in `#b8b5ad`. Beide lichten samen op, de tooltip toont beide waarden met het verschil, en de klassenamen
 * (Sterk punt, Uitbouwen, Basis op Orde) staan in een kolom rechts van de plot, binnen de kaart. Het diagram scrolt nooit (`stylesheet.md`, Radar en
 * staafdiagram op elke plek, zonder scroll): De plot verdeelt de breedte van de kaart en wordt horizontaal als de kaart te smal is.
 */
export function CategorieStaafdiagram({
  resultaten,
  vergelijking,
  naam: reeksNaam = "Score",
  vergelijkingNaam = "Rest van de groep",
  actief,
  onActief,
}: {
  resultaten: GroepResultaat[];
  /** Een tweede reeks, in dezelfde volgorde als `resultaten`. */
  vergelijking?: GroepResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
  /** De actieve staat van de ouder, zodat de radar en het staafdiagram elkaar oplichten. Zonder: Een eigen staat. */
  actief?: GrafiekActief | null;
  onActief?: ZetActief;
}) {
  const { actief: a, zet } = useGrafiekActief({ actief, onActief });
  const dubbel = !!vergelijking;
  const plek = (score: number | null) => (score === null ? 0 : ((Math.min(5, Math.max(1, score)) - 1) / 4) * 100);
  return (
    <div className={`cat-chart ${dubbel ? "cat-chart--dubbel" : ""}`}>
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
              const staat = staatVan(a, r.groepId, "");
              if (dubbel) {
                const groepScore = vergelijking?.find((v) => v.groepId === r.groepId)?.score ?? null;
                const verschil = score === null || groepScore === null ? null : score - groepScore;
                return (
                  <div key={r.groepId} className={`cat-item ${staat === "actief" ? "is-actief" : staat === "gedimd" ? "is-gedimd" : ""}`}>
                    <div className="cat-spoor">
                      <button
                        type="button"
                        className="cat-balk cat-balk--dubbel"
                        style={{ ["--balk-ring" as string]: `${kleur}4d`, ["--hoogste" as string]: Math.max(p, plek(groepScore)) }}
                        aria-label={`${naam}, ${reeksNaam} ${score === null ? "geen score" : formatScore(score)}${klasse ? `, ${klasse}` : ""}, ${vergelijkingNaam} ${groepScore === null ? "geen score" : formatScore(groepScore)}`}
                        onMouseEnter={() => zet({ groepKey: r.groepId, bron: "diagram" })}
                        onMouseLeave={() => zet(null)}
                        onFocus={() => zet({ groepKey: r.groepId, bron: "diagram" })}
                        onBlur={() => zet(null)}
                      >
                        <span className="cat-staaf" style={{ ["--p" as string]: p, background: kleur }} />
                        <span className="cat-staaf cat-staaf--groep" style={{ ["--p" as string]: plek(groepScore) }} />
                        <span className="grafiek-tooltip" role="tooltip">
                          <strong>{naam}</strong>
                          <span>
                            {reeksNaam} {score === null ? "–" : formatScore(score)}
                            {klasse ? ` · ${klasse}` : ""}
                          </span>
                          <span>
                            {vergelijkingNaam} {groepScore === null ? "–" : formatScore(groepScore)}
                          </span>
                          {verschil !== null && <span>Verschil {verschil > 0 ? "+" : verschil < 0 ? "−" : ""}{formatScore(Math.abs(verschil))}</span>}
                        </span>
                      </button>
                    </div>
                    <span className="cat-naam" title={r.nummers ? `${naam} · bouwblok ${r.nummers}` : naam}>
                      {naam}
                      {r.nummers && <span className="cat-nummers">{r.nummers}</span>}
                    </span>
                  </div>
                );
              }
              return (
                <div key={r.groepId} className={`cat-item ${staat === "actief" ? "is-actief" : staat === "gedimd" ? "is-gedimd" : ""}`}>
                  <div className="cat-spoor">
                    <button
                      type="button"
                      className="cat-balk"
                      style={{ ["--p" as string]: p, ["--balk-ring" as string]: `${kleur}4d`, background: kleur }}
                      aria-label={`${naam}, ${score === null ? "geen score" : formatScore(score)}${klasse ? `, ${klasse}` : ""}`}
                      onMouseEnter={() => zet({ groepKey: r.groepId, bron: "diagram" })}
                      onMouseLeave={() => zet(null)}
                      onFocus={() => zet({ groepKey: r.groepId, bron: "diagram" })}
                      onBlur={() => zet(null)}
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
        {dubbel && (
          <div className="cat-klassen" aria-hidden="true">
            {[
              { naam: "Sterk punt", q: 4.25 },
              { naam: "Uitbouwen", q: 3 },
              { naam: "Basis op Orde", q: 1.75 },
            ].map((k) => (
              <span key={k.naam} style={{ bottom: `${plek(k.q)}%` }}>
                {k.naam}
              </span>
            ))}
          </div>
        )}
      </div>
      {dubbel && (
        <ul className="dk-legenda" aria-label="Legenda">
          <li>
            <span className="dk-blokje" style={{ background: "linear-gradient(90deg, #ff671f, #225ba0, #392944, #197f4e, #ffc043)" }} aria-hidden="true" />
            {reeksNaam}, de kleur van de categorie
          </li>
          <li>
            <span className="dk-blokje" style={{ background: "#b8b5ad" }} aria-hidden="true" />
            {vergelijkingNaam}
          </li>
        </ul>
      )}
    </div>
  );
}
