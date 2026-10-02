"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magAlgemeneTekstenBeheren } from "@/lib/rechten";
import { useAlgemeneTeksten, zetAlgemeneTekst, AlgemeneTekstSleutel } from "@/lib/algemene-teksten-store";

const VELDEN: { sleutel: AlgemeneTekstSleutel; label: string; toelichting: string }[] = [
  {
    sleutel: "mijnMetingenIntro",
    label: "Introtekst boven 'Mijn metingen'",
    toelichting: "Staat direct onder de titel op de persoonlijke link van elke respondent/Lead.",
  },
];

/**
 * Algemene teksten (beheerpagina.md punt 2a): teksten los van een
 * specifiek Assessment. Nu enkel `mijnMetingenIntro`. Admin-only.
 */
export default function AlgemeneTekstenPage() {
  const ingelogd = useIngelogdeGebruiker();
  const teksten = useAlgemeneTeksten();
  const [opgeslagen, setOpgeslagen] = useState<AlgemeneTekstSleutel | null>(null);

  if (!magAlgemeneTekstenBeheren(ingelogd)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin kan algemene teksten beheren.</p>
      </div>
    );
  }

  function handleOpslaan(sleutel: AlgemeneTekstSleutel, waarde: string) {
    zetAlgemeneTekst(sleutel, waarde);
    setOpgeslagen(sleutel);
    setTimeout(() => setOpgeslagen((h) => (h === sleutel ? null : h)), 1600);
  }

  return (
    <div className="admin-main">
      <h1>Algemene teksten</h1>
      <p className="text-sm text-ink-m">
        Teksten los van één Assessment-type. Wijzigingen zijn direct zichtbaar, geen aparte
        publicatiestap.
      </p>

      {VELDEN.map((veld) => (
        <div key={veld.sleutel} className="admin-field mt-6" style={{ maxWidth: "40rem" }}>
          <label>{veld.label}</label>
          <div className="flex items-start gap-2">
            <textarea
              rows={3}
              defaultValue={teksten[veld.sleutel]}
              onBlur={(e) => handleOpslaan(veld.sleutel, e.target.value)}
            />
            <InfoIcoon naastVeld>{veld.toelichting}</InfoIcoon>
          </div>
          <span className={`admin-save-state ${opgeslagen === veld.sleutel ? "zichtbaar" : ""}`}>
            Opgeslagen ✓
          </span>
        </div>
      ))}
    </div>
  );
}
