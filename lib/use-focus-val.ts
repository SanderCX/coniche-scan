import { RefObject, useEffect } from "react";

/**
 * Toegankelijkheid van een modal (WCAG 2.4.3 en 2.1.2): Bij het openen
 * gaat de focus naar de modal, Tab en Shift+Tab blijven binnen de modal,
 * en bij het sluiten keert de focus terug naar het element waar de
 * gebruiker vandaan kwam. Staan er modals boven elkaar (een bevestiging
 * boven een overzicht), dan houdt alleen de bovenste de focus vast.
 */
const stapel: symbol[] = [];

const FOCUSBAAR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusVal(actief: boolean, containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!actief || !container) return;
    const id = Symbol("modal");
    stapel.push(id);
    const vorige = document.activeElement as HTMLElement | null;
    container.focus();

    function focusbaar(): HTMLElement[] {
      return Array.from(container!.querySelectorAll<HTMLElement>(FOCUSBAAR)).filter((el) => el.offsetParent !== null);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || stapel[stapel.length - 1] !== id) return;
      const lijst = focusbaar();
      if (lijst.length === 0) {
        e.preventDefault();
        container!.focus();
        return;
      }
      const eerste = lijst[0];
      const laatste = lijst[lijst.length - 1];
      const buiten = !container!.contains(document.activeElement) || document.activeElement === container;
      if (e.shiftKey && (document.activeElement === eerste || buiten)) {
        e.preventDefault();
        laatste.focus();
      } else if (!e.shiftKey && (document.activeElement === laatste || buiten)) {
        e.preventDefault();
        eerste.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const plek = stapel.indexOf(id);
      if (plek !== -1) stapel.splice(plek, 1);
      vorige?.focus?.();
    };
  }, [actief, containerRef]);
}
