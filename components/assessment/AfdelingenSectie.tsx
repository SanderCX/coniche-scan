import { Sectie } from "@/components/assessment/Sectie";
import { afdelingDefinitie } from "@/lib/landing";
import { Assessment } from "@/lib/types";

/**
 * De sectie "De 4 afdelingen" op de Assessment-pagina van de Quickscan (`CLAUDE.md`, scherm 2, Quickscan Ziekenhuis, besloten door Joost op 21 oktober
 * 2026, ontwerp `Herontwerp-Quickscan`): De kop "Vier afdelingen die samen het klantcontact van het ziekenhuis bepalen", een inleiding en vier kaarten
 * naast elkaar, één per afdeling. Een kaart heeft een nummercirkel (oranje rand), de naam, de definitie uit `content-ziekenhuis-quickscan.md` (in een
 * zin zonder "X =") en onderaan de dimensies met hun aantal vragen (alleen de dimensies die de afdeling heeft, samen 15). Eronder staat een regel dat een
 * afdeling die niet relevant is, wordt overgeslagen. Er is geen radar, want de Quickscan toont percentages en bogen. De kaarten zijn niet klikbaar.
 */
export function AfdelingenSectie({ assessment, warm = false }: { assessment: Assessment; warm?: boolean }) {
  const afdelingen = (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd);
  const vragenPer = (c: (typeof afdelingen)[number]) =>
    c.bouwblokken.filter((b) => !b.gearchiveerd).map((b) => ({ id: b.id, naam: b.naam, aantal: b.vragen.filter((v) => !v.gearchiveerd).length }));
  const totaal = afdelingen.reduce((n, c) => n + vragenPer(c).reduce((m, d) => m + d.aantal, 0), 0);
  const perAfdeling = afdelingen.length > 0 ? Math.round(totaal / afdelingen.length) : 0;
  return (
    <Sectie
      id="afdelingen"
      warm={warm}
      kop="Vier afdelingen die samen het klantcontact van het ziekenhuis bepalen"
      inleiding={`Je beantwoordt ${totaal} vragen met Ja, Nee of Weet ik niet, ${perAfdeling} per afdeling. Daarna zie je per afdeling waar de basis op orde is en waar ontwikkelruimte zit.`}
      kinderen={
        <>
          <div className="ap-afdelingen">
            {afdelingen.map((c, i) => (
              <article key={c.id} className="card ap-afdeling">
                <span className="ap-afdeling-nr" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{c.naam}</h3>
                <p className="ap-afdeling-def">{afdelingDefinitie(c.omschrijving)}</p>
                <ul className="ap-afdeling-dim" aria-label={`Vragen per dimensie bij ${c.naam}`}>
                  {vragenPer(c).map((d) => (
                    <li key={d.id}>
                      <span>{d.naam}</span>
                      <span>
                        {d.aantal} {d.aantal === 1 ? "vraag" : "vragen"}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="ap-afdelingen-voet">Is een afdeling niet relevant voor jouw situatie, dan sla je haar vragen over en telt ze niet mee in de score.</p>
        </>
      }
    />
  );
}
