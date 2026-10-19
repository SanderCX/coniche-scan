"use client";

import { useState } from "react";
import { VergelijkingsView } from "@/lib/benchmark";
import { BenchmarkNiveau } from "@/lib/types";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { ScoreCircle } from "@/components/ScoreCircle";
import { RadarChartView } from "@/components/RadarChartView";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { WeergaveGroep } from "@/components/visualisatie/WeergaveGroep";
import { WeergaveSpreiding } from "@/components/visualisatie/WeergaveSpreiding";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { EENHEID_ORGANISATIE, eenheidOnderdeel } from "@/components/visualisatie/gedeeld";
import { MIN_ONDERDELEN_SPREIDING, bouwblokWoorden } from "@/lib/visualisatie";
import { formatScore } from "@/lib/format";
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
  const [weergave, setWeergave] = useState<"overzicht" | "bouwblok" | "spreiding">("overzicht");
  const { assessment, organisatie, rest } = view;
  const vlak = isVlakkeAssessment(assessment);
  const woorden = bouwblokWoorden(assessment);
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
          {rest.overall !== null && <> · {tekst.restKort} {organisatieNaam}: {formatScore(rest.overall)}</>}
        </p>
      </div>

      {/* Bij de view van één scan staan de samenvatting van de Respondent en de positie ten opzichte van de groep onder elkaar
          (`visualisatie-scores.md`, J, Niveau 3). Bij een organisatie en een Meting wisselt de schakelaar de weergave. */}
      {niveau !== "scans" && (
        <div className="vis-acties">
          <WeergaveWissel
            ariaLabel="Weergave van de resultaten"
            opties={[
              { waarde: "overzicht", label: "Overzicht" },
              { waarde: "bouwblok", label: "Per bouwblok" },
              {
                waarde: "spreiding",
                label: "Spreiding",
                disabled: !view.spreidingLeden || view.aantalInGroep < MIN_ONDERDELEN_SPREIDING,
                title: `Spreiding is er vanaf ${MIN_ONDERDELEN_SPREIDING} leden in de groep`,
              },
            ]}
            waarde={weergave}
            onChange={setWeergave}
          />
        </div>
      )}

      {(weergave === "overzicht" || niveau === "scans") && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="chart-block">
            <h3>Alle {woorden.meervoud}</h3>
            <RadarChartView resultaten={organisatie.bouwblokken} vergelijking={rest.bouwblokken} naam={organisatieNaam} vergelijkingNaam={tekst.rest} />
          </div>
          <div className="chart-block">
            <h3>{vlak ? `Scores per ${woorden.enkelvoud}` : "Per categorie"}</h3>
            <CategoryBarChart
              resultaten={organisatie.groepen}
              vergelijking={rest.groepen}
              horizontaal={vlak}
              naam={organisatieNaam}
              vergelijkingNaam={tekst.rest}
            />
          </div>
        </div>
      )}

      {(weergave === "bouwblok" || niveau === "scans") && (
        <>
          <h3 style={{ marginTop: "2rem" }}>
            {niveau === "scans" ? `Positie per ${woorden.enkelvoud}` : `Verschil per ${woorden.enkelvoud}`}
          </h3>
          {niveau === "scans" && view.spreiding ? (
            <WeergaveSpreiding assessment={assessment} weergave={view.spreiding} />
          ) : view.groep ? (
            <WeergaveGroep assessment={assessment} weergave={view.groep} eigenNaam={organisatieNaam} />
          ) : null}
        </>
      )}

      {weergave === "spreiding" && view.spreidingLeden && (
        <WeergaveSpreiding
          assessment={assessment}
          weergave={view.spreidingLeden}
          eenheid={niveau === "metingen" ? eenheidOnderdeel("Metingen in deze vergelijking") : EENHEID_ORGANISATIE}
        />
      )}

      <p className="benchmark-voetnoot">
        {tekst.voetnoot(view.aantalAnderen)} · peildatum {datumFormat.format(peildatum)}
      </p>
    </section>
  );
}
