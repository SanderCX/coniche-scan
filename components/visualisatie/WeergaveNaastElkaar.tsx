import { Assessment } from "@/lib/types";
import { KLASSE_LABEL, NaastElkaarWeergave, bouwblokWoorden } from "@/lib/visualisatie";
import { KLASSE_KLEUR, Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";

/** De twee symbolen van weergave H: Een cirkel voor de eerste Meting en een ruit voor de tweede (`visualisatie-scores.md`, H). */
export const SYMBOOL_EERSTE = "●";
export const SYMBOOL_TWEEDE = "◆";

/**
 * Weergave H, twee Metingen naast elkaar op een vergelijkbaar meetmoment (`visualisatie-scores.md`, H): Per bouwblok een
 * gevulde cirkel voor de eerste Meting en een gevulde ruit voor de tweede, beide gekleurd naar de klasse, met een dunne grijze
 * lijn ertussen. Geen pijlpunt en geen blauw of oranje, want die kleuren staan bij C voor richting. Rechts het verschil als getal
 * met het symbool van de Meting die hoger scoort, en "Gelijk" bij 0,0. De volgorde is op naam van de Meting.
 */
export function WeergaveNaastElkaar({
  assessment,
  weergave,
  eersteLabel,
  tweedeLabel,
  eersteDatum,
  tweedeDatum,
}: {
  assessment: Assessment;
  weergave: NaastElkaarWeergave;
  eersteLabel: string;
  tweedeLabel: string;
  eersteDatum?: string;
  tweedeDatum?: string;
}) {
  const groepen = vorigeGroepen(weergave.rijen);
  return (
    <div className="vis" data-weergave="naast-elkaar">
      <p className="vis-legenda" style={{ margin: "0 0 0.8rem", display: "flex", flexWrap: "wrap", gap: "0.4rem 1.5rem" }}>
        <span>
          <span className="vis-symbool" aria-hidden="true">{SYMBOOL_EERSTE}</span> <strong>{eersteLabel}</strong>
          {eersteDatum && <span className="text-ink-s"> · {eersteDatum}</span>}
        </span>
        <span>
          <span className="vis-symbool" aria-hidden="true">{SYMBOOL_TWEEDE}</span> <strong>{tweedeLabel}</strong>
          {tweedeDatum && <span className="text-ink-s"> · {tweedeDatum}</span>}
        </span>
      </p>
      <Tegels
        tegels={[
          { label: "Totaalscore", waarde: `${toon(weergave.totaalEerste)} | ${toon(weergave.totaalTweede)}`, sub: `${eersteLabel} | ${tweedeLabel}` },
          { label: `${SYMBOOL_EERSTE} scoort hoger`, waarde: String(weergave.eersteHoger), sub: bouwblokWoorden(assessment).meervoud },
          { label: `${SYMBOOL_TWEEDE} scoort hoger`, waarde: String(weergave.tweedeHoger), sub: bouwblokWoorden(assessment).meervoud },
          { label: "Gelijk", waarde: String(weergave.gelijk), sub: bouwblokWoorden(assessment).meervoud },
        ]}
      />
      <Schaalkop rechts="Verschil" />
      {weergave.rijen.map((r, i) => {
        const links = r.eerste !== null && r.tweede !== null ? Math.min(pct(r.eerste), pct(r.tweede)) : 0;
        const breedte = r.eerste !== null && r.tweede !== null ? Math.abs(pct(r.tweede) - pct(r.eerste)) : 0;
        return (
          <Rij
            key={r.rij.bouwblok.id}
            rij={r.rij}
            vorigeGroepId={groepen[i]}
            assessment={assessment}
            leeg={r.eerste === null && r.tweede === null}
            rechts={
              r.verschil !== null &&
              r.hoger && (
                <span>
                  {r.hoger === "gelijk" ? (
                    "Gelijk"
                  ) : (
                    <>
                      <span className="vis-symbool" aria-hidden="true">
                        {r.hoger === "eerste" ? SYMBOOL_EERSTE : SYMBOOL_TWEEDE}
                      </span>{" "}
                      {toon(r.verschil)}
                    </>
                  )}
                </span>
              )
            }
          >
            {r.eerste !== null && r.tweede !== null && (
              <span className="vis-lijn" style={{ left: `${links}%`, width: `${breedte}%`, ["--vis-lijnkleur" as string]: "var(--ink-s)", opacity: 0.7 }} />
            )}
            {r.eerste !== null && r.eersteKlasse && (
              <span
                className="vis-stip vis-stip--groot"
                style={{ left: `${pct(r.eerste)}%`, ["--vis-kleur" as string]: KLASSE_KLEUR[r.eersteKlasse] }}
                title={`${eersteLabel}: ${toon(r.eerste)} (${KLASSE_LABEL[r.eersteKlasse]})`}
              />
            )}
            {r.tweede !== null && r.tweedeKlasse && (
              <span
                className="vis-stip vis-stip--groot vis-stip--ruit"
                style={{ left: `${pct(r.tweede)}%`, ["--vis-kleur" as string]: KLASSE_KLEUR[r.tweedeKlasse] }}
                title={`${tweedeLabel}: ${toon(r.tweede)} (${KLASSE_LABEL[r.tweedeKlasse]})`}
              />
            )}
          </Rij>
        );
      })}
      <p className="vis-onderschrift">
        De cirkel is {eersteLabel}, de ruit is {tweedeLabel}. Het verschil heeft geen richting: Het symbool laat zien welke Meting hoger scoort.
      </p>
    </div>
  );
}
