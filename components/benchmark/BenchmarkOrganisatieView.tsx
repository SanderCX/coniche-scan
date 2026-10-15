import { VergelijkingsView } from "@/lib/benchmark";
import { BenchmarkNiveau } from "@/lib/types";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { ScoreCircle } from "@/components/ScoreCircle";
import { RadarChartView } from "@/components/RadarChartView";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { WeergaveGroep } from "@/components/visualisatie/WeergaveGroep";
import { WeergaveSpreiding } from "@/components/visualisatie/WeergaveSpreiding";
import { QuickscanBenchmarkView } from "@/components/quickscan/QuickscanBenchmarkView";

const datumFormat = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" });

/**
 * De view van één organisatie in één Assessment (`benchmark.md`, View per organisatie): De Meting van de organisatie naast
 * het gemiddelde van de rest van de groep, zónder de organisatie zelf. Een radar met twee reeksen, het staafdiagram per
 * categorie met het groepsgemiddelde ernaast, en per bouwblok de positie in de groep (weergave D, `visualisatie-scores.md`) of,
 * bij een scan, de plek tussen de andere scans (weergave B). Nooit de namen van andere organisaties.
 * Dezelfde component voor de Admin (die de view eerst zelf bekijkt) en voor de Lead aan wie hij is toegewezen.
 */
const TEKSTEN: Record<BenchmarkNiveau, { rest: string; restKort: string; voetnoot: (n: number) => string; geenAnderen: string }> = {
  organisaties: {
    rest: "Rest van de groep",
    restKort: "groep zonder",
    voetnoot: (n) => `Vergelijkgroep van ${n} ${n === 1 ? "organisatie" : "organisaties"}, samengesteld door Coniche`,
    geenAnderen: "Er zijn nog geen andere organisaties om mee te vergelijken.",
  },
  metingen: {
    rest: "Overige Metingen",
    restKort: "overige Metingen zonder",
    voetnoot: (n) => `Vergelijking met ${n} andere ${n === 1 ? "Meting" : "Metingen"} van deze organisatie`,
    geenAnderen: "Er zijn geen andere Metingen om mee te vergelijken.",
  },
  scans: {
    rest: "Overige scans",
    restKort: "overige scans zonder",
    voetnoot: (n) => `Vergelijking met ${n} andere ${n === 1 ? "scan" : "scans"} in deze Meting`,
    geenAnderen: "Er zijn geen andere scans om mee te vergelijken.",
  },
};

export function BenchmarkOrganisatieView({
  view,
  organisatieNaam,
  peildatum,
  niveau = "organisaties",
}: {
  view: VergelijkingsView;
  /** De naam van het lid: De organisatie, de Meting of de Respondent. */
  organisatieNaam: string;
  peildatum: Date;
  /** Bepaalt de teksten: Rest van de groep, overige Metingen of overige scans. */
  niveau?: BenchmarkNiveau;
}) {
  const tekst = TEKSTEN[niveau];
  const { assessment, organisatie, rest } = view;
  const vlak = isVlakkeAssessment(assessment);
  // Een Assessment met Ja / Nee / Weet ik niet heeft een eigen weergave in percentages (`visualisatie-quickscan.md`, 5).
  if (view.quickscan) {
    return (
      <section className="benchmark-sectie" aria-label={assessment.naam}>
        <h2>{assessment.naam}</h2>
        {view.aantalAnderen === 0 ? (
          <p className="admin-notice">{tekst.geenAnderen}</p>
        ) : (
          <QuickscanBenchmarkView view={view.quickscan} eigenNaam={organisatieNaam} peildatum={peildatum} />
        )}
      </section>
    );
  }
  if (!rest) {
    return (
      <section className="benchmark-sectie" aria-label={assessment.naam}>
        <h2>{assessment.naam}</h2>
        <p className="admin-notice">{tekst.geenAnderen}</p>
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
          {rest.overall !== null && <> · {tekst.restKort} {organisatieNaam}: {rest.overall.toFixed(1)}</>}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="chart-block">
          <h3>Alle {assessment.bouwblokEenheidMeervoud}</h3>
          <RadarChartView resultaten={organisatie.bouwblokken} vergelijking={rest.bouwblokken} naam={organisatieNaam} vergelijkingNaam={tekst.rest} />
        </div>
        <div className="chart-block">
          <h3>{vlak ? `Scores per ${assessment.bouwblokEenheidEnkelvoud}` : "Per categorie"}</h3>
          <CategoryBarChart
            resultaten={organisatie.groepen}
            vergelijking={rest.groepen}
            horizontaal={vlak}
            naam={organisatieNaam}
            vergelijkingNaam={tekst.rest}
          />
        </div>
      </div>

      <h3 style={{ marginTop: "2rem" }}>
        {niveau === "scans" ? `Positie per ${assessment.bouwblokEenheidEnkelvoud}` : `Verschil per ${assessment.bouwblokEenheidEnkelvoud}`}
      </h3>
      {niveau === "scans" && view.spreiding ? (
        <WeergaveSpreiding assessment={assessment} weergave={view.spreiding} />
      ) : view.groep ? (
        <WeergaveGroep assessment={assessment} weergave={view.groep} eigenNaam={organisatieNaam} />
      ) : null}

      <p className="benchmark-voetnoot">
        {tekst.voetnoot(view.aantalAnderen)} · peildatum {datumFormat.format(peildatum)}
      </p>
    </section>
  );
}
