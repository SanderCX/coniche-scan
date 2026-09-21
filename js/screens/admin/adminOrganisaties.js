import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import { renderBulkToolbar, wireBulkSelect } from "../../components/bulkSelect.js";
import { getAllOrganisaties, getRespondentenVoorOrganisatie, deleteOrganisaties } from "../../state.js";
import { getEffectiveAssessment } from "../../contentStore.js";
import { escapeHtml } from "../../util.js";

export function render(container) {
  const organisaties = getAllOrganisaties();

  const rows = organisaties
    .map((org) => {
      const respondenten = getRespondentenVoorOrganisatie(org.id);
      const afgerond = respondenten.filter((r) => r.status === "afgerond").length;
      const assessment = getEffectiveAssessment(org.assessmentId);
      return `
        <div style="display:flex;align-items:center;gap:0.8rem;">
          <input type="checkbox" class="bulk-select" data-id="${org.id}" />
          <a href="#/admin/organisaties/${org.id}" class="admin-row" style="flex:1;">
            <div>
              <div class="admin-row-titel">${escapeHtml(org.naam)}</div>
              <div class="admin-row-sub">${escapeHtml(assessment ? assessment.naam : org.assessmentId)} &middot; ${respondenten.length} respondenten, ${afgerond} afgerond</div>
            </div>
          </a>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    ${renderAdminNav("organisaties")}
    <div class="admin-main">
      <a href="#/admin" class="admin-back">&larr; Beheer</a>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
        <h1>Organisaties</h1>
        <a href="#/admin/organisaties/nieuw" class="btn btn-or">+ Nieuwe organisatie</a>
      </div>

      ${
        organisaties.length === 0
          ? `<div class="admin-notice">Nog geen organisaties aangemaakt. Klik op "Nieuwe organisatie" om er een aan te maken.</div>`
          : `
        <label style="display:flex;align-items:center;gap:0.5rem;margin:1.2rem 0 0.8rem;font-size:0.85rem;color:var(--ink-m);">
          <input type="checkbox" id="select-all" /> Alles selecteren
        </label>
        ${renderBulkToolbar()}
        <div class="admin-list">${rows}</div>
      `
      }
    </div>
    ${renderAdminFooter()}
  `;

  if (organisaties.length === 0) return;

  wireBulkSelect(container, (ids) => {
    const respondentenAantal = ids.reduce((sum, id) => sum + getRespondentenVoorOrganisatie(id).length, 0);
    const orgWoord = ids.length === 1 ? "organisatie" : "organisaties";
    const respWoord = respondentenAantal === 1 ? "respondent" : "respondenten";
    const melding =
      respondentenAantal > 0
        ? `${ids.length} ${orgWoord} verwijderen? Dit verwijdert ook ${respondentenAantal} ${respWoord} en hun ingevulde antwoorden. Dit kan niet ongedaan gemaakt worden.`
        : `${ids.length} ${orgWoord} verwijderen? Dit kan niet ongedaan gemaakt worden.`;
    if (confirm(melding)) {
      deleteOrganisaties(ids);
      render(container);
    }
  });
}
