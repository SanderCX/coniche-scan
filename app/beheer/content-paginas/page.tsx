"use client";

import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magGebruikersBeheren } from "@/lib/rechten";

/**
 * Content-pagina's (`beheerpagina.md`, punt 11), Admin-only, een tab onder Instellingen. Beheerbaar maken is
 * gespecificeerd maar nog niet gebouwd: Wacht op overleg (`backlog.md`, Content-pagina's).
 */
export default function ContentPaginasPage() {
  const gebruiker = useIngelogdeGebruiker();

  if (!magGebruikersBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin ziet Content-pagina&apos;s.</p>
      </div>
    );
  }

  return (
    <div className="admin-main">
      <h1>Content-pagina&apos;s</h1>
      <p className="admin-notice" style={{ marginTop: "1rem" }}>
        Nog niet gebouwd. De pagina&apos;s Visie, Bouwstenen, AI en 2030 staan voorlopig in de code, tot de uitwerking
        van het beheer is afgestemd.
      </p>
    </div>
  );
}
