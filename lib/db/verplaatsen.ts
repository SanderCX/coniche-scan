import { Organisatie, OrganisatieLid, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { normaliseerEmail } from "../email";
import { laadAlles, slaAlles } from "./store";
import { zoekScanInvulling } from "./scans";
import { genereerUniekeToegangscode } from "./respondenten";

/** Respondenten en scans verplaatsen of samenvoegen: binnen een organisatie, tussen organisaties en bij een e-mailconflict (beheerpagina.md, punt 6b). */

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
