import { useEffect, useSyncExternalStore } from "react";

/**
 * Een tabbladtitel die een pagina zelf bepaalt (`stylesheet.md`, Tabbladtitel): De Dossierpagina heet naar de naam voor de Lead, `{naam} | Coniche
 * Scan`. `PaginaTitel` (`components/PaginaTitel.tsx`) zet anders de titel uit het pad (`data/pagina-titels.ts`).
 */
let titel: string | null = null;
const luisteraars = new Set<() => void>();

function zet(nieuw: string | null): void {
  titel = nieuw;
  luisteraars.forEach((l) => l());
}

export function subscribeTitel(l: () => void): () => void {
  luisteraars.add(l);
  return () => luisteraars.delete(l);
}

export function getTitelOverride(): string | null {
  return titel;
}

/** De volledige tabbladtitel bij een paginanaam: "{naam} | Coniche Scan". */
export function titelMetSite(naam: string, site = "Coniche Scan"): string {
  return `${naam} | ${site}`;
}

/** Zet voor zolang de pagina open is een eigen paginanaam in de tabbladtitel. Een lege naam laat de titel uit het pad staan. */
export function useEigenPaginaTitel(naam: string | null): void {
  useEffect(() => {
    zet(naam ? titelMetSite(naam) : null);
    return () => zet(null);
  }, [naam]);
}

export function useTitelOverride(): string | null {
  return useSyncExternalStore(subscribeTitel, getTitelOverride, () => null);
}
