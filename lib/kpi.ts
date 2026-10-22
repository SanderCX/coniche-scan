/**
 * KPI's en kanalen (`datamodel.md`, KPI's en kanalen, voorstel van 19 oktober 2026). Pure functies zonder opslag.
 *
 * Een KPI-waarde hoort bij een plek: De hele organisatie (`onderdeelId: null`, "Algemeen"), een Onderdeel, of een kanaal binnen een
 * van die twee (`kanaalId: null` is Algemeen bij het kanaal, alle kanalen samen). Algemeen is een gewone waarde: De app rekent hem
 * nooit uit de onderdelen of de kanalen en overschrijft hem nooit. Er is geen weging op volume en geen peildatum.
 */
import { Kanaal, KpiDefinitie, KpiWaarde, Organisatie } from "./types";

/** De startlijst met kanalen, in deze volgorde. De id's zijn de id's van de zes velden die ze vervangen (`kanaal-call`, enz.). */
export const STANDAARD_KANALEN: Kanaal[] = ["Call", "Voicebot", "Livechat", "Chatbot", "E-mail", "Whatsapp"].map((naam, i) => ({
  id: `kanaal-${naam.toLowerCase()}`,
  naam,
  volgorde: i + 1,
}));

/** De KPI Contacten per jaar: Een kanaal telt als ingezet bij een waarde boven 0 voor deze KPI. */
export const KPI_CONTACTEN = "contacten";

/** De startset KPI's, aanpasbaar door een Admin. De id's `aht`, `nps`, `csat`, `sla` en `ftr` zijn de oude veld-id's (`kpis.aht`). */
export const STANDAARD_KPIS: KpiDefinitie[] = [
  { id: KPI_CONTACTEN, naam: "Contacten per jaar", eenheid: "aantal", perOnderdeel: true, perKanaal: true, volgorde: 1 },
  { id: "aht", naam: "AHT", eenheid: "s", perOnderdeel: true, perKanaal: true, volgorde: 2 },
  { id: "nps", naam: "NPS", eenheid: null, perOnderdeel: true, perKanaal: true, volgorde: 3 },
  { id: "csat", naam: "CSAT", eenheid: null, perOnderdeel: true, perKanaal: true, volgorde: 4 },
  { id: "sla", naam: "SLA", eenheid: "%", perOnderdeel: true, perKanaal: true, volgorde: 5 },
  { id: "ftr", naam: "FTR", eenheid: "%", perOnderdeel: true, perKanaal: true, volgorde: 6 },
];

/** De plek van een waarde: Een Onderdeel (of `null` voor Algemeen) en een kanaal (of `null` voor Algemeen). */
export interface KpiPlek {
  onderdeelId: string | null;
  kanaalId: string | null;
}

export function kpiWaarden(organisatie: Pick<Organisatie, "kpiWaarden">): KpiWaarde[] {
  return organisatie.kpiWaarden ?? [];
}

/** De waarde van een KPI op een plek, of `null` als er geen is. Een lege cel is geen record, 0 is een geldige waarde. */
export function kpiWaardeVan(organisatie: Pick<Organisatie, "kpiWaarden">, kpiId: string, plek: KpiPlek): number | null {
  const w = kpiWaarden(organisatie).find((x) => x.kpiId === kpiId && x.onderdeelId === plek.onderdeelId && x.kanaalId === plek.kanaalId);
  return w ? w.waarde : null;
}

/** Mag deze KPI op deze plek een waarde hebben? Algemeen mag altijd. */
export function kpiMagOpPlek(kpi: Pick<KpiDefinitie, "perOnderdeel" | "perKanaal">, plek: KpiPlek): boolean {
  return (plek.onderdeelId === null || kpi.perOnderdeel) && (plek.kanaalId === null || kpi.perKanaal);
}

export interface KpiWijziging extends KpiPlek {
  kpiId: string;
  /** `null` maakt de cel leeg: Het record verdwijnt. */
  waarde: number | null;
}

export interface KpiWijzigingTelling {
  ingevuld: number;
  gewijzigd: number;
  gewist: number;
}

/**
 * Past waarden toe op de organisatie (muteert): Eén waarde per combinatie van Onderdeel, kanaal en KPI. Een lege waarde wist het
 * record. Geeft terug hoeveel er nieuw is ingevuld, gewijzigd en gewist, voor de audit-log.
 */
