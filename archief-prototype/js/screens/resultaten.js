import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { renderResultatenBody } from "../components/resultatenView.js";
import { getRespondent } from "../state.js";
import { getEffectiveAssessment } from "../contentStore.js";
import { computeBouwblokScores, progress } from "../scoring.js";

// Scherm 6 — gedeelde nav/footer zoals overal in de app. De acties die
// eerder onderaan de pagina stonden (exporteren) staan nu in de header,
// samen met "terug naar de scan". "Terug naar overzicht" komt later, als
// het account-stuk gebouwd wordt.
export function render(container, { respondentId }) {
  const respondent = getRespondent(respondentId);
  if (!respondent) {
    location.hash = "#/";
    return;
  }
  const assessment = getEffectiveAssessment(respondent.assessmentId);
  if (!assessment) {
    location.hash = "#/";
    return;
  }

  const bouwblokScores = computeBouwblokScores(assessment, respondent.antwoorden);
  const meta = progress(assessment, respondent.antwoorden);

  const extra = `
    <a href="#/scan/${respondent.id}">&larr; Terug naar de scan</a>
    <button type="button" class="btn btn-outline" disabled aria-disabled="true" title="Binnenkort beschikbaar">Exporteer als PDF</button>
    <button type="button" class="btn btn-outline" disabled aria-disabled="true" title="Binnenkort beschikbaar">Exporteer als CSV</button>
  `;

  container.innerHTML = `
    ${renderNav({ extra })}
    ${renderResultatenBody(assessment, bouwblokScores, meta)}
    ${renderFooter()}
  `;
  bindNavScroll();
}
