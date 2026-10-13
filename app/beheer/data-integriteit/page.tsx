"use client";

import { DataIntegriteit } from "@/components/beheer/DataIntegriteit";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";

/** Data-integriteit (`beheerpagina.md`, punt 13), Admin-only, een tab onder Instellingen. Stond eerder op Applicatie. */
export default function DataIntegriteitPage() {
  const gebruiker = useIngelogdeGebruiker();

  if (!magGebruikersBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Data-integriteit.</p>
      </div>
    );
  }

  return (
    <div className="admin-main">
      <DataIntegriteit />
    </div>
  );
}
