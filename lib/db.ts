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
import { normaliseerEmail } from "./email";
import { demoOrganisatie } from "@/data/demo-organisatie";
import { GevalideerdeRij } from "./import-legacy";
import { haalServerKopieOp, stuurNaarServer } from "./server-sync";

const KEY = "coniche-scan:organisaties";
const SERVER_SLEUTEL = "organisaties";
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
  // Niet meteen naar de server pushen: zonder lokale data weet deze browser
  // nog niet of de server al écht andere data heeft (die dan ten onrechte
  // overschreven zou worden, vóórdat `haalServerKopieOp` hieronder haar
  // async ophaal-ronde heeft kunnen doen). Pas bij een eerste echte
  // schrijfactie (`slaAlles`) wordt dit zaad alsnog naar de server gestuurd.
  const seed = JSON.stringify([structuredClone(demoOrganisatie)]);
  window.localStorage.setItem(KEY, seed);
  return seed;
}
function getServerSnapshot(): string {
  return SERVER_SENTINEL;
}

// Bij het laden van de pagina: eenmalig de lokale, host-brede serverkopie
// ophalen zodat elke browser op dit apparaat met dezelfde data start
// (lib/server-sync.ts).
if (typeof window !== "undefined") {
  haalServerKopieOp(SERVER_SLEUTEL, KEY, emitChange);
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
    // `email` genormaliseerd (getrimd, lowercase) voor data van vóór die
    // regel bestond (datamodel.md, Respondent) — anders herkent
    // `nodigLidUit`/`voegLeadToe` een bestaand lid met afwijkende casing
    // niet en maakt een dubbele aan.
    leden: Array.isArray(ruw.leden)
      ? ruw.leden.map((l) => ({
          ...l,
          email: normaliseerEmail(l.email),
          leadMetingIds: Array.isArray(l.leadMetingIds) ? l.leadMetingIds : [],
        }))
      : [],
    scanUitvoeringen: Array.isArray(ruw.scanUitvoeringen)
      ? ruw.scanUitvoeringen.map((s) => ({
          ...s,
          invullingen: Array.isArray(s.invullingen)
            ? s.invullingen.map((i) => ({
                ...i,
                bewaarVerlengdTot: i.bewaarVerlengdTot ?? null,
              }))
            : [],
        }))
      : [],
    // Ontbreekt bij data van vóór dit veld (localStorage uit een eerdere
    // sessie) — behandeld als "geen bekende aanmaker", zie Organisatie in
    // lib/types.ts: alleen voor Admin zichtbaar, nooit voor een Consultant.
    aangemaaktDoor: ruw.aangemaaktDoor ?? null,
    toegewezenAan: Array.isArray(ruw.toegewezenAan) ? ruw.toegewezenAan : [],
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
  const json = JSON.stringify(alles);
  window.localStorage.setItem(KEY, json);
  emitChange();
  stuurNaarServer(SERVER_SLEUTEL, json);
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
  /** `Gebruiker.id` van de Consultant/Admin die aanmaakt — bepaalt het bereik "eigen" (`lib/rechten.ts`). */
  aangemaaktDoor: string;
}): Organisatie {
  const nu = new Date().toISOString();
  const organisatie: Organisatie = {
    id: nieuwId(),
    naam: input.naam,
    kenmerken: input.kenmerken,
    leden: [],
    scanUitvoeringen: [],
    aangemaaktDoor: input.aangemaaktDoor,
    toegewezenAan: [],
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

/**
 * "Eigenaarschap overzetten" bij het deactiveren van een Consultant
 * (`beheerpagina.md` punt 9): Alle organisaties die de oude
 * gebruiker aanmaakte, gaan naar de nieuwe — nodig zodat het bereik
 * "aangemaakt" (`lib/rechten.ts`) niet ineens niemand meer toelaat.
 */
export function zetOrganisatiesOver(vanGebruikerId: string, naarGebruikerId: string): number {
  const alles = laadAlles();
  let aantal = 0;
  for (const organisatie of alles) {
    if (organisatie.aangemaaktDoor === vanGebruikerId) {
      organisatie.aangemaaktDoor = naarGebruikerId;
      aantal++;
    }
  }
  if (aantal > 0) slaAlles(alles);
  return aantal;
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
    bewaarVerlengdTot: null,
  };
}

/**
 * Nodigt een lid uit voor een scanuitvoering: hergebruikt een bestaand
 * OrganisatieLid met dit e-mailadres binnen de organisatie (bijv. iemand die
 * al eerder een andere scan deed), anders wordt een nieuw lid aangemaakt.
 * Maakt daarbinnen een nieuwe ScanInvulling — of geeft de bestaande terug als
 * dit lid al voor deze scanuitvoering was uitgenodigd.
 *
 * `ookLeadMaken` (beheerpagina.md punt 6a, vinkje "Ook Lead maken" /
 * "Vragenlijst sturen" vanaf een bestaande Lead): voegt deze scanuitvoering
 * toe aan `leadMetingIds` van het lid, naast de uitnodiging zelf.
 */
export function nodigLidUit(
  scanUitvoeringId: string,
  email: string,
  ookLeadMaken = false
): { lid: OrganisatieLid; invulling: ScanInvulling } | null {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const scanUitvoering = organisatie.scanUitvoeringen.find((s) => s.id === scanUitvoeringId);
    if (!scanUitvoering) continue;

    let lid = organisatie.leden.find((l) => l.email === normaliseerEmail(email));
    if (!lid) {
      lid = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        email: normaliseerEmail(email),
        naam: null,
        functie: "",
        team: "",
        notities: "",
        toegangscode: genereerUniekeToegangscode(alles),
        leadMetingIds: [],
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }

    if (ookLeadMaken && !lid.leadMetingIds.includes(scanUitvoeringId)) {
      lid.leadMetingIds = [...lid.leadMetingIds, scanUitvoeringId];
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

/**
 * "Lead toevoegen" (beheerpagina.md punt 6a): maakt/hergebruikt een lid
 * zoals `nodigLidUit`, maar zonder ScanInvulling — een Lead hoeft geen
 * respondent te zijn. Vereist minstens 1 Meting ("Geen Lead zonder
 * minstens één toegewezen Meting"), afgedwongen door de aanroeper (UI): de
 * lijst mag hier niet leeg binnenkomen.
 */
export function voegLeadToe(
  organisatieId: string,
  input: { naam: string; email: string; metingIds: string[] }
): OrganisatieLid | null {
  if (input.metingIds.length === 0) return null;
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return null;

  let lid = organisatie.leden.find((l) => l.email === normaliseerEmail(input.email));
  if (!lid) {
    lid = {
      id: nieuwId(),
      organisatieId: organisatie.id,
      email: normaliseerEmail(input.email),
      naam: input.naam.trim() || null,
      functie: "",
      team: "",
      notities: "",
      toegangscode: genereerUniekeToegangscode(alles),
      leadMetingIds: [],
      aangemaaktOp: new Date().toISOString(),
    };
    organisatie.leden.push(lid);
  }
  const nieuweIds = input.metingIds.filter((id) => !lid!.leadMetingIds.includes(id));
  if (nieuweIds.length > 0) {
    lid.leadMetingIds = [...lid.leadMetingIds, ...nieuweIds];
  }
  slaAlles(alles);
  return lid;
}

/**
 * "Lead-toegang beheren" (beheerpagina.md punt 6a): zet de volledige lijst
 * Metingen waar dit lid Lead-toegang toe heeft. Alles uitvinken (lege
 * lijst) trekt de Lead-rol in — er is geen apart "is Lead"-veld om los in
 * te trekken.
 */
export function zetLeadMetingen(lidId: string, metingIds: string[]): void {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const lid = organisatie.leden.find((l) => l.id === lidId);
    if (!lid) continue;
    lid.leadMetingIds = metingIds;
    slaAlles(alles);
    return;
  }
}

/**
 * "Gegevens bekijken/wijzigen" in het "Mijn gegevens"-menu (CLAUDE.md
 * sectie 3): schrijft direct naar `Respondent`, geen aparte
 * bevestigingsstap. In tegenstelling tot `voltooiIntake` hierboven raakt
 * dit nooit `ScanInvulling.status`/`gestartOp` — puur de persoonsgegevens,
 * bruikbaar ongeacht of de respondent al eens gestart is.
 */
export function updateRespondentGegevens(
  lidId: string,
  input: { naam: string; functie: string; team: string; notities: string }
): void {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const lidIndex = organisatie.leden.findIndex((l) => l.id === lidId);
    if (lidIndex === -1) continue;
    organisatie.leden[lidIndex] = {
      ...organisatie.leden[lidIndex],
      naam: input.naam,
      functie: input.functie,
      team: input.team,
      notities: input.notities,
    };
    slaAlles(alles);
    return;
  }
}

export interface OverzetResultaat {
  /** Aantal scans dat daadwerkelijk bij de doelrespondent terechtkwam. */
  verplaatst: number;
  /** Scans die bleven staan omdat de doelrespondent in de doel-Meting al een scan heeft. */
  overgeslagen: { scanInvullingId: string; metingLabel: string; reden: string }[];
  /** `true` als de oorspronkelijke respondent (met toegangscode) is verwijderd. */
  respondentVerwijderd: boolean;
}

const REDEN_AL_SCAN_IN_DOEL_METING = "De bestaande respondent heeft in de doel-Meting al een scan.";

/**
 * Hangt de scans van `bronLidId` onder `doelLidId` binnen dezelfde
 * organisatie, en verwijdert daarna de bronrespondent mét zijn
 * toegangscode. Gedeelde bouwsteen achter de "e-mailconflict"-regel
 * (`datamodel.md`, Respondent: hetzelfde e-mailadres binnen een
 * organisatie is altijd één Respondent) bij "Respondent bewerken"
 * (`beheerpagina.md` punt 6b). Een respondent heeft per Meting één scan:
 * heeft de doelrespondent in dezelfde Meting al een scan, dan blijft die
 * ene scan bij de bronrespondent staan en wordt die dan niet verwijderd,
 * zodat er niets stilletjes verloren gaat.
 */
function mergeLidInAnder(organisatie: Organisatie, bronLidId: string, doelLidId: string): OverzetResultaat {
  const resultaat: OverzetResultaat = { verplaatst: 0, overgeslagen: [], respondentVerwijderd: false };
  for (const scanUitvoering of organisatie.scanUitvoeringen) {
    const invulling = scanUitvoering.invullingen.find((i) => i.organisatieLidId === bronLidId);
    if (!invulling) continue;
    if (scanUitvoering.invullingen.some((i) => i.organisatieLidId === doelLidId)) {
      resultaat.overgeslagen.push({
        scanInvullingId: invulling.id,
        metingLabel: scanUitvoering.label,
        reden: REDEN_AL_SCAN_IN_DOEL_METING,
      });
      continue;
    }
    invulling.organisatieLidId = doelLidId;
    resultaat.verplaatst++;
  }
  if (resultaat.overgeslagen.length === 0) {
    organisatie.leden = organisatie.leden.filter((l) => l.id !== bronLidId);
    resultaat.respondentVerwijderd = true;
  }
  return resultaat;
}

/**
 * "Respondent bewerken" (beheerpagina.md punt 6b): admin-kant variant van
 * "Mijn gegevens", met als extra het e-mailadres. Blijkt het nieuwe
 * (genormaliseerde) e-mailadres al bij een andere respondent in dezelfde
 * organisatie te horen, dan voert de aanroeper eerst
 * `vindRespondentConflict` uit en laat de beheerder expliciet bevestigen
 * (`beheerpagina.md`: "E-mailconflict") vóórdat deze functie met
 * `samenvoegenMet` gevuld wordt aangeroepen — zonder die bevestiging mag
 * de aanroeper dit pad niet inslaan.
 */
export function vindRespondentConflict(lidId: string, nieuwEmail: string): OrganisatieLid | null {
  const genormaliseerd = normaliseerEmail(nieuwEmail);
  for (const organisatie of laadAlles()) {
    if (!organisatie.leden.some((l) => l.id === lidId)) continue;
    return organisatie.leden.find((l) => l.id !== lidId && l.email === genormaliseerd) ?? null;
  }
  return null;
}

export function bewerkRespondent(
  lidId: string,
  input: { naam: string; email: string; functie: string; team: string; notities: string },
  samenvoegenMet?: string
): OverzetResultaat | null {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const lidIndex = organisatie.leden.findIndex((l) => l.id === lidId);
    if (lidIndex === -1) continue;

    let resultaat: OverzetResultaat | null = null;
    if (samenvoegenMet) {
      // E-mailconflict, al bevestigd door de beheerder: scans mee naar de
      // bestaande respondent, deze (incl. toegangscode) verdwijnt. Naam/
      // functie/team/notities uit het formulier worden genegeerd — de
      // bestaande respondent behoudt zijn eigen gegevens, zelfde regel als
      // overal elders bij hergebruik van een bestaande Respondent
      // (`datamodel.md`, Respondent).
      resultaat = mergeLidInAnder(organisatie, lidId, samenvoegenMet);
    } else {
      organisatie.leden[lidIndex] = {
        ...organisatie.leden[lidIndex],
        naam: input.naam,
        email: normaliseerEmail(input.email),
        functie: input.functie,
        team: input.team,
        notities: input.notities,
      };
    }
    slaAlles(alles);
    return resultaat;
  }
  return null;
}

