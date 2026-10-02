import { Organisatie, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { laadAlles, slaAlles, useOrganisaties } from "./store";

/** Metingen (in de code `ScanUitvoering`): plannen, hernoemen, verwijderen en opzoeken. */

/** Plant een nieuwe scanronde (assessment-type) binnen een organisatie. */
export function maakScanUitvoering(
  organisatieId: string,
  input: { assessmentId: string; label: string }
): ScanUitvoering | null {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return null;
  const scanUitvoering: ScanUitvoering = {
    id: nieuwId(),
    organisatieId,
    assessmentId: input.assessmentId,
    label: input.label,
    aangemaaktOp: new Date().toISOString(),
    invullingen: [],
  };
  organisatie.scanUitvoeringen.push(scanUitvoering);
  slaAlles(alles);
  return scanUitvoering;
}

/**
 * Meting wijzigen (beheerpagina.md, punt 5): alleen het label, achteraf
 * aanpasbaar (bijv. een typo corrigeren). Het assessment-type ligt vast
 * na aanmaken — dat achteraf wijzigen zou al ingevulde antwoorden
 * inconsistent maken met een ander scan-type.
 */
export function hernoemMeting(scanUitvoeringId: string, label: string): void {
  const alles = laadAlles();
  const gevonden = zoekScanUitvoering(alles, scanUitvoeringId);
  if (!gevonden) return;
  gevonden.scanUitvoering.label = label;
  slaAlles(alles);
}

/**
 * Meting verwijderen (datamodel.md, "Verwijderen en datakoppelingen"): de
 * meting en alle invullingen daarbinnen. Respondenten (en hun
 * toegangscode/andere invullingen) blijven bestaan — alleen deze ene
 * `ScanUitvoering` verdwijnt uit `organisatie.scanUitvoeringen`.
 */
export function verwijderMeting(scanUitvoeringId: string): void {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const index = organisatie.scanUitvoeringen.findIndex((s) => s.id === scanUitvoeringId);
    if (index === -1) continue;
    organisatie.scanUitvoeringen.splice(index, 1);
    slaAlles(alles);
    return;
  }
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
