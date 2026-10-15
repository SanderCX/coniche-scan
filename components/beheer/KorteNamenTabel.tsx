"use client";

import { useState } from "react";
import { useOrganisaties } from "@/lib/db";
import { useInstellingen } from "@/lib/instellingen-store";
import {
  KorteNaamRij,
  MAX_KORTE_NAAM,
  bewaarKorteNamen,
  foutSleutel,
  korteNamenRijen,
  valideerKorteNamen,
} from "@/lib/korte-namen";

/**
 * De tabel met korte namen (`beheerpagina.md`, punt 3, Korte namen; `stylesheet.md`, Modal Korte namen). Eén component voor de
 * tab op de pagina Organisatievelden en voor de modal in Verkennen: Met `veldId` toont hij alleen de waarden van dat ene veld,
 * zonder filters. De opslag staat bij de instellingen (`lib/korte-namen.ts`). Opslaan kan alleen zonder meldingen.
 */
export function KorteNamenTabel({
  veldId,
  onKlaar,
}: {
  /** Alleen de waarden van dit veld, zonder filterbalk (de modal in Verkennen). */
  veldId?: string;
  onKlaar?: () => void;
}) {
  const organisaties = useOrganisaties();
  const { korteNamen } = useInstellingen();
  const alle = korteNamenRijen(organisaties, korteNamen);
  const basis = veldId ? alle.filter((r) => r.soort === "waarde" && r.veldId === veldId) : alle;

  const [bewerkt, setBewerkt] = useState<Record<string, string>>({});
  const [veldFilter, setVeldFilter] = useState("");
  const [zoek, setZoek] = useState("");
  const [bovenaan, setBovenaan] = useState(true);
  const [opgeslagen, setOpgeslagen] = useState<number | null>(null);

  // De effectieve stand: wat de Admin heeft getypt, anders wat is opgeslagen.
  const effectief: KorteNaamRij[] = basis.map((r) => {
    const k = foutSleutel(r);
    return k in bewerkt ? { ...r, korteNaam: bewerkt[k] } : r;
  });
  const fouten = valideerKorteNamen(effectief);
  const aantalFouten = Object.keys(fouten).length;
  const gewijzigd = effectief.filter((r, i) => r.korteNaam.trim() !== basis[i].korteNaam.trim());

  const veldOpties = [...new Map(alle.map((r) => [r.veldId, r.veldLabel])).entries()];
  const q = zoek.trim().toLowerCase();
  let zichtbaar = effectief.filter((r) => {
    if (!veldId) {
      if (veldFilter === "__veldnamen") return r.soort === "veldnaam";
      if (veldFilter && r.veldId !== veldFilter) return false;
    }
    if (q && !r.origineel.toLowerCase().includes(q) && !r.korteNaam.toLowerCase().includes(q) && !r.veldLabel.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
  if (bovenaan) {
    // Waarden in gebruik zonder korte naam eerst, met behoud van de volgorde van het model daarbinnen.
    const mist = (r: KorteNaamRij) => r.soort === "waarde" && r.inGebruik > 0 && r.korteNaam.trim() === "";
    zichtbaar = [...zichtbaar.filter(mist), ...zichtbaar.filter((r) => !mist(r))];
  }
  const metKorteNaam = effectief.filter((r) => r.korteNaam.trim() !== "").length;

  function opslaan() {
    if (aantalFouten > 0) return;
    const n = bewaarKorteNamen(gewijzigd, korteNamen);
    setBewerkt({});
    setOpgeslagen(n);
    onKlaar?.();
  }

  return (
    <div>
      {!veldId && (
        <div className="admin-filterrij" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "0.8rem" }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label htmlFor="kn-veld">Veld</label>
            <select id="kn-veld" value={veldFilter} onChange={(e) => setVeldFilter(e.target.value)}>
              <option value="">Alle velden</option>
              <option value="__veldnamen">Veldnamen</option>
              {veldOpties.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label htmlFor="kn-zoek">Zoeken</label>
            <input id="kn-zoek" type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Origineel of korte naam" />
          </div>
          <label className="text-sm text-ink-m" style={{ display: "flex", alignItems: "center", gap: "0.4rem", paddingTop: "1.7rem" }}>
            <input type="checkbox" checked={bovenaan} onChange={(e) => setBovenaan(e.target.checked)} />
            Waarden in gebruik zonder korte naam bovenaan
          </label>
        </div>
      )}
      <p className="text-sm text-ink-m" style={{ margin: "0 0 0.6rem" }}>
        {metKorteNaam} van {effectief.length} hebben een korte naam
      </p>

      {basis.length === 0 ? (
        <p className="admin-notice">Dit veld heeft nog geen waarden.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                {!veldId && <th>Soort</th>}
                {!veldId && <th>Veld</th>}
                <th>Origineel</th>
                <th>Korte naam</th>
                <th>In gebruik</th>
              </tr>
            </thead>
            <tbody>
              {zichtbaar.map((r) => {
                const k = foutSleutel(r);
                const fout = fouten[k];
                return (
                  <tr key={k}>
                    {!veldId && <td>{r.soort === "veldnaam" ? "Veldnaam" : "Waarde"}</td>}
                    {!veldId && <td>{r.soort === "veldnaam" ? "" : r.veldLabel}</td>}
                    <td title={r.origineel}>{r.origineel}</td>
                    <td>
                      <input
                        type="text"
                        className="kn-invoer"
                        aria-label={`Korte naam voor ${r.origineel}`}
                        maxLength={MAX_KORTE_NAAM + 10}
                        value={r.korteNaam}
                        aria-invalid={fout ? true : undefined}
                        onChange={(e) => {
                          setOpgeslagen(null);
                          setBewerkt({ ...bewerkt, [k]: e.target.value });
                        }}
                      />
                      <span className="text-xs text-ink-s" style={{ display: "block" }}>
                        {r.korteNaam.length} van {MAX_KORTE_NAAM}
                      </span>
                      {fout && <span className="overzicht-melding fout" style={{ display: "block" }}>{fout}</span>}
                    </td>
                    <td>{r.inGebruik}</td>
                  </tr>
                );
              })}
              {zichtbaar.length === 0 && (
                <tr>
                  <td colSpan={veldId ? 3 : 5}>Niets gevonden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="btn-rij" style={{ marginTop: "1rem", alignItems: "center" }}>
        <button type="button" className="btn btn-or btn-compact" disabled={gewijzigd.length === 0 || aantalFouten > 0} onClick={opslaan}>
          Opslaan
        </button>
        <button
          type="button"
          className="btn btn-outline btn-compact"
          disabled={gewijzigd.length === 0}
          onClick={() => {
            setBewerkt({});
            setOpgeslagen(null);
          }}
        >
          Annuleren
        </button>
        {opgeslagen !== null && <span className="admin-save-state zichtbaar">{opgeslagen} opgeslagen ✓</span>}
      </div>
    </div>
  );
}