/**
 * "Hele respondent verplaatsen" (beheerpagina.md punt 6b): zet
 * `Respondent.organisatieId` om naar een andere, bestaande organisatie,
 * met al zijn `ScanInvulling`s mee. Bestaat in de doelorganisatie al een
 * lid met hetzelfde (genormaliseerde) e-mailadres, dan geldt dezelfde
 * "E-mailconflict"-regel als bij "Respondent bewerken": de aanroeper
 * bevestigt dat eerst expliciet en roept dan aan met `samenvoegenMet`.
 */
export function vindRespondentConflictInOrganisatie(
  doelOrganisatieId: string,
  email: string
): OrganisatieLid | null {
  const doel = laadAlles().find((o) => o.id === doelOrganisatieId);
  if (!doel) return null;
  const genormaliseerd = normaliseerEmail(email);
  return doel.leden.find((l) => l.email === genormaliseerd) ?? null;
}

/**
 * Per Meting waar de respondent een scan in heeft: in welke Meting van de
 * doelorganisatie die scan terechtkomt. `doelMetingId` leeg = een nieuwe
 * Meting aanmaken (met `nieuwLabel`, anders het label van de bron-Meting).
 */
export interface VerplaatsMetingKeuze {
  bronMetingId: string;
  doelMetingId: string | null;
  nieuwLabel?: string;
}

