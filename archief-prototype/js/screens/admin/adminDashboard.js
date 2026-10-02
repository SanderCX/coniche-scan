import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import { getAllEffectiveAssessments, heeftOverrides } from "../../contentStore.js";
import { alleBouwblokken, totaalAantalVragen } from "../../data/assessments.js";
import { getAllRespondenten, getAllOrganisaties } from "../../state.js";
import { escapeHtml } from "../../util.js";

export function render(container) {
  const assessments = getAllEffectiveAssessments();
  const respondenten = getAllRespondenten();
  const afgerond = respondenten.filter((r) => r.status === "afgerond").length;
  const organisaties = getAllOrganisaties();

  container.innerHTML = `
    ${renderAdminNav("dashboard")}
    <div class="admin-main">
      <h1>Beheer</h1>
      <div class="admin-notice">
        Geen inlog voor dit prototype — wijzigingen worden lokaal in deze browser opgeslagen
        (localStorage). Assessment-namen, omschrijvingen, bouwblok-teksten en vraagteksten,
        organisaties en respondenten zijn hier te beheren. Bouwblokken/vragen toevoegen of
        verwijderen, en de organisatieveldenlijst zelf bewerken, komen later.
      </div>

      <h2>Assessment-types</h2>
      <div class="admin-list" style="margin-bottom:3rem;">
        ${assessments
          .map((a) => {
            const bouwblokken = alleBouwblokken(a);
            const totaal = totaalAantalVragen(a);
            return `
            <a href="#/admin/content/${a.id}" class="admin-row">
              <div>
                <div class="admin-row-titel">${escapeHtml(a.naam)}</div>
                <div class="admin-row-sub">${bouwblokken.length} bouwblokken &middot; ${totaal} vragen</div>
              </div>
              ${heeftOverrides(a.id) ? '<span class="admin-badge">aangepast</span>' : ""}
            </a>
          `;
          })
          .join("")}
      </div>

      <h2>Organisaties</h2>
      <a href="#/admin/organisaties" class="admin-row" style="margin-bottom:3rem;">
        <div>
          <div class="admin-row-titel">${organisaties.length} organisaties</div>
          <div class="admin-row-sub">Aanmaken, kenmerken beheren, respondenten uitnodigen</div>
        </div>
        <span class="admin-badge">bekijk overzicht</span>
      </a>

      <h2>Ingevulde scans</h2>
      <a href="#/admin/scans" class="admin-row">
        <div>
          <div class="admin-row-titel">${respondenten.length} respondenten</div>
          <div class="admin-row-sub">${afgerond} afgerond, ${respondenten.length - afgerond} nog bezig</div>
        </div>
        <span class="admin-badge">bekijk overzicht</span>
      </a>
    </div>
    ${renderAdminFooter()}
  `;
}
