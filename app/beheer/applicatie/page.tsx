"use client";

import { InfoIcoon } from "@/components/InfoIcoon";
import { useState } from "react";
import Link from "next/link";
import { controleerDataIntegriteit } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";

/**
 * "Applicatie" (beheerpagina.md, Wat beheerbaar is): Gebruikers (9),
 * Instellingen (10) en Content-pagina's (11) zijn Admin-only; Algemene
 * teksten (2a) ook. De laatste twee zijn nog niet gebouwd, zie de
 * status per onderdeel in `beheerpagina.md`.
 */
export default function ApplicatiePage() {
  const gebruiker = useIngelogdeGebruiker();
  const [integriteitResultaat, setIntegriteitResultaat] = useState<string[] | null>(null);

  if (!magGebruikersBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Applicatie.</p>
      </div>
    );
  }

  return (
    <div className="admin-main">
      <h1>Applicatie</h1>
      <p className="text-sm text-ink-m">
        Instellingen die voor de hele omgeving gelden, niet voor één organisatie of Assessment.
      </p>

      <div className="admin-list mt-6">
        <Link href="/beheer/gebruikers" className="admin-row">
          <div>
            <p className="admin-row-titel">Gebruikers</p>
            <p className="admin-row-sub">Admin- en Consultant-accounts, rollen en 2FA-reset.</p>
          </div>
        </Link>
        <Link href="/beheer/teksten" className="admin-row">
          <div>
            <p className="admin-row-titel">Algemene teksten</p>
            <p className="admin-row-sub">
              Teksten los van één Assessment, bijv. de introtekst op &quot;Mijn metingen&quot;.
            </p>
          </div>
        </Link>
        <div className="admin-row" style={{ cursor: "default", opacity: 0.6 }}>
          <div>
            <p className="admin-row-titel">Instellingen</p>
            <p className="admin-row-sub">Nog niet gebouwd — wacht op de backend (sessieduur respondenten/Leads).</p>
          </div>
        </div>
        <div className="admin-row" style={{ cursor: "default", opacity: 0.6 }}>
          <div>
            <p className="admin-row-titel">Content-pagina&apos;s (Visie, Bouwstenen, AI, 2030)</p>
            <p className="admin-row-sub">Nog niet gebouwd — het onderliggende datamodel staat nog open.</p>
          </div>
        </div>
      </div>

      <div className="admin-notice mt-10" style={{ maxWidth: "36rem" }}>
        <p className="font-semibold text-ink">Data-integriteit</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIntegriteitResultaat(controleerDataIntegriteit())}
            className="btn btn-outline btn-compact"
          >
            Controleer nu
          </button>
          <InfoIcoon>
            Controleert of er, bijvoorbeeld na een verwijderactie, nog ingevulde scans zijn die naar een
            niet-bestaande respondent verwijzen (v1-aanpassingen.md punt 14).
          </InfoIcoon>
        </div>
        {integriteitResultaat && (
          <div className="mt-3">
            {integriteitResultaat.length === 0 ? (
              <p className="text-sm font-medium" style={{ color: "var(--stat-green)" }}>
                ✓ Geen achterblijvende data gevonden.
              </p>
            ) : (
              <ul className="text-sm" style={{ color: "var(--stat-red)" }}>
                {integriteitResultaat.map((probleem, i) => (
                  <li key={i}>{probleem}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
