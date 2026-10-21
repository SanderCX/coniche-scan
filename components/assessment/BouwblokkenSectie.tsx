"use client";

import { useState } from "react";
import { ToelichtingModal } from "@/components/ToelichtingModal";
import { Sectie } from "@/components/assessment/Sectie";
import { BouwsteenContent, bouwstenenGroepen } from "@/data/bouwstenen-content";
import { CATEGORIE_COLORS, tekstOpKleur } from "@/lib/colors";

/**
 * De sectie "De 15 bouwblokken" (`CLAUDE.md`, scherm 2; `bouwstenenmodel-visual.md`, Herontwerp van 21 oktober 2026: Radar met bouwblokken): Een
 * radar met 15 taartpunten (één per bouwblok, vanaf boven met de klok mee) in het midden, links de groepen Mens en Fundament, rechts Overkoepelend en
 * Organisatie en onder de radar Proces & Tech. Beweeg je (of focus je) over een pil of een nummer in de radar, dan licht die taartpunt op en staat de
 * centrale vraag in een kaart boven de radar. Een klik opent de Toelichtingsmodal. De veelhoek heeft voorbeeldscores en is geen echte score.
 */
const MAAT = 536;
const MIDDEN = MAAT / 2;
const TAART_R = 190;
const NUMMER_R = 226;
/** Score 5 staat op 150px, score 1 in het midden. */
const SCORE_5_R = 150;
const VOORBEELD_SCORES = [2.8, 2.6, 3.1, 2.3, 3.4, 3.0, 2.9, 3.5, 3.2, 3.6, 3.9, 3.7, 3.6, 3.6, 2.3];
const HOEK = (24 * Math.PI) / 180;

interface Blok extends BouwsteenContent {
  groepNaam: string;
  kleur: string;
}

const ALLE: Blok[] = bouwstenenGroepen
  .flatMap((g) => g.bouwstenen.map((b) => ({ ...b, groepNaam: g.naam, kleur: CATEGORIE_COLORS[g.kleur].hex })))
  .sort((a, b) => a.nummer - b.nummer);

const hoekVan = (n: number) => -Math.PI / 2 + (n - 1) * HOEK;
const punt = (r: number, h: number) => [MIDDEN + r * Math.cos(h), MIDDEN + r * Math.sin(h)] as const;
const scoreR = (s: number) => ((s - 1) / 4) * SCORE_5_R;

function Groep({ naam, actief, zet, open }: { naam: string; actief: number | null; zet: (n: number | null) => void; open: (b: Blok) => void }) {
  const blokken = ALLE.filter((b) => b.groepNaam === naam);
  const kleur = blokken[0]?.kleur ?? "var(--or)";
  return (
    <div className="br-groep" style={{ ["--groep-kleur" as string]: kleur }}>
      <h3>{naam}</h3>
      <ul>
        {blokken.map((b) => (
          <li key={b.nummer}>
            <button
              type="button"
              className={`br-pil ${actief === b.nummer ? "is-actief" : ""}`}
              onMouseEnter={() => zet(b.nummer)}
              onMouseLeave={() => zet(null)}
              onFocus={() => zet(b.nummer)}
              onBlur={() => zet(null)}
              onClick={() => open(b)}
            >
              <span className="br-pil-nr" style={{ borderColor: kleur }} aria-hidden="true">
                {b.nummer}
              </span>
              <span className="br-pil-tekst">{b.naam}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BouwblokkenSectie({ warm = false }: { warm?: boolean }) {
  const [gekozen, setGekozen] = useState<Blok | null>(null);
  const [actief, setActief] = useState<number | null>(null);
  const actiefBlok = ALLE.find((b) => b.nummer === actief);
  const stap = HOEK;
  const veelhoek = ALLE.map((b) => punt(scoreR(VOORBEELD_SCORES[b.nummer - 1]), hoekVan(b.nummer)).map((v) => v.toFixed(1)).join(",")).join(" ");

  return (
    <Sectie
      warm={warm}
      id="bouwblokken"
      kop="De Bouwstenen van Klantcontact"
      inleiding="Vijftien bouwstenen, verdeeld over vijf groepen, beschrijven de voorwaarden voor goed klantcontact. Klik op een bouwsteen voor de beschrijving en de centrale vraag."
      kinderen={
        <>
          <div className="br-vraag" aria-live="polite">
            {actiefBlok ? (
              <>
                <span>
                  {actiefBlok.nummer} · {actiefBlok.naam}
                </span>
                <p>{actiefBlok.centraleVraag}</p>
              </>
            ) : (
              <>
                <span>De 15 bouwblokken</span>
                <p className="br-vraag-hint">Beweeg over een bouwblok of een nummer in de radar om de centrale vraag te zien.</p>
              </>
            )}
          </div>
          <div className="br-stage">
            <div className="br-links">
              <Groep naam="Mens" actief={actief} zet={setActief} open={setGekozen} />
              <Groep naam="Fundament" actief={actief} zet={setActief} open={setGekozen} />
            </div>
            <div className="br-midden">
              <div className="br-radar">
                <svg viewBox={`0 0 ${MAAT} ${MAAT}`} role="img" aria-label="Radar met de 15 bouwblokken" width="100%" height="100%">
                  {ALLE.map((b) => {
                    const h = hoekVan(b.nummer);
                    const [x1, y1] = punt(TAART_R, h - stap / 2);
                    const [x2, y2] = punt(TAART_R, h + stap / 2);
                    return (
                      <path
                        key={b.nummer}
                        d={`M${MIDDEN},${MIDDEN} L${x1.toFixed(1)},${y1.toFixed(1)} A${TAART_R},${TAART_R} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
                        fill={b.kleur}
                        fillOpacity={actief === null ? 0.22 : actief === b.nummer ? 0.62 : 0.1}
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
                {ALLE.map((b) => {
                  const [x, y] = punt(NUMMER_R, hoekVan(b.nummer));
                  return (
                    <button
                      key={b.nummer}
                      type="button"
                      className={`br-nr ${actief === b.nummer ? "is-actief" : ""}`}
                      style={{ left: `${((x / MAAT) * 100).toFixed(2)}%`, top: `${((y / MAAT) * 100).toFixed(2)}%`, background: b.kleur, color: tekstOpKleur(b.kleur) }}
                      aria-label={`${b.nummer}, ${b.naam}`}
                      onMouseEnter={() => setActief(b.nummer)}
                      onMouseLeave={() => setActief(null)}
                      onFocus={() => setActief(b.nummer)}
                      onBlur={() => setActief(null)}
                      onClick={() => setGekozen(b)}
                    >
                      {b.nummer}
                    </button>
                  );
                })}
              </div>
              <Groep naam="Proces & Tech" actief={actief} zet={setActief} open={setGekozen} />
            </div>
            <div className="br-rechts">
              <Groep naam="Overkoepelend" actief={actief} zet={setActief} open={setGekozen} />
              <Groep naam="Organisatie" actief={actief} zet={setActief} open={setGekozen} />
            </div>
          </div>
          <ToelichtingModal
            open={gekozen !== null}
            onClose={() => setGekozen(null)}
            nummer={gekozen?.nummer ?? 0}
            naam={gekozen?.naam ?? ""}
            categorie={gekozen?.groepNaam ?? null}
            kleur={gekozen?.kleur ?? null}
            centraleVraag={gekozen?.centraleVraag ?? null}
            beschrijving={gekozen?.beschrijving ?? []}
          />
        </>
      }
    />
  );
}
