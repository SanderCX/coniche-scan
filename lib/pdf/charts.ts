import { scoreKleur } from "@/lib/colors";
import { escapeHtml } from "./escape-html";

export interface ChartItem {
  label: string;
  score: number | null;
}

/**
 * Radar (spider) chart, zelfde data/kleuren als `components/RadarChartView.tsx`,
 * hier als kale SVG (geen recharts/DOM nodig voor de PDF). De viewBox is
 * bewust veel breder dan hoog: bij 15 assen zijn de labels aan de randen
 * (bijv. "13. Employee Engagement") lang genoeg om builten een vierkante
 * viewBox te vallen — de SVG clipt dan stilletjes alles voorbij de
 * viewBox-rand, ongeacht `text-anchor`.
 */
export function radarChartSvg(items: ChartItem[]): string {
  const width = 600;
  const height = 380;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxR = 108;
  const n = items.length;
  if (n === 0) return "";

  function punt(i: number, r: number): { x: number; y: number } {
    const hoek = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: centerX + Math.cos(hoek) * r, y: centerY + Math.sin(hoek) * r };
  }

  const ringen = [1, 2, 3, 4, 5]
    .map((k) => {
      const r = (maxR * k) / 5;
      const pts = items.map((_, i) => punt(i, r)).map((p) => `${p.x},${p.y}`).join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#e8e6e1" stroke-width="1" />`;
    })
    .join("");

  const assen = items
    .map((_, i) => {
      const p = punt(i, maxR);
      return `<line x1="${centerX}" y1="${centerY}" x2="${p.x}" y2="${p.y}" stroke="#e8e6e1" stroke-width="1" />`;
    })
    .join("");

  const dataPunten = items.map((item, i) => punt(i, (maxR * (item.score ?? 0)) / 5));
  const dataPolygon = `<polygon points="${dataPunten.map((p) => `${p.x},${p.y}`).join(" ")}" fill="#ff671f" fill-opacity="0.25" stroke="#ff671f" stroke-width="2" />`;

  const schaalLabels = [1, 2, 3, 4, 5]
    .map((k) => {
      const r = (maxR * k) / 5;
      return `<text x="${centerX}" y="${centerY - r - 3}" font-size="9" fill="#4d4d49" text-anchor="middle">${k}</text>`;
    })
    .join("");

  const labels = items
    .map((item, i) => {
      const p = punt(i, maxR + 14);
      const hoek = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const cos = Math.cos(hoek);
      const anchor = cos < -0.15 ? "end" : cos > 0.15 ? "start" : "middle";
      return `<text x="${p.x}" y="${p.y}" font-size="8.5" fill="#4d4d49" text-anchor="${anchor}" dominant-baseline="middle">${escapeHtml(item.label)}</text>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px">${ringen}${assen}${dataPolygon}${schaalLabels}${labels}</svg>`;
}

/** Verticale staafdiagram, zelfde data/kleuren als `components/CategoryBarChart.tsx` (score-kleur per balk), hier als kale SVG. */
export function barChartSvg(items: ChartItem[]): string {
  const width = 460;
  const height = 250;
  const plotLeft = 30;
  const plotRight = width - 10;
  const plotTop = 10;
  const plotBottom = height - 30;
  const plotHeight = plotBottom - plotTop;
  const n = items.length;
  if (n === 0) return "";
  const kolomBreedte = (plotRight - plotLeft) / n;
  const balkBreedte = Math.min(48, kolomBreedte * 0.55);

  const gridEnLabels = [0, 1, 2, 3, 4, 5]
    .map((k) => {
      const y = plotBottom - (plotHeight * k) / 5;
      return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#e8e6e1" stroke-width="1" /><text x="${plotLeft - 6}" y="${y + 3}" font-size="9" fill="#4d4d49" text-anchor="end">${k}</text>`;
    })
    .join("");

  const balken = items
    .map((item, i) => {
      const score = item.score ?? 0;
      const kleur = item.score !== null ? scoreKleur(item.score) : "#e8e6e1";
      const x = plotLeft + kolomBreedte * i + (kolomBreedte - balkBreedte) / 2;
      const barHoogte = (plotHeight * score) / 5;
      const y = plotBottom - barHoogte;
      const labelX = x + balkBreedte / 2;
      return `<rect x="${x}" y="${y}" width="${balkBreedte}" height="${barHoogte}" rx="4" fill="${kleur}" />
        <text y="${plotBottom + 12}" font-size="8.5" fill="#4d4d49" text-anchor="middle">${wrapLabel(item.label, labelX)}</text>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px">${gridEnLabels}${balken}</svg>`;
}

/** Korte labels (categorienamen) blijven op 1 regel; langere breken op de eerste spatie na het midden, als tspan (SVG kent geen automatische tekstterugloop). */
function wrapLabel(label: string, x: number): string {
  if (label.length <= 14) return `<tspan x="${x}">${escapeHtml(label)}</tspan>`;
  const midden = Math.floor(label.length / 2);
  let breekpunt = label.indexOf(" ", midden);
  if (breekpunt === -1) breekpunt = label.lastIndexOf(" ", midden);
  if (breekpunt === -1) return `<tspan x="${x}">${escapeHtml(label)}</tspan>`;
  const regel1 = label.slice(0, breekpunt);
  const regel2 = label.slice(breekpunt + 1);
  return `<tspan x="${x}" dy="0">${escapeHtml(regel1)}</tspan><tspan x="${x}" dy="10">${escapeHtml(regel2)}</tspan>`;
}
