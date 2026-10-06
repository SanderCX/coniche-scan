"use client";

import Link from "next/link";
import { DataIntegriteit } from "@/components/beheer/DataIntegriteit";
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
        <Link href="/beheer/audit" className="admin-row">
          <div>
            <p className="admin-row-titel">Audit-log</p>
            <p className="admin-row-sub">Wie wat deed, wanneer en op welk record. Imports als groep, export naar CSV.</p>
          </div>
        </Link>
        <Link href="/beheer/instellingen" className="admin-row">
          <div>
            <p className="admin-row-titel">Instellingen</p>
            <p className="admin-row-sub">Bewaartermijn van ingevulde scans en de verlengtermijn.</p>
          </div>
        </Link>
        <div className="admin-row" style={{ cursor: "default", opacity: 0.6 }}>
          <div>
            <p className="admin-row-titel">Content-pagina&apos;s (Visie, Bouwstenen, AI, 2030)</p>
            <p className="admin-row-sub">Nog niet gebouwd — het onderliggende datamodel staat nog open.</p>
          </div>
        </div>
      </div>

      <DataIntegriteit />
    </div>
  );
}
