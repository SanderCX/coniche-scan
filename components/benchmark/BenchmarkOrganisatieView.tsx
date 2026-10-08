import { OrganisatieView } from "@/lib/benchmark";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { gewichtMarkering } from "@/lib/weging";
import { scoreKleur } from "@/lib/colors";
import { ScoreCircle } from "@/components/ScoreCircle";
import { RadarChartView } from "@/components/RadarChartView";
import { CategoryBarChart } from "@/components/CategoryBarChart";

const datumFormat = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" });

function Score({ waarde }: { waarde: number | null }) {
  if (waarde === null) return <span className="text-ink-s">–</span>;
  return (
    <span className="score-pill" style={{ ["--kleur" as string]: scoreKleur(waarde) } as React.CSSProperties}>
      {waarde.toFixed(1)}
    </span>
  );
}

function verschilTekst(verschil: number | null): string {
  if (verschil === null) return "–";
  const t = Math.abs(verschil).toFixed(1).replace(".", ",");
  return verschil > 0 ? `+${t}` : verschil < 0 ? `−${t}` : "0,0";
}

/**
 * De view van één organisatie in één Assessment (`benchmark.md`, View per organisatie): De Meting van de organisatie naast
 * het gemiddelde van de rest van de groep, zónder de organisatie zelf. Een radar met twee reeksen, het staafdiagram per
 * categorie met het groepsgemiddelde ernaast, en het verschil per bouwblok. Nooit de namen van andere organisaties.
 * Dezelfde component voor de Admin (die de view eerst zelf bekijkt) en voor de Lead aan wie hij is toegewezen.
 */
export function BenchmarkOrganisatieView({
  view,
  organisatieNaam,
  peildatum,
}: {
  view: OrganisatieView;
  organisatieNaam: string;
  peildatum: Date;
}) {
  const { assessment, organisatie, rest } = view;
  const vlak = isVlakkeAssessment(assessment);
  if (!rest) {
    return (
      <section className="benchmark-sectie" aria-label={assessment.naam}>
        <h2>{assessment.naam}</h2>
        <p className="admin-notice">Er zijn nog geen andere organisaties om mee te vergelijken.</p>
      </section>
    );
  }
  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      <h2>{assessment.naam}</h2>
      <div className="resultaten-header" style={{ paddingTop: "1rem" }}>
        {organisatie.overall !== null && (
          <ScoreCircle score={organisatie.overall} classificatie={classificatie(organisatie.overall)} />
        )}
        <p className="mt-4 font-semibold text-ink-m">
          Overall score van {organisatieNaam}
          {rest.overall !== null && <> · groep zonder {organisatieNaam}: {rest.overall.toFixed(1)}</>}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="chart-block">
          <h3>Alle {assessment.bouwblokEenheidMeervoud}</h3>
          <RadarChartView resultaten={organisatie.bouwblokken} vergelijking={rest.bouwblokken} naam={organisatieNaam} vergelijkingNaam="Rest van de groep" />
        </div>
        <div className="chart-block">
          <h3>{vlak ? `Scores per ${assessment.bouwblokEenheidEnkelvoud}` : "Per categorie"}</h3>
          <CategoryBarChart
            resultaten={organisatie.groepen}
            vergelijking={rest.groepen}
            horizontaal={vlak}
            naam={organisatieNaam}
            vergelijkingNaam="Rest van de groep"
          />
        </div>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Verschil per {assessment.bouwblokEenheidEnkelvoud}</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>{assessment.bouwblokLabel}</th>
            <th>{organisatieNaam}</th>
            <th>Rest van de groep</th>
            <th>Verschil</th>
          </tr>
        </thead>
        <tbody>
          {view.verschillen.map((v) => (
            <tr key={v.bouwblok.id}>
              <td>
                {v.bouwblok.volgnummer}. {v.bouwblok.naam}
                {gewichtMarkering(v.bouwblok) && (
                  <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>
                    {gewichtMarkering(v.bouwblok)}
                  </span>
                )}
              </td>
              <td>
                <Score waarde={v.score} />
              </td>
              <td>
                <Score waarde={v.rest} />
              </td>
              <td style={{ fontWeight: 700, color: v.verschil === null ? undefined : v.verschil >= 0 ? "var(--stat-green)" : "var(--stat-red)" }}>
                {verschilTekst(v.verschil)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="benchmark-voetnoot">
        Vergelijkgroep van {view.aantalAnderen} {view.aantalAnderen === 1 ? "organisatie" : "organisaties"}, samengesteld door Coniche ·
        peildatum {datumFormat.format(peildatum)}
      </p>
    </section>
  );
}
