"use client";

import { useState } from "react";
import { hernoemOrganisatie, updateOrganisatie } from "@/lib/db";
import { OverzichtModal } from "@/components/beheer/OverzichtModal";
import { InfoIcoon } from "@/components/InfoIcoon";
import { MAX_KORTE_NAAM } from "@/lib/korte-namen";

/**
 * Het potlood naast de naam in het organisatiepaneel (`beheerpagina.md`, punt 4, Naam wijzigen): Een klik opent een modal met de velden Naam en Korte naam
 * (twee velden, dus een modal volgens `stylesheet.md`, Bewerken: op de plek of in een modal), met "Annuleren" en "Opslaan". De naam is verplicht en wordt getrimd. Wie dit scherm ziet, mag de organisatie bewerken
 * (`organisaties.bewerken`: Admin alle, Consultant eigen).
 */
export function OrganisatieNaamBewerken({ organisatieId, naam, korteNaam }: { organisatieId: string; naam: string; korteNaam: string }) {
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState(naam);
  const [conceptKort, setConceptKort] = useState(korteNaam);
  const [fout, setFout] = useState<string | null>(null);

  function start() {
    setConcept(naam);
    setConceptKort(korteNaam);
    setFout(null);
    setBewerken(true);
  }

  function slaOp(e: React.FormEvent) {
    e.preventDefault();
    const r = hernoemOrganisatie(organisatieId, concept);
    if (!r.ok) {
      setFout(r.reden);
      return;
    }
    const kort = conceptKort.trim().slice(0, MAX_KORTE_NAAM);
    if (kort !== korteNaam) {
      updateOrganisatie(organisatieId, (o) => ({ ...o, korteNaam: kort || null }));
    }
    setBewerken(false);
  }

  return (
    <>
      {korteNaam && (
        <span className="text-sm text-ink-s" title="Korte naam in kolomkoppen">
          Korte naam: {korteNaam}
        </span>
      )}
      <button type="button" className="titel-potlood" aria-label="Naam bewerken" title="Naam bewerken" onClick={start}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {bewerken && (
        <OverzichtModal label="Organisatie bewerken" onSluit={() => setBewerken(false)}>
          <form onSubmit={slaOp}>
            <div className="overzicht-kop">
              <h2>Organisatie bewerken</h2>
            </div>
            <div className="admin-field" style={{ marginTop: "var(--sp-4)" }}>
              <label htmlFor="org-naam">Naam</label>
              <input id="org-naam" type="text" autoFocus required value={concept} onChange={(e) => setConcept(e.target.value)} />
              {fout && (
                <p className="overzicht-melding fout" style={{ marginTop: "0.4rem" }}>
                  {fout}
                </p>
              )}
            </div>
            <div className="admin-field">
              <label htmlFor="org-korte-naam" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                Korte naam
                <InfoIcoon sleutel="info.korteNaamOrganisatie" />
              </label>
              <input
                id="org-korte-naam"
                type="text"
                maxLength={MAX_KORTE_NAAM}
                value={conceptKort}
                onChange={(e) => setConceptKort(e.target.value)}
              />
            </div>
            <div className="btn-rij" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setBewerken(false)}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-or btn-compact">
                Opslaan
              </button>
            </div>
          </form>
        </OverzichtModal>
      )}
    </>
  );
}
