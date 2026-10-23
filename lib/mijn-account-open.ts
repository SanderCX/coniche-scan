import { useSyncExternalStore } from "react";

/**
 * "Aanpassen in Mijn account" (`adviesverloop.md`, Jouw rol bij deze klant): Een scherm vraagt de modal Mijn account te openen op een tab. De modal staat in
 * de beheerchrome; dit kleine kanaal verbindt de twee zonder dat het scherm de modal zelf hoeft te kennen.
 */
export type MijnAccountTab = "gegevens" | "adviescontext";

let verzoek: { tab: MijnAccountTab; nr: number } | null = null;
const luisteraars = new Set<() => void>();

export function openMijnAccount(tab: MijnAccountTab = "gegevens"): void {
  verzoek = { tab, nr: (verzoek?.nr ?? 0) + 1 };
  luisteraars.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  luisteraars.add(l);
  return () => luisteraars.delete(l);
}

/** Het laatste verzoek (met een oplopend nummer, zodat dezelfde tab opnieuw openen opnieuw telt), of `null`. */
export function useMijnAccountVerzoek(): { tab: MijnAccountTab; nr: number } | null {
  return useSyncExternalStore(subscribe, () => verzoek, () => null);
}
