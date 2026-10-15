/**
 * De berekeningen van Verkennen (`visualisatie-verkennen.md`): De pool van een Assessment, de filters uit de organisatievelden,
 * het groeperen met een focus en de statistiek voor de vier weergaven. Pure functies zonder opslag, het scherm slaat niets op.
 * De rekenregels zijn die van de benchmark tussen organisaties (`benchmark.md`): Per organisatie de meest recente Meting die aan
 * `benchmarkMinScans` voldoet, en elke organisatie telt even zwaar mee.
 */
import { Assessment, Organisatie, ScanUitvoering, VeldDefinitie } from "./types";
import { BouwblokRij, bouwblokRijen, kwantiel, rond1, steekproefSd } from "./visualisatie";
import { bouwblokScoreRuw, overallScoreRuw } from "./scoring";
import { gemiddeldeAntwoordenVoorMetingMetSamenstelling, voldoetAanMinScans, vergelijkNieuwsteEerst, aantalAfgerondInMeting } from "./metingen";
import { organisatieVelden } from "@/data/organisatie-velden";

/* ---------- Pool ---------- */

export interface PoolLid {
  organisatie: Organisatie;
  meting: ScanUitvoering;
  aantalScans: number;
  /** De ruwe bouwblokscore (1 tot 5) per rij van `Pool.rijen`, `null` zonder antwoorden. */
  scores: (number | null)[];
  /** De overall van het Assessment, met weging waar die geldt, niet afgerond. */
  overall: number | null;
}

export interface Pool {
  rijen: BouwblokRij[];
  leden: PoolLid[];
  /** Organisaties met een bruikbare Meting maar zonder `benchmarkToegestaan`: Niet beschikbaar. */
  zonderToestemming: number;
}

/**
 * De pool van een Assessment (`visualisatie-verkennen.md`, Pool): Organisaties met `benchmarkToegestaan` die een Meting van het
 * Assessment hebben met minstens `minScans` afgeronde scans. Per organisatie telt de meest recente zo'n Meting.
 */
export function bouwPool(organisaties: Organisatie[], assessment: Assessment, minScans: number): Pool {
  const rijen = bouwblokRijen(assessment);
  const leden: PoolLid[] = [];
  let zonderToestemming = 0;
  for (const organisatie of organisaties) {
    const meting = organisatie.scanUitvoeringen
      .filter((m) => m.assessmentId === assessment.id && voldoetAanMinScans(organisatie, m, minScans))
      .sort(vergelijkNieuwsteEerst)[0];
    if (!meting) continue;
    if (!organisatie.benchmarkToegestaan) {
      zonderToestemming += 1;
      continue;
    }
    const antwoorden = gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, meting);
    leden.push({
      organisatie,
      meting,
      aantalScans: aantalAfgerondInMeting(organisatie, meting),
      scores: rijen.map((r) => bouwblokScoreRuw(r.bouwblok, antwoorden)),
      overall: overallScoreRuw(assessment, antwoorden),
    });
  }
  leden.sort((a, b) => a.organisatie.naam.localeCompare(b.organisatie.naam, "nl"));
  return { rijen, leden, zonderToestemming };
}

/* ---------- Filters uit de organisatievelden ---------- */

export interface FilterVeld {
  /** Het pad in `Organisatie.kenmerken` met punten, bijvoorbeeld "kpis.aht". */
  id: string;
  /** "Techstack › Contact center › Oplossing". */
  label: string;
  pad: string[];
  type: "select" | "getal";
  /** Eenheid van een getal (`VeldDefinitie.eenheid`, bij een percentage "%"). */
  eenheid?: string;
}

/** Het afgeleide kenmerk "Ingezette kanalen": Alleen een filter, geen groepering (`visualisatie-verkennen.md`, Kenmerken en filters). */
export const KANALEN_ID = "__kanalen";
export const KANALEN_LABEL = "Volume en klantbasis › Ingezette kanalen";

