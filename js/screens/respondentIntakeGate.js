import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { escapeHtml } from "../util.js";
import { completeIntake } from "../state.js";

// Getoond i.p.v. de doorloopflow zolang een (door de admin uitgenodigde)
// respondent nog status "uitgenodigd" heeft — CLAUDE.md sectie 1: "eerst
// scherm 4 (Respondent-intake) ... pas na het invullen daarvan begint de
// doorloopflow zelf." Zelfde velden als het publieke intake-scherm, maar
// vult een BESTAAND respondent-record i.p.v. een nieuwe aan te maken.
export function render(container, { assessment, respondent, onDone }) {
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
            <input type="text" id="naam" name="naam" required value="${escapeHtml(respondent.naam || "")}" />
          </div>
          <div class="field">
            <label for="rol">Rol / functie</label>
            <input type="text" id="rol" name="rol" value="${escapeHtml(respondent.rol || "")}" />
          </div>
          <div class="field">
            <label for="team">Team</label>
            <input type="text" id="team" name="team" value="${escapeHtml(respondent.team || "")}" />
            <div class="hint">Optioneel</div>
          </div>
          <div class="field">
            <label for="notities">Notities</label>
            <textarea id="notities" name="notities">${escapeHtml(respondent.notities || "")}</textarea>
            <div class="hint">Optioneel</div>
          </div>
          <button type="submit" class="btn btn-or" id="intake-submit" ${respondent.naam ? "" : 'disabled aria-disabled="true"'}>Start assessment</button>
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
    completeIntake(respondent.id, {
      naam,
      rol: form.rol.value.trim(),
      team: form.team.value.trim(),
      notities: form.notities.value.trim(),
    });
    onDone();
  });
}
