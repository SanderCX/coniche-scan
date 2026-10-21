import { useSyncExternalStore } from "react";
import { Kanaal, KpiDefinitie, ScanInvulling } from "./types";
import { STANDAARD_KANALEN, STANDAARD_KPIS } from "./kpi";
import type { KorteNamen } from "./korte-namen";
import { haalServerKopieOp, stuurNaarServer } from "./server-sync";
import { logAudit } from "./audit-store";

/**
 * Globale instellingen (`beheerpagina.md` punt 4, `datamodel.md` deel 2,
 * Bewaartermijn ingevulde scans): twee getallen, door een Admin te
 * bepalen, gelden voor de hele omgeving, niet per organisatie. Zelfde
 * localStorage-patroon als `lib/algemene-teksten-store.ts`.
 */
export interface Instellingen {
  /** Aantal dagen na `ScanInvulling.afgerondOp` waarna een scan als "oud" geldt. `null` = geen termijn ingesteld, spec heeft bewust geen default. */
  bewaarTermijnDagen: number | null;
  /** Met hoeveel dagen een "Verlengen"-actie de melding uitstelt. */
  verlengTermijnDagen: number | null;
  /**
   * Minimale groepsgrootte per Assessment in een benchmark, inclusief de organisatie van de view, om die view aan een
   * Lead te mogen toewijzen (`benchmark.md`, Drempels). Startwaarde 5.
   */
  benchmarkMinOrganisaties: number;
  /** Minimaal aantal afgeronde scans dat een Meting moet hebben om in een benchmark gekozen te worden. Startwaarde 3. */
  benchmarkMinScans: number;
  /**
   * Niveau 3 (binnen een Meting): Het minimale aantal afgeronde scans in de Meting, inclusief de scan van de view, om die view
   * aan een Lead te mogen toewijzen en voor de ondergrens in de weergave. Voorstel, startwaarde 5.
   */
  benchmarkMinRespondenten: number;
  /**
   * Niveau 2 met de lezing Naast elkaar (`benchmark.md`, Niveau 2, Lezing): Het aantal dagen tussen de oudste en de nieuwste
   * meetdatum waarboven de Admin een waarschuwing krijgt. Geen blokkade. Voorstel, startwaarde 90.
   */
  benchmarkMaxDagenTussenMetingen: number;
  /**
   * Verkennen (`visualisatie-verkennen.md`, Groeperen en focus): Een groep met minder organisaties dan dit is gestreept en krijgt in
   * de heatmap geen cijfers. Voorstel, startwaarde 3.
   */
  verkennenMinGroep: number;
  /** Heeft de focus of de rest minder organisaties dan dit, dan staat er een waarschuwing. Geen blokkade. Startwaarde 5. */
  verkennenMinVergelijking: number;
  /** Bij minder organisaties in de pool kan er niet gegroepeerd worden. Startwaarde 6. */
  verkennenMinPool: number;
  /** Een select-kenmerk met meer verschillende waarden in de pool kan niet groeperen. Startwaarde 12. */
  verkennenMaxGroepen: number;
  /** Een kenmerk dat bij een lager percentage van de organisaties in het Assessment is ingevuld, kan niet groeperen. Startwaarde 40. */
  verkennenMinIngevuldPct: number;
  /**
   * Digitale Spanningsmeter (`datamodel.md`, Instellingen): Het minimale aantal afgeronde scans van een rolgroep om in de
   * uitsplitsing per rol te staan, zodat antwoorden anoniem blijven. Geheel getal van minstens 1, startwaarde 3.
   */
  spanningMinPerRol: number;
  /**
   * De korte namen voor veldnamen en waarden (`datamodel.md`, Korte namen). Ze staan hier, bij de instellingen, omdat het
   * weergavenamen zijn en de organisatievelden zelf vaste data zijn.
   */
  korteNamen: KorteNamen;
  /** De KPI's en op welke plekken ze een waarde mogen hebben (`datamodel.md`, KPI's en kanalen). Beheerd door een Admin. */
  kpiDefinities: KpiDefinitie[];
  /** De kanalen, één lijst voor het hele platform. Beheerd door een Admin. */
  kanalen: Kanaal[];
}

const STANDAARDWAARDEN: Instellingen = {
  bewaarTermijnDagen: null,
  verlengTermijnDagen: null,
  benchmarkMinOrganisaties: 5,
  benchmarkMinScans: 3,
  benchmarkMinRespondenten: 5,
  benchmarkMaxDagenTussenMetingen: 90,
  verkennenMinGroep: 3,
  verkennenMinVergelijking: 5,
  verkennenMinPool: 6,
  verkennenMaxGroepen: 12,
  verkennenMinIngevuldPct: 40,
  spanningMinPerRol: 3,
  korteNamen: { velden: {}, waarden: [] },
  kpiDefinities: STANDAARD_KPIS,
  kanalen: STANDAARD_KANALEN,
};

