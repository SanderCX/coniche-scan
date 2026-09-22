import { useSyncExternalStore } from "react";

const KEY = "coniche-scan:test-modus";
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

/**
 * Test-modus voor Beheer: staat dit aan, dan is Beheer direct open zonder
 * e-mail+wachtwoord (zie admin-beheerpagina.md "Login"). Bedoeld om tijdens
 * de bouw snel te kunnen testen en de vragenlijsten door te ontwikkelen,
 * zonder telkens in te loggen. Standaard AAN, instelbaar op het
 * beheer-dashboard.
 */
function parseSnapshot(snapshot: string): boolean {
  if (snapshot === SERVER_SENTINEL) return true;
  return snapshot !== "false";
}

function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  return window.localStorage.getItem(KEY) ?? "true";
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

export function isTestModusActief(): boolean {
  return parseSnapshot(getSnapshot());
}

export function zetTestModus(actief: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, actief ? "true" : "false");
  emitChange();
}

export function useTestModus(): boolean {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}
