import { useSyncExternalStore } from "react";
import { ScanInvulling } from "./types";
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
  verkennenWaarschuwingGroep: number;
  /**
   * De korte namen voor veldnamen en waarden (`datamodel.md`, Korte namen). Ze staan hier, bij de instellingen, omdat het
   * weergavenamen zijn en de organisatievelden zelf vaste data zijn.
   */
  korteNamen: KorteNamen;
}

const STANDAARDWAARDEN: Instellingen = {
  bewaarTermijnDagen: null,
  verlengTermijnDagen: null,
  benchmarkMinOrganisaties: 5,
  benchmarkMinScans: 3,
  benchmarkMinRespondenten: 5,
  benchmarkMaxDagenTussenMetingen: 90,
  verkennenMinGroep: 3,
  verkennenWaarschuwingGroep: 5,
  korteNamen: { velden: {}, waarden: [] },
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
    const waarden = JSON.parse(snapshot) as Partial<Instellingen>;
    return { ...STANDAARDWAARDEN, ...waarden };
  } catch {
    return { ...STANDAARDWAARDEN };
  }
}

export function useInstellingen(): Instellingen {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

/** Schrijft de instellingen weg zonder te loggen: De aanroeper logt zelf, met de details die bij zijn wijziging horen. */
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
