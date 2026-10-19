/**
 * De berekeningen van Verkennen (`visualisatie-verkennen.md`): De pool van een Assessment, de filters uit de organisatievelden,
 * het groeperen met een focus en de statistiek voor de vier weergaven. Pure functies zonder opslag, het scherm slaat niets op.
 * De rekenregels zijn die van de benchmark tussen organisaties (`benchmark.md`): Per organisatie de meest recente Meting die aan
 * `benchmarkMinScans` voldoet, en elke organisatie telt even zwaar mee.
 */
import { Assessment, Kanaal, KpiDefinitie, Meetperiode, Organisatie, ScanUitvoering, VeldDefinitie, VerkenEenheid } from "./types";
import { kanaalIngezet as kanaalIngezetBijPlek, kpiWaardeVan } from "./kpi";
import { getInstellingen } from "./instellingen-store";
import { BouwblokRij, bouwblokRijen, kwantiel, rond1, steekproefSd } from "./visualisatie";
import { bouwblokScoreRuw, overallScoreRuw } from "./scoring";
import {
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  voldoetAanMinScans,
  vergelijkNieuwsteEerst,
  aantalAfgerondInMeting,
  isSamengesteld,
  meetdatumVan,
  toonMeetdatum,
  onderdeelVan,
  STANDAARD_ONDERDEEL,
} from "./metingen";
import { organisatieVelden } from "@/data/organisatie-velden";

/* ---------- Pool ---------- */

export interface PoolLid {
  /** Uniek in de pool: Het id van de organisatie, bij de eenheid Onderdelen dat van de organisatie en de Meting samen. */
  id: string;
  /** De naam in lijsten en tooltips: De organisatie, bij een onderdeel "{Organisatie}, {onderdeel}" (of alleen de organisatie bij "Hele organisatie"). */
  naam: string;
  /** Alleen bij de eenheid Onderdelen. */
  onderdeel?: string;
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
  /** Met een Meetperiode: Het aantal Organisaties (of onderdelen) met een bruikbare Meting, maar niet in de periode. Die doen niet mee. */
  buitenPeriode: number;
}

/**
 * De pool van een Assessment (`visualisatie-verkennen.md`, Pool): Organisaties met `benchmarkToegestaan` die een Meting van het
 * Assessment hebben met minstens `minScans` afgeronde scans. Per organisatie telt de meest recente zo'n Meting.
 */
export function bouwPool(
  organisaties: Organisatie[],
  assessment: Assessment,
  minScans: number,
  eenheid: VerkenEenheid = "organisaties",
  meetperiode?: Meetperiode | null
): Pool {
  const rijen = bouwblokRijen(assessment);
  const { gekozen, zonderToestemming, buitenPeriode } = kiesPoolMetingen(organisaties, assessment.id, minScans, eenheid, meetperiode);
  const leden: PoolLid[] = gekozen.map((lid) => {
    const antwoorden = gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, lid.organisatie, lid.meting);
    return {
      ...lid,
      aantalScans: aantalAfgerondInMeting(lid.organisatie, lid.meting),
      scores: rijen.map((r) => bouwblokScoreRuw(r.bouwblok, antwoorden)),
      overall: overallScoreRuw(assessment, antwoorden),
    };
  });
  return { rijen, leden, zonderToestemming, buitenPeriode };
}

/** De naam van een lid van de pool: De organisatie, of bij een onderdeel "{Organisatie}, {onderdeel}" (alleen de organisatie bij "Hele organisatie"). */
export function poolLidNaam(organisatie: Pick<Organisatie, "naam">, onderdeel: string | undefined): string {
  return !onderdeel || onderdeel === STANDAARD_ONDERDEEL ? organisatie.naam : `${organisatie.naam}, ${onderdeel}`;
}

/** Valt de meetdatum van de Meting in de periode (beide inclusief)? Een Meting zonder meetdatum valt er nooit in. */
export function inMeetperiode(meting: Pick<ScanUitvoering, "meetdatum">, periode: Meetperiode): boolean {
  const datum = meetdatumVan(meting);
  return datum !== null && datum >= periode.van && datum <= periode.totEnMet;
}

