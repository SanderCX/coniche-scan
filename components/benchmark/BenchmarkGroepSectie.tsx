import Link from "next/link";
import { kopNaam } from "@/lib/korte-namen";
import { poolLidNaam } from "@/lib/verkennen";
import { onderdeelVan } from "@/lib/metingen";
import { BenchmarkSectie, resultatenVan } from "@/lib/benchmark";
import { alleBouwblokkenMetGroep, isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { gewichtMarkering } from "@/lib/weging";
import { scoreKleur } from "@/lib/colors";
import { ScoreCircle } from "@/components/ScoreCircle";
import { RadarChartView } from "@/components/RadarChartView";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";
import { matrix } from "@/lib/visualisatie";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { KlasseBadge } from "@/components/quickscan/gedeeld";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {waarde.toFixed(1)}
    </span>
  );
}

/**
 * Eén sectie van een benchmark tussen organisaties voor de Admin (`benchmark.md`, Weergave voor de Admin): Per Assessment de
 * teller "X van Y organisaties", de organisaties met hun aantal afgeronde scans, en de gemiddelden van de groep per
 * categorie, bouwblok en vraag, en overall. Een vergelijking tussen Metingen heeft een eigen weergave
 * (`MetingenVergelijkingView`). De Admin ziet de namen van de organisaties, ook van de organisaties die in dit
 * Assessment ontbreken. Een zelfstandig onderdeel, zodat een latere PDF per Assessment een eigen deel kan krijgen.
 * Hergebruikt de resultaatcomponenten van het resultatenscherm.
 */
export function BenchmarkGroepSectie({
  sectie,
  benchmarkId,
  minOrganisaties,
  metOnderdeel = false,
}: {
  sectie: BenchmarkSectie;
  benchmarkId: string;
  minOrganisaties: number;
  /** Bij een verkenning met de eenheid Onderdelen staat het onderdeel achter de naam van de organisatie. */
  metOnderdeel?: boolean;
}) {
  const naamVan = (r: (typeof sectie.rijen)[number]) =>
    metOnderdeel ? poolLidNaam(r.organisatie, onderdeelVan(r.meting)) : r.organisatie.naam;
  const { assessment, rijen, ontbrekend, teller } = sectie;
  const resultaten = resultatenVan(assessment, sectie.groepAntwoorden);
  const vlak = isVlakkeAssessment(assessment);
  const eenheid = assessment.bouwblokEenheidMeervoud;
  const onderDrempel = rijen.length < minOrganisaties;

  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      <h2>{assessment.naam}</h2>
      <p className="benchmark-teller" data-onder-drempel={onderDrempel || undefined}>
        <strong>{`${teller.x} van ${teller.y} organisaties`}</strong>
        {onderDrempel && (
          <span>
            {" "}
            · onder de minimale groepsgrootte van {minOrganisaties}: Een Lead ziet dit Assessment niet
          </span>
        )}
      </p>
      {ontbrekend.length > 0 && (
        <p className="text-sm text-ink-m">
          Ontbreekt in dit Assessment: {ontbrekend.map((o) => o.naam).join(", ")}.
        </p>
      )}

      {rijen.length === 0 ? (
        <p className="admin-notice">Nog geen organisaties in deze benchmark voor dit Assessment.</p>
      ) : isJaNeeWeetNiet(assessment) ? (
        // Ja / Nee / Weet ik niet rekent in punten en procenten: Geen radar, matrix of gemiddelde per vraag. De vergelijking
        // staat in de view per organisatie (`visualisatie-quickscan.md`, 5).
        <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
          <thead>
            <tr>
              <th>Organisatie</th>
              <th>Meting</th>
              <th>Afgeronde scans</th>
              <th>Totaal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rijen.map((r) => (
              <tr key={`${r.organisatie.id}:${r.meting.id}`}>
                <td>{naamVan(r)}</td>
                <td>{r.meting.label}</td>
                <td>{r.aantalAfgerond}</td>
                <td>
                  {r.quickscan?.percentage === null || r.quickscan === undefined ? (
                    <span className="text-ink-s">–</span>
                  ) : (
                    <>
                      <strong>{r.quickscan.percentage}%</strong> <KlasseBadge klasse={r.quickscan.klasse} totaal />
                    </>
                  )}
                </td>
                <td className="cel-knop">
                  <Link href={`/beheer/benchmark/${benchmarkId}/organisatie/${r.organisatie.id}`} className="btn btn-outline btn-compact">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>Organisatie</th>
                <th>Meting</th>
                <th>Afgeronde scans</th>
                <th>Overall</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rijen.map((r) => (
                <tr key={`${r.organisatie.id}:${r.meting.id}`}>
                  <td>{naamVan(r)}</td>
                  <td>{r.meting.label}</td>
                  <td>{r.aantalAfgerond}</td>
                  <td>
                    <Score waarde={r.overall} />
                  </td>
                  <td className="cel-knop">
                    <Link href={`/beheer/benchmark/${benchmarkId}/organisatie/${r.organisatie.id}`} className="btn btn-outline btn-compact">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Weergave E (`visualisatie-scores.md`): De matrix met de bouwblokken als rijen en de organisaties als kolommen (kop
              met naam, label van de Meting en aantal scans). Alleen voor de Admin. */}
          <h3>{`Per ${assessment.bouwblokEenheidEnkelvoud} en per organisatie`}</h3>
          <WeergaveMatrix
            assessment={assessment}
            kolomSoort="organisatie"
            weergave={matrix(
              assessment,
              rijen.map((r) => ({
                label: metOnderdeel ? naamVan(r) : kopNaam(r.organisatie),
                volledigeNaam: naamVan(r),
                sublabel: r.meting.label,
                aantalScans: r.aantalAfgerond,
                antwoorden: r.antwoorden,
              }))
            )}
          />

          <div className="resultaten-header" style={{ paddingTop: "1rem" }}>
            {resultaten.overall !== null && (
              <ScoreCircle score={resultaten.overall} classificatie={classificatie(resultaten.overall)} />
            )}
            <p className="mt-4 font-semibold text-ink-m">Gemiddelde van de groep</p>
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
