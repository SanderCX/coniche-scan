import { useSyncExternalStore } from "react";
import {
  Organisatie,
  OrganisatieLid,
  ScanInvulling,
  ScanUitvoering,
  ScanWeergave,
} from "./types";
import { nieuwId } from "./id";
import { genereerToegangscode } from "./toegangscode";
import { demoOrganisatie } from "@/data/demo-organisatie";
import { GevalideerdeRij } from "./import-legacy";

const KEY = "coniche-scan:organisaties";
const SERVER_SENTINEL = "__server__";

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void {
  listeners.forEach((l) => l());
}
function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Leest de ruwe snapshot-string; zaait localStorage bij het eerste gebruik. Puur op basis
 * van deze string, zodat de hooks hieronder tijdens hydration exact hetzelfde opleveren als
 * de server (die altijd SERVER_SENTINEL ziet). */
function getSnapshot(): string {
  if (typeof window === "undefined") return SERVER_SENTINEL;
  const ruw = window.localStorage.getItem(KEY);
  if (ruw) return ruw;
  const seed = JSON.stringify([structuredClone(demoOrganisatie)]);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

/**
 * Vangt oudere of beschadigde localStorage-data op: elke plek in dit
 * bestand gaat ervan uit dat `leden`/`scanUitvoeringen`/`invullingen`
 * altijd arrays zijn (bijv. `organisatie.leden.find(...)`), zonder losse
 * undefined-checks per aanroep. Zonder deze normalisatie crasht de hele
 * app op een enkel organisatie-record dat niet meer helemaal klopt met
 * het huidige `Organisatie`-type (bijv. een browser met een oudere versie
 * van de opslag, of een handmatig bewerkte localStorage-waarde) — dat is
 * hier gemeld als "Cannot read properties of undefined (reading 'find')"
 * op `organisatie.leden`. Geen migratie van de inhoud, alleen de vorm.
 */
function normaliseerOrganisatie(ruw: Organisatie): Organisatie {
  return {
    ...ruw,
    kenmerken: ruw.kenmerken && typeof ruw.kenmerken === "object" ? ruw.kenmerken : {},
    leden: Array.isArray(ruw.leden) ? ruw.leden : [],
    scanUitvoeringen: Array.isArray(ruw.scanUitvoeringen)
      ? ruw.scanUitvoeringen.map((s) => ({
          ...s,
          invullingen: Array.isArray(s.invullingen) ? s.invullingen : [],
        }))
      : [],
  };
}

function parseSnapshot(snapshot: string): Organisatie[] {
  if (snapshot === SERVER_SENTINEL) return [];
  try {
    const alles = JSON.parse(snapshot) as Organisatie[];
    if (!Array.isArray(alles)) return [];
    return alles.map(normaliseerOrganisatie);
  } catch {
    return [];
  }
}

function laadAlles(): Organisatie[] {
  return parseSnapshot(getSnapshot());
}

function slaAlles(alles: Organisatie[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(alles));
  emitChange();
}

export function useOrganisaties(): Organisatie[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return parseSnapshot(snapshot);
}

export function useOrganisatie(id: string): Organisatie | undefined {
  return useOrganisaties().find((o) => o.id === id);
}

export function maakOrganisatie(input: {
  naam: string;
  kenmerken: Record<string, unknown>;
}): Organisatie {
  const nu = new Date().toISOString();
  const organisatie: Organisatie = {
    id: nieuwId(),
    naam: input.naam,
    kenmerken: input.kenmerken,
    leden: [],
    scanUitvoeringen: [],
    aangemaaktOp: nu,
    gewijzigdOp: nu,
  };
  const alles = laadAlles();
  alles.push(organisatie);
  slaAlles(alles);
  return organisatie;
}

/** Cascadeert naar alle leden, scanuitvoeringen en invullingen van elke organisatie. */
export function verwijderOrganisaties(organisatieIds: string[]): void {
  const ids = new Set(organisatieIds);
  slaAlles(laadAlles().filter((o) => !ids.has(o.id)));
}

export function updateOrganisatie(
  organisatieId: string,
  updater: (organisatie: Organisatie) => Organisatie
): void {
  const alles = laadAlles();
  const index = alles.findIndex((o) => o.id === organisatieId);
  if (index === -1) return;
  const { leden, scanUitvoeringen } = alles[index];
  alles[index] = {
    ...updater(structuredClone(alles[index])),
    leden,
    scanUitvoeringen,
    gewijzigdOp: new Date().toISOString(),
  };
  slaAlles(alles);
}

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

/** Genereert een toegangscode die nog niet in gebruik is (zie lib/toegangscode.ts). */
function genereerUniekeToegangscode(alles: Organisatie[]): string {
  const inGebruik = new Set(alles.flatMap((o) => o.leden.map((l) => l.toegangscode)));
  let code = genereerToegangscode();
  while (inGebruik.has(code)) code = genereerToegangscode();
  return code;
}

function maakInvulling(scanUitvoeringId: string, organisatieLidId: string): ScanInvulling {
  return {
    id: nieuwId(),
    scanUitvoeringId,
    organisatieLidId,
    status: "uitgenodigd",
    antwoorden: {},
    opmerkingenPerBouwblok: {},
    uitgenodigdOp: new Date().toISOString(),
    gestartOp: null,
    afgerondOp: null,
  };
}

/**
 * Nodigt een lid uit voor een scanuitvoering: hergebruikt een bestaand
 * OrganisatieLid met dit e-mailadres binnen de organisatie (bijv. iemand die
 * al eerder een andere scan deed), anders wordt een nieuw lid aangemaakt.
 * Maakt daarbinnen een nieuwe ScanInvulling — of geeft de bestaande terug als
 * dit lid al voor deze scanuitvoering was uitgenodigd.
 */
export function nodigLidUit(
  scanUitvoeringId: string,
  email: string
): { lid: OrganisatieLid; invulling: ScanInvulling } | null {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const scanUitvoering = organisatie.scanUitvoeringen.find((s) => s.id === scanUitvoeringId);
    if (!scanUitvoering) continue;

    let lid = organisatie.leden.find(
      (l) => l.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!lid) {
      lid = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        email: email.trim(),
        naam: null,
        functie: "",
        team: "",
        notities: "",
        toegangscode: genereerUniekeToegangscode(alles),
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }

    let invulling = scanUitvoering.invullingen.find((i) => i.organisatieLidId === lid!.id);
    if (!invulling) {
      invulling = maakInvulling(scanUitvoeringId, lid.id);
      scanUitvoering.invullingen.push(invulling);
    }

    slaAlles(alles);
    return { lid, invulling };
  }
  return null;
}

