import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Filters, sortering en de geopende modal staan in de adresbalk
 * (beheerpagina.md, "Navigatie in beheer"), zodat terugkeren uit een
 * detailpagina of modal dezelfde lijst toont en een gefilterd overzicht te
 * delen is. Schrijft met `history.replaceState`/`pushState`, die Next.js
 * synchroniseert met `useSearchParams`, zonder de pagina te herladen.
 */

const STATE_VLAG = "beheerOverzicht";

/**
 * State voor `replaceState`: nooit `window.history.state` zelf doorgeven.
 * Next.js herkent daaraan zijn eigen interne aanroepen en synchroniseert
 * de nieuwe URL dan niet met `useSearchParams`.
 */
function schoneState(): Record<string, boolean> {
  return window.history.state?.[STATE_VLAG] ? { [STATE_VLAG]: true } : {};
}

function bouwUrl(pathname: string, wijziging: Record<string, string | null>): string {
  const params = new URLSearchParams(window.location.search);
  for (const [sleutel, waarde] of Object.entries(wijziging)) {
    if (waarde === null || waarde === "") params.delete(sleutel);
    else params.set(sleutel, waarde);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Leest en wijzigt query-parameters van de huidige pagina, zonder een extra history-entry. */
export function useUrlParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const get = useCallback((sleutel: string, standaard = "") => searchParams.get(sleutel) ?? standaard, [searchParams]);
  const set = useCallback(
    (wijziging: Record<string, string | null>) => {
      window.history.replaceState(schoneState(), "", bouwUrl(pathname, wijziging));
    },
    [pathname]
  );
  return { get, set };
}

export type OverzichtSoort = "respondent" | "scan";

/**
 * Het Respondent-overzicht (`?respondent=<id>`) en Scan-overzicht
 * (`?scan=<id>`) als modal boven de pagina waar je was. Openen voegt een
 * history-entry toe, zodat de terugknop van de browser de modal sluit;
 * wisselen tussen de twee vervangt alleen de inhoud. Is de modal geopend
 * via een gedeelde link (geen eigen entry), dan haalt sluiten alleen de
 * parameter weg in plaats van de gebruiker uit de app terug te sturen.
 */
export function useBeheerOverzicht() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const respondentId = searchParams.get("respondent");
  const scanId = searchParams.get("scan");

  const open = useCallback(
    (soort: OverzichtSoort, id: string) => {
      const url = bouwUrl(pathname, { respondent: null, scan: null, [soort]: id });
      window.history.pushState({ [STATE_VLAG]: true }, "", url);
    },
    [pathname]
  );

  const vervang = useCallback(
    (soort: OverzichtSoort, id: string) => {
      const url = bouwUrl(pathname, { respondent: null, scan: null, [soort]: id });
      window.history.replaceState(schoneState(), "", url);
    },
    [pathname]
  );

  const sluit = useCallback(() => {
    if (window.history.state?.[STATE_VLAG]) {
      window.history.back();
    } else {
      window.history.replaceState({}, "", bouwUrl(pathname, { respondent: null, scan: null }));
    }
  }, [pathname]);

  return { respondentId, scanId, open, vervang, sluit };
}

/** Adres van de huidige pagina met het Respondent- of Scan-overzicht erop, filters blijven behouden (voor links in een melding). */
export function overzichtHref(pathname: string, soort: OverzichtSoort, id: string): string {
  return bouwUrl(pathname, { respondent: null, scan: null, [soort]: id });
}
