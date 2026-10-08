import { useSyncExternalStore } from "react";
import { ScanInvulling } from "./types";
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
}

const STANDAARDWAARDEN: Instellingen = {
  bewaarTermijnDagen: null,
  verlengTermijnDagen: null,
  benchmarkMinOrganisaties: 5,
  benchmarkMinScans: 3,
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

export function zetInstellingen(patch: Partial<Instellingen>): void {
  if (typeof window === "undefined") return;
  const huidig = parseSnapshot(getSnapshot());
  const nieuw = { ...huidig, ...patch };
  const json = JSON.stringify(nieuw);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
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
