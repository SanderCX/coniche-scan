"use client";

import { useState } from "react";
import { RespondentFunctieKeuze } from "./RespondentFunctieKeuze";

/**
 * De 4 velden van het intakeformulier (naam, rol/functie, team, notities),
 * losgetrokken zodat "Mijn gegevens" → "Gegevens bekijken/bewerken"
 * (CLAUDE.md sectie 3) hetzelfde formulier hergebruikt in plaats van een
 * nieuwe versie te bouwen. Geen eigen `<form>`/submit-knop hier: de
 * intakepagina en de Mijn-gegevens-modal hebben elk hun eigen omringende
 * formulier (met/zonder toestemmingsvakje, ander opslaggedrag).
 *
 * "Rol / functie" is een keuzelijst met "Anders…" (`content-respondentrol.md`) en komt via een verborgen veld
 * `functie` in de `FormData`, net als de andere velden.
 */
export function RespondentGegevensVelden({
  naam,
  functie,
  team,
  notities,
}: {
  naam: string | null;
  functie: string;
  team: string;
  notities: string;
}) {
  const [functieWaarde, setFunctieWaarde] = useState(functie);
  return (
    <>
      <div className="field">
        <label>Naam</label>
        <input type="text" name="naam" required defaultValue={naam ?? ""} />
      </div>
      <div className="field">
        <label>Rol / functie</label>
        <RespondentFunctieKeuze name="functie" required waarde={functieWaarde} onChange={setFunctieWaarde} />
      </div>
      <div className="field">
        <label>
          Team <span className="font-normal text-ink-s">(optioneel)</span>
        </label>
        <input type="text" name="team" defaultValue={team} />
      </div>
      <div className="field">
        <label>
          Notities <span className="font-normal text-ink-s">(optioneel)</span>
        </label>
        <textarea name="notities" rows={3} defaultValue={notities} />
      </div>
    </>
  );
}
