"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcoon } from "@/components/InfoIcoon";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";
import { useInstellingen, zetInstellingen } from "@/lib/instellingen-store";

/**
 * Instellingen (`beheerpagina.md`, punt 10), Admin-only, onder Applicatie. Nu de
 * bewaartermijn van ingevulde scans en de verlengtermijn: Eén globale waarde voor de
 * hele applicatie, geen instelling per organisatie. De lijst "Data ouder dan de
 * bewaartermijn" die eruit volgt staat bij Organisaties (punt 4), ook voor een Consultant.
 * De sessieduur voor respondenten en Leads volgt met e-mailverificatie en de backend.
 */
export default function InstellingenPage() {
  const gebruiker = useIngelogdeGebruiker();
  const instellingen = useInstellingen();
  const [bewaarInput, setBewaarInput] = useState<string | null>(null);
  const [verlengInput, setVerlengInput] = useState<string | null>(null);
  const [opgeslagen, setOpgeslagen] = useState(false);

  if (!magGebruikersBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Instellingen.</p>
      </div>
    );
  }

  const bewaar = bewaarInput ?? String(instellingen.bewaarTermijnDagen ?? "");
  const verleng = verlengInput ?? String(instellingen.verlengTermijnDagen ?? "");

  function handleOpslaan(e: React.FormEvent) {
    e.preventDefault();
    zetInstellingen({
      bewaarTermijnDagen: bewaar.trim() ? Number(bewaar) : null,
      verlengTermijnDagen: verleng.trim() ? Number(verleng) : null,
    });
    setBewaarInput(null);
    setVerlengInput(null);
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 1600);
  }

  return (
    <div className="admin-main">
      <Link href="/beheer/applicatie" className="admin-back">
        ← Applicatie
      </Link>
      <h1>Instellingen</h1>

      {instellingen.bewaarTermijnDagen === null && (
        <p className="admin-notice" style={{ marginTop: "1rem" }}>
          De bewaartermijn is nog niet ingesteld. Zolang dat zo is, toont de lijst &quot;Data ouder dan de
          bewaartermijn&quot; niets.
        </p>
      )}

      <h2 style={{ marginTop: "2rem" }}>Bewaartermijn ingevulde scans</h2>
      <form onSubmit={handleOpslaan} className="flex flex-wrap items-end gap-3">
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "12rem" }}>
          <label>Bewaartermijn (dagen)</label>
          <input
            type="number"
            min={1}
            value={bewaar}
            onChange={(e) => setBewaarInput(e.target.value)}
            placeholder="Geen termijn ingesteld"
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0, maxWidth: "12rem" }}>
          <label>Verlengtermijn (dagen)</label>
          <input
            type="number"
            min={1}
            value={verleng}
            onChange={(e) => setVerlengInput(e.target.value)}
            placeholder="Nog niet ingesteld"
          />
        </div>
        <button type="submit" className="btn btn-or btn-compact">
          Opslaan
        </button>
        <InfoIcoon naastVeld sleutel="info.bewaartermijn" />
        {opgeslagen && <span className="text-sm text-ink-m">Opgeslagen ✓</span>}
      </form>
    </div>
  );
}
