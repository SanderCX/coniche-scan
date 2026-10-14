"use client";

import { useState } from "react";
import { voegLeadToe } from "@/lib/db";
import { Organisatie, OrganisatieLid } from "@/lib/types";
import { normaliseerEmail } from "@/lib/email";

const NIEUW = "__nieuw__";

/**
 * Het formulier "Lead toevoegen" (`beheerpagina.md`, punt 6a): Twee keuzes, een bestaande Respondent van deze organisatie
 * (keuzelijst) of een nieuwe (naam en e-mailadres). Opslaan geeft de Respondent de Lead-rol. Een nieuwe Respondent krijgt meteen
 * een persoonlijke link zonder `ScanInvulling`. De rij komt in het Leads-venster zonder vinkjes: Wat de Lead ziet, vink je daar aan.
 */
export function LeadToevoegenFormulier({
  organisatie,
  onToegevoegd,
  onAnnuleren,
}: {
  organisatie: Organisatie;
  onToegevoegd: (lid: OrganisatieLid) => void;
  onAnnuleren?: () => void;
}) {
  const kandidaten = organisatie.leden.filter((l) => l.lead !== true);
  const [keuze, setKeuze] = useState(kandidaten.length > 0 ? kandidaten[0].id : NIEUW);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const nieuw = keuze === NIEUW;
  const kanOpslaan = nieuw ? email.trim() !== "" : kandidaten.some((l) => l.id === keuze);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kanOpslaan) return;
    setFout(null);
    if (nieuw) {
      const bestaand = organisatie.leden.find((l) => l.email === normaliseerEmail(email));
      if (bestaand?.lead === true) return setFout("Deze Respondent is al Lead.");
    }
    const lid = voegLeadToe(organisatie.id, nieuw ? { naam, email } : { respondentId: keuze });
    if (lid) onToegevoegd(lid);
    else setFout("Toevoegen is niet gelukt.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" style={{ maxWidth: "28rem" }}>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>Respondent</label>
        <select value={keuze} onChange={(e) => setKeuze(e.target.value)}>
          {kandidaten.map((l) => (
            <option key={l.id} value={l.id}>
              {l.naam || l.email}
            </option>
          ))}
          <option value={NIEUW}>Nieuwe Respondent</option>
        </select>
      </div>
      {nieuw && (
        <>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>Naam</label>
            <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>E-mailadres</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </>
      )}
      {fout && <p className="overzicht-melding fout">{fout}</p>}
      <div className="btn-rij" style={{ marginTop: "0.4rem" }}>
        {onAnnuleren && (
          <button type="button" className="btn btn-outline btn-compact" onClick={onAnnuleren}>
            Annuleren
          </button>
        )}
        <button type="submit" className="btn btn-or btn-compact" disabled={!kanOpslaan}>
          Opslaan
        </button>
      </div>
    </form>
  );
}
