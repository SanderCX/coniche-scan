"use client";

import { useState } from "react";
import { Assessment, Bouwblok } from "@/lib/types";
import { Sectie } from "@/components/assessment/Sectie";
import { VeldToelichtingModal } from "@/components/spanning/VeldToelichting";
import { tekstOpVeldKleur, veldKleur } from "@/lib/colors";
import { actieveBouwblokkenMetGroep } from "@/lib/assessment-structuur";

/**
 * De sectie "De 6 spanningsvelden" op de Assessment-pagina van de Digitale Spanningsmeter (`visualisatie-spanningsmeter.md`, Landingspagina en film,
 * ontwerp `Landing`): Een inleiding en zes kaarten in drie kolommen. Elke kaart is een knop met het nummer in een bolletje in de veldkleur, de naam
 * en de omschrijving, en opent de Toelichtingsmodal van het veld (de omschrijving, de ijkpunten en de basis). Er is geen interactieve radar, anders
 * dan bij de bouwblokken van Volwassenheid.
 */
export function SpanningVeldenSectie({ assessment, warm = false }: { assessment: Assessment; warm?: boolean }) {
  const velden = actieveBouwblokkenMetGroep(assessment).map((b) => b.bouwblok);
  const [open, setOpen] = useState<Bouwblok | null>(null);
  return (
    <Sectie
      id="velden"
      warm={warm}
      kop={`De ${velden.length} spanningsvelden`}
      inleiding="Elk veld heeft vijf vragen met een eigen schaal van 1 tot 5. Klik op een veld voor de uitleg."
      kinderen={
        <>
          <div className="sp-velden">
            {velden.map((veld) => (
              <button key={veld.id} type="button" className="sp-veld-kaart" aria-haspopup="dialog" onClick={() => setOpen(veld)}>
                <span className="sp-veld-nr" style={{ background: veldKleur(veld.volgnummer), color: tekstOpVeldKleur(veld.volgnummer) }}>
                  {veld.volgnummer}
                </span>
                <strong>{veld.naam}</strong>
                <span>{veld.omschrijving}</span>
              </button>
            ))}
          </div>
          {open && <VeldToelichtingModal assessment={assessment} veld={open} open onClose={() => setOpen(null)} />}
        </>
      }
    />
  );
}
