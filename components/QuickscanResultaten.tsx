"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Antwoord, Assessment, Classificatie } from "@/lib/types";
import {
  KLASSE_NAAM,
  QuickscanAfdeling,
  QuickscanResultaat,
  afdelingenHebbenEvenveelVragen,
  puntenRange,
  quickscanResultaat,
} from "@/lib/quickscan";
import { formatGewicht } from "@/lib/format";
import { WeergaveWissel } from "@/components/visualisatie/WeergaveWissel";
import { SterksteMeeste } from "@/components/quickscan/SterksteMeeste";
import { ResultaatKop, Totaalkaart } from "@/components/Resultaatkop";
import { ScoreRing } from "@/components/ScoreRing";
import { KLASSE_CHIP } from "@/lib/mijn-metingen";
import { QuickscanOverzicht } from "@/components/quickscan/QuickscanOverzicht";

/**
 * Klassekleuren (`content-ziekenhuis-quickscan.md`, Resultaten): De bestaande groen, oranje en rood uit de scorekleuren
 * (`stylesheet.md`, Scorekleuren), geen categoriekleur.
 */
export const QUICKSCAN_KLASSE_KLEUR: Record<Classificatie, string> = {
  groen: "#15803d",
  oranje: "#e8871e",
  rood: "#dc2626",
};

const KLASSE_VAR: Record<Classificatie, string> = { groen: "var(--stat-green)", oranje: "var(--stat-amber)", rood: "var(--stat-red)" };

const TELLING_KLEUR = { ja: "#15803d", nee: "#dc2626", weetNiet: "#888884" } as const;

const getal = (n: number) => formatGewicht(n);

function Voortgangsbalk({ percentage, kleur }: { percentage: number | null; kleur: string }) {
  return (
    <div className="progress-bar" style={{ margin: "0.5rem 0" }}>
      <div className="progress-bar-fill" style={{ width: `${percentage ?? 0}%`, background: kleur }} />
    </div>
  );
}

