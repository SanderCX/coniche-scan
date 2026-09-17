import { useSyncExternalStore } from "react";

/**
 * PROTOTYPE-NIVEAU: vaste inloggegevens, client-side gecontroleerd, geen
 * echte 2FA. Dit is expliciet nog niet de "echte" beveiliging uit
 * admin-beheerpagina.md (e-mail + wachtwoord + 2FA) — dat vereist een
 * backend en mailservice. Voor nu: alleen bruikbaar om Joost/Sander tijdens
 * de prototypefase toegang te geven, niet productieklaar.
 */
const ADMIN_EMAIL = "admin@coniche.nl";
const ADMIN_WACHTWOORD = "coniche2026";

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

export function login(email: string, wachtwoord: string): boolean {
  const ok = email.trim().toLowerCase() === ADMIN_EMAIL && wachtwoord === ADMIN_WACHTWOORD;
  if (ok && typeof window !== "undefined") {
    window.sessionStorage.setItem(KEY, "true");
    emitChange();
  }
  return ok;
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

export function useIngelogd(): boolean {
  const waarde = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return waarde === "true";
}
