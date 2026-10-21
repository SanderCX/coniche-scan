"use client";

import { useEffect, useRef } from "react";
import { lijnKleur } from "@/lib/colors";
import { useFocusVal } from "@/lib/use-focus-val";

/**
 * De Toelichtingsmodal (`stylesheet.md`, Toelichtingsmodal, opbouw, besloten door Joost op 21 oktober 2026): Gebruikt in de doorloopflow en bij een
 * klik op een bouwblok of domein op de Assessment-pagina. Van boven naar beneden de kop (het nummer in een cirkel met een rand in de categoriekleur, de
 * naam als titel, daaronder de categorie in hoofdletters in de categoriekleur en rechts een ronde sluitknop), de centrale vraag in een vlak met een
 * balk links en de beschrijving. Zonder categorie (een domein van de AI-scan) vervalt het label en is de accentkleur `--or`. Bij Fundament, dat geel
 * is, staat het categorielabel in `--ink-m`.
 */
export function ToelichtingModal({
  open,
  onClose,
  nummer,
  naam,
  categorie,
  kleur,
  centraleVraag,
  beschrijving,
  ijkpunten,
  basis,
}: {
  open: boolean;
  onClose: () => void;
  nummer: number;
  naam: string;
  /** De naam van de categorie, of `null` zonder categorielaag. */
  categorie: string | null;
  /** De kleur (hex) van de categorie of het domein, `null` voor `--or`. */
  kleur: string | null;
  centraleVraag: string | null;
  beschrijving: string[];
  /** Alleen bij een spanningsveld (`visualisatie-spanningsmeter.md`, De 6 spanningsvelden): De vijf ijkpunten, onder de beschrijving. */
  ijkpunten?: { niveau: number; naam: string; tekst: string }[];
  /** Alleen bij een spanningsveld: De basis (de literatuur), onder de ijkpunten. */
  basis?: string | null;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  useFocusVal(open, boxRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  const accent = kleur ?? "var(--or)";
  const labelKleur = kleur ? (lijnKleur(kleur) === "var(--ink)" ? "var(--ink-m)" : kleur) : "var(--or)";

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={naam}>
      <div className="modal-box tm-box" ref={boxRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="tm-kop">
          <span className="tm-nummer" style={{ borderColor: accent }} aria-hidden="true">
            {nummer}
          </span>
          <div className="tm-titel">
            <h2>{naam}</h2>
            {categorie && (
              <span className="tm-categorie" style={{ color: labelKleur }}>
                {categorie}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Sluiten" className="tm-sluit">
            ✕
          </button>
        </div>
        {centraleVraag && (
          <div className="tm-vraag" style={{ borderLeftColor: accent }}>
            <span>Centrale vraag</span>
            <p>{centraleVraag}</p>
          </div>
        )}
        {beschrijving.length > 0 && (
          <div className="tm-beschrijving">
            {beschrijving.map((tekst, i) => (
              <p key={i}>{tekst}</p>
            ))}
          </div>
        )}
        {ijkpunten && ijkpunten.length > 0 && (
          <div className="tm-ijkpunten">
            <span className="tm-label">Spanningsmeter voor dit veld</span>
            <ol>
              {ijkpunten.map((punt) => (
                <li key={punt.niveau}>
                  <span className="tm-ijk-nr" aria-hidden="true">
                    {punt.niveau}
                  </span>
                  <span>
                    <strong>{punt.naam}</strong> {punt.tekst}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {basis && <p className="tm-basis">{basis}</p>}
      </div>
    </div>
  );
}
