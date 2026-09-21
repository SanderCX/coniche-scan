"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
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
        <h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>
        <div className="whitespace-pre-line text-sm leading-relaxed text-ink-m">{children}</div>
      </div>
    </div>
  );
}
