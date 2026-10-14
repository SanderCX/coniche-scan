"use client";

import { use } from "react";
import { useOrganisatie } from "@/lib/db";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magImporteren } from "@/lib/rechten";
import { ImportScans } from "@/components/beheer/ImportScans";

/**
 * Importeren in één organisatie (`beheerpagina.md`, punt 8): Alleen voor een Admin. Een Consultant krijgt de melding in
 * plaats van de importfunctie, ook als hij de route rechtstreeks opent. De tekst staat vast in de code en hoort niet in het
 * register van Algemene teksten. Een importverzoek van een Consultant wordt in `voerLegacyImportUit` geweigerd.
 */
export default function ImportPagina({ params }: { params: Promise<{ organisatieId: string }> }) {
  const { organisatieId } = use(params);
  const gebruiker = useIngelogdeGebruiker();
  const organisatie = useOrganisatie(organisatieId);
  if (!magImporteren(gebruiker)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Vraag de beheerder om bestanden te importeren.</p>
      </div>
    );
  }
  if (!organisatie) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Organisatie niet gevonden.</p>
      </div>
    );
  }
  return <ImportScans doel={organisatie} />;
}