export function pasKpiWijzigingenToe(organisatie: Organisatie, wijzigingen: KpiWijziging[]): KpiWijzigingTelling {
  const telling: KpiWijzigingTelling = { ingevuld: 0, gewijzigd: 0, gewist: 0 };
  let lijst = [...kpiWaarden(organisatie)];
  for (const w of wijzigingen) {
    const index = lijst.findIndex((x) => x.kpiId === w.kpiId && x.onderdeelId === w.onderdeelId && x.kanaalId === w.kanaalId);
    if (w.waarde === null) {
      if (index !== -1) {
        lijst = lijst.filter((_, i) => i !== index);
        telling.gewist += 1;
      }
      continue;
    }
    if (index === -1) {
      lijst.push({ organisatieId: organisatie.id, onderdeelId: w.onderdeelId, kanaalId: w.kanaalId, kpiId: w.kpiId, waarde: w.waarde });
      telling.ingevuld += 1;
    } else if (lijst[index].waarde !== w.waarde) {
      lijst[index] = { ...lijst[index], waarde: w.waarde };
      telling.gewijzigd += 1;
    }
  }
  organisatie.kpiWaarden = lijst;
  return telling;
}

/** Een getal uit een invoerveld, met een komma of een punt als decimaalteken. `null` bij leeg, `NaN` bij iets wat geen getal is. */
export function parseKpiGetal(tekst: string): number | null {
  const t = tekst.trim();
  if (t === "") return null;
  if (!/^-?\d+([.,]\d+)?$/.test(t)) return Number.NaN;
  return Number(t.replace(",", "."));
}

/** Een waarde voor in een cel: Met een komma als decimaalteken. */
export function toonKpiGetal(waarde: number | null): string {
  return waarde === null ? "" : String(waarde).replace(".", ",");
}

/**
 * Kolomkop van de KPI-tabel: "n van m ingevuld". `n` is het aantal KPI's met een waarde bij Algemeen (het kanaal) voor deze plek, `m`
 * het aantal KPI's dat op die plek mag (bij Algemeen alle KPI's, bij een Onderdeel de KPI's met `perOnderdeel`).
 */
export function kpiIngevuldTelling(
  organisatie: Pick<Organisatie, "kpiWaarden">,
  kpis: KpiDefinitie[],
  onderdeelId: string | null
): { n: number; m: number } {
  const mogelijk = kpis.filter((k) => kpiMagOpPlek(k, { onderdeelId, kanaalId: null }));
  const ingevuld = mogelijk.filter((k) => kpiWaardeVan(organisatie, k.id, { onderdeelId, kanaalId: null }) !== null);
  return { n: ingevuld.length, m: mogelijk.length };
}

/** De kanalen met minstens één waarde bij deze plek, in de volgorde van de kanalenlijst. Bij `kpiId` alleen voor die KPI. */
export function kanalenMetWaarde(
  organisatie: Pick<Organisatie, "kpiWaarden">,
  kanalen: Kanaal[],
  onderdeelId: string | null,
  kpiId?: string
): Kanaal[] {
  const ids = new Set(
    kpiWaarden(organisatie)
      .filter((w) => w.onderdeelId === onderdeelId && w.kanaalId !== null && (kpiId === undefined || w.kpiId === kpiId))
      .map((w) => w.kanaalId as string)
  );
  return [...kanalen].sort((a, b) => a.volgorde - b.volgorde).filter((k) => ids.has(k.id));
}

/**
 * Is een kanaal ingezet bij deze plek? Een waarde boven 0 voor de KPI Contacten per jaar is ingezet, 0 is niet ingezet en een leeg
 * veld is onbekend (`null`): Onbekend telt niet als "niet ingezet" (`visualisatie-verkennen.md`, Ingezette kanalen).
 */
export function kanaalIngezet(organisatie: Pick<Organisatie, "kpiWaarden">, kanaalId: string, onderdeelId: string | null): boolean | null {
  const w = kpiWaardeVan(organisatie, KPI_CONTACTEN, { onderdeelId, kanaalId });
  return w === null ? null : w > 0;
}