/** "12-01-2026 tot en met 10-02-2026", voor de regel in het paneel, het detail, de Lead en de audit-log. */
export function meetperiodeTekst(periode: Meetperiode): string {
  return `${toonMeetdatum(periode.van)} tot en met ${toonMeetdatum(periode.totEnMet)}`;
}

/** Is de periode bruikbaar? Beide datums gevuld en de begindatum niet na de einddatum. */
export function geldigeMeetperiode(periode: Partial<Meetperiode> | null | undefined): periode is Meetperiode {
  return !!periode && !!periode.van && !!periode.totEnMet && periode.van <= periode.totEnMet;
}

/**
 * De Metingen die in de pool komen, zonder scores (`benchmark.md`, Welke Meting telt waar; `visualisatie-verkennen.md`, Pool,
 * Eenheid en Meetperiode). Alleen Metingen met minstens `minScans` afgeronde scans. Bij de eenheid Organisaties telt per organisatie
 * de laatste Meting binnen de Meetperiode, gewoon of samengesteld, en zonder periode de meest recente. Bij Onderdelen tellen alleen
 * gewone Metingen: Per onderdeel (de naam van het onderdeel binnen een organisatie) de laatste Meting binnen de periode, of de meest
 * recente. Een samengestelde Meting doet daar nooit mee, want haar onderdelen zijn de onderliggende Metingen zelf. Alleen
 * organisaties met `benchmarkToegestaan`, de rest telt als "zonder toestemming". Een organisatie (of onderdeel) met een bruikbare
 * Meting maar niet in de periode telt als "buiten de periode".
 */
export function kiesPoolMetingen(
  organisaties: Organisatie[],
  assessmentId: string,
  minScans: number,
  eenheid: VerkenEenheid,
  meetperiode?: Meetperiode | null
): { gekozen: Omit<PoolLid, "aantalScans" | "scores" | "overall">[]; zonderToestemming: number; buitenPeriode: number } {
  const gekozen: Omit<PoolLid, "aantalScans" | "scores" | "overall">[] = [];
  let zonderToestemming = 0;
  let buitenPeriode = 0;
  const periode = geldigeMeetperiode(meetperiode) ? meetperiode : null;
  for (const organisatie of organisaties) {
    const kandidaten = organisatie.scanUitvoeringen
      .filter(
        (m) =>
          m.assessmentId === assessmentId &&
          (eenheid === "organisaties" || !isSamengesteld(m)) &&
          voldoetAanMinScans(organisatie, m, minScans)
      )
      .sort(vergelijkNieuwsteEerst);
    if (kandidaten.length === 0) continue;
    if (!organisatie.benchmarkToegestaan) {
      zonderToestemming += 1;
      continue;
    }
    if (eenheid === "organisaties") {
      const meting = periode ? kandidaten.find((m) => inMeetperiode(m, periode)) : kandidaten[0];
      if (!meting) {
        buitenPeriode += 1;
        continue;
      }
      gekozen.push({ id: organisatie.id, naam: organisatie.naam, organisatie, meting });
      continue;
    }
    const alleOnderdelen = new Set(kandidaten.map(onderdeelVan));
    const perOnderdeel = new Map<string, ScanUitvoering>();
    for (const m of kandidaten) {
      if (periode && !inMeetperiode(m, periode)) continue;
      if (!perOnderdeel.has(onderdeelVan(m))) perOnderdeel.set(onderdeelVan(m), m);
    }
    buitenPeriode += alleOnderdelen.size - perOnderdeel.size;
    for (const meting of perOnderdeel.values()) {
      const onderdeel = onderdeelVan(meting);
      gekozen.push({
        id: `${organisatie.id}:${meting.id}`,
        naam: poolLidNaam(organisatie, onderdeel),
        onderdeel,
        organisatie,
        meting,
      });
    }
  }
  gekozen.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  return { gekozen, zonderToestemming, buitenPeriode };
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
  /**
   * Alleen bij een KPI (`datamodel.md`, KPI's en kanalen; `visualisatie-verkennen.md`, KPI's als kenmerk): De KPI en het gekozen
   * kanaal (`null` is Algemeen). De waarde van een lid is die van zijn plek: Algemeen bij de eenheid Organisaties, het onderdeel bij
   * Onderdelen, bij dat kanaal. Zonder waarde valt het lid af, er is geen terugval op Algemeen.
   */
  kpi?: { kpiId: string; kanaalId: string | null };
  /** Alleen bij een KPI: Mag hij per kanaal een waarde hebben? Dan staat er een groep Kanaal bij het kenmerk. */
  kpiPerKanaal?: boolean;
}

