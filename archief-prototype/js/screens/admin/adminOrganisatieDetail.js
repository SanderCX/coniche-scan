import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import { renderBulkToolbar, wireBulkSelect } from "../../components/bulkSelect.js";
import { getEffectiveAssessment } from "../../contentStore.js";
import { organisatieVelden } from "../../data/organisatieVelden.js";
import { renderVeldenForm, leesVeldenForm } from "../../components/organisatieVeldenForm.js";
import {
  getOrganisatie,
  updateOrganisatieKenmerken,
  getRespondentenVoorOrganisatie,
  addRespondentToOrganisatie,
  deleteRespondenten,
} from "../../state.js";
import { progress } from "../../scoring.js";
import { escapeHtml } from "../../util.js";

function formatDatum(iso) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export function render(container, { organisatieId }) {
  const organisatie = getOrganisatie(organisatieId);
  if (!organisatie) {
    location.hash = "#/admin/organisaties";
    return;
  }
  const assessment = getEffectiveAssessment(organisatie.assessmentId);
  const respondenten = getRespondentenVoorOrganisatie(organisatie.id);

  const respondentRows = respondenten
    .map((r) => {
      const p = assessment ? progress(assessment, r.antwoorden) : { percentage: 0 };
      return `
        <tr>
          <td><input type="checkbox" class="bulk-select" data-id="${r.id}" /></td>
          <td>${escapeHtml(r.naam || r.email || "(naamloos)")}</td>
          <td>${escapeHtml(r.email || "–")}</td>
          <td><span class="admin-badge status-${r.status}">${escapeHtml(r.status)}</span></td>
          <td>${p.percentage}%</td>
          <td>${formatDatum(r.gestartOp)}</td>
          <td><a href="#/admin/scans/${r.id}">bekijk</a></td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    ${renderAdminNav("organisaties")}
    <div class="admin-main">
      <a href="#/admin/organisaties" class="admin-back">&larr; Organisaties</a>
      <h1>${escapeHtml(organisatie.naam)}</h1>
      <div class="admin-notice">Assessment-type: <strong>${escapeHtml(assessment ? assessment.naam : organisatie.assessmentId)}</strong></div>

      <h2>Respondenten</h2>
      ${
        respondenten.length === 0
          ? `<div class="admin-notice">Nog geen respondenten uitgenodigd.</div>`
          : `
        ${renderBulkToolbar()}
        <table class="admin-table">
              <thead><tr><th><input type="checkbox" id="select-all" /></th><th>Naam</th><th>E-mail</th><th>Status</th><th>Voortgang</th><th>Uitgenodigd</th><th></th></tr></thead>
              <tbody>${respondentRows}</tbody>
            </table>`
      }

      <form id="uitnodigen-form" style="margin-top:1.2rem;display:flex;gap:0.8rem;align-items:flex-end;flex-wrap:wrap;">
        <div class="admin-field" style="margin-bottom:0;flex:1;min-width:220px;">
          <label for="uitnodigen-email">E-mailadres uitnodigen</label>
          <input type="email" id="uitnodigen-email" required placeholder="naam@organisatie.nl" />
        </div>
        <button type="submit" class="btn btn-or">Uitnodigen</button>
      </form>

      <h2 style="margin-top:2.5rem;">Organisatiekenmerken</h2>
      <form id="kenmerken-form">
        ${renderVeldenForm(organisatieVelden, organisatie.kenmerken || {})}
        <button type="submit" class="btn btn-or">Kenmerken opslaan</button>
        <span class="admin-save-state" id="kenmerken-saved">Opgeslagen &#10003;</span>
      </form>
    </div>
    ${renderAdminFooter()}
  `;

  if (respondenten.length > 0) {
    wireBulkSelect(container, (ids) => {
      const aantal = ids.length;
      if (
        confirm(
          `${aantal} ${aantal === 1 ? "respondent" : "respondenten"} definitief verwijderen? Dit kan niet ongedaan gemaakt worden.`
        )
      ) {
        deleteRespondenten(ids);
        render(container, { organisatieId });
      }
    });
  }

  container.querySelector("#uitnodigen-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = container.querySelector("#uitnodigen-email");
    const email = emailInput.value.trim();
    if (!email) return;
    addRespondentToOrganisatie(organisatie.id, email);
    render(container, { organisatieId });
  });

  container.querySelector("#kenmerken-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const kenmerken = leesVeldenForm(organisatieVelden);
    updateOrganisatieKenmerken(organisatie.id, kenmerken);
    const saved = container.querySelector("#kenmerken-saved");
    saved.classList.add("zichtbaar");
    clearTimeout(saved._timeout);
    saved._timeout = setTimeout(() => saved.classList.remove("zichtbaar"), 1600);
  });
}