/** Het voorstel voor een bron-Meting: een bestaande Meting in de doelorganisatie met hetzelfde Assessment-type én label, anders `null` (= nieuwe Meting). */
export function voorstelDoelMeting(bronMeting: ScanUitvoering, doelOrganisatie: Organisatie): ScanUitvoering | null {
  return (
    doelOrganisatie.scanUitvoeringen.find(
      (s) => s.assessmentId === bronMeting.assessmentId && s.label === bronMeting.label
    ) ?? null
  );
}

export interface VerplaatsRespondentResultaat extends OverzetResultaat {
  ok: boolean;
  reden?: string;
  /** Id van de respondent in de doelorganisatie (de verplaatste of de bestaande), voor een link in de melding. */
  doelLidId: string | null;
}

export function verplaatsRespondentNaarOrganisatie(
  lidId: string,
  doelOrganisatieId: string,
  keuzes: VerplaatsMetingKeuze[],
  samenvoegenMet?: string
): VerplaatsRespondentResultaat {
  const leeg: VerplaatsRespondentResultaat = {
    ok: false,
    verplaatst: 0,
    overgeslagen: [],
    respondentVerwijderd: false,
    doelLidId: null,
  };
  const alles = laadAlles();
  const bronOrganisatie = alles.find((o) => o.leden.some((l) => l.id === lidId));
  const doelOrganisatie = alles.find((o) => o.id === doelOrganisatieId);
  if (!bronOrganisatie || !doelOrganisatie) return { ...leeg, reden: "Respondent of doelorganisatie niet gevonden." };
  if (bronOrganisatie.id === doelOrganisatie.id) return { ...leeg, reden: "Dit is al de huidige organisatie." };
  const lid = bronOrganisatie.leden.find((l) => l.id === lidId)!;
  const doelLid = samenvoegenMet ? doelOrganisatie.leden.find((l) => l.id === samenvoegenMet) : undefined;
  if (samenvoegenMet && !doelLid) return { ...leeg, reden: "De bestaande respondent in de doelorganisatie is niet gevonden." };
  const ontvanger = doelLid ?? lid;

  const resultaat: VerplaatsRespondentResultaat = { ...leeg, ok: true, doelLidId: ontvanger.id };
  const nieuwePerBronMeting = new Map<string, ScanUitvoering>();

  for (const bronMeting of bronOrganisatie.scanUitvoeringen) {
    const invulling = bronMeting.invullingen.find((i) => i.organisatieLidId === lidId);
    if (!invulling) continue;

    const keuze = keuzes.find((k) => k.bronMetingId === bronMeting.id);
    let doelMeting: ScanUitvoering | undefined;
    if (keuze?.doelMetingId) {
      doelMeting = doelOrganisatie.scanUitvoeringen.find((s) => s.id === keuze.doelMetingId);
      if (!doelMeting || doelMeting.assessmentId !== bronMeting.assessmentId) {
        // Niets is nog opgeslagen (`alles` is een verse kopie): afbreken laat
        // de data ongemoeid, geen halve verplaatsing.
        return { ...leeg, reden: `De gekozen doel-Meting voor "${bronMeting.label}" bestaat niet of heeft een ander Assessment-type.` };
      }
    } else if (!keuze) {
      doelMeting = voorstelDoelMeting(bronMeting, doelOrganisatie) ?? undefined;
    }
    if (!doelMeting) doelMeting = nieuwePerBronMeting.get(bronMeting.id);

    if (doelMeting && doelMeting.invullingen.some((i) => i.organisatieLidId === ontvanger.id)) {
      resultaat.overgeslagen.push({
        scanInvullingId: invulling.id,
        metingLabel: bronMeting.label,
        reden: REDEN_AL_SCAN_IN_DOEL_METING,
      });
      continue;
    }
    if (!doelMeting) {
      doelMeting = {
        id: nieuwId(),
        organisatieId: doelOrganisatie.id,
        assessmentId: bronMeting.assessmentId,
        label: keuze?.nieuwLabel?.trim() || bronMeting.label,
        aangemaaktOp: new Date().toISOString(),
        invullingen: [],
      };
      doelOrganisatie.scanUitvoeringen.push(doelMeting);
      nieuwePerBronMeting.set(bronMeting.id, doelMeting);
    }

    bronMeting.invullingen = bronMeting.invullingen.filter((i) => i.id !== invulling.id);
    doelMeting.invullingen.push({ ...invulling, organisatieLidId: ontvanger.id });
    resultaat.verplaatst++;
  }

  // Zonder samenvoegen verhuist de respondent zelf mee (nieuw in de
  // doelorganisatie, dus geen conflict mogelijk). Zijn Lead-koppelingen
  // verwijzen naar Metingen van de oude organisatie en vervallen.
  if (!doelLid) {
    bronOrganisatie.leden = bronOrganisatie.leden.filter((l) => l.id !== lidId);
    doelOrganisatie.leden.push({ ...lid, organisatieId: doelOrganisatie.id, leadMetingIds: [] });
  } else if (resultaat.overgeslagen.length === 0) {
    bronOrganisatie.leden = bronOrganisatie.leden.filter((l) => l.id !== lidId);
    resultaat.respondentVerwijderd = true;
  }

  slaAlles(alles);
  return resultaat;
}

