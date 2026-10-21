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

/**
 * De drie kleurwedges van elk deel met een radar (`CLAUDE.md`, scherm 1, De cirkel, Kleuren per deel, besloten door Joost op 21 oktober 2026, PR 166):
 * Precies drie wedges van 24° tot straal 262px, met 30% dekking en een witte rand van 1,2px, met de klok mee binnen het deel. Het is een selectie
 * van de kleuren van het Assessment en niet alle categorieën of alle domeinen. De doorlopende radar over Klantcontact Volwassenheid en Zorg met
 * Fundament op de scheiding en de vijf wedges van AI zijn vervallen.
 */
export const DEEL_KLEUREN: Record<string, string[]> = {
  "klantcontact-volwassenheid": ["#ff671f", "#225ba0", "#197f4e"],
  zorgscan: ["#ff671f", "#225ba0", "#197f4e"],
  "ai-volwassenheid": ["#ff671f", "#1f9aa0", "#d1467f"],
  spanningsmeter: ["#225ba0", "#1f9aa0", "#ffc043"],
};

/** De wedges van een deel: Drie van 24°, vanaf het begin van het deel met de klok mee, met hun kleur (leeg bij de Quickscan). */
export function deelWedges(d: DeelDef): { kleur: string; van: number; tot: number }[] {
  return (DEEL_KLEUREN[d.assessmentId] ?? []).map((kleur, i) => ({ kleur, van: d.van + i * WEDGE_HOEK, tot: d.van + (i + 1) * WEDGE_HOEK }));
}

export const WEDGE_HOEK = 24;
export const WEDGE_DEKKING = 0.3;

/** Het label op de middenlijn van het deel, op 235px van het middelpunt (Zorg 240px, de Quickscan 200px). */
export const LABEL_R: Record<string, number> = {
  "klantcontact-volwassenheid": 235,
  zorgscan: 240,
  "ai-volwassenheid": 235,
  "quickscan-ziekenhuis": 200,
  spanningsmeter: 235,
};
/** Klantcontact Volwassenheid staat 16px lager, zodat de pil de stip niet raakt. */
const LABEL_DY: Record<string, number> = { "klantcontact-volwassenheid": 16 };

/** Het middelpunt van de label-pil van een Assessment. */
export function labelPunt(assessmentId: string): [number, number] {
  const d = DELEN.find((x) => x.assessmentId === assessmentId);
  if (!d) return [CENTRUM, CENTRUM];
  const [x, y] = kompas(LABEL_R[assessmentId] ?? 235, d.midden);
  return [x, y + (LABEL_DY[assessmentId] ?? 0)];
}

/** De pil is ongeveer 210 × 56px (`CLAUDE.md`, De stip): Het midden van de stip ligt minstens 8px buiten die pil. */
export const PIL_B = 210;
export const PIL_H = 56;
export const STIP_R = 9;
export const STIP_AFSTAND = 8;

/**
 * De schaal van de cirkel (`CLAUDE.md`, scherm 1, De cirkel, Hulpcirkels en schaal, PR 166): Straal = 48 + (score − 1) × 50 px. Score 2 is 98px,
 * 3 is 148px, 4 is 198px en 5 is 248px. Het midden (score 1, 48px) blijft vrij.
 */
export const schaalStraal = (score: number) => 48 + (score - 1) * 50;

/** De hulpcirkels: Vier witte bogen op de scores 2, 3, 4 en 5 (75% dekking, 1,2px), over de 72° van een deel. */
export const RINGEN = [2, 3, 4, 5].map(schaalStraal);

/**
 * De hoekpunten van de lijn (PR 163 en PR 166, besloten door Joost): (hoek, score van 1 tot 5). De lijn loopt van 162° (het begin van de
 * Spanningsmeter) met de klok mee tot 450° (het einde van AI, dus 90°, rechts) en slaat de Quickscan over. Een echte meting heeft pieken en dalen:
 * Alle hoekpunten liggen tussen score 2,5 (123px) en 3,9 (193px), dus nooit op of tegen de hulpcirkels van 4 en 5. Er zijn 13 hoekpunten op 24° van
 * elkaar. Dalen liggen op de grenzen tussen de delen (het eerste, vierde, zevende, tiende en dertiende hoekpunt) en pieken binnen een deel. Een deel
 * tekent zijn eigen vier hoekpunten, waarvan de eerste en de laatste gedeeld zijn met het buurdeel, zodat de lijn precies aansluit.
 */
export const LIJN: [number, number][] = [
  [162, 2.6], [186, 3.7], [210, 2.9], [234, 2.5], [258, 3.3], [282, 3.9], [306, 2.7],
  [330, 2.8], [354, 3.6], [378, 2.5], [402, 3.8], [426, 3.0], [450, 2.6],
];

/** De straal van een hoekpunt volgens de schaal van de cirkel. */
export const lijnStraal = schaalStraal;

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
    const sc = kant === "boven" ? Math.min(5, score + BAND_PUNTEN) : Math.max(1, score - BAND_PUNTEN);
    return kompas(lijnStraal(sc), hoek).map(f).join(",");
  });
  return punten.join(" ");
}

