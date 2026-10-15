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
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-m">
            Voorbeeld-output
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{assessment.naam}</h1>
        </div>
        <Link
          href={`/${assessment.id}`}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-gray-400"
        >
          ← Terug
        </Link>
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
          <h2>Gemiddelde en afwijking</h2>
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
