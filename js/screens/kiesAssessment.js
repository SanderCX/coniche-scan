import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { renderAssessmentCard } from "../components/card.js";
import { getAllEffectiveAssessments } from "../contentStore.js";

export function render(container) {
  container.innerHTML = `
    ${renderNav()}
    <section class="section">
      <div class="container">
        <div class="eyebrow">Coniche Scan</div>
        <h1>Kies jouw assessment</h1>
        <p style="max-width:640px;">Elke assessment geeft in ±20-30 minuten een helder beeld van waar je
        organisatie staat, met concrete verbeterkansen als resultaat.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:2.5rem;">
          ${getAllEffectiveAssessments().map(renderAssessmentCard).join("")}
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;
  bindNavScroll();
}
