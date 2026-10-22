import { Assessment, ScanWeergave } from "@/lib/types";
import { bouwblokStatus, categorieVanToepassing, voortgang } from "@/lib/scoring";
import { actieveGroepen } from "@/lib/assessment-structuur";
import { CATEGORIE_COLORS, accentStijl } from "@/lib/colors";
import { isJaNeeWeetNiet } from "@/lib/quickscan";
import { gewichtMarkering } from "@/lib/weging";

export function Sidebar({
  assessment,
  respondent,
  actieveBouwblokId,
  onSelecteer,
}: {
  assessment: Assessment;
  respondent: ScanWeergave;
  actieveBouwblokId: string;
  onSelecteer: (bouwblokId: string) => void;
}) {
  const { percentage, beantwoord, totaal } = voortgang(assessment, respondent.antwoorden, respondent.relevantie);
  const jaNee = isJaNeeWeetNiet(assessment);
  const groepen = actieveGroepen(assessment);
  // Zonder categorielaag (de AI-scan) krijgt het actieve bouwblok zelf een streepje in `--or` (`stylesheet.md`, Doorloopflow).
  const zonderCategorie = groepen.every((g) => !g.naam);

  return (
    <aside className="flow-sidebar">
      <div className="flow-sidebar-koptekst">
        <p className="respondent-naam">{respondent.naam || "Respondent"}</p>

        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <p className="progress-label">
          {percentage}% – {beantwoord} van {totaal} vragen
        </p>
      </div>

      <div className="flow-sidebar-lijst">
        <nav>
          {groepen.map((groep) => {
            // Bij de Quickscan zijn de afdelingen de categorieën, met het kopje in `--or`; de AI-scan heeft geen kleur per groep
            // en gebruikt `--or` voor het streepje. Anders de categoriekleur (`stylesheet.md`, Doorloopflow, Sidebar).
            const kleur = jaNee ? CATEGORIE_COLORS.oranje : groep.kleur ? CATEGORIE_COLORS[groep.kleur] : undefined;
            // Een afdeling die niet van toepassing is: Grijs met "· N.V.T." en doorgestreepte namen. Alleen het eerste bouwblok blijft
            // kiesbaar zodat de keuze nog te wijzigen is (`content-ziekenhuis-quickscan.md`, Doorloop per afdeling).
            const nietVanToepassing = !categorieVanToepassing(assessment, groep.id, respondent.relevantie);
            const actieveGroep = groep.bouwblokken.some((b) => b.id === actieveBouwblokId);
            return (
              <div
                key={groep.id}
                className={`sidebar-categorie ${nietVanToepassing ? "sidebar-categorie--nvt" : ""} ${
                  actieveGroep && groep.naam ? "sidebar-categorie--actief" : ""
                }`}
                style={kleur ? (accentStijl(kleur.hex) as React.CSSProperties) : undefined}
              >
                {groep.naam && (
                  <p className="sidebar-categorie-naam">
                    {groep.naam}
                    {nietVanToepassing && <span className="nvt-label">· N.V.T.</span>}
                  </p>
                )}
                <ul className="sidebar-bouwblokken list-none m-0 p-0">
                  {groep.bouwblokken.map((bouwblok, index) => {
                    const { status, beantwoord: bbBeantwoord, totaal: bbTotaal } = bouwblokStatus(
                      bouwblok,
                      respondent.antwoorden
                    );
                    const actief = bouwblok.id === actieveBouwblokId;
                    // Bij een afdeling die niet van toepassing is, is alleen het eerste bouwblok kiesbaar.
                    const kiesbaar = !nietVanToepassing || index === 0;
                    return (
                      <li key={bouwblok.id}>
                        <button
                          type="button"
                          onClick={() => onSelecteer(bouwblok.id)}
                          disabled={!kiesbaar}
                          aria-current={actief ? "step" : undefined}
                          className={`sidebar-bouwblok status-${
                            nietVanToepassing ? "nvt" : status === "nog-niet-begonnen" ? "onbegonnen" : status
                          } w-full border-0 bg-transparent ${actief ? "actief" : ""} ${
                            actief && zonderCategorie ? "sidebar-bouwblok--streep" : ""
                          }`}
                        >
                          <span className="status-icoon">
                            {nietVanToepassing ? (
                              "–"
                            ) : status === "afgerond" ? (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : status === "bezig" ? (
                              <span className="status-dot" />
                            ) : (
                              bouwblok.volgnummer
                            )}
                          </span>
                          <span className="sidebar-bouwblok-naam">{bouwblok.naam}</span>
                          {gewichtMarkering(bouwblok) && (
                            <span className="gewicht-chip">{gewichtMarkering(bouwblok)}</span>
                          )}
                          {!nietVanToepassing && (jaNee || status === "bezig") && (
                            <span className="text-xs text-ink-s">
                              {bbBeantwoord}/{bbTotaal}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

