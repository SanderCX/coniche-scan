import { formatScore } from "@/lib/format";
import Link from "next/link";
import { MetingenVergelijking } from "@/lib/benchmark";
import { onderdeelVan, toonMeetdatum } from "@/lib/metingen";
import { bouwblokWoorden, matrix, naastElkaarUitAntwoorden, tussenMetingenUitAntwoorden } from "@/lib/visualisatie";
import { scoreKleur } from "@/lib/colors";
import { WeergaveVergelijking } from "@/components/visualisatie/WeergaveVergelijking";
import { WeergaveNaastElkaar } from "@/components/visualisatie/WeergaveNaastElkaar";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";
import { OnderdelenWeergaven } from "@/components/visualisatie/OnderdelenWeergaven";
import { eenheidOnderdeel } from "@/components/visualisatie/gedeeld";
import { EenheidInvoer } from "@/lib/visualisatie";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {formatScore(waarde)}
    </span>
  );
}

/**
 * Eén Assessment van een vergelijking tussen Metingen, een benchmark binnen een organisatie (`benchmark.md`, Niveau 2): Elke
 * Meting met haar eigen scores en zonder groepsgemiddelde. De lezing bepaalt de rest. Ontwikkeling over tijd: De Metingen op
 * meetdatum met de oudste eerst, bij precies twee weergave C (`visualisatie-scores.md`, C) en daaronder de matrix met een kolom
 * Verschil (E). Naast elkaar: De Metingen op naam, bij precies twee weergave H en daaronder de matrix met een kolom Hoogste.
 *
 * `beheer` (de Admin): Met de tabel en de matrix, want de kolomkoppen tonen de namen van de Metingen. Een Lead krijgt alleen de
 * vergelijking van zijn eigen Metingen in weergave C (`visualisatie-scores.md`, E, Plek).
 */
export function MetingenVergelijkingView({
  vergelijking,
  beheer,
  metingHref,
}: {
  vergelijking: MetingenVergelijking;
  beheer: boolean;
  /** De resultatenpagina van een Meting, voor de knop "Bekijk" in de tabel van de Admin. */
  metingHref?: (metingId: string) => string;
}) {
  const { assessment, metingen, lezing } = vergelijking;
  const twee = metingen.length === 2;
  const naastElkaar = lezing === "naastElkaar";
  // De Metingen als eenheden, in de volgorde van de lezing: Op meetdatum, of bij Naast elkaar op naam (`benchmark.md`, Niveau 2).
  const eenheden: EenheidInvoer[] = metingen.map((m) => ({
    id: m.meting.id,
    label: m.meting.label,
    sublabel: `${onderdeelVan(m.meting)} · ${toonMeetdatum(m.meting.meetdatum)}`,
    aantalScans: m.aantalAfgerond,
    antwoorden: m.antwoorden,
  }));
  // Bij precies twee Metingen is Per bouwblok met Naast elkaar weergave C (Ontwikkeling over tijd) of H (Naast elkaar).
  const tweeWeergave = twee ? (
    naastElkaar ? (
      <WeergaveNaastElkaar
        assessment={assessment}
        weergave={naastElkaarUitAntwoorden(assessment, metingen[0].antwoorden, metingen[1].antwoorden)}
        eersteLabel={metingen[0].meting.label}
        tweedeLabel={metingen[1].meting.label}
        eersteDatum={toonMeetdatum(metingen[0].meting.meetdatum)}
        tweedeDatum={toonMeetdatum(metingen[1].meting.meetdatum)}
      />
    ) : (
      <WeergaveVergelijking
        assessment={assessment}
        weergave={tussenMetingenUitAntwoorden(assessment, metingen[0].antwoorden, metingen[1].antwoorden)}
        vorigLabel={metingen[0].meting.label}
        huidigLabel={metingen[1].meting.label}
      />
    )
  ) : undefined;
  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      <h2>{assessment.naam}</h2>
      <p className="benchmark-teller">
        <strong>
          {metingen.length} {metingen.length === 1 ? "Meting" : "Metingen"}
        </strong>
      </p>

      {metingen.length === 0 ? (
        <p className="admin-notice">Geen Metingen in deze vergelijking voor dit Assessment.</p>
      ) : (
        <>
          <OnderdelenWeergaven
            assessment={assessment}
            eenheden={eenheden}
            eenheid={eenheidOnderdeel("onderdelen in deze vergelijking")}
            // Bij een vergelijking is Naast elkaar de standaard: De Admin heeft de Metingen zelf gekozen (`visualisatie-scores.md`, I).
            standaardToonAls="naast"
            overzicht={
              <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
                <thead>
                  <tr>
                    <th>Meting</th>
                    <th>Onderdeel</th>
                    <th>Meetdatum</th>
                    <th>Afgeronde scans</th>
                    <th>Overall</th>
                    {beheer && metingHref && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {metingen.map((m) => (
                    <tr key={m.meting.id}>
                      <td>{m.meting.label}</td>
                      <td>{onderdeelVan(m.meting)}</td>
                      <td>{toonMeetdatum(m.meting.meetdatum)}</td>
                      <td>{m.aantalAfgerond}</td>
                      <td>
                        <Score waarde={m.overall} />
                      </td>
                      {beheer && metingHref && (
                        <td className="cel-knop">
                          <Link href={metingHref(m.meting.id)} className="btn btn-outline btn-compact">
                            Bekijk
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            naastElkaarTwee={tweeWeergave}
          />

          {/* Weergave E (`visualisatie-scores.md`): Alleen voor de Admin, want de koppen tonen de namen van de Metingen. */}
          {beheer && (
            <>
              <h3 style={{ marginTop: "2rem" }}>Per {bouwblokWoorden(assessment).enkelvoud} en per Meting</h3>
              <WeergaveMatrix
                assessment={assessment}
                kolomSoort="meting"
                weergave={matrix(
                  assessment,
                  metingen.map((m) => ({
                    label: m.meting.label,
                    sublabel: toonMeetdatum(m.meting.meetdatum),
                    aantalScans: m.aantalAfgerond,
                    antwoorden: m.antwoorden,
                  })),
                  { groepsvergelijking: false, lezing }
                )}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
