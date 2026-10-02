import { useSyncExternalStore } from "react";
import { Organisatie } from "../types";
import { normaliseerEmail } from "../email";
import { demoOrganisatie } from "@/data/demo-organisatie";
import { haalServerKopieOp, stuurNaarServer } from "../server-sync";

const KEY = "coniche-scan:organisaties";
const SERVER_SLEUTEL = "organisaties";
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

/** Leest de ruwe snapshot-string; zaait localStorage bij het eerste gebruik. Puur op basis
 * van deze string, zodat de hooks hieronder tijdens hydration exact hetzelfde opleveren als
 * de server (die altijd SERVER_SENTINEL ziet). */
function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  // Niet meteen naar de server pushen: zonder lokale data weet deze browser
  // nog niet of de server al écht andere data heeft (die dan ten onrechte
  // overschreven zou worden, vóórdat `haalServerKopieOp` hieronder haar
  // async ophaal-ronde heeft kunnen doen). Pas bij een eerste echte
  // schrijfactie (`slaAlles`) wordt dit zaad alsnog naar de server gestuurd.
  const seed = JSON.stringify([structuredClone(demoOrganisatie)]);
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

/**
 * Vangt oudere of beschadigde localStorage-data op: elke plek in dit
 * bestand gaat ervan uit dat `leden`/`scanUitvoeringen`/`invullingen`
 * altijd arrays zijn (bijv. `organisatie.leden.find(...)`), zonder losse
 * undefined-checks per aanroep. Zonder deze normalisatie crasht de hele
 * app op een enkel organisatie-record dat niet meer helemaal klopt met
 * het huidige `Organisatie`-type (bijv. een browser met een oudere versie
 * van de opslag, of een handmatig bewerkte localStorage-waarde) — dat is
 * hier gemeld als "Cannot read properties of undefined (reading 'find')"
 * op `organisatie.leden`. Geen migratie van de inhoud, alleen de vorm.
 */
function normaliseerOrganisatie(ruw: Organisatie): Organisatie {
  return {
    ...ruw,
    kenmerken: ruw.kenmerken && typeof ruw.kenmerken === "object" ? ruw.kenmerken : {},
    // `email` genormaliseerd (getrimd, lowercase) voor data van vóór die
    // regel bestond (datamodel.md, Respondent) — anders herkent
    // `nodigLidUit`/`voegLeadToe` een bestaand lid met afwijkende casing
    // niet en maakt een dubbele aan.
    leden: Array.isArray(ruw.leden)
      ? ruw.leden.map((l) => ({
          ...l,
          email: normaliseerEmail(l.email),
          leadMetingIds: Array.isArray(l.leadMetingIds) ? l.leadMetingIds : [],
        }))
      : [],
    scanUitvoeringen: Array.isArray(ruw.scanUitvoeringen)
      ? ruw.scanUitvoeringen.map((s) => ({
          ...s,
          invullingen: Array.isArray(s.invullingen)
            ? s.invullingen.map((i) => ({
                ...i,
                bewaarVerlengdTot: i.bewaarVerlengdTot ?? null,
              }))
            : [],
        }))
      : [],
    // Ontbreekt bij data van vóór dit veld (localStorage uit een eerdere
    // sessie) — behandeld als "geen bekende aanmaker", zie Organisatie in
    // lib/types.ts: alleen voor Admin zichtbaar, nooit voor een Consultant.
    aangemaaktDoor: ruw.aangemaaktDoor ?? null,
    toegewezenAan: Array.isArray(ruw.toegewezenAan) ? ruw.toegewezenAan : [],
  };
}

function parseSnapshot(snapshot: string): Organisatie[] {
  if (snapshot === SERVER_SENTINEL) return [];
  try {
    const alles = JSON.parse(snapshot) as Organisatie[];
    if (!Array.isArray(alles)) return [];
    return alles.map(normaliseerOrganisatie);
  } catch {
    return [];
  }
}

export function laadAlles(): Organisatie[] {
  return parseSnapshot(getSnapshot());
}

export function slaAlles(alles: Organisatie[]): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(alles);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
}

export function useOrganisaties(): Organisatie[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}
