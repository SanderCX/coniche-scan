import { Assessment } from "@/lib/types";
import { RijVergelijking, Vergelijking } from "@/lib/verkennen";
import { Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "@/components/visualisatie/gedeeld";

export type Sortering = "model" | "uitslag";

function teken(n: number): string {
  return n > 0 ? "+" : n < 0 ? "−" : "";
}

/**
 * De eerste twee weergaven van Verkennen (`visualisatie-verkennen.md`, 1 en 2), op een schaal van 1 tot 5 per bouwblok.
 * - `groep`: Elke Organisatie is een stip, de focus oranje en iets groter, de rest grijs. Een streep op het gemiddelde van de focus
 *   (oranje) en van de rest (donkergrijs). Rechts de gemiddelden en het verschil. Hover op een stip toont naam en score.
 * - `spreiding`: Alleen de stippen van de focus, met het bereik als dunne lijn, de middelste helft als oranje balk, de mediaan als
 *   streep en de middelste helft van de rest als grijze balk erachter. Rechts de mediaan, de spreiding en het bereik.
 * Sorteren op grootste verschil of grootste spreiding laat de kopregels per categorie vervallen.
 */
export function WeergaveGroepRest({
  assessment,
  vergelijking,
  modus,
  sortering,
  focusNaam,
  zonderGroepering = false,
}: {
  assessment: Assessment;
  vergelijking: Vergelijking;
  modus: "groep" | "spreiding";
  sortering: Sortering;
  focusNaam: string;
  /** Zonder groepering is de hele pool de focus en is er geen rest (`visualisatie-verkennen.md`, Zonder groepering). */
  zonderGroepering?: boolean;
}) {
  const { overall } = vergelijking;
  const rijen: RijVergelijking[] =
    sortering === "model"
      ? vergelijking.rijen
      : [...vergelijking.rijen].sort((a, b) =>
          modus === "groep"
            ? Math.abs(b.verschil ?? 0) - Math.abs(a.verschil ?? 0)
            : (b.focus.sd ?? -1) - (a.focus.sd ?? -1)
        );
  const groepen = sortering === "model" ? vorigeGroepen(rijen) : rijen.map((r) => r.rij.groepId);
  const metScore = rijen.filter((r) => r.focus.gemiddelde !== null);
  const hoogste = metScore.reduce<RijVergelijking | null>((m, r) => (m === null || (r.focus.gemiddelde as number) > (m.focus.gemiddelde as number) ? r : m), null);
  const laagste = metScore.reduce<RijVergelijking | null>((m, r) => (m === null || (r.focus.gemiddelde as number) < (m.focus.gemiddelde as number) ? r : m), null);
  const verschilTekst = (v: number | null) => (v === null ? "–" : `${Math.abs(v) < 0.05 ? "" : teken(v)}${toon(Math.abs(v))}`);

  return (
    <div className="vis" data-weergave={`verkennen-${modus}`}>
      <Tegels
        tegels={zonderGroepering ? [
          { label: "Gemiddelde van de pool", waarde: toon(overall.focus.gemiddelde), sub: "Overall score" },
          { label: "Organisaties", waarde: String(overall.focus.n), sub: "in de pool" },
          {
            label: `Hoogste ${assessment.bouwblokEenheidEnkelvoud}`,
            waarde: hoogste ? toon(hoogste.focus.gemiddelde) : "–",
            sub: hoogste?.rij.bouwblok.naam,
          },
          {
            label: `Laagste ${assessment.bouwblokEenheidEnkelvoud}`,
            waarde: laagste ? toon(laagste.focus.gemiddelde) : "–",
            sub: laagste?.rij.bouwblok.naam,
          },
        ] : [
          { label: `Gemiddelde van ${focusNaam}`, waarde: toon(overall.focus.gemiddelde), sub: `${overall.focus.n} Organisaties` },
          { label: "Gemiddelde van de rest", waarde: toon(overall.rest.gemiddelde), sub: `${overall.rest.n} Organisaties` },
          {
            label: `Grootste plus per ${assessment.bouwblokEenheidEnkelvoud}`,
            waarde: vergelijking.grootstePlus ? `+${toon(vergelijking.grootstePlus.verschil)}` : "–",
            sub: vergelijking.grootstePlus?.naam,
          },
          {
            label: `Grootste min per ${assessment.bouwblokEenheidEnkelvoud}`,
            waarde: vergelijking.grootsteMin ? `−${toon(Math.abs(vergelijking.grootsteMin.verschil))}` : "–",
            sub: vergelijking.grootsteMin?.naam,
          },
        ]}
      />
      <Schaalkop
        rechts={
          modus === "groep"
            ? zonderGroepering
              ? "Gemiddelde"
              : "Focus · rest · verschil"
            : "Mediaan · spreiding · bereik"
        }
      />
      {rijen.map((r, i) => (
        <Rij
          key={r.rij.bouwblok.id}
          rij={r.rij}
          vorigeGroepId={groepen[i]}
          assessment={assessment}
          bandenAchtergrond={false}
          leeg={r.focus.n === 0 && r.rest.n === 0}
          rechts={
            modus === "groep" ? (
              <>
                <span className="vis-getal" style={{ color: "var(--or)" }}>{toon(r.focus.gemiddelde)}</span>
                {!zonderGroepering && <span className="text-ink-m">{toon(r.rest.gemiddelde)}</span>}
                {!zonderGroepering && r.verschil !== null && (
                  <span className={r.verschil > 0.04 ? "vis-stijging" : r.verschil < -0.04 ? "vis-daling" : ""}>
                    {r.verschil > 0.04 ? "▲" : r.verschil < -0.04 ? "▼" : "="} {verschilTekst(r.verschil)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-ink-m">
                <strong style={{ color: "var(--ink)" }}>{toon(r.focus.mediaan)}</strong> · σ {toon(r.focus.sd)} ·{" "}
                {r.focus.min === null ? "–" : `${toon(r.focus.min)}–${toon(r.focus.max)}`}
              </span>
            )
          }
        >
          {modus === "groep" ? (
            <>
              {r.stippenRest.map((s, k) => (
                <span
                  key={`r${k}`}
                  className="vis-stip vk-stip-rest"
                  style={{ left: `${pct(s.score)}%` }}
                  title={`${s.naam}: ${toon(s.score)}`}
                />
              ))}
              {r.stippenFocus.map((s, k) => (
                <span
                  key={`f${k}`}
                  className="vis-stip vis-stip--groot vk-stip-focus"
                  style={{ left: `${pct(s.score)}%` }}
                  title={`${s.naam}: ${toon(s.score)}`}
                />
              ))}
              {r.rest.gemiddelde !== null && (
                <span className="vis-streep vk-streep-rest" style={{ left: `${pct(r.rest.gemiddelde)}%` }} title={`Rest: ${toon(r.rest.gemiddelde)}`} />
              )}
              {r.focus.gemiddelde !== null && (
                <span className="vis-streep vk-streep-focus" style={{ left: `${pct(r.focus.gemiddelde)}%` }} title={`Focus: ${toon(r.focus.gemiddelde)}`} />
              )}
            </>
          ) : (
            <>
              {r.rest.q1 !== null && r.rest.q3 !== null && (
                <span
                  className="vis-band"
                  style={{ left: `${pct(r.rest.q1)}%`, width: `${pct(r.rest.q3) - pct(r.rest.q1)}%`, background: "rgba(136,136,132,.28)" }}
                />
              )}
              {r.focus.min !== null && r.focus.max !== null && (
                <span
                  className="vis-lijn"
                  style={{ left: `${pct(r.focus.min)}%`, width: `${pct(r.focus.max) - pct(r.focus.min)}%`, ["--vis-lijnkleur" as string]: "var(--ink-s)" }}
                />
              )}
              {r.focus.q1 !== null && r.focus.q3 !== null && (
                <span
                  className="vis-band vis-band--smal"
                  style={{ left: `${pct(r.focus.q1)}%`, width: `${Math.max(0.8, pct(r.focus.q3) - pct(r.focus.q1))}%`, background: "rgba(255,103,31,.5)" }}
                />
              )}
              {r.stippenFocus.map((s, k) => (
                <span
                  key={k}
                  className="vis-stip vk-stip-focus"
                  style={{ left: `${pct(s.score)}%` }}
                  title={`${s.naam}: ${toon(s.score)}`}
                />
              ))}
              {r.focus.mediaan !== null && (
                <span className="vis-streep vk-streep-focus" style={{ left: `${pct(r.focus.mediaan)}%` }} title={`Mediaan: ${toon(r.focus.mediaan)}`} />
              )}
            </>
          )}
        </Rij>
      ))}
      <p className="vis-onderschrift">
        {zonderGroepering
          ? modus === "groep"
            ? "Elke stip is een Organisatie in de pool. De oranje streep is het gemiddelde van de pool. Elke Organisatie telt even zwaar. Kies bij Kenmerken een kenmerk om de pool in groepen te verdelen."
            : "De stippen zijn de Organisaties van de pool. De oranje balk is de middelste helft van de pool, de streep de mediaan. σ is de standaardafwijking (n − 1)."
          : modus === "groep"
          ? "Elke stip is een Organisatie: Oranje is de focus, grijs de rest. De oranje streep is het gemiddelde van de focus, de donkergrijze streep dat van de rest. Elke Organisatie telt even zwaar."
          : "De stippen zijn de Organisaties van de focus. De oranje balk is de middelste helft van de focus, de grijze balk daarachter de middelste helft van de rest, de streep de mediaan. σ is de standaardafwijking (n − 1)."}
      </p>
    </div>
  );
}