/** Het aantal waarden dat een vlag (`perOnderdeel` of `perKanaal`) van een KPI vasthoudt, over alle Organisaties. */
export function aantalWaardenOpNiveau(organisaties: Pick<Organisatie, "kpiWaarden">[], kpiId: string, niveau: "onderdeel" | "kanaal"): number {
  let n = 0;
  for (const o of organisaties) {
    for (const w of kpiWaarden(o)) {
      if (w.kpiId !== kpiId) continue;
      if (niveau === "onderdeel" ? w.onderdeelId !== null : w.kanaalId !== null) n += 1;
    }
  }
  return n;
}

/** Het aantal waarden en het aantal Organisaties dat een kanaal heeft, voor de bevestiging bij verwijderen. */
export function gevolgenKanaalVerwijderen(organisaties: Pick<Organisatie, "kpiWaarden">[], kanaalId: string): { waarden: number; organisaties: number } {
  let waarden = 0;
  let orgs = 0;
  for (const o of organisaties) {
    const n = kpiWaarden(o).filter((w) => w.kanaalId === kanaalId).length;
    waarden += n;
    if (n > 0) orgs += 1;
  }
  return { waarden, organisaties: orgs };
}

/**
 * De overgang van wat er is gebouwd (`datamodel.md`, KPI's en kanalen, Overgang): De vijf KPI-velden in `kenmerken.kpis` en de zes
 * getalvelden voor contacten per kanaal worden `KpiWaarde`, Algemeen bij het Onderdeel en, bij de contacten, met het kanaal erbij. Wat
 * geen getal is ("niet van toepassing") wordt 0, wat voor Verkennen hetzelfde is. Daarna staan ze niet meer in `kenmerken`.
 * Idempotent. Muteert de organisatie.
 */
