import { Antwoord, Assessment, Classificatie } from "@/lib/types";
import {
  KLASSE_NAAM,
  QuickscanAfdeling,
  afdelingenHebbenEvenveelVragen,
  puntenRange,
  quickscanResultaat,
} from "@/lib/quickscan";
import { formatGewicht } from "@/lib/format";

/**
 * Klassekleuren (`content-ziekenhuis-quickscan.md`, Resultaten): De bestaande groen, oranje en rood uit de scorekleuren
 * (`stylesheet.md`, Scorekleuren), geen categoriekleur.
 */
export const QUICKSCAN_KLASSE_KLEUR: Record<Classificatie, string> = {
  groen: "#15803d",
  oranje: "#e8871e",
  rood: "#dc2626",
};

const TELLING_KLEUR = { ja: "#15803d", nee: "#dc2626", weetNiet: "#888884" } as const;

const getal = (n: number) => formatGewicht(n);

function Voortgangsbalk({ percentage, kleur }: { percentage: number | null; kleur: string }) {
  return (
    <div className="progress-bar" style={{ margin: "0.5rem 0" }}>
      <div className="progress-bar-fill" style={{ width: `${percentage ?? 0}%`, background: kleur }} />
    </div>
  );
}

function AfdelingKaart({ afdeling }: { afdeling: QuickscanAfdeling }) {
  const { categorie } = afdeling;
  if (!afdeling.vanToepassing) {
    return (
      <div className="card qs-afdeling-kaart qs-afdeling-kaart--nvt">
        <h3 style={{ textDecoration: "line-through", color: "var(--ink-s)" }}>{categorie.naam}</h3>
        <p className="text-sm text-ink-s" style={{ margin: 0 }}>
          Niet van toepassing
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
      <p className="qs-punten">
        <strong>{getal(afdeling.punten)}</strong> <span>/ {getal(aantalVragen)}</span>{" "}
        <span className="qs-percentage" style={{ color: kleur }}>
          {afdeling.percentage ?? 0}%
        </span>
      </p>
      <Voortgangsbalk percentage={afdeling.percentage} kleur={kleur} />
      <p className="qs-tellingen">
        <span style={{ color: TELLING_KLEUR.ja }}>Ja: {afdeling.tellingen.ja}</span>
        <span style={{ color: TELLING_KLEUR.nee }}>Nee: {afdeling.tellingen.nee}</span>
        <span style={{ color: TELLING_KLEUR.weetNiet }}>Weet niet: {afdeling.tellingen.weetNiet}</span>
      </p>

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
                  {b.punten}/{b.vragen} ({b.percentage ?? 0}%)
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
            <p className="text-sm text-ink-m" style={{ margin: "0 0 0.5rem" }}>
              {afdeling.aandachtspunt.bouwblok.aandachtZin}
            </p>
          )}
          {afdeling.aandachtspunt && (
            <span className="qs-chip qs-chip--aandacht">Grootste aandachtspunt: {afdeling.aandachtspunt.bouwblok.naam}.</span>
          )}
          {afdeling.sterksteBasis && (
            <span className="qs-chip qs-chip--sterk">Relatief sterkste basis: {afdeling.sterksteBasis.bouwblok.naam}.</span>
          )}
        </div>
      )}
    </div>
  );
}

function Uitgelicht({
  titel,
  kleur,
  afdelingen,
}: {
  titel: string;
  kleur: string;
  afdelingen: QuickscanAfdeling[];
}) {
  return (
    <div className="card" style={{ borderTop: `4px solid ${kleur}` }}>
      <p className="eyebrow" style={{ color: kleur }}>
        {titel}
      </p>
      {afdelingen.map((a) => (
        <p key={a.categorie.id} style={{ margin: "0.3rem 0 0" }}>
          <strong>{a.categorie.naam}</strong>{" "}
          <span className="text-ink-m">
            {getal(a.punten)}/{getal(a.maximum)} ({a.percentage ?? 0}%)
          </span>
        </p>
      ))}
    </div>
  );
}

/**
 * Het resultatenscherm van een Assessment met antwoordType "ja-nee-weetniet" (`content-ziekenhuis-quickscan.md`, Resultaten):
 * Een totaalkaart, een kaart per afdeling met de verdieping op de dimensies, "Sterkste afdeling" en "Meeste ontwikkelruimte",
 * en de legenda van de drie klassen. Radar, staafdiagram per categorie en top 3 vervallen. Een afdeling die niet van toepassing
 * is, staat er grijs en doorgestreept en doet niet mee.
 */