interface ScanInvullingContext {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
  lid: OrganisatieLid;
  invulling: ScanInvulling;
}

function zoekScanInvulling(alles: Organisatie[], scanInvullingId: string): ScanInvullingContext | null {
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

export interface RespondentContext {
  organisatie: Organisatie;
  lid: OrganisatieLid;
  /** Al diens invullingen, over alle scanuitvoeringen van de organisatie heen. */
  invullingen: { scanUitvoering: ScanUitvoering; invulling: ScanInvulling }[];
}

/**
 * Zoekt het lid achter een toegangscode (de publieke link, v1-
 * aanpassingen.md punt 2) en al zijn invullingen. Retourneert null als de
 * code niet (meer) bestaat — bijv. na verwijderen van het lid, waarmee de
 * code vanzelf ongeldig wordt (staat immers op het lid zelf).
 */
function zoekRespondentPerToegangscode(alles: Organisatie[], code: string): RespondentContext | null {
  for (const organisatie of alles) {
    const lid = organisatie.leden.find((l) => l.toegangscode === code);
    if (!lid) continue;
    const invullingen = organisatie.scanUitvoeringen.flatMap((scanUitvoering) =>
      scanUitvoering.invullingen
        .filter((invulling) => invulling.organisatieLidId === lid.id)
        .map((invulling) => ({ scanUitvoering, invulling }))
    );
    return { organisatie, lid, invullingen };
  }
  return null;
}

export function useRespondentPerToegangscode(code: string): RespondentContext | null {
  const alles = useOrganisaties();
  return zoekRespondentPerToegangscode(alles, code);
}

interface ScanUitvoeringContext {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
}

function zoekScanUitvoering(alles: Organisatie[], scanUitvoeringId: string): ScanUitvoeringContext | null {
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
 * "Leden verwijderen": verwijdert het hele OrganisatieLid, met cascade naar
 * al diens scan-invullingen (in elke scanuitvoering van de organisatie). De
 * organisatie en overige leden blijven ongemoeid.
 */
export function verwijderLeden(ledIds: string[]): void {
  const ids = new Set(ledIds);
  const alles = laadAlles();
  for (const organisatie of alles) {
    organisatie.leden = organisatie.leden.filter((l) => !ids.has(l.id));
    for (const scanUitvoering of organisatie.scanUitvoeringen) {
      scanUitvoering.invullingen = scanUitvoering.invullingen.filter(
        (i) => !ids.has(i.organisatieLidId)
      );
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

export interface LegacyImportKeuze {
  rij: GevalideerdeRij;
  assessmentId: string;
  /** null = nieuwe organisatie aanmaken met `rij.organisatieNaam`. */
  organisatieId: string | null;
}

/**
 * Schrijft gevalideerde rijen (`lib/import-legacy.ts`) definitief weg
 * (`import-legacy-scans.md`, Werkwijze in beheer, stap 4-5). Per rij altijd
 * een nieuwe Meting ("Legacy-import {jaar}"): De oude tool kende geen
 * Meting, dus imports in hetzelfde jaar voor dezelfde organisatie delen wel
 * het label maar blijven losse Meting-records, niet samengevoegd.
 *
 * Een respondent die al bestaat (zelfde e-mailadres binnen de organisatie)
 * wordt hergebruikt zonder zijn naam/functie/team/notities te overschrijven
 * — dat is bewust een terughoudende keuze (niet in de spec expliciet
 * vastgelegd): De import mag geen recentere, zelf ingevoerde gegevens van
 * een bestaande respondent overschrijven met oudere importdata.
 */
export function voerLegacyImportUit(keuzes: LegacyImportKeuze[]): { geimporteerd: number } {
  const alles = laadAlles();
  let geimporteerd = 0;

  for (const { rij, assessmentId, organisatieId } of keuzes) {
    let organisatie = organisatieId ? alles.find((o) => o.id === organisatieId) : undefined;
    let nieuwAangemaakt = false;
    if (!organisatie) {
      const nu = new Date().toISOString();
      organisatie = {
        id: nieuwId(),
        naam: rij.organisatieNaam,
        kenmerken: {},
        leden: [],
        scanUitvoeringen: [],
        aangemaaktOp: nu,
        gewijzigdOp: nu,
      };
      alles.push(organisatie);
      nieuwAangemaakt = true;
    }

    // "nieuw"-formaat: organisatie_kenmerken is al compleet, alleen toepassen bij een
    // nieuw aangemaakte organisatie — bij hergebruik van een bestaande organisatie
    // blijven haar eigen, mogelijk recentere kenmerken staan.
    if (rij.organisatieKenmerken && nieuwAangemaakt) {
      organisatie.kenmerken = { ...rij.organisatieKenmerken };
    } else if ((rij.sectorTitel || rij.subsectorTitel) && !organisatie.kenmerken["sector-subsector"]) {
      organisatie.kenmerken["sector-subsector"] = {
        sector: rij.sectorTitel ?? "",
        subsector: rij.subsectorTitel ?? "",
      };
    }

    let lid = organisatie.leden.find(
      (l) => l.email.trim().toLowerCase() === rij.respondentEmail.trim().toLowerCase()
    );
    if (!lid) {
      lid = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        email: rij.respondentEmail.trim(),
        naam: rij.respondentNaam || null,
        functie: rij.respondentFunctie,
        team: rij.respondentTeam,
        notities: rij.respondentNotities,
        toegangscode: genereerUniekeToegangscode(alles),
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }

    const scanUitvoering: ScanUitvoering = {
      id: nieuwId(),
      organisatieId: organisatie.id,
      assessmentId,
      label: rij.meetingLabel,
      aangemaaktOp: new Date().toISOString(),
      invullingen: [],
    };
    const invulling: ScanInvulling = {
      id: nieuwId(),
      scanUitvoeringId: scanUitvoering.id,
      organisatieLidId: lid.id,
      status: rij.status,
      antwoorden: rij.antwoorden,
      opmerkingenPerBouwblok: rij.opmerkingenPerBouwblok,
      uitgenodigdOp: rij.uitgenodigdOp,
      gestartOp: rij.gestartOp,
      afgerondOp: rij.afgerondOp,
    };
    scanUitvoering.invullingen.push(invulling);
    organisatie.scanUitvoeringen.push(scanUitvoering);
    geimporteerd++;
  }

  slaAlles(alles);
  return { geimporteerd };
}

