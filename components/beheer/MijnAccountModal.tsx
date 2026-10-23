"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { InfoIcoon } from "@/components/InfoIcoon";
import { updateGebruiker } from "@/lib/gebruikers-store";
import { logAudit } from "@/lib/audit-store";
import { magEigenAccountBewerken } from "@/lib/rechten";
import { ROL_KLEUR } from "@/lib/colors";
import { Gebruiker } from "@/lib/types";
import type { AdviesProfiel } from "@/lib/types";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";
import { ROLTEKST_MAX } from "@/lib/advies-catalogus-store";
import { OVER_MIJ_MAX, ROL_NAAM_MAX, nieuweProfielRol, slaProfielOp, useAdviesProfiel, verwijderProfielRol } from "@/lib/advies-profiel";
import type { MijnAccountTab } from "@/lib/mijn-account-open";

/**
 * "Mijn account" (`beheerpagina.md`, Accountmenu): Een modal volgens het patroon van "Mijn gegevens" aan de
 * respondentkant, voor Admin en Consultant. Hier wijzigt een gebruiker zijn eigen naam. E-mailadres en rol zijn
 * alleen-lezen: Het e-mailadres is de inlognaam, een rol wijzigt alleen een Admin bij Gebruikers (punt 9).
 *
 * Twee tabs in een pilgroep: Gegevens en Adviescontext (`adviesverloop.md`, Adviescontext in Mijn account). Annuleren en Opslaan onderaan gelden voor beide.
 * De adviescontext is persoonlijk en komt niet in het audit-log.
 *
 * Wachtwoord wijzigen hoort bij de echte inlog met gehashte wachtwoorden (`backlog.md`, Fase 2) en komt daarmee. De knop
 * staat er al, uitgeschakeld, met de reden in een Info-icoon.
 *
 * Opslaan schrijft direct, zonder aparte bevestigingsstap, sluit de modal en toont een korte bevestiging. Gelogd als
 * `gebruiker.eigenGegevensGewijzigd`, met alleen welke velden zijn gewijzigd (`datamodel.md`, Audit).
 */
