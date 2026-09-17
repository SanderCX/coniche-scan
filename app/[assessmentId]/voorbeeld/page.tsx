"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { getDemoAntwoorden, demoRespondentNaam } from "@/data/demo-antwoorden-per-assessment";
import { ResultsView } from "@/components/ResultsView";
import { PageWithChrome } from "@/components/PageWithChrome";

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
        respondentNaam={demoRespondentNaam}
        isPreview
      />
    </div>
    </PageWithChrome>
  );
}
