import { useSyncExternalStore } from "react";
import { Gebruiker } from "./types";
import { getGebruikers, useGebruikers, zoekGebruikerVoorLogin, zetLaatstIngelogd } from "./gebruikers-store";

/**
 * PROTOTYPE-NIVEAU: Login tegen `lib/gebruikers-store.ts` (localStorage,
 * platte wachtwoorden, geen echte 2FA/sessiebeheer). Dit is expliciet nog
 * niet de "echte" beveiliging uit `beheerpagina.md` (e-mail +
 * wachtwoord + 2FA + backend-`Sessie`) — dat vereist een backend en
 * mailservice. Voor nu: bruikbaar om Coniche-medewerkers tijdens de
 * prototypefase toegang te geven, niet productieklaar.
 *
 * Sloeg voorheen alleen een boolean op tegen twee hardcoded inloggegevens;
 * slaat nu het `gebruikerId` op, zodat rol/naam/e-mail overal opvraagbaar
 * zijn (Accountmenu, Rolbadge, rechten in `lib/rechten.ts`).
 */
const KEY = "coniche-scan:admin-ingelogd";

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void {
  listeners.forEach((l) => l());
}
function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Na handmatig uitloggen slaat de dev-autologin in dit tabblad over, anders is uitloggen onmogelijk. */
const GEEN_AUTOLOGIN_KEY = "coniche-scan:geen-dev-autologin";

/**
 * Alleen tijdens ontwikkeling (`next dev`): Start beheer ingelogd als de eerste actieve
 * Admin, zodat elk nieuw tabblad of elke herstart niet eerst door het inlogscherm hoeft.
 * In een productiebuild is `NODE_ENV` niet "development", dus doet dit niets. Geen
 * wachtwoord nodig of in de code: Het zet alleen de sessie van een bestaande Admin.
 */
export function devAutoLogin(): boolean {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(GEEN_AUTOLOGIN_KEY)) return false;
    if (window.sessionStorage.getItem(KEY)) return false;
    const admin = getGebruikers().find((g) => g.actief && g.rol === "admin");
    if (!admin) return false;
    window.sessionStorage.setItem(KEY, admin.id);
    emitChange();
    return true;
  } catch {
    return false;
  }
}

export function login(email: string, wachtwoord: string): boolean {
  const gebruiker = zoekGebruikerVoorLogin(email, wachtwoord);
  if (!gebruiker) return false;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(KEY, gebruiker.id);
    window.sessionStorage.removeItem(GEEN_AUTOLOGIN_KEY);
    emitChange();
  }
  zetLaatstIngelogd(gebruiker.id);
  return true;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
  window.sessionStorage.setItem(GEEN_AUTOLOGIN_KEY, "1");
  emitChange();
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    // sessionStorage geblokkeerd of niet beschikbaar: Geen ingelogde gebruiker.
    return null;
  }
}
function getServerSnapshot(): string | null {
  return null;
}

/** Het id van de ingelogde Gebruiker buiten React om (bijv. voor de audit-log), of `null`. */
export function getIngelogdeGebruikerId(): string | null {
  return getSnapshot();
}

/** Alleen de ingelogde staat (boolean) — voor route-gating in `app/beheer/layout.tsx`. */
export function useIngelogd(): boolean {
  const waarde = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return waarde !== null;
}

/** De volledige ingelogde Gebruiker (rol, naam, e-mail) — `null` als niet ingelogd of
 * als het opgeslagen id niet meer bestaat (bijv. na deactiveren in een andere tab). */
export function useIngelogdeGebruiker(): Gebruiker | null {
  const gebruikerId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const gebruikers = useGebruikers();
  if (!gebruikerId) return null;
  return gebruikers.find((g) => g.id === gebruikerId && g.actief) ?? null;
}