/**
 * "Eén losse respons verplaatsen" (naar een andere organisatie,
 * beheerpagina.md punt 4): de respondent zelf blijft in zijn huidige
 * organisatie, alleen deze ene `ScanInvulling` verhuist. In de
 * doelorganisatie wordt het e-mailadres van de oorspronkelijke
 * respondent gebruikt om een bestaand lid te hergebruiken of een nieuw
 * (kenmerken-loos) lid aan te maken — zelfde "e-mailadres binnen een
 * organisatie is uniek"-regel als overal (`datamodel.md`, Respondent).
 * `doelScanUitvoeringId`: een bestaande Meting van de doelorganisatie met
 * hetzelfde Assessment-type, of leeg om een nieuwe aan te maken (dan is
 * `nieuwMetingLabel` verplicht).
 */
export function verplaatsResponsNaarOrganisatie(
  scanInvullingId: string,
  doelOrganisatieId: string,
  doelScanUitvoeringId: string | null,
  nieuwMetingLabel?: string
): { ok: boolean; reden?: string } {
  const alles = laadAlles();
  const gevonden = zoekScanInvulling(alles, scanInvullingId);
  if (!gevonden) return { ok: false, reden: "Ingevulde scan niet gevonden." };
  const { scanUitvoering: bronMeting, lid: bronLid, invulling } = gevonden;
  const doelOrganisatie = alles.find((o) => o.id === doelOrganisatieId);
  if (!doelOrganisatie) return { ok: false, reden: "Doelorganisatie niet gevonden." };

  let doelMeting: ScanUitvoering;
  if (doelScanUitvoeringId) {
    const match = doelOrganisatie.scanUitvoeringen.find((s) => s.id === doelScanUitvoeringId);
    if (!match) return { ok: false, reden: "Doel-Meting niet gevonden." };
    if (match.assessmentId !== bronMeting.assessmentId) {
      return { ok: false, reden: "Doel-Meting heeft een ander Assessment-type." };
    }
    doelMeting = match;
  } else {
    if (!nieuwMetingLabel?.trim()) return { ok: false, reden: "Geen label voor de nieuwe Meting." };
    doelMeting = {
      id: nieuwId(),
      organisatieId: doelOrganisatie.id,
      assessmentId: bronMeting.assessmentId,
      label: nieuwMetingLabel.trim(),
      aangemaaktOp: new Date().toISOString(),
      invullingen: [],
    };
    doelOrganisatie.scanUitvoeringen.push(doelMeting);
  }

  let doelLid = doelOrganisatie.leden.find((l) => l.email === bronLid.email);
  if (!doelLid) {
    doelLid = {
      id: nieuwId(),
      organisatieId: doelOrganisatie.id,
      email: bronLid.email,
      naam: bronLid.naam,
      functie: bronLid.functie,
      team: bronLid.team,
      notities: bronLid.notities,
      toegangscode: genereerUniekeToegangscode(alles),
      leadMetingIds: [],
      aangemaaktOp: new Date().toISOString(),
    };
    doelOrganisatie.leden.push(doelLid);
  }

  if (doelMeting.invullingen.some((i) => i.organisatieLidId === doelLid!.id)) {
    return { ok: false, reden: "Deze respondent heeft al een ingevulde scan in de doel-Meting." };
  }

  bronMeting.invullingen = bronMeting.invullingen.filter((i) => i.id !== scanInvullingId);
  doelMeting.invullingen.push({ ...invulling, organisatieLidId: doelLid.id });
  slaAlles(alles);
  return { ok: true };
}

