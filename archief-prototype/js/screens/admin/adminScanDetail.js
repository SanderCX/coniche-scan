import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import { getRespondent } from "../../state.js";
import { getEffectiveAssessment } from "../../contentStore.js";
import { alleBouwblokken } from "../../data/assessments.js";
import { computeBouwblokScores, overallScore, classify, progress } from "../../scoring.js";
import { escapeHtml, formatDecimaal } from "../../util.js";

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

export function render(container, { respondentId }) {
  const respondent = getRespondent(respondentId);
  if (!respondent) {
    location.hash = "#/admin/scans";
    return;
  }
  const assessment = getEffectiveAssessment(respondent.assessmentId);
  const bouwblokken = alleBouwblokken(assessment);
  const bouwblokScores = computeBouwblokScores(assessment, respondent.antwoorden);
  const overall = overallScore(assessment, bouwblokScores);
  const classificatie = overall != null ? classify(overall) : null;
  const p = progress(assessment, respondent.antwoorden);

  container.innerHTML = `
    ${renderAdminNav("scans")}
    <div class="admin-main">
      <a href="#/admin/scans" class="admin-back">&larr; Ingevulde scans</a>
      <h1>${escapeHtml(respondent.naam || respondent.email || "(naamloos)")}</h1>

      <div class="admin-field" style="max-width:520px;">
        <label for="publieke-link">Publieke link (kopiëren en zelf doorsturen — nog geen automatische e-mail)</label>
        <div style="display:flex;gap:0.6rem;">
          <input type="text" id="publieke-link" readonly value="${escapeHtml(new URL(`#/scan/${respondent.id}`, location.href).href)}" style="flex:1;" />
          <button type="button" class="btn btn-outline btn-compact" id="kopieer-link-btn">Kopieer</button>
        </div>
        <span class="admin-save-state" id="kopieer-saved">Gekopieerd &#10003;</span>
      </div>

      <div class="admin-detail-meta">
        <div><div class="label">Assessment</div><div class="waarde">${escapeHtml(assessment.naam)}</div></div>
        <div><div class="label">Rol / team</div><div class="waarde">${escapeHtml(respondent.rol || "–")}${respondent.team ? ` &middot; ${escapeHtml(respondent.team)}` : ""}</div></div>
        <div><div class="label">Status</div><div class="waarde"><span class="admin-badge status-${respondent.status}">${escapeHtml(respondent.status)}</span></div></div>
        <div><div class="label">Voortgang</div><div class="waarde">${p.percentage}% (${p.beantwoord}/${p.totaal})</div></div>
        <div><div class="label">Gestart</div><div class="waarde">${formatDatum(respondent.gestartOp)}</div></div>
        <div><div class="label">Afgerond</div><div class="waarde">${formatDatum(respondent.afgerondOp)}</div></div>
        ${
          overall != null
            ? `<div><div class="label">Overall score</div><div class="waarde" style="color:${classificatie.kleur}">${formatDecimaal(overall)} — ${escapeHtml(classificatie.label)}</div></div>`
            : `<div><div class="label">Overall score</div><div class="waarde">nog niet compleet</div></div>`
        }
      </div>

      ${respondent.notities ? `<div class="admin-notice"><strong>Notities van respondent:</strong> ${escapeHtml(respondent.notities)}</div>` : ""}

      <h2>Antwoorden per bouwblok</h2>
      ${bouwblokken
        .map((b) => {
          const opmerking = respondent.opmerkingenPerBouwblok[b.id];
          const score = bouwblokScores[b.id];
          return `
          <details class="admin-bouwblok-card">
            <summary>${b.volgnummer}. ${escapeHtml(b.naam)} ${score != null ? `— <span style="color:${classify(score).kleur}">${formatDecimaal(score)}</span>` : '<span style="color:var(--ink-s)">(niet compleet)</span>'}</summary>
            <div style="margin-top:1rem;">
              <table class="admin-table">
                <tbody>
                  ${b.vragen
                    .map((v) => {
                      const waarde = respondent.antwoorden[v.id];
                      return `<tr><td style="width:70%;">${escapeHtml(v.tekst)}</td><td>${waarde != null ? waarde : "–"}</td></tr>`;
                    })
                    .join("")}
                </tbody>
              </table>
              ${opmerking ? `<div class="admin-field" style="margin-top:1rem;"><label>Opmerking</label><p style="margin:0;">${escapeHtml(opmerking)}</p></div>` : ""}
            </div>
          </details>
        `;
        })
        .join("")}
    </div>
    ${renderAdminFooter()}
  `;

  container.querySelector("#kopieer-link-btn").addEventListener("click", async () => {
    const input = container.querySelector("#publieke-link");
    input.select();
    try {
      await navigator.clipboard.writeText(input.value);
    } catch {
      document.execCommand("copy");
    }
    const saved = container.querySelector("#kopieer-saved");
    saved.classList.add("zichtbaar");
    clearTimeout(saved._timeout);
    saved._timeout = setTimeout(() => saved.classList.remove("zichtbaar"), 1600);
  });
}
