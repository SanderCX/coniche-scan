"use client";

import { useEffect, useRef, useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";

export interface DropdownOptie {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  /** Sleutel van een Info-icoon dat achter de optie staat, bijv. de reden waarom ze uitgeschakeld is. */
  infoSleutel?: string;
}

/**
 * Dropdown-knop (stylesheet.md, "Dropdown-knop"): één knop die bij klikken
 * een menu direct eronder opent, links uitgelijnd. Sluit bij een klik
 * buiten het menu of op een optie.
 */
export function DropdownKnop({
  label,
  header,
  opties,
  className = "btn btn-outline btn-compact",
  disabled = false,
}: {
  label: string;
  /** Niet-klikbare eerste rij in het menu (bijv. "e-mail (Rol)" in het Accountmenu, beheerpagina.md). */
  header?: string;
  opties: DropdownOptie[];
  className?: string;
  /** De hele knop uitgeschakeld (de reden staat dan in een Info-icoon ernaast). */
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickBuiten(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickBuiten);
    return () => document.removeEventListener("mousedown", onClickBuiten);
  }, [open]);

  return (
    <div className="dropdown-knop" ref={containerRef}>
      <button type="button" disabled={disabled} onClick={() => setOpen((o) => !o)} className={className}>
        {label} <span className="dropdown-pijl" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="dropdown-menu">
          {header && <div className="dropdown-menu-header">{header}</div>}
          {opties.map((optie) => (
            <div key={optie.label} className="dropdown-menu-rij">
              <button
                type="button"
                className="dropdown-menu-item"
                disabled={optie.disabled}
                title={optie.title}
                onClick={() => {
                  optie.onClick?.();
                  setOpen(false);
                }}
              >
                {optie.label}
              </button>
              {optie.disabled && optie.infoSleutel && <InfoIcoon sleutel={optie.infoSleutel} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
