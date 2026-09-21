"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRespondent } from "@/lib/db";
import { useAssessment } from "@/lib/assessment-store";
import { ResultsView } from "@/components/ResultsView";
import { PageWithChrome } from "@/components/PageWithChrome";

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
    if (gegevens.respondent.status === "uitgenodigd") {
      router.replace(`/scan/${respondentId}/intake`);
    } else if (gegevens.respondent.status === "bezig") {
      router.replace(`/scan/${respondentId}/doorloop`);
    }
  }, [gegevens, respondentId, router]);

  if (!gegevens || !assessment) {
    return (
      <PageWithChrome>
        <div className="flex-1 px-6 py-16 text-center text-ink-m">Laden...</div>
      </PageWithChrome>
    );
  }

  if (gegevens.respondent.status !== "afgerond") {
    return null;
  }

  const { respondent } = gegevens;

  return (
    <PageWithChrome
      navRight={
        <>
          <Link href={`/scan/${respondentId}/doorloop`}>← Pas antwoorden aan</Link>
          <button type="button" disabled title="Binnenkort beschikbaar" className="btn btn-outline">
            Exporteer als PDF
          </button>
          <button type="button" disabled title="Binnenkort beschikbaar" className="btn btn-outline">
            Exporteer als CSV
          </button>
        </>
      }
    >
      <div className="container section">
        <ResultsView
          assessment={assessment}
          antwoorden={respondent.antwoorden}
          respondentNaam={respondent.naam}
          bouwblokHref={(bouwblokId) => `/scan/${respondentId}/doorloop?bouwblok=${bouwblokId}`}
        />
      </div>
    </PageWithChrome>
  );
}
