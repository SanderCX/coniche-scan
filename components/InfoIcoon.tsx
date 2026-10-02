"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Informatie-icoon (stylesheet.md, "Info-icoon"): Een klein oranje rondje
 * met een uitroepteken bij een veld of knop, in plaats van een vaste
 * uitlegtekst eronder. Mouse-over of een klik opent de toelichting in een
 * afsluitbaar informatieveld. Mouse-over toont het veld zolang de muis op het
 * icoon of het veld staat; een klik zet het vast (ook als mouse-over het al
 * opende), tot het kruisje, Esc, een klik ernaast of nog een klik op het icoon. Het veld ligt over de pagina
 * heen (geen verspringende layout).
 */
export function InfoIcoon({
  children,
  label = "Toelichting",
  naastVeld = false,
}: {
  children: React.ReactNode;
  /** Schermlezer-naam van het icoon. */
  label?: string;
  /** In een rij met invoervelden en knoppen: Centreert het icoon op de hoogte van die velden. */
  naastVeld?: boolean;
}) {
  const [open, setOpen] = useState(false); // vastgezet met een klik
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const zichtbaar = open || hover;

  function sluit() {
    setOpen(false);
    setHover(false);
  }

  useEffect(() => {
    if (!zichtbaar) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) sluit();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") sluit();
    }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zichtbaar]);

  return (
    <span
      className={`info-icoon-wrap ${naastVeld ? "info-icoon-wrap--veld" : ""}`}
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className="info-icoon"
        aria-label={label}
        aria-expanded={zichtbaar}
        onClick={() => (open ? sluit() : setOpen(true))}
      >
        !
      </button>
      {zichtbaar && (
        <div className="info-veld" role="note">
          <p>{children}</p>
          <button type="button" className="info-veld-sluit" aria-label="Sluiten" onClick={sluit}>
            ✕
          </button>
        </div>
      )}
    </span>
  );
}
