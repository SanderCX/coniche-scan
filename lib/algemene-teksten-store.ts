import { useSyncExternalStore } from "react";
import { haalServerKopieOp, stuurNaarServer } from "./server-sync";
import { logAudit } from "./audit-store";

/**
 * Algemene teksten (`beheerpagina.md` punt 2a, `datamodel.md`,
 * Algemene teksten): teksten los van een specifiek Assessment, één
 * tekstveld per sleutel. Zelfde localStorage-patroon als de andere
 * stores in dit bestand-groepje (`lib/db.ts`, `lib/gebruikers-store.ts`).
 * Modelleren als één key-value record (`Record<sleutel, waarde>`) in
 * plaats van een array van `{ sleutel, waarde }`-objecten: er is geen
 * eigen id/aanmaakdatum per tekst nodig, alleen de waarde zelf.
 */
const KEY = "coniche-scan:algemene-teksten";
const SERVER_SLEUTEL = "algemene-teksten";
const SERVER_SENTINEL = "__server__";

export type AlgemeneTekstSleutel = "mijnMetingenIntro";

const STANDAARDWAARDEN: Record<AlgemeneTekstSleutel, string> = {
  mijnMetingenIntro: "Hier vind je al je scans en, als je Lead bent, de metingen waar je toegang toe hebt.",
};

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

function parseSnapshot(snapshot: string): Record<string, string> {
  if (snapshot === SERVER_SENTINEL) return { ...STANDAARDWAARDEN };
  try {
    const waarden = JSON.parse(snapshot) as Record<string, string>;
    return waarden && typeof waarden === "object" ? { ...STANDAARDWAARDEN, ...waarden } : { ...STANDAARDWAARDEN };
  } catch {
    return { ...STANDAARDWAARDEN };
  }
}

export function useAlgemeneTeksten(): Record<AlgemeneTekstSleutel, string> {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot) as Record<AlgemeneTekstSleutel, string>;
}

export function useAlgemeneTekst(sleutel: AlgemeneTekstSleutel): string {
  return useAlgemeneTeksten()[sleutel];
}

/**
 * Alle opgeslagen teksten per sleutel, zonder de standaardwaarden erbij: Voor de
 * Info-iconen (`info.*`) betekent een ontbrekende sleutel de standaardtekst uit
 * `data/info-teksten.ts`.
 */
export function useOpgeslagenTeksten(): Record<string, string> {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (snapshot === SERVER_SENTINEL) return {};
  try {
    const waarden = JSON.parse(snapshot);
    return waarden && typeof waarden === "object" ? (waarden as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/**
 * Zet een tekst. Een lege waarde verwijdert de sleutel (de standaardtekst geldt dan).
 * De wijziging wordt gelogd als `algemeneTekst.gewijzigd`, met alleen de sleutel en
 * niet de tekst (`datamodel.md`, Audit).
 */
export function zetAlgemeneTekst(sleutel: string, waarde: string): void {
  if (typeof window === "undefined") return;
  let huidig: Record<string, string>;
  try {
    huidig = JSON.parse(getSnapshot()) as Record<string, string>;
  } catch {
    huidig = {};
  }
  if (waarde.trim() === "") delete huidig[sleutel];
  else huidig[sleutel] = waarde;
  const json = JSON.stringify(huidig);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
  logAudit({
    actie: "algemeneTekst.gewijzigd",
    entiteitType: "algemeneTekst",
    entiteitId: sleutel,
    entiteitNaam: sleutel,
    details: { sleutel },
  });
}
