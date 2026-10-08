import Link from "next/link";
import { BenchmarkSectie, MIN_METINGEN_PER_ASSESSMENT, resultatenVan } from "@/lib/benchmark";
import { alleBouwblokkenMetGroep, isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { gewichtMarkering } from "@/lib/weging";
import { scoreKleur } from "@/lib/colors";
import { ScoreCircle } from "@/components/ScoreCircle";
import { RadarChartView } from "@/components/RadarChartView";
import { CategoryBarChart } from "@/components/CategoryBarChart";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {waarde.toFixed(1)}
    </span>
  );
}

/**
 * Eén sectie van een benchmark voor de Admin (`benchmark.md`, Weergave voor de Admin): Per Assessment de teller
 * "X van Y organisaties", de organisaties met hun aantal afgeronde scans, en de gemiddelden van de groep per
 * categorie, bouwblok en vraag, en overall. De Admin ziet de namen van de organisaties, ook van de organisaties die in dit
 * Assessment ontbreken. Een zelfstandig onderdeel, zodat een latere PDF per Assessment een eigen deel kan krijgen.
 * Hergebruikt de resultaatcomponenten van het resultatenscherm.
 */
export function BenchmarkGroepSectie({
  sectie,
  benchmarkId,
  minOrganisaties,
  niveau = "organisaties",
}: {
  sectie: BenchmarkSectie;
  benchmarkId: string;
  minOrganisaties: number;
  /** `metingen`: Binnen een organisatie (`benchmark.md`, Niveau 2): De leden zijn Metingen met hun label als naam. */
  niveau?: "organisaties" | "metingen";
}) {
  const { assessment, rijen, ontbrekend, teller } = sectie;
  const resultaten = resultatenVan(assessment, sectie.groepAntwoorden);
  const vlak = isVlakkeAssessment(assessment);
  const eenheid = assessment.bouwblokEenheidMeervoud;
  const binnen = niveau === "metingen";
  const onderDrempel = rijen.length < (binnen ? MIN_METINGEN_PER_ASSESSMENT : minOrganisaties);

  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      <h2>{assessment.naam}</h2>
      <p className="benchmark-teller" data-onder-drempel={onderDrempel || undefined}>
        <strong>{binnen ? `${teller.x} ${teller.x === 1 ? "Meting" : "Metingen"}` : `${teller.x} van ${teller.y} organisaties`}</strong>
        {onderDrempel && !binnen && (
          <span>
            {" "}
            · onder de minimale groepsgrootte van {minOrganisaties}: Een Lead ziet dit Assessment niet
          </span>
        )}
        {onderDrempel && binnen && <span> · een benchmark heeft minstens {MIN_METINGEN_PER_ASSESSMENT} Metingen per Assessment</span>}
      </p>
      {!binnen && ontbrekend.length > 0 && (
        <p className="text-sm text-ink-m">
          Ontbreekt in dit Assessment: {ontbrekend.map((o) => o.naam).join(", ")}.
        </p>
      )}

      {rijen.length === 0 ? (
        <p className="admin-notice">{binnen ? "Nog geen Metingen in deze benchmark voor dit Assessment." : "Nog geen organisaties in deze benchmark voor dit Assessment."}</p>
      ) : (
        <>
          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>{binnen ? "Meting" : "Organisatie"}</th>
                {!binnen && <th>Meting</th>}
                <th>Afgeronde scans</th>
                <th>Overall</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rijen.map((r) => (
                <tr key={binnen ? r.meting.id : r.organisatie.id}>
                  <td>{binnen ? r.meting.label : r.organisatie.naam}</td>
                  {!binnen && <td>{r.meting.label}</td>}
                  <td>{r.aantalAfgerond}</td>
                  <td>
                    <Score waarde={r.overall} />
                  </td>
                  <td className="cel-knop">
                    <Link
                      href={
                        binnen
                          ? `/beheer/benchmark/${benchmarkId}/meting/${r.meting.id}`
                          : `/beheer/benchmark/${benchmarkId}/organisatie/${r.organisatie.id}`
                      }
                      className="btn btn-outline btn-compact"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="resultaten-header" style={{ paddingTop: "1rem" }}>
            {resultaten.overall !== null && (
              <ScoreCircle score={resultaten.overall} classificatie={classificatie(resultaten.overall)} />
            )}
            <p className="mt-4 font-semibold text-ink-m">{binnen ? "Gemiddelde van de Metingen" : "Gemiddelde van de groep"}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="chart-block">
              <h3>Alle {eenheid}</h3>
              <RadarChartView resultaten={resultaten.bouwblokken} naam="Groep" />
            </div>
            <div className="chart-block">
              <h3>{vlak ? `Scores per ${assessment.bouwblokEenheidEnkelvoud}` : "Per categorie"}</h3>
              <CategoryBarChart resultaten={resultaten.groepen} horizontaal={vlak} />
            </div>
          </div>

          <h3 style={{ marginTop: "2rem" }}>Per {assessment.bouwblokEenheidEnkelvoud} en per vraag</h3>
          <div className="benchmark-bouwblokken">
            {alleBouwblokkenMetGroep(assessment).map(({ bouwblok }, i) => (
              <details key={bouwblok.id} className="benchmark-bouwblok">
                <summary>
                  <span className="benchmark-bouwblok-naam">
                    {bouwblok.volgnummer}. {bouwblok.naam}
                    {gewichtMarkering(bouwblok) && (
                      <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>
                        {gewichtMarkering(bouwblok)}
                      </span>
                    )}
                  </span>
                  <Score waarde={resultaten.bouwblokken[i]?.score ?? null} />
                </summary>
                <table className="admin-table">
                  <tbody>
                    {bouwblok.vragen.map((v) => (
                      <tr key={v.id}>
                        <td>{v.tekst}</td>
                        <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                          <Score waarde={sectie.groepAntwoorden[v.id] ?? null} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
