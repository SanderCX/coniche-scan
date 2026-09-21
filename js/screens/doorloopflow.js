import { renderSidebar } from "../components/sidebar.js";
import { renderNav, renderFooter, bindNavScroll } from "../components/navFooter.js";
import { openToelichtingModal } from "../components/modal.js";
import { alleBouwblokken, vindBouwblok } from "../data/assessments.js";
import { getEffectiveAssessment } from "../contentStore.js";
import { getRespondent, saveAntwoord, saveOpmerking, markAfgerond } from "../state.js";
import { escapeHtml } from "../util.js";
import * as respondentIntakeGate from "./respondentIntakeGate.js";

export function render(container, { respondentId, bouwblokId }) {
  const respondent = getRespondent(respondentId);
  if (!respondent) {
    location.hash = "#/";
    return;
  }
  const assessment = getEffectiveAssessment(respondent.assessmentId);
  if (!assessment) {
    location.hash = "#/";
    return;
  }

  // Uitgenodigd, nog geen intake gedaan: eerst scherm 4 (naam/rol/team/
  // notities) tonen, pas daarna de doorloopflow — CLAUDE.md sectie 1.
  if (respondent.status === "uitgenodigd") {
    respondentIntakeGate.render(container, {
      assessment,
      respondent,
      onDone: () => render(container, { respondentId, bouwblokId }),
    });
    return;
  }

  const alle = alleBouwblokken(assessment);
  const bouwblok = bouwblokId ? vindBouwblok(assessment, bouwblokId) : alle[0];
  if (!bouwblok) {
    location.hash = `#/scan/${respondent.id}/bouwblok/${alle[0].id}`;
    return;
  }

  const index = alle.findIndex((b) => b.id === bouwblok.id);
  const isLaatste = index === alle.length - 1;
  const kleurVar = bouwblok.categorieKleur || "--or";
  const opmerking = respondent.opmerkingenPerBouwblok[bouwblok.id] || "";

  container.innerHTML = `
    ${renderNav()}
    <div class="flow-layout">
      ${renderSidebar(assessment, respondent, bouwblok.id)}
      <main class="flow-main" style="--accent:var(${kleurVar})">
        <div class="bouwblok-kop">
          <div class="bouwblok-kop-titelrij">
            <h2>${escapeHtml(bouwblok.naam)}</h2>
            <button class="toelichting-link" id="toelichting-btn" title="Meer uitleg" aria-label="Meer uitleg">&#9432;</button>
          </div>
          <p class="bouwblok-omschrijving">${escapeHtml(bouwblok.omschrijving)}</p>
        </div>

        ${
          bouwblok.tags && bouwblok.tags.length
            ? `<div class="tags-rij">${bouwblok.tags.map((t) => `<span class="g-badge">${escapeHtml(t)}</span>`).join("")}</div>`
            : ""
        }

        <div class="instructievlak">Beantwoord op basis van wat aantoonbaar geregeld is (documenten, ritmes, tooling, afspraken).</div>

        <form id="bouwblok-form">
          ${bouwblok.vragen
            .map(
              (vraag) => `
            <div class="vraag-blok">
              <div class="vraag-tekst">${escapeHtml(vraag.tekst)}</div>
              <div class="schaal">
                ${assessment.schaal
                  .map(
                    (opt) => `
                  <label class="schaal-optie">
                    <input type="radio" name="${vraag.id}" value="${opt.waarde}" ${
                      respondent.antwoorden[vraag.id] === opt.waarde ? "checked" : ""
                    } />
                    <span class="optie-tekst"><strong>${opt.waarde}</strong> — ${escapeHtml(opt.label)}</span>
                  </label>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}

          <div class="field opmerking-veld">
            <label for="opmerking">Opmerking (optioneel)</label>
            <textarea id="opmerking" name="opmerking">${escapeHtml(opmerking)}</textarea>
          </div>

          <div class="flow-actions">
            <div></div>
            <button type="submit" class="btn btn-or">${isLaatste ? "Bekijk resultaten" : "Volgende"}</button>
          </div>
        </form>
      </main>
    </div>
    ${renderFooter()}
  `;
  bindNavScroll();

  container.querySelector("#toelichting-btn").addEventListener("click", () => {
    openToelichtingModal(bouwblok.naam, bouwblok.toelichting);
  });

  container.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      saveAntwoord(respondent.id, radio.name, Number(radio.value));
      refreshSidebarProgress(container, assessment, getRespondent(respondent.id), bouwblok.id);
    });
  });

  const opmerkingVeld = container.querySelector("#opmerking");
  opmerkingVeld.addEventListener("change", () => {
    saveOpmerking(respondent.id, bouwblok.id, opmerkingVeld.value);
  });

  container.querySelector("#bouwblok-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveOpmerking(respondent.id, bouwblok.id, opmerkingVeld.value);
    if (isLaatste) {
      markAfgerond(respondent.id);
      location.hash = `#/scan/${respondent.id}/resultaten`;
    } else {
      location.hash = `#/scan/${respondent.id}/bouwblok/${alle[index + 1].id}`;
    }
  });
}

function refreshSidebarProgress(container, assessment, respondent, activeBouwblokId) {
  const oud = container.querySelector(".flow-sidebar");
  if (!oud) return;
  oud.outerHTML = renderSidebar(assessment, respondent, activeBouwblokId);
}
