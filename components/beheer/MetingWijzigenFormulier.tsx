"use client";

import { useState } from "react";
import { wijzigMeting } from "@/lib/db";
import { STANDAARD_ONDERDEEL, bestaandeOnderdelen, isSamengesteld, onderdeelVan, rondesNieuwsteEerst } from "@/lib/rondes";
import { Organisatie, ScanUitvoering } from "@/lib/types";

const GEEN_RONDE = "__geen__";
const NIEUWE_RONDE = "__nieuw__";

/**
 * "Wijzigen" van een Meting (`beheerpagina.md`, punt 5): Het label, het onderdeel en de ronde zijn achteraf aanpasbaar. Het
 * Assessment ligt vast. Een label dat nog het gegenereerde label is, volgt een nieuw onderdeel of een nieuwe ronde, een met de
 * hand aangepast label blijft staan. Hetzelfde onderdeel voor hetzelfde Assessment in dezelfde ronde kan niet twee keer.
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
  const rondes = rondesNieuwsteEerst(organisatie);
  const [label, setLabel] = useState(meting.label);
  const [onderdeel, setOnderdeel] = useState(onderdeelVan(meting));
  const [ronde, setRonde] = useState(meting.rondeId ?? GEEN_RONDE);
  const [nieuweRonde, setNieuweRonde] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    if (!label.trim()) return setFout("Het label is verplicht.");
    const r = wijzigMeting(meting.id, {
      label,
      onderdeel: onderdeel.trim() || STANDAARD_ONDERDEEL,
      ...(ronde === NIEUWE_RONDE ? { nieuweRondeLabel: nieuweRonde } : { rondeId: ronde === GEEN_RONDE ? null : ronde }),
    });
    if (!r.ok) return setFout(r.reden);
    onKlaar();
  }

  return (
    <form onSubmit={opslaan} className="flex flex-wrap items-end gap-3" style={{ marginBottom: "0.8rem" }}>
      <div className="admin-field" style={{ marginBottom: 0, minWidth: "16rem" }}>
        <label>Label</label>
        <input type="text" autoFocus value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>Onderdeel</label>
        <input type="text" list="wijzig-onderdelen" value={onderdeel} onChange={(e) => setOnderdeel(e.target.value)} />
        <datalist id="wijzig-onderdelen">
          {bestaandeOnderdelen(organisatie).map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </div>
      <div className="admin-field" style={{ marginBottom: 0 }}>
        <label>Ronde</label>
        <select value={ronde} disabled={samengesteld} onChange={(e) => setRonde(e.target.value)}>
          <option value={GEEN_RONDE}>Zonder ronde</option>
          {rondes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
          <option value={NIEUWE_RONDE}>Nieuwe ronde</option>
        </select>
      </div>
      {ronde === NIEUWE_RONDE && (
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label>Naam van de ronde</label>
          <input type="text" required value={nieuweRonde} onChange={(e) => setNieuweRonde(e.target.value)} />
        </div>
      )}
      <button type="submit" className="btn btn-or btn-compact">
        Opslaan
      </button>
      <button type="button" className="btn btn-outline btn-compact" onClick={onKlaar}>
        Annuleren
      </button>
      {fout && <p className="overzicht-melding fout" style={{ flexBasis: "100%", margin: 0 }}>{fout}</p>}
    </form>
  );
}
