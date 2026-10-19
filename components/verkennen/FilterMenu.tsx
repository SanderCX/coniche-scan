"use client";

import { useEffect, useRef, useState } from "react";
import { KorteNamen, korteNaamVeld } from "@/lib/korte-namen";
import { FilterVeld, KANALEN_ID, ONDERDEEL_ID, ORGANISATIE_ID, PoolLid, ingevuldAantal, kanaalVelden, kanaalIngezet, veldGroep, veldLabelZonderGroep } from "@/lib/verkennen";


/**
 * Het menu Kenmerk toevoegen (`visualisatie-verkennen.md`, Kenmerken en filters; `stylesheet.md`, Menu Kenmerk toevoegen): Een
 * dropdown met een zoekveld en koppen per groep van velden. Per veld de korte naam (het volledige pad in een tooltip) en rechts
 * "n van N" Organisaties die het veld hebben ingevuld. Een veld met weinig waarden staat grijs maar blijft te kiezen, een veld dat
 * al is toegevoegd staat uitgeschakeld met "toegevoegd" erachter.
 */
export function FilterMenu({
  velden,
  toegevoegd,
  pool,
  korteNamen,
  grijsOnderPct,
  onKies,
}: {
  velden: FilterVeld[];
  /** Id's van de kenmerken die al op het scherm staan. */
  toegevoegd: string[];
  pool: PoolLid[];
  korteNamen: KorteNamen;
  /** `verkennenMinIngevuldPct`: Een veld dat bij een lager percentage is ingevuld, staat grijs maar blijft te kiezen. */
  grijsOnderPct: number;
  onKies: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [zoek, setZoek] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const buiten = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", buiten);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", buiten);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const organisaties = pool.map((l) => l.organisatie);
  const q = zoek.trim().toLowerCase();
  const rijen = velden
    .map((v) => {
      const korte = korteNaamVeld(korteNamen, v.id, veldLabelZonderGroep(v));
      const aantal =
        v.id === ORGANISATIE_ID || v.id === ONDERDEEL_ID
          ? pool.length
          : v.id === KANALEN_ID
          ? pool.filter((l) => kanaalVelden().some((k) => kanaalIngezet(l, k.id) !== null)).length
          : ingevuldAantal(organisaties, v);
      return { veld: v, korte, aantal, groep: veldGroep(v) };
    })
    .filter((r) => !q || r.korte.toLowerCase().includes(q) || r.veld.label.toLowerCase().includes(q));
  const groepen = [...new Set(rijen.map((r) => r.groep))];

  return (
    <div className="dropdown-knop" ref={ref}>
      <button type="button" className="btn btn-outline btn-compact" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Kenmerk toevoegen
        <span className="dropdown-pijl" aria-hidden="true" />
      </button>
      {open && (
        <div className="filtermenu" role="menu">
          <input
            type="search"
            className="filtermenu-zoek"
            placeholder="Zoek een kenmerk"
            aria-label="Zoek een kenmerk"
            autoFocus
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
          />
          {groepen.length === 0 && <p className="filtermenu-leeg">Geen velden gevonden.</p>}
          {groepen.map((groep) => (
            <div key={groep}>
              <p className="filtermenu-kop">{groep}</p>
              {rijen
                .filter((r) => r.groep === groep)
                .map((r) => {
                  const grijs = pool.length > 0 && (r.aantal / pool.length) * 100 < grijsOnderPct;
                  const al = toegevoegd.includes(r.veld.id);
                  return (
                    <button
                      key={r.veld.id}
                      type="button"
                      role="menuitem"
                      disabled={al}
                      className={`filtermenu-rij ${grijs || al ? "grijs" : ""}`}
                      title={r.veld.label}
                      onClick={() => {
                        onKies(r.veld.id);
                        setOpen(false);
                        setZoek("");
                      }}
                    >
                      <span className="filtermenu-naam">{r.korte}</span>
                      <span className="filtermenu-n">
                        {r.veld.id === KANALEN_ID && !al ? "alleen filteren · " : ""}
                        {al ? "toegevoegd" : `${r.aantal} van ${pool.length}`}
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
