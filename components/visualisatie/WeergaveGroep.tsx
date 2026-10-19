import { Assessment } from "@/lib/types";
import { TussenOrganisatiesWeergave, bouwblokWoorden } from "@/lib/visualisatie";
import { Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";

function teken(n: number): string {
  return n > 0 ? "+" : n < 0 ? "−" : "";
}

/**
 * Weergave D, tussen organisaties (`visualisatie-scores.md`, D): Per bouwblok een lichte band van het minimum tot het
 * maximum van de groep, een donkerder band van het eerste tot het derde kwartiel, een streep op het groepsgemiddelde en een
 * oranje stip met witte rand op de score van X. Rechts de score van X, het verschil met het groepsgemiddelde en een label
 * voor de positie. De bandachtergrond van de classificatie vervalt hier. Nooit de namen van andere leden.
 */
export function WeergaveGroep({
  assessment,
  weergave,
  eigenNaam,
}: {
  assessment: Assessment;
  weergave: TussenOrganisatiesWeergave;
  /** De naam van het lid van de view, bijvoorbeeld "Org A" of "Meting Nulmeting". */
  eigenNaam: string;
}) {
  const groepen = vorigeGroepen(weergave.rijen);
  return (
    <div className="vis" data-weergave="groep">
      <Tegels
        tegels={[
          { label: "Vergelijkgroep", waarde: String(weergave.grootte), sub: "andere leden" },
          { label: "Boven het gemiddelde", waarde: String(weergave.boven), sub: `${bouwblokWoorden(assessment).meervoud}` },
          { label: "Bovenste kwart", waarde: String(weergave.inBovensteKwart), sub: `${bouwblokWoorden(assessment).meervoud}` },
          { label: "Onderste kwart", waarde: String(weergave.inOndersteKwart), sub: `${bouwblokWoorden(assessment).meervoud}` },
        ]}
      />
      <Schaalkop rechts={eigenNaam} />
      {weergave.rijen.map((r, i) => (
        <Rij
          key={r.rij.bouwblok.id}
          rij={r.rij}
          vorigeGroepId={groepen[i]}
          assessment={assessment}
          bandenAchtergrond={false}
          leeg={r.eigen === null && r.groep === null}
          rechts={
            <>
              {r.eigen !== null && <span className="vis-getal">{toon(r.eigen)}</span>}
              {r.verschil !== null && (
                <span className={r.verschil > 0 ? "vis-stijging" : r.verschil < 0 ? "vis-daling" : ""}>
                  {teken(r.verschil)}
                  {toon(Math.abs(r.verschil))}
                </span>
              )}
              {r.positie && (
                <span
                  className={`vis-label ${r.positie === "Bovenste kwart" ? "vis-label--boven" : r.positie === "Onderste kwart" ? "vis-label--onder" : ""}`}
                >
                  {r.positie}
                </span>
              )}
            </>
          }
        >
          {r.groep && (
            <>
              <span className="vis-band vis-band--breed" style={{ left: `${pct(r.groep.min)}%`, width: `${pct(r.groep.max) - pct(r.groep.min)}%` }} />
              <span className="vis-band vis-band--smal" style={{ left: `${pct(r.groep.q1)}%`, width: `${pct(r.groep.q3) - pct(r.groep.q1)}%` }} />
              <span className="vis-streep" style={{ left: `${pct(r.groep.gemiddelde)}%` }} />
            </>
          )}
          {r.eigen !== null && (
            <span
              className="vis-stip vis-stip--groot vis-stip--wit"
              style={{ left: `${pct(r.eigen)}%`, ["--vis-kleur" as string]: "var(--or)" }}
              title={`${eigenNaam}: ${toon(r.eigen)}`}
            />
          )}
        </Rij>
      ))}
      <p className="vis-onderschrift">
        De oranje stip is {eigenNaam}. De lichte band loopt van het laagste tot het hoogste lid van de groep, de donkere band is
        de middelste helft, de streep het gemiddelde van de {weergave.grootte} andere leden.
      </p>
    </div>
  );
}
