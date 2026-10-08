import Link from "next/link";
import { middelAntwoorden, resultatenVan, ScanSectie } from "@/lib/benchmark";
import { scoreKleur } from "@/lib/colors";

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {waarde.toFixed(1)}
    </span>
  );
}

/**
 * De sectie van een benchmark binnen een Meting (`benchmark.md`, Niveau 3), voor de Admin: De afgeronde scans in de Meting met
 * de naam van de Respondent en de overall score, en per scan een view naast het gemiddelde van de andere scans. Elke scan
 * telt even zwaar mee. De spreiding per bouwblok en het zichtbaar maken van hoge en lage scores zijn nog niet ontworpen
 * (`benchmark.md`, Niveau 3) en staan hier dus niet.
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
  const { assessment, organisatie, meting, scans } = sectie;
  const onderGrens = scans.length < minScans;
  const gemiddelde = scans.length > 0 ? resultatenVan(assessment, middelAntwoorden(scans.map((s) => s.antwoorden), assessment)).overall : null;

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
      {gemiddelde !== null && (
        <p className="text-sm text-ink-m">
          Gemiddelde van de Meting <Score waarde={gemiddelde} />
        </p>
      )}

      {scans.length === 0 ? (
        <p className="admin-notice">Deze Meting heeft geen afgeronde scans meer.</p>
      ) : (
        <table className="admin-table">
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
