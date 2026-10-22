"use client";

import { useState } from "react";
import { Assessment } from "@/lib/types";
import { useInstellingen } from "@/lib/instellingen-store";
import { grensTekst } from "@/lib/spreiding-grenzen";
import { RijSpreiding, SpreidingWeergave, Vorm, sorteerOpSpreiding, stapelStappen } from "@/lib/visualisatie";
import { EENHEID_SCAN, EenheidTeksten, Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";


/**
 * Weergave B, "Spreiding" en "Positie in de Meting" (`visualisatie-scores.md`, B): Per bouwblok een stip per scan op de
 * bouwblokscore, een streep op het gemiddelde en bij een scan-view een oranje ring op de score van die scan. Rechts het
 * gemiddelde en een label voor de spreiding. De stippen zijn grijs, niet te onderscheiden en hebben geen naam, geen
 * tooltip en geen klikgedrag (`Privacy`). De vergelijkgroep van een scan-view is alle andere scans.
 */
export function WeergaveSpreiding({
  assessment,
  weergave,
  eenheid = EENHEID_SCAN,
  vormVan,
}: {
  assessment: Assessment;
  weergave: SpreidingWeergave;
  /** De eenheid van een stip: Een scan, een onderdeel of een organisatie (`visualisatie-scores.md`, I en J). */
  eenheid?: EenheidTeksten;
  /** Bij Naast elkaar de vorm van een stip, naar het id van de eenheid (`eenheidScanId`). Zonder dit zijn het grijze cirkels. */
  vormVan?: (id: string) => Vorm | undefined;
}) {
  const [opSpreiding, setOpSpreiding] = useState(false);
  const { spreidingWisselend, spreidingVerdeeld } = useInstellingen();
  const metFocus = weergave.aantalOnderGemiddelde !== null;
  const rijen: RijSpreiding[] = opSpreiding ? sorteerOpSpreiding(weergave.rijen) : weergave.rijen;
  // Gesorteerd op spreiding vervalt het groepslabel: Rijen uit verschillende groepen staan door elkaar.
  const assessmentVoorRij: Assessment = opSpreiding ? { ...assessment, categorieen: null } : assessment;
  const groepen = vorigeGroepen(rijen);
  return (
    <div className="vis" data-weergave="spreiding">
      <Tegels
        tegels={[
          { label: eenheid.telLabel, waarde: String(weergave.aantalScans), sub: eenheid.telSub },
          {
            label: "Meest verdeeld",
            waarde: weergave.meestVerdeeld ? toon(weergave.meestVerdeeld.sd, 2) : "–",
            sub: weergave.meestVerdeeld?.naam,
          },
          {
            label: "Meest eensgezind",
            waarde: weergave.meestEensgezind ? toon(weergave.meestEensgezind.sd, 2) : "–",
            sub: weergave.meestEensgezind?.naam,
          },
          // Alleen bij een scan-view een vierde tegel (`visualisatie-scores.md`, B, Tegels).
          ...(metFocus
            ? [{ label: "Onder het gemiddelde", waarde: String(weergave.aantalOnderGemiddelde), sub: "bouwstenen, tegenover de anderen" }]
            : []),
        ]}
      />
      <label className="vis-sorteer" style={{ marginBottom: "0.6rem" }}>
        <input type="checkbox" checked={opSpreiding} onChange={(e) => setOpSpreiding(e.target.checked)} />
        Sorteer op spreiding
      </label>
      <Schaalkop rechts="Gemiddelde en spreiding" />
      {rijen.map((r, i) => {
        const leeg = r.scores.length === 0 && r.focusScore === null;
        return (
          <Rij
            key={r.rij.bouwblok.id}
            rij={r.rij}
            vorigeGroepId={opSpreiding ? null : groepen[i]}
            assessment={assessmentVoorRij}
            leeg={leeg}
            rechts={
              r.gemiddelde !== null && (
                <>
                  <span className="vis-getal">{toon(r.gemiddelde)}</span>
                  {r.label && <span className={`vis-label ${r.label === "Verdeeld" ? "vis-label--vol" : ""}`}>{r.label}</span>}
                </>
              )
            }
          >
            {stapelStappen(r.punten.map((p) => p.score)).map((stap, k) => {
              const p = r.punten[k];
              const vorm = vormVan?.(p.id);
              return (
                <span
                  key={p.id}
                  className={`vis-stip vis-stip--spreiding ${vorm ? `vis-stip--groot vis-vorm--${vorm}` : ""}`}
                  aria-hidden="true"
                  style={{ left: `${pct(p.score)}%`, top: `calc(50% + ${stap * 0.55}rem)` }}
                />
              );
            })}
            {r.gemiddelde !== null && <span className="vis-streep" style={{ left: `${pct(r.gemiddelde)}%` }} />}
            {r.focusScore !== null && (
              <span className="vis-stip vis-stip--focus" style={{ left: `${pct(r.focusScore)}%` }} aria-label={`Deze scan: ${toon(r.focusScore)}`} />
            )}
          </Rij>
        );
      })}
      <p className="vis-onderschrift">
        {vormVan ? `Elke grijze vorm is één ${eenheid.enkelvoud}` : `Elke grijze stip is één ${eenheid.enkelvoud}`}{metFocus ? `, de oranje ring is ${eenheid.enkelvoud === "afgeronde scan" ? "deze scan" : "deze " + eenheid.enkelvoud}` : ""}. De streep is het gemiddelde
        {metFocus ? " van de anderen" : ""}. Eensgezind: standaardafwijking onder {grensTekst(spreidingWisselend)}, Wisselend tot {grensTekst(spreidingVerdeeld)}, Verdeeld daarboven.
      </p>
    </div>
  );
}
