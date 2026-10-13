"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { InfoIcoon } from "@/components/InfoIcoon";
import { updateGebruiker } from "@/lib/gebruikers-store";
import { logAudit } from "@/lib/audit-store";
import { magEigenAccountBewerken } from "@/lib/rechten";
import { ROL_KLEUR } from "@/lib/colors";
import { Gebruiker } from "@/lib/types";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";

/**
 * "Mijn account" (`beheerpagina.md`, Accountmenu): Een modal volgens het patroon van "Mijn gegevens" aan de
 * respondentkant, voor Admin en Consultant. Hier wijzigt een gebruiker zijn eigen naam. E-mailadres en rol zijn
 * alleen-lezen: Het e-mailadres is de inlognaam, een rol wijzigt alleen een Admin bij Gebruikers (punt 9).
 *
 * Wachtwoord wijzigen hoort bij de echte inlog met gehashte wachtwoorden (`backlog.md`, Fase 2) en komt daarmee. De knop
 * staat er al, uitgeschakeld, met de reden in een Info-icoon.
 *
 * Opslaan schrijft direct, zonder aparte bevestigingsstap, sluit de modal en toont een korte bevestiging. Gelogd als
 * `gebruiker.eigenGegevensGewijzigd`, met alleen welke velden zijn gewijzigd (`datamodel.md`, Audit).
 */
export function MijnAccountModal({ gebruiker, open, onSluit }: { gebruiker: Gebruiker; open: boolean; onSluit: () => void }) {
  const [naam, setNaam] = useState(gebruiker.naam);
  const mag = magEigenAccountBewerken(gebruiker, gebruiker.id);
  const gewijzigd = naam.trim() !== gebruiker.naam;

  function slaOp(e: React.FormEvent) {
    e.preventDefault();
    if (!mag || !gewijzigd) return;
    updateGebruiker(gebruiker.id, (g) => ({ ...g, naam: naam.trim() }));
    logAudit({
      actie: "gebruiker.eigenGegevensGewijzigd",
      entiteitType: "gebruiker",
      entiteitId: gebruiker.id,
      details: { velden: ["naam"] },
    });
    onSluit();
    zetBeheerMelding({ tekst: "Je gegevens zijn opgeslagen." });
  }

  function sluit() {
    setNaam(gebruiker.naam);
    onSluit();
  }

  return (
    <Modal open={open} onClose={sluit} title="Mijn account">
      <form onSubmit={slaOp} className="text-left">
        <div className="field">
          <label>Naam</label>
          <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} required />
        </div>
        <div className="field">
          <label>E-mailadres</label>
          <input type="email" value={gebruiker.email} readOnly />
        </div>
        <div className="field">
          <label>Rol</label>
          <input type="text" value={ROL_KLEUR[gebruiker.rol].label} readOnly />
        </div>
        <div className="flex items-center gap-2" style={{ marginBottom: "1.4rem" }}>
          <button type="button" className="btn btn-outline btn-compact" disabled>
            Wachtwoord wijzigen
          </button>
          <InfoIcoon naastVeld sleutel="info.mijnAccountWachtwoord" />
        </div>
        <div className="btn-rij">
          <button type="button" className="btn btn-outline" onClick={sluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or" disabled={!mag || !gewijzigd}>
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  );
}