/** Alle velden die als filter kunnen dienen: De bladeren van de organisatievelden, select of getal (percentage telt als getal). */
export function filterVelden(velden: VeldDefinitie[] = organisatieVelden): FilterVeld[] {
  const uit: FilterVeld[] = [];
  const loop = (lijst: VeldDefinitie[], pad: string[], namen: string[]) => {
    for (const v of lijst) {
      const p = [...pad, v.id];
      const n = [...namen, v.label];
      if (v.type === "groep") loop(v.subvelden ?? [], p, n);
      else if (v.type === "select" || v.type === "select-afhankelijk") uit.push({ id: p.join("."), label: n.join(" › "), pad: p, type: "select" });
      else if (v.type === "getal" || v.type === "percentage")
        uit.push({
          id: p.join("."),
          label: n.join(" › "),
          pad: p,
          type: "getal",
          eenheid: v.eenheid ?? (v.type === "percentage" ? "%" : undefined),
        });
    }
  };
  loop(velden, [], []);
  return uit;
}

/** Het afgeleide veld Ingezette kanalen, naast de organisatievelden in het menu Kenmerk toevoegen. */
export function kanalenVeld(): FilterVeld {
  return { id: KANALEN_ID, label: KANALEN_LABEL, pad: [], type: "select" };
}

/** De groep van een veld in het filtermenu: Het eerste deel van het label ("Techstack"), anders "Overig". */
export function veldGroep(veld: FilterVeld): string {
  const delen = veld.label.split(" › ");
  return delen.length > 1 ? delen[0] : "Overig";
}

/** Het label zonder de groep ("Contact center › Oplossing"): Het origineel waar een korte naam van een veld op bouwt. */
export function veldLabelZonderGroep(veld: FilterVeld): string {
  const delen = veld.label.split(" › ");
  return delen.length > 1 ? delen.slice(1).join(" › ") : veld.label;
}

/** Hoeveel van deze organisaties het veld hebben ingevuld (voor "37 van 50" in het filtermenu). */
export function ingevuldAantal(organisaties: Pick<Organisatie, "kenmerken">[], veld: FilterVeld): number {
  return organisaties.filter((o) => {
    const w = kenmerkWaarde(o, veld.pad);
    return w !== undefined && w !== null && w !== "";
  }).length;
}

/** De waarde van een kenmerk op een pad, of `undefined`. */
export function kenmerkWaarde(organisatie: Pick<Organisatie, "kenmerken">, pad: string[]): unknown {
  let huidig: unknown = organisatie.kenmerken;
  for (const sleutel of pad) {
    if (huidig === null || typeof huidig !== "object") return undefined;
    huidig = (huidig as Record<string, unknown>)[sleutel];
  }
  return huidig;
}

const KANAAL_PREFIX = ["volume-klantbasis", "contacten-per-jaar"];

/** De kanalen uit de contacten per jaar, voor het filter "Ingezette kanalen". */
export function kanaalVelden(): { id: string; naam: string; pad: string[] }[] {
  const groep = organisatieVelden
    .find((v) => v.id === KANAAL_PREFIX[0])
    ?.subvelden?.find((v) => v.id === KANAAL_PREFIX[1]);
  return (groep?.subvelden ?? []).map((v) => ({ id: v.id, naam: v.label, pad: [...KANAAL_PREFIX, v.id] }));
}

/**
 * Een kanaal is ingezet bij een waarde boven 0, niet ingezet bij 0 of "niet van toepassing", en onbekend bij een leeg veld
 * (`visualisatie-verkennen.md`, Filters). Geeft `null` bij onbekend.
 */
export function kanaalIngezet(organisatie: Pick<Organisatie, "kenmerken">, pad: string[]): boolean | null {
  const w = kenmerkWaarde(organisatie, pad);
  if (w === undefined || w === null || w === "") return null;
  if (typeof w === "number") return w > 0;
  if (typeof w === "string") {
    const n = Number(w.replace(",", "."));
    if (Number.isFinite(n)) return n > 0;
    return false;
  }
  return false;
}

