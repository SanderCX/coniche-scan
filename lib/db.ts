import { useSyncExternalStore } from "react";
import { Organisatie, Respondent } from "./types";
import { nieuwId } from "./id";
import { demoOrganisatie } from "@/data/demo-organisatie";

const KEY = "coniche-scan:organisaties";
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
  const seed = JSON.stringify([structuredClone(demoOrganisatie)]);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

function parseSnapshot(snapshot: string): Organisatie[] {
  if (snapshot === SERVER_SENTINEL) return [];
  try {
    return JSON.parse(snapshot) as Organisatie[];
  } catch {
    return [];
  }
}

function laadAlles(): Organisatie[] {
  return parseSnapshot(getSnapshot());
}

function slaAlles(alles: Organisatie[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(alles));
  emitChange();
}

export function getOrganisaties(): Organisatie[] {
  return laadAlles();
}

export function getOrganisatie(id: string): Organisatie | undefined {
  return laadAlles().find((o) => o.id === id);
}

export function maakOrganisatie(input: {
  naam: string;
  assessmentId: string;
  kenmerken: Record<string, unknown>;
}): Organisatie {
  const organisatie: Organisatie = {
    id: nieuwId(),
    assessmentId: input.assessmentId,
    naam: input.naam,
    kenmerken: input.kenmerken,
    respondenten: [],
  };
  const alles = laadAlles();
  alles.push(organisatie);
  slaAlles(alles);
  return organisatie;
}

export function verwijderOrganisatie(organisatieId: string): void {
  slaAlles(laadAlles().filter((o) => o.id !== organisatieId));
}

export function updateOrganisatie(
  organisatieId: string,
  updater: (organisatie: Organisatie) => Organisatie
): void {
  const alles = laadAlles();
  const index = alles.findIndex((o) => o.id === organisatieId);
  if (index === -1) return;
  const respondenten = alles[index].respondenten;
  alles[index] = { ...updater(structuredClone(alles[index])), respondenten };
  slaAlles(alles);
}

export function nodigRespondentUit(organisatieId: string, email: string): Respondent | null {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return null;
  const respondent: Respondent = {
    id: nieuwId(),
    organisatieId,
    email,
    naam: "",
    rol: "",
    team: "",
    notities: "",
    antwoorden: {},
    opmerkingenPerBouwblok: {},
    status: "uitgenodigd",
    gestartOp: new Date().toISOString(),
    afgerondOp: null,
  };
  organisatie.respondenten.push(respondent);
  slaAlles(alles);
  return respondent;
}

/**
 * Zonder gedeelde backend leeft elke organisatie/respondent alleen in de
 * localStorage van de browser waarin hij is aangemaakt (bijv. het
 * beheer-scherm). Een respondent die de uitnodigingslink in een ANDERE
 * browser opent (zijn eigen e-mailclient) heeft dus geen lokale data. Deze
 * functie "importeert" de organisatie (basisgegevens, geen andere
 * respondenten) + deze ene respondent, aangeleverd via de link zelf — zie
 * de `b`-query-param op /uitnodiging/[respondentId].
 */
export function importRespondent(
  organisatieBasis: Omit<Organisatie, "respondenten">,
  respondent: Respondent
): void {
  const alles = laadAlles();
  let organisatie = alles.find((o) => o.id === organisatieBasis.id);
  if (!organisatie) {
    organisatie = { ...organisatieBasis, respondenten: [] };
    alles.push(organisatie);
  }
  if (!organisatie.respondenten.some((r) => r.id === respondent.id)) {
    organisatie.respondenten.push(respondent);
  }
  slaAlles(alles);
}

export function getRespondent(
  respondentId: string
): { organisatie: Organisatie; respondent: Respondent } | null {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const respondent = organisatie.respondenten.find((r) => r.id === respondentId);
    if (respondent) return { organisatie, respondent };
  }
  return null;
}

/** Generieke update op een respondent binnen zijn organisatie. */
export function updateRespondent(
  respondentId: string,
  updater: (respondent: Respondent) => Respondent
): Respondent | null {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const index = organisatie.respondenten.findIndex((r) => r.id === respondentId);
    if (index !== -1) {
      organisatie.respondenten[index] = updater(
        structuredClone(organisatie.respondenten[index])
      );
      slaAlles(alles);
      return organisatie.respondenten[index];
    }
  }
  return null;
}

export function useOrganisaties(): Organisatie[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

export function useOrganisatie(id: string): Organisatie | undefined {
  return useOrganisaties().find((o) => o.id === id);
}

export function useRespondent(
  respondentId: string
): { organisatie: Organisatie; respondent: Respondent } | null {
  const alles = useOrganisaties();
  for (const organisatie of alles) {
    const respondent = organisatie.respondenten.find((r) => r.id === respondentId);
    if (respondent) return { organisatie, respondent };
  }
  return null;
}
