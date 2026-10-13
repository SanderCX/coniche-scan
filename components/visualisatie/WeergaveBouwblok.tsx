import { Assessment } from "@/lib/types";
import { EenMetingWeergave, KLASSE_LABEL } from "@/lib/visualisatie";
import { KLASSE_KLEUR, Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";

/**
 * Weergave A, "Per bouwblok" (`visualisatie-scores.md`, A. Eén meting): Per bouwblok een stip op de gemiddelde score, in
 * de kleur van de klasse, met een dunne lijn van de laagste tot de hoogste bouwblokscore van een afgeronde scan en het
 * gemiddelde als getal. De lijn is de score van één scan en dus bij weinig scans herleidbaar: Voor een Admin staat hij altijd
 * aan, voor een Lead pas vanaf `benchmarkMinRespondenten` (`toonBereik`).
 */
export function WeergaveBouwblok({
  assessment,
  weergave,
  toonBereik,
}: {
  assessment: Assessment;
  weergave: EenMetingWeergave;
  toonBereik: boolean;
}) {
  const { rijen, totaal, totaalKlasse, hoogsteBouwblok, laagsteBouwblok, verdeling } = weergave;
  const groepen = vorigeGroepen(rijen);
  const eenheid = assessment.bouwblokEenheidMeervoud;
  return (
    <div className="vis" data-weergave="bouwblok">
      <Tegels
        tegels={[
          { label: "Totaalscore", waarde: toon(totaal), sub: totaalKlasse ? KLASSE_LABEL[totaalKlasse] : undefined },
          { label: `Hoogste ${assessment.bouwblokEenheidEnkelvoud}`, waarde: toon(hoogsteBouwblok?.score), sub: hoogsteBouwblok?.naam },
          { label: `Laagste ${assessment.bouwblokEenheidEnkelvoud}`, waarde: toon(laagsteBouwblok?.score), sub: laagsteBouwblok?.naam },
          {
            label: `Verdeling van de ${eenheid}`,
            waarde: `${verdeling.rood} · ${verdeling.oranje} · ${verdeling.groen}`,
            sub: `${KLASSE_LABEL.rood} · ${KLASSE_LABEL.oranje} · ${KLASSE_LABEL.groen}`,
          },
        ]}
      />
      <Schaalkop rechts="Gemiddelde" />
      {rijen.map((r, i) => (
        <Rij
          key={r.rij.bouwblok.id}
          rij={r.rij}
          vorigeGroepId={groepen[i]}
          assessment={assessment}
          leeg={r.score === null}
          rechts={r.score !== null && <span className="vis-getal">{toon(r.score)}</span>}
        >
          {r.score !== null && r.klasse && (
            <>
              {toonBereik && r.laagste !== null && r.hoogste !== null && (
                <span className="vis-lijn" style={{ left: `${pct(r.laagste)}%`, width: `${pct(r.hoogste) - pct(r.laagste)}%` }} />
              )}
              <span
                className="vis-stip vis-stip--groot"
                style={{ left: `${pct(r.score)}%`, ["--vis-kleur" as string]: KLASSE_KLEUR[r.klasse] }}
                title={`${r.rij.bouwblok.naam}: ${toon(r.score)} (${KLASSE_LABEL[r.klasse]})`}
              />
            </>
          )}
        </Rij>
      ))}
      <p className="vis-onderschrift">
        De stip is het gemiddelde over {weergave.aantalScans} {weergave.aantalScans === 1 ? "afgeronde scan" : "afgeronde scans"}.
        {toonBereik ? " De lijn loopt van de laagste tot de hoogste score van een scan." : ""}
      </p>
    </div>
  );
}