/**
 * "Respons naar andere Meting verplaatsen" (beheerpagina.md punt 4,
 * 1 oktober 2026): hangt één ingevulde scan onder een andere Meting van
 * **dezelfde** organisatie. Bedoeld voor de responsen die een import
 * (`import-scans.md`) in een eigen import-Meting zet, maar bruikbaar voor
 * elke ScanInvulling. `doelScanUitvoeringId`: bestaande Meting van
 * dezelfde organisatie en hetzelfde Assessment-type, of leeg om een
 * nieuwe aan te maken (dan is `nieuwMetingLabel` verplicht).
 */
export function verplaatsResponsNaarMeting(
  scanInvullingId: string,
  doelScanUitvoeringId: string | null,
  nieuwMetingLabel?: string
): { ok: boolean; reden?: string } {
  const alles = laadAlles();
  const gevonden = zoekScanInvulling(alles, scanInvullingId);
  if (!gevonden) return { ok: false, reden: "Ingevulde scan niet gevonden." };
  const { organisatie, scanUitvoering: bronMeting, lid, invulling } = gevonden;

  let doelMeting: ScanUitvoering;
  if (doelScanUitvoeringId) {
    const match = organisatie.scanUitvoeringen.find((s) => s.id === doelScanUitvoeringId);
    if (!match) return { ok: false, reden: "Doel-Meting niet gevonden." };
    if (match.id === bronMeting.id) return { ok: false, reden: "Dit is al de huidige Meting." };
    if (match.assessmentId !== bronMeting.assessmentId) {
      return { ok: false, reden: "Doel-Meting heeft een ander Assessment-type." };
    }
    doelMeting = match;
  } else {
    if (!nieuwMetingLabel?.trim()) return { ok: false, reden: "Geen label voor de nieuwe Meting." };
    doelMeting = {
      id: nieuwId(),
      organisatieId: organisatie.id,
      assessmentId: bronMeting.assessmentId,
      label: nieuwMetingLabel.trim(),
      aangemaaktOp: new Date().toISOString(),
      invullingen: [],
    };
    organisatie.scanUitvoeringen.push(doelMeting);
  }

  if (doelMeting.invullingen.some((i) => i.organisatieLidId === lid.id)) {
    return { ok: false, reden: "Deze respondent heeft al een ingevulde scan in de doel-Meting." };
  }

  bronMeting.invullingen = bronMeting.invullingen.filter((i) => i.id !== scanInvullingId);
  doelMeting.invullingen.push(invulling);
  slaAlles(alles);
  return { ok: true };
}

