import { Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { genereerToegangscode } from "../toegangscode";
import { normaliseerEmail } from "../email";
import { laadAlles, slaAlles, useOrganisaties } from "./store";
import { verwijderToewijzingenVanRespondenten, verwijderToewijzingenZonderBereik } from "../benchmark-store";
import { isLead, leadMetingIdsVan } from "../lead";
import { logAudit } from "../audit-store";
import { metingContext, organisatieContext } from "../audit-context";

/** Respondenten (in de code `OrganisatieLid`): uitnodigen, Lead-toegang, gegevens, verwijderen en opzoeken via toegangscode. */

/** Genereert een toegangscode die nog niet in gebruik is (zie lib/toegangscode.ts). */
export function genereerUniekeToegangscode(alles: Organisatie[]): string {
  const inGebruik = new Set(alles.flatMap((o) => o.leden.map((l) => l.toegangscode)));
  let code = genereerToegangscode();
  while (inGebruik.has(code)) code = genereerToegangscode();
  return code;
}

export function maakInvulling(scanUitvoeringId: string, organisatieLidId: string): ScanInvulling {
  const nu = new Date().toISOString();
  return {
    id: nieuwId(),
    scanUitvoeringId,
    organisatieLidId,
    status: "uitgenodigd",
    antwoorden: {},
    opmerkingenPerBouwblok: {},
    aangemaaktOp: nu,
    uitgenodigdOp: nu,
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
    const nieuwLid = !lid;
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
        leadVoorOrganisatie: false,
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }

    // Een Lead voor de hele organisatie heeft deze Meting al in zijn bereik: Er is niets toe te voegen.
    if (ookLeadMaken && !lid.leadVoorOrganisatie && !lid.leadMetingIds.includes(scanUitvoeringId)) {
      lid.leadMetingIds = [...lid.leadMetingIds, scanUitvoeringId];
    }

    let invulling = scanUitvoering.invullingen.find((i) => i.organisatieLidId === lid!.id);
    const nieuweInvulling = !invulling;
    if (!invulling) {
      invulling = maakInvulling(scanUitvoeringId, lid.id);
      scanUitvoering.invullingen.push(invulling);
    }

    slaAlles(alles);
    // Geen naam of e-mailadres van de Respondent in de log (datamodel.md, Audit).
    const context = metingContext(organisatie, scanUitvoering);
    logAudit([
      ...(nieuwLid
        ? [{ actie: "respondent.aangemaakt", entiteitType: "respondent", entiteitId: lid.id, details: context }]
        : []),
      ...(nieuweInvulling
        ? [{ actie: "respondent.uitgenodigd", entiteitType: "scan", entiteitId: invulling.id, details: context }]
        : []),
    ]);
    return { lid, invulling };
  }
  return null;
}

/** Het bereik van een Lead (`datamodel.md` deel 2, Het bereik van een Lead). */
export type LeadBereikKeuze = { soort: "organisatie" } | { soort: "metingen"; metingIds: string[] };

/**
 * "Lead toevoegen" (beheerpagina.md punt 6a): maakt/hergebruikt een lid zoals `nodigLidUit`, maar zonder ScanInvulling,
 * want een Lead hoeft geen respondent te zijn. Met een bereik: Specifieke Metingen (minstens 1, afgedwongen hier en
 * door de UI) of de hele organisatie.
 */
export function voegLeadToe(
  organisatieId: string,
  input: { naam: string; email: string; bereik: LeadBereikKeuze }
): OrganisatieLid | null {
  const { bereik } = input;
  if (bereik.soort === "metingen" && bereik.metingIds.length === 0) return null;
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return null;

  let lid = organisatie.leden.find((l) => l.email === normaliseerEmail(input.email));
  const nieuwLid = !lid;
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
      leadVoorOrganisatie: false,
      aangemaaktOp: new Date().toISOString(),
    };
    organisatie.leden.push(lid);
  }
  const eerder = leadAantal(lid);
  if (bereik.soort === "organisatie") {
    lid.leadVoorOrganisatie = true;
  } else {
    const nieuweIds = bereik.metingIds.filter((id) => !lid!.leadMetingIds.includes(id));
    lid.leadMetingIds = [...lid.leadMetingIds, ...nieuweIds];
  }
  slaAlles(alles);
  logAudit([
    ...(nieuwLid
      ? [{ actie: "respondent.aangemaakt", entiteitType: "respondent", entiteitId: lid.id, details: organisatieContext(organisatie) }]
      : []),
    {
      actie: "respondent.leadToegekend",
      entiteitType: "respondent",
      entiteitId: lid.id,
      details: {
        ...organisatieContext(organisatie),
        bereik: bereik.soort === "organisatie" ? "hele organisatie" : "specifieke Metingen",
        aantalMetingenVoor: eerder,
        aantalMetingenNa: leadAantal(lid),
      },
    },
  ]);
  return lid;
}

