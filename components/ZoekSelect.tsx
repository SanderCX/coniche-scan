"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Een keuzelijst met zoekveld voor lange lijsten met korte namen (`beheerpagina.md`, punt 4, Korte namen in kaart en formulier): Sector en
 * Subsector in het organisatieformulier. De lijst toont de korte naam per optie in de volgorde van de lijst, met de originele titel in de
 * tooltip van de optie, en het zoekveld zoekt in beide. Bewaard wordt altijd het origineel.
 */
export function ZoekSelect({
  waarde,
  opties,
  naam,
  onChange,
  placeholder = "Kies...",
  disabled = false,
  ariaLabel,
}: {
  /** Het origineel van de gekozen optie, of leeg. */
  waarde: string;
  opties: string[];
  /** De weergavenaam van een optie: De korte naam of het origineel. */
  naam: (optie: string) => string;
  onChange: (optie: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoek, setZoek] = useState("");
  const houder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function buiten(e: MouseEvent) {
      if (!houder.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", buiten);
    return () => document.removeEventListener("mousedown", buiten);
  }, [open]);

  const woorden = zoek.toLowerCase().split(/\s+/).filter(Boolean);
  const getoond = opties.filter((o) => woorden.every((w) => `${naam(o)} ${o}`.toLowerCase().includes(w)));

  return (
    <div className="zoek-select" ref={houder}>
      <button
        type="button"
        className="zoek-select-knop"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        title={waarde && naam(waarde) !== waarde ? waarde : undefined}
        onClick={() => {
          setOpen(!open);
          setZoek("");
        }}
      >
        <span className={waarde ? undefined : "zoek-select-leeg"}>{waarde ? naam(waarde) : placeholder}</span>
      </button>
      {open && (
        <div className="zoek-select-paneel" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
          <input type="text" autoFocus aria-label="Zoek in de lijst" placeholder="Zoeken" value={zoek} onChange={(e) => setZoek(e.target.value)} />
          <ul role="listbox">
            {getoond.map((o) => (
              <li key={o} role="option" aria-selected={o === waarde} title={naam(o) !== o ? o : undefined}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  {naam(o)}
                </button>
              </li>
            ))}
            {getoond.length === 0 && <li className="zoek-select-niets">Niets gevonden</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