export interface FilterStand {
  /** Per select-veld de gekozen waarden: "of" binnen een veld. */
  select: Record<string, string[]>;
  /** Per getalveld een bereik. */
  bereik: Record<string, [number, number]>;
  /** Gekozen kanalen (de id's uit `kanaalVelden`): "en", de organisatie moet ze allemaal inzetten. */
  kanalen: string[];
}

export const LEGE_FILTERS: FilterStand = { select: {}, bereik: {}, kanalen: [] };

export function heeftFilters(stand: FilterStand): boolean {
  return (
    Object.values(stand.select).some((l) => l.length > 0) || Object.keys(stand.bereik).length > 0 || stand.kanalen.length > 0
  );
}

/** Verschillende filters werken als "en". Een organisatie zonder waarde voor een gekozen filterveld valt weg. */
export function pasFiltersToe(leden: PoolLid[], stand: FilterStand, velden: FilterVeld[] = filterVelden()): PoolLid[] {
  const perId = new Map(velden.map((v) => [v.id, v]));
  const kanalen = kanaalVelden().filter((k) => stand.kanalen.includes(k.id));
  return leden.filter((lid) => {
    for (const [id, gekozen] of Object.entries(stand.select)) {
      if (gekozen.length === 0) continue;
      const veld = perId.get(id);
      if (!veld) continue;
      const w = kenmerkWaarde(lid.organisatie, veld.pad);
      if (typeof w !== "string" || !gekozen.includes(w)) return false;
    }
    for (const [id, [min, max]] of Object.entries(stand.bereik)) {
      const veld = perId.get(id);
      if (!veld) continue;
      const w = getalWaarde(kenmerkWaarde(lid.organisatie, veld.pad));
      if (w === null || w < min || w > max) return false;
    }
    for (const kanaal of kanalen) if (kanaalIngezet(lid.organisatie, kanaal.pad) !== true) return false;
    return true;
  });
}

