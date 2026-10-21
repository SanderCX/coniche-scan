"use client";

import { useState } from "react";
import { Sectie } from "@/components/assessment/Sectie";

/**
 * De sectie Visie van de Digitale Spanningsmeter (`visualisatie-spanningsmeter.md`, Landingspagina en film): Een korte inleiding en drie kaarten met
 * "Lees verder", dat de volledige tekst op dezelfde pagina uitklapt. De teksten zijn een voorstel en komen niet uit de bron: De definitieve tekst volgt
 * uit het boek (open punt 5).
 */
const KAARTEN = [
  {
    titel: "Zes velden naast elkaar",
    kort: "Verhaal, regie, gedrag, data, processen en technologie krijgen elk een score op dezelfde schaal.",
    meer: [
      "Elk veld heeft vijf vragen en een eigen schaal van 1 tot 5, met voor elk niveau een ijkpunt uit het boek. Zo beoordeel je elk veld op dezelfde manier en kun je ze naast elkaar leggen.",
      "De Spanningsmeter heeft geen totaalscore. Het gaat niet om één cijfer, maar om het verschil tussen de velden.",
    ],
  },
  {
    titel: "Spanning is een verschil",
    kort: "Loopt het ene veld ver voor op het andere, dan ontstaat wrijving. Dat verschil wordt gemeten.",
    meer: [
      "De spanning van een veld is het verschil met het laagste veld dat eerder in de volgorde staat. Een positieve spanning betekent dat het veld voorloopt op zijn fundament, een negatieve dat het achterblijft.",
      "Technologie die ver voorloopt op processen en gedrag is een bekend voorbeeld: De techniek staat er, maar het werk eromheen is nog niet meegegroeid.",
    ],
  },
  {
    titel: "Eerst jij, dan de groep",
    kort: "Eerst zie je je eigen profiel, daarna het beeld van de groep, met ruimte voor verschillen in kijk.",
    meer: [
      "Direct na het invullen zie je je eigen Spanningsprofiel. Pas daarna worden de profielen van de groep naast elkaar gelegd, met het gemiddelde, de spreiding en per rol de verschillen.",
      "Antwoorden in een groepsweergave blijven anoniem: Je ziet nooit het profiel van één persoon, en een rol met te weinig deelnemers is niet te zien.",
    ],
  },
];

export function SpanningVisieSectie({ warm = false }: { warm?: boolean }) {
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
      id="visie"
      warm={warm}
      kop="Onze visie op digitale spanning"
      inleiding="Digitale verandering wringt vaak op de plek waar het ene veld sneller beweegt dan het andere. De Spanningsmeter maakt dat verschil zichtbaar."
      kinderen={
        <div className="ap-visie-rij">
          {KAARTEN.map((k, i) => {
            const uit = open.has(i);
            return (
              <article key={k.titel} className="ap-visie-kaart">
                <h3>{k.titel}</h3>
                <p>{k.kort}</p>
                {uit && (
                  <div id={`sp-visie-meer-${i}`} className="ap-visie-meer">
                    {k.meer.map((tekst, j) => (
                      <p key={j}>{tekst}</p>
                    ))}
                  </div>
                )}
                <button type="button" className="ap-meer" aria-expanded={uit} aria-controls={`sp-visie-meer-${i}`} onClick={() => wissel(i)}>
                  {uit ? "Minder" : "Lees verder"}
                </button>
              </article>
            );
          })}
        </div>
      }
    />
  );
}
