"use client";

import { use } from "react";
import { useScanInvulling } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang } from "@/lib/rechten";
import { ResultsView } from "@/components/ResultsView";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { ExporterenNavKnop } from "@/components/beheer/ExporterenNavKnop";
import { useBeheerNavActions } from "@/components/beheer/BeheerNavActions";

/**
 * Resultatenscherm van één scan in beheer (CLAUDE.md sectie 3, scherm 6,
 * beheerpagina.md "Navigatie in beheer"): dezelfde resultaatcomponent als
 * aan de respondentkant, maar met de beheer-nav, een kruimelpad en alleen
 * de dropdown "Exporteren". Terug gaat via het kruimelpad naar het
 * Meting-overzicht.
 */
export default function BeheerResultatenPage({ params }: { params: Promise<{ scanInvullingId: string }> }) {
  const { scanInvullingId } = use(params);
  const gegevens = useScanInvulling(scanInvullingId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const ingelogd = useIngelogdeGebruiker();

  useBeheerNavActions(<ExporterenNavKnop scanInvullingId={scanInvullingId} />);

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Scan niet gevonden.</p>
      </div>
    );
  }
  const { organisatie, scanUitvoering, lid, invulling } = gegevens;

  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze scan hoort bij een organisatie die niet door jou is aangemaakt en ook niet aan jou is
          toegewezen.
        </p>
      </div>
    );
  }

  const naam = lid.naam || lid.email;
  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Organisaties", href: "/beheer/organisaties" },
          { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
          { label: scanUitvoering.label, href: `/beheer/metingen/${scanUitvoering.id}` },
          { label: `Resultaten van ${naam}` },
        ]}
      />
      {invulling.status !== "afgerond" ? (
        <p className="admin-notice">De scan van {naam} is nog niet afgerond, er zijn nog geen resultaten.</p>
      ) : (
        <ResultsView assessment={assessment} antwoorden={invulling.antwoorden} respondentNaam={lid.naam} />
      )}
    </div>
  );
}