/** Het afgeleide kenmerk "Ingezette kanalen": Alleen een filter, geen groepering (`visualisatie-verkennen.md`, Kenmerken en filters). */
export const KANALEN_ID = "__kanalen";
export const KANALEN_LABEL = "Volume en klantbasis › Ingezette kanalen";

/** Alle velden die als filter kunnen dienen: De bladeren van de organisatievelden, select of getal (percentage telt als getal). */
export function filterVelden(velden: VeldDefinitie[] = organisatieVelden, kpis: KpiDefinitie[] = getInstellingen().kpiDefinities): FilterVeld[] {
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
  // De KPI's zijn geen organisatievelden meer maar definities met waarden per plek en kanaal: Eén regel per KPI, op volgorde.
  for (const kpi of [...kpis].sort((a, b) => a.volgorde - b.volgorde)) {
    uit.push({
      id: `kpis.${kpi.id}`,
      label: `KPI's › ${kpi.naam}`,
      pad: ["kpis", kpi.id],
      type: "getal",
      eenheid: kpi.eenheid && kpi.eenheid !== "aantal" ? kpi.eenheid : undefined,
      kpi: { kpiId: kpi.id, kanaalId: null },
      kpiPerKanaal: kpi.perKanaal,
    });
  }
  return uit;
}

/** Het veld met het gekozen kanaal (alleen bij een KPI met `perKanaal`): Zonder kanaal is het Algemeen. */
export function metKanaal(veld: FilterVeld, kanaalId: string | null): FilterVeld {
  return veld.kpi && veld.kpiPerKanaal ? { ...veld, kpi: { ...veld.kpi, kanaalId } } : veld;
}

/** Het afgeleide veld Ingezette kanalen, naast de organisatievelden in het menu Kenmerk toevoegen. */
export function kanalenVeld(): FilterVeld {
  return { id: KANALEN_ID, label: KANALEN_LABEL, pad: [], type: "select" };
}

/** Alleen bij de eenheid Onderdelen: De kenmerken Organisatie en Onderdeel (`visualisatie-verkennen.md`, Eenheid). */
export const ORGANISATIE_ID = "__organisatie";
export const ONDERDEEL_ID = "__onderdeel";
export const ORGANISATIE_ONDERDEEL_GROEP = "Organisatie en onderdeel";

export function onderdeelVelden(): FilterVeld[] {
  return [
    { id: ORGANISATIE_ID, label: `${ORGANISATIE_ONDERDEEL_GROEP} › Organisatie`, pad: [], type: "select" },
    { id: ONDERDEEL_ID, label: `${ORGANISATIE_ONDERDEEL_GROEP} › Onderdeel`, pad: [], type: "select" },
  ];
}

/**
 * De waarde van een kenmerk voor een lid van de pool. Een organisatieveld komt van de organisatie, Organisatie is haar id (de
 * naam staat in `waardeLabel`) en Onderdeel de naam van het onderdeel.
 */
export function lidWaarde(lid: Pick<PoolLid, "organisatie" | "onderdeel"> & Partial<Pick<PoolLid, "meting">>, veld: FilterVeld): unknown {
  if (veld.id === ORGANISATIE_ID) return lid.organisatie.id;
  if (veld.id === ONDERDEEL_ID) return lid.onderdeel;
  if (veld.kpi) return kpiWaardeVan(lid.organisatie, veld.kpi.kpiId, { onderdeelId: plekVan(lid), kanaalId: veld.kpi.kanaalId }) ?? undefined;
  return kenmerkWaarde(lid.organisatie, veld.pad);
}

