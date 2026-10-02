import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { renderResultatenBody } from "../components/resultatenView.js";
import { totaalAantalVragen } from "../data/assessments.js";
import { getEffectiveAssessment } from "../contentStore.js";
import { previewBouwblokScores } from "../data/previewData.js";

export function render(container, { assessmentId }) {
  const assessment = getEffectiveAssessment(assessmentId);
  if (!assessment) {
    location.hash = "#/";
    return;
  }
  const bouwblokScores = previewBouwblokScores[assessment.id] || {};
  const totaal = totaalAantalVragen(assessment);

  container.innerHTML = `
    ${renderNav()}
    <div>
      <div class="preview-banner">Dit is een voorbeeldrapport met demo-data — geen echte scan.</div>
      ${renderResultatenBody(assessment, bouwblokScores, { beantwoord: totaal, totaal })}
      <div class="container" style="text-align:center;padding-bottom:4rem;">
        <a href="#/assessment/${assessment.id}/intake" class="btn btn-or">Start jouw assessment</a>
      </div>
    </div>
    ${renderFooter()}
  `;
  bindNavScroll();
}
