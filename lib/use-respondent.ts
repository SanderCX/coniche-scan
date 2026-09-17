import { useSyncExternalStore } from "react";
import { Respondent } from "./types";
import { getRespondentSnapshot, subscribeRespondent } from "./storage";

function getServerSnapshot(): string | null {
  return null;
}

/** Leest de huidige respondent uit localStorage en her-rendert bij elke wijziging. */
export function useRespondent(): Respondent | null {
  const ruw = useSyncExternalStore(subscribeRespondent, getRespondentSnapshot, getServerSnapshot);
  if (!ruw) return null;
  try {
    return JSON.parse(ruw) as Respondent;
  } catch {
    return null;
  }
}
