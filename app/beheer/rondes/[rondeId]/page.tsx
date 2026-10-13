"use client";

import { use, useState } from "react";
import { useOrganisaties } from "@/lib/db";
import { useAssessments } from "@/lib/assessment-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { isAdmin } from "@/lib/rechten";
import { aantalAfgerondInMeting, gemiddeldeAntwoordenVoorMetingMetSamenstelling, metingenInRonde, onderdeelVan, rondesVan } from "@/lib/rondes";
import { matrix } from "@/lib/visualisatie";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";

/**
 * Overzicht van een ronde (`visualisatie-scores.md`, E, Overzicht van een ronde): De matrix van één ronde met de onderdelen als
 * kolommen en de Metingen van die ronde voor één Assessment. Opbouw, tegels en rechten zijn gelijk aan niveau 2: Alleen voor
 * een Admin, omdat de kolomkoppen de namen van de onderdelen tonen. Het overzicht hoort niet bij een benchmark en bestaat
 * ook voor een organisatie met één ronde.
 */
export default function RondeOverzichtPage({ params }: { params: Promise<{ rondeId: string }> }) {
  const { rondeId } = use(params);
  const organisaties = useOrganisaties();
  const assessments = useAssessments();
  const ingelogd = useIngelogdeGebruiker();
  const [gekozen, setGekozen] = useState("");

  const organisatie = organisaties.find((o) => rondesVan(o).some((r) => r.id === rondeId));
  const ronde = organisatie && rondesVan(organisatie).find((r) => r.id === rondeId);
  if (!organisatie || !ronde) {
    return (
      <div className="admin-main">
        <p className="text-sm text-ink-m">Ronde niet gevonden.</p>
      </div>
    );
  }
  if (!isAdmin(ingelogd)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang: Het overzicht van een ronde is alleen voor een Admin.</p>
      </div>
    );
  }

  const metingen = metingenInRonde(organisatie, ronde.id);
  const assessmentIds = [...new Set(metingen.map((m) => m.assessmentId))];
  const assessmentId = assessmentIds.includes(gekozen) ? gekozen : assessmentIds[0];
  const assessment = assessments.find((a) => a.id === assessmentId);
  const kolommen = metingen.filter((m) => m.assessmentId === assessmentId);

  return (
    <div className="admin-main admin-main--breed">
      <Kruimelpad
        delen={[
          { label: "Organisaties", href: "/beheer/organisaties" },
          { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
          { label: ronde.label },
        ]}
      />
      <span className="eyebrow">Overzicht van de ronde</span>
      <h1>{ronde.label}</h1>
      {assessmentIds.length > 1 && (
        <div className="admin-field" style={{ maxWidth: "24rem" }}>
          <label>Assessment</label>
          <select value={assessmentId} onChange={(e) => setGekozen(e.target.value)}>
            {assessmentIds.map((id) => (
              <option key={id} value={id}>
                {assessments.find((a) => a.id === id)?.naam ?? "Onbekend type"}
              </option>
            ))}
          </select>
        </div>
      )}
      {!assessment || kolommen.length === 0 ? (
        <p className="admin-notice">Deze ronde heeft nog geen Metingen om te vergelijken.</p>
      ) : (
        <WeergaveMatrix
          assessment={assessment}
          kolomSoort="onderdeel"
          weergave={matrix(
            assessment,
            kolommen.map((m) => ({
              label: onderdeelVan(m),
              sublabel: m.label,
              aantalScans: aantalAfgerondInMeting(organisatie, m),
              antwoorden: gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, m),
            }))
          )}
        />
      )}
    </div>
  );
}
