import { useSyncExternalStore } from "react";

const KEY = "coniche-scan:test-modus";
const SERVER_SENTINEL = "server";

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
 * Test-modus: als actief, mogen de scan-pagina's (intake/doorloop/
 * resultaten) rechtstreeks geopend worden zonder de e-mail+code-
 * verificatie — bedoeld om de vragenlijst snel te kunnen testen zonder
 * elke keer een echte uitnodiging te moeten doorlopen. Instelbaar in
 * /beheer, zie changelog.md.
 */
export function isTestModusActief(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function zetTestModus(actief: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, actief ? "true" : "false");
  emitChange();
}

function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  return window.localStorage.getItem(KEY) ?? "false";
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

export function useTestModus(): boolean {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return snapshot === "true";
}
