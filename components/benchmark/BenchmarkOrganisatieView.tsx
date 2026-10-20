"use client";

import { useState } from "react";
import { VergelijkingsView } from "@/lib/benchmark";
import { BenchmarkNiveau } from "@/lib/types";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import { classificatie } from "@/lib/scoring";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { ringVanScore } from "@/lib/score-ring";
import { ResultaatKop, Totaalkaart } from "@/components/Resultaatkop";
import { ResultaatKaarten } from "@/components/ResultaatKaarten";
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
const TEKSTEN: Record<
  BenchmarkNiveau,
  { rest: string; tegenover: string; anderen: [string, string]; voetnoot: (n: number) => string; geenAnderen: string }
> = {
  organisaties: {
    rest: "Rest van de groep",
    tegenover: "de rest van de groep",
    anderen: ["andere organisatie", "andere organisaties"],
    voetnoot: (n) => `Vergelijkgroep van ${n} ${n === 1 ? "organisatie" : "organisaties"}, samengesteld door Coniche`,
    geenAnderen: "Er zijn nog geen andere organisaties om mee te vergelijken.",
  },
  metingen: {
    rest: "Overige Metingen",
    tegenover: "de overige Metingen",
    anderen: ["andere Meting", "andere Metingen"],
    voetnoot: (n) => `Vergelijking met ${n} andere ${n === 1 ? "Meting" : "Metingen"} van deze organisatie`,
    geenAnderen: "Er zijn geen andere Metingen om mee te vergelijken.",
  },
  scans: {
    rest: "Overige scans",
    tegenover: "de overige scans",
    anderen: ["andere scan", "andere scans"],
    voetnoot: (n) => `Vergelijking met ${n} andere ${n === 1 ? "scan" : "scans"} in deze Meting`,
    geenAnderen: "Er zijn geen andere scans om mee te vergelijken.",
  },
};

/** De subregel van de Resultaatkop: "{Organisatie} tegenover de rest van de groep · 5 andere organisaties". */
function kopSubregel(naam: string, tekst: (typeof TEKSTEN)[BenchmarkNiveau], aantalAnderen: number): string {
  return `${naam} tegenover ${tekst.tegenover} · ${aantalAnderen} ${aantalAnderen === 1 ? tekst.anderen[0] : tekst.anderen[1]}`;
}

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
        <ResultaatKop eyebrow="Benchmark" titel={assessment.naam} subregel={[kopSubregel(organisatieNaam, tekst, view.aantalAnderen)]} />
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
        <ResultaatKop eyebrow="Benchmark" titel={assessment.naam} subregel={[kopSubregel(organisatieNaam, tekst, view.aantalAnderen)]} />
        <p className="admin-notice">{tekst.geenAnderen}</p>
      </section>
    );
  }
  return (
    <section className="benchmark-sectie" aria-label={assessment.naam}>
      {/* Dezelfde Resultaatkop en Totaalkaart als bij een Meting (`stylesheet.md`, Resultaatkop, Benchmark): De namen van andere leden staan er niet in. */}
      <ResultaatKop eyebrow="Benchmark" titel={assessment.naam} subregel={[kopSubregel(organisatieNaam, tekst, view.aantalAnderen)]} />

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

      {organisatie.overall !== null && (
        <Totaalkaart
          ring={ringVanScore(organisatie.overall, classificatie(organisatie.overall))}
          uitleg={CLASSIFICATIE_INFO[classificatie(organisatie.overall)].omschrijving}
          feiten={[rest.overall !== null && `${tekst.rest}: ${formatScore(rest.overall)}`]}
        />
      )}

      {(weergave === "overzicht" || niveau === "scans") && (
        <ResultaatKaarten
          bouwblokResultaten={organisatie.bouwblokken}
          groepResultaten={organisatie.groepen}
          vergelijkingBouwblokken={rest.bouwblokken}
          vergelijkingGroepen={rest.groepen}
          vlak={vlak}
          naam={organisatieNaam}
          vergelijkingNaam={tekst.rest}
          radarTitel={vlak ? `Per ${woorden.enkelvoud}` : "Per bouwblok"}
          groepTitel={vlak ? `Scores per ${woorden.enkelvoud}` : "Per categorie"}
        />
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