/** Het vlak van de band: De bovenrand heen en de onderrand terug. */
export function bandVlak(): string {
  const onder = bandPunten("onder").split(" ").reverse().join(" ");
  return `${bandPunten("boven")} ${onder}`;
}

/**
 * De bogen van de Quickscan (PR 166): Vier concentrische bogen over 56° (de middenlijn plus en min 28°), met straal 56, 90, 124 en 158px, 14px dik
 * en ronde uiteinden. De baan is `#e9e6df`, het gekleurde deel is 84%, 62%, 48% en 71% van de 56°.
 */
export const QUICK_BOGEN: { r: number; score: number; kleur: string }[] = [
  { r: 56, score: 0.84, kleur: "#22a06b" },
  { r: 90, score: 0.62, kleur: "#e8871e" },
  { r: 124, score: 0.48, kleur: "#dc2626" },
  { r: 158, score: 0.71, kleur: "#e8871e" },
];
export const BOOG_DIKTE = 14;
export const BOOG_HOEK = 56;
/** De bogen beginnen op de middenlijn van de Quickscan (126°) min 28°. */
const QUICK_VAN = 126 - BOOG_HOEK / 2;

/** Het pad van een boog van 98° tot 98° + `fractie` × 56° (met de klok mee). */
export function boogPad(r: number, fractie: number): string {
  const [x1, y1] = kompas(r, QUICK_VAN);
  const [x2, y2] = kompas(r, QUICK_VAN + BOOG_HOEK * fractie);
  return `M${f(x1)},${f(y1)} A${r},${r} 0 0 1 ${f(x2)},${f(y2)}`;
}

/** De afstand van een punt tot de rechthoek van de label-pil: 0 als het erin ligt. */
function afstandTotPil(assessmentId: string, x: number, y: number): number {
  const [lx, ly] = labelPunt(assessmentId);
  const dx = Math.max(Math.abs(x - lx) - PIL_B / 2, 0);
  const dy = Math.max(Math.abs(y - ly) - PIL_H / 2, 0);
  return Math.hypot(dx, dy);
}

/**
 * Het hoekpunt van de lijn waar de stip staat (PR 166): De hoogste van de twee binnenste hoekpunten van het deel, dus nooit een dal en nooit naast de
 * lijn. De stip staat nooit in of tegen een label: Hij ligt minstens 8px buiten de pil. Valt de hoogste piek onder de pil, dan neemt de stip het
 * andere binnenste hoekpunt (bij AI-Volwassenheid hoekpunt 12 in plaats van 11). De Quickscan heeft geen lijn en geeft `null`.
 */
export function stipIndex(assessmentId: string): number | null {
  const d = DELEN.find((x) => x.assessmentId === assessmentId);
  if (!d || d.soort === "quick") return null;
  // De Spanningsmeter ligt op 522° tot 594°, de lijn begint op 162° (522 − 360).
  const van = d.van >= 450 ? d.van - 360 : d.van;
  const tot = van + DEEL_HOEK;
  const kandidaten: number[] = [];
  LIJN.forEach(([hoek], i) => {
    if (hoek > van + 1e-9 && hoek < tot - 1e-9) kandidaten.push(i);
  });
  kandidaten.sort((a, b) => LIJN[b][1] - LIJN[a][1]);
  const vrij = kandidaten.find((i) => {
    const [x, y] = lijnPunt(i);
    return afstandTotPil(assessmentId, x, y) >= STIP_AFSTAND;
  });
  return vrij ?? kandidaten[0] ?? null;
}

/** De plek van de stip: Op het hoekpunt van `stipIndex`, en bij de Quickscan in het midden van de rode boog (straal 124px, halverwege het gekleurde deel). */
export function stipPunt(assessmentId: string): [number, number] {
  const i = stipIndex(assessmentId);
  if (i !== null) return lijnPunt(i);
  const rood = QUICK_BOGEN[2];
  return kompas(rood.r, QUICK_VAN + (BOOG_HOEK * rood.score) / 2);
}

/** De regels van het label op de cirkel (PR 166): Twee regels, behalve de Spanningsmeter op één regel. */
export const LABEL_REGELS: Record<string, string[]> = {
  "klantcontact-volwassenheid": ["Klantcontact", "Volwassenheid"],
  zorgscan: ["Volwassenheid", "Zorg"],
  "ai-volwassenheid": ["AI-Volwassenheid", "in Klantcontact"],
  "quickscan-ziekenhuis": ["Quickscan", "Ziekenhuis"],
  spanningsmeter: ["Spanningsmeter"],
};

/** Het label van een Assessment op de cirkel (de korte naam, op twee regels) en de volledige naam voor het paneel. */
export const KORTE_NAMEN: Record<string, string> = {
  "klantcontact-volwassenheid": "Klantcontact Volwassenheid",
  "ai-volwassenheid": "AI-Volwassenheid in Klantcontact",
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
