/**
 * De geometrie van de Assessmentcirkel op scherm 1 (`CLAUDE.md`, scherm 1, Kies jouw assessment als cirkel, ontwerp `Home-D`, met vijf delen
 * van 72° na de Spanningsmeter, variant E2): Vijf delen met 8px ertussen in een vlak van 568px, de wedges van de radars, de lijn met
 * voorbeelddata, de band van de Spanningsmeter, de bogen van de Quickscan en de plek van de stip. Pure functies, zonder React, zodat de maten
 * testbaar zijn. Hoeken zijn kompashoeken in graden: 0 is 12 uur en ze lopen met de klok mee, dus 90 is rechts, 180 onderaan en 270 links.
 */
export const MAAT = 568;
export const SPLEET = 8;
export const CENTRUM = MAAT / 2;
/** De buitenstraal van een deel: De rand van het vlak. */
export const RAND = MAAT / 2;
/** De breedte van een deel in graden: Vijf gelijke delen. */
export const DEEL_HOEK = 72;
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

/**
 * Het pad van een deel van `van` tot `tot` graden met een spleet van `SPLEET` px tot het volgende deel: De top ligt op de middenlijn naar
 * buiten verschoven (`(SPLEET / 2) / sin(halve hoek)`), zodat de twee randen van twee buren overal 8px van elkaar liggen, en de buitenrand ligt
 * op de cirkel met straal `RAND` om het midden van het vlak.
 */
export function deelPad(van: number, tot: number): string {
  const mid = (van + tot) / 2;
  const halve = ((tot - van) / 2) * (Math.PI / 180);
  const d = SPLEET / 2 / Math.sin(halve);
  const [ax, ay] = kompas(d, mid);
  const raakpunt = (hoek: number): [number, number] => {
    const u = [Math.sin((hoek * Math.PI) / 180), -Math.cos((hoek * Math.PI) / 180)];
    const w = [ax - CENTRUM, ay - CENTRUM];
    const wu = w[0] * u[0] + w[1] * u[1];
    const t = -wu + Math.sqrt(wu * wu - (w[0] * w[0] + w[1] * w[1]) + RAND * RAND);
    return [ax + t * u[0], ay + t * u[1]];
  };
  const [x1, y1] = raakpunt(van);
  const [x2, y2] = raakpunt(tot);
  return `M${f(ax)},${f(ay)} L${f(x1)},${f(y1)} A${RAND},${RAND} 0 0 1 ${f(x2)},${f(y2)} Z`;
}

/** Wat een deel toont: De wedges van een radar met de lijn, de bogen van de Quickscan, of de band van de Spanningsmeter. */
export type DeelSoort = "volwassenheid" | "ai" | "quick" | "spanning";

export interface DeelDef {
  /** De plek is vast per Assessment (`CLAUDE.md`, scherm 1, Volgorde, variant E2). */
  assessmentId: string;
  soort: DeelSoort;
  van: number;
  tot: number;
  /** De kompashoek van de middenlijn van het deel. */
  midden: number;
  pad: string;
  /** De richting waarin een gekozen deel 10px opschuift: De middenlijn, als vector van het midden af. */
  richting: [number, number];
}

function deel(assessmentId: string, soort: DeelSoort, van: number): DeelDef {
  const tot = van + DEEL_HOEK;
  const midden = (van + tot) / 2;
  const [rx, ry] = kompas(1, midden, 0, 0);
  return { assessmentId, soort, van, tot, midden, pad: deelPad(van, tot), richting: [rx, ry] };
}

/**
 * De vijf delen, met de klok mee vanaf links (besloten door Joost op 21 oktober 2026, variant E2): Klantcontact Volwassenheid is gecentreerd op
 * links (270°), dan Zorg, AI, de Quickscan en de Spanningsmeter. De Volwassenheid-delen liggen zo links bij elkaar en de Quickscan breekt met
 * zijn bogen de rechterhelft. De volgorde van deze lijst is ook de volgorde van de pijltoetsen.
 */
export const DELEN: DeelDef[] = [
  deel("klantcontact-volwassenheid", "volwassenheid", 234),
  deel("zorgscan", "volwassenheid", 306),
  deel("ai-volwassenheid", "ai", 378),
  deel("quickscan-ziekenhuis", "quick", 450),
  deel("spanningsmeter", "spanning", 522),
];

/** Het label staat op de middenlijn van het deel, ongeveer 200px van het middelpunt: Zo valt het links niet buiten het vlak. */
export const LABEL_R = 200;

