import { Respondent } from "./types";
import { demoOrganisatie } from "@/data/demo-organisatie";

const RESPONDENT_KEY = "coniche-scan:respondent";

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** Voor useSyncExternalStore: laat componenten reageren op wijzigingen in de respondent. */
export function subscribeRespondent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRespondentSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(RESPONDENT_KEY);
}

function nieuwId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `resp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function starteRespondent(input: {
  naam: string;
  rol: string;
  team: string;
  notities: string;
}): Respondent {
  const respondent: Respondent = {
    id: nieuwId(),
    organisatieId: demoOrganisatie.id,
    email: "",
    naam: input.naam,
    rol: input.rol,
    team: input.team,
    notities: input.notities,
    antwoorden: {},
    opmerkingenPerBouwblok: {},
    status: "bezig",
    gestartOp: new Date().toISOString(),
    afgerondOp: null,
  };
  slaRespondentOp(respondent);
  return respondent;
}

export function haalHuidigeRespondent(): Respondent | null {
  if (typeof window === "undefined") return null;
  const ruw = window.localStorage.getItem(RESPONDENT_KEY);
  if (!ruw) return null;
  try {
    return JSON.parse(ruw) as Respondent;
  } catch {
    return null;
  }
}

export function slaRespondentOp(respondent: Respondent): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESPONDENT_KEY, JSON.stringify(respondent));
  emitChange();
}

export function updateAntwoord(vraagId: string, waarde: number): Respondent | null {
  const respondent = haalHuidigeRespondent();
  if (!respondent) return null;
  respondent.antwoorden[vraagId] = waarde;
  slaRespondentOp(respondent);
  return respondent;
}

export function updateOpmerking(bouwblokId: string, tekst: string): Respondent | null {
  const respondent = haalHuidigeRespondent();
  if (!respondent) return null;
  respondent.opmerkingenPerBouwblok[bouwblokId] = tekst;
  slaRespondentOp(respondent);
  return respondent;
}

export function rondAf(): Respondent | null {
  const respondent = haalHuidigeRespondent();
  if (!respondent) return null;
  respondent.status = "afgerond";
  respondent.afgerondOp = new Date().toISOString();
  slaRespondentOp(respondent);
  return respondent;
}

export function wisRespondent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RESPONDENT_KEY);
  emitChange();
}
