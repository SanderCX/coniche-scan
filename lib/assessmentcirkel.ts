/**
 * De geometrie van de Assessmentcirkel op scherm 1 (`CLAUDE.md`, scherm 1, Kies jouw assessment als cirkel met vier kwarten, ontwerp `Home-D`):
 * Vier kwartcirkels van 280px met 8px ertussen in een vlak van 568px, de wedges van de radars, de lijn met voorbeelddata, de bogen van de Quickscan en
 * de plek van de stip. Pure functies, zonder React, zodat de maten testbaar zijn. Hoeken zijn kompashoeken in graden: 0 is 12 uur en ze lopen met de
 * klok mee, dus 90 is rechts, 180 onderaan en 270 links.
 */
export const MAAT = 568;
export const KWART = 280;
export const SPLEET = 8;
export const CENTRUM = MAAT / 2;
/** De straal van de wedges (het vlak van de radar). */
export const WEDGE_R = 262;
/** De hulpcirkels lopen tot 215px (0,82 van de straal van 262px), op 25, 50, 75 en 100%. */
export const RING_R = 215;
export const RINGEN = [0.25, 0.5, 0.75, 1].map((f) => f * RING_R);

/** Het punt op afstand `r` van het midden bij kompashoek `graden`. */
export function kompas(r: number, graden: number, cx = CENTRUM, cy = CENTRUM): [number, number] {
  const h = (graden * Math.PI) / 180;
  return [cx + r * Math.sin(h), cy - r * Math.cos(h)];
}

const f = (n: number) => n.toFixed(2);

/** Een wedge van `van` tot `tot` graden (met de klok mee) als pad, vanuit het midden. */
export function wedgePad(van: number, tot: number, r = WEDGE_R): string {
  const [x1, y1] = kompas(r, van);
  const [x2, y2] = kompas(r, tot);
  return `M${CENTRUM},${CENTRUM} L${f(x1)},${f(y1)} A${r},${r} 0 0 1 ${f(x2)},${f(y2)} Z`;
}

export type Positie = "tl" | "tr" | "bl" | "br";

export interface KwartDef {
  positie: Positie;
  /** De linkerbovenhoek van het kwart in het vlak. */
  x0: number;
  y0: number;
  /** Het pad van het kwart in het vlak, met de ronde buitenhoek (straal 280px). */
  pad: string;
  /** De richting waarin een gekozen kwart opschuift, als vector van het midden af. */
  richting: [number, number];
  /** De kompashoek van de middenlijn (45°) van het kwart. */
  midden: number;
}

const A = CENTRUM - SPLEET / 2;
const B = CENTRUM + SPLEET / 2;

export const KWARTEN: KwartDef[] = [
  { positie: "tl", x0: 0, y0: 0, pad: `M${A},${A} L${A},0 A${KWART},${KWART} 0 0 0 0,${A} Z`, richting: [-1, -1], midden: 315 },
  { positie: "tr", x0: B, y0: 0, pad: `M${B},${A} L${B},0 A${KWART},${KWART} 0 0 1 ${MAAT},${A} Z`, richting: [1, -1], midden: 45 },
  { positie: "bl", x0: 0, y0: B, pad: `M${A},${B} L${A},${MAAT} A${KWART},${KWART} 0 0 1 0,${B} Z`, richting: [-1, 1], midden: 225 },
  { positie: "br", x0: B, y0: B, pad: `M${B},${B} L${B},${MAAT} A${KWART},${KWART} 0 0 0 ${MAAT},${B} Z`, richting: [1, 1], midden: 135 },
];

/** Het label staat op de middenlijn van het kwart, ongeveer 215px van het middelpunt. */
export const LABEL_R = 215;

/** De linkerhelft: Vijf wedges van 36° vanaf 12 uur tegen de klok in, met Fundament op de scheiding (270°). */
export const LINKS_WEDGES: { naam: string; kleur: string; van: number; tot: number }[] = [
  { naam: "Overkoepelend", kleur: "#ff671f", van: 324, tot: 360 },
  { naam: "Organisatie", kleur: "#225ba0", van: 288, tot: 324 },
  { naam: "Fundament", kleur: "#ffc043", van: 252, tot: 288 },
  { naam: "Proces & Tech", kleur: "#392944", van: 216, tot: 252 },
  { naam: "Mens", kleur: "#197f4e", van: 180, tot: 216 },
];