/**
 * Bulkvariant van `verplaatsResponsNaarMeting` (beheerpagina.md punt 4,
 * "Meerdere responsen tegelijk", vanaf de organisatie-gefilterde
 * Ingevulde-scans-lijst, punt 7): alle geselecteerde scans naar dezelfde
 * doel-Meting. Scans die niet passen (ander Assessment-type, of de
 * respondent heeft al een scan in de doel-Meting) worden overgeslagen met
 * een reden, de rest gaat gewoon door.
 */
export function verplaatsResponsenNaarMeting(
  scanInvullingIds: string[],
  doelScanUitvoeringId: string | null,
  nieuwMetingLabel?: string
): { verplaatst: number; overgeslagen: { scanInvullingId: string; reden: string }[] } {
  let gedeeldDoelId = doelScanUitvoeringId;
  const overgeslagen: { scanInvullingId: string; reden: string }[] = [];
  let verplaatst = 0;
  for (const id of scanInvullingIds) {
    const resultaat = verplaatsResponsNaarMeting(id, gedeeldDoelId, gedeeldDoelId ? undefined : nieuwMetingLabel);
    if (resultaat.ok) {
      verplaatst++;
      if (!gedeeldDoelId) {
        // Eerste rij maakte de nieuwe Meting aan: vind 'm terug zodat de
        // overige rijen in dezelfde Meting komen i.p.v. elk hun eigen
        // nieuwe Meting.
        const alles = laadAlles();
        const gevonden = zoekScanInvulling(alles, id);
        if (gevonden) gedeeldDoelId = gevonden.scanUitvoering.id;
      }
    } else {
      overgeslagen.push({ scanInvullingId: id, reden: resultaat.reden ?? "onbekende reden" });
    }
  }
  return { verplaatst, overgeslagen };
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
  /**
   * Metingen van deze organisatie waar dit lid Lead-toegang toe heeft
   * (`lid.leadMetingIds`), los van zijn eigen `invullingen` hierboven —
   * beheerpagina.md punt 6a, "Lead-worden en een vragenlijst krijgen zijn
   * twee losse acties". Leeg als dit lid geen Lead is.
   */
  leadMetingen: ScanUitvoering[];
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
    const leadMetingen = organisatie.scanUitvoeringen.filter((s) =>
      lid.leadMetingIds.includes(s.id)
    );
    return { organisatie, lid, invullingen, leadMetingen };
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
  /**
   * `null` = nieuwe organisatie aanmaken met `rij.organisatieNaam`. Geef,
   * zodra bekend (een eerdere aanroep binnen dezelfde beheersessie heeft
   * 'm al aangemaakt — `import-scans.md`, "Binnen één import"/"Meting"),
   * het echte id door i.p.v. opnieuw `null`: anders ontstaat per aanroep
   * een nieuwe organisatie met dezelfde naam, in plaats van één.
   */
  organisatieId: string | null;
  /**
   * Zelfde idee als `organisatieId`, maar voor de Meting: `null`/weggelaten
   * = nieuwe Meting aanmaken. Binnen één aanroep worden rijen met
   * dezelfde organisatie, Assessment en `rij.meetingLabel` altijd
   * samengevoegd tot één Meting, ook als ze hier allemaal `null` krijgen
   * (`import-scans.md`, Meting, "Binnen één import delen rijen één
   * Meting"); geef het echte id door voor een latere, aparte aanroep die
   * bij diezelfde combinatie moet aansluiten.
   */
  metingId?: string | null;
}

