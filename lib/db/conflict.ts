import { OrganisatieLid } from "../types";
import { nieuwId } from "../id";
import { normaliseerEmail } from "../email";
import { laadAlles, slaAlles } from "./store";
import { zoekScanInvulling } from "./scans";
import { genereerUniekeToegangscode } from "./respondenten";
import { logAudit } from "../audit-store";
import { metingContext, organisatieContext } from "../audit-context";

/**
 * Conflict oplossen bij "Respons naar andere Meting verplaatsen" (`beheerpagina.md`, punt 6b):
 * Hangt één scan aan een andere Respondent van dezelfde organisatie, zodat twee scans van
 * dezelfde Respondent niet meer in dezelfde Meting botsen.
 */

export interface RespondentInvoer {
  naam: string;
  email: string;
  functie: string;
  team: string;
  notities: string;
}

export type RespondentKeuze =
  | { soort: "bestaand"; lidId: string }
  | { soort: "nieuw"; invoer: RespondentInvoer };

export interface KoppelResultaat {
  ok: boolean;
  reden?: string;
  /** De Respondent aan wie de scan nu hangt. */
  lidId?: string;
}

/**
 * Alleen deze ene scan gaat naar de gekozen Respondent. De oorspronkelijke Respondent blijft
 * bestaan met zijn andere scans. Een nieuwe Respondent krijgt een nieuwe Toegangscode en een
 * eigen e-mailadres dat in de organisatie nog niet bij een andere Respondent voorkomt.
 * `vanuitDataIntegriteit` zet in het log dat de actie vanuit Data-integriteit kwam.
 */
export function koppelScanAanAndereRespondent(
  scanInvullingId: string,
  keuze: RespondentKeuze,
  opties: { vanuitDataIntegriteit?: boolean } = {}
): KoppelResultaat {
  const alles = laadAlles();
  const gevonden = zoekScanInvulling(alles, scanInvullingId);
  if (!gevonden) return { ok: false, reden: "Ingevulde scan niet gevonden." };
  const { organisatie, scanUitvoering, invulling } = gevonden;

  let doelLid: OrganisatieLid | undefined;
  let nieuw = false;
  if (keuze.soort === "bestaand") {
    doelLid = organisatie.leden.find((l) => l.id === keuze.lidId);
    if (!doelLid) return { ok: false, reden: "De gekozen Respondent bestaat niet in deze organisatie." };
    if (doelLid.id === invulling.organisatieLidId) return { ok: false, reden: "De scan hangt al aan deze Respondent." };
    if (scanUitvoering.invullingen.some((i) => i.id !== invulling.id && i.organisatieLidId === doelLid!.id)) {
      return { ok: false, reden: "Deze Respondent heeft in deze Meting al een scan." };
    }
  } else {
    const email = normaliseerEmail(keuze.invoer.email);
    if (!email) return { ok: false, reden: "Een nieuwe Respondent heeft een eigen e-mailadres nodig." };
    if (organisatie.leden.some((l) => l.email === email)) {
      return { ok: false, reden: "Dit e-mailadres hoort in deze organisatie al bij een andere Respondent." };
    }
    doelLid = {
      id: nieuwId(),
      organisatieId: organisatie.id,
      email,
      naam: keuze.invoer.naam.trim() || null,
      functie: keuze.invoer.functie,
      team: keuze.invoer.team,
      notities: keuze.invoer.notities,
      toegangscode: genereerUniekeToegangscode(alles),
      leadMetingIds: [],
      aangemaaktOp: new Date().toISOString(),
    };
    organisatie.leden.push(doelLid);
    nieuw = true;
  }

  invulling.organisatieLidId = doelLid.id;
  slaAlles(alles);

  // Geen persoonsgegevens in de log (datamodel.md, Audit).
  logAudit([
    ...(nieuw
      ? [{ actie: "respondent.aangemaakt", entiteitType: "respondent", entiteitId: doelLid.id, details: organisatieContext(organisatie) }]
      : []),
    {
      actie: "respons.respondentGewijzigd",
      entiteitType: "scan",
      entiteitId: invulling.id,
      details: {
        ...metingContext(organisatie, scanUitvoering),
        nieuweRespondent: nieuw,
        ...(opties.vanuitDataIntegriteit ? { vanuit: "Data-integriteit" } : {}),
      },
    },
  ]);
  return { ok: true, lidId: doelLid.id };
}