/** De plek van een lid voor een KPI-waarde: Algemeen bij de eenheid Organisaties, het onderdeel van de Meting bij Onderdelen. */
export function plekVan(lid: Pick<PoolLid, "onderdeel"> & Partial<Pick<PoolLid, "meting">>): string | null {
  return lid.onderdeel === undefined ? null : (lid.meting?.onderdeelId ?? null);
}

/** De tekst van een waarde bij een kenmerk: Voor Organisatie de naam bij het id, anders de waarde zelf. */
export function waardeLabel(leden: Pick<PoolLid, "organisatie">[], veld: Pick<FilterVeld, "id">, waarde: string): string {
  if (veld.id !== ORGANISATIE_ID) return waarde;
  return leden.find((l) => l.organisatie.id === waarde)?.organisatie.naam ?? waarde;
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
export function ingevuldAantal(organisaties: Pick<Organisatie, "kenmerken" | "kpiWaarden">[], veld: FilterVeld): number {
  // Een KPI telt de Organisaties met een waarde bij Algemeen voor het gekozen kanaal.
  if (veld.kpi) {
    const k = veld.kpi;
    return organisaties.filter((o) => kpiWaardeVan(o, k.kpiId, { onderdeelId: null, kanaalId: k.kanaalId }) !== null).length;
  }
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

/** De kanalen voor het filter "Ingezette kanalen": De lijst van de Admin (`datamodel.md`, KPI's en kanalen), op volgorde. */
export function kanaalVelden(kanalen: Kanaal[] = getInstellingen().kanalen): { id: string; naam: string; pad: string[] }[] {
  return [...kanalen].sort((a, b) => a.volgorde - b.volgorde).map((k) => ({ id: k.id, naam: k.naam, pad: [] }));
}

/**
 * Is een kanaal ingezet bij een lid? Een waarde boven 0 voor de KPI Contacten per jaar bij de plek van het lid (Algemeen bij
 * Organisaties, het onderdeel bij Onderdelen), niet ingezet bij 0, onbekend bij een leeg veld (`visualisatie-verkennen.md`, Filters).
 * Geeft `null` bij onbekend.
 */
export function kanaalIngezet(lid: Pick<PoolLid, "organisatie" | "onderdeel"> & Partial<Pick<PoolLid, "meting">>, kanaalId: string): boolean | null {
  return kanaalIngezetBijPlek(lid.organisatie, kanaalId, plekVan(lid));
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
      const w = lidWaarde(lid, veld);
      if (typeof w !== "string" || !gekozen.includes(w)) return false;
    }
    for (const [id, [min, max]] of Object.entries(stand.bereik)) {
      const veld = perId.get(id);
      if (!veld) continue;
      const w = getalWaarde(lidWaarde(lid, veld));
      if (w === null || w < min || w > max) return false;
    }
    for (const kanaal of kanalen) if (kanaalIngezet(lid, kanaal.id) !== true) return false;
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
    const w = lidWaarde(lid, veld);
    if (typeof w === "string" && w !== "") telling.set(w, (telling.get(w) ?? 0) + 1);
  }
  // Bij Organisatie alleen de organisaties met meer dan één onderdeel: Met één onderdeel is er niets om naast elkaar te zetten.
  if (veld.id === ORGANISATIE_ID) for (const [w, n] of [...telling]) if (n < 2) telling.delete(w);
  return [...telling.entries()]
    .map(([waarde, aantal]) => ({ waarde, aantal }))
    .sort((a, b) =>
      b.aantal - a.aantal ||
      waardeLabel(leden, veld, a.waarde).localeCompare(waardeLabel(leden, veld, b.waarde), "nl")
    );
}


/** De ingevulde getallen van een veld in de pool, en hoeveel organisaties het veld hebben ingevuld. */
export function getalWaarden(leden: PoolLid[], veld: FilterVeld): number[] {
  return leden.map((l) => getalWaarde(lidWaarde(l, veld))).filter((w): w is number => w !== null);
}

