"use client";

import { useState } from "react";
import { ToelichtingModal } from "@/components/ToelichtingModal";
import { Sectie } from "@/components/assessment/Sectie";
import { AiDomeinContent, aiDomeinen } from "@/data/ai-domeinen-content";
import { CATEGORIE_COLORS, domeinKleur, tekstOpKleur } from "@/lib/colors";

/**
 * De sectie "AI in klantcontact" (`CLAUDE.md`, scherm 2; `ai-domeinenmodel-visual.md`, besloten door Joost op 21 oktober 2026, ontwerp `Herontwerp-AI`):
 * Een radar met acht taartpunten (één per domein, domein 1 bovenaan en de rest met de klok mee) in het midden, links domein 5 tot en met 8 en rechts domein
 * 1 tot en met 4 als rijen, zonder groepskoppen want er is geen categorielaag. Boven de radar staat de kaart met de centrale vraag. Beweeg je (of focus je)
 * over een rij of een nummer, dan licht de taartpunt op en toont de kaart de centrale vraag van dat domein. Een klik opent de Toelichtingsmodal. Elk domein
 * heeft zijn eigen kleur (`stylesheet.md`, Domeinkleuren). De veelhoek heeft voorbeeldscores en is geen echte score.
 */
const MAAT = 536;
const MIDDEN = MAAT / 2;
const TAART_R = 190;
const NUMMER_R = 226;
/** Score 5 staat op 150px, score 1 in het midden: 37,5px per stap. */
const SCORE_5_R = 150;
/** De scores van het voorbeeld in de film van de AI-scan (`help.md`, Films, AI-scan). */
const VOORBEELD_SCORES = [2.8, 2.4, 2.0, 2.0, 2.4, 3.6, 2.2, 2.2];
const HOEK = (45 * Math.PI) / 180;

const hex = (nummer: number) => CATEGORIE_COLORS[domeinKleur(nummer)].hex;
/** Het midden van de taartpunt van een domein: Domein 1 staat bovenaan (de taartpunt begint bij −22,5°). */
const hoekVan = (n: number) => -Math.PI / 2 + (n - 1) * HOEK;
const punt = (r: number, h: number) => [MIDDEN + r * Math.cos(h), MIDDEN + r * Math.sin(h)] as const;
const scoreR = (s: number) => ((s - 1) / 4) * SCORE_5_R;

function Rij({ d, actief, zet, open }: { d: AiDomeinContent; actief: number | null; zet: (n: number | null) => void; open: (d: AiDomeinContent) => void }) {
  return (
    <li style={{ ["--groep-kleur" as string]: hex(d.nummer) }}>
      <button
        type="button"
        className={`br-pil ${actief === d.nummer ? "is-actief" : ""}`}
        onMouseEnter={() => zet(d.nummer)}
        onMouseLeave={() => zet(null)}
        onFocus={() => zet(d.nummer)}
        onBlur={() => zet(null)}
        onClick={() => open(d)}
      >
        <span className="br-pil-nr" style={{ borderColor: hex(d.nummer) }} aria-hidden="true">
          {d.nummer}
        </span>
        <span className="br-pil-tekst">{d.naam}</span>
      </button>
    </li>
  );
}

export function AiDomeinenSectie({ warm = false }: { warm?: boolean }) {
  const [gekozen, setGekozen] = useState<AiDomeinContent | null>(null);
  const [actief, setActief] = useState<number | null>(null);
  const alle = [...aiDomeinen].sort((a, b) => a.nummer - b.nummer);
  const actiefDomein = alle.find((d) => d.nummer === actief);
  const veelhoek = alle.map((d) => punt(scoreR(VOORBEELD_SCORES[d.nummer - 1] ?? 2.5), hoekVan(d.nummer)).map((v) => v.toFixed(1)).join(",")).join(" ");

  return (
    <Sectie
      warm={warm}
      id="ai"
      kop="De AI-domeinen in Klantcontact"
      inleiding="Acht domeinen beschrijven hoe volwassen een organisatie is in het inzetten van AI binnen klantcontact. Klik op een domein voor meer uitleg."
      kinderen={
        <>
          <div className="br-vraag" aria-live="polite">
            {actiefDomein ? (
              <>
                <span>
                  {actiefDomein.nummer} · {actiefDomein.naam}
                </span>
                <p>{actiefDomein.centraleVraag}</p>
              </>
            ) : (
              <>
                <span>De 8 AI-domeinen</span>
                <p className="br-vraag-hint">Beweeg over een domein of een nummer in de radar om de centrale vraag te zien.</p>
              </>
            )}
          </div>
          <div className="br-stage">
            <ul className="br-links br-rijen" aria-label="AI-domein 5 tot en met 8">
              {alle.filter((d) => d.nummer >= 5).map((d) => (
                <Rij key={d.nummer} d={d} actief={actief} zet={setActief} open={setGekozen} />
              ))}
            </ul>
            <div className="br-midden">
              <div className="br-radar">
                <svg viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-label="Radar met de 8 AI-domeinen" width="100%" height="100%">
                  {alle.map((d) => {
                    const h = hoekVan(d.nummer);
                    const [x1, y1] = punt(TAART_R, h - HOEK / 2);
                    const [x2, y2] = punt(TAART_R, h + HOEK / 2);
                    return (
                      <path
                        key={d.nummer}
                        d={`M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${TAART_R},${TAART_R} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
                        fill={hex(d.nummer)}
                        fillOpacity={actief === null ? 0.22 : actief === d.nummer ? 0.62 : 0.1}
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
                {alle.map((d) => {
                  const [x, y] = punt(NUMMER_R, hoekVan(d.nummer));
                  return (
                    <button
                      key={d.nummer}
                      type="button"
                      className={`br-nr ${actief === d.nummer ? "is-actief" : ""}`}
                      style={{ left: `${((x / MAAT) * 100).toFixed(2)}%`, top: `${((y / MAAT) * 100).toFixed(2)}%`, background: hex(d.nummer), color: tekstOpKleur(hex(d.nummer)) }}
                      aria-label={`${d.nummer}, ${d.naam}`}
                      onMouseEnter={() => setActief(d.nummer)}
                      onMouseLeave={() => setActief(null)}
                      onFocus={() => setActief(d.nummer)}
                      onBlur={() => setActief(null)}
                      onClick={() => setGekozen(d)}
                    >
                      {d.nummer}
                    </button>
                  );
                })}
              </div>
            </div>
            <ul className="br-rechts br-rijen" aria-label="AI-domein 1 tot en met 4">
              {alle.filter((d) => d.nummer <= 4).map((d) => (
                <Rij key={d.nummer} d={d} actief={actief} zet={setActief} open={setGekozen} />
              ))}
            </ul>
          </div>
          <ToelichtingModal
            open={gekozen !== null}
            onClose={() => setGekozen(null)}
            nummer={gekozen?.nummer ?? 0}
            naam={gekozen?.naam ?? ""}
            categorie="AI-domein"
            kleur={gekozen ? hex(gekozen.nummer) : null}
            centraleVraag={gekozen?.centraleVraag ?? null}
            beschrijving={gekozen?.beschrijving ?? []}
          />
        </>
      }
    />
  );
}
