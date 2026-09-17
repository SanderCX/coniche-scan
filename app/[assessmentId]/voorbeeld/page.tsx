"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { getDemoAntwoorden, demoRespondentNaam } from "@/data/demo-antwoorden-per-assessment";
import { ResultsView } from "@/components/ResultsView";

export default function VoorbeeldPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);

  if (!assessment) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-slate-600">
        Assessment niet gevonden.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Voorbeeld-output
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{assessment.naam}</h1>
        </div>
        <Link
          href={`/${assessment.id}`}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
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
  );
}
