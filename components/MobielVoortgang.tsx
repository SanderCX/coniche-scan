import { Assessment, Respondent } from "@/lib/types";
import { voortgang } from "@/lib/scoring";

/**
 * Compacte voortgangsbalk, alleen zichtbaar onder de 900px-breakpoint (zie
 * .flow-mobiel-voortgang in components.css). Op verzoek van Sander
 * (2026-09-22, zie changelog.md): `.flow-sidebar` is onder 900px bewust
 * `position: static` (design van Joost) en scrolt dus met de rest van de
 * pagina mee weg — maar tijdens het beantwoorden van vragen moet de
 * voortgang zichtbaar blijven. Staat daarom als eigen, buiten `.flow-layout`
 * geplaatst element (niet als grid-item) zodat sticky positioneren over de
 * volledige paginahoogte werkt, niet alleen binnen de sidebar zelf.
 */
export function MobielVoortgang({
  assessment,
  respondent,
}: {
  assessment: Assessment;
  respondent: Respondent;
}) {
  const { percentage, beantwoord, totaal } = voortgang(assessment, respondent.antwoorden);

  return (
    <div className="flow-mobiel-voortgang">
      <div className="progress-bar" style={{ marginBottom: "0.3rem" }}>
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p className="progress-label" style={{ marginBottom: 0 }}>
        {percentage}% — {beantwoord} van {totaal} vragen
      </p>
    </div>
  );
}