function leadAantal(lid: OrganisatieLid): number {
  return lid.leadVoorOrganisatie === true ? -1 : lid.leadMetingIds.length;
}

/**
 * "Lead-toegang beheren" (beheerpagina.md punt 6a): zet het bereik van dit lid. Specifieke Metingen (de volledige lijst,
 * alles uitvinken trekt de rol in) of de hele organisatie. Wisselt het lid naar "hele organisatie" en weer terug, dan
 * blijven de eerder gekozen Metingen bewaard (`datamodel.md`, Wisselen van bereik): Ze zijn alleen niet te zien zolang de
 * hele organisatie aan staat. Pas bij het intrekken van de Lead-rol worden ze gewist.
 */
export function zetLeadBereik(lidId: string, bereik: LeadBereikKeuze | { soort: "ingetrokken" }): void {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const lid = organisatie.leden.find((l) => l.id === lidId);
    if (!lid) continue;
    const voorOrganisatie = lid.leadVoorOrganisatie === true;
    const voor = leadAantal(lid);
    if (bereik.soort === "ingetrokken") {
      lid.leadVoorOrganisatie = false;
      lid.leadMetingIds = [];
    } else if (bereik.soort === "organisatie") {
      lid.leadVoorOrganisatie = true;
    } else {
      lid.leadVoorOrganisatie = false;
      lid.leadMetingIds = bereik.metingIds;
    }
    slaAlles(alles);
    // Verliest de Lead zijn bereik op het onderwerp van een view, dan vervalt de toewijzing, op elk niveau (`benchmark.md`).
    verwijderToewijzingenZonderBereik(lid);
    const ingetrokken = !isLead(lid);
    logAudit({
      actie: ingetrokken ? "respondent.leadIngetrokken" : "respondent.leadToegekend",
      entiteitType: "respondent",
      entiteitId: lid.id,
      details: {
        ...organisatieContext(organisatie),
        bereik: lid.leadVoorOrganisatie === true ? "hele organisatie" : "specifieke Metingen",
        bereikVoor: voorOrganisatie ? "hele organisatie" : "specifieke Metingen",
        aantalMetingenVoor: voor,
        aantalMetingenNa: leadAantal(lid),
      },
    });
    return;
  }
}

/** Alleen de Metingen wijzigen (bestaande aanroepers): Zelfde als `zetLeadBereik` met "metingen". */
export function zetLeadMetingen(lidId: string, metingIds: string[]): void {
  zetLeadBereik(lidId, metingIds.length === 0 ? { soort: "ingetrokken" } : { soort: "metingen", metingIds });
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
   * (`leadMetingIdsVan`: Alle Metingen bij `leadVoorOrganisatie`, anders `lid.leadMetingIds`), los van zijn eigen `invullingen` hierboven —
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
    const leadIds = new Set(leadMetingIdsVan(lid, organisatie));
    const leadMetingen = organisatie.scanUitvoeringen.filter((s) => leadIds.has(s.id));
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
  const gelogd: Parameters<typeof logAudit>[0] = [];
  for (const organisatie of alles) {
    for (const lid of organisatie.leden.filter((l) => ids.has(l.id))) {
      gelogd.push({
        actie: "respondent.verwijderd",
        entiteitType: "respondent",
        entiteitId: lid.id,
        details: {
          ...organisatieContext(organisatie),
          aantalScans: organisatie.scanUitvoeringen.reduce(
            (n, m) => n + m.invullingen.filter((i) => i.organisatieLidId === lid.id).length,
            0
          ),
        },
      });
    }
    organisatie.leden = organisatie.leden.filter((l) => !ids.has(l.id));
    for (const scanUitvoering of organisatie.scanUitvoeringen) {
      scanUitvoering.invullingen = scanUitvoering.invullingen.filter(
        (i) => !ids.has(i.organisatieLidId)
      );
    }
  }
  slaAlles(alles);
  logAudit(gelogd);
  // Een Respondent met Lead-rol weg haalt zijn benchmarktoewijzingen weg (`datamodel.md`).
  verwijderToewijzingenVanRespondenten(ledIds);
}
