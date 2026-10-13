"use client";

import { useState } from "react";
import { wijzigMeting } from "@/lib/db";
import { STANDAARD_ONDERDEEL, isSamengesteld, onderdeelVan } from "@/lib/rondes";
import { Organisatie, ScanUitvoering } from "@/lib/types";
import {
  GEEN_RONDE,
  NIEUWE_RONDE,
  OnderdeelRondeVelden,
  OnderdeelRondeWaarde,
} from "@/components/beheer/OnderdeelRondeVelden";

/**
 * "Wijzigen" van een Meting (`beheerpagina.md`, punt 5): Achter het potlood naast de naam van de Meting, met alleen de twee
 * velden Onderdeel en Ronde en verder niets. De naam volgt vanzelf. Het Assessment ligt vast. Een Meting zonder ronde kan er
 * een krijgen, en houdt tot dan haar oude label. Hetzelfde onderdeel voor hetzelfde Assessment in dezelfde ronde kan niet twee
 * keer: De melding noemt de Meting die er al is en de uitwegen.
 */
export function MetingWijzigenFormulier({
  organisatie,
  meting,
  onKlaar,
}: {
  organisatie: Organisatie;
  meting: ScanUitvoering;
  onKlaar: () => void;
}) {
  const samengesteld = isSamengesteld(meting);
  const [waarde, setWaarde] = useState<OnderdeelRondeWaarde>({
    onderdeel: onderdeelVan(meting),
    ronde: meting.rondeId ?? GEEN_RONDE,
    nieuweRonde: "",
  });
  const [fout, setFout] = useState<string | null>(null);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    if (waarde.ronde === NIEUWE_RONDE && !waarde.nieuweRonde.trim()) return setFout("Geef de nieuwe ronde een naam.");
    const r = wijzigMeting(meting.id, {
      onderdeel: waarde.onderdeel.trim() || STANDAARD_ONDERDEEL,
      ...(waarde.ronde === NIEUWE_RONDE
        ? { nieuweRondeLabel: waarde.nieuweRonde }
        : { rondeId: waarde.ronde === GEEN_RONDE ? null : waarde.ronde }),
    });
    if (!r.ok) return setFout(r.reden);
    onKlaar();
  }

  return (
    <form onSubmit={opslaan} style={{ marginBottom: "0.8rem" }}>
      <div className="flex flex-wrap items-end gap-3">
        {samengesteld ? (
          // Een samengestelde Meting hoort bij de ronde van haar onderliggende Metingen: Alleen het onderdeel is te wijzigen.
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>Onderdeel</label>
            <input
              type="text"
              value={waarde.onderdeel}
              onChange={(e) => setWaarde({ ...waarde, onderdeel: e.target.value })}
            />
          </div>
        ) : (
          <OnderdeelRondeVelden
            organisatie={organisatie}
            waarde={waarde}
            onChange={setWaarde}
            metZonderRonde={!meting.rondeId}
            idPrefix="wijzig-meting"
          />
        )}
        <button type="submit" className="btn btn-or btn-compact">
          Opslaan
        </button>
        <button type="button" className="btn btn-outline btn-compact" onClick={onKlaar}>
          Annuleren
        </button>
      </div>
      {fout && <p className="overzicht-melding fout" style={{ margin: "0.6rem 0 0" }}>{fout}</p>}
    </form>
  );
}