/**
 * De wedges van de Volwassenheid-delen: Eén doorlopende radar over Klantcontact Volwassenheid en Zorg (234° tot 378°), vijf wedges van 28,8°
 * met Fundament op de scheiding tussen de twee delen (306°). Elk deel tekent de hele radar en knipt zijn eigen stuk.
 */
export const VOLWASSENHEID_WEDGES: { naam: string; kleur: string; van: number; tot: number }[] = [
  { naam: "Mens", kleur: "#197f4e", van: 234, tot: 262.8 },
  { naam: "Proces & Tech", kleur: "#392944", van: 262.8, tot: 291.6 },
  { naam: "Fundament", kleur: "#ffc043", van: 291.6, tot: 320.4 },
  { naam: "Organisatie", kleur: "#225ba0", van: 320.4, tot: 349.2 },
  { naam: "Overkoepelend", kleur: "#ff671f", van: 349.2, tot: 378 },
];

/** AI: Vijf wedges van 14,4° vanaf het begin van het deel (378°) met de klok mee in de kleuren van de AI-domeinen. */
export const AI_WEDGES: { kleur: string; van: number; tot: number }[] = ["#ff671f", "#225ba0", "#1f9aa0", "#d1467f", "#8a7bb8"].map((kleur, i) => ({
  kleur,
  van: 378 + i * 14.4,
  tot: 378 + (i + 1) * 14.4,
}));

/** De Spanningsmeter: Drie wedges van 24° vanaf het begin van het deel (162°) in een selectie van de veldkleuren. */
export const SPANNING_WEDGES: { kleur: string; van: number; tot: number }[] = ["#225ba0", "#1f9aa0", "#ffc043"].map((kleur, i) => ({
  kleur,
  van: 162 + i * 24,
  tot: 162 + (i + 1) * 24,
}));

export const WEDGE_DEKKING = 0.3;

/**
 * De hoekpunten van de lijn (aangepast op 21 oktober 2026, besloten door Joost, PR 164): (hoek, score van 1 tot 5). De lijn loopt van 162° (het
 * begin van de Spanningsmeter) met de klok mee tot 450° (het einde van AI, dus 90°, rechts) en slaat de Quickscan over. Hij heeft drie regels, zodat
 * hij op een echte meting lijkt: (1) De score van een hoekpunt ligt tussen 2,5 en 3,9, dus een dal gaat nooit onder 2,5 en een piek komt niet
 * hoger dan bijna 4. (2) De straal volgt de hulpcirkels van het deel (`lijnStraal`). (3) Op elke grens tussen twee delen zit een dal en de pieken
 * liggen binnen een deel: De lijn zakt bij elke deelgrens in. Dat zijn 13 hoekpunten op 24° van elkaar. De deelgrenzen zijn het eerste, vierde,
 * zevende, tiende en dertiende hoekpunt. Elk deel tekent de hele lijn en knipt zijn eigen stuk, dus de lijn sluit precies aan.
 */
export const LIJN: [number, number][] = [
  [162, 2.6], [186, 3.7], [210, 2.9], [234, 2.5], [258, 3.3], [282, 3.9], [306, 2.7],
  [330, 2.8], [354, 3.6], [378, 2.5], [402, 3.8], [426, 3.0], [450, 2.6],
];

/** De straal van een hoekpunt: (score − 1) / 4 × 215px, zodat de scores 2, 3, 4 en 5 op de hulpcirkels liggen (`RINGEN`). */
export const lijnStraal = (score: number) => ((score - 1) / 4) * RING_R;

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

/** De halve breedte van de band om de lijn, in punten van de schaal 1 tot 5 (`visualisatie-spanningsmeter.md`, Het beeld). */
export const BAND_PUNTEN = 0.75;

/** De hoekpunten van de rand van de band: De score plus of min 0,75, begrensd op 1 tot 5. Alleen de hoekpunten van het deel van de Spanningsmeter (162° tot 234°). */
export function bandPunten(kant: "boven" | "onder"): string {
  const punten = LIJN.filter(([hoek]) => hoek <= 234 + 1e-9).map(([hoek, score]) => {
    const s = kant === "boven" ? Math.min(5, score + BAND_PUNTEN) : Math.max(1, score - BAND_PUNTEN);
    return kompas(lijnStraal(s), hoek).map(f).join(",");
  });
  return punten.join(" ");
}

/** Het vlak van de band: De bovenrand heen en de onderrand terug. */
export function bandVlak(): string {
  const onder = bandPunten("onder").split(" ").reverse().join(" ");
  return `${bandPunten("boven")} ${onder}`;
}

