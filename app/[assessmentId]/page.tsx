"use client";

import { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import { alleVragen } from "@/lib/assessment-structuur";
import { PageWithChrome } from "@/components/PageWithChrome";

export default function AssessmentLandingPage({
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

  const totaalVragen = alleVragen(assessment).length;

  return (
    <PageWithChrome>
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="text-center">
          <span className="text-4xl">{assessment.icoon}</span>
          <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">{assessment.naam}</h1>
          <p className="mt-2 text-lg text-ink-m">{assessment.subtitel}</p>
          <p className="mx-auto mt-4 max-w-2xl text-ink-m">{assessment.beschrijving}</p>
          <p className="mt-3 text-sm text-ink-m">Bedoeld voor: {assessment.doelgroep}</p>

          <div className="btn-rij" style={{ margin: "2rem auto 0", maxWidth: "26rem" }}>
            <button
              type="button"
              disabled
              title="Toegang verloopt via een persoonlijke link die Coniche met je deelt."
              className="btn btn-or"
            >
              Start assessment
            </button>
            <Link href={`/${assessment.id}/voorbeeld`} className="btn btn-outline">
              Bekijk wat je krijgt
            </Link>
          </div>
          <p className="mx-auto mt-4 max-w-md text-xs text-ink-s">
            Deze scan vul je in via een persoonlijke link die Coniche met je deelt — neem contact
            op met Coniche om een scan te starten voor jouw organisatie.
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
              <dt className="text-sm font-medium text-ink">Privacy</dt>
              <dd className="text-sm text-ink-m">
                Toegang verloopt via een persoonlijke, niet-herleidbare link die Coniche met je
                deelt.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </PageWithChrome>
  );
}
