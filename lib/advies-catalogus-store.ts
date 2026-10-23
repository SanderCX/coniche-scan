import { useSyncExternalStore } from "react";
import { ADVIES_CATALOGUS_BEGIN } from "@/data/advies-catalogus";
import { haalServerKopieOp, stuurNaarServer } from "./server-sync";
import { logAudit } from "./audit-store";
import type { AdviesCatalogus, AdviesFase, AdviesRol, UseCase, UseCasePrompt } from "./types";

/**
 * De Adviescatalogus (`adviesverloop.md`; `beheerpagina.md`, punt 17): De zes fasen, de use cases met per rol een context en een prompt en de
 * rollen waaruit het adviesverloop bestaat. Data die een Admin beheert. De catalogus begint met `data/advies-catalogus.ts` (gegenereerd uit
 * `content-adviesverloop.md`) en staat daarna in de localStorage, met dezelfde serversync als de andere stores. Elke wijziging komt in het
 * audit-log als `adviescatalogus.gewijzigd`, met de soort, de naam of code en de namen van de gewijzigde velden, nooit de inhoud van een prompt.
 *
 * De server heeft in de tabel `app_data` een controle op de sleutels: Staat `adviescatalogus` daar nog niet in, dan blijft de catalogus
 * lokaal in deze browser en valt de synchronisatie stil terug (`app/api/store/[key]/route.ts`).
 */
const KEY = "coniche-scan:adviescatalogus";
const SERVER_SLEUTEL = "adviescatalogus";
const SERVER_SENTINEL = "__server__";

export const TITEL_MAX = 120;
export const OMSCHRIJVING_MAX = 400;
/**
 * De grens voor de tekst bij Wie ben jij bij deze klant. Het datamodel noemt 600 tekens, maar de standaardteksten uit de Boks-app zijn 773 tot 864 tekens: Met 600
 * zouden ze midden in een zin worden afgekapt. Daarom 1000 tot Joost besluit (`changelog.md`).
 */
export const ROLTEKST_MAX = 1000;
/** De appcodes met hun naam, in de volgorde van de keuze (`content-adviesverloop.md`, Apps). */
export const APPS: { code: string; naam: string }[] = [
  { code: "copilot", naam: "Copilot (app)" },
  { code: "word", naam: "Word" },
  { code: "excel", naam: "Excel" },
  { code: "ppt", naam: "PowerPoint" },
  { code: "outlook", naam: "Outlook" },
  { code: "teams", naam: "Teams" },
  { code: "onenote", naam: "OneNote" },
  { code: "studio", naam: "Copilot Studio" },
];
export const appNaam = (code: string): string => APPS.find((a) => a.code === code)?.naam ?? code;
/** De klassen waarbij een use case kan worden voorgesteld, met hun naam (`CLAUDE.md`, Classificatie). */
export const KLASSEN: { code: "basis" | "uitbouwen" | "sterk"; naam: string }[] = [
  { code: "basis", naam: "Basis op orde" },
  { code: "uitbouwen", naam: "Uitbouwen" },
  { code: "sterk", naam: "Sterk punt" },
];

export type CatalogusResultaat = { ok: true } | { ok: false; reden: string };

type Listener = () => void;
const listeners = new Set<Listener>();
const emitChange = () => listeners.forEach((l) => l());
const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  // Niet meteen naar de server sturen: Zie dezelfde kanttekening in `lib/algemene-teksten-store.ts`.
  const seed = JSON.stringify(ADVIES_CATALOGUS_BEGIN);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
const getServerSnapshot = () => SERVER_SENTINEL;

if (typeof window !== "undefined") haalServerKopieOp(SERVER_SLEUTEL, KEY, emitChange);

function parse(snapshot: string): AdviesCatalogus {
  if (snapshot === SERVER_SENTINEL) return ADVIES_CATALOGUS_BEGIN;
  try {
    const w = JSON.parse(snapshot) as Partial<AdviesCatalogus>;
    if (!Array.isArray(w.fasen) || !Array.isArray(w.rollen) || !Array.isArray(w.useCases)) return ADVIES_CATALOGUS_BEGIN;
    return { fasen: w.fasen, rollen: w.rollen, useCases: w.useCases.map((u) => ({ ...u, bouwsteenIds: u.bouwsteenIds ?? [], klassen: u.klassen ?? [], prompts: u.prompts ?? [] })) };
  } catch {
    return ADVIES_CATALOGUS_BEGIN;
  }
}

export function getAdviesCatalogus(): AdviesCatalogus {
  return parse(getSnapshot());
}

export function useAdviesCatalogus(): AdviesCatalogus {
  return parse(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
}

function bewaar(c: AdviesCatalogus): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(c);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
}

/** Zet de catalogus terug op de beginwaarde (voor tests en voor een Admin die opnieuw wil beginnen). */
export function resetAdviesCatalogus(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emitChange();
}

function log(soort: "fase" | "usecase" | "rol" | "prompt", naam: string, actie: string, velden?: string[]): void {
  logAudit({
    actie: "adviescatalogus.gewijzigd",
    entiteitType: "adviescatalogus",
    entiteitId: soort,
    entiteitNaam: naam,
    details: { soort, naam, actie, ...(velden && velden.length > 0 ? { velden } : {}) },
  });
}