function AfdelingKaart({ afdeling, toonTellingen }: { afdeling: QuickscanAfdeling; toonTellingen: boolean }) {
  const { categorie } = afdeling;
  if (!afdeling.vanToepassing) {
    return (
      <div className="card qs-afdeling-kaart qs-afdeling-kaart--nvt">
        <h3 style={{ textDecoration: "line-through", color: "var(--ink-s)" }}>{categorie.naam}</h3>
        <p className="text-sm text-ink-s" style={{ margin: 0 }}>
          Niet van toepassing
        </p>
        <p className="text-sm text-ink-s" style={{ margin: "0.3rem 0 0" }}>
          Eerdere antwoorden blijven bewaard en tellen weer mee als de keuze later verandert.
        </p>
      </div>
    );
  }
  const klasse = afdeling.klasse;
  const kleur = klasse ? QUICKSCAN_KLASSE_KLEUR[klasse] : "var(--ink-s)";
  const aantalVragen = afdeling.maximum;
  return (
    <div className="card qs-afdeling-kaart" style={{ borderLeft: `4px solid ${kleur}` }}>
      <div className="qs-afdeling-kop">
        <h3 style={{ margin: 0 }}>{categorie.naam}</h3>
        {klasse && (
          <span className="qs-badge" style={{ background: kleur }}>
            {KLASSE_NAAM.afdeling[klasse]}
          </span>
        )}
      </div>
      <div className="qs-punten">
        <span>
          <strong>{getal(afdeling.punten)}</strong> <span>/ {getal(aantalVragen)}</span>
        </span>
        <ScoreRing
          mini
          metChip={false}
          ring={{
            fractie: (afdeling.percentage ?? 0) / 100,
            kleur,
            getal: `${afdeling.percentage ?? 0}%`,
            klasseNaam: klasse ? KLASSE_NAAM.afdeling[klasse] : "",
            chipAchtergrond: "",
            chipTekst: "",
          }}
          alt={`${categorie.naam}: ${afdeling.percentage ?? 0}%${klasse ? `, ${KLASSE_NAAM.afdeling[klasse]}` : ""}`}
        />
      </div>
      <Voortgangsbalk percentage={afdeling.percentage} kleur={kleur} />
      {toonTellingen && (
        <p className="qs-tellingen">
          <span style={{ color: TELLING_KLEUR.ja }}>Ja: {afdeling.tellingen.ja}</span>
          <span style={{ color: TELLING_KLEUR.nee }}>Nee: {afdeling.tellingen.nee}</span>
          <span style={{ color: TELLING_KLEUR.weetNiet }}>Weet niet: {afdeling.tellingen.weetNiet}</span>
        </p>
      )}

      <h4 className="qs-kopje">Verdieping op dimensies</h4>
      <div className="qs-dimensies">
        {afdeling.bouwblokken.map((b) => {
          const k = b.klasse ? QUICKSCAN_KLASSE_KLEUR[b.klasse] : "var(--ink-s)";
          return (
            <div key={b.bouwblok.id} className="qs-dimensie">
              <div className="qs-dimensie-kop">
                <span>
                  {b.bouwblok.naam}
                  {b.gewicht !== 1 && <span className="gewicht-chip" style={{ marginLeft: "0.4rem" }}>{formatGewicht(b.gewicht)}×</span>}
                </span>
                <span className="text-ink-m">
                  {getal(b.punten)}/{b.vragen} ({b.percentage ?? 0}%)
                </span>
              </div>
              <Voortgangsbalk percentage={b.percentage} kleur={k} />
            </div>
          );
        })}
      </div>

      {(afdeling.aandachtspunt || afdeling.sterksteBasis) && (
        <div className="qs-chips">
          {afdeling.aandachtspunt && afdeling.aandachtspunt.bouwblok.aandachtZin && (
            <p className="qs-aandachtzin">{afdeling.aandachtspunt.bouwblok.aandachtZin}</p>
          )}
          {afdeling.aandachtspunt && (
            <p className="qs-regel">
              <span className="qs-regel-stip" style={{ background: "var(--stat-red)" }} />
              Grootste aandachtspunt: {afdeling.aandachtspunt.bouwblok.naam}.
            </p>
          )}
          {afdeling.sterksteBasis && (
            <p className="qs-regel">
              <span className="qs-regel-stip" style={{ background: "var(--stat-green)" }} />
              Relatief sterkste basis: {afdeling.sterksteBasis.bouwblok.naam}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Het resultatenscherm van een Assessment met antwoordType "ja-nee-weetniet" (`content-ziekenhuis-quickscan.md`, Resultaten):
 * Een totaalkaart, een kaart per afdeling met de verdieping op de dimensies, "Sterkste afdeling" en "Meeste ontwikkelruimte",
 * en de legenda van de drie klassen. Radar, staafdiagram per categorie en top 3 vervallen. Een afdeling die niet van toepassing
 * is, staat er grijs en doorgestreept en doet niet mee.
 */
export function QuickscanResultaten(props: QuickscanResultatenProps) {
  return (
    <Suspense fallback={null}>
      <QuickscanResultatenInhoud {...props} />
    </Suspense>
  );
}

export interface QuickscanResultatenProps {
  assessment: Assessment;
  antwoorden?: Record<string, Antwoord>;
  relevantie?: Record<string, boolean>;
  /** Een kant-en-klaar resultaat, bijvoorbeeld het gemiddelde van een Meting (`metingAlsResultaat`): Gaat voor `antwoorden`. */
  resultaat?: QuickscanResultaat;
  respondentNaam?: string | null;
  toonKop?: boolean;
  /** De Resultaatkop (`stylesheet.md`, Resultaatkop): Eyebrow, subregel en de knop rechts naast de titel. */
  eyebrow?: string;
  subregel?: (string | null | undefined | false)[];
  kopRechts?: React.ReactNode;
  /**
   * De schakelaar Per afdeling en Overzicht (`visualisatie-quickscan.md`, 2), met de keuze in de adresbalk
   * (`?weergave=overzicht`). Standaard aan voor het resultaat van één scan. Staat uit als de pagina zelf al een schakelaar heeft,
   * zoals de resultatenpagina van een Meting.
   */
  toonSchakelaar?: boolean;
  /** Toont het aantal Ja, Nee en Weet ik niet per afdeling. Bij het gemiddelde van een Meting staat dit uit. */
  toonTellingen?: boolean;
  /** Een feit in de totaalkaart, bijvoorbeeld "Gemiddelde van 5 afgeronde scans". */
  ondertitel?: string;
}

function QuickscanResultatenInhoud({
  assessment,
  antwoorden,
  relevantie,
  resultaat,
  respondentNaam,
  toonKop = true,
  eyebrow = "Jouw resultaat",
  subregel,
  kopRechts,
  toonSchakelaar = true,
  toonTellingen = true,
  ondertitel,
}: QuickscanResultatenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const zoek = useSearchParams();
  const weergave = toonSchakelaar && zoek.get("weergave") === "overzicht" ? "overzicht" : "afdeling";
  function kies(w: "afdeling" | "overzicht") {
    const params = new URLSearchParams(zoek.toString());
    if (w === "overzicht") params.set("weergave", "overzicht");
    else params.delete("weergave");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }
  const r = resultaat ?? quickscanResultaat(assessment, antwoorden ?? {}, relevantie);
  const metPunten = afdelingenHebbenEvenveelVragen(r);
  const vragenPerAfdeling = r.afdelingen[0]?.maximum ?? 0;
  // De totaalkaart noemt de afdelingen die niet meetellen bij naam (`visualisatie-quickscan.md`, 1).
  const nvtNamen = r.afdelingen.filter((a) => !a.vanToepassing).map((a) => a.categorie.naam);

  return (
    <div>
      {toonKop && <ResultaatKop eyebrow={eyebrow} titel={assessment.naam} subregel={subregel ?? [respondentNaam]} rechts={kopRechts} />}

      {/* De totaalkaart van de Resultaatkop (`stylesheet.md`, Resultaatkop; `content-ziekenhuis-quickscan.md`, Resultaten, 1). */}
      {r.percentage !== null && r.klasse !== null && (
        <Totaalkaart
          ring={{
            fractie: r.percentage / 100,
            kleur: KLASSE_VAR[r.klasse],
            getal: `${r.percentage}%`,
            klasseNaam: KLASSE_NAAM.totaal[r.klasse],
            chipAchtergrond: KLASSE_CHIP[r.klasse].achtergrond,
            chipTekst: KLASSE_CHIP[r.klasse].tekst,
          }}
          feiten={[
            `${r.aantalVanToepassing} van ${r.aantalAfdelingen} afdelingen beoordeeld`,
            toonTellingen && `${getal(r.punten)} van ${getal(r.maximum)} punten`,
            ondertitel,
          ]}
          extra={nvtNamen.map((n) => `Vragen over ${n} zijn niet beantwoord. De afdeling telt niet mee in het totaal.`)}
        />
      )}

      {toonSchakelaar && (
        <div className="vis-acties" style={{ marginTop: "1.5rem" }}>
          <WeergaveWissel
            ariaLabel="Weergave van het resultaat"
            opties={[
              { waarde: "afdeling", label: "Per afdeling" },
              { waarde: "overzicht", label: "Overzicht" },
            ]}
            waarde={weergave}
            onChange={kies}
          />
        </div>
      )}

      {weergave === "overzicht" ? (
        <QuickscanOverzicht resultaat={r} />
      ) : (
        <>
      <h2 style={{ marginTop: "2.5rem" }}>Scores per afdeling</h2>
      <div className="qs-afdelingen">
        {r.afdelingen.map((a) => (
          <AfdelingKaart key={a.categorie.id} afdeling={a} toonTellingen={toonTellingen} />
        ))}
      </div>

      <SterksteMeeste sterkste={r.sterkste} meeste={r.meesteOntwikkelruimte} />

      <h2 style={{ marginTop: "2.5rem", fontSize: "var(--fs-18)", fontWeight: 700 }}>Classificatie</h2>
      <div className="classificatie-legenda">
        {(["groen", "oranje", "rood"] as const).map((c) => {
          const [laag, hoog] = puntenRange(vragenPerAfdeling || 1, c);
          const grens = c === "groen" ? "Vanaf 80%" : c === "oranje" ? "50% tot en met 79%" : "Onder 50%";
          return (
            <div key={c} className="classificatie-item">
              <span className="classificatie-stip" style={{ background: KLASSE_VAR[c] }} />
              <div>
                <strong>{KLASSE_NAAM.afdeling[c]}</strong>
                <p>
                  {grens}
                  {metPunten && vragenPerAfdeling > 0 && ` (${laag} tot en met ${hoog} punten per afdeling)`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
