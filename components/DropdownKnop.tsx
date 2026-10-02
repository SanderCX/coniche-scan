"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOptie {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
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
}: {
  label: string;
  /** Niet-klikbare eerste rij in het menu (bijv. "e-mail (Rol)" in het Accountmenu, beheerpagina.md). */
  header?: string;
  opties: DropdownOptie[];
  className?: string;
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
      <button type="button" onClick={() => setOpen((o) => !o)} className={className}>
        {label} <span className="dropdown-pijl" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="dropdown-menu">
          {header && <div className="dropdown-menu-header">{header}</div>}
          {opties.map((optie) => (
            <button
              key={optie.label}
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
          ))}
        </div>
      )}
    </div>
  );
}
