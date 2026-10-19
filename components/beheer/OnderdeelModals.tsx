"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { hernoemOnderdeel, maakOnderdeel, verwijderGevolgenOnderdeel, verwijderOnderdeel } from "@/lib/db";
import { ONDERDEEL_NAAM_MAX } from "@/lib/onderdelen";
import { Onderdeel, Organisatie } from "@/lib/types";

/**
 * "+ Onderdeel toevoegen" in het KPI-blok (`beheerpagina.md`, punt 4, KPI's): Een basismodal met het veld Naam, "Annuleren" en
 * "Opslaan". De regels van een Onderdeel gelden (`datamodel.md`, Onderdeel): Verplicht, getrimd, uniek zonder verschil tussen
 * hoofdletters en kleine letters, en "Hele organisatie" is gereserveerd. Een naam die al bestaat, kiest dat Onderdeel.
 */
export function OnderdeelToevoegenModal({ organisatie, onSluit }: { organisatie: Organisatie; onSluit: () => void }) {
  const [naam, setNaam] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = maakOnderdeel(organisatie.id, naam);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  return (
    <Modal open onClose={onSluit} title="Onderdeel toevoegen">
      <form onSubmit={opslaan}>
        <div className="admin-field">
          <label htmlFor="onderdeel-nieuw-naam">Naam</label>
          <input
            id="onderdeel-nieuw-naam"
            type="text"
            autoFocus
            maxLength={ONDERDEEL_NAAM_MAX}
            value={naam}
            aria-invalid={fout ? true : undefined}
            onChange={(e) => {
              setNaam(e.target.value);
              setFout(null);
            }}
          />
          {fout && (
            <span className="text-xs" style={{ color: "var(--stat-red)" }} role="alert">
              {fout}
            </span>
          )}
        </div>
        <div className="btn-rij" style={{ maxWidth: "22rem" }}>
          <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
            Annuleren
          </button>
          <button type="submit" className="btn btn-or btn-compact">
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Het potlood bij een Onderdeel in de kolomkop (`beheerpagina.md`, punt 4, KPI's): Een basismodal met de naam, "Verwijderen"
 * (`.btn-danger`, uitgeschakeld zolang er Metingen zijn, met de reden), "Annuleren" en "Opslaan". Hernoemen verandert de naam op één plek:
 * De kolomkop, de Metingen en de naam van elke Meting volgen. Verwijderen neemt de KPI-waarden van het Onderdeel mee, en de
 * bevestiging noemt hoeveel.
 */
export function OnderdeelWijzigenModal({ organisatie, onderdeel, onSluit }: { organisatie: Organisatie; onderdeel: Onderdeel; onSluit: () => void }) {
  const [naam, setNaam] = useState(onderdeel.naam);
  const [fout, setFout] = useState<string | null>(null);
  const [bevestig, setBevestig] = useState(false);
  const gevolgen = verwijderGevolgenOnderdeel(organisatie.id, onderdeel.id);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    const r = hernoemOnderdeel(organisatie.id, onderdeel.id, naam);
    if (!r.ok) return setFout(r.reden);
    onSluit();
  }

  function verwijder() {
    const r = verwijderOnderdeel(organisatie.id, onderdeel.id);
    if (!r.ok) {
      setBevestig(false);
      return setFout(r.reden);
    }
    onSluit();
  }

  const blokkade = gevolgen.metingen > 0 ? `Dit onderdeel heeft ${gevolgen.metingen} ${gevolgen.metingen === 1 ? "Meting" : "Metingen"}. Verwijder of wijzig die eerst.` : null;

  return (
    <>
      <Modal open onClose={onSluit} title="Onderdeel wijzigen">
        <form onSubmit={opslaan}>
          <div className="admin-field">
            <label htmlFor="onderdeel-wijzig-naam">Naam</label>
            <input
              id="onderdeel-wijzig-naam"
              type="text"
              autoFocus
              maxLength={ONDERDEEL_NAAM_MAX}
              value={naam}
              aria-invalid={fout ? true : undefined}
              onChange={(e) => {
                setNaam(e.target.value);
                setFout(null);
              }}
            />
            {fout && (
              <span className="text-xs" style={{ color: "var(--stat-red)" }} role="alert">
                {fout}
              </span>
            )}
          </div>
          <div className="btn-rij" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
              <button type="button" className="btn btn-danger btn-compact" disabled={blokkade !== null} onClick={() => setBevestig(true)}>
                Verwijderen
              </button>
              {blokkade && <span className="text-xs text-ink-s">{blokkade}</span>}
            </span>
            <span className="knoppenrij">
              <button type="button" className="btn btn-outline btn-compact" onClick={onSluit}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-or btn-compact">
                Opslaan
              </button>
            </span>
          </div>
        </form>
      </Modal>
      <BevestigModal
        open={bevestig}
        titel="Onderdeel verwijderen"
        bericht={
          gevolgen.kpiWaarden > 0
            ? `Het onderdeel "${onderdeel.naam}" wordt verwijderd, met ${gevolgen.kpiWaarden} ${gevolgen.kpiWaarden === 1 ? "KPI-waarde" : "KPI-waarden"}. Dit kan niet ongedaan worden gemaakt.`
            : `Het onderdeel "${onderdeel.naam}" wordt verwijderd. Dit kan niet ongedaan worden gemaakt.`
        }
        onBevestigen={verwijder}
        onAnnuleren={() => setBevestig(false)}
      />
    </>
  );
}
