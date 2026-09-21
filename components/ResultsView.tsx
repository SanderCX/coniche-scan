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
  respondentNaam?: string | null;
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
    <div>
      {isPreview && (
        <div className="preview-banner">
          Dit is een voorbeeld met demo-data — zo ziet jouw resultatenscherm eruit na afronding
          van de scan.
        </div>
      )}

      <div className="resultaten-header">
        {overall !== null && <ScoreCircle score={overall} classificatie={classificatie(overall)} />}
        <p className="mt-4 font-semibold text-ink-m">
          {respondentNaam ? `Resultaat voor ${respondentNaam}` : "Overall score"}
        </p>
        <h1 className="mt-1">{assessment.naam}</h1>
        <p className="resultaten-voortgang">
          {beantwoord} van {totaal} vragen beantwoord
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="chart-block">
          <h3>Alle {assessment.bouwblokEenheidMeervoud}</h3>
          <RadarChartView resultaten={bouwblokResultaten} />
        </div>
        <div className="chart-block">
          <h3>{groepHeading}</h3>
          <CategoryBarChart resultaten={groepResultaten} />
        </div>
      </div>

      <div className="top3-grid" style={{ margin: "2.5rem 0" }}>
        <div>
          <h3>Top 3 Sterktes</h3>
          <ol className="top3-lijst">
            {sterktes.map((r) => (
              <li key={r.bouwblok.id} className="top3-item">
                {bouwblokHref ? (
                  <Link href={bouwblokHref(r.bouwblok.id)} className="text-sm text-ink hover:underline">
                    {r.bouwblok.naam}
                  </Link>
                ) : (
                  <span className="text-sm text-ink">{r.bouwblok.naam}</span>
                )}
                <span
                  className="score-pill"
                  style={{ ["--kleur" as string]: CLASSIFICATIE_INFO[classificatie(r.score)].kleur } as React.CSSProperties}
                >
                  {r.score.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Top 3 Verbeterkansen</h3>
          <ol className="top3-lijst">
            {verbeterkansen.map((r) => (
              <li key={r.bouwblok.id} className="top3-item">
                {bouwblokHref ? (
                  <Link href={bouwblokHref(r.bouwblok.id)} className="text-sm text-ink hover:underline">
                    {r.bouwblok.naam}
                  </Link>
                ) : (
                  <span className="text-sm text-ink">{r.bouwblok.naam}</span>
                )}
                <span
                  className="score-pill"
                  style={{ ["--kleur" as string]: CLASSIFICATIE_INFO[classificatie(r.score)].kleur } as React.CSSProperties}
                >
                  {r.score.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div>
        <h3>Legenda</h3>
        <div className="legenda">
          {(["rood", "oranje", "groen"] as const).map((c) => {
            const info = CLASSIFICATIE_INFO[c];
            return (
              <div key={c} className="legenda-item">
                <span
                  className="legenda-stip"
                  style={{ ["--kleur" as string]: info.kleur } as React.CSSProperties}
                />
                <div>
                  <h3 style={{ color: info.kleur }}>{info.label}</h3>
                  <p>{info.omschrijving}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="btn-rij" style={{ marginTop: "2.5rem", maxWidth: "26rem" }}>
        <button type="button" disabled title="Binnenkort beschikbaar" className="btn btn-outline">
          Exporteer als PDF
        </button>
        <button type="button" disabled title="Binnenkort beschikbaar" className="btn btn-outline">
          Exporteer als CSV
        </button>
      </div>
    </div>
  );
}
