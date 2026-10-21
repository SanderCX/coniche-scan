import { Assessment, ScanWeergave } from "@/lib/types";
import { bouwblokStatus, voortgang } from "@/lib/scoring";
import { actieveBouwblokkenMetGroep } from "@/lib/assessment-structuur";
import { tekstOpVeldKleur, veldKleur } from "@/lib/colors";

/**
 * De sidebar van de doorloopflow bij de Spanningsmeter (`visualisatie-spanningsmeter.md`, Doorloopflow): De naam van de respondent,
 * de voortgangsbalk en "x van 30 vragen", en daaronder de zes velden zonder categoriekoppen. Per veld een rij met het nummer in een
 * bolletje in de veldkleur, de naam en rechts de status ("n/5" bij bezig, een vinkje bij afgerond). De open vraag telt niet mee.
 */
export function SpanningSidebar({
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
  const velden = actieveBouwblokkenMetGroep(assessment).map((b) => b.bouwblok);

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
        <nav aria-label="Spanningsvelden">
          <ul className="list-none m-0 p-0">
            {velden.map((veld) => {
              const { status, beantwoord: n, totaal: van } = bouwblokStatus(veld, respondent.antwoorden);
              const actief = veld.id === actieveBouwblokId;
              return (
                <li key={veld.id}>
                  <button
                    type="button"
                    onClick={() => onSelecteer(veld.id)}
                    className={`sp-side-rij w-full border-0 bg-transparent ${actief ? "actief" : ""}`}
                    aria-current={actief ? "step" : undefined}
                  >
                    <span className="sp-nr" style={{ background: veldKleur(veld.volgnummer), color: tekstOpVeldKleur(veld.volgnummer) }}>
                      {veld.volgnummer}
                    </span>
                    <span className="flex-1 truncate">{veld.naam}</span>
                    {status === "afgerond" ? (
                      <span className="sp-side-klaar" aria-label="Afgerond">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : status === "bezig" ? (
                      <span className="text-xs text-ink-s">
                        {n}/{van}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