export function QuickscanResultaten({
  assessment,
  antwoorden,
  relevantie,
  respondentNaam,
  isPreview = false,
  toonKop = true,
}: {
  assessment: Assessment;
  antwoorden: Record<string, Antwoord>;
  relevantie?: Record<string, boolean>;
  respondentNaam?: string | null;
  isPreview?: boolean;
  toonKop?: boolean;
}) {
  const r = quickscanResultaat(assessment, antwoorden, relevantie);
  const klasse = r.klasse;
  const kleur = klasse ? QUICKSCAN_KLASSE_KLEUR[klasse] : "var(--ink-s)";
  const metPunten = afdelingenHebbenEvenveelVragen(r);
  const vragenPerAfdeling = r.afdelingen[0]?.maximum ?? 0;

  return (
    <div>
      {isPreview && (
        <div className="preview-banner">
          Dit is een voorbeeld met demo-data — zo ziet jouw resultatenscherm eruit na afronding van de scan.
        </div>
      )}
      {toonKop && <h1 style={{ marginBottom: "1.2rem" }}>{assessment.naam}</h1>}

      <div className="card qs-totaal" style={{ borderLeft: `4px solid ${kleur}` }}>
        <div>
          <p className="eyebrow">OVERALL VOLWASSENHEID</p>
          <p className="qs-totaal-percentage">
            <span style={{ color: kleur }}>{r.percentage ?? 0}%</span>{" "}
            <span className="qs-totaal-punten">
              ({getal(r.punten)}/{getal(r.maximum)})
            </span>
          </p>
          {klasse && (
            <p className="qs-totaal-klasse" style={{ color: kleur }}>
              {KLASSE_NAAM.totaal[klasse]}
            </p>
          )}
          {respondentNaam && <p className="text-sm text-ink-m">Resultaat voor {respondentNaam}</p>}
        </div>
        <div className="qs-totaal-rechts">
          <div className="classificatie-cirkel" style={{ ["--kleur" as string]: kleur } as React.CSSProperties}>
            <span className="score" style={{ fontSize: "2rem" }}>
              {r.percentage ?? 0}%
            </span>
          </div>
          <p className="text-sm text-ink-m" style={{ margin: "0.6rem 0 0", textAlign: "center" }}>
            {r.aantalVanToepassing} van {r.aantalAfdelingen} afdelingen beoordeeld
            <br />
            {getal(r.punten)} van {getal(r.maximum)} punten
          </p>
        </div>
      </div>

      <h2 style={{ marginTop: "2.5rem" }}>Scores per afdeling</h2>
      <div className="qs-afdelingen">
        {r.afdelingen.map((a) => (
          <AfdelingKaart key={a.categorie.id} afdeling={a} />
        ))}
      </div>

      {r.sterkste.length > 0 && r.meesteOntwikkelruimte.length > 0 && (
        <div className="qs-uitgelicht">
          <Uitgelicht titel="Sterkste afdeling" kleur={QUICKSCAN_KLASSE_KLEUR.groen} afdelingen={r.sterkste} />
          <Uitgelicht titel="Meeste ontwikkelruimte" kleur={QUICKSCAN_KLASSE_KLEUR.rood} afdelingen={r.meesteOntwikkelruimte} />
        </div>
      )}

      <h2 style={{ marginTop: "2.5rem" }}>Classificatie</h2>
      <div className="legenda">
        {(["groen", "oranje", "rood"] as const).map((c) => {
          const [laag, hoog] = puntenRange(vragenPerAfdeling || 1, c);
          const grens = c === "groen" ? "Vanaf 80%" : c === "oranje" ? "50% tot en met 79%" : "Onder 50%";
          return (
            <div key={c} className="legenda-item">
              <span className="legenda-stippen">
                <span className="legenda-stip" style={{ ["--kleur" as string]: QUICKSCAN_KLASSE_KLEUR[c] } as React.CSSProperties} />
              </span>
              <div>
                <h3 style={{ color: QUICKSCAN_KLASSE_KLEUR[c] }}>{KLASSE_NAAM.afdeling[c]}</h3>
                <p>
                  {grens}
                  {metPunten && vragenPerAfdeling > 0 && ` (${laag} tot en met ${hoog} punten per afdeling)`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
