"use client";

import { useEffect, useRef, useState } from "react";
import { KorteNamen, korteNaamVeld } from "@/lib/korte-namen";
import { FilterVeld, PoolLid, ingevuldAantal, veldGroep, veldLabelZonderGroep } from "@/lib/verkennen";

/** Velden die bij minder dan dit aandeel van de Organisaties zijn ingevuld, staan grijs (startwaarde, `visualisatie-verkennen.md`, Open punten). */
const GRIJS_ONDER = 0.4;

/**
 * Het filtermenu (`visualisatie-verkennen.md`, Filters; `stylesheet.md`, Filtermenu): Een dropdown met een zoekveld en koppen
 * per groep van velden. Per veld de korte naam (het volledige pad in een tooltip) en rechts "n van N" Organisaties die het veld
 * hebben ingevuld. Een veld met weinig waarden staat grijs maar blijft te kiezen.
 */
export function FilterMenu({
  velden,
  pool,
  korteNamen,
  onKies,
}: {
  velden: FilterVeld[];
  pool: PoolLid[];
  korteNamen: KorteNamen;
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
      return { veld: v, korte, aantal: ingevuldAantal(organisaties, v), groep: veldGroep(v) };
    })
    .filter((r) => !q || r.korte.toLowerCase().includes(q) || r.veld.label.toLowerCase().includes(q));
  const groepen = [...new Set(rijen.map((r) => r.groep))];

  return (
    <div className="dropdown-knop" ref={ref}>
      <button type="button" className="btn btn-outline btn-compact" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Filter toevoegen
        <span className="dropdown-pijl" aria-hidden="true" />
      </button>
      {open && (
        <div className="filtermenu" role="menu">
          <input
            type="search"
            className="filtermenu-zoek"
            placeholder="Zoek een veld"
            aria-label="Zoek een veld"
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
                  const grijs = pool.length > 0 && r.aantal / pool.length < GRIJS_ONDER;
                  return (
                    <button
                      key={r.veld.id}
                      type="button"
                      role="menuitem"
                      className={`filtermenu-rij ${grijs ? "grijs" : ""}`}
                      title={r.veld.label}
                      onClick={() => {
                        onKies(r.veld.id);
                        setOpen(false);
                        setZoek("");
                      }}
                    >
                      <span className="filtermenu-naam">{r.korte}</span>
                      <span className="filtermenu-n">
                        {r.aantal} van {pool.length}
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
