import { Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering, ScanWeergave } from "../types";
import { laadAlles, slaAlles, useOrganisaties } from "./store";

/** Ingevulde scans (`ScanInvulling`): opzoeken, bijwerken, intake, bewaartermijn, verwijderen en de integriteitscontrole. */

export interface ScanInvullingContext {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
  lid: OrganisatieLid;
  invulling: ScanInvulling;
}

export function zoekScanInvulling(alles: Organisatie[], scanInvullingId: string): ScanInvullingContext | null {
  for (const organisatie of alles) {
    for (const scanUitvoering of organisatie.scanUitvoeringen) {
      const invulling = scanUitvoering.invullingen.find((i) => i.id === scanInvullingId);
      if (!invulling) continue;
      const lid = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
      if (!lid) continue;
      return { organisatie, scanUitvoering, lid, invulling };
    }
  }
  return null;
}

export function getScanInvulling(scanInvullingId: string): ScanInvullingContext | null {
  return zoekScanInvulling(laadAlles(), scanInvullingId);
}

export function useScanInvulling(scanInvullingId: string): ScanInvullingContext | null {
  const alles = useOrganisaties();
  return zoekScanInvulling(alles, scanInvullingId);
}

/** Weergavemodel voor Sidebar/BouwblokForm/MobielVoortgang, zie lib/types.ts `ScanWeergave`. */
export function scanWeergave(lid: OrganisatieLid, invulling: ScanInvulling): ScanWeergave {
  return {
    naam: lid.naam,
    antwoorden: invulling.antwoorden,
    opmerkingenPerBouwblok: invulling.opmerkingenPerBouwblok,
  };
}

/** Generieke update op een scan-invulling (antwoorden, opmerkingen, status, ...). */
export function updateScanInvulling(
  scanInvullingId: string,
  updater: (invulling: ScanInvulling) => ScanInvulling
): ScanInvulling | null {
  const alles = laadAlles();
  for (const organisatie of alles) {
    for (const scanUitvoering of organisatie.scanUitvoeringen) {
      const index = scanUitvoering.invullingen.findIndex((i) => i.id === scanInvullingId);
      if (index !== -1) {
        scanUitvoering.invullingen[index] = updater(
          structuredClone(scanUitvoering.invullingen[index])
        );
        slaAlles(alles);
        return scanUitvoering.invullingen[index];
      }
    }
  }
  return null;
}

/**
 * Scherm 4 (intake): naam/functie/team/notities horen bij de PERSOON
 * (OrganisatieLid), status/gestartOp bij deze ene invulling — vóór deze
 * refactor stond dat allemaal op hetzelfde record, nu twee updates in één
 * stap voor het intakeformulier.
 */
export function voltooiIntake(
  scanInvullingId: string,
  input: { naam: string; functie: string; team: string; notities: string }
): void {
  const alles = laadAlles();
  const gevonden = zoekScanInvulling(alles, scanInvullingId);
  if (!gevonden) return;
  const { organisatie, scanUitvoering, lid, invulling } = gevonden;
  const lidIndex = organisatie.leden.findIndex((l) => l.id === lid.id);
  organisatie.leden[lidIndex] = {
    ...lid,
    naam: input.naam,
    functie: input.functie,
    team: input.team,
    notities: input.notities,
  };
  const invullingIndex = scanUitvoering.invullingen.findIndex((i) => i.id === invulling.id);
  scanUitvoering.invullingen[invullingIndex] = {
    ...invulling,
    status: "bezig",
    gestartOp: new Date().toISOString(),
  };
  slaAlles(alles);
}

/**
 * "Verlengen" bij de bewaartermijn (`datamodel.md` deel 2, Bewaartermijn
 * ingevulde scans): zet `bewaarVerlengdTot` op nu + `verlengTermijnDagen`,
 * de scan verdwijnt daarmee uit de "Data ouder dan de bewaartermijn"-lijst
 * tot die nieuwe datum verstreken is. Geen aparte verwijderlogica.
 */
export function verlengBewaartermijn(scanInvullingId: string, verlengTermijnDagen: number): void {
  updateScanInvulling(scanInvullingId, (invulling) => {
    const nieuweDatum = new Date();
    nieuweDatum.setDate(nieuweDatum.getDate() + verlengTermijnDagen);
    return { ...invulling, bewaarVerlengdTot: nieuweDatum.toISOString() };
  });
}

/**
 * "Ingevulde scans verwijderen": gooit de scan-invulling zelf helemaal weg
 * (de rij verdwijnt uit "Ingevulde scans"), niet alleen resetten. Het lid
 * blijft bestaan — inclusief eventuele ANDERE invullingen die diezelfde
 * persoon voor andere metingen heeft — er verdwijnt alleen deze ene
 * uitnodiging/poging voor deze ene scanuitvoering.
 */
export function verwijderScanInvullingen(scanInvullingIds: string[]): void {
  const ids = new Set(scanInvullingIds);
  const alles = laadAlles();
  for (const organisatie of alles) {
    for (const scanUitvoering of organisatie.scanUitvoeringen) {
      scanUitvoering.invullingen = scanUitvoering.invullingen.filter((i) => !ids.has(i.id));
    }
  }
  slaAlles(alles);
}

/**
 * "Geen achterblijvende data na verwijderen" (v1-aanpassingen.md punt 14):
 * controleert of elke ScanInvulling nog naar een bestaand lid wijst.
 * Organisaties/scanuitvoeringen/invullingen kunnen zelf niet verweesd
 * raken (ze zitten genest in hun eigen ouder, dus verdwijnen automatisch
 * met die ouder) — dit is de enige plek waar dat WEL kan: `verwijderLeden`
 * moet cascaderen naar alle scanuitvoeringen van de organisatie. Lege
 * lijst = geen achterblijvende data gevonden.
 */
export function controleerDataIntegriteit(): string[] {
  const problemen: string[] = [];
  for (const organisatie of laadAlles()) {
    const ledenIds = new Set(organisatie.leden.map((l) => l.id));
    for (const scanUitvoering of organisatie.scanUitvoeringen) {
      for (const invulling of scanUitvoering.invullingen) {
        if (!ledenIds.has(invulling.organisatieLidId)) {
          problemen.push(
            `Invulling ${invulling.id} (meting "${scanUitvoering.label}" bij organisatie "${organisatie.naam}") verwijst naar een niet-bestaand lid ${invulling.organisatieLidId}.`
          );
        }
      }
    }
  }
  return problemen;
}
