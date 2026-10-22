import Link from "next/link";
import { kopNaam } from "@/lib/korte-namen";
import { poolLidNaam } from "@/lib/verkennen";
import { onderdeelVan } from "@/lib/metingen";
import { BenchmarkSectie, resultatenVan } from "@/lib/benchmark";
import { alleBouwblokkenMetGroep, isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { gewichtMarkering } from "@/lib/weging";
import { CLASSIFICATIE_INFO, scoreKleur } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { ringVanScore } from "@/lib/score-ring";
import { ResultaatKop, Totaalkaart } from "@/components/Resultaatkop";
import { ResultaatKaarten } from "@/components/ResultaatKaarten";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";
import { EenheidInvoer, bouwblokWoorden, matrix } from "@/lib/visualisatie";
import { OnderdelenWeergaven } from "@/components/visualisatie/OnderdelenWeergaven";
import { EENHEID_ORGANISATIE, eenheidOnderdeel } from "@/components/visualisatie/gedeeld";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { KlasseBadge } from "@/components/quickscan/gedeeld";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {formatScore(waarde)}
    </span>
  );
}

/** "5 Organisaties", of bij de eenheid Onderdelen "3 onderdelen van 1 Organisatie". Bij één is het enkelvoud. */
export function verkenningTeller(rijen: { organisatie: { id: string } }[], metOnderdeel: boolean): string {
  const organisaties = new Set(rijen.map((r) => r.organisatie.id)).size;
  const organisatieTekst = `${organisaties} ${organisaties === 1 ? "Organisatie" : "Organisaties"}`;
  if (!metOnderdeel) return organisatieTekst;
  return `${rijen.length} ${rijen.length === 1 ? "onderdeel" : "onderdelen"} van ${organisatieTekst}`;
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
  verkenning = false,
}: {
  sectie: BenchmarkSectie;
  benchmarkId: string;
  minOrganisaties: number;
  /** Bij een verkenning met de eenheid Onderdelen staat het onderdeel achter de naam van de organisatie. */
  metOnderdeel?: boolean;
  /** Bij een opgeslagen verkenning staat de teller per eenheid (`benchmark.md`, Teller). */
  verkenning?: boolean;
}) {
  const naamVan = (r: (typeof sectie.rijen)[number]) =>
    metOnderdeel ? poolLidNaam(r.organisatie, onderdeelVan(r.organisatie, r.meting)) : r.organisatie.naam;
  const { assessment, rijen, ontbrekend, teller } = sectie;
  const resultaten = resultatenVan(assessment, sectie.groepAntwoorden);
  const vlak = isVlakkeAssessment(assessment);
  const onderDrempel = rijen.length < minOrganisaties;
  // De leden als eenheden voor de weergaven A en B: Elk lid telt even zwaar mee, ongeacht het aantal scans.
  const eenheden: EenheidInvoer[] = rijen.map((r) => ({
    id: `${r.organisatie.id}:${r.meting.id}`,
    label: naamVan(r),
    sublabel: r.meting.label,
    aantalScans: r.aantalAfgerond,
    antwoorden: r.antwoorden,
  }));
  const eenheidTekst = metOnderdeel ? eenheidOnderdeel("onderdelen in de groep") : EENHEID_ORGANISATIE;
  const enkeleOrganisatie = metOnderdeel && new Set(rijen.map((r) => r.organisatie.id)).size === 1;
  const woorden = bouwblokWoorden(assessment);
  const matrixKop = `Per ${woorden.enkelvoud} en per ${metOnderdeel ? "onderdeel" : "organisatie"}`;

  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      {/* Dezelfde Resultaatkop en Totaalkaart als bij een Meting (`stylesheet.md`, Resultaatkop, Benchmark). */}
      <ResultaatKop
        eyebrow="Benchmark"
        titel={assessment.naam}
        subregel={[verkenning ? verkenningTeller(rijen, metOnderdeel) : `${rijen.length} ${rijen.length === 1 ? "organisatie" : "organisaties"} in de groep`]}
      />
      <p className="benchmark-teller" data-onder-drempel={onderDrempel || undefined}>
        <strong>{verkenning ? verkenningTeller(rijen, metOnderdeel) : `${teller.x} van ${teller.y} organisaties`}</strong>
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
          <OnderdelenWeergaven
            assessment={assessment}
            eenheden={eenheden}
            eenheid={eenheidTekst}
            onderSchakelaar={
              resultaten.overall !== null && (
                <Totaalkaart
                  ring={ringVanScore(resultaten.overall, classificatie(resultaten.overall))}
                  uitleg={CLASSIFICATIE_INFO[classificatie(resultaten.overall)].omschrijving}
                  feiten={["Elke organisatie telt even zwaar mee"]}
                />
              )
            }
            // Bij een opgeslagen verkenning op één Organisatie is het detail weergave I: Gemiddeld of Naast elkaar, met de onderdelen als
            // eenheid (`benchmark.md`, Opgeslagen verkenning, Detail en perspectief). Anders alleen het gemiddelde met de lijn.
            toonAlsKeuze={enkeleOrganisatie}
            standaardToonAls="gemiddeld"
            metAntwoorden={enkeleOrganisatie}
            toonKaarten={enkeleOrganisatie}
            overzicht={
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

                <ResultaatKaarten
                  bouwblokResultaten={resultaten.bouwblokken}
                  groepResultaten={resultaten.groepen}
                  vlak={vlak}
                  naam="Groep"
                  radarTitel={vlak ? `Per ${woorden.enkelvoud}` : "Per bouwsteen"}
                  groepTitel={vlak ? `Scores per ${woorden.enkelvoud}` : "Per categorie"}
                />


                <h3 style={{ marginTop: "2rem" }}>Per {woorden.enkelvoud} en per vraag</h3>
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
            }
            extra={[
              {
                waarde: "matrix",
                label: "Matrix",
                inhoud: (
                  <>
                    <h3>{matrixKop}</h3>
                    <WeergaveMatrix
                      assessment={assessment}
                      kolomSoort={metOnderdeel ? "onderdeel" : "organisatie"}
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
                  </>
                ),
              },
            ]}
          />
        </>
      )}
    </section>
  );
}