export function MijnAccountModal({
  gebruiker,
  open,
  onSluit,
  beginTab = "gegevens",
}: {
  gebruiker: Gebruiker;
  open: boolean;
  onSluit: () => void;
  beginTab?: MijnAccountTab;
}) {
  const [tab, setTab] = useState<MijnAccountTab>(beginTab);
  const [naam, setNaam] = useState(gebruiker.naam);
  const opgeslagen = useAdviesProfiel(gebruiker.id);
  const [profiel, setProfiel] = useState<AdviesProfiel>(opgeslagen);
  const [fout, setFout] = useState<string | null>(null);
  const mag = magEigenAccountBewerken(gebruiker, gebruiker.id);
  const naamGewijzigd = naam.trim() !== gebruiker.naam;
  const profielGewijzigd = JSON.stringify(profiel) !== JSON.stringify(opgeslagen);

  function slaOp(e: React.FormEvent) {
    e.preventDefault();
    if (!mag || (!naamGewijzigd && !profielGewijzigd)) return;
    if (profielGewijzigd) {
      const r = slaProfielOp(gebruiker.id, profiel);
      if (!r.ok) {
        setTab("adviescontext");
        return setFout(r.reden);
      }
    }
    if (naamGewijzigd) {
      updateGebruiker(gebruiker.id, (g) => ({ ...g, naam: naam.trim() }));
      logAudit({
        actie: "gebruiker.eigenGegevensGewijzigd",
        entiteitType: "gebruiker",
        entiteitId: gebruiker.id,
        details: { velden: ["naam"] },
      });
    }
    onSluit();
    zetBeheerMelding({ tekst: "Je gegevens zijn opgeslagen." });
  }

  function sluit() {
    setNaam(gebruiker.naam);
    onSluit();
  }

  const wijzigRol = (id: string, patch: Partial<AdviesProfiel["rollen"][number]>) =>
    setProfiel({ ...profiel, rollen: profiel.rollen.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  return (
    <Modal open={open} onClose={sluit} title="Mijn account">
      <form onSubmit={slaOp} className="text-left">
        <p className="text-sm text-ink-m" style={{ margin: "0 0 var(--sp-3)" }}>
          Je gegevens en de context die je in een adviesverloop gebruikt.
        </p>
        <div className="pil-groep" role="group" aria-label="Onderdelen van Mijn account" style={{ marginBottom: "var(--sp-4)" }}>
          <button type="button" className={tab === "gegevens" ? "actief" : ""} aria-pressed={tab === "gegevens"} onClick={() => setTab("gegevens")}>
            Gegevens
          </button>
          <button type="button" className={tab === "adviescontext" ? "actief" : ""} aria-pressed={tab === "adviescontext"} onClick={() => setTab("adviescontext")}>
            Adviescontext
          </button>
        </div>

        {tab === "gegevens" ? (
          <>
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
          </>
        ) : (
          <div className="adviescontext" style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: "var(--sp-2)" }}>
            <div className="field">
              <label htmlFor="over-mij" className="titel-rij">
                Over mij
                <InfoIcoon naastVeld sleutel="info.adviescontextOverMij" />
              </label>
              <textarea id="over-mij" rows={4} maxLength={OVER_MIJ_MAX} value={profiel.overMij} onChange={(e) => setProfiel({ ...profiel, overMij: e.target.value })} />
              <span className="text-xs text-ink-s">
                {profiel.overMij.length} van {OVER_MIJ_MAX} tekens
              </span>
            </div>
            <div className="titel-rij" style={{ margin: "var(--sp-4) 0 var(--sp-2)" }}>
              <strong>Mijn rollen bij een klant</strong>
              <InfoIcoon naastVeld sleutel="info.adviescontextRollen" />
            </div>
            {profiel.rollen.map((r) => (
              <div key={r.id} className="adv-rol-blok">
                <div className="field">
                  <label htmlFor={`rol-naam-${r.id}`}>Naam van de rol</label>
                  <input id={`rol-naam-${r.id}`} type="text" maxLength={ROL_NAAM_MAX} value={r.naam} onChange={(e) => wijzigRol(r.id, { naam: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor={`rol-tekst-${r.id}`}>Tekst van de rol</label>
                  <textarea id={`rol-tekst-${r.id}`} rows={4} maxLength={ROLTEKST_MAX} value={r.tekst} onChange={(e) => wijzigRol(r.id, { tekst: e.target.value })} />
                  <span className="text-xs text-ink-s">
                    {r.tekst.length} van {ROLTEKST_MAX} tekens
                  </span>
                </div>
                <div className="adv-acties">
                  {r.id === profiel.standaardRolId ? (
                    <span className="adv-chip">Standaard</span>
                  ) : (
                    <button type="button" className="btn btn-outline btn-compact" onClick={() => setProfiel({ ...profiel, standaardRolId: r.id })}>
                      Standaard maken
                    </button>
                  )}
                  {profiel.rollen.length > 1 && (
                    <button type="button" className="btn btn-outline btn-compact" onClick={() => setProfiel(verwijderProfielRol(profiel, r.id))}>
                      Verwijderen
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-compact" onClick={() => setProfiel({ ...profiel, rollen: [...profiel.rollen, nieuweProfielRol()] })}>
              Rol toevoegen
            </button>
          </div>
        )}
        {fout && (
          <p className="admin-notice" role="alert" style={{ marginTop: "var(--sp-3)" }}>
            {fout}
          </p>
        )}
        <p className="text-xs text-ink-s" style={{ margin: "var(--sp-3) 0" }}>
          Alleen jij ziet deze gegevens en teksten.
        </p>
        <div className="btn-rij">
          <button type="button" className="btn btn-outline" onClick={sluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or" disabled={!mag || (!naamGewijzigd && !profielGewijzigd)}>
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  );
}
