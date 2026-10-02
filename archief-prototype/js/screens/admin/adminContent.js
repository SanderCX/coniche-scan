import { renderAdminNav, renderAdminFooter } from "../../components/adminNav.js";
import {
  getEffectiveAssessment,
  updateAssessmentMeta,
  updateBouwblok,
  updateVraagTekst,
  heeftOverrides,
  resetOverrides,
} from "../../contentStore.js";
import { alleBouwblokken } from "../../data/assessments.js";
import { escapeHtml } from "../../util.js";

function metaField(id, label, waarde, meerdereRegels) {
  const tag = meerdereRegels ? "textarea" : 'input type="text"';
  const closeTag = meerdereRegels ? "textarea" : "input";
  return `
    <div class="admin-field">
      <label for="${id}">${escapeHtml(label)} <span class="admin-save-state" id="${id}-saved">Opgeslagen &#10003;</span></label>
      ${meerdereRegels ? `<textarea id="${id}">${escapeHtml(waarde)}</textarea>` : `<input type="text" id="${id}" value="${escapeHtml(waarde)}" />`}
    </div>
  `;
}

function bouwblokCard(bouwblok) {
  return `
    <details class="admin-bouwblok-card">
      <summary>${bouwblok.volgnummer}. ${escapeHtml(bouwblok.naam)}</summary>
      <div style="margin-top:1rem;">
        ${metaField(`bb-naam-${bouwblok.id}`, "Naam", bouwblok.naam)}
        ${metaField(`bb-omschrijving-${bouwblok.id}`, "Omschrijving", bouwblok.omschrijving, true)}
        ${metaField(`bb-toelichting-${bouwblok.id}`, "Toelichting (overlay)", bouwblok.toelichting, true)}
        ${metaField(`bb-tags-${bouwblok.id}`, "Tags (komma-gescheiden)", (bouwblok.tags || []).join(", "))}

        <div class="admin-field">
          <label>Vragen</label>
          ${bouwblok.vragen
            .map(
              (v) => `
            <div class="admin-vraag-row">
              <div class="vraag-nr">${v.volgnummer}.</div>
              <div style="flex:1;">
                <textarea id="vraag-${v.id}" data-bouwblok="${bouwblok.id}" data-vraag="${v.id}">${escapeHtml(v.tekst)}</textarea>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </details>
  `;
}

function flashSaved(id) {
  const el = document.getElementById(`${id}-saved`);
  if (!el) return;
  el.classList.add("zichtbaar");
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => el.classList.remove("zichtbaar"), 1400);
}

export function render(container, { assessmentId }) {
  const assessment = getEffectiveAssessment(assessmentId);
  if (!assessment) {
    location.hash = "#/admin";
    return;
  }
  const bouwblokken = alleBouwblokken(assessment);

  container.innerHTML = `
    ${renderAdminNav("dashboard")}
    <div class="admin-main">
      <a href="#/admin" class="admin-back">&larr; Alle assessment-types</a>
      <h1>${escapeHtml(assessment.naam)}</h1>

      ${
        heeftOverrides(assessmentId)
          ? `<div class="admin-notice">Deze assessment heeft aanpassingen t.o.v. de standaardcontent. <button type="button" class="btn btn-outline" id="reset-btn" style="padding:0.4rem 0.9rem;font-size:0.78rem;margin-left:0.5rem;">Reset naar standaard</button></div>`
          : ""
      }

      <h2>Algemeen</h2>
      ${metaField("meta-naam", "Naam", assessment.naam)}
      ${metaField("meta-subtitel", "Subtitel", assessment.subtitel)}
      ${metaField("meta-beschrijving", "Beschrijving", assessment.beschrijving, true)}
      ${metaField("meta-doelgroep", "Doelgroep", assessment.doelgroep)}
      ${metaField("meta-geschatteDuur", "Geschatte duur", assessment.geschatteDuur)}

      <h2 style="margin-top:2rem;">Bouwblokken &amp; vragen</h2>
      ${bouwblokken.map(bouwblokCard).join("")}
    </div>
    ${renderAdminFooter()}
  `;

  const metaVeldMap = {
    "meta-naam": "naam",
    "meta-subtitel": "subtitel",
    "meta-beschrijving": "beschrijving",
    "meta-doelgroep": "doelgroep",
    "meta-geschatteDuur": "geschatteDuur",
  };
  Object.keys(metaVeldMap).forEach((id) => {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener("change", () => {
      updateAssessmentMeta(assessmentId, { [metaVeldMap[id]]: el.value });
      flashSaved(id);
    });
  });

  bouwblokken.forEach((bouwblok) => {
    const naamEl = container.querySelector(`#bb-naam-${bouwblok.id}`);
    const omschrijvingEl = container.querySelector(`#bb-omschrijving-${bouwblok.id}`);
    const toelichtingEl = container.querySelector(`#bb-toelichting-${bouwblok.id}`);
    const tagsEl = container.querySelector(`#bb-tags-${bouwblok.id}`);

    naamEl?.addEventListener("change", () => {
      updateBouwblok(assessmentId, bouwblok.id, { naam: naamEl.value });
      flashSaved(`bb-naam-${bouwblok.id}`);
    });
    omschrijvingEl?.addEventListener("change", () => {
      updateBouwblok(assessmentId, bouwblok.id, { omschrijving: omschrijvingEl.value });
      flashSaved(`bb-omschrijving-${bouwblok.id}`);
    });
    toelichtingEl?.addEventListener("change", () => {
      updateBouwblok(assessmentId, bouwblok.id, { toelichting: toelichtingEl.value });
      flashSaved(`bb-toelichting-${bouwblok.id}`);
    });
    tagsEl?.addEventListener("change", () => {
      const tags = tagsEl.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      updateBouwblok(assessmentId, bouwblok.id, { tags });
      flashSaved(`bb-tags-${bouwblok.id}`);
    });

    bouwblok.vragen.forEach((v) => {
      const vEl = container.querySelector(`#vraag-${v.id}`);
      vEl?.addEventListener("change", () => {
        updateVraagTekst(assessmentId, bouwblok.id, v.id, vEl.value);
      });
    });
  });

  container.querySelector("#reset-btn")?.addEventListener("click", () => {
    if (confirm("Alle aanpassingen voor deze assessment terugzetten naar de standaardcontent?")) {
      resetOverrides(assessmentId);
      render(container, { assessmentId });
    }
  });
}
