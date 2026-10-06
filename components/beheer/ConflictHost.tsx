"use client";

import { useSyncExternalStore } from "react";
import { ConflictOplossen } from "@/components/beheer/ConflictOplossen";
import { zetBeheerMelding } from "@/components/beheer/BeheerMelding";

/**
 * Host voor de modal "Conflict oplossen" (`beheerpagina.md`, punt 6b). Staat in `BeheerChrome`, zodat
 * elke plek die scans naar een andere Meting verplaatst (Respondent-overzicht, Scan-overzicht, Ingevulde
 * scans, Meting-overzicht) dezelfde modal opent met `openConflict`, ook nadat de verplaatsstap zelf is gesloten.
 */
interface ConflictState {
  organisatieId: string;
  scanId: string;
  doelMetingId: string;
}

let huidig: ConflictState | null = null;
const luisteraars = new Set<() => void>();

export function openConflict(c: ConflictState | null): void {
  huidig = c;
  luisteraars.forEach((l) => l());
}

function subscribe(l: () => void) {
  luisteraars.add(l);
  return () => luisteraars.delete(l);
}

/** Per overgeslagen scan met dit conflict een knop "Conflict oplossen", voor in een melding. */
export function conflictActies(
  organisatieId: string,
  overgeslagen: { scanInvullingId: string; conflict?: { doelMetingId: string } }[]
): { label: string; onClick: () => void }[] {
  const metConflict = overgeslagen.filter((o) => o.conflict);
  return metConflict.map((o, i) => ({
    label: metConflict.length === 1 ? "Conflict oplossen" : `Conflict oplossen (${i + 1})`,
    onClick: () => openConflict({ organisatieId, scanId: o.scanInvullingId, doelMetingId: o.conflict!.doelMetingId }),
  }));
}

export function ConflictHost() {
  const conflict = useSyncExternalStore(
    subscribe,
    () => huidig,
    () => null
  );
  if (!conflict) return null;
  return (
    <ConflictOplossen
      key={`${conflict.scanId}-${conflict.doelMetingId}`}
      organisatieId={conflict.organisatieId}
      verplaatsScanId={conflict.scanId}
      doelMetingId={conflict.doelMetingId}
      onSluit={() => openConflict(null)}
      onKlaar={(tekst) => {
        openConflict(null);
        zetBeheerMelding({ tekst });
      }}
    />
  );
}
