import { escapeHtml } from "../util.js";

// Generieke assessment-kaart — werkt over Assessment[] heen, geen hardcoded
// per-scan-type layout (CLAUDE.md sectie 5.1).
export function renderAssessmentCard(assessment) {
  return `
    <a href="#/assessment/${assessment.id}" class="card assessment-card">
      <div class="icoon">${assessment.icoon}</div>
      <h3>${escapeHtml(assessment.naam)}</h3>
      <p>${escapeHtml(assessment.beschrijving)}</p>
      <div class="duur">${escapeHtml(assessment.geschatteDuur)}</div>
    </a>
  `;
}
