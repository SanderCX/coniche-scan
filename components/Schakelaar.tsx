"use client";

/**
 * Een schakelaar van 40×24px, oranje als hij aan staat (`dossier.md`, Scherm 1 en 3; besloten door Joost op 21 oktober 2026): Voor een
 * instelling die meteen werkt, zoals "Zichtbaar voor Lead". Een knop met `role="switch"` en `aria-checked`, dus ook met het toetsenbord
 * (spatie of enter) en een schermlezer te bedienen. Het label staat in de omgeving (`aria-label` of `aria-labelledby`).
 */
export function Schakelaar({
  aan,
  onChange,
  disabled = false,
  ariaLabel,
  ariaLabelledBy,
  id,
}: {
  aan: boolean;
  onChange: (aan: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={aan}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      className={`schakelaar ${aan ? "is-aan" : ""}`}
      onClick={() => onChange(!aan)}
    >
      <span className="schakelaar-knop" aria-hidden="true" />
    </button>
  );
}
