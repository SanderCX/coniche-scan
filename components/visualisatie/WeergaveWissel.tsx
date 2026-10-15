"use client";

import { InfoIcoon } from "@/components/InfoIcoon";

export interface WisselOptie<T extends string> {
  waarde: T;
  label: string;
  disabled?: boolean;
  /** Tooltip bij de pil, bijvoorbeeld de reden waarom hij is uitgeschakeld. */
  title?: string;
  /** Sleutel van een Info-icoon met de reden waarom de optie is uitgeschakeld. */
  infoSleutel?: string;
}

/**
 * De weergave-schakelaar (`stylesheet.md`, Weergave-schakelaar, `.weergave-wissel`): Een rij van 2 tot 3 knoppen aan elkaar
 * om van weergave te wisselen binnen één pagina. Geen navigatie: De tabbalk blijft voor lijstpagina's. De actieve knop is
 * donker met witte tekst. Pijltjes links en rechts lopen door de knoppen (`role="tablist"`).
 */
export function WeergaveWissel<T extends string>({
  opties,
  waarde,
  onChange,
  ariaLabel,
}: {
  opties: WisselOptie<T>[];
  waarde: T;
  onChange: (waarde: T) => void;
  ariaLabel: string;
}) {
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const actief = opties.filter((o) => !o.disabled);
    const i = actief.findIndex((o) => o.waarde === waarde);
    if (i === -1) return;
    e.preventDefault();
    const volgende = actief[(i + (e.key === "ArrowRight" ? 1 : actief.length - 1)) % actief.length];
    onChange(volgende.waarde);
    const knoppen = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    knoppen[opties.indexOf(volgende)]?.focus();
  }

  return (
    <div className="weergave-wissel-wrap">
      <div className="weergave-wissel" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
        {opties.map((o) => (
          <button
            key={o.waarde}
            type="button"
            role="tab"
            aria-selected={o.waarde === waarde}
            tabIndex={o.waarde === waarde ? 0 : -1}
            disabled={o.disabled}
            title={o.title}
            className={o.waarde === waarde ? "actief" : ""}
            onClick={() => onChange(o.waarde)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {opties.map((o) => (o.disabled && o.infoSleutel ? <InfoIcoon key={o.waarde} naastVeld sleutel={o.infoSleutel} /> : null))}
    </div>
  );
}