const KEY = "coniche-scan:instellingen";
const SERVER_SLEUTEL = "instellingen";
const SERVER_SENTINEL = "__server__";

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void {
  listeners.forEach((l) => l());
}
function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  // Niet meteen pushen naar de server, zie dezelfde kanttekening in
  // lib/db.ts (race met `haalServerKopieOp`'s async ophaalronde).
  const seed = JSON.stringify(STANDAARDWAARDEN);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

// Bij het laden van de pagina: eenmalig de lokale, host-brede serverkopie
// ophalen zodat elke browser op dit apparaat met dezelfde data start
// (lib/server-sync.ts).
if (typeof window !== "undefined") {
  haalServerKopieOp(SERVER_SLEUTEL, KEY, emitChange);
}

function parseSnapshot(snapshot: string): Instellingen {
  if (snapshot === SERVER_SENTINEL) return { ...STANDAARDWAARDEN };
  try {
    const waarden = JSON.parse(snapshot) as Partial<Instellingen> & { verkennenWaarschuwingGroep?: number };
    // `verkennenWaarschuwingGroep` is hernoemd naar `verkennenMinVergelijking` (`visualisatie-verkennen.md`, Drempels).
    const { verkennenWaarschuwingGroep: oud, ...rest } = waarden;
    return {
      ...STANDAARDWAARDEN,
      ...(oud !== undefined && rest.verkennenMinVergelijking === undefined ? { verkennenMinVergelijking: oud } : {}),
      ...rest,
      // Ontbreekt bij instellingen van vóór de KPI's en kanalen: De startset geldt.
      kpiDefinities: Array.isArray(rest.kpiDefinities) && rest.kpiDefinities.length > 0 ? rest.kpiDefinities : STANDAARD_KPIS,
      kanalen: Array.isArray(rest.kanalen) && rest.kanalen.length > 0 ? rest.kanalen : STANDAARD_KANALEN,
    };
  } catch {
    return { ...STANDAARDWAARDEN };
  }
}

export function useInstellingen(): Instellingen {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

/** Schrijft de instellingen weg zonder te loggen: De aanroeper logt zelf, met de details die bij zijn wijziging horen. */
/** De instellingen buiten React om, voor berekeningen in de opslag. */
export function getInstellingen(): Instellingen {
  return parseSnapshot(getSnapshot());
}

export function schrijfInstellingen(patch: Partial<Instellingen>): void {
  if (typeof window === "undefined") return;
  const nieuw = { ...parseSnapshot(getSnapshot()), ...patch };
  const json = JSON.stringify(nieuw);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
}

export function zetInstellingen(patch: Partial<Instellingen>): void {
  if (typeof window === "undefined") return;
  const huidig = parseSnapshot(getSnapshot());
  schrijfInstellingen(patch);
  logAudit({
    actie: "instellingen.gewijzigd",
    entiteitType: "instellingen",
    entiteitId: "instellingen",
    details: { gewijzigd: Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, { oud: (huidig as unknown as Record<string, unknown>)[k] ?? null, nieuw: v ?? null }])) },
  });
}

/**
 * Verstreken bewaartermijn (`datamodel.md` deel 2, Bewaartermijn
 * ingevulde scans): alleen relevant voor afgeronde scans, en alleen als
 * er daadwerkelijk een termijn is ingesteld (`bewaarTermijnDagen`,
 * geen default). Een eerdere "Verlengen"-actie
 * (`ScanInvulling.bewaarVerlengdTot`) stelt de melding uit tot die datum,
 * ongeacht wat de kale termijnberekening zou zeggen.
 */
export function isOuderDanBewaartermijn(
  invulling: Pick<ScanInvulling, "status" | "afgerondOp" | "bewaarVerlengdTot">,
  instellingen: Instellingen,
  nu: Date = new Date()
): boolean {
  if (invulling.status !== "afgerond" || !invulling.afgerondOp) return false;
  if (instellingen.bewaarTermijnDagen === null) return false;
  if (invulling.bewaarVerlengdTot && new Date(invulling.bewaarVerlengdTot) > nu) return false;
  const grens = new Date(invulling.afgerondOp);
  grens.setDate(grens.getDate() + instellingen.bewaarTermijnDagen);
  return grens <= nu;
}
