import { Organisatie, ScanUitvoering } from "../types";
import { laadAlles, slaAlles, useOrganisaties } from "./store";
import { logAudit } from "../audit-store";
import { metingContext } from "../audit-context";
import { haalMetingenUitBenchmarks } from "../benchmark-store";
import { isSamengesteld, samengesteldeMetingenMet } from "../metingen";
import { blokkadeVerwijderenMeting } from "../advies";
import type { Resultaat } from "./meting-plannen";

/** Metingen (in de code `ScanUitvoering`): verwijderen en opzoeken. Plannen en wijzigen staan in `meting-plannen.ts`. */

/**
 * Meting verwijderen (datamodel.md, "Verwijderen en datakoppelingen"): de
 * meting en alle invullingen daarbinnen. Respondenten (en hun
 * toegangscode/andere invullingen) blijven bestaan — alleen deze ene
 * `ScanUitvoering` verdwijnt uit `organisatie.scanUitvoeringen`. Is het de enige gekoppelde Meting van een adviesverloop, dan gebeurt er
 * niets en staat de reden in het resultaat (`datamodel.md`, Verwijderen en datakoppelingen).
 */
export function verwijderMeting(scanUitvoeringId: string): Resultaat {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const index = organisatie.scanUitvoeringen.findIndex((s) => s.id === scanUitvoeringId);
    if (index === -1) continue;
    const blokkade = blokkadeVerwijderenMeting(organisatie, scanUitvoeringId);
    if (blokkade) return { ok: false, reden: blokkade };
    const [meting] = organisatie.scanUitvoeringen.splice(index, 1);
    // Een onderliggende Meting valt uit de samenstelling van een samengestelde Meting. Houdt ze er niets over, dan verdwijnt
    // ze zelf (`slaAlles`): Dat staat ook in het log (`benchmark.md`, Verwijderen van een onderliggende Meting).
    const geraakt = samengesteldeMetingenMet({ scanUitvoeringen: [...organisatie.scanUitvoeringen, meting] }, meting.id);
    const verdwijnt = geraakt.filter((s) => s.samenstelling!.every((id) => id === meting.id));
    // Het lid met deze Meting verdwijnt uit elke benchmark waarin het meedoet (`datamodel.md`). Eerst uit de benchmarks, dan
    // opslaan: `slaAlles` laat de vinkjes van Leads voor die benchmark en voor deze Meting vervallen.
    haalMetingenUitBenchmarks([{ metingId: meting.id, organisatieNaam: organisatie.naam }]);
    slaAlles(alles);
    logAudit([
      {
        actie: isSamengesteld(meting) ? "meting.samengesteldVerwijderd" : "meting.verwijderd",
        entiteitType: "meting",
        entiteitId: meting.id,
        entiteitNaam: meting.label,
        details: { ...metingContext(organisatie, meting), aantalScans: meting.invullingen.length },
      },
      ...verdwijnt.map((s) => ({
        actie: "meting.samengesteldVerwijderd",
        entiteitType: "meting",
        entiteitId: s.id,
        entiteitNaam: s.label,
        details: { ...metingContext(organisatie, s), reden: "onderliggende Meting verwijderd" },
      })),
    ]);
    return { ok: true };
  }
  return { ok: true };
}

export interface ScanUitvoeringContext {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
}

export function zoekScanUitvoering(alles: Organisatie[], scanUitvoeringId: string): ScanUitvoeringContext | null {
  for (const organisatie of alles) {
    const scanUitvoering = organisatie.scanUitvoeringen.find((s) => s.id === scanUitvoeringId);
    if (scanUitvoering) return { organisatie, scanUitvoering };
  }
  return null;
}

/** Voor de rapportage-pagina (gemiddelde over alle afgeronde invullingen van één meting). */
export function useScanUitvoering(scanUitvoeringId: string): ScanUitvoeringContext | null {
  const alles = useOrganisaties();
  return zoekScanUitvoering(alles, scanUitvoeringId);
}
