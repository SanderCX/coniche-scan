import { escapeHtml } from "../util.js";
import { alleBouwblokken } from "../data/assessments.js";
import { bouwblokStatus, progress } from "../scoring.js";

// SVG/CSS-vormen i.p.v. tekstglyphs ("✓"/"•") — die renderden inconsistent
// (verkeerd gecentreerd, soms een vervormd teken) binnen de kleine cirkel,
// afhankelijk van font/browser. Vaste vormen zijn overal pixel-exact gelijk.
function statusIcoon(status, index) {
  if (status === "afgerond") {
    return '<svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  if (status === "bezig") {
    return '<span class="status-dot" aria-hidden="true"></span>';
  }
  return String(index + 1);
}

function renderBouwblokItem(bouwblok, index, respondent, activeBouwblokId, kleurVar) {
  const status = bouwblokStatus(bouwblok, respondent.antwoorden);
  const aantal = bouwblok.vragen.filter((v) => typeof respondent.antwoorden[v.id] === "number").length;
  const actief = bouwblok.id === activeBouwblokId;
  return `
    <a href="#/scan/${respondent.id}/bouwblok/${bouwblok.id}"
       class="sidebar-bouwblok status-${status} ${actief ? "actief" : ""}"
       style="--accent:var(${kleurVar})">
      <span class="status-icoon">${statusIcoon(status, index)}</span>
      <span>${escapeHtml(bouwblok.naam)}${status === "bezig" ? ` (${aantal}/${bouwblok.vragen.length})` : ""}</span>
    </a>
  `;
}

export function renderSidebar(assessment, respondent, activeBouwblokId) {
  const p = progress(assessment, respondent.antwoorden);
  let body;

  if (assessment.categorieen && assessment.categorieen.length) {
    body = assessment.categorieen
      .slice()
      .sort((a, b) => a.volgorde - b.volgorde)
      .map((cat) => {
        const items = cat.bouwblokken
          .map((b, i) => renderBouwblokItem(b, alleBouwblokken(assessment).findIndex((x) => x.id === b.id), respondent, activeBouwblokId, cat.kleur))
          .join("");
        return `
          <div class="sidebar-categorie" style="--accent:var(${cat.kleur})">
            <div class="sidebar-categorie-naam">${escapeHtml(cat.naam)}</div>
            ${items}
          </div>
        `;
      })
      .join("");
  } else {
    body = (assessment.bouwblokken || [])
      .map((b, i) => renderBouwblokItem(b, i, respondent, activeBouwblokId, "--or"))
      .join("");
  }

  return `
    <aside class="flow-sidebar">
      <div class="respondent-naam">${escapeHtml(respondent.naam)}</div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${p.percentage}%"></div></div>
      <div class="progress-label">${p.percentage}% — ${p.beantwoord}/${p.totaal} vragen</div>
      ${body}
    </aside>
  `;
}
