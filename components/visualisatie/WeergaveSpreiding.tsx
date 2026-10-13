"use client";

import { useState } from "react";
import { Assessment } from "@/lib/types";
import { RijSpreiding, SpreidingWeergave, sorteerOpSpreiding } from "@/lib/visualisatie";
import { Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";

/**
 * Scans met dezelfde score staan onder elkaar gestapeld, in het midden van de rij uitgelijnd: Bij n scans op dezelfde score
 * staat de k-de op `(k − (n − 1) / 2)` stapjes van het midden.
 */
function gestapeld(scores: number[]): { score: number; stap: number }[] {
  const aantal = new Map<string, number>();
  for (const s of scores) aantal.set(s.toFixed(3), (aantal.get(s.toFixed(3)) ?? 0) + 1);
  const geteld = new Map<string, number>();
  return scores.map((score) => {
    const sleutel = score.toFixed(3);
    const k = geteld.get(sleutel) ?? 0;
    geteld.set(sleutel, k + 1);
    return { score, stap: k - ((aantal.get(sleutel) ?? 1) - 1) / 2 };
  });
}

/**
 * Weergave B, "Spreiding" en "Positie in de Meting" (`visualisatie-scores.md`, B): Per bouwblok een stip per scan op de
 * bouwblokscore, een streep op het gemiddelde en bij een scan-view een oranje ring op de score van die scan. Rechts het
 * gemiddelde en een label voor de spreiding. De stippen zijn grijs, niet te onderscheiden en hebben geen naam, geen
 * tooltip en geen klikgedrag (`Privacy`). De vergelijkgroep van een scan-view is alle andere scans.
 */
export function WeergaveSpreiding({
  assessment,
  weergave,
}: {
  assessment: Assessment;
  weergave: SpreidingWeergave;
}) {
  const [opSpreiding, setOpSpreiding] = useState(false);
  const metFocus = weergave.aantalOnderGemiddelde !== null;
  const rijen: RijSpreiding[] = opSpreiding ? sorteerOpSpreiding(weergave.rijen) : weergave.rijen;
  // Gesorteerd op spreiding vervalt het groepslabel: Rijen uit verschillende groepen staan door elkaar.
  const assessmentVoorRij: Assessment = opSpreiding ? { ...assessment, categorieen: null } : assessment;
  const groepen = vorigeGroepen(rijen);
  return (
    <div className="vis" data-weergave="spreiding">
      <Tegels
        tegels={[
          { label: "Respondenten", waarde: String(weergave.aantalScans), sub: "afgeronde scans" },
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
            ? [{ label: "Onder het gemiddelde", waarde: String(weergave.aantalOnderGemiddelde), sub: "bouwblokken, tegenover de anderen" }]
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
            {gestapeld(r.scores).map((p, k) => (
              <span
                key={k}
                className="vis-stip vis-stip--spreiding"
                aria-hidden="true"
                style={{ left: `${pct(p.score)}%`, top: `calc(50% + ${p.stap * 0.55}rem)` }}
              />
            ))}
            {r.gemiddelde !== null && <span className="vis-streep" style={{ left: `${pct(r.gemiddelde)}%` }} />}
            {r.focusScore !== null && (
              <span className="vis-stip vis-stip--focus" style={{ left: `${pct(r.focusScore)}%` }} aria-label={`Deze scan: ${toon(r.focusScore)}`} />
            )}
          </Rij>
        );
      })}
      <p className="vis-onderschrift">
        Elke grijze stip is één scan{metFocus ? ", de oranje ring is deze scan" : ""}. De streep is het gemiddelde
        {metFocus ? " van de anderen" : ""}. Eensgezind: standaardafwijking onder 0,55, Wisselend tot 0,8, Verdeeld daarboven.
      </p>
    </div>
  );
}
