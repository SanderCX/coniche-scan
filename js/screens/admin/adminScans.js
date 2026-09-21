import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import { renderBulkToolbar, wireBulkSelect } from "../../components/bulkSelect.js";
import { getAllRespondenten, resetRespondentInvulling, getOrganisatie } from "../../state.js";
import { getEffectiveAssessment } from "../../contentStore.js";
import { progress } from "../../scoring.js";
import { escapeHtml } from "../../util.js";

function formatDatum(iso) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// admin-beheerpagina.md punt 6: alle kolommen sorteerbaar, incl. de nieuwe
// Organisatie-kolom (dit overzicht spant over alle organisaties heen, dus
// zonder die kolom is niet te zien bij welke organisatie een rij hoort).
const KOLOMMEN = [
  { key: "naam", label: "Naam" },
  { key: "organisatie", label: "Organisatie" },
  { key: "assessment", label: "Assessment" },
  { key: "rol", label: "Rol / team" },
  { key: "status", label: "Status" },
  { key: "voortgang", label: "Voortgang" },
  { key: "gestart", label: "Gestart" },
];

// Onthoudt de sortering zolang je op dit scherm blijft (module-scope, geen
// localStorage nodig voor iets zo tijdelijks).
let sortState = { column: "gestart", direction: "desc" };

function verrijk(r) {
  const assessment = getEffectiveAssessment(r.assessmentId);
  const organisatie = getOrganisatie(r.organisatieId);
  const p = assessment ? progress(assessment, r.antwoorden) : { beantwoord: 0, totaal: 0, percentage: 0 };
  return { r, assessment, organisatie, p };
}

function sortValue({ r, assessment, organisatie, p }, kolom) {
  switch (kolom) {
    case "naam":
      return (r.naam || r.email || "").toLowerCase();
    case "organisatie":
      return (organisatie ? organisatie.naam : "").toLowerCase();
    case "assessment":
      return (assessment ? assessment.naam : "").toLowerCase();
    case "rol":
      return `${r.rol || ""} ${r.team || ""}`.trim().toLowerCase();
    case "status":
      return r.status;
    case "voortgang":
      return p.percentage;
    case "gestart":
      return r.gestartOp ? new Date(r.gestartOp).getTime() : 0;
    default:
      return "";
  }
}

export function render(container) {
  const rijen = getAllRespondenten().map(verrijk);

  rijen.sort((a, b) => {
    const va = sortValue(a, sortState.column);
    const vb = sortValue(b, sortState.column);
    const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "nl");
    return sortState.direction === "asc" ? cmp : -cmp;
  });

  const rows = rijen
    .map(({ r, assessment, organisatie, p }) => `
        <tr>
          <td><input type="checkbox" class="bulk-select" data-id="${r.id}" /></td>
          <td>${escapeHtml(r.naam || r.email || "(naamloos)")}</td>
          <td>${escapeHtml(organisatie ? organisatie.naam : "–")}</td>
          <td>${escapeHtml(assessment ? assessment.naam : r.assessmentId)}</td>
          <td>${escapeHtml(r.rol || "–")}${r.team ? ` &middot; ${escapeHtml(r.team)}` : ""}</td>
          <td><span class="admin-badge status-${r.status}">${escapeHtml(r.status)}</span></td>
          <td>${p.percentage}% (${p.beantwoord}/${p.totaal})</td>
          <td>${formatDatum(r.gestartOp)}</td>
          <td><a href="#/admin/scans/${r.id}">bekijk</a></td>
        </tr>
      `)
    .join("");

  function headerCell(kolom) {
    const actief = sortState.column === kolom.key;
    const pijl = actief ? (sortState.direction === "asc" ? " &#9650;" : " &#9660;") : "";
    return `<th><button type="button" class="admin-sort-btn" data-column="${kolom.key}">${escapeHtml(kolom.label)}${pijl}</button></th>`;
  }

  container.innerHTML = `
    ${renderAdminNav("scans")}
    <div class="admin-main admin-main--breed">
      <a href="#/admin" class="admin-back">&larr; Beheer</a>
      <h1>Ingevulde scans</h1>

      ${
        rijen.length === 0
          ? `<div class="admin-notice">Nog geen respondenten. Zodra iemand een assessment start (via de intake, of via een uitnodiging vanuit een organisatie), verschijnt die hier.</div>`
          : `
        ${renderBulkToolbar()}
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" id="select-all" /></th>
                ${KOLOMMEN.map(headerCell).join("")}
                <th></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `
      }
    </div>
    ${renderAdminFooter()}
  `;

  if (rijen.length === 0) return;

  container.querySelectorAll(".admin-sort-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kolom = btn.dataset.column;
      if (sortState.column === kolom) {
        sortState = { column: kolom, direction: sortState.direction === "asc" ? "desc" : "asc" };
      } else {
        sortState = { column: kolom, direction: "asc" };
      }
      render(container);
    });
  });

  wireBulkSelect(container, (ids) => {
    const aantal = ids.length;
    const woord = aantal === 1 ? "scan-invulling" : "scan-invullingen";
    if (
      confirm(
        `${aantal} ${woord} verwijderen? Dit wist de antwoorden en opmerkingen; de respondent en uitnodiging blijven bestaan (status gaat terug naar "uitgenodigd"). Dit kan niet ongedaan gemaakt worden.`
      )
    ) {
      resetRespondentInvulling(ids);
      render(container);
    }
  });
}
