"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusVal } from "@/lib/use-focus-val";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { isAdmin } from "@/lib/rechten";
import { useOpgeslagenTeksten, zetAlgemeneTekst } from "@/lib/algemene-teksten-store";
import { INFO_TEKST_MAX_TEKENS, standaardInfoTekst } from "@/data/info-teksten";

/**
 * Info-icoon (stylesheet.md, "Info-icoon"): Een klein oranje rondje met een
 * uitroepteken bij een veld of knop, in plaats van een vaste uitlegtekst
 * eronder, en voor de reden achter een uitgeschakelde knop. Het opent alleen
 * met een klik (geen mouse-over, want het veld heeft een potlood en een
 * kruisje die bediend moeten worden). Het informatieveld staat gecentreerd in
 * het venster met een dimlaag, ook boven een modal (portal naar `body`, zodat
 * een `transform` van een voorouder het niet verschuift).
 *
 * De tekst komt uit de Algemene teksten onder `sleutel`; ontbreekt die, dan
 * geldt de standaardtekst uit `data/info-teksten.ts`. Een Admin ziet een
 * potlood om de tekst op de plek zelf aan te passen (beheerpagina.md, punt 2a).
 */
export function InfoIcoon({
  sleutel,
  label = "Toelichting",
  naastVeld = false,
}: {
  /** Sleutel in het register `data/info-teksten.ts`, bijv. `info.bewaartermijn`. */
  sleutel: string;
  /** Schermlezer-naam van het icoon. */
  label?: string;
  /** In een rij met invoervelden en knoppen: Centreert het icoon op de hoogte van die velden. */
  naastVeld?: boolean;
}) {
  const standaard = standaardInfoTekst(sleutel);
  const opgeslagen = useOpgeslagenTeksten()[sleutel];
  const tekst = opgeslagen && opgeslagen.trim() !== "" ? opgeslagen : standaard;
  const admin = isAdmin(useIngelogdeGebruiker());

  const [open, setOpen] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const veldRef = useRef<HTMLDivElement>(null);
  // Focus naar het veld bij het openen, terug op het icoon bij het sluiten, Tab blijft erin.
  useFocusVal(open, veldRef);

  function sluit() {
    setOpen(false);
    setBewerken(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Alleen dit veld reageert: Een modal eronder blijft open (capture, dus vóór de modal).
      e.stopPropagation();
      // Esc annuleert het bewerken, een tweede Esc sluit het veld.
      if (bewerken) setBewerken(false);
      else setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, bewerken]);

  function startBewerken() {
    setConcept(tekst);
    setBewerken(true);
  }

  function slaOp() {
    // Gelijk aan de standaardtekst: De override verdwijnt, de standaard geldt weer.
    zetAlgemeneTekst(sleutel, concept.trim() === standaard.trim() ? "" : concept);
    setBewerken(false);
  }

  const veld = (
    <div
      className="info-dim"
      onClick={(e) => {
        // Niet door laten bubbelen naar een modal eronder (React-events volgen de componentboom, ook via een portal).
        e.stopPropagation();
        // In de bewerkstand sluit een klik op de dimlaag het veld niet, zodat getypte tekst niet verloren gaat.
        if (e.target === e.currentTarget && !bewerken) sluit();
      }}
    >
      <div className="info-veld" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={veldRef}>
        {bewerken ? (
          <div className="info-veld-bewerken">
            <textarea
              autoFocus
              value={concept}
              maxLength={INFO_TEKST_MAX_TEKENS}
              rows={Math.max(3, concept.split("\n").length + Math.floor(concept.length / 40))}
              aria-label="Tekst van deze toelichting"
              onChange={(e) => setConcept(e.target.value)}
            />
            <div className="info-veld-teller">
              {concept.length}/{INFO_TEKST_MAX_TEKENS}
            </div>
            <div className="info-veld-knoppen">
              <button type="button" className="btn btn-or btn-compact" onClick={slaOp}>
                Opslaan
              </button>
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setBewerken(false)}>
                Annuleren
              </button>
              {concept.trim() !== standaard.trim() && (
                <button type="button" className="btn btn-outline btn-compact" onClick={() => setConcept(standaard)}>
                  Standaardtekst herstellen
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p>{tekst}</p>
            {admin && (
              <button
                type="button"
                className="info-veld-actie"
                aria-label="Tekst aanpassen"
                title="Tekst aanpassen"
                onClick={startBewerken}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <button type="button" className="info-veld-sluit" aria-label="Sluiten" onClick={sluit}>
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <span className={`info-icoon-wrap ${naastVeld ? "info-icoon-wrap--veld" : ""}`} ref={ref}>
      <button
        type="button"
        className="info-icoon"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? sluit() : setOpen(true))}
      >
        i
      </button>
      {open && createPortal(veld, document.body)}
    </span>
  );
}