/** De bogen van de Quickscan: Vier concentrische bogen over het deel, van 90° (rechts) over `DEEL_HOEK` graden, met de score als vulling. */
export const QUICK_BOGEN: { r: number; score: number; kleur: string }[] = [
  { r: 70, score: 0.84, kleur: "#22a06b" },
  { r: 112, score: 0.62, kleur: "#e8871e" },
  { r: 154, score: 0.48, kleur: "#dc2626" },
  { r: 196, score: 0.71, kleur: "#e8871e" },
];
export const BOOG_DIKTE = 20;
const QUICK_VAN = 90;

/** Het pad van een boog van 90° tot 90° + `fractie` × 72° (met de klok mee). */
export function boogPad(r: number, fractie: number): string {
  const [x1, y1] = kompas(r, QUICK_VAN);
  const [x2, y2] = kompas(r, QUICK_VAN + DEEL_HOEK * fractie);
  return `M${f(x1)},${f(y1)} A${r},${r} 0 0 1 ${f(x2)},${f(y2)}`;
}

/**
 * Het hoekpunt van de lijn waar de stip staat (aangepast op 21 oktober 2026, PR 164): De hoogste van de binnenste hoekpunten van het deel, dus nooit
 * een dal en nooit naast de lijn. Een deel heeft vier hoekpunten, de twee op de grenzen zijn dalen en worden gedeeld met het buurdeel. De Quickscan
 * heeft geen lijn en geeft `null`.
 */
export function stipIndex(assessmentId: string): number | null {
  const d = DELEN.find((x) => x.assessmentId === assessmentId);
  if (!d || d.soort === "quick") return null;
  // De Spanningsmeter ligt op 522° tot 594°, de lijn begint op 162° (522 − 360).
  const van = d.van >= 450 ? d.van - 360 : d.van;
  const tot = van + DEEL_HOEK;
  let beste: number | null = null;
  LIJN.forEach(([hoek, score], i) => {
    if (hoek <= van + 1e-9 || hoek >= tot - 1e-9) return;
    if (beste === null || score > LIJN[beste][1]) beste = i;
  });
  return beste;
}

/** De plek van de stip: Op het hoekpunt van `stipIndex`, en bij de Quickscan in het midden van de rode boog. */
export function stipPunt(assessmentId: string): [number, number] {
  const i = stipIndex(assessmentId);
  if (i !== null) return lijnPunt(i);
  const rood = QUICK_BOGEN[2];
  return kompas(rood.r, QUICK_VAN + DEEL_HOEK * (rood.score / 2));
}

/** Het label van een Assessment op de cirkel (de korte naam, op twee regels) en de volledige naam voor het paneel. */
export const KORTE_NAMEN: Record<string, string> = {
  "klantcontact-volwassenheid": "Klantcontact Volwassenheid",
  "ai-volwassenheid": "AI-Volwassenheid",
  zorgscan: "Volwassenheid Zorg",
  "quickscan-ziekenhuis": "Quickscan Ziekenhuis",
  spanningsmeter: "Spanningsmeter",
};

/**
 * Welk deel hoort bij welk Assessment: Een Assessment met een bekende id staat op zijn vaste plek. Een Assessment zonder vaste plek (een
 * eigen type dat een Admin toevoegt) neemt de eerste vrije plek, zodat er nooit meer dan vijf delen zijn. De uitkomst volgt de volgorde
 * van `DELEN`, met `null` waar geen Assessment staat.
 */
export function delenMetAssessments<T extends { id: string }>(assessments: T[]): (T | null)[] {
  const uit: (T | null)[] = DELEN.map((d) => assessments.find((a) => a.id === d.assessmentId) ?? null);
  for (const a of assessments) {
    if (DELEN.some((d) => d.assessmentId === a.id)) continue;
    const vrij = uit.indexOf(null);
    if (vrij === -1) break;
    uit[vrij] = a;
  }
  return uit;
}

/** Volgend of vorig deel bij een pijltoets, rondlopend. `null` zonder keuze begint bij het eerste (of het laatste bij omhoog en links). */
export function volgendeKeuze(huidig: number | null, aantal: number, toets: string): number | null {
  if (aantal === 0) return null;
  const vooruit = toets === "ArrowRight" || toets === "ArrowDown";
  const achteruit = toets === "ArrowLeft" || toets === "ArrowUp";
  if (!vooruit && !achteruit) return null;
  if (huidig === null) return vooruit ? 0 : aantal - 1;
  return (huidig + (vooruit ? 1 : aantal - 1)) % aantal;
}
