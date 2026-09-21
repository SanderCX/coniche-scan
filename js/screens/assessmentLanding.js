import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { getEffectiveAssessment } from "../contentStore.js";
import { escapeHtml } from "../util.js";

export function render(container, { assessmentId }) {
  const assessment = getEffectiveAssessment(assessmentId);
  if (!assessment) {
    location.hash = "#/";
    return;
  }

  container.innerHTML = `
    ${renderNav()}
    <section class="section" style="text-align:center;">
      <div class="container">
        <div class="eyebrow">${escapeHtml(assessment.doelgroep)}</div>
        <h1>${escapeHtml(assessment.naam)}</h1>
        <p style="max-width:620px;margin:0 auto 2rem;">${escapeHtml(assessment.subtitel)}</p>
        <a href="#/assessment/${assessment.id}/intake" class="btn btn-or">Start assessment</a>
      </div>
    </section>

    <section class="section" style="padding-top:0;">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;">
          ${assessment.featureCards
            .map(
              (f) => `
            <div class="card card-warm">
              <h3>${escapeHtml(f.titel)}</h3>
              <p style="margin:0;">${escapeHtml(f.tekst)}</p>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0;">
      <div class="container">
        <p style="max-width:720px;">${escapeHtml(assessment.beschrijving)}</p>

        <div class="card" style="max-width:640px;">
          <h3>Praktische informatie</h3>
          <ul style="margin:0;padding-left:1.2rem;">
            ${assessment.praktischeInfo.map((punt) => `<li style="margin-bottom:0.5rem;">${escapeHtml(punt)}</li>`).join("")}
          </ul>
        </div>

        <div style="margin-top:2.5rem;">
          <a href="#/assessment/${assessment.id}/preview" class="btn btn-outline">Bekijk wat je krijgt</a>
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;
  bindNavScroll();
}