const gewijzigdeVelden = <T extends object>(oud: T, nieuw: T): string[] =>
  (Object.keys(nieuw) as (keyof T)[]).filter((k) => JSON.stringify(oud[k]) !== JSON.stringify(nieuw[k])).map(String);

/* ---------- Fasen ---------- */

/**
 * Een fase hernoemen of verplaatsen (`beheerpagina.md`, punt 17): De zes fasen kunnen niet worden aangemaakt of verwijderd. Zodra er een adviesverloop
 * bestaat, staan ze vast (`vergrendeld`): De fasestrook van een lopend adviesverloop mag niet van onder het traject veranderen.
 */
export function wijzigFase(id: string, patch: Partial<Pick<AdviesFase, "naam" | "korteNaam" | "omschrijving">>, vergrendeld: boolean): CatalogusResultaat {
  if (vergrendeld) return { ok: false, reden: "Er bestaat al een adviesverloop: De fasen staan vast." };
  const c = getAdviesCatalogus();
  const fase = c.fasen.find((f) => f.id === id);
  if (!fase) return { ok: false, reden: "Fase niet gevonden." };
  const nieuw = { ...fase, ...patch };
  if (!nieuw.naam.trim() || !nieuw.korteNaam.trim()) return { ok: false, reden: "Vul een naam en een korte naam in." };
  const velden = gewijzigdeVelden(fase, nieuw);
  if (velden.length === 0) return { ok: true };
  bewaar({ ...c, fasen: c.fasen.map((f) => (f.id === id ? { ...nieuw, naam: nieuw.naam.trim(), korteNaam: nieuw.korteNaam.trim() } : f)) });
  log("fase", fase.naam, "gewijzigd", velden);
  return { ok: true };
}

/** Een fase een plek omhoog (`-1`) of omlaag (`1`). */
export function verplaatsFase(id: string, richting: -1 | 1, vergrendeld: boolean): CatalogusResultaat {
  if (vergrendeld) return { ok: false, reden: "Er bestaat al een adviesverloop: De fasen staan vast." };
  const c = getAdviesCatalogus();
  const op = [...c.fasen].sort((a, b) => a.volgorde - b.volgorde);
  const i = op.findIndex((f) => f.id === id);
  const j = i + richting;
  if (i === -1 || j < 0 || j >= op.length) return { ok: true };
  [op[i], op[j]] = [op[j], op[i]];
  bewaar({ ...c, fasen: op.map((f, k) => ({ ...f, volgorde: k + 1 })) });
  log("fase", op[j].naam, "verplaatst");
  return { ok: true };
}

/* ---------- Rollen ---------- */

export function wijzigRol(id: string, patch: Partial<Pick<AdviesRol, "naam" | "standaardTekst">>): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const rol = c.rollen.find((r) => r.id === id);
  if (!rol) return { ok: false, reden: "Rol niet gevonden." };
  const nieuw = { ...rol, ...patch };
  if (!nieuw.naam.trim()) return { ok: false, reden: "Vul een naam in." };
  if (nieuw.standaardTekst.length > ROLTEKST_MAX) return { ok: false, reden: `De tekst mag maximaal ${ROLTEKST_MAX} tekens hebben.` };
  const velden = gewijzigdeVelden(rol, nieuw);
  if (velden.length === 0) return { ok: true };
  bewaar({ ...c, rollen: c.rollen.map((r) => (r.id === id ? { ...nieuw, naam: nieuw.naam.trim() } : r)) });
  log("rol", rol.naam, "gewijzigd", velden);
  return { ok: true };
}

/* ---------- Use cases ---------- */

export interface UseCaseInvoer {
  id: string;
  faseId: string;
  titel: string;
  omschrijving: string;
  apps: string[];
  inStrook: boolean;
  bouwsteenIds: string[];
  klassen: string[];
}

function controleerUseCase(c: AdviesCatalogus, invoer: UseCaseInvoer, bestaandId?: string): string | null {
  const code = invoer.id.trim();
  if (!code) return "Vul een code in.";
  if (c.useCases.some((u) => u.id === code && u.id !== bestaandId)) return `De code ${code} bestaat al.`;
  if (!c.fasen.some((f) => f.id === invoer.faseId)) return "Kies een fase.";
  if (!invoer.titel.trim()) return "Vul een titel in.";
  if (invoer.titel.trim().length > TITEL_MAX) return `De titel mag maximaal ${TITEL_MAX} tekens hebben.`;
  if (invoer.omschrijving.length > OMSCHRIJVING_MAX) return `De omschrijving mag maximaal ${OMSCHRIJVING_MAX} tekens hebben.`;
  if (invoer.apps.some((a) => !APPS.some((x) => x.code === a))) return "Een app is onbekend.";
  return null;
}

