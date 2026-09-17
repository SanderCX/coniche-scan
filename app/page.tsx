"use client";

import Link from "next/link";
import { useAssessments } from "@/lib/assessment-store";
import { AssessmentCard } from "@/components/AssessmentCard";
import { PageWithChrome } from "@/components/PageWithChrome";

export default function Home() {
  const assessments = useAssessments();

  return (
    <PageWithChrome>
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-m">
          Coniche Scan
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
          Kies jouw assessment
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-m">
          Elke scan geeft direct inzicht in waar jouw organisatie staat en welke
          verbeterkansen er liggen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/beheer" className="text-sm text-ink-m hover:text-ink">
          Coniche-medewerker? Ga naar Beheer →
        </Link>
      </div>
    </div>
    </PageWithChrome>
  );
}
