"use client";

import { CATEGORIE_COLORS, tekstOpKleur } from "@/lib/colors";

/** De kleur van een bouwblok in het Dossier: De categoriekleur, of oranje zonder. */
export function chipKleur(groepKleur: string | null | undefined): string {
  return (groepKleur && CATEGORIE_COLORS[groepKleur]?.hex) || "#ff671f";
}

/** De cirkel van 22px met het nummer van het bouwblok in de categoriekleur (bij Fundament `--ink` op geel, `stylesheet.md`, Categoriekleuren). */
export function BouwblokCirkel({ volgnummer, groepKleur, groot = false }: { volgnummer: number; groepKleur: string | null | undefined; groot?: boolean }) {
  const kleur = chipKleur(groepKleur);
  return (
    <span className={`dos-cirkel ${groot ? "dos-cirkel--groot" : ""}`} style={{ background: kleur, color: tekstOpKleur(kleur) }} aria-hidden="true">
      {volgnummer}
    </span>
  );
}

/**
 * Een bouwblok als chip (`dossier.md`, Scherm 3 en Scherm 5, Chips): De cirkel met het nummer en de naam, 13px. In het formulier is de chip
 * een keuze (`gekozen`, oranje rand en `--or-faint`), op de pagina van de Lead filtert een klik (`aria-pressed` bij het gekozen bouwblok).
 * Zonder `onClick` is de chip alleen tekst.
 */
export function BouwblokChip({
  volgnummer,
  naam,
  groepKleur,
  gekozen = false,
  onClick,
  title,
}: {
  volgnummer: number;
  naam: string;
  groepKleur: string | null | undefined;
  gekozen?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const inhoud = (
    <>
      <BouwblokCirkel volgnummer={volgnummer} groepKleur={groepKleur} />
      <span>{naam}</span>
    </>
  );
  if (!onClick) return <span className="dos-chip" title={title}>{inhoud}</span>;
  return (
    <button type="button" className={`dos-chip ${gekozen ? "is-gekozen" : ""}`} aria-pressed={gekozen} onClick={onClick} title={title}>
      {inhoud}
    </button>
  );
}