export function getalWaarde(w: unknown): number | null {
  if (typeof w === "number" && Number.isFinite(w)) return w;
  if (typeof w === "string" && w.trim() !== "") {
    const n = Number(w.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** De waarden van een select-veld in de pool, met het aantal organisaties, het vaakst voorkomend eerst. */
export function selectOpties(leden: PoolLid[], veld: FilterVeld): { waarde: string; aantal: number }[] {
  const telling = new Map<string, number>();
  for (const lid of leden) {
    const w = kenmerkWaarde(lid.organisatie, veld.pad);
    if (typeof w === "string" && w !== "") telling.set(w, (telling.get(w) ?? 0) + 1);
  }
  return [...telling.entries()]
    .map(([waarde, aantal]) => ({ waarde, aantal }))
    .sort((a, b) => b.aantal - a.aantal || a.waarde.localeCompare(b.waarde, "nl"));
}

/** De ingevulde getallen van een veld in de pool, en hoeveel organisaties het veld hebben ingevuld. */
export function getalWaarden(leden: PoolLid[], veld: FilterVeld): number[] {
  return leden.map((l) => getalWaarde(kenmerkWaarde(l.organisatie, veld.pad))).filter((w): w is number => w !== null);
}

/** Per kanaal het aantal organisaties in de pool dat het inzet. */
export function kanaalAantallen(leden: PoolLid[]): { id: string; naam: string; aantal: number }[] {
  return kanaalVelden().map((k) => ({ ...k, aantal: leden.filter((l) => kanaalIngezet(l.organisatie, k.pad) === true).length }));
}

/** Een histogram met `bakken` staven van `min` tot en met `max`. */
export function histogram(waarden: number[], min: number, max: number, bakken = 12): number[] {
  const uit = new Array<number>(bakken).fill(0);
  if (max <= min) {
    if (waarden.length > 0) uit[0] = waarden.length;
    return uit;
  }
  for (const w of waarden) {
    const i = Math.min(bakken - 1, Math.floor(((w - min) / (max - min)) * bakken));
    uit[i] += 1;
  }
  return uit;
}

/** De mediaan van een lijst getallen, met lineaire interpolatie. `null` bij een lege lijst. */
export function mediaan(waarden: number[]): number | null {
  if (waarden.length === 0) return null;
  return kwantiel([...waarden].sort((a, b) => a - b), 0.5);
}

/* ---------- Groeperen en focus ---------- */

export type Groepering =
  | { soort: "select"; veldId: string }
  | { soort: "drempel"; veldId: string; drempel: number };

export interface Groep {
  sleutel: string;
  /** De getoonde naam: De korte naam van de waarde als die er is (`visualisatie-verkennen.md`, Korte namen). */
  naam: string;
  /** Het origineel als `naam` een korte naam is: Komt in de tooltip. */
  volledigeNaam?: string;
  leden: PoolLid[];
}

/**
 * Verdeelt de pool in groepen (`visualisatie-verkennen.md`, Groeperen en focus). Een select-veld geeft één groep per waarde, een
 * drempel op een getalveld twee: "≤ drempel" en "> drempel". Organisaties zonder waarde horen niet bij een groep, maar wel bij
 * de rest. De grootste groep staat vooraan.
 */
export function maakGroepen(
  leden: PoolLid[],
  groepering: Groepering,
  velden: FilterVeld[] = filterVelden(),
  /** De korte naam van een waarde bij een veld, of het origineel zelf. */
  naamVan: (veldId: string, waarde: string) => string = (_veldId, waarde) => waarde
): Groep[] {
  const veld = velden.find((v) => v.id === groepering.veldId);
  if (!veld) return [];
  if (groepering.soort === "select") {
    const per = new Map<string, PoolLid[]>();
    for (const lid of leden) {
      const w = kenmerkWaarde(lid.organisatie, veld.pad);
      if (typeof w !== "string" || w === "") continue;
      per.set(w, [...(per.get(w) ?? []), lid]);
    }
    return [...per.entries()]
      .map(([waarde, l]) => {
        const kort = naamVan(veld.id, waarde);
        return { sleutel: waarde, naam: kort, ...(kort !== waarde ? { volledigeNaam: waarde } : {}), leden: l };
      })
      .sort((a, b) => b.leden.length - a.leden.length || a.naam.localeCompare(b.naam, "nl"));
  }
  const onder: PoolLid[] = [];
  const boven: PoolLid[] = [];
  for (const lid of leden) {
    const w = getalWaarde(kenmerkWaarde(lid.organisatie, veld.pad));
    if (w === null) continue;
    (w <= groepering.drempel ? onder : boven).push(lid);
  }
  const d = formatGetal(groepering.drempel, 1);
  const eenheid = veld.eenheid ? ` ${veld.eenheid}` : "";
  return [
    { sleutel: "onder", naam: `≤ ${d}${eenheid}`, leden: onder },
    { sleutel: "boven", naam: `> ${d}${eenheid}`, leden: boven },
  ];
}

/**
 * De focus en de rest (`visualisatie-verkennen.md`, Groeperen en focus): De rest zijn de organisaties van de andere groepen. Wie
 * voor het gekozen kenmerk geen waarde heeft, zit in geen groep en telt niet mee. Zonder groepering (`groepen` leeg of geen focus)
 * is de hele pool de focus en is er geen rest (Zonder groepering).
 */
export function splitsFocus(
  leden: PoolLid[],
  groepen: Groep[],
  focus: Groep | undefined
): { focus: PoolLid[]; rest: PoolLid[] } {
  if (!focus || groepen.length === 0) return { focus: leden, rest: [] };
  return { focus: focus.leden, rest: groepen.filter((g) => g.sleutel !== focus.sleutel).flatMap((g) => g.leden) };
}

/** Hoeveel organisaties van deze lijst geen waarde voor het veld hebben ("n zonder waarde" onder de groepen). */
export function zonderWaarde(leden: PoolLid[], veld: FilterVeld): number {
  return leden.filter((l) => {
    const w = kenmerkWaarde(l.organisatie, veld.pad);
    return w === undefined || w === null || w === "";
  }).length;
}

/* ---------- Wanneer een kenmerk kan groeperen ---------- */

/**
 * De grenzen voor Groeperen op (`visualisatie-verkennen.md`, Drempels): Instellingen bij Drempels en termijnen, geen vaste
 * waarden in de code. `minPool`: Bij minder organisaties in de pool kan er niet gegroepeerd worden. `maxGroepen`: Een select met
 * meer verschillende waarden in de pool kan niet groeperen. `minIngevuldPct`: Een kenmerk dat bij een lager percentage van de
 * organisaties van het Assessment is ingevuld, kan niet groeperen.
 */
export interface GroeperDrempels {
  minPool: number;
  maxGroepen: number;
  minIngevuldPct: number;
}

/** De startwaarden uit de spec, voor tests en voor een instelling die ontbreekt. */
export const STANDAARD_GROEPER_DREMPELS: GroeperDrempels = { minPool: 6, maxGroepen: 12, minIngevuldPct: 40 };

export const KANALEN_REDEN = "Kan niet groeperen: Een Organisatie kan meerdere kanalen hebben";

/* ---------- Getallen tonen en de drempel instellen ---------- */

/** Een getal met punten als duizendtalscheiding en een komma als decimaalteken ("3.932.600", "4,5"). */
export function formatGetal(n: number, maxDecimalen = 2): string {
  const afgerond = Number(n.toFixed(maxDecimalen));
  const [geheel, decimalen] = String(Math.abs(afgerond)).split(".");
  const groep = geheel.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${afgerond < 0 ? "−" : ""}${groep}${decimalen ? `,${decimalen}` : ""}`;
}

/**
 * De stap van de drempel-slider (`visualisatie-verkennen.md`, De drempel instellen): 1, 2 of 5 keer een macht van tien, zo
 * gekozen dat er ongeveer 100 standen zijn. Bij een bereik tot 5.000.000 is de stap 50.000. Een kleiner bereik dan 100 geeft
 * bij hele getallen stap 1.
 */
export function drempelStap(min: number, max: number, heleGetallen = true): number {
  const bereik = Math.max(0, max - min);
  const ruw = bereik / 100;
  if (ruw <= 0) return 1;
  const macht = Math.floor(Math.log10(ruw));
  const kandidaten = [1, 2, 5, 10].map((m) => m * 10 ** macht);
  const stap = kandidaten.find((k) => k >= ruw) ?? 10 ** (macht + 1);
  const afgerond = Number(stap.toPrecision(6));
  return heleGetallen ? Math.max(1, afgerond) : afgerond;
}

/** Een drempel op een waarde, afgerond op hele getallen of op één decimaal bij decimale waarden. */
export function rondDrempel(w: number, heleGetallen: boolean): number {
  return heleGetallen ? Math.round(w) : Math.round(w * 10) / 10;
}

export interface GroeperKenmerk {
  id: string;
  naam: string;
  bruikbaarheid: Bruikbaarheid;
}

export interface GroeperingsBesluit {
  /** Het kenmerk waarop gegroepeerd wordt, `null` als er geen pil gekozen is. */
  gekozen: string | null;
  /** De melding bij een terugval. Hij beschrijft één gebeurtenis en wordt bij de volgende wijziging opnieuw bepaald. */
  melding: string | null;
}

/**
 * Welke pil bij Groeperen op gekozen is na een wijziging van kenmerken, filters of keuze (`visualisatie-verkennen.md`, Groeperen
 * en focus: Terugval, Levensduur van een melding en Herstel). `vorige` is het kenmerk dat gekozen was. Kan dat nog, dan blijft het
 * staan. Kan het niet meer, dan volgt de eerste pil die wel kan, met een melding. Is er geen pil gekozen, dan wordt de eerste pil
 * die kan gekozen, zonder melding: Zo ook bij het eerste bruikbare kenmerk en bij herstel. De melding verdwijnt doordat elke
 * wijziging hem opnieuw bepaalt.
 */
export function besluitGroepering(invoer: {
  vorige: string | null;
  kenmerken: GroeperKenmerk[];
  /** De naam van het vorige kenmerk, voor de melding als het is verwijderd. */
  vorigeNaam?: string;
  poolGrootte: number;
  /** De pool zonder filters: Een te kleine pool door de filters is iets anders dan een te kleine pool. */
  poolTotaal: number;
  minPool: number;
}): GroeperingsBesluit {
  const eerste = invoer.kenmerken.find((k) => k.bruikbaarheid.ok);
  if (invoer.vorige === null) return { gekozen: eerste?.id ?? null, melding: null };
  const huidig = invoer.kenmerken.find((k) => k.id === invoer.vorige);
  if (huidig?.bruikbaarheid.ok) return { gekozen: huidig.id, melding: null };
  const reden = huidig ? (huidig.bruikbaarheid.reden ?? "Het kenmerk kan niet groeperen") : `${invoer.vorigeNaam ?? "Het kenmerk"} is verwijderd`;
  if (eerste) return { gekozen: eerste.id, melding: `${reden}. De groepering staat nu op ${eerste.naam}.` };
  if (invoer.poolGrootte < invoer.minPool && invoer.poolTotaal >= invoer.minPool) {
    return {
      gekozen: null,
      melding: `Met deze filters zit er ${invoer.poolGrootte} ${invoer.poolGrootte === 1 ? "Organisatie" : "Organisaties"} in de pool. Dat is te weinig om te vergelijken. Haal een filter weg.`,
    };
  }
  return { gekozen: null, melding: "Er is geen kenmerk meer om op te groeperen." };
}

export interface Bruikbaarheid {
  ok: boolean;
  /** De reden als het kenmerk niet kan groeperen. */
  reden?: string;
}

/**
 * Kan dit kenmerk de pool in groepen verdelen? `alle` is de pool van het Assessment (zonder filters, voor de 40%), `gefilterd` de
 * pool na de filters. Elke regel geeft een reden die in een tooltip en onder de groep Groeperen op staat.
 */
export function kanGroeperen(
  veld: FilterVeld,
  alle: PoolLid[],
  gefilterd: PoolLid[],
  drempels: GroeperDrempels = STANDAARD_GROEPER_DREMPELS
): Bruikbaarheid {
  // Ingezette kanalen kan nooit groeperen: Een organisatie zet meerdere kanalen in en valt dan in meer dan één groep.
  if (veld.id === KANALEN_ID) return { ok: false, reden: KANALEN_REDEN };
  // De redenen noemen de instelling erachter, zodat een Admin meteen ziet waar hij de grens aanpast.
  if (gefilterd.length < drempels.minPool) {
    return { ok: false, reden: `Minder dan ${drempels.minPool} Organisaties in de pool (instelling Organisaties in de pool, minimum)` };
  }
  // Bij 0% geldt geen ondergrens voor hoe vaak een kenmerk is ingevuld.
  const minIngevuld = Math.ceil((drempels.minIngevuldPct / 100) * alle.length);
  const ingevuld = alle.length - zonderWaarde(alle, veld);
  if (ingevuld < minIngevuld) {
    return { ok: false, reden: `Minder dan ${minIngevuld} ingevulde waarden (instelling Kenmerk ingevuld, minimum)` };
  }
  if (veld.type === "select") {
    const aantal = selectOpties(gefilterd, veld).length;
    if (aantal > drempels.maxGroepen) {
      return { ok: false, reden: `Meer dan ${drempels.maxGroepen} waarden (instelling Waarden per kenmerk, maximum)` };
    }
    if (aantal < 2) return { ok: false, reden: "Het filter laat één waarde over" };
    return { ok: true };
  }
  const waarden = getalWaarden(gefilterd, veld);
  if (waarden.length < 2 || Math.min(...waarden) === Math.max(...waarden)) {
    return { ok: false, reden: "Er zijn geen twee verschillende waarden" };
  }
  return { ok: true };
}

/* ---------- Statistiek voor de weergaven ---------- */

function gem(w: number[]): number | null {
  return w.length === 0 ? null : w.reduce((a, b) => a + b, 0) / w.length;
}

export interface Verdeling {
  n: number;
  gemiddelde: number | null;
  mediaan: number | null;
  /** Het eerste en derde kwartiel: De middelste helft. */
  q1: number | null;
  q3: number | null;
  min: number | null;
  max: number | null;
  /** Standaardafwijking met n − 1, leeg bij minder dan twee organisaties. */
  sd: number | null;
}

export function verdeling(waarden: number[]): Verdeling {
  if (waarden.length === 0) return { n: 0, gemiddelde: null, mediaan: null, q1: null, q3: null, min: null, max: null, sd: null };
  const g = [...waarden].sort((a, b) => a - b);
  return {
    n: g.length,
    gemiddelde: gem(g),
    mediaan: kwantiel(g, 0.5),
    q1: kwantiel(g, 0.25),
    q3: kwantiel(g, 0.75),
    min: g[0],
    max: g[g.length - 1],
    sd: steekproefSd(g),
  };
}

export interface RijVergelijking {
  rij: BouwblokRij;
  focus: Verdeling;
  rest: Verdeling;
  /** Gemiddelde van de focus min dat van de rest, op één decimaal. */
  verschil: number | null;
  /** De scores van elke organisatie, voor de stippen, met de naam voor hover. */
  stippenFocus: { naam: string; score: number }[];
  stippenRest: { naam: string; score: number }[];
}

export interface Vergelijking {
  rijen: RijVergelijking[];
  overall: { focus: Verdeling; rest: Verdeling; verschil: number | null };
  grootstePlus: { naam: string; verschil: number } | null;
  grootsteMin: { naam: string; verschil: number } | null;
}

const verschilVan = (a: number | null, b: number | null) => (a === null || b === null ? null : rond1(a - b));

/** Groep tegenover de rest en Spreiding binnen de groep (`visualisatie-verkennen.md`, Weergave 1 en 2). */
export function vergelijk(rijen: BouwblokRij[], focus: PoolLid[], rest: PoolLid[]): Vergelijking {
  const perRij: RijVergelijking[] = rijen.map((rij, i) => {
    const stip = (l: PoolLid) => ({ naam: l.organisatie.naam, score: l.scores[i] });
    const f = focus.map(stip).filter((s): s is { naam: string; score: number } => s.score !== null);
    const r = rest.map(stip).filter((s): s is { naam: string; score: number } => s.score !== null);
    const fv = verdeling(f.map((s) => s.score));
    const rv = verdeling(r.map((s) => s.score));
    return { rij, focus: fv, rest: rv, verschil: verschilVan(fv.gemiddelde, rv.gemiddelde), stippenFocus: f, stippenRest: r };
  });
  const overallVan = (l: PoolLid[]) => verdeling(l.map((x) => x.overall).filter((o): o is number => o !== null));
  const of = overallVan(focus);
  const or = overallVan(rest);
  const metVerschil = perRij.filter((r) => r.verschil !== null);
  const plus = metVerschil.reduce<RijVergelijking | null>((m, r) => (m === null || (r.verschil as number) > (m.verschil as number) ? r : m), null);
  const min = metVerschil.reduce<RijVergelijking | null>((m, r) => (m === null || (r.verschil as number) < (m.verschil as number) ? r : m), null);
  return {
    rijen: perRij,
    overall: { focus: of, rest: or, verschil: verschilVan(of.gemiddelde, or.gemiddelde) },
    grootstePlus: plus && (plus.verschil as number) > 0 ? { naam: plus.rij.bouwblok.naam, verschil: plus.verschil as number } : null,
    grootsteMin: min && (min.verschil as number) < 0 ? { naam: min.rij.bouwblok.naam, verschil: min.verschil as number } : null,
  };
}

/* ---------- Alle groepen naast elkaar ---------- */

export interface HeatmapCel {
  /** Gemiddelde van de groep voor deze rij, `null` bij een te kleine groep of zonder scores. */
  gemiddelde: number | null;
  /** Verschil met het gemiddelde van de hele pool, op één decimaal. */
  verschil: number | null;
}

export interface Heatmap {
  /** De hele pool (na de filters): Het gemiddelde per rij en overall. */
  pool: { gemiddelde: (number | null)[]; overall: number | null };
  groepen: { groep: Groep; teKlein: boolean; cellen: HeatmapCel[]; overall: HeatmapCel }[];
}

/** De heatmap (`visualisatie-verkennen.md`, Weergave 3): De groep zelf telt mee in het gemiddelde van de hele pool. */
export function heatmap(rijen: BouwblokRij[], pool: PoolLid[], groepen: Groep[], minGroep: number): Heatmap {
  const poolGem = rijen.map((_, i) => gem(pool.map((l) => l.scores[i]).filter((s): s is number => s !== null)));
  const poolOverall = gem(pool.map((l) => l.overall).filter((o): o is number => o !== null));
  return {
    pool: { gemiddelde: poolGem, overall: poolOverall },
    groepen: groepen.map((groep) => {
      const teKlein = groep.leden.length < minGroep;
      const cel = (waarden: number[], poolWaarde: number | null): HeatmapCel => {
        const g = teKlein ? null : gem(waarden);
        return { gemiddelde: g, verschil: g === null || poolWaarde === null ? null : rond1(g - poolWaarde) };
      };
      return {
        groep,
        teKlein,
        cellen: rijen.map((_, i) =>
          cel(groep.leden.map((l) => l.scores[i]).filter((s): s is number => s !== null), poolGem[i])
        ),
        overall: cel(groep.leden.map((l) => l.overall).filter((o): o is number => o !== null), poolOverall),
      };
    }),
  };
}

/* ---------- Verband met een kenmerk ---------- */

export interface Regressie {
  n: number;
  helling: number;
  snijpunt: number;
  r: number;
}

/** Een rechte lijn door de punten (kleinste kwadraten) en de correlatiecoëfficiënt r. `null` bij minder dan 3 punten of zonder spreiding. */
export function regressie(punten: { x: number; y: number }[]): Regressie | null {
  const n = punten.length;
  if (n < 3) return null;
  const mx = punten.reduce((s, p) => s + p.x, 0) / n;
  const my = punten.reduce((s, p) => s + p.y, 0) / n;
  const sxx = punten.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const syy = punten.reduce((s, p) => s + (p.y - my) ** 2, 0);
  const sxy = punten.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  if (sxx === 0 || syy === 0) return null;
  const helling = sxy / sxx;
  return { n, helling, snijpunt: my - helling * mx, r: sxy / Math.sqrt(sxx * syy) };
}

/** Het woord bij de sterkte van een verband: Onder 0,2 nauwelijks, onder 0,4 zwak, onder 0,6 matig, daarboven sterk. */
export function sterkteWoord(r: number): string {
  const a = Math.abs(r);
  const woord = a < 0.2 ? "nauwelijks" : a < 0.4 ? "zwak" : a < 0.6 ? "matig" : "sterk";
  if (a < 0.2) return woord;
  return `${woord} ${r > 0 ? "positief" : "negatief"}`;
}
