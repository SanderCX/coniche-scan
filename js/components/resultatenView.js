import { escapeHtml, formatDecimaal } from "../util.js";
import { alleBouwblokken } from "../data/assessments.js";
import { categorieScores, overallScore, classify, top3, groepScoresVoorResultaten } from "../scoring.js";
import { renderRadarChart } from "./radarChart.js";
import { renderBarChart } from "./barChart.js";

// Gedeeld door scherm 3 (preview) en scherm 6 (resultaten) — CLAUDE.md
// sectie 5.3: "dezelfde resultaatcomponenten als scherm 6".
export function renderResultatenBody(assessment, bouwblokScores, meta) {
  const alle = alleBouwblokken(assessment);
  const overall = overallScore(assessment, bouwblokScores);
  const classificatie = classify(overall);
  const groepen = groepScoresVoorResultaten(assessment, bouwblokScores);
  const { sterktes, verbeterkansen } = top3(assessment, bouwblokScores);
  const radarItems = alle.map((b) => ({ naam: b.naam, score: bouwblokScores[b.id] }));
  const groepLabel = assessment.categorieen && assessment.categorieen.length ? "Categorie" : "Domein";

  return `
    <div class="resultaten-header">
      <div class="eyebrow">${escapeHtml(assessment.naam)}</div>
      <div class="classificatie-cirkel" style="--kleur:${classificatie.kleur}">
        <div class="score">${formatDecimaal(overall)}</div>
        <div class="label">${escapeHtml(classificatie.label)}</div>
      </div>
      <div class="resultaten-voortgang">${meta.beantwoord} van ${meta.totaal} vragen</div>
    </div>

    <section class="section" style="padding-top:0;">
      <div class="container">
        <div class="chart-block">
          <h3>Scores per bouwblok</h3>
          <div class="radar-wrap">${renderRadarChart(radarItems)}</div>
        </div>

        <div class="chart-block">
          <h3>Scores per ${groepLabel}${assessment.scoresPerGroepGesorteerd ? " — gesorteerd van hoog naar laag" : ""}</h3>
          ${renderBarChart(groepen)}
        </div>

        <div class="top3-grid chart-block">
          <div>
            <h3>Top 3 sterktes</h3>
            <ul class="top3-lijst">
              ${sterktes
                .map((s) => {
                  const c = classify(s.score);
                  return `<li class="top3-item"><span>${escapeHtml(s.bouwblok.naam)}</span><span class="score-pill" style="--kleur:${c.kleur}">${formatDecimaal(s.score)}</span></li>`;
                })
                .join("")}
            </ul>
          </div>
          <div>
            <h3>Top 3 verbeterkansen</h3>
            <ul class="top3-lijst">
              ${verbeterkansen
                .map((s) => {
                  const c = classify(s.score);
                  return `<li class="top3-item"><span>${escapeHtml(s.bouwblok.naam)}</span><span class="score-pill" style="--kleur:${c.kleur}">${formatDecimaal(s.score)}</span></li>`;
                })
                .join("")}
            </ul>
          </div>
        </div>

        <div class="chart-block">
          <h3>Legenda</h3>
          <div class="legenda">
            <div class="legenda-item">
              <span class="legenda-stip" style="--kleur:var(--stat-red)"></span>
              <div><h3>Basis op Orde</h3><p>De basis moet op dit punt eerst op orde gemaakt worden om verder te kunnen uitbouwen.</p></div>
            </div>
            <div class="legenda-item">
              <span class="legenda-stip" style="--kleur:var(--stat-amber)"></span>
              <div><h3>Uitbouwen</h3><p>De basis is op orde en je bent onderweg, maar er is nog een verbeterstap nodig om richting excellent te gaan.</p></div>
            </div>
            <div class="legenda-item">
              <span class="legenda-stip" style="--kleur:var(--stat-green)"></span>
              <div><h3>Sterk punt</h3><p>Hier is de organisatie al heel goed in. Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere bouwblokken.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
