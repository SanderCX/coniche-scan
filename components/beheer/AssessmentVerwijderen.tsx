"use client";

import { useState } from "react";
import { Assessment } from "@/lib/types";
import { useAssessments } from "@/lib/assessment-store";
import { useOrganisaties } from "@/lib/db";
import { useBenchmarks } from "@/lib/benchmark-store";
import { assessmentEffecten, assessmentGebruik, verwijderAssessment } from "@/lib/assessment-verwijderen";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { magContentBeheren } from "@/lib/rechten";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { InfoIcoon } from "@/components/InfoIcoon";

/**
 * De knop "Verwijderen" van een Assessment, op de kaart in de Assessment-lijst en op het detail (`beheerpagina.md`, punt 1,
 * Assessment verwijderen). Uitgeschakeld zolang er Metingen van zijn, met een Info-icoon (`info.assessmentVerwijderen`) dat met
 * een zin van de app begint ("Dit Assessment kan niet worden verwijderd, want er zijn nog 3 Metingen bij 2 organisaties.").
 * Onder de knop staat geen tekst. Naast de knop is een vaste plek voor het icoon, ook als er geen icoon
 * staat (`beheerpagina.md`, punt 1). De bevestiging zegt
 * wat er verdwijnt. Bij bevestigen wordt opnieuw gecontroleerd (`lib/assessment-verwijderen.ts`). Recht: `content.beheren`,
 * dus alleen een Admin.
 */
export function AssessmentVerwijderen({ assessment, naVerwijderen }: { assessment: Assessment; naVerwijderen?: () => void }) {
  const gebruiker = useIngelogdeGebruiker();
  const organisaties = useOrganisaties();
  const alleAssessments = useAssessments();
  const benchmarks = useBenchmarks();
  const [open, setOpen] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);

  if (!magContentBeheren(gebruiker)) return null;

  const gebruik = assessmentGebruik(organisaties, assessment.id);
  const geblokkeerd = gebruik.aantalMetingen > 0;
  const effecten = assessmentEffecten(assessment, alleAssessments, benchmarks);
  const enkelvoud = gebruik.aantalMetingen === 1;
  // De eerste zin van het Info-icoon maakt de app zelf, die is niet aanpasbaar (beheerpagina.md, punt 1).
  const blokkadeZin = `Dit Assessment kan niet worden verwijderd, want er ${enkelvoud ? "is" : "zijn"} nog ${gebruik.aantalMetingen} ${
    enkelvoud ? "Meting" : "Metingen"
  } bij ${gebruik.aantalOrganisaties} ${gebruik.aantalOrganisaties === 1 ? "organisatie" : "organisaties"}.`;

  function bevestig() {
    const resultaat = verwijderAssessment(assessment.id, benchmarks);
    setOpen(false);
    if (resultaat.ok) {
      naVerwijderen?.();
    } else if (resultaat.reden === "metingen") {
      // In de tussentijd is er een Meting bijgekomen: Er is niets verwijderd.
      setMelding(`Dit Assessment heeft nu ${resultaat.aantalMetingen} ${resultaat.aantalMetingen === 1 ? "Meting" : "Metingen"} en is niet verwijderd.`);
    }
  }

  return (
    <div className="assessment-verwijderen">
      <div className="assessment-verwijderen-rij">
        <button type="button" className="btn btn-outline btn-compact" disabled={geblokkeerd} onClick={() => setOpen(true)}>
          Verwijderen
        </button>
        {/* De plek van het icoon is op elke kaart gereserveerd, ook zonder icoon: Zo eindigt de knop overal op dezelfde plek. */}
        <span className="assessment-verwijderen-icoonplek">
          {geblokkeerd && <InfoIcoon naastVeld sleutel="info.assessmentVerwijderen" voorloop={blokkadeZin} />}
        </span>
      </div>
      {melding && (
        <p className="admin-notice" role="status" style={{ margin: "0.5rem 0 0" }}>
          {melding}
        </p>
      )}
      <BevestigModal
        open={open}
        titel="Assessment verwijderen?"
        bericht={
          <>
            <p>Weet je zeker dat je {assessment.naam} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</p>
            <p style={{ marginTop: "0.6rem", fontWeight: 600 }}>Wat er verdwijnt:</p>
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.2rem" }}>
              <li>
                Het Assessment met {effecten.aantalCategorieen > 0 ? `${effecten.aantalCategorieen} categorieën, ` : ""}
                {effecten.aantalBouwblokken} bouwblokken en {effecten.aantalVragen} vragen, ook de gearchiveerde.
              </li>
              {effecten.benchmarkNamen.length > 0 && (
                <li>
                  Het wordt uit {effecten.benchmarkNamen.length === 1 ? "de benchmark" : "de benchmarks"} gehaald: {effecten.benchmarkNamen.join(", ")}.
                </li>
              )}
              {effecten.afgeleideNamen.length > 0 && (
                <li>
                  {effecten.afgeleideNamen.join(", ")} {effecten.afgeleideNamen.length === 1 ? "is" : "zijn"} ervan afgeleid: De inhoud blijft,
                  alleen de regel &quot;Afgeleid van&quot; vervalt.
                </li>
              )}
            </ul>
          </>
        }
        bevestigLabel="Verwijderen"
        onBevestigen={bevestig}
        onAnnuleren={() => setOpen(false)}
      />
    </div>
  );
}
