"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { getDemoAntwoorden, getDemoMetingScans, getDemoRelevantie, demoRespondentNaam } from "@/data/demo-antwoorden-per-assessment";
import { ResultsView } from "@/components/ResultsView";
import { PageWithChrome } from "@/components/PageWithChrome";
import { WeergaveBouwblok } from "@/components/visualisatie/WeergaveBouwblok";
import { eenMeting } from "@/lib/visualisatie";

export default function VoorbeeldPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);

  if (!assessment) {
    return (
      <PageWithChrome>
        <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-ink-m">
          Assessment niet gevonden.
        </div>
      </PageWithChrome>
    );
  }

  const demoMeting = getDemoMetingScans(assessment.id);

  return (
    <PageWithChrome>
    <div className="container" style={{ padding: "3.5rem 2rem 4.5rem" }}>
      {/* De kop van de voorbeeldpagina (`CLAUDE.md`, scherm 3): Een oranje eyebrow, daaronder de h1 met rechts ernaast, verticaal
          uitgelijnd met de h1, de knop "← Terug". De kop mag afbreken (`min-width: 0`), de knop niet. */}
      <div style={{ marginBottom: "2rem" }}>
        <span className="eyebrow">Voorbeeld-output</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", marginTop: "0.3rem" }}>
          <h1 style={{ margin: 0, minWidth: 0 }}>{assessment.naam}</h1>
          <Link href={`/${assessment.id}`} className="btn btn-outline btn-compact">
            ← Terug
          </Link>
        </div>
      </div>

      <ResultsView
        assessment={assessment}
        antwoorden={getDemoAntwoorden(assessment.id)}
        relevantie={getDemoRelevantie(assessment.id)}
        respondentNaam={demoRespondentNaam}
        isPreview
        // De pagina heeft zelf al de kop met de naam van het Assessment: Zonder dit staat hij er twee keer.
        toonKop={false}
      />

      {demoMeting && (
        // Wat er bij meerdere respondenten van dezelfde Meting en organisatie bij komt: Het gemiddelde en de afwijking daarop
        // (`visualisatie-scores.md`, A, Per bouwblok).
        <section style={{ marginTop: "4rem" }}>
          <span className="eyebrow">Meerdere respondenten</span>
          <h2 style={{ margin: "0.3rem 0 0" }}>Gemiddelde en afwijking</h2>
          <p className="mt-2 text-ink-m">
            Wanneer er meerdere respondenten voor de zelfde meting en organisatie de scan hebben ingevuld, verschaft de tool ook
            inzicht in de gemiddelde scores en afwijkingen daarop.
          </p>
          <p className="text-sm text-ink-m" style={{ margin: "1rem 0 1.2rem" }}>
            Gemiddelde over {demoMeting.length} afgeronde respondenten
          </p>
          <WeergaveBouwblok assessment={assessment} weergave={eenMeting(assessment, demoMeting)} toonBereik />
        </section>
      )}
    </div>
    </PageWithChrome>
  );
}
