"use client";

import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magContentBeheren } from "@/lib/rechten";

/**
 * Eén toegangspoort voor de hele `/beheer/content/*`-boom (overzicht,
 * nieuw, en elk Assessment-detail): `content.beheren` staat in de
 * Rechtenmatrix (`datamodel.md` deel 2) nog als "te bevestigen" voor een
 * Consultant — hier dus standaard geen toegang (`lib/rechten.ts`), net als
 * de link zelf al verborgen is in `BeheerChrome`. Voorkomt dat iemand er
 * alsnog bij kan door de URL rechtstreeks te openen.
 */
export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const gebruiker = useIngelogdeGebruiker();

  if (!magContentBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin kan content beheren.</p>
      </div>
    );
  }

  return <>{children}</>;
}
