"use client";

import { useState } from "react";
import { Assessment, Bouwblok } from "@/lib/types";
import { Sectie } from "@/components/assessment/Sectie";
import { VeldToelichtingModal } from "@/components/spanning/VeldToelichting";
import { tekstOpVeldKleur, veldKleur } from "@/lib/colors";
import { actieveBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { fmt1, veldKorteNaam } from "@/lib/spanning";

/**
 * De sectie "De 6 spanningsvelden" op de Assessment-pagina van de Spanningsmeter (`visualisatie-spanningsmeter.md`, Landingspagina en film, besloten
 * door Joost op 21 oktober 2026): Een interactieve radar met zes taartpunten van 60°, analoog aan de radar van de AI-scan (`ai-domeinenmodel-visual.md`)
 * en van Volwassenheid. Veld 1 staat bovenaan en de rest loopt met de klok mee, rechts veld 1 tot en met 3 en links veld 4 tot en met 6 als rijen.
 * Boven de radar staat de kaart met de omschrijving van het veld waar de muis of de focus op staat. Een klik opent de Toelichtingsmodal van het veld
 * (de omschrijving, de ijkpunten en de basis), dezelfde modal als bij het Info-icoon in de doorloopflow. De veelhoek heeft voorbeeldscores en is geen
 * echte score. De klassen `br-*` zijn die van de radars van Volwassenheid en de AI-scan.
 */
const MAAT = 536;
const MIDDEN = MAAT / 2;
const TAART_R = 190;
const NUMMER_R = 226;
/** Score 5 staat op 150px, score 1 in het midden: 37,5px per stap. */
const SCORE_5_R = 150;
/** De scores uit het tekstalternatief van het ontwerp (de fictieve deelnemer), als voorbeelddata en zonder claim. */
const VOORBEELD_SCORES = [3.8, 2.6, 2.2, 3.4, 2.4, 4.0];
const HOEK = (60 * Math.PI) / 180;

/** Het midden van de taartpunt van een veld: Veld 1 staat bovenaan (de taartpunt begint bij −30°). */
const hoekVan = (n: number) => -Math.PI / 2 + (n - 1) * HOEK;
const punt = (r: number, h: number) => [MIDDEN + r * Math.cos(h), MIDDEN + r * Math.sin(h)] as const;
const scoreR = (s: number) => ((s - 1) / 4) * SCORE_5_R;

function Rij({ veld, actief, zet, open }: { veld: Bouwblok; actief: number | null; zet: (n: number | null) => void; open: (v: Bouwblok) => void }) {
  const kleur = veldKleur(veld.volgnummer);
  return (
    <li style={{ ["--groep-kleur" as string]: kleur }}>
      <button
        type="button"
        className={`br-pil ${actief === veld.volgnummer ? "is-actief" : ""}`}
        title={veld.naam}
        onMouseEnter={() => zet(veld.volgnummer)}
        onMouseLeave={() => zet(null)}
        onFocus={() => zet(veld.volgnummer)}
        onBlur={() => zet(null)}
        onClick={() => open(veld)}
      >
        <span className="br-pil-nr" style={{ borderColor: kleur }} aria-hidden="true">
          {veld.volgnummer}
        </span>
        <span className="br-pil-tekst">{veldKorteNaam(veld)}</span>
      </button>
    </li>
  );
}

export function SpanningVeldenSectie({ assessment, warm = false }: { assessment: Assessment; warm?: boolean }) {
  const velden = actieveBouwblokkenMetGroep(assessment)
    .map((b) => b.bouwblok)
    .sort((a, b) => a.volgnummer - b.volgnummer);
  const [gekozen, setGekozen] = useState<Bouwblok | null>(null);
  const [actief, setActief] = useState<number | null>(null);
  const actiefVeld = velden.find((v) => v.volgnummer === actief);
  const helft = Math.ceil(velden.length / 2);
  const veelhoek = velden
    .map((v) => punt(scoreR(VOORBEELD_SCORES[v.volgnummer - 1] ?? 2.5), hoekVan(v.volgnummer)).map((x) => x.toFixed(1)).join(","))
    .join(" ");
  const wedge = HOEK / 2;

  return (
    <Sectie
      id="velden"
      warm={warm}
      kop={`De ${velden.length} spanningsvelden`}
      inleiding="Elk veld heeft vijf vragen met een eigen schaal van 1 tot 5. Klik op een veld voor de uitleg."
      kinderen={
        <>
          <div className="br-vraag" aria-live="polite">
            {actiefVeld ? (
              <>
                <span>
                  {actiefVeld.volgnummer} · {actiefVeld.naam}
                </span>
                <p>{actiefVeld.omschrijving}</p>
              </>
            ) : (
              <>
                <span>De {velden.length} spanningsvelden</span>
                <p className="br-vraag-hint">Beweeg over een veld of een nummer in de radar om de omschrijving te zien.</p>
              </>
            )}
          </div>
          <div className="br-stage">
            <ul className="br-links br-rijen" aria-label={`Spanningsveld ${helft + 1} tot en met ${velden.length}`}>
              {velden.filter((v) => v.volgnummer > helft).map((v) => (
                <Rij key={v.id} veld={v} actief={actief} zet={setActief} open={setGekozen} />
              ))}
            </ul>
            <div className="br-midden">
              <div className="br-radar">
                <svg viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-label={`Radar met de ${velden.length} spanningsvelden`} width="100%" height="100%">
                  {velden.map((v) => {
                    const h = hoekVan(v.volgnummer);
                    const [x1, y1] = punt(TAART_R, h - wedge);
                    const [x2, y2] = punt(TAART_R, h + wedge);
                    return (
                      <path
                        key={v.id}
                        d={`M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${TAART_R},${TAART_R} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
                        fill={veldKleur(v.volgnummer)}
                        fillOpacity={actief === null ? 0.22 : actief === v.volgnummer ? 0.62 : 0.1}
                        stroke="#fff"
                        strokeWidth={1.5}
                        style={{ transition: "fill-opacity 120ms" }}
                      />
                    );
                  })}
                  {[2, 3, 4, 5].map((s) => (
                    <circle key={s} cx={MIDDEN} cy={MIDDEN} r={scoreR(s)} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} />
                  ))}
                  <polygon points={veelhoek} fill="var(--or)" fillOpacity={0.18} stroke="var(--or)" strokeWidth={2} strokeLinejoin="round" />
                </svg>
                {velden.map((v) => {
                  const [x, y] = punt(NUMMER_R, hoekVan(v.volgnummer));
                  const kleur = veldKleur(v.volgnummer);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`br-nr ${actief === v.volgnummer ? "is-actief" : ""}`}
                      style={{ left: `${((x / MAAT) * 100).toFixed(2)}%`, top: `${((y / MAAT) * 100).toFixed(2)}%`, background: kleur, color: tekstOpVeldKleur(v.volgnummer) }}
                      aria-label={`${v.volgnummer}, ${v.naam}, voorbeeldscore ${fmt1(VOORBEELD_SCORES[v.volgnummer - 1] ?? 0)}`}
                      onMouseEnter={() => setActief(v.volgnummer)}
                      onMouseLeave={() => setActief(null)}
                      onFocus={() => setActief(v.volgnummer)}
                      onBlur={() => setActief(null)}
                      onClick={() => setGekozen(v)}
                    >
                      {v.volgnummer}
                    </button>
                  );
                })}
              </div>
            </div>
            <ul className="br-rechts br-rijen" aria-label={`Spanningsveld 1 tot en met ${helft}`}>
              {velden.filter((v) => v.volgnummer <= helft).map((v) => (
                <Rij key={v.id} veld={v} actief={actief} zet={setActief} open={setGekozen} />
              ))}
            </ul>
          </div>
          {gekozen && <VeldToelichtingModal assessment={assessment} veld={gekozen} open onClose={() => setGekozen(null)} />}
        </>
      }
    />
  );
}
