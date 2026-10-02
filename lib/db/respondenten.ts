import { Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { genereerToegangscode } from "../toegangscode";
import { normaliseerEmail } from "../email";
import { laadAlles, slaAlles, useOrganisaties } from "./store";

/** Respondenten (in de code `OrganisatieLid`): uitnodigen, Lead-toegang, gegevens, verwijderen en opzoeken via toegangscode. */

/** Genereert een toegangscode die nog niet in gebruik is (zie lib/toegangscode.ts). */
export function genereerUniekeToegangscode(alles: Organisatie[]): string {
  const inGebruik = new Set(alles.flatMap((o) => o.leden.map((l) => l.toegangscode)));
  let code = genereerToegangscode();
  while (inGebruik.has(code)) code = genereerToegangscode();
  return code;
}

export function maakInvulling(scanUitvoeringId: string, organisatieLidId: string): ScanInvulling {
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
export function zoekRespondentPerToegangscode(alles: Organisatie[], code: string): RespondentContext | null {
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
