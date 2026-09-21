import { escapeHtml } from "../util.js";

// Dependency-vrije inline-SVG radarchart over alle bouwblokken/domeinen van
// een assessment. items: [{ naam, score }] op de 1-5 schaal.
export function renderRadarChart(items) {
  const size = 480;
  const center = size / 2;
  const maxRadius = size / 2 - 70;
  const n = items.length;
  if (n < 3) return "";

  const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const radiusFor = (score) => ((Math.max(1, Math.min(5, score ?? 1)) - 1) / 4) * maxRadius;
  const point = (i, r) => {
    const a = angleFor(i);
    return [center + r * Math.cos(a), center + r * Math.sin(a)];
  };

  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolys = gridLevels
    .map((level) => {
      const r = ((level - 1) / 4) * maxRadius;
      const pts = items.map((_, i) => point(i, r).join(",")).join(" ");
      return `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1" />`;
    })
    .join("");

  const spokes = items
    .map((_, i) => {
      const [x, y] = point(i, maxRadius);
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--border)" stroke-width="1" />`;
    })
    .join("");

  const dataPoints = items.map((item, i) => point(i, radiusFor(item.score)));
  const dataPoly = dataPoints.map((p) => p.join(",")).join(" ");
  const dots = dataPoints
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="var(--or)" />`)
    .join("");

  const labels = items
    .map((item, i) => {
      const [x, y] = point(i, maxRadius + 26);
      const anchor = Math.abs(Math.cos(angleFor(i))) < 0.2 ? "middle" : x > center ? "start" : "end";
      return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="radar-label">${escapeHtml(
        item.naam
      )}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${size} ${size}" style="overflow: visible" role="img" aria-label="Radarchart met scores per bouwblok">
      ${gridPolys}
      ${spokes}
      <polygon points="${dataPoly}" fill="var(--or-faint)" stroke="var(--or)" stroke-width="2" />
      ${dots}
      ${labels}
    </svg>
  `;
}
