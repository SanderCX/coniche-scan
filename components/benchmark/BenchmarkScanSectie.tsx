"use client";

import { useState } from "react";
import Link from "next/link";
import { middelAntwoorden, resultatenVan, ScanSectie } from "@/lib/benchmark";
import { scoreKleur } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { classificatie } from "@/lib/scoring";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import { bouwblokWoorden, spreiding } from "@/lib/visualisatie";
import { ScoreCircle } from "@/components/ScoreCircle";
import { RadarChartView } from "@/components/RadarChartView";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { WeergaveSpreiding } from "@/components/visualisatie/WeergaveSpreiding";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {formatScore(waarde)}
    </span>
  );
}

/**
 * De sectie van een benchmark binnen een Meting (`benchmark.md`, Niveau 3), voor de Admin: De afgeronde scans in de Meting met
 * de naam van de Respondent en de overall score, en per scan een view naast het gemiddelde van de andere scans. Elke scan
 * telt even zwaar mee. Boven de lijst staan Overzicht (het gemiddelde van de Meting) en Spreiding (weergave B zonder ring, de
 * stippen zonder naam): Alleen de namen in een lijst was te kaal (`visualisatie-scores.md`, J). Kiest de Admin een scan, dan volgt
 * de view van die scan met de positie ten opzichte van de groep.
 */
export function BenchmarkScanSectie({
  sectie,
  benchmarkId,
  minScans,
}: {
  sectie: ScanSectie;
  benchmarkId: string;
  minScans: number;
}) {
  const [weergave, setWeergave] = useState<"overzicht" | "spreiding">("overzicht");
  const { assessment, organisatie, meting, scans } = sectie;
  const woorden = bouwblokWoorden(assessment);
  const vlak = isVlakkeAssessment(assessment);
  const onderGrens = scans.length < minScans;
  const resultaten = scans.length > 0 ? resultatenVan(assessment, middelAntwoorden(scans.map((s) => s.antwoorden), assessment)) : null;

  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      <h2>{assessment.naam}</h2>
      <p className="text-sm text-ink-m">
        {organisatie.naam} · {meting.label}
      </p>
      <p className="benchmark-teller" data-onder-drempel={onderGrens || undefined}>
        <strong>
          {scans.length} {scans.length === 1 ? "afgeronde scan" : "afgeronde scans"}
        </strong>
        {onderGrens && <span> · onder de ondergrens van {minScans} scans: De vergelijking is dan te herleiden naar personen</span>}
      </p>
      {resultaten && (
        <>
          <div className="vis-acties">
            <WeergaveWissel
              ariaLabel="Weergave van de Meting"
              opties={[
                { waarde: "overzicht", label: "Overzicht" },
                { waarde: "spreiding", label: "Spreiding" },
              ]}
              waarde={weergave}
              onChange={setWeergave}
            />
          </div>
          {weergave === "overzicht" && (
            <>
              <div className="resultaten-header" style={{ paddingTop: "1rem" }}>
                {resultaten.overall !== null && <ScoreCircle score={resultaten.overall} classificatie={classificatie(resultaten.overall)} />}
                <p className="mt-4 font-semibold text-ink-m">Gemiddelde van de Meting</p>
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="chart-block">
                  <h3>Alle {woorden.meervoud}</h3>
                  <RadarChartView resultaten={resultaten.bouwblokken} naam="Meting" />
                </div>
                <div className="chart-block">
                  <h3>{vlak ? `Scores per ${woorden.enkelvoud}` : "Per categorie"}</h3>
                  <CategoryBarChart resultaten={resultaten.groepen} horizontaal={vlak} />
                </div>
              </div>
            </>
          )}
          {weergave === "spreiding" && <WeergaveSpreiding assessment={assessment} weergave={spreiding(assessment, scans.map((s) => s.invulling))} />}
        </>
      )}

      {scans.length === 0 ? (
        <p className="admin-notice">Deze Meting heeft geen afgeronde scans meer.</p>
      ) : (
        <table className="admin-table" style={{ marginTop: "2rem" }}>
          <thead>
            <tr>
              <th>Respondent</th>
              <th>Overall</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.invulling.id}>
                <td>{s.naam}</td>
                <td>
                  <Score waarde={s.overall} />
                </td>
                <td className="cel-knop">
                  <Link href={`/beheer/benchmark/${benchmarkId}/scan/${s.invulling.id}`} className="btn btn-outline btn-compact">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
