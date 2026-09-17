"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { alleVragen } from "@/lib/assessment-structuur";

export default function AssessmentLandingPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const assessment = useAssessment(assessmentId);

  if (!assessment) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-ink-m">
        Assessment niet gevonden.
      </div>
    );
  }

  const totaalVragen = alleVragen(assessment).length;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="text-center">
        <span className="text-4xl">{assessment.icoon}</span>
        <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
          {assessment.naam}
        </h1>
        <p className="mt-2 text-lg text-ink-m">{assessment.subtitel}</p>
        <p className="mx-auto mt-4 max-w-2xl text-ink-m">{assessment.beschrijving}</p>
        <p className="mt-3 text-sm text-ink-m">Bedoeld voor: {assessment.doelgroep}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${assessment.id}/voorbeeld`}
            className="rounded-lg bg-or px-6 py-3 text-sm font-semibold text-white transition hover:bg-or-l hover:-translate-y-px"
          >
            Bekijk voorbeeld-output
          </Link>
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs text-ink-m">
          Deze scan vul je in via een persoonlijke uitnodiging per e-mail —
          neem contact op met Coniche om een scan te starten voor jouw
          organisatie.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {assessment.featureCards.map((card) => (
          <div key={card.titel} className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-ink">{card.titel}</h3>
            <p className="mt-2 text-sm text-ink-m">{card.tekst}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-ink">Praktische informatie</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-ink">Invultijd</dt>
            <dd className="text-sm text-ink-m">
              {assessment.geschatteDuur}, verdeeld over {totaalVragen} vragen.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ink">Direct resultaat</dt>
            <dd className="text-sm text-ink-m">
              Na afronding zie je meteen je scores en classificaties.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ink">AI-samenvatting</dt>
            <dd className="text-sm text-ink-m">
              Binnenkort: een AI-gegenereerde managementsamenvatting van je resultaten.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ink">Privacy</dt>
            <dd className="text-sm text-ink-m">
              Toegang verloopt via een persoonlijke, niet-herleidbare link en
              een verificatiecode per e-mail.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
