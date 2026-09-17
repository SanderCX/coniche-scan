"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { isGeverifieerd } from "@/lib/verificatie";
import { ResultsView } from "@/components/ResultsView";

export default function ResultatenPage({
  params,
}: {
  params: Promise<{ respondentId: string }>;
}) {
  const { respondentId } = use(params);
  const gegevens = useRespondent(respondentId);
  const assessment = useAssessment(gegevens?.organisatie.assessmentId ?? "");
  const router = useRouter();

  useEffect(() => {
    if (!gegevens) return;
    if (!isGeverifieerd(respondentId)) {
      router.replace(`/uitnodiging/${respondentId}`);
      return;
    }
    if (gegevens.respondent.status === "uitgenodigd") {
      router.replace(`/scan/${respondentId}/intake`);
    } else if (gegevens.respondent.status === "bezig") {
      router.replace(`/scan/${respondentId}/doorloop`);
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens || !assessment) {
    return <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>;
  }

  if (gegevens.respondent.status !== "afgerond") {
    return null;
  }

  const { respondent } = gegevens;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-m">
            Resultaten
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{assessment.naam}</h1>
        </div>
        <Link
          href={`/scan/${respondentId}/doorloop`}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-gray-400"
        >
          ← Pas antwoorden aan
        </Link>
      </div>

      <ResultsView
        assessment={assessment}
        antwoorden={respondent.antwoorden}
        respondentNaam={respondent.naam}
        bouwblokHref={(bouwblokId) => `/scan/${respondentId}/doorloop?bouwblok=${bouwblokId}`}
      />
    </div>
  );
}
