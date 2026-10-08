"use client";

import { use } from "react";
import { useScanUitvoering } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magOrganisatieToegang } from "@/lib/rechten";
import { gemiddeldeAntwoordenVoorMeting } from "@/lib/scoring";
import { ResultsView } from "@/components/ResultsView";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";

/**
 * Rapportage over één meting: het gemiddelde per vraag over alle
 * afgeronde invullingen van die meting, getoond met dezelfde
 * resultaatcomponent als een individuele scan (backlog.md, "Aggregatie
 * over meerdere respondenten binnen een meting" — hier de eenvoudigste
 * invulling: het gemiddelde, geen spreiding/afwijking).
 */
export default function RapportagePage({
  params,
}: {
  params: Promise<{ scanUitvoeringId: string }>;
}) {
  const { scanUitvoeringId } = use(params);
  const gegevens = useScanUitvoering(scanUitvoeringId);
  const assessment = useAssessment(gegevens?.scanUitvoering.assessmentId ?? "");
  const ingelogd = useIngelogdeGebruiker();

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Meting niet gevonden.</p>
      </div>
    );
  }

  const { organisatie, scanUitvoering } = gegevens;

  // Bereik "eigen" (datamodel.md deel 2, Rechtenmatrix, resultaten.inzien):
  // een Consultant mag alleen rapportages inzien van organisaties die hij
  // zelf aanmaakte of waaraan een Admin hem toewees.
  if (!magOrganisatieToegang(ingelogd, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">
          Geen toegang: deze meting hoort bij een organisatie die niet door
          jou aangemaakt is en ook niet aan jou toegewezen.
        </p>
      </div>
    );
  }
  const afgerond = scanUitvoering.invullingen.filter((i) => i.status === "afgerond");

  if (afgerond.length === 0) {
    return (
      <div className="admin-main">
        <Kruimelpad
          delen={[
            { label: "Organisaties", href: "/beheer/organisaties" },
            { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
            { label: scanUitvoering.label, href: `/beheer/metingen/${scanUitvoering.id}` },
            { label: "Resultaten van de Meting" },
          ]}
        />
        <span className="eyebrow">{scanUitvoering.label}</span>
        <h1>{assessment.naam}</h1>
        <p className="admin-notice">
          Nog geen afgeronde scans voor {scanUitvoering.label} — {assessment.naam}.
        </p>
      </div>
    );
  }

  const gemiddeldeAntwoorden = gemiddeldeAntwoordenVoorMeting(assessment, scanUitvoering.invullingen);

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Organisaties", href: "/beheer/organisaties" },
          { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
          { label: scanUitvoering.label, href: `/beheer/metingen/${scanUitvoering.id}` },
          { label: "Resultaten van de Meting" },
        ]}
      />
      <span className="eyebrow">{scanUitvoering.label}</span>
      <h1>{assessment.naam}</h1>
      <p className="text-sm text-ink-m">
        Gemiddelde over {afgerond.length} {afgerond.length === 1 ? "afgeronde respondent" : "afgeronde respondenten"}
      </p>

      <div className="mt-8">
        <ResultsView assessment={assessment} antwoorden={gemiddeldeAntwoorden} toonKop={false} />
      </div>
    </div>
  );
}
