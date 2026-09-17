"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssessment } from "@/data/assessments";
import { useRespondent } from "@/lib/use-respondent";
import { ResultsView } from "@/components/ResultsView";

export default function ResultatenPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = getAssessment(assessmentId);
  const router = useRouter();
  const respondent = useRespondent();

  useEffect(() => {
    if (respondent === null) {
      router.replace(`/${assessmentId}/start`);
    }
  }, [respondent, assessmentId, router]);

  if (!assessment) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-slate-600">
        Assessment niet gevonden.
      </div>
    );
  }

  if (!respondent) {
    return <div className="flex-1 px-6 py-16 text-center text-slate-400">Laden...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Resultaten
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{assessment.naam}</h1>
      </div>

      <ResultsView
        assessment={assessment}
        antwoorden={respondent.antwoorden}
        respondentNaam={respondent.naam}
      />
    </div>
  );
}
