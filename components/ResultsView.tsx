import Link from "next/link";
import { Assessment } from "@/lib/types";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  classificatie,
  overallScore,
  topSterktesEnVerbeterkansen,
  voortgang,
} from "@/lib/scoring";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { ScoreCircle } from "./ScoreCircle";
import { RadarChartView } from "./RadarChartView";
import { CategoryBarChart } from "./CategoryBarChart";

export function ResultsView({
  assessment,
  antwoorden,
  respondentNaam,
  isPreview = false,
  bouwblokHref,
}: {
  assessment: Assessment;
  antwoorden: Record<string, number>;
  respondentNaam?: string;
  isPreview?: boolean;
  /** Als gezet: bouwblokken in de top 3-lijsten linken hiernaartoe om het antwoord aan te passen. */
  bouwblokHref?: (bouwblokId: string) => string;
}) {
  const bouwblokResultaten = alleBouwblokResultaten(assessment, antwoorden);
  const groepResultaten = alleGroepResultaten(assessment, bouwblokResultaten);
  const overall = overallScore(bouwblokResultaten.map((r) => r.score));
  const { beantwoord, totaal } = voortgang(assessment, antwoorden);
  const { sterktes, verbeterkansen } = topSterktesEnVerbeterkansen(bouwblokResultaten);
  const vlak = isVlakkeAssessment(assessment);
  const groepHeading = vlak
    ? `Scores per ${assessment.bouwblokEenheidEnkelvoud}`
    : "Per categorie";

  return (
    <div className="space-y-10">
      {isPreview && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink-m">
          Dit is een voorbeeld met demo-data — zo ziet jouw resultatenscherm eruit
          na afronding van de scan.
        </div>
      )}

      <section className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 text-center sm:flex-row sm:justify-center sm:gap-12 sm:text-left">
        {overall !== null && <ScoreCircle score={overall} classificatie={classificatie(overall)} />}
        <div>
          <p className="text-sm font-medium text-ink-m">
            {respondentNaam ? `Resultaat voor ${respondentNaam}` : "Overall score"}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            {assessment.naam}
          </h2>
          <p className="mt-2 text-sm text-ink-m">
            {beantwoord} van {totaal} vragen beantwoord
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-ink">
            Alle {assessment.bouwblokEenheidMeervoud}
          </h3>
          <RadarChartView resultaten={bouwblokResultaten} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-ink">{groepHeading}</h3>
          <CategoryBarChart resultaten={groepResultaten} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-ink">
            Top 3 Sterktes
          </h3>
          <ol className="space-y-2">
            {sterktes.map((r) => (
              <li
                key={r.bouwblok.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                {bouwblokHref ? (
                  <Link
                    href={bouwblokHref(r.bouwblok.id)}
                    className="text-sm text-ink hover:underline"
                  >
                    {r.bouwblok.naam}
                  </Link>
                ) : (
                  <span className="text-sm text-ink">{r.bouwblok.naam}</span>
                )}
                <span className="font-semibold text-green-600">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-ink">
            Top 3 Verbeterkansen
          </h3>
          <ol className="space-y-2">
            {verbeterkansen.map((r) => (
              <li
                key={r.bouwblok.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                {bouwblokHref ? (
                  <Link
                    href={bouwblokHref(r.bouwblok.id)}
                    className="text-sm text-ink hover:underline"
                  >
                    {r.bouwblok.naam}
                  </Link>
                ) : (
                  <span className="text-sm text-ink">{r.bouwblok.naam}</span>
                )}
                <span className="font-semibold text-red-600">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-ink">Legenda</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["rood", "oranje", "groen"] as const).map((c) => {
            const info = CLASSIFICATIE_INFO[c];
            return (
              <div key={c} className="flex gap-3">
                <span className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${info.bg}`} />
                <div>
                  <p className={`text-sm font-semibold ${info.text}`}>{info.label}</p>
                  <p className="text-xs text-ink-m">{info.omschrijving}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          title="Binnenkort beschikbaar"
          className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink-m"
        >
          Exporteer als PDF
        </button>
        <button
          type="button"
          disabled
          title="Binnenkort beschikbaar"
          className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink-m"
        >
          Exporteer als CSV
        </button>
      </section>
    </div>
  );
}