export function maakUseCase(invoer: UseCaseInvoer): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const fout = controleerUseCase(c, invoer);
  if (fout) return { ok: false, reden: fout };
  const volgorde = Math.max(0, ...c.useCases.filter((u) => u.faseId === invoer.faseId).map((u) => u.volgorde)) + 1;
  const uc: UseCase = { ...invoer, id: invoer.id.trim(), titel: invoer.titel.trim(), omschrijving: invoer.omschrijving.trim(), volgorde, prompts: [] };
  bewaar({ ...c, useCases: [...c.useCases, uc] });
  log("usecase", `${uc.id} ${uc.titel}`, "aangemaakt");
  return { ok: true };
}

export function wijzigUseCase(id: string, invoer: UseCaseInvoer): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const uc = c.useCases.find((u) => u.id === id);
  if (!uc) return { ok: false, reden: "Use case niet gevonden." };
  const fout = controleerUseCase(c, invoer, id);
  if (fout) return { ok: false, reden: fout };
  const nieuw: UseCase = { ...uc, ...invoer, id: invoer.id.trim(), titel: invoer.titel.trim(), omschrijving: invoer.omschrijving.trim() };
  const velden = gewijzigdeVelden(uc, nieuw);
  if (velden.length === 0) return { ok: true };
  bewaar({ ...c, useCases: c.useCases.map((u) => (u.id === id ? nieuw : u)) });
  log("usecase", `${nieuw.id} ${nieuw.titel}`, "gewijzigd", velden);
  return { ok: true };
}

/** Verbergen of weer tonen: Een verborgen use case verschijnt niet bij de Consultant, maar blijft bestaan voor de stappen die ernaar verwijzen. */
export function verbergUseCase(id: string, verborgen: boolean): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const uc = c.useCases.find((u) => u.id === id);
  if (!uc) return { ok: false, reden: "Use case niet gevonden." };
  if ((uc.verborgen ?? false) === verborgen) return { ok: true };
  bewaar({ ...c, useCases: c.useCases.map((u) => (u.id === id ? { ...u, verborgen } : u)) });
  log("usecase", `${uc.id} ${uc.titel}`, verborgen ? "verborgen" : "getoond");
  return { ok: true };
}

/** Verwijderen kan alleen als er geen Adviesstap naar de use case verwijst (`aantalStappen`); anders kan hij worden verborgen. */
export function verwijderUseCase(id: string, aantalStappen: number): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const uc = c.useCases.find((u) => u.id === id);
  if (!uc) return { ok: false, reden: "Use case niet gevonden." };
  if (aantalStappen > 0) return { ok: false, reden: `Er verwijzen ${aantalStappen} ${aantalStappen === 1 ? "stap" : "stappen"} naar deze use case. Verberg hem in plaats van hem te verwijderen.` };
  bewaar({ ...c, useCases: c.useCases.filter((u) => u.id !== id) });
  log("usecase", `${uc.id} ${uc.titel}`, "verwijderd");
  return { ok: true };
}

/** Een use case een plek omhoog (`-1`) of omlaag (`1`) binnen zijn fase. */
export function verplaatsUseCase(id: string, richting: -1 | 1): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const uc = c.useCases.find((u) => u.id === id);
  if (!uc) return { ok: false, reden: "Use case niet gevonden." };
  const buren = c.useCases.filter((u) => u.faseId === uc.faseId).sort((a, b) => a.volgorde - b.volgorde);
  const i = buren.findIndex((u) => u.id === id);
  const j = i + richting;
  if (j < 0 || j >= buren.length) return { ok: true };
  [buren[i], buren[j]] = [buren[j], buren[i]];
  const nieuweVolgorde = new Map(buren.map((u, k) => [u.id, k + 1]));
  bewaar({ ...c, useCases: c.useCases.map((u) => (nieuweVolgorde.has(u.id) ? { ...u, volgorde: nieuweVolgorde.get(u.id)! } : u)) });
  log("usecase", `${uc.id} ${uc.titel}`, "verplaatst");
  return { ok: true };
}

/* ---------- Prompts ---------- */

/** De context en de prompt van een use case voor een rol. Beide leeg haalt de prompt weg: De use case is dan voor die rol beschikbaar met een lege prompt. */
export function zetPrompt(useCaseId: string, rolId: string, context: string, prompt: string): CatalogusResultaat {
  const c = getAdviesCatalogus();
  const uc = c.useCases.find((u) => u.id === useCaseId);
  if (!uc) return { ok: false, reden: "Use case niet gevonden." };
  if (!c.rollen.some((r) => r.id === rolId)) return { ok: false, reden: "Rol niet gevonden." };
  const rest = uc.prompts.filter((p) => p.rolId !== rolId);
  const nieuw: UseCasePrompt[] = context.trim() === "" && prompt.trim() === "" ? rest : [...rest, { rolId, context: context.trim(), prompt: prompt.trim() }];
  const oud = uc.prompts.find((p) => p.rolId === rolId);
  if (JSON.stringify(oud) === JSON.stringify(nieuw.find((p) => p.rolId === rolId))) return { ok: true };
  bewaar({ ...c, useCases: c.useCases.map((u) => (u.id === useCaseId ? { ...u, prompts: nieuw } : u)) });
  log("prompt", `${uc.id} ${uc.titel}`, "gewijzigd", [rolId]);
  return { ok: true };
}
