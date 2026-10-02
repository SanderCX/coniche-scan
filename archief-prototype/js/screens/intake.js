import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { alleBouwblokken } from "../data/assessments.js";
import { getEffectiveAssessment } from "../contentStore.js";
import { escapeHtml } from "../util.js";
import { createRespondent } from "../state.js";

// Scherm 4 — alleen naam, rol/functie, team (optioneel), notities (optioneel).
// GEEN organisatienaam/sector-velden: die liggen al vast op Organisatie-niveau
// (CLAUDE.md sectie 1, "Respondent").
export function render(container, { assessmentId }) {
  const assessment = getEffectiveAssessment(assessmentId);
  if (!assessment) {
    location.hash = "#/";
    return;
  }

  container.innerHTML = `
    ${renderNav()}
    <section class="section">
      <div class="container" style="max-width:560px;">
        <div class="eyebrow">${escapeHtml(assessment.naam)}</div>
        <h1 style="font-size:clamp(2rem,4vw,2.65rem);">Voordat je begint</h1>
        <p>Een paar korte gegevens, zodat we het resultaat aan jou kunnen koppelen.</p>

        <form id="intake-form">
          <div class="field">
            <label for="naam">Naam *</label>
            <input type="text" id="naam" name="naam" required />
          </div>
          <div class="field">
            <label for="rol">Rol / functie</label>
            <input type="text" id="rol" name="rol" />
          </div>
          <div class="field">
            <label for="team">Team</label>
            <input type="text" id="team" name="team" />
            <div class="hint">Optioneel</div>
          </div>
          <div class="field">
            <label for="notities">Notities</label>
            <textarea id="notities" name="notities"></textarea>
            <div class="hint">Optioneel</div>
          </div>
          <button type="submit" class="btn btn-or" id="intake-submit" disabled aria-disabled="true">Start assessment</button>
        </form>
      </div>
    </section>
    ${renderFooter()}
  `;
  bindNavScroll();

  const form = container.querySelector("#intake-form");
  const naamInput = container.querySelector("#naam");
  const submitBtn = container.querySelector("#intake-submit");

  function updateSubmitState() {
    const heeftNaam = naamInput.value.trim().length > 0;
    submitBtn.disabled = !heeftNaam;
    submitBtn.setAttribute("aria-disabled", String(!heeftNaam));
  }
  naamInput.addEventListener("input", updateSubmitState);
  updateSubmitState();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const naam = naamInput.value.trim();
    if (!naam) return;
    const respondent = createRespondent({
      assessmentId: assessment.id,
      naam,
      rol: form.rol.value.trim(),
      team: form.team.value.trim(),
      notities: form.notities.value.trim(),
    });
    const eersteBouwblok = alleBouwblokken(assessment)[0];
    location.hash = `#/scan/${respondent.id}/bouwblok/${eersteBouwblok.id}`;
  });
}