export function migreerKpiWaarden(organisatie: Organisatie): void {
  const kenmerken = organisatie.kenmerken;
  if (!kenmerken || typeof kenmerken !== "object") return;
  const nieuw: KpiWijziging[] = [];
  const getal = (w: unknown): number | null => {
    if (typeof w === "number" && Number.isFinite(w)) return w;
    if (typeof w === "string") {
      const t = w.trim();
      if (t === "") return null;
      const n = Number(t.replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    }
    return null;
  };
  const kpis = kenmerken["kpis"];
  if (kpis && typeof kpis === "object") {
    for (const [kpiId, w] of Object.entries(kpis as Record<string, unknown>)) {
      const n = getal(w);
      if (n !== null) nieuw.push({ kpiId, onderdeelId: null, kanaalId: null, waarde: n });
    }
    delete kenmerken["kpis"];
  }
  const volume = kenmerken["volume-klantbasis"];
  if (volume && typeof volume === "object") {
    const contacten = (volume as Record<string, unknown>)["contacten-per-jaar"];
    if (contacten && typeof contacten === "object") {
      for (const [kanaalId, w] of Object.entries(contacten as Record<string, unknown>)) {
        const n = getal(w);
        if (n !== null) nieuw.push({ kpiId: KPI_CONTACTEN, onderdeelId: null, kanaalId, waarde: n });
      }
      delete (volume as Record<string, unknown>)["contacten-per-jaar"];
    }
  }
  if (nieuw.length === 0) return;
  // Een waarde die er al is (een eerdere overgang of invoer) gaat voor.
  const bestaand = new Set(kpiWaarden(organisatie).map((w) => `${w.kpiId}|${w.onderdeelId}|${w.kanaalId}`));
  const toe = nieuw.filter((w) => !bestaand.has(`${w.kpiId}|${w.onderdeelId}|${w.kanaalId}`));
  pasKpiWijzigingenToe(organisatie, toe);
}

/* ---------- Export en import (`export-csv.md`, `import-scans.md`) ---------- */

/** Eén regel in de JSON-kolom `organisatie_kpis` van de CSV: Onderdeel en kanaal als naam, leeg bij Algemeen. */
export interface KpiExportRegel {
  onderdeel: string;
  kanaal: string;
  /** De id van de KPI, stabiel bij een hernoeming. */
  kpi: string;
  /** De naam van de KPI, leesbaarheid en terugval bij het lezen. */
  kpiNaam?: string;
  waarde: number;
}

/** De KPI-waarden van een Organisatie als regels voor de CSV. De volgorde is die van de KPI's, dan Algemeen, onderdelen en kanalen. */
export function kpiExportRegels(
  organisatie: Pick<Organisatie, "kpiWaarden" | "onderdelen">,
  kpis: KpiDefinitie[],
  kanalen: Kanaal[]
): KpiExportRegel[] {
  const onderdeelNaam = (id: string | null) => (id === null ? "" : (organisatie.onderdelen ?? []).find((o) => o.id === id)?.naam);
  const kanaalNaam = (id: string | null) => (id === null ? "" : kanalen.find((k) => k.id === id)?.naam);
  const kpiIndex = (id: string) => kpis.find((k) => k.id === id)?.volgorde ?? 999;
  const regels: KpiExportRegel[] = [];
  for (const w of [...kpiWaarden(organisatie)].sort((a, b) => kpiIndex(a.kpiId) - kpiIndex(b.kpiId))) {
    const onderdeel = onderdeelNaam(w.onderdeelId);
    const kanaal = kanaalNaam(w.kanaalId);
    // Een waarde van een Onderdeel of kanaal dat niet meer bestaat, heeft niets om naar te verwijzen.
    if (onderdeel === undefined || kanaal === undefined) continue;
    regels.push({ onderdeel, kanaal, kpi: w.kpiId, kpiNaam: kpis.find((k) => k.id === w.kpiId)?.naam, waarde: w.waarde });
  }
  return regels;
}

/** De regels uit de kolom `organisatie_kpis`, of `null` als het geen geldige lijst is. Een regel zonder KPI of getal valt weg. */
export function leesKpiExport(tekst: string): KpiExportRegel[] | null {
  let ruw: unknown;
  try {
    ruw = JSON.parse(tekst);
  } catch {
    return null;
  }
  if (!Array.isArray(ruw)) return null;
  const regels: KpiExportRegel[] = [];
  for (const r of ruw as Record<string, unknown>[]) {
    if (!r || typeof r !== "object" || typeof r.waarde !== "number" || !Number.isFinite(r.waarde)) continue;
    const kpi = typeof r.kpi === "string" ? r.kpi : typeof r.kpiNaam === "string" ? r.kpiNaam : "";
    if (!kpi) continue;
    regels.push({
      onderdeel: typeof r.onderdeel === "string" ? r.onderdeel : "",
      kanaal: typeof r.kanaal === "string" ? r.kanaal : "",
      kpi,
      ...(typeof r.kpiNaam === "string" ? { kpiNaam: r.kpiNaam } : {}),
      waarde: r.waarde,
    });
  }
  return regels;
}

/**
 * Past de regels van een eigen export toe op een nieuwe Organisatie (muteert). De KPI wordt gezocht op id en dan op naam, het kanaal
 * op naam en het Onderdeel op naam (hoofdletterongevoelig, een onbekend Onderdeel ontstaat). Een regel met een onbekende KPI of een
 * onbekend kanaal wordt overgeslagen. Geeft het aantal overgeslagen regels.
 */
export function pasKpiExportToe(
  organisatie: Organisatie,
  regels: KpiExportRegel[],
  kpis: KpiDefinitie[],
  kanalen: Kanaal[],
  zorgVoorOnderdeel: (naam: string) => string | null
): number {
  const gelijk = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const wijzigingen: KpiWijziging[] = [];
  let overgeslagen = 0;
  for (const r of regels) {
    const kpi = kpis.find((k) => k.id === r.kpi) ?? kpis.find((k) => gelijk(k.naam, r.kpiNaam ?? r.kpi));
    const kanaal = r.kanaal.trim() === "" ? null : (kanalen.find((k) => gelijk(k.naam, r.kanaal)) ?? undefined);
    if (!kpi || kanaal === undefined) {
      overgeslagen += 1;
      continue;
    }
    const onderdeelId = r.onderdeel.trim() === "" ? null : zorgVoorOnderdeel(r.onderdeel);
    wijzigingen.push({ kpiId: kpi.id, onderdeelId, kanaalId: kanaal === null ? null : kanaal.id, waarde: r.waarde });
  }
  pasKpiWijzigingenToe(organisatie, wijzigingen);
  return overgeslagen;
}
