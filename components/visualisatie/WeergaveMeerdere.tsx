import { Assessment } from "@/lib/types";
import { KLASSE_LABEL, MeerdereWeergave, bouwblokWoorden, stapelStappen } from "@/lib/visualisatie";
import { KLASSE_KLEUR, EenheidTeksten, Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";
import { VormTeken } from "./VormTeken";

/**
 * Per bouwblok, Naast elkaar bij meer dan twee onderdelen (`visualisatie-scores.md`, I): Elk onderdeel heeft een eigen vorm op zijn
 * eigen score, gekleurd naar de klasse zoals bij A, met de streep op het gemiddelde. Onderdelen met dezelfde score staan onder
 * elkaar gestapeld, zoals bij B. Boven de weergave staat een legenda met de vormen en de namen. De vorm onderscheidt de
 * onderdelen, niet de kleur (zelfde principe als H).
 */
export function WeergaveMeerdere({
  assessment,
  weergave,
  eenheid,
}: {
  assessment: Assessment;
  weergave: MeerdereWeergave;
  eenheid: EenheidTeksten;
}) {
  const groepen = vorigeGroepen(weergave.rijen);
  const woorden = bouwblokWoorden(assessment);
  return (
    <div className="vis" data-weergave="naast-elkaar-meerdere">
      <p className="vis-legenda vis-legenda-rij">
        {weergave.eenheden.map((e) => (
          <span key={e.id}>
            <VormTeken vorm={e.vorm} /> <strong>{e.label}</strong>
            {e.sublabel && <span className="text-ink-s"> · {e.sublabel}</span>}
          </span>
        ))}
      </p>
      <Tegels
        tegels={[
          { label: eenheid.telLabel, waarde: String(weergave.eenheden.length), sub: eenheid.telSub },
          { label: `Hoogste ${eenheid.enkelvoud}`, waarde: toon(weergave.hoogste?.totaal), sub: weergave.hoogste?.label },
          { label: `Laagste ${eenheid.enkelvoud}`, waarde: toon(weergave.laagste?.totaal), sub: weergave.laagste?.label },
          { label: "Grootste verschil", waarde: toon(weergave.grootsteVerschil?.verschil), sub: weergave.grootsteVerschil?.naam },
        ]}
      />
      <Schaalkop rechts="Gemiddelde" />
      {weergave.rijen.map((r, i) => {
        const stappen = stapelStappen(r.punten.map((p) => p.score));
        return (
          <Rij
            key={r.rij.bouwblok.id}
            rij={r.rij}
            vorigeGroepId={groepen[i]}
            assessment={assessment}
            leeg={r.punten.length === 0}
            rechts={r.gemiddelde !== null && <span className="vis-getal">{toon(r.gemiddelde)}</span>}
          >
            {r.gemiddelde !== null && <span className="vis-streep" style={{ left: `${pct(r.gemiddelde)}%` }} />}
            {r.punten.map((p, k) => {
              const e = weergave.eenheden[p.index];
              return (
                <span
                  key={p.index}
                  className={`vis-stip vis-stip--groot vis-vorm--${e.vorm}`}
                  style={{
                    left: `${pct(p.score)}%`,
                    top: `calc(50% + ${stappen[k] * 0.6}rem)`,
                    ["--vis-kleur" as string]: KLASSE_KLEUR[p.klasse],
                  }}
                  title={`${e.label}: ${toon(p.score)} (${KLASSE_LABEL[p.klasse]})`}
                />
              );
            })}
          </Rij>
        );
      })}
      <p className="vis-onderschrift">
        Elke vorm is een {eenheid.enkelvoud}, de streep is het gemiddelde van de {eenheid.meervoud}. De vorm laat zien welk {eenheid.enkelvoud} het is, de
        kleur de klasse van het {woorden.enkelvoud}.
      </p>
    </div>
  );
}
