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
  /** Een scheidingslijn boven deze optie (`stylesheet.md`, Accountmenu in beheer). */
  scheidingVoor?: boolean;
  /** De pagina waar deze optie naartoe leidt is open: Gemarkeerd, met `aria-current="page"`. */
  actief?: boolean;
}

/**
 * Dropdown-knop (stylesheet.md, "Dropdown-knop"): één knop die bij klikken
 * een menu direct eronder opent, links uitgelijnd (rechts uitgelijnd met
 * `rechtsUitgelijnd`, voor een knop aan de rechterrand zoals het Accountmenu).
 * Sluit bij een klik buiten het menu of op een optie.
 *
 * Toetsenbord: Enter of spatie opent het menu, de pijltjestoetsen lopen door de
 * rijen, Esc sluit en zet de focus terug op de knop.
 */
export function DropdownKnop({
  label,
  header,
  opties,
  className = "btn btn-outline btn-compact",
  disabled = false,
  rechtsUitgelijnd = false,
  actief = false,
}: {
  label: string;
  /** Niet-klikbare eerste rij in het menu (bijv. "e-mail (Rol)" in het Accountmenu, beheerpagina.md). */
  header?: string;
  opties: DropdownOptie[];
  className?: string;
  /** De hele knop uitgeschakeld (de reden staat dan in een Info-icoon ernaast). */
  disabled?: boolean;
  /** Het menu staat rechts uitgelijnd met de knop, zodat het niet buiten het scherm loopt. */
  rechtsUitgelijnd?: boolean;
  /** Een pagina onder dit menu is open: De knop heeft een actieve staat. */
  actief?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const knopRef = useRef<HTMLButtonElement>(null);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
      knopRef.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = [...(containerRef.current?.querySelectorAll<HTMLButtonElement>(".dropdown-menu-item:not(:disabled)") ?? [])];
    if (items.length === 0) return;
    e.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }
    const huidig = items.indexOf(document.activeElement as HTMLButtonElement);
    const volgende = e.key === "ArrowDown" ? (huidig + 1) % items.length : (huidig - 1 + items.length) % items.length;
    items[huidig === -1 && e.key === "ArrowUp" ? items.length - 1 : volgende].focus();
  }

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
    <div className="dropdown-knop" ref={containerRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        ref={knopRef}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${className}${actief ? " dropdown-knop-actief" : ""}`}
      >
        {label}<span className="dropdown-pijl" aria-hidden="true" />
      </button>
      {open && (
        <div className={`dropdown-menu${rechtsUitgelijnd ? " dropdown-menu--rechts" : ""}`}>
          {header && <div className="dropdown-menu-header">{header}</div>}
          {opties.map((optie) => (
            <div key={optie.label} className={`dropdown-menu-rij${optie.scheidingVoor ? " dropdown-menu-rij--scheiding" : ""}`}>
              <button
                type="button"
                className="dropdown-menu-item"
                disabled={optie.disabled}
                title={optie.title}
                aria-current={optie.actief ? "page" : undefined}
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
