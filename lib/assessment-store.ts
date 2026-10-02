import { useSyncExternalStore } from "react";
import { Assessment, Bouwblok, Vraag } from "./types";
import { assessments as seedAssessments } from "@/data/assessments";
import { nieuwId } from "./id";
import { haalServerKopieOp, stuurNaarServer } from "./server-sync";

const KEY = "coniche-scan:assessments";
const SERVER_SLEUTEL = "assessments";
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
  // Niet meteen pushen naar de server, zie dezelfde kanttekening in
  // lib/db.ts hierboven (race met `haalServerKopieOp`'s async ophaalronde).
  const seed = JSON.stringify(structuredClone(seedAssessments));
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
  const json = JSON.stringify(alles);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
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

/** "Nieuw Assessment aanmaken" (leeg), beheerpagina.md punt 1. */
export function createAssessment(input: { naam: string; kortLabel: string }): Assessment {
  const assessment: Assessment = {
    id: nieuwId(),
    afgeleidVanAssessmentId: null,
    naam: input.naam,
    subtitel: "",
    beschrijving: "",
    doelgroep: "",
    icoon: "sparkle",
    geschatteDuur: "",
    kortLabel: input.kortLabel,
    pdfContentSecties: null,
    categorieen: null,
    bouwblokken: [],
    scoresPerGroepGesorteerd: false,
    bouwblokEenheidEnkelvoud: "Bouwblok",
    bouwblokEenheidMeervoud: "bouwblokken",
    featureCards: [],
    schaal: [
      { waarde: 1, label: "Niet aanwezig" },
      { waarde: 2, label: "Deels / incidenteel" },
      { waarde: 3, label: "Aanwezig en meestal toegepast" },
      { waarde: 4, label: "Structureel geborgd en gemeten" },
      { waarde: 5, label: "Geoptimaliseerd en continu verbeterd" },
    ],
  };
  const alles = laadAlles();
  alles.push(assessment);
  slaAlles(alles);
  return assessment;
}

function nieuweVraag(vraag: Vraag): Vraag {
  return { ...vraag, id: nieuwId() };
}

/**
 * Het nieuwe id krijgt bewust hetzelfde `"bb"`/`"zorg-"`/`"ai"`-voorvoegsel
 * als het bronbouwblok, in plaats van een kale UUID: `lib/bouwblok-info.ts`
 * (`toelichtingVoor`) matcht daarop, samen met `volgnummer` (dat ongewijzigd
 * overgenomen wordt). Zonder dit voorvoegsel verloor elke via "Aanmaken
 * vanuit bestaand Assessment" (sector-variant) gekopieerde bouwsteen
 * stilzwijgend zijn "CENTRALE VRAAG" en beschrijving, in zowel de
 * toelichting-overlay als de PDF-export — een bestaand template dupliceren
 * bleef zo de enige weg naar die content, wat het hele punt van een
 * sector-variant ondermijnde.
 */
function nieuwBouwblokId(bronId: string): string {
  const voorvoegsel = ["bb", "zorg-", "ai"].find((p) => bronId.startsWith(p));
  return voorvoegsel ? `${voorvoegsel}${voorvoegsel.endsWith("-") ? "" : "-"}${nieuwId()}` : nieuwId();
}

function nieuwBouwblok(bouwblok: Bouwblok): Bouwblok {
  return { ...bouwblok, id: nieuwBouwblokId(bouwblok.id), vragen: bouwblok.vragen.map(nieuweVraag) };
}

/**
 * "Aanmaken vanuit bestaand Assessment" (sector-variant), datamodel.md
 * "Sector-varianten": Kopieert alle Categorieën/Bouwblokken/Vragen naar
 * nieuwe, losse content-records (nieuwe id's) onder een nieuw Assessment.
 * Geen levende koppeling met het template na het kopiëren.
 */
export function duplicateAssessmentAsVariant(
  templateId: string,
  input: { naam: string; kortLabel: string }
): Assessment | null {
  const alles = laadAlles();
  const template = alles.find((a) => a.id === templateId);
  if (!template) return null;
  const kloon = structuredClone(template);
  const assessment: Assessment = {
    ...kloon,
    id: nieuwId(),
    naam: input.naam,
    kortLabel: input.kortLabel,
    afgeleidVanAssessmentId: templateId,
    categorieen: kloon.categorieen
      ? kloon.categorieen.map((c) => ({ ...c, id: nieuwId(), bouwblokken: c.bouwblokken.map(nieuwBouwblok) }))
      : null,
    bouwblokken: kloon.bouwblokken ? kloon.bouwblokken.map(nieuwBouwblok) : null,
  };
  alles.push(assessment);
  slaAlles(alles);
  return assessment;
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
