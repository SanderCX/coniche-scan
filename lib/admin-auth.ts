import { useSyncExternalStore } from "react";
import { BeheerRol, Gebruiker } from "./types";
import { useGebruikers, zoekGebruikerVoorLogin, zetLaatstIngelogd } from "./gebruikers-store";

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

export function login(email: string, wachtwoord: string, rol: BeheerRol): boolean {
  const gebruiker = zoekGebruikerVoorLogin(email, wachtwoord, rol);
  if (!gebruiker) return false;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(KEY, gebruiker.id);
    emitChange();
  }
  zetLaatstIngelogd(gebruiker.id);
  return true;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
  emitChange();
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}
function getServerSnapshot(): string | null {
  return null;
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
