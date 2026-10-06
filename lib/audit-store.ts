import { useSyncExternalStore } from "react";
import { getIngelogdeGebruikerId } from "./admin-auth";
import { getGebruikers } from "./gebruikers-store";
import { nieuwId } from "./id";

/**
 * Audit-log (`datamodel.md` deel 2, Audit; `beheerpagina.md` punt 12).
 * Zelfde localStorage-patroon als de andere stores, maar nog **zonder** Neon-spiegel:
 * De tabel `app_data` laat via een CHECK-constraint alleen de vaste sleutels toe, en
 * `audit` staat daar niet bij. Tot die constraint is uitgebreid (een wijziging aan
 * de database, nog niet gedaan) leeft de log per browser.
 * Gebeurtenissen zijn onveranderlijk: Alleen toevoegen, en opruimen na de
 * bewaartermijn door een Admin (`ruimAuditOp`).
 *
 * **Geen persoonsgegevens uit scans** in `details` of in
 * `entiteitNaam`: Geen naam, e-mailadres, functie, team, notities of
 * antwoorden van een Respondent. Wie hier iets toevoegt, moet dat zelf
 * bewaken.
 */
const KEY = "coniche-scan:audit";
const SERVER_SENTINEL = "__server__";

export interface AuditEvent {
  id: string;
  actorType: "gebruiker" | "respondent" | "systeem";
  actorId: string | null;
  /** Naam van de actor zoals die op dat moment was, zodat het overzicht leesbaar blijft. */
  actorNaam: string | null;
  /** Bijv. "organisatie.verwijderd" of "bouwblok.gewichtGewijzigd". */
  actie: string;
  entiteitType: string;
  entiteitId: string;
  /** Naam van het record op dat moment. Nooit de naam van een Respondent. */
  entiteitNaam: string | null;
  tijdstip: string;
  /** Bijv. alle gebeurtenissen van één import of één bulkactie. */
  groepId: string | null;
  details: Record<string, unknown> | null;
}

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
  return window.localStorage.getItem(KEY) ?? "[]";
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

function parseSnapshot(snapshot: string): AuditEvent[] {
  if (snapshot === SERVER_SENTINEL) return [];
  try {
    const waarde = JSON.parse(snapshot);
    return Array.isArray(waarde) ? (waarde as AuditEvent[]) : [];
  } catch {
    return [];
  }
}

function bewaar(events: AuditEvent[]): void {
  const json = JSON.stringify(events);
  window.localStorage.setItem(KEY, json);
  emitChange();
}

export function getAuditEvents(): AuditEvent[] {
  return parseSnapshot(getSnapshot());
}

export function useAuditEvents(): AuditEvent[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

export interface AuditInvoer {
  actie: string;
  entiteitType: string;
  entiteitId: string;
  entiteitNaam?: string | null;
  groepId?: string | null;
  details?: Record<string, unknown> | null;
  /** Standaard de ingelogde Gebruiker. Zonder: "systeem". */
  actor?: { type: AuditEvent["actorType"]; id: string | null; naam: string | null };
}

let extraDetails: Record<string, unknown> | null = null;

/**
 * Voegt `extra` toe aan de `details` van alle gebeurtenissen die `actie` logt, bijvoorbeeld
 * `{ vanuit: "Data-integriteit" }` bij acties vanuit die pagina (`beheerpagina.md`, punt 13).
 */
export function metExtraDetails<T>(extra: Record<string, unknown>, actie: () => T): T {
  const vorige = extraDetails;
  extraDetails = { ...(vorige ?? {}), ...extra };
  try {
    return actie();
  } finally {
    extraDetails = vorige;
  }
}

/** Eén of meer gebeurtenissen in één keer toevoegen (één opslagactie). */
export function logAudit(invoer: AuditInvoer | AuditInvoer[]): void {
  if (typeof window === "undefined") return;
  const lijst = Array.isArray(invoer) ? invoer : [invoer];
  if (lijst.length === 0) return;
  const gebruikerId = getIngelogdeGebruikerId();
  const gebruiker = gebruikerId ? getGebruikers().find((g) => g.id === gebruikerId) : undefined;
  const tijdstip = new Date().toISOString();
  const nieuw: AuditEvent[] = lijst.map((i) => {
    const actor =
      i.actor ??
      (gebruiker
        ? { type: "gebruiker" as const, id: gebruiker.id, naam: gebruiker.naam }
        : { type: "systeem" as const, id: null, naam: null });
    return {
      id: nieuwId(),
      actorType: actor.type,
      actorId: actor.id,
      actorNaam: actor.naam,
      actie: i.actie,
      entiteitType: i.entiteitType,
      entiteitId: i.entiteitId,
      entiteitNaam: i.entiteitNaam ?? null,
      tijdstip,
      groepId: i.groepId ?? null,
      details: extraDetails ? { ...(i.details ?? {}), ...extraDetails } : (i.details ?? null),
    };
  });
  bewaar([...parseSnapshot(getSnapshot()), ...nieuw]);
}

/** Verwijdert gebeurtenissen vóór `voorTijdstip` (de bewuste opruimactie van een Admin) en logt dat zelf. */
export function ruimAuditOp(voorTijdstip: string): number {
  if (typeof window === "undefined") return 0;
  const alles = parseSnapshot(getSnapshot());
  const over = alles.filter((e) => e.tijdstip >= voorTijdstip);
  const verwijderd = alles.length - over.length;
  if (verwijderd === 0) return 0;
  const oudste = alles.reduce((m, e) => (e.tijdstip < m ? e.tijdstip : m), alles[0].tijdstip);
  bewaar(over);
  logAudit({
    actie: "auditlog.opgeruimd",
    entiteitType: "auditlog",
    entiteitId: "auditlog",
    details: { van: oudste, tot: voorTijdstip, aantal: verwijderd },
  });
  return verwijderd;
}

export function nieuweGroepId(): string {
  return nieuwId();
}