/** Per verwerkte rij, in dezelfde volgorde als de input: met welke organisatie/Meting hij uiteindelijk geschreven is — voor de aanroeper om te onthouden richting een latere, aparte aanroep (zie `LegacyImportKeuze`). */
export interface LegacyImportRijResultaat {
  organisatieId: string;
  scanUitvoeringId: string;
}

/**
 * Schrijft gevalideerde rijen (`lib/import-legacy.ts`) definitief weg
 * (`import-scans.md`, Werkwijze in beheer, Meting, "Over rijen heen in
 * één bestand"). Organisaties en Metingen die **binnen deze ene aanroep**
 * voor het eerst voorkomen (nieuwe organisatienaam, of nieuwe combinatie
 * organisatie/Assessment/label) worden maar één keer aangemaakt en
 * daarna door latere rijen in dezelfde aanroep hergebruikt — rijen die
 * expliciet al een `organisatieId`/`metingId` meekrijgen (van een eerdere
 * aanroep in dezelfde beheersessie) tellen ook mee voor die hergebruik-
 * groepering. Zie `LegacyImportKeuze` voor hoe de aanroeper dat tussen
 * aparte aanroepen laat doorwerken.
 *
 * Een respondent die al bestaat (zelfde e-mailadres binnen de organisatie)
 * wordt hergebruikt zonder zijn naam/functie/team/notities te overschrijven
 * — dat is bewust een terughoudende keuze (niet in de spec expliciet
 * vastgelegd): De import mag geen recentere, zelf ingevoerde gegevens van
 * een bestaande respondent overschrijven met oudere importdata.
 */
