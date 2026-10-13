"use client";

import { useState } from "react";
import { kiesSpelling, optieLijst } from "@/lib/kenmerken-opties";

const ANDERS = "__anders__";

/**
 * Een keuzelijst met "Anders…" onderaan voor een eigen invoer: Eén component voor de organisatievelden bij Techstack
 * (`components/beheer/KenmerkenForm.tsx`) en voor Rol / functie van een Respondent (`RespondentFunctieKeuze`).
 *
 * De lijst is `voorop` (in die volgorde, niet alfabetisch), dan `opties` en wat er verder is ingevuld (`gebruikt`) op
 * alfabet, en de huidige waarde staat er altijd in (`lib/kenmerken-opties.ts`). Het invoerveld bij "Anders…" bewaart
 * pas bij Enter of bij het verlaten van het veld, zodat er geen halve woorden in de lijst komen.
 *
 * Met `name` staat de waarde ook in een verborgen veld, zodat een gewoon `<form>` met `FormData` hem leest.
 */
export function KeuzelijstMetEigenOptie({
  waarde,
  onChange,
  opties = [],
  voorop = [],
  gebruikt = [],
  placeholder = "Naam van de oplossing",
  ariaLabel,
  name,
  required,
  selectClassName,
  selectStyle,
  inputClassName,
  inputStyle,
}: {
  waarde: string;
  onChange: (waarde: string) => void;
  opties?: string[];
  voorop?: string[];
  gebruikt?: string[];
  placeholder?: string;
  ariaLabel: string;
  name?: string;
  required?: boolean;
  selectClassName?: string;
  selectStyle?: React.CSSProperties;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
}) {
  const [andersOpen, setAndersOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const lijst = optieLijst(opties, gebruikt, waarde, voorop);

  function bewaarConcept() {
    const gekozen = kiesSpelling(concept, lijst);
    if (gekozen) onChange(gekozen);
    setAndersOpen(false);
    setConcept("");
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={waarde} />}
      <select
        className={selectClassName}
        style={selectStyle}
        aria-label={ariaLabel}
        required={required}
        value={andersOpen ? ANDERS : waarde}
        onChange={(e) => {
          if (e.target.value === ANDERS) {
            setAndersOpen(true);
            setConcept("");
          } else {
            setAndersOpen(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Kies...</option>
        {lijst.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={ANDERS}>Anders…</option>
      </select>
      {andersOpen && (
        <input
          type="text"
          autoFocus
          required={required}
          className={inputClassName}
          style={{ marginTop: "0.4rem", ...inputStyle }}
          placeholder={placeholder}
          aria-label={`${ariaLabel}, anders`}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onBlur={bewaarConcept}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              bewaarConcept();
            }
          }}
        />
      )}
    </>
  );
}
