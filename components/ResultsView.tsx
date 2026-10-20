import { formatScore } from "@/lib/format";
import Link from "next/link";
import { Antwoord, Assessment } from "@/lib/types";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { QuickscanResultaten } from "./QuickscanResultaten";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  classificatie,
  overallScore,
  topSterktesEnVerbeterkansen,
  voortgang,
} from "@/lib/scoring";
import { gewichtMarkering } from "@/lib/weging";
import { CLASSIFICATIE_INFO } from "@/lib/colors";
import { celStap } from "@/lib/mijn-metingen";
import { ResultaatKop, Totaalkaart } from "./Resultaatkop";
import { ringVanScore } from "@/lib/score-ring";
import { RadarChartView } from "./RadarChartView";
import { CategoryBarChart } from "./CategoryBarChart";

/**
 * De rij van de top 3 heeft de tint van de afgeronde score van het bouwblok (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm):
 * Achtergrond `--score-N-faint`, rand `--score-N-cel` en het getal in `--score-N-cel-tekst`. De klasse hoort bij de score en niet bij de plek
 * in de lijst.
 */
function scoreTint(score: number | null): React.CSSProperties {
  if (score === null) return {};
  const n = celStap(score);
  return { background: `var(--score-${n}-faint)`, borderColor: `var(--score-${n}-cel)`, ["--score-tekst" as string]: `var(--score-${n}-cel-tekst)` } as React.CSSProperties;
}

/** De stip bij een klasse: De klassekleur (`stylesheet.md`, Resultaatkop, Classificatie). */
const STAT_KLEUR = { rood: "var(--stat-red)", oranje: "var(--stat-amber)", groen: "var(--stat-green)" } as const;
const GRENS_TEKST = { rood: "Onder 2,5", oranje: "2,5 tot en met 3,49", groen: "Vanaf 3,5" } as const;

