"use client";

import { useState } from "react";
import { ToelichtingModal } from "@/components/ToelichtingModal";
import { Sectie } from "@/components/assessment/Sectie";
import { AiDomeinContent, aiDomeinen } from "@/data/ai-domeinen-content";
import { CATEGORIE_COLORS, tekstOpKleur } from "@/lib/colors";
import { domeinKleur } from "@/lib/colors";

/**
 * De sectie "AI in klantcontact" (`CLAUDE.md`, scherm 2, Herontwerp; `ai-domeinenmodel-visual.md`): De acht domeinen als kaarten in een raster van
 * vier kolommen, met een nummercirkel in de domeinkleur (`stylesheet.md`, Domeinkleuren) en de naam. Een klik opent de Toelichtingsmodal.
 */
export function AiDomeinenSectie() {
  const [gekozen, setGekozen] = useState<AiDomeinContent | null>(null);
  const hex = (nummer: number) => CATEGORIE_COLORS[domeinKleur(nummer)].hex;
  return (
    <Sectie
      id="ai"
      kop="De AI-domeinen in Klantcontact"
      inleiding="Acht domeinen beschrijven hoe volwassen een organisatie is in het inzetten van AI binnen klantcontact. Klik op een domein voor meer uitleg."
      kinderen={
        <>
          <div className="ap-domeinen">
            {aiDomeinen.map((d) => (
              <button key={d.nummer} type="button" className={`ap-domein ${gekozen?.nummer === d.nummer ? "is-gekozen" : ""}`} onClick={() => setGekozen(d)}>
                <span className="ap-cirkel ap-cirkel--groot" style={{ background: hex(d.nummer), color: tekstOpKleur(hex(d.nummer)) }} aria-hidden="true">
                  {d.nummer}
                </span>
                <span>{d.naam}</span>
              </button>
            ))}
          </div>
          <ToelichtingModal
            open={gekozen !== null}
            onClose={() => setGekozen(null)}
            nummer={gekozen?.nummer ?? 0}
            naam={gekozen?.naam ?? ""}
            categorie={null}
            kleur={null}
            centraleVraag={gekozen?.centraleVraag ?? null}
            beschrijving={gekozen?.beschrijving ?? []}
          />
        </>
      }
    />
  );
}
