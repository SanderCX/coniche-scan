import { Assessment } from "@/lib/types";
import {
  alleBouwblokResultaten,
  alleCategorieResultaten,
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
}: {
  assessment: Assessment;
  antwoorden: Record<string, number>;
  respondentNaam?: string;
  isPreview?: boolean;
}) {
  const bouwblokResultaten = alleBouwblokResultaten(assessment, antwoorden);
  const categorieResultaten = alleCategorieResultaten(assessment, bouwblokResultaten);
  const overall = overallScore(bouwblokResultaten.map((r) => r.score));
  const { beantwoord, totaal } = voortgang(assessment, antwoorden);
  const { sterktes, verbeterkansen } = topSterktesEnVerbeterkansen(bouwblokResultaten);

  return (
    <div className="space-y-10">
      {isPreview && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Dit is een voorbeeld met demo-data — zo ziet jouw resultatenscherm eruit
          na afronding van de scan.
        </div>
      )}

      <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:flex-row sm:justify-center sm:gap-12 sm:text-left">
        {overall !== null && <ScoreCircle score={overall} classificatie={classificatie(overall)} />}
        <div>
          <p className="text-sm font-medium text-slate-500">
            {respondentNaam ? `Resultaat voor ${respondentNaam}` : "Overall score"}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {assessment.naam}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {beantwoord} van {totaal} vragen beantwoord
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Alle bouwblokken
          </h3>
          <RadarChartView resultaten={bouwblokResultaten} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Per categorie</h3>
          <CategoryBarChart resultaten={categorieResultaten} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Top 3 Sterktes
          </h3>
          <ol className="space-y-3">
            {sterktes.map((r) => (
              <li key={r.bouwblok.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{r.bouwblok.naam}</span>
                <span className="font-semibold text-green-600">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Top 3 Verbeterkansen
          </h3>
          <ol className="space-y-3">
            {verbeterkansen.map((r) => (
              <li key={r.bouwblok.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{r.bouwblok.naam}</span>
                <span className="font-semibold text-red-600">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Legenda</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["rood", "oranje", "groen"] as const).map((c) => {
            const info = CLASSIFICATIE_INFO[c];
            return (
              <div key={c} className="flex gap-3">
                <span className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${info.bg}`} />
                <div>
                  <p className={`text-sm font-semibold ${info.text}`}>{info.label}</p>
                  <p className="text-xs text-slate-500">{info.omschrijving}</p>
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
          className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
        >
          Exporteer als PDF
        </button>
        <button
          type="button"
          disabled
          title="Binnenkort beschikbaar"
          className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
        >
          Exporteer als CSV
        </button>
      </section>
    </div>
  );
}
