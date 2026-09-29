"use client";

import { use } from "react";
import Link from "next/link";
import { useScanUitvoering } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { alleVragen } from "@/lib/assessment-structuur";
import { ResultsView } from "@/components/ResultsView";

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

  if (!gegevens || !assessment) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Meting niet gevonden.</p>
      </div>
    );
  }

  const { organisatie, scanUitvoering } = gegevens;
  const afgerond = scanUitvoering.invullingen.filter((i) => i.status === "afgerond");

  if (afgerond.length === 0) {
    return (
      <div className="admin-main">
        <Link href={`/beheer/organisaties/${organisatie.id}`} className="admin-back">
          ← {organisatie.naam}
        </Link>
        <h1>Rapportage</h1>
        <p className="admin-notice">
          Nog geen afgeronde scans voor {scanUitvoering.label} — {assessment.naam}.
        </p>
      </div>
    );
  }

  const vragen = alleVragen(assessment);
  const gemiddeldeAntwoorden: Record<string, number> = {};
  for (const vraag of vragen) {
    const waarden = afgerond
      .map((i) => i.antwoorden[vraag.id])
      .filter((w): w is number => typeof w === "number");
    if (waarden.length > 0) {
      gemiddeldeAntwoorden[vraag.id] = waarden.reduce((a, b) => a + b, 0) / waarden.length;
    }
  }

  return (
    <div className="admin-main admin-main--breed">
      <Link href={`/beheer/organisaties/${organisatie.id}`} className="admin-back">
        ← {organisatie.naam}
      </Link>
      <h1>Rapportage</h1>
      <p className="text-sm text-ink-m">
        {scanUitvoering.label} — {assessment.naam} · gemiddelde over {afgerond.length}{" "}
        {afgerond.length === 1 ? "afgeronde respondent" : "afgeronde respondenten"}
      </p>

      <div className="mt-8">
        <ResultsView assessment={assessment} antwoorden={gemiddeldeAntwoorden} />
      </div>
    </div>
  );
}