export function voerLegacyImportUit(
  keuzes: LegacyImportKeuze[],
  aangemaaktDoor: string
): { geimporteerd: number; rijResultaten: LegacyImportRijResultaat[] } {
  const alles = laadAlles();
  let geimporteerd = 0;
  const rijResultaten: LegacyImportRijResultaat[] = [];

  // Nieuw aangemaakt BINNEN deze aanroep, dus hergebruikbaar door een
  // volgende rij in dezelfde `keuzes`-lijst (import-scans.md, "Organisatie,
  // één keer per unieke naam" / "Binnen één import delen rijen één
  // Meting"). Niet bedoeld om tussen aparte aanroepen heen te onthouden —
  // dat doet de aanroeper zelf, via de teruggegeven `rijResultaten`.
  const nieuweOrgPerNaam = new Map<string, Organisatie>();
  const nieuweMetingPerSleutel = new Map<string, ScanUitvoering>();

  for (const { rij, assessmentId, organisatieId, metingId } of keuzes) {
    let organisatie =
      (organisatieId ? alles.find((o) => o.id === organisatieId) : undefined) ??
      nieuweOrgPerNaam.get(rij.organisatieNaam);
    let nieuwAangemaakt = false;
    if (!organisatie) {
      const nu = new Date().toISOString();
      organisatie = {
        id: nieuwId(),
        naam: rij.organisatieNaam,
        kenmerken: {},
        leden: [],
        scanUitvoeringen: [],
        aangemaaktDoor,
        toegewezenAan: [],
        aangemaaktOp: nu,
        gewijzigdOp: nu,
      };
      alles.push(organisatie);
      nieuweOrgPerNaam.set(rij.organisatieNaam, organisatie);
      nieuwAangemaakt = true;
    }

    // "nieuw"-formaat: organisatie_kenmerken is al compleet, alleen toepassen bij een
    // nieuw aangemaakte organisatie — bij hergebruik van een bestaande organisatie
    // blijven haar eigen, mogelijk recentere kenmerken staan. Bij meerdere rijen voor
    // dezelfde nieuwe organisatie (binnen of tussen aanroepen) geldt dit alleen op het
    // moment van aanmaken, dus feitelijk de eerste rij in bestandsvolgorde
    // (import-scans.md, "Kenmerken bij een nieuwe organisatie").
    if (rij.organisatieKenmerken && nieuwAangemaakt) {
      organisatie.kenmerken = { ...rij.organisatieKenmerken };
    } else if ((rij.sectorTitel || rij.subsectorTitel) && !organisatie.kenmerken["sector-subsector"]) {
      organisatie.kenmerken["sector-subsector"] = {
        sector: rij.sectorTitel ?? "",
        subsector: rij.subsectorTitel ?? "",
      };
    }

    let lid = organisatie.leden.find((l) => l.email === normaliseerEmail(rij.respondentEmail));
    if (!lid) {
      lid = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        email: normaliseerEmail(rij.respondentEmail),
        naam: rij.respondentNaam || null,
        functie: rij.respondentFunctie,
        team: rij.respondentTeam,
        notities: rij.respondentNotities,
        toegangscode: genereerUniekeToegangscode(alles),
        leadMetingIds: [],
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }

    const metingSleutel = `${organisatie.id}::${assessmentId}::${rij.meetingLabel}`;
    let scanUitvoering =
      (metingId ? organisatie.scanUitvoeringen.find((s) => s.id === metingId) : undefined) ??
      nieuweMetingPerSleutel.get(metingSleutel);
    if (!scanUitvoering) {
      scanUitvoering = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        assessmentId,
        label: rij.meetingLabel,
        aangemaaktOp: new Date().toISOString(),
        invullingen: [],
      };
      organisatie.scanUitvoeringen.push(scanUitvoering);
      nieuweMetingPerSleutel.set(metingSleutel, scanUitvoering);
    }

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
      bewaarVerlengdTot: null,
    };
    scanUitvoering.invullingen.push(invulling);
    rijResultaten.push({ organisatieId: organisatie.id, scanUitvoeringId: scanUitvoering.id });
    geimporteerd++;
  }

  slaAlles(alles);
  return { geimporteerd, rijResultaten };
}

