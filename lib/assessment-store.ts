import { useSyncExternalStore } from "react";
import { Assessment } from "./types";
import { assessments as seedAssessments } from "@/data/assessments";

const KEY = "coniche-scan:assessments";
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
 * van deze string, zodat de hook hieronder tijdens hydration exact hetzelfde oplevert als
 * de server (die altijd SERVER_SENTINEL ziet). */
function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  const seed = JSON.stringify(structuredClone(seedAssessments));
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

function parseSnapshot(snapshot: string): Assessment[] {
  if (snapshot === SERVER_SENTINEL) return seedAssessments;
  try {
    return JSON.parse(snapshot) as Assessment[];
  } catch {
    return seedAssessments;
  }
}

function laadAlles(): Assessment[] {
  return parseSnapshot(getSnapshot());
}

function slaAlles(alles: Assessment[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(alles));
  emitChange();
}

export function getAssessments(): Assessment[] {
  return laadAlles();
}

export function getAssessment(id: string): Assessment | undefined {
  return laadAlles().find((a) => a.id === id);
}

/** Generieke update: leest, past `updater` toe op een kloon, slaat op. */
export function updateAssessment(
  id: string,
  updater: (assessment: Assessment) => Assessment
): void {
  const alles = laadAlles();
  const index = alles.findIndex((a) => a.id === id);
  if (index === -1) return;
  alles[index] = updater(structuredClone(alles[index]));
  slaAlles(alles);
}

export function resetAssessments(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emitChange();
}

export function useAssessments(): Assessment[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

export function useAssessment(id: string): Assessment | undefined {
  const alles = useAssessments();
  return alles.find((a) => a.id === id);
}
