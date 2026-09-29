"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  accentColor,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Klein label boven de titel, bijv. "OVERKOEPELEND · BOUWSTEEN 1" (bouwstenen-overzicht). */
  eyebrow?: string;
  /** Kleurt de eyebrow en de titel; standaard ongewijzigd (huidige ink/or-kleuren). */
  accentColor?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Sluiten" className="modal-close">
          ✕
        </button>
        {eyebrow && (
          <p className="eyebrow" style={accentColor ? { color: accentColor } : undefined}>
            {eyebrow}
          </p>
        )}
        <h2
          className={eyebrow ? "mt-1 mb-4 text-lg font-bold" : "mb-4 text-lg font-bold text-ink"}
          style={accentColor && eyebrow ? { color: "var(--ink)" } : undefined}
        >
          {title}
        </h2>
        <div className="whitespace-pre-line text-sm leading-relaxed text-ink-m">{children}</div>
      </div>
    </div>
  );
}
