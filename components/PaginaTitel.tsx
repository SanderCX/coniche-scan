"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { paginaTitel } from "@/data/pagina-titels";

/**
 * Zet de tabbladtitel op `<Paginanaam> | Coniche Scan` (`stylesheet.md`, Browsericoon). Staat één keer in de
 * root-layout en volgt het pad, zodat geen enkele pagina een eigen titel hoeft te zetten (de meeste pagina's zijn
 * client-componenten en kunnen geen `metadata` exporteren). De namen staan in `data/pagina-titels.ts`.
 */
export function PaginaTitel() {
  const pad = usePathname();
  useEffect(() => {
    const gewenst = paginaTitel(pad);
    const zet = () => {
      if (document.title !== gewenst) document.title = gewenst;
    };
    zet();
    // Next streamt zijn eigen standaardtitel pas na de hydratie de `<head>` in en zet die er dan overheen.
    // Zolang dit pad geldt, zetten we de titel terug zodra hij afwijkt.
    const waker = new MutationObserver(zet);
    waker.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => waker.disconnect();
  }, [pad]);
  return null;
}
