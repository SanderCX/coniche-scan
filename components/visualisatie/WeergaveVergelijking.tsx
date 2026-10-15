import { Assessment } from "@/lib/types";
import { KLASSE_LABEL, TussenMetingenWeergave } from "@/lib/visualisatie";
import { KLASSE_KLEUR, Rij, Schaalkop, Tegels, pct, toon, vorigeGroepen } from "./gedeeld";

function teken(n: number): string {
  return n > 0 ? "+" : n < 0 ? "−" : "";
}

/**
 * Weergave C, de vergelijking met een vorige Meting (`visualisatie-scores.md`, C): Per bouwblok een holle grijze ring op de
 * vorige Meting, een gevulde stip op de huidige (kleur van de klasse) en een lijn ertussen: Blauw bij stijging, donkeroranje
 * bij daling, grijs bij geen verandering. Rechts het verschil met een driehoekje en teken, en een label bij een wissel van
 * klasse. Het verschil is de getoonde waarde van de nieuwere Meting min de getoonde van de oudere.
 */
export function WeergaveVergelijking({
  assessment,
  weergave,
  vorigLabel,
  huidigLabel,
}: {
  assessment: Assessment;
  weergave: TussenMetingenWeergave;
  vorigLabel: string;
  huidigLabel: string;
}) {
  const groepen = vorigeGroepen(weergave.rijen);
  return (
    <div className="vis" data-weergave="vergelijking">
      <Tegels
        tegels={[
          { label: "Totaalscore", waarde: `${toon(weergave.totaalVorig)} → ${toon(weergave.totaalHuidig)}`, sub: `${vorigLabel} → ${huidigLabel}` },
          { label: "Gestegen", waarde: String(weergave.gestegen), sub: `${assessment.bouwblokEenheidMeervoud}` },
          { label: "Gedaald", waarde: String(weergave.gedaald), sub: `${assessment.bouwblokEenheidMeervoud}` },
          { label: "Van klasse gewisseld", waarde: String(weergave.gewisseld), sub: `${assessment.bouwblokEenheidMeervoud}` },
        ]}
      />
      <Schaalkop rechts="Verschil" />
      {weergave.rijen.map((r, i) => {
        const kleurLijn =
          r.richting === "stijging" ? "var(--bl)" : r.richting === "daling" ? "var(--dal)" : "var(--ink-s)";
        const links = r.vorig !== null && r.huidig !== null ? Math.min(pct(r.vorig), pct(r.huidig)) : 0;
        const breedte = r.vorig !== null && r.huidig !== null ? Math.abs(pct(r.huidig) - pct(r.vorig)) : 0;
        return (
          <Rij
            key={r.rij.bouwblok.id}
            rij={r.rij}
            vorigeGroepId={groepen[i]}
            assessment={assessment}
            leeg={r.vorig === null && r.huidig === null}
            rechts={
              <>
                {r.verschil !== null && r.richting && (
                  <span className={r.richting === "stijging" ? "vis-stijging" : r.richting === "daling" ? "vis-daling" : ""}>
                    {r.richting === "stijging" ? "▲" : r.richting === "daling" ? "▼" : "="} {teken(r.verschil)}
                    {toon(Math.abs(r.verschil))}
                  </span>
                )}
                {r.klasseGewisseld && r.vorigeKlasse && r.huidigeKlasse && (
                  <span className="vis-label">
                    {KLASSE_LABEL[r.vorigeKlasse]} → {KLASSE_LABEL[r.huidigeKlasse]}
                  </span>
                )}
              </>
            }
          >
            {r.vorig !== null && r.huidig !== null && (
              <span className="vis-lijn" style={{ left: `${links}%`, width: `${breedte}%`, ["--vis-lijnkleur" as string]: kleurLijn, opacity: 0.9 }} />
            )}
            {r.vorig !== null && (
              <span
                className="vis-stip vis-stip--ring vis-stip--groot"
                style={{ left: `${pct(r.vorig)}%`, ["--vis-kleur" as string]: "var(--ink-s)" }}
                title={`${vorigLabel}: ${toon(r.vorig)}`}
              />
            )}
            {r.huidig !== null && r.huidigeKlasse && (
              <span
                className="vis-stip vis-stip--groot"
                style={{ left: `${pct(r.huidig)}%`, ["--vis-kleur" as string]: KLASSE_KLEUR[r.huidigeKlasse] }}
                title={`${huidigLabel}: ${toon(r.huidig)}`}
              />
            )}
          </Rij>
        );
      })}
      <p className="vis-onderschrift">
        De holle ring is {vorigLabel}, de gevulde stip is {huidigLabel}. Blauw is een stijging, donkeroranje een daling.
      </p>
    </div>
  );
}
