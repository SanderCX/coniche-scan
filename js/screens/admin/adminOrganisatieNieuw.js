import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import { getAllEffectiveAssessments } from "../../contentStore.js";
import { organisatieVelden } from "../../data/organisatieVelden.js";
import { renderVeldenForm, leesVeldenForm } from "../../components/organisatieVeldenForm.js";
import { createOrganisatie } from "../../state.js";
import { escapeHtml } from "../../util.js";

export function render(container) {
  const assessments = getAllEffectiveAssessments();

  container.innerHTML = `
    ${renderAdminNav("organisaties")}
    <div class="admin-main">
      <a href="#/admin/organisaties" class="admin-back">&larr; Organisaties</a>
      <h1>Nieuwe organisatie</h1>

      <form id="nieuwe-org-form">
        <div class="admin-field">
          <label for="org-naam">Organisatienaam</label>
          <input type="text" id="org-naam" required />
        </div>
        <div class="admin-field">
          <label for="org-assessment">Assessment-type</label>
          <select id="org-assessment" required>
            ${assessments.map((a) => `<option value="${a.id}">${escapeHtml(a.naam)}</option>`).join("")}
          </select>
        </div>

        <h2>Organisatiekenmerken</h2>
        ${renderVeldenForm(organisatieVelden)}

        <button type="submit" class="btn btn-or">Organisatie aanmaken</button>
      </form>
    </div>
    ${renderAdminFooter()}
  `;

  container.querySelector("#nieuwe-org-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const naam = container.querySelector("#org-naam").value.trim();
    const assessmentId = container.querySelector("#org-assessment").value;
    if (!naam || !assessmentId) return;
    const kenmerken = leesVeldenForm(organisatieVelden);
    const organisatie = createOrganisatie({ assessmentId, naam, kenmerken });
    location.hash = `#/admin/organisaties/${organisatie.id}`;
  });
}
