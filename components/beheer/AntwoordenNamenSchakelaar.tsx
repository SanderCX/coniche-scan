"use client";

import { useState } from "react";
import { Organisatie } from "@/lib/types";
import { zetAntwoordenMetNamen } from "@/lib/db";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De schakelaar "Namen tonen bij Antwoorden" (`beheerpagina.md`, punt 4 en punt 6a, Namen bij Antwoorden), alleen voor een
 * Admin, op het organisatie-detail naast de Benchmark-vlag. Staat uit bij een nieuwe organisatie. Aanzetten gaat na een bevestiging
 * die zegt dat de Leads van deze organisatie dan namen zien, uitzetten kan zonder bevestiging. Wijzigen wordt gelogd. De
 * afstemming met de opdrachtgever legt de app niet vast bij de respondent: De intake en het toestemmingsvakje veranderen niet.
 */
export function AntwoordenNamenSchakelaar({ organisatie }: { organisatie: Organisatie }) {
  const [bevestigOpen, setBevestigOpen] = useState(false);
  const aan = organisatie.antwoordenMetNamen === true;

  return (
    <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          checked={aan}
          onChange={(e) => (e.target.checked ? setBevestigOpen(true) : zetAntwoordenMetNamen(organisatie.id, false))}
        />
        Namen tonen bij Antwoorden
      </label>
      <InfoIcoon sleutel="info.antwoordenMetNamen" />
      <BevestigModal
        open={bevestigOpen}
        titel="Namen tonen bij Antwoorden"
        bericht={`De Leads van ${organisatie.naam} zien bij Antwoorden dan de namen van de respondenten, in plaats van R1 tot en met Rn. Stem dit af met de opdrachtgever. Dit wordt gelogd.`}
        bevestigLabel="Namen tonen"
        onBevestigen={() => {
          zetAntwoordenMetNamen(organisatie.id, true);
          setBevestigOpen(false);
        }}
        onAnnuleren={() => setBevestigOpen(false)}
      />
    </div>
  );
}
