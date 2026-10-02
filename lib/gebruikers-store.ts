import { useSyncExternalStore } from "react";
import { BeheerRol, Gebruiker } from "./types";
import { nieuwId } from "./id";
import { normaliseerEmail } from "./email";
import { haalServerKopieOp, stuurNaarServer } from "./server-sync";

/**
 * Gebruikersbeheer (Admin/Consultant), `datamodel.md` deel 2 en
 * `beheerpagina.md` punt 9. Zelfde localStorage-patroon als
 * `lib/db.ts`/`lib/assessment-store.ts`: prototype-niveau, geen backend.
 *
 * Vervangt de eerder hardcoded inloggegevens in `lib/admin-auth.ts`: Bij
 * de allereerste keer laden zaait dit bestand precies één Gebruiker, met
 * dezelfde inloggegevens die al werkten (`admin@coniche.nl` /
 * `coniche2026`), zodat een bestaande sessie kan blijven inloggen. Sander
 * hernoemt/vult dit verder aan via het nieuwe scherm `/beheer/gebruikers`
 * (bijv. een eigen account voor Joost).
 */
const KEY = "coniche-scan:gebruikers";
const SERVER_SLEUTEL = "gebruikers";
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

function zaadGebruiker(): Gebruiker {
  return {
    id: nieuwId(),
    email: "admin@coniche.nl",
    naam: "Beheerder",
    wachtwoord: "coniche2026",
    rol: "admin",
    actief: true,
    laatstIngelogdOp: null,
    aangemaaktOp: new Date().toISOString(),
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  // Niet meteen pushen naar de server, zie dezelfde kanttekening in
  // lib/db.ts (race met `haalServerKopieOp`'s async ophaalronde).
  const seed = JSON.stringify([zaadGebruiker()]);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

// Bij het laden van de pagina: eenmalig de lokale, host-brede serverkopie
// ophalen zodat elke browser op dit apparaat met dezelfde data (en
// dezelfde gezaaide admin-gebruiker) start (lib/server-sync.ts).
if (typeof window !== "undefined") {
  haalServerKopieOp(SERVER_SLEUTEL, KEY, emitChange);
}

function parseSnapshot(snapshot: string): Gebruiker[] {
  if (snapshot === SERVER_SENTINEL) return [];
  try {
    const alles = JSON.parse(snapshot) as Gebruiker[];
    if (!Array.isArray(alles)) return [];
    // `email` genormaliseerd voor data van vóór die regel bestond
    // (datamodel.md, Respondent) — zie lib/db.ts, normaliseerOrganisatie.
    return alles.map((g) => ({ ...g, email: normaliseerEmail(g.email) }));
  } catch {
    return [];
  }
}

function laadAlles(): Gebruiker[] {
  return parseSnapshot(getSnapshot());
}

function slaAlles(alles: Gebruiker[]): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(alles);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
}

export function useGebruikers(): Gebruiker[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

export function useGebruiker(id: string): Gebruiker | undefined {
  return useGebruikers().find((g) => g.id === id);
}

export function aantalActieveAdmins(alles: Gebruiker[]): number {
  return alles.filter((g) => g.rol === "admin" && g.actief).length;
}

export function maakGebruiker(input: {
  email: string;
  naam: string;
  wachtwoord: string;
  rol: Gebruiker["rol"];
}): Gebruiker {
  const gebruiker: Gebruiker = {
    id: nieuwId(),
    email: normaliseerEmail(input.email),
    naam: input.naam.trim(),
    wachtwoord: input.wachtwoord,
    rol: input.rol,
    actief: true,
    laatstIngelogdOp: null,
    aangemaaktOp: new Date().toISOString(),
  };
  const alles = laadAlles();
  alles.push(gebruiker);
  slaAlles(alles);
  return gebruiker;
}

export function updateGebruiker(
  id: string,
  updater: (gebruiker: Gebruiker) => Gebruiker
): void {
  const alles = laadAlles();
  const index = alles.findIndex((g) => g.id === id);
  if (index === -1) return;
  alles[index] = updater(structuredClone(alles[index]));
  slaAlles(alles);
}

/**
 * Voorwaarde uit `beheerpagina.md` punt 9: "Minimaal 1 actieve Admin
 * verplicht". Geldt ook bij zelf-deactiveren, geen aparte regel nodig.
 */
export function kanDeactiveren(id: string): { ok: true } | { ok: false; reden: string } {
  const alles = laadAlles();
  const gebruiker = alles.find((g) => g.id === id);
  if (!gebruiker) return { ok: false, reden: "Gebruiker niet gevonden." };
  if (gebruiker.rol === "admin" && aantalActieveAdmins(alles) <= 1) {
    return {
      ok: false,
      reden: "Dit is de laatste actieve Admin. Maak eerst een andere Admin actief voordat je deze deactiveert.",
    };
  }
  return { ok: true };
}

export function deactiveerGebruiker(id: string): { ok: true } | { ok: false; reden: string } {
  const check = kanDeactiveren(id);
  if (!check.ok) return check;
  updateGebruiker(id, (g) => ({ ...g, actief: false }));
  return { ok: true };
}

export function heractiveerGebruiker(id: string): void {
  updateGebruiker(id, (g) => ({ ...g, actief: true }));
}

/** Voor de "eigenaarschap overzetten"-stap bij het deactiveren van een Consultant. */
export function actieveGebruikersMetRol(rol: Gebruiker["rol"] | Gebruiker["rol"][]): Gebruiker[] {
  const rollen = Array.isArray(rol) ? rol : [rol];
  return laadAlles().filter((g) => g.actief && rollen.includes(g.rol));
}

/**
 * `rol` is hier een extra check naast e-mail/wachtwoord, geen aparte
 * inlogmethode: Klopt de combinatie van e-mail/wachtwoord, maar niet de
 * opgegeven rol (bijv. een Consultant die "Admin" kiest), dan mislukt het
 * inloggen alsnog — net zo goed als een verkeerd wachtwoord. Voorkomt dat
 * iemand zich per ongeluk (of expres) een andere rol toe-eigent dan zijn
 * account daadwerkelijk heeft.
 */
export function zoekGebruikerVoorLogin(
  email: string,
  wachtwoord: string,
  rol: BeheerRol
): Gebruiker | undefined {
  const alles = laadAlles();
  return alles.find(
    (g) =>
      g.actief &&
      g.email === normaliseerEmail(email) &&
      g.wachtwoord === wachtwoord &&
      g.rol === rol
  );
}

export function zetLaatstIngelogd(id: string): void {
  updateGebruiker(id, (g) => ({ ...g, laatstIngelogdOp: new Date().toISOString() }));
}
