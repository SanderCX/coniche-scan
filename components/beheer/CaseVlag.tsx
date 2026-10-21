"use client";

import { useState } from "react";
import { Organisatie } from "@/lib/types";
import { useOrganisaties, zetCaseVlag } from "@/lib/db";
import { zichtbareCasesDieVerwijzenNaar } from "@/lib/dossier";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De Afspraak "Mag als case gebruikt worden" (`beheerpagina.md`, punt 4, Case-vlag; `dossier.md`, Rechten), alleen voor een Admin, in de kaart
 * Afspraken naast de andere twee. Staat uit bij een nieuwe en bij alle bestaande organisaties. Aanzetten kan zonder bevestiging. Uitzetten
 * gaat na een bevestiging die zegt in hoeveel Cases bij andere organisaties deze organisatie voorkomt en dat die voor de Leads verdwijnen.
 */
export function CaseVlag({ organisatie }: { organisatie: Organisatie }) {
  const [bevestigOpen, setBevestigOpen] = useState(false);
  const alle = useOrganisaties();
  const { aantal, organisaties } = zichtbareCasesDieVerwijzenNaar(organisatie.id, alle);
  const aan = organisatie.caseToegestaan === true;

  function wissel(nieuw: boolean) {
    if (nieuw) zetCaseVlag(organisatie.id, true);
    else if (aantal > 0) setBevestigOpen(true);
    else zetCaseVlag(organisatie.id, false);
  }

  return (
    <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" checked={aan} onChange={(e) => wissel(e.target.checked)} />
        Mag als case gebruikt worden
      </label>
      <InfoIcoon sleutel="info.caseVlag" />
      <BevestigModal
        open={bevestigOpen}
        titel="Niet meer als case gebruiken"
        bericht={`${organisatie.naam} komt voor in ${aantal} ${aantal === 1 ? "case" : "cases"} bij ${organisaties} ${organisaties === 1 ? "andere organisatie" : "andere organisaties"} die voor een Lead zichtbaar ${aantal === 1 ? "is" : "zijn"}. Zet je de Afspraak uit, dan ${aantal === 1 ? "verdwijnt die case" : "verdwijnen die cases"} meteen bij de Leads. ${aantal === 1 ? "De case blijft" : "De cases blijven"} bij de consultant staan met de status "Toestemming ontbreekt".`}
        bevestigLabel="Uitzetten"
        onBevestigen={() => {
          zetCaseVlag(organisatie.id, false);
          setBevestigOpen(false);
        }}
        onAnnuleren={() => setBevestigOpen(false)}
      />
    </div>
  );
}
