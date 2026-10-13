"use client";

import { useOrganisaties } from "@/lib/db";
import { gebruikteFuncties } from "@/lib/kenmerken-opties";
import { RESPONDENT_ROLLEN } from "@/data/respondent-rollen";
import { KeuzelijstMetEigenOptie } from "./KeuzelijstMetEigenOptie";

/**
 * De keuzelijst voor "Rol / functie" van een Respondent (`content-respondentrol.md`): De vaste rollen in de
 * aangeleverde volgorde, daarna wat andere Respondenten hebben ingevuld, en "Anders…". Het veld blijft gewone tekst in
 * `Respondent.functie`. Eén component voor de intake, "Mijn gegevens", Respondent bewerken en Conflict oplossen.
 */
export function RespondentFunctieKeuze({
  waarde,
  onChange,
  name,
  required,
  variant = "veld",
}: {
  waarde: string;
  onChange: (waarde: string) => void;
  /** Naam van het verborgen veld, voor een `<form>` met `FormData` (intake en "Mijn gegevens"). */
  name?: string;
  required?: boolean;
  /** `veld`: Respondentkant (`select.field`). `beheer`: `.admin-field`. `compact`: `.veld-compact` in een tabel of rij. */
  variant?: "veld" | "beheer" | "compact";
}) {
  const organisaties = useOrganisaties();
  return (
    <KeuzelijstMetEigenOptie
      waarde={waarde}
      onChange={onChange}
      voorop={RESPONDENT_ROLLEN}
      gebruikt={gebruikteFuncties(organisaties)}
      placeholder="Jouw rol of functie"
      ariaLabel="Rol / functie"
      name={name}
      required={required}
      selectClassName={variant === "veld" ? "field" : variant === "compact" ? "veld-compact" : undefined}
      // `select.field` heeft de marge van `.field`: Die staat al op de omringende rij.
      selectStyle={variant === "veld" ? { marginBottom: 0 } : variant === "compact" ? { width: "100%" } : undefined}
      inputClassName={variant === "compact" ? "veld-compact" : undefined}
      inputStyle={variant === "compact" ? { width: "100%" } : undefined}
    />
  );
}