/** Per kanaal het aantal organisaties in de pool dat het inzet. */
export function kanaalAantallen(leden: PoolLid[]): { id: string; naam: string; aantal: number }[] {
  return kanaalVelden().map((k) => ({ ...k, aantal: leden.filter((l) => kanaalIngezet(l, k.id) === true).length }));
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
      const w = lidWaarde(lid, veld);
      if (typeof w !== "string" || w === "") continue;
      per.set(w, [...(per.get(w) ?? []), lid]);
    }
    return [...per.entries()]
      .map(([waarde, l]) => {
        const kort = veld.id === ORGANISATIE_ID ? waardeLabel(leden, veld, waarde) : naamVan(veld.id, waarde);
        const volledig = veld.id === ORGANISATIE_ID ? undefined : kort !== waarde ? waarde : undefined;
        return { sleutel: waarde, naam: kort, ...(volledig ? { volledigeNaam: volledig } : {}), leden: l };
      })
      .sort((a, b) => b.leden.length - a.leden.length || a.naam.localeCompare(b.naam, "nl"));
  }
  const onder: PoolLid[] = [];
  const boven: PoolLid[] = [];
  for (const lid of leden) {
    const w = getalWaarde(lidWaarde(lid, veld));
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
    const w = lidWaarde(l, veld);
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
  /** De reden als het vorige kenmerk er niet meer is, in plaats van "is verwijderd" (bijvoorbeeld bij het wisselen van eenheid). */
  vorigeWeg?: string;
  /** "Organisaties" of "onderdelen". */
  eenheidWoord?: string;
  poolGrootte: number;
  /** De pool zonder filters: Een te kleine pool door de filters is iets anders dan een te kleine pool. */
  poolTotaal: number;
  minPool: number;
}): GroeperingsBesluit {
  const eerste = invoer.kenmerken.find((k) => k.bruikbaarheid.ok);
  if (invoer.vorige === null) return { gekozen: eerste?.id ?? null, melding: null };
  const huidig = invoer.kenmerken.find((k) => k.id === invoer.vorige);
  if (huidig?.bruikbaarheid.ok) return { gekozen: huidig.id, melding: null };
  const reden = huidig
    ? (huidig.bruikbaarheid.reden ?? "Het kenmerk kan niet groeperen")
    : (invoer.vorigeWeg ?? `${invoer.vorigeNaam ?? "Het kenmerk"} is verwijderd`);
  if (eerste) return { gekozen: eerste.id, melding: `${reden}. De groepering staat nu op ${eerste.naam}.` };
  if (invoer.poolGrootte < invoer.minPool && invoer.poolTotaal >= invoer.minPool) {
    return {
      gekozen: null,
      melding: `Met deze filters zit er ${invoer.poolGrootte} ${
        invoer.poolGrootte === 1 ? (invoer.eenheidWoord === "onderdelen" ? "onderdeel" : "Organisatie") : (invoer.eenheidWoord ?? "Organisaties")
      } in de pool. Dat is te weinig om te vergelijken. Haal een filter weg.`,
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
  drempels: GroeperDrempels = STANDAARD_GROEPER_DREMPELS,
  /** "Organisaties", of "onderdelen" bij de eenheid Onderdelen. */
  eenheidWoord = "Organisaties"
): Bruikbaarheid {
  // Ingezette kanalen kan nooit groeperen: Een organisatie zet meerdere kanalen in en valt dan in meer dan één groep.
  if (veld.id === KANALEN_ID) return { ok: false, reden: KANALEN_REDEN };
  // De redenen noemen de instelling erachter, zodat een Admin meteen ziet waar hij de grens aanpast.
  if (gefilterd.length < drempels.minPool) {
    return { ok: false, reden: `Minder dan ${drempels.minPool} ${eenheidWoord} in de pool (instelling Organisaties in de pool, minimum)` };
  }
  // Onderdelen heten per organisatie anders: Groeperen op Onderdeel kan alleen binnen één organisatie.
  if (veld.id === ONDERDEEL_ID && new Set(gefilterd.map((l) => l.organisatie.id)).size > 1) {
    return { ok: false, reden: "Onderdelen heten per Organisatie anders. Filter eerst op één Organisatie" };
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
    const stip = (l: PoolLid) => ({ naam: l.naam, score: l.scores[i] });
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