/** Rechtsboven (AI): Vijf wedges van 18° vanaf 12 uur met de klok mee in de kleuren van de AI-domeinen. */
export const AI_WEDGES: { kleur: string; van: number; tot: number }[] = ["#ff671f", "#225ba0", "#1f9aa0", "#d1467f", "#8a7bb8"].map((kleur, i) => ({
  kleur,
  van: i * 18,
  tot: (i + 1) * 18,
}));

export const WEDGE_DEKKING = 0.3;

/** De hoekpunten van de lijn: (hoek, score van 1 tot 5). 180 is onderaan, 270 en 360 liggen op de grens tussen twee kwarten, 450 is rechts. */
export const LIJN: [number, number][] = [
  [180, 2.6], [202, 3.8], [225, 1.9], [248, 3.5], [270, 2.3], [293, 4.1], [318, 2.0],
  [340, 3.3], [360, 2.8], [381, 4.2], [405, 1.8], [428, 3.6], [450, 2.4],
];

/** De straal van een hoekpunt: (score − 1) / 4 × 262px × 0,95. */
export const lijnStraal = (score: number) => ((score - 1) / 4) * WEDGE_R * 0.95;

export function lijnPunt(index: number): [number, number] {
  const [hoek, score] = LIJN[index];
  return kompas(lijnStraal(score), hoek);
}

/** De lijn als `points` voor een `polyline` (scherpe hoeken, geen afronding). */
export function lijnPunten(): string {
  return LIJN.map((_, i) => lijnPunt(i).map(f).join(",")).join(" ");
}

/** De vulling: De lijn, dan terug via het midden. Zonder streek, dus er lopen geen lijnen naar het midden. */
export function lijnVulling(): string {
  return `${lijnPunten()} ${CENTRUM},${CENTRUM}`;
}

/** De bogen van de Quickscan: Vier concentrische bogen over het kwart rechtsonder, van 90° (rechts) naar 180° (onderaan), met de score als vulling. */
export const QUICK_BOGEN: { r: number; score: number; kleur: string }[] = [
  { r: 70, score: 0.84, kleur: "#22a06b" },
  { r: 112, score: 0.62, kleur: "#e8871e" },
  { r: 154, score: 0.48, kleur: "#dc2626" },
  { r: 196, score: 0.71, kleur: "#e8871e" },
];
export const BOOG_DIKTE = 20;

/** Het pad van een boog van 90° tot 90° + `fractie` × 90° (met de klok mee). */
export function boogPad(r: number, fractie: number): string {
  const [x1, y1] = kompas(r, 90);
  const [x2, y2] = kompas(r, 90 + 90 * fractie);
  return `M${f(x1)},${f(y1)} A${r},${r} 0 0 1 ${f(x2)},${f(y2)}`;
}

/** De plek van de stip per kwart: Op een hoekpunt van de lijn, en rechtsonder in het midden van de rode boog. */
export function stipPunt(positie: Positie): [number, number] {
  if (positie === "tl") return lijnPunt(5);
  if (positie === "bl") return lijnPunt(3);
  if (positie === "tr") return lijnPunt(11);
  const rood = QUICK_BOGEN[2];
  return kompas(rood.r, 90 + 90 * (rood.score / 2));
}

/** Het label van een Assessment op de cirkel (de korte naam, op twee regels) en de volledige naam voor het paneel. */
export const KORTE_NAMEN: Record<string, string> = {
  "klantcontact-volwassenheid": "Klantcontact Volwassenheid",
  "ai-volwassenheid": "AI-Volwassenheid",
  zorgscan: "Volwassenheid Zorg",
  "quickscan-ziekenhuis": "Quickscan Ziekenhuis",
};

/** Volgend of vorig kwart bij een pijltoets, rondlopend. `null` zonder keuze begint bij het eerste (of het laatste bij omhoog en links). */
export function volgendeKeuze(huidig: number | null, aantal: number, toets: string): number | null {
  if (aantal === 0) return null;
  const vooruit = toets === "ArrowRight" || toets === "ArrowDown";
  const achteruit = toets === "ArrowLeft" || toets === "ArrowUp";
  if (!vooruit && !achteruit) return null;
  if (huidig === null) return vooruit ? 0 : aantal - 1;
  return (huidig + (vooruit ? 1 : aantal - 1)) % aantal;
}
