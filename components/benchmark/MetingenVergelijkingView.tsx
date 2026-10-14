import Link from "next/link";
import { MetingenVergelijking, verschillendeOnderdelen } from "@/lib/benchmark";
import { onderdeelVan, toonMeetdatum } from "@/lib/metingen";
import { matrix, tussenMetingenUitAntwoorden } from "@/lib/visualisatie";
import { scoreKleur } from "@/lib/colors";
import { WeergaveVergelijking } from "@/components/visualisatie/WeergaveVergelijking";
import { WeergaveMatrix } from "@/components/visualisatie/WeergaveMatrix";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {waarde.toFixed(1)}
    </span>
  );
}

/**
 * Eén Assessment van een vergelijking tussen Metingen, een benchmark binnen een organisatie (`benchmark.md`, Niveau 2): De
 * Metingen op meetdatum met de oudste eerst, elk met haar eigen scores en zonder groepsgemiddelde. Bij precies twee Metingen
 * staat er weergave C (`visualisatie-scores.md`, C) en daaronder de matrix met een kolom Verschil (E). Hebben ze een ander
 * onderdeel, dan staat er "Let op: Dit zijn verschillende onderdelen, het verschil is geen ontwikkeling."
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
  const { assessment, metingen } = vergelijking;
  const twee = metingen.length === 2;
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

          {twee && (
            <>
              {verschillendeOnderdelen(metingen.map((m) => m.meting)) && (
                <p className="admin-notice" role="status">
                  Let op: Dit zijn verschillende onderdelen, het verschil is geen ontwikkeling.
                </p>
              )}
              <WeergaveVergelijking
                assessment={assessment}
                weergave={tussenMetingenUitAntwoorden(assessment, metingen[0].antwoorden, metingen[1].antwoorden)}
                vorigLabel={metingen[0].meting.label}
                huidigLabel={metingen[1].meting.label}
              />
            </>
          )}
          {!twee && metingen.length > 2 && (
            <p className="admin-notice">
              Voor meer dan twee Metingen is er nog geen weergave van de ontwikkeling. Hieronder staan de Metingen naast elkaar.
            </p>
          )}

          {/* Weergave E (`visualisatie-scores.md`): Alleen voor de Admin, want de koppen tonen de namen van de Metingen. */}
          {beheer && (
            <>
              <h3 style={{ marginTop: "2rem" }}>Per {assessment.bouwblokEenheidEnkelvoud} en per Meting</h3>
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
                  { groepsvergelijking: false }
                )}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
