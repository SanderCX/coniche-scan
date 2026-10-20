"use client";

import { GroepResultaat, classificatie } from "@/lib/scoring";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO, DOMEIN_KLEUREN } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { GrafiekActief, ZetActief, staatVan, useGrafiekActief } from "@/lib/grafiek-actief";

/**
 * Het staande kolomdiagram per domein (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm, Domeinen, besloten door Joost op 20 oktober
 * 2026): Voor een Assessment zonder categorielaag, zoals de AI-scan. Een kolom per domein in de volgorde 1 tot en met 8 (niet op score
 * gesorteerd) met twee balken van 26px: Links de Organisatie in de domeinkleur, rechts de rest van de groep in `#b8b5ad` (alleen met een
 * vergelijking). De plot is 300px hoog en nooit breder dan de kaart. Onder elke kolom staat een cirkel van 24px met het nummer van het domein, de
 * namen staan in een sleutel eronder (twee kolommen van vier, op één regel) en daaronder staat een legenda. Hover of focus op een kolom, cirkel
 * of sleutelregel laat de radar ernaast en deze kolom oplichten, en dimt de rest (`lib/grafiek-actief.ts`).
 */
const SCHAAL_MIN = 1;
const SCHAAL_MAX = 5;
const plek = (score: number) => ((Math.min(SCHAAL_MAX, Math.max(SCHAAL_MIN, score)) - SCHAAL_MIN) / (SCHAAL_MAX - SCHAAL_MIN)) * 100;

export function DomeinKolommen({
  resultaten,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Rest van de groep",
  actief,
  onActief,
}: {
  resultaten: GroepResultaat[];
  vergelijking?: GroepResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
  actief?: GrafiekActief | null;
  onActief?: ZetActief;
}) {
  const { actief: a, zet } = useGrafiekActief({ actief, onActief });
  // De volgorde van de domeinen, niet op score (`Assessment.scoresPerGroepGesorteerd` geldt niet voor deze kaart).
  const rijen = [...resultaten].sort((x, y) => Number(x.nummers ?? 0) - Number(y.nummers ?? 0));
  const kleurVan = (r: GroepResultaat) => (r.kleur && CATEGORIE_COLORS[r.kleur]?.hex) || "#ff671f";
  const groepScore = (r: GroepResultaat) => vergelijking?.find((v) => v.groepId === r.groepId)?.score ?? null;
  const metGroep = !!vergelijking;
  const zetRij = (r: GroepResultaat) => () => zet({ groepKey: r.groepId, bouwblokId: r.groepId });
  const wis = () => zet(null);
  const staat = (r: GroepResultaat) => staatVan(a, r.groepId, r.groepId);

  return (
    <div className="dk">
      <div className="dk-plot">
        <div className="dk-as" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((t) => (
            <span key={t} style={{ bottom: `${plek(t)}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="dk-gebied">
          <div className="dk-raster" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((t) => (
              <i key={t} style={{ ["--q" as string]: plek(t) }} />
            ))}
            {[2.5, 3.5].map((t) => (
              <i key={t} className="dk-lijn--klasse" style={{ ["--q" as string]: plek(t) }} />
            ))}
          </div>
          <div className="dk-kolommen">
            {rijen.map((r, i) => {
              const score = r.score;
              const gs = groepScore(r);
              const klasse = score === null ? null : CLASSIFICATIE_INFO[classificatie(score)].label;
              const hoogste = Math.max(score === null ? 0 : plek(score), gs === null ? 0 : plek(gs));
              const st = staat(r);
              return (
                <button
                  key={r.groepId}
                  type="button"
                  className={`dk-kolom ${i === 0 ? "dk-kolom--eerste" : ""} ${i === rijen.length - 1 ? "dk-kolom--laatste" : ""} ${st === "actief" ? "is-actief" : st === "gedimd" ? "is-gedimd" : ""}`}
                  style={{ ["--hoogste" as string]: hoogste }}
                  aria-label={`${r.nummers ?? ""}, ${r.groepNaam}, ${score === null ? "geen score" : formatScore(score)}${klasse ? `, ${klasse}` : ""}${gs !== null ? `, ${vergelijkingNaam} ${formatScore(gs)}` : ""}`}
                  onMouseEnter={zetRij(r)}
                  onMouseLeave={wis}
                  onFocus={zetRij(r)}
                  onBlur={wis}
                >
                  <span className="dk-staaf" style={{ ["--p" as string]: score === null ? 0 : plek(score), background: kleurVan(r) }} />
                  {metGroep && <span className="dk-staaf dk-staaf--groep" style={{ ["--p" as string]: gs === null ? 0 : plek(gs) }} />}
                  <span className="grafiek-tooltip" role="tooltip">
                    <strong>
                      {r.nummers} · {r.groepNaam}
                    </strong>
                    <span>
                      {metGroep ? `${naam} ` : ""}
                      {score === null ? "–" : formatScore(score)}
                      {klasse ? ` · ${klasse}` : ""}
                    </span>
                    {metGroep && (
                      <span>
                        {vergelijkingNaam} {gs === null ? "–" : formatScore(gs)}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="dk-nummers" aria-hidden="true">
        <span />
        <div className="dk-nr-rij">
          {rijen.map((r) => (
            <span key={r.groepId} className="dk-nr-cel" onMouseEnter={zetRij(r)} onMouseLeave={wis}>
              <span className="dk-nr" style={{ ["--domein-kleur" as string]: kleurVan(r) }}>
                {r.nummers}
              </span>
            </span>
          ))}
        </div>
      </div>
      <ul className="dk-sleutel" aria-label="Domeinen">
        {rijen.map((r) => (
          <li key={r.groepId} className={staat(r) === "gedimd" ? "is-gedimd" : ""} onMouseEnter={zetRij(r)} onMouseLeave={wis}>
            <span className="dk-nr" style={{ ["--domein-kleur" as string]: kleurVan(r) }} aria-hidden="true">
              {r.nummers}
            </span>
            <span>{r.groepNaam}</span>
          </li>
        ))}
      </ul>
      <ul className="dk-legenda" aria-label="Legenda">
        <li>
          <span
            className="dk-blokje"
            style={{ background: `linear-gradient(90deg, ${DOMEIN_KLEUREN.map((k) => CATEGORIE_COLORS[k].hex).join(", ")})` }}
            aria-hidden="true"
          />
          {naam}, de kleur van het domein
        </li>
        {metGroep && (
          <li>
            <span className="dk-blokje" style={{ background: "#b8b5ad" }} aria-hidden="true" />
            {vergelijkingNaam}
          </li>
        )}
      </ul>
    </div>
  );
}
