"use client";

import { useState } from "react";
import { Sectie } from "@/components/assessment/Sectie";
import {
  verbetercyclus,
  visieIntro,
  visieSecties,
  watIsGoedIntro,
  watIsGoedKlantcontact,
  watIsGoedKlantcontactSlot,
} from "@/data/visie-content";

/**
 * De sectie Visie (`CLAUDE.md`, scherm 2, Herontwerp; bron `visie-coniche.md`, deel 1): Een inleiding en drie kaarten naast elkaar, elk met een
 * korte tekst en "Lees verder", dat de volledige tekst op dezelfde pagina uitklapt. De korte tekst is de eerste alinea. De kaart "Wat is goed
 * klantcontact?" uit het oorspronkelijke stuk staat eronder, omdat het ontwerp er geen plek voor heeft (open punt, `CLAUDE.md`, sectie 5).
 */
export function VisieSectie({ warm = false }: { warm?: boolean }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const wissel = (i: number) =>
    setOpen((huidig) => {
      const nieuw = new Set(huidig);
      if (nieuw.has(i)) nieuw.delete(i);
      else nieuw.add(i);
      return nieuw;
    });

  return (
    <Sectie
      warm={warm}
      id="visie"
      kop="Onze visie op goed klantcontact"
      inleiding={visieIntro}
      kinderen={
        <>
          <div className="ap-visie-rij">
            {visieSecties.map((sectie, i) => {
              const uit = open.has(i);
              const rest = sectie.alineas.slice(1);
              return (
                <article key={sectie.titel} className="ap-visie-kaart">
                  <h3>{sectie.titel}</h3>
                  <p>{sectie.alineas[0]}</p>
                  {uit && (
                    <div id={`visie-meer-${i}`} className="ap-visie-meer">
                      {rest.map((tekst, j) => (
                        <p key={j}>{tekst}</p>
                      ))}
                      {i === 2 && (
                        <ol className="ap-cyclus" aria-label="De verbetercyclus">
                          {verbetercyclus.map((stap, n) => (
                            <li key={stap}>
                              <span>{n + 1}</span>
                              {stap}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                  {(rest.length > 0 || i === 2) && (
                    <button type="button" className="ap-meer" aria-expanded={uit} aria-controls={`visie-meer-${i}`} onClick={() => wissel(i)}>
                      {uit ? "Minder" : "Lees verder"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          <div className="ap-goed">
            <h3>Wat is goed klantcontact?</h3>
            <p>{watIsGoedIntro}</p>
            <ul>
              {watIsGoedKlantcontact.map((punt) => (
                <li key={punt}>
                  <span aria-hidden="true">✓</span>
                  {punt}
                </li>
              ))}
            </ul>
            <p>{watIsGoedKlantcontactSlot}</p>
          </div>
        </>
      }
    />
  );
}
