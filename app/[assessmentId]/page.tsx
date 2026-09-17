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
      <div className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center text-slate-600">
        Assessment niet gevonden.
      </div>
    );
  }

  const totaalVragen = alleVragen(assessment).length;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="text-center">
        <span className="text-4xl">{assessment.icoon}</span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
          {assessment.naam}
        </h1>
        <p className="mt-2 text-lg text-slate-500">{assessment.subtitel}</p>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">{assessment.beschrijving}</p>
        <p className="mt-3 text-sm text-slate-400">Bedoeld voor: {assessment.doelgroep}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${assessment.id}/voorbeeld`}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Bekijk voorbeeld-output
          </Link>
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs text-slate-400">
          Deze scan vul je in via een persoonlijke uitnodiging per e-mail —
          neem contact op met Coniche om een scan te starten voor jouw
          organisatie.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {assessment.featureCards.map((card) => (
          <div key={card.titel} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">{card.titel}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.tekst}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Praktische informatie</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-800">Invultijd</dt>
            <dd className="text-sm text-slate-600">
              {assessment.geschatteDuur}, verdeeld over {totaalVragen} vragen.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-800">Direct resultaat</dt>
            <dd className="text-sm text-slate-600">
              Na afronding zie je meteen je scores en classificaties.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-800">AI-samenvatting</dt>
            <dd className="text-sm text-slate-600">
              Binnenkort: een AI-gegenereerde managementsamenvatting van je resultaten.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-800">Privacy</dt>
            <dd className="text-sm text-slate-600">
              Toegang verloopt via een persoonlijke, niet-herleidbare link en
              een verificatiecode per e-mail.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
