"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Sectie } from "@/components/assessment/Sectie";
import { BouwsteenContent, bouwstenenGroepen } from "@/data/bouwstenen-content";
import { CATEGORIE_COLORS, lijnKleur, tekstOpKleur } from "@/lib/colors";

interface Geselecteerd {
  bouwsteen: BouwsteenContent;
  groepNaam: string;
  kleur: string;
}

/**
 * De sectie "De 15 bouwblokken" (`CLAUDE.md`, scherm 2, Herontwerp; `bouwstenenmodel-visual.md`): De vijf categorieën als kolommen naast elkaar,
 * met de bouwblokken als pillen met een nummercirkel in de categoriekleur. Een klik opent de Toelichtingsmodal met de centrale vraag en de
 * beschrijving (`visie-coniche.md`, deel 2).
 */
export function BouwblokkenSectie() {
  const [gekozen, setGekozen] = useState<Geselecteerd | null>(null);
  return (
    <Sectie
      id="bouwblokken"
      kop="De Bouwstenen van Klantcontact"
      inleiding="Vijftien bouwstenen, verdeeld over vijf groepen, beschrijven de voorwaarden voor goed klantcontact. Klik op een bouwsteen voor de beschrijving en de centrale vraag."
      kinderen={
        <>
          <div className="ap-kolommen">
            {bouwstenenGroepen.map((groep) => {
              const kleur = CATEGORIE_COLORS[groep.kleur].hex;
              return (
                <div key={groep.naam} className="ap-kolom" style={{ ["--kolom-kleur" as string]: kleur }}>
                  <h3>{groep.naam}</h3>
                  <ul>
                    {groep.bouwstenen.map((b) => (
                      <li key={b.nummer}>
                        <button
                          type="button"
                          className={`ap-pil ${gekozen?.bouwsteen.nummer === b.nummer ? "is-gekozen" : ""}`}
                          onClick={() => setGekozen({ bouwsteen: b, groepNaam: groep.naam, kleur })}
                        >
                          <span className="ap-cirkel" style={{ background: kleur, color: tekstOpKleur(kleur) }} aria-hidden="true">
                            {b.nummer}
                          </span>
                          <span>{b.naam}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <Modal
            open={gekozen !== null}
            onClose={() => setGekozen(null)}
            title={gekozen?.bouwsteen.naam ?? ""}
            eyebrow={gekozen ? `${gekozen.groepNaam.toUpperCase()} · BOUWSTEEN ${gekozen.bouwsteen.nummer}` : undefined}
            accentColor={gekozen?.kleur}
          >
            {gekozen && (
              <>
                <div style={{ borderLeft: `3px solid ${gekozen.kleur}`, paddingLeft: "0.9rem", margin: "0 0 1.2rem" }}>
                  <p className="text-xs font-bold" style={{ color: lijnKleur(gekozen.kleur), letterSpacing: "0.08em", marginBottom: "0.2rem" }}>
                    CENTRALE VRAAG
                  </p>
                  <p style={{ color: "var(--ink)", fontWeight: 600 }}>{gekozen.bouwsteen.centraleVraag}</p>
                </div>
                {gekozen.bouwsteen.beschrijving.map((tekst, i) => (
                  <p key={i}>{tekst}</p>
                ))}
              </>
            )}
          </Modal>
        </>
      }
    />
  );
}
