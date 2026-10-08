"use client";

import { useState } from "react";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magAlgemeneTekstenBeheren } from "@/lib/rechten";
import { useAlgemeneTeksten, useOpgeslagenTeksten, zetAlgemeneTekst, AlgemeneTekstSleutel } from "@/lib/algemene-teksten-store";
import { INFO_TEKSTEN } from "@/data/info-teksten";

const VELDEN: { sleutel: AlgemeneTekstSleutel; label: string }[] = [
  { sleutel: "mijnMetingenIntro", label: "Introtekst boven 'Mijn metingen'" },
];

/**
 * Algemene teksten (beheerpagina.md punt 2a): teksten los van een
 * specifiek Assessment. Nu enkel `mijnMetingenIntro`. Admin-only.
 */
export default function AlgemeneTekstenPage() {
  const ingelogd = useIngelogdeGebruiker();
  const teksten = useAlgemeneTeksten();
  const opgeslagenTeksten = useOpgeslagenTeksten();
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
      <div className="titel-rij">
        <h1>Algemene teksten</h1>
        <InfoIcoon sleutel="info.algemeneTekstenPagina" />
      </div>

      {VELDEN.map((veld) => (
        <div key={veld.sleutel} className="admin-field mt-6" style={{ maxWidth: "40rem" }}>
          <label>{veld.label}</label>
          <div className="flex items-start gap-2">
            <textarea
              rows={3}
              defaultValue={teksten[veld.sleutel]}
              onBlur={(e) => handleOpslaan(veld.sleutel, e.target.value)}
            />
            <InfoIcoon naastVeld sleutel="info.algemeneTeksten" />
          </div>
          <span className={`admin-save-state ${opgeslagen === veld.sleutel ? "zichtbaar" : ""}`}>
            Opgeslagen ✓
          </span>
        </div>
      ))}

      <div className="mt-10 flex items-center gap-2">
        <h2>Info-iconen</h2>
        <InfoIcoon sleutel="info.algemeneTekstenInfoIconen" />
      </div>
      <table className="admin-table mt-4" style={{ maxWidth: "60rem" }}>
        <thead>
          <tr>
            <th>Sleutel</th>
            <th>Plek</th>
            <th>Actuele tekst</th>
          </tr>
        </thead>
        <tbody>
          {INFO_TEKSTEN.map((t) => {
            const aangepast = (opgeslagenTeksten[t.sleutel] ?? "").trim() !== "";
            return (
              <tr key={t.sleutel}>
                <td>
                  <code>{t.sleutel}</code>
                </td>
                <td>{t.plek}</td>
                <td>
                  {aangepast ? opgeslagenTeksten[t.sleutel] : t.tekst}
                  {aangepast && <span className="admin-badge status-bezig" style={{ marginLeft: "0.5rem" }}>Aangepast</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
