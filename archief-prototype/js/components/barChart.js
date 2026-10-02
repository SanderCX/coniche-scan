import { escapeHtml, formatDecimaal } from "../util.js";
import { classify } from "../scoring.js";

// Staafdiagram per categorie of per domein — kleur = classificatie,
// NIET de categoriekleur (CLAUDE.md sectie 5.6).
export function renderBarChart(items) {
  const rows = items
    .map((item) => {
      const c = classify(item.score);
      const pct = typeof item.score === "number" ? ((item.score - 1) / 4) * 100 : 0;
      return `
        <div class="bar-row">
          <div class="bar-naam">${escapeHtml(item.naam)}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%; --kleur:${c ? c.kleur : "var(--stat-amber)"}"></div>
          </div>
          <div class="bar-waarde">${formatDecimaal(item.score)}</div>
        </div>
      `;
    })
    .join("");
  return `<div class="bar-chart">${rows}</div>`;
}
