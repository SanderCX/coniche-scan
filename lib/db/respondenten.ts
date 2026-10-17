import { LeadToegang, Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { genereerToegangscode } from "../toegangscode";
import { normaliseerEmail } from "../email";
import { laadAlles, slaAlles, useOrganisaties } from "./store";
import { metingenMetToegang, ruimLeadToegangOp, toegangSleutel } from "../lead-toegang";
import { logAudit, nieuweGroepId } from "../audit-store";
import { getBenchmarks } from "../benchmark-store";
import { getBenchmarksMetLeden } from "../benchmark-leden";
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
 * `ookLeadMaken` (beheerpagina.md punt 6a, vinkje "Ook Lead maken"): geeft het lid de Lead-rol en vinkt Resultaten aan voor
 * deze Meting, naast de uitnodiging zelf. Meer weergaven vinkt een Admin aan in het Leads-venster.
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
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }

    if (ookLeadMaken) {
      lid.lead = true;
      const sleutels = new Set((organisatie.leadToegang ?? []).map(toegangSleutel));
      const toegang = { respondentId: lid.id, weergave: "resultaten" as const, metingId: scanUitvoeringId };
      if (!sleutels.has(toegangSleutel(toegang))) {
        organisatie.leadToegang = [
          ...(organisatie.leadToegang ?? []),
          { ...toegang, toegekendDoor: "uitnodigen", toegekendOp: new Date().toISOString() },
        ];
      }
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

/**
 * "Lead toevoegen" (beheerpagina.md punt 6a): Geeft een bestaande Respondent van de organisatie de Lead-rol, of maakt een
 * nieuwe Respondent aan zoals `nodigLidUit`, zonder ScanInvulling, want een Lead hoeft geen respondent te zijn. De rij komt in
 * het Leads-venster zonder vinkjes: Wat de Lead ziet, vinkt de Admin daar aan.
 */
export function voegLeadToe(
  organisatieId: string,
  input: { respondentId?: string; naam?: string; email?: string }
): OrganisatieLid | null {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return null;

  let lid: OrganisatieLid | undefined;
  let nieuwLid = false;
  if (input.respondentId) {
    lid = organisatie.leden.find((l) => l.id === input.respondentId);
    if (!lid) return null;
  } else {
    const email = normaliseerEmail(input.email ?? "");
    if (!email) return null;
    lid = organisatie.leden.find((l) => l.email === email);
    if (!lid) {
      nieuwLid = true;
      lid = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        email,
        naam: (input.naam ?? "").trim() || null,
        functie: "",
        team: "",
        notities: "",
        toegangscode: genereerUniekeToegangscode(alles),
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.leden.push(lid);
    }
  }
  const eerderLead = lid.lead === true;
  lid.lead = true;
  slaAlles(alles);
  logAudit([
    ...(nieuwLid
      ? [{ actie: "respondent.aangemaakt", entiteitType: "respondent", entiteitId: lid.id, details: organisatieContext(organisatie) }]
      : []),
    ...(eerderLead
      ? []
      : [{ actie: "respondent.leadToegekend", entiteitType: "respondent", entiteitId: lid.id, details: organisatieContext(organisatie) }]),
  ]);
  return lid;
}

/**
 * Zet de Lead-rol van een Respondent aan of uit (`beheerpagina.md`, punt 6a, Op een bestaande respondent). Uitzetten verwijdert
 * al zijn vinkjes (`datamodel.md`, Verwijderen en datakoppelingen) en logt dat.
 */
export function zetLeadRol(lidId: string, aan: boolean): void {
  const alles = laadAlles();
  for (const organisatie of alles) {
    const lid = organisatie.leden.find((l) => l.id === lidId);
    if (!lid) continue;
    if ((lid.lead === true) === aan) return;
    const aantalVinkjes = (organisatie.leadToegang ?? []).filter((t) => t.respondentId === lidId).length;
    lid.lead = aan ? true : undefined;
    if (!aan) organisatie.leadToegang = (organisatie.leadToegang ?? []).filter((t) => t.respondentId !== lidId);
    slaAlles(alles);
    logAudit({
      actie: aan ? "respondent.leadToegekend" : "respondent.leadIngetrokken",
      entiteitType: "respondent",
      entiteitId: lid.id,
      details: { ...organisatieContext(organisatie), ...(aan ? {} : { aantalVinkjesVerwijderd: aantalVinkjes }) },
    });
    return;
  }
}

/** Eén wijziging van het Leads-venster: Een vinkje aan of uit. */
export interface LeadToegangWijziging {
  respondentId: string;
  weergave: LeadToegang["weergave"];
  metingId?: string;
  benchmarkId?: string;
  aan: boolean;
}

/**
 * "Opslaan" in het Leads-venster (`beheerpagina.md`, punt 6a): Past alle gewijzigde vinkjes in één keer toe, en logt per cel
 * `lead.toegangGewijzigd` met de weergave en de Meting of benchmark, zonder naam of e-mailadres van de Lead (`datamodel.md`, Audit).
 * Vinkjes die niet kunnen (Spreiding zonder Resultaten, een samengestelde Meting met iets anders dan Resultaten, een Lead zonder
 * rol) worden niet gezet, en wat van een uitgezet vinkje afhangt gaat mee uit (`ruimLeadToegangOp`). Geeft het aantal
 * gewijzigde cellen.
 */
export function slaLeadToegangOp(organisatieId: string, wijzigingen: LeadToegangWijziging[], gebruikerId: string): number {
  const alles = laadAlles();
  const organisatie = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return 0;
  const voor = new Set((organisatie.leadToegang ?? []).map(toegangSleutel));
  const nu = new Date().toISOString();
  const lijst = new Map((organisatie.leadToegang ?? []).map((t) => [toegangSleutel(t), t]));
  for (const w of wijzigingen) {
    const lid = organisatie.leden.find((l) => l.id === w.respondentId);
    if (!lid || lid.lead !== true) continue;
    const sleutel = toegangSleutel(w);
    if (w.aan) {
      if (!lijst.has(sleutel)) {
        lijst.set(sleutel, {
          respondentId: w.respondentId,
          weergave: w.weergave,
          ...(w.metingId ? { metingId: w.metingId } : {}),
          ...(w.benchmarkId ? { benchmarkId: w.benchmarkId } : {}),
          toegekendDoor: gebruikerId,
          toegekendOp: nu,
        });
      }
    } else {
      lijst.delete(sleutel);
    }
  }
  organisatie.leadToegang = [...lijst.values()];
  // Wat van een uitgezet vinkje afhangt gaat mee uit, en een vinkje dat niet kan wordt niet gezet.
  ruimLeadToegangOp(organisatie, getBenchmarksMetLeden(laadAlles()));
  const na = new Set(organisatie.leadToegang.map(toegangSleutel));
  const gewijzigd = [...new Set([...voor, ...na])].filter((k) => voor.has(k) !== na.has(k));
  if (gewijzigd.length === 0) return 0;
  slaAlles(alles);
  const metingLabel = (id?: string) => organisatie.scanUitvoeringen.find((m) => m.id === id)?.label ?? null;
  const benchmarkNaam = (id?: string) => getBenchmarks().find((b) => b.id === id)?.naam ?? null;
  const perSleutel = new Map<string, LeadToegang>();
  for (const t of [...(organisatie.leadToegang ?? []), ...wijzigingen.map((w) => ({ ...w, toegekendDoor: "", toegekendOp: "" }))]) {
    perSleutel.set(toegangSleutel(t), t as LeadToegang);
  }
  const groepId = nieuweGroepId();
  logAudit(
    gewijzigd.map((sleutel) => {
      const t = perSleutel.get(sleutel);
      const weergave = t?.weergave ?? "resultaten";
      return {
        actie: "lead.toegangGewijzigd",
        entiteitType: "organisatie",
        entiteitId: organisatie.id,
        groepId,
        details: {
          ...organisatieContext(organisatie),
          weergave,
          ...(weergave === "benchmark" ? { benchmark: benchmarkNaam(t?.benchmarkId) } : { meting: metingLabel(t?.metingId) }),
          aan: na.has(sleutel),
        },
      };
    })
  );
  return gewijzigd.length;
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
   * Metingen van deze organisatie waarvoor een Admin minstens één weergave voor deze Lead heeft aangevinkt
   * (`metingenMetToegang`), los van zijn eigen `invullingen` hierboven: beheerpagina.md punt 6a, "Lead worden en een
   * vragenlijst krijgen zijn twee losse acties". Leeg als dit lid geen Lead is.
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
    const leadMetingen = lid.lead === true ? metingenMetToegang(organisatie, lid.id) : [];
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
  // De vinkjes van een verwijderde Lead vallen weg in `slaAlles` (`ruimLeadToegangOp`).
}
