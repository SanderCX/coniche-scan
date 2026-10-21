"use client";

import { useEffect, useRef } from "react";
import { useFocusVal } from "@/lib/use-focus-val";

/**
 * Overzichtsmodal (`stylesheet.md`, Overzichtsmodal): dezelfde
 * `.modal-overlay`/`.modal-box` als de andere modals, breder en met
 * secties. Sluiten met het kruisje, Esc of een klik naast de modal; de
 * terugknop van de browser sluit hem via `useBeheerOverzicht`.
 * `escUitgeschakeld` voorkomt dat Esc deze modal sluit terwijl er een
 * bevestigingsmodal bovenop staat. `vol` is de brede variant `.modal-box--vol`
 * voor het Leads-venster (`stylesheet.md`, Overzichtsmodal): Het venster zelf
 * scrolt niet, de kop en de voettekst blijven staan en alleen de tabel scrolt.
 */
export function OverzichtModal({
  label,
  onSluit,
  escUitgeschakeld = false,
  vol = false,
  className = "",
  children,
}: {
  label: string;
  onSluit: () => void;
  escUitgeschakeld?: boolean;
  vol?: boolean;
  /** Een extra klasse op de modal, bijvoorbeeld `modal-box--dossier` voor een smallere modal. */
  className?: string;
  children: React.ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  useFocusVal(true, boxRef);

  useEffect(() => {
    if (escUitgeschakeld) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onSluit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSluit, escUitgeschakeld]);

  return (
    <div className="modal-overlay" onClick={onSluit} role="dialog" aria-modal="true" aria-label={label}>
      <div className={`modal-box ${vol ? "modal-box--vol" : "modal-box--breed"} ${className}`.trim()} ref={boxRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onSluit} aria-label="Sluiten" className="modal-close">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
