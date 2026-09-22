import { Assessment, Respondent } from "@/lib/types";
import { bouwblokStatus, voortgang } from "@/lib/scoring";
import { getGroepen } from "@/lib/assessment-structuur";
import { CATEGORIE_COLORS } from "@/lib/colors";

export function Sidebar({
  assessment,
  respondent,
  actieveBouwblokId,
  onSelecteer,
}: {
  assessment: Assessment;
  respondent: Respondent;
  actieveBouwblokId: string;
  onSelecteer: (bouwblokId: string) => void;
}) {
  const { percentage, beantwoord, totaal } = voortgang(assessment, respondent.antwoorden);

  return (
    <aside className="flow-sidebar">
      <div className="flow-sidebar-koptekst">
        <p className="respondent-naam">{respondent.naam || "Respondent"}</p>

        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <p className="progress-label">
          {percentage}% — {beantwoord} van {totaal} vragen
        </p>
      </div>

      <div className="flow-sidebar-lijst">
        <nav>
          {getGroepen(assessment).map((groep) => {
            const kleur = groep.kleur ? CATEGORIE_COLORS[groep.kleur] : undefined;
            return (
              <div key={groep.id} className="sidebar-categorie">
                {groep.naam && (
                  <p
                    className="sidebar-categorie-naam"
                    style={kleur ? ({ ["--accent" as string]: kleur.hex } as React.CSSProperties) : undefined}
                  >
                    {groep.naam}
                  </p>
                )}
                <ul className="list-none m-0 p-0">
                  {groep.bouwblokken.map((bouwblok) => {
                    const { status, beantwoord: bbBeantwoord, totaal: bbTotaal } = bouwblokStatus(
                      bouwblok,
                      respondent.antwoorden
                    );
                    const actief = bouwblok.id === actieveBouwblokId;
                    return (
                      <li key={bouwblok.id}>
                        <button
                          type="button"
                          onClick={() => onSelecteer(bouwblok.id)}
                          className={`sidebar-bouwblok status-${status === "nog-niet-begonnen" ? "onbegonnen" : status} w-full border-0 bg-transparent ${
                            actief ? "actief" : ""
                          }`}
                          style={kleur ? ({ ["--accent" as string]: kleur.hex } as React.CSSProperties) : undefined}
                        >
                          <span className="status-icoon">
                            {status === "afgerond" ? (
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
                          <span className="flex-1 truncate">{bouwblok.naam}</span>
                          {status === "bezig" && (
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

