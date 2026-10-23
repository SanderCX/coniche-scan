"use client";

import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magAdviescatalogusBeheren } from "@/lib/rechten";

/** `adviesverloop.catalogus`: Alleen een Admin. Een Consultant heeft de tab niet en bereikt de pagina ook niet via de adresregel (`beheerpagina.md`, punt 17). */
export default function AdviescatalogusLayout({ children }: { children: React.ReactNode }) {
  const gebruiker = useIngelogdeGebruiker();
  if (!magAdviescatalogusBeheren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: alleen een Admin kan de adviescatalogus beheren.</p>
      </div>
    );
  }
  return <>{children}</>;
}