export function ResultsView({
  assessment,
  antwoorden,
  relevantie,
  respondentNaam,
  isPreview = false,
  bouwblokHref,
  toonKop = true,
  eyebrow = "Jouw resultaat",
  subregel,
  kopRechts,
  gemiddeldeVan,
}: {
  assessment: Assessment;
  antwoorden: Record<string, Antwoord>;
  /** Alleen bij een Assessment met optionele categorieën (de Quickscan): Welke afdelingen van toepassing zijn. */
  relevantie?: Record<string, boolean>;
  respondentNaam?: string | null;
  isPreview?: boolean;
  /** Als gezet: bouwblokken in de top 3-lijsten linken hiernaartoe om het antwoord aan te passen. */
  bouwblokHref?: (bouwblokId: string) => string;
  /**
   * Titel (de naam van het Assessment) en voortgangsregel ("60 van 60 vragen beantwoord") boven de score. Uit op de
   * Organisatie-resultaten: Daar heeft de pagina zelf al één kop met het Meting-label, het Assessment en het aantal
   * respondenten (`beheerpagina.md`, punt 4, Eén kop). Die twee staan alleen op het resultatenscherm van één scan.
   */
  toonKop?: boolean;
  /** De eyebrow van de Resultaatkop ("Jouw resultaat", "Voorbeeld-output"). */
  eyebrow?: string;
  /** De subregel van de Resultaatkop, bijvoorbeeld de naam, de Meting en de afrondingsdatum. Standaard de naam van de respondent. */
  subregel?: (string | null | undefined | false)[];
  /** Rechts naast de titel, alleen in de voorbeeld-output: "← Terug". */
  kopRechts?: React.ReactNode;
  /** Bij het gemiddelde van een Meting: Het aantal afgeronde scans, voor het feit "Gemiddelde van n afgeronde scans". */
  gemiddeldeVan?: number;
}) {
  // Een Assessment met Ja / Nee / Weet ik niet heeft een eigen opbouw (`content-ziekenhuis-quickscan.md`, Resultaten).
  if (isJaNeeWeetNiet(assessment)) {
    return (
      <QuickscanResultaten
        assessment={assessment}
        antwoorden={antwoorden}
        relevantie={relevantie}
        respondentNaam={respondentNaam}
        isPreview={isPreview}
        toonKop={toonKop}
        eyebrow={eyebrow}
        subregel={subregel}
        kopRechts={kopRechts}
      />
    );
  }
  const bouwblokResultaten = alleBouwblokResultaten(assessment, antwoorden);
  const groepResultaten = alleGroepResultaten(assessment, bouwblokResultaten, antwoorden);
  const overall = overallScore(assessment, antwoorden);
  const { beantwoord, totaal } = voortgang(assessment, antwoorden);
  const { sterktes, verbeterkansen } = topSterktesEnVerbeterkansen(bouwblokResultaten);
  const vlak = isVlakkeAssessment(assessment);
  const groepHeading = vlak
    ? `Scores per ${assessment.bouwblokEenheidEnkelvoud}`
    : "Per categorie";

  return (
    <div>

      {toonKop && <ResultaatKop eyebrow={eyebrow} titel={assessment.naam} subregel={subregel ?? [respondentNaam]} rechts={kopRechts} />}
      {isPreview && (
        <div className="preview-banner">
          Dit is een voorbeeld met demo-data — zo ziet jouw resultatenscherm eruit na afronding
          van de scan.
        </div>
      )}
      {overall !== null && (
        <Totaalkaart
          ring={ringVanScore(overall, classificatie(overall))}
          uitleg={CLASSIFICATIE_INFO[classificatie(overall)].omschrijving}
          feiten={[gemiddeldeVan !== undefined ? `Gemiddelde van ${gemiddeldeVan} afgeronde ${gemiddeldeVan === 1 ? "scan" : "scans"}` : `${beantwoord} van ${totaal} vragen beantwoord`]}
        />
      )}

      {/* Twee kaarten naast elkaar (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm): De radar en het staafdiagram. */}
      <div className="resultaat-kaarten">
        <section className="resultaat-kaart">
          <h3>{vlak ? `Per ${assessment.bouwblokEenheidEnkelvoud}` : "Per bouwblok"}</h3>
          <RadarChartView resultaten={bouwblokResultaten} />
        </section>
        <section className="resultaat-kaart">
          <h3>{groepHeading}</h3>
          <CategoryBarChart resultaten={groepResultaten} horizontaal={vlak} />
        </section>
      </div>

      <div className="top3-grid" style={{ margin: "2.5rem 0" }}>
        <div>
          <h3>Top 3 Sterktes</h3>
          <ol className="top3-lijst">
            {sterktes.map((r) => (
              <li key={r.bouwblok.id} className="top3-item" style={scoreTint(r.score)}>
                {bouwblokHref ? (
                  <Link href={bouwblokHref(r.bouwblok.id)} className="text-sm text-ink hover:underline">
                    {r.bouwblok.naam}
                  </Link>
                ) : (
                  <span className="text-sm text-ink">{r.bouwblok.naam}</span>
                )}
                {gewichtMarkering(r.bouwblok) && (
                  <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>
                    {gewichtMarkering(r.bouwblok)}
                  </span>
                )}
                <span className="score-pill">{formatScore(r.score)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Top 3 Verbeterkansen</h3>
          <ol className="top3-lijst">
            {verbeterkansen.map((r) => (
              <li key={r.bouwblok.id} className="top3-item" style={scoreTint(r.score)}>
                {bouwblokHref ? (
                  <Link href={bouwblokHref(r.bouwblok.id)} className="text-sm text-ink hover:underline">
                    {r.bouwblok.naam}
                  </Link>
                ) : (
                  <span className="text-sm text-ink">{r.bouwblok.naam}</span>
                )}
                {gewichtMarkering(r.bouwblok) && (
                  <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>
                    {gewichtMarkering(r.bouwblok)}
                  </span>
                )}
                <span className="score-pill">{formatScore(r.score)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: 700 }}>Classificatie</h3>
        <div className="classificatie-legenda">
          {(["rood", "oranje", "groen"] as const).map((c) => {
            const info = CLASSIFICATIE_INFO[c];
            return (
              <div key={c} className="classificatie-item">
                <span className="classificatie-stip" style={{ background: STAT_KLEUR[c] }} />
                <div>
                  <strong>{info.label}</strong>
                  <p>{GRENS_TEKST[c]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
