"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Laat een beheerpagina haar eigen scherm-specifieke acties (CLAUDE.md
 * sectie 3, Globale layout, punt 1) in `.nav-right` zetten, uiterst
 * links — vóór Applicatie/Assessments/Organisaties, net als "Naar
 * resultaten →" op de doorloopflow of "Terug naar de scan" + Exporteren
 * op de resultatenpagina. `BeheerChrome` rendert deze content en zet er
 * zelf de scheidingslijn achter (alleen als er iets is); de pagina hoeft
 * zelf geen scheidingslijn te tekenen.
 *
 * Nodig als losse context omdat `BeheerChrome` in `app/beheer/layout.tsx`
 * zit (één laag boven elke pagina) en dus geen `navRight`-prop van een
 * individuele pagina kan aannemen zoals `PageWithChrome` dat wel kan.
 */
const SetterContext = createContext<((node: React.ReactNode) => void) | null>(null);
const ValueContext = createContext<React.ReactNode>(null);

export function BeheerNavActionsProvider({ children }: { children: React.ReactNode }) {
  const [navActions, setNavActions] = useState<React.ReactNode>(null);
  return (
    <SetterContext.Provider value={setNavActions}>
      <ValueContext.Provider value={navActions}>{children}</ValueContext.Provider>
    </SetterContext.Provider>
  );
}

/** Door `BeheerChrome` aangeroepen om de huidige nav-acties te lezen en te renderen. */
export function useBeheerNavActionsValue(): React.ReactNode {
  return useContext(ValueContext);
}

/**
 * Door een beheerpagina aan te roepen met haar eigen nav-right-content.
 * Registreert eenmalig bij mount en ruimt op bij unmount (lege
 * dependency-array, bewust): `node` is hier doorgaans statische JSX
 * (vaste links), geen afgeleide van state die na mount nog wijzigt — een
 * dependency op `node` zelf zou bij elke render een nieuw JSX-object zien
 * en in een oneindige update-lus terechtkomen.
 */
export function useBeheerNavActions(node: React.ReactNode): void {
  const setNavActions = useContext(SetterContext);
  useEffect(() => {
    setNavActions?.(node);
    return () => setNavActions?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
