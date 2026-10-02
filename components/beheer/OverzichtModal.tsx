"use client";

import { useEffect, useRef } from "react";
import { useFocusVal } from "@/lib/use-focus-val";

/**
 * Overzichtsmodal (`stylesheet.md`, Overzichtsmodal): dezelfde
 * `.modal-overlay`/`.modal-box` als de andere modals, breder en met
 * secties. Sluiten met het kruisje, Esc of een klik naast de modal; de
 * terugknop van de browser sluit hem via `useBeheerOverzicht`.
 * `escUitgeschakeld` voorkomt dat Esc deze modal sluit terwijl er een
 * bevestigingsmodal bovenop staat.
 */
export function OverzichtModal({
  label,
  onSluit,
  escUitgeschakeld = false,
  children,
}: {
  label: string;
  onSluit: () => void;
  escUitgeschakeld?: boolean;
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
      <div className="modal-box modal-box--breed" ref={boxRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onSluit} aria-label="Sluiten" className="modal-close">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
