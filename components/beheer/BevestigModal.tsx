"use client";

import { useRef } from "react";
import { useFocusVal } from "@/lib/use-focus-val";

/**
 * Vervangt `window.confirm()` voor destructieve acties in beheer. Niet
 * cosmetisch: Een native `confirm()`-dialoog wordt in sommige
 * browseromgevingen (o.a. de Claude-browserpane) onderdrukt en levert dan
 * altijd `false` op zonder dat er iets zichtbaars gebeurt — de knop lijkt
 * het dan niet te doen. Zelfde `.modal-overlay`/`.modal-box` als de andere
 * overlays in de app (`components/Modal.tsx`, `stylesheet.md`).
 */
export function BevestigModal({
  open,
  titel,
  bericht,
  bevestigLabel = "Verwijderen",
  bevestigVariant = "danger",
  onBevestigen,
  onAnnuleren,
}: {
  open: boolean;
  titel: string;
  bericht: React.ReactNode;
  bevestigLabel?: string;
  /** `danger` (rood) voor verwijderen, `primair` (oranje) voor een gewone bevestiging. */
  bevestigVariant?: "danger" | "primair";
  onBevestigen: () => void;
  onAnnuleren: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  useFocusVal(open, boxRef);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onAnnuleren}
      role="alertdialog"
      aria-modal="true"
      aria-label={titel}
    >
      <div className="modal-box" ref={boxRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold text-ink">{titel}</h2>
        <div className="text-sm leading-relaxed text-ink-m" style={{ marginBottom: "1.5rem" }}>
          {bericht}
        </div>
        <div className="btn-rij">
          <button type="button" className="btn btn-outline" onClick={onAnnuleren}>
            Annuleren
          </button>
          <button type="button" className={`btn ${bevestigVariant === "primair" ? "btn-or" : "btn-danger"}`} onClick={onBevestigen}>
            {bevestigLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
