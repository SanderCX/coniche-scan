import { scoreKleur, CLASSIFICATIE_INFO } from "@/lib/colors";
import { escapeXml } from "./xml-utils";
import { Classificatie } from "@/lib/types";

const SVG_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n';

/** Wikkelt kale SVG-inhoud (zoals lib/pdf/charts.ts die teruggeeft) in een op zichzelf staand, geldig SVG-bestand met xmlns. */
export function standaloneSvg(inhoud: string): string {
  const met = inhoud.startsWith("<svg")
    ? inhoud.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')
    : inhoud;
  return SVG_HEADER + met;
}

/**
 * `scoreAlgemeen`: dezelfde classificatiecirkel als `components/ScoreCircle.tsx`
 * (PDF- en resultatenpagina), hier als los SVG-bestand voor InDesign.
 */
export function scoreAlgemeenSvg(score: number, classificatie: Classificatie): string {
  const kleur = scoreKleur(score);
  const label = CLASSIFICATIE_INFO[classificatie].label;
  const size = 220;
  const c = size / 2;
  const r = c - 12;
  return standaloneSvg(
    `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
      `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${kleur}" stroke-width="14" />` +
      `<text x="${c}" y="${c - 4}" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#1c1c1a" text-anchor="middle">${score.toFixed(1)}</text>` +
      `<text x="${c}" y="${c + 26}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${kleur}" text-anchor="middle">${escapeXml(label)}</text>` +
      `</svg>`
  );
}

export interface Top3Item {
  naam: string;
  score: number;
}

/**
 * `top3Sterktes`/`top3Verbeterkansen`: rangcirkel + naam + scorebadge per
 * item, zelfde opbouw als de top3-lijst op de resultatenpagina/PDF, hier
 * als één SVG-bestand (geen losse tekstkaders, zie export-indesign.md).
 */
export function top3ListSvg(items: Top3Item[]): string {
  const width = 420;
  const rowHeight = 44;
  const height = items.length * rowHeight + 12;
  const rijen = items
    .map((item, i) => {
      const y = 12 + i * rowHeight + rowHeight / 2;
      const kleur = scoreKleur(item.score);
      return (
        `<circle cx="20" cy="${y}" r="13" fill="#fff2ec" />` +
        `<text x="20" y="${y + 4}" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#ff671f" text-anchor="middle">${i + 1}</text>` +
        `<rect x="44" y="${y - 11}" width="34" height="22" rx="4" fill="${kleur}" />` +
        `<text x="61" y="${y + 5}" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">${item.score.toFixed(1)}</text>` +
        `<text x="90" y="${y + 4}" font-family="Arial, sans-serif" font-size="13" fill="#1c1c1a">${escapeXml(item.naam)}</text>`
      );
    })
    .join("");
  return standaloneSvg(`<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${rijen}</svg>`);
}
