import { Organisatie, OrganisatieLid, Ronde, ScanUitvoering } from "../types";
import { nieuwId } from "../id";
import { normaliseerEmail } from "../email";
import { laadAlles, slaAlles } from "./store";
import { zoekScanInvulling } from "./scans";
import { genereerUniekeToegangscode } from "./respondenten";
import { logAudit, nieuweGroepId } from "../audit-store";
import { metingContext, organisatieContext } from "../audit-context";
import { STANDAARD_ONDERDEEL, botsingTekst, genereerLabel, isSamengesteld, metingMetCombinatie, rondesVan } from "../rondes";
import { SamenbrengBron, SamenbrengRegel, controleerSamenbrengen } from "../samenbrengen";

/**
 * "Scans samenbrengen in één Meting" (`beheerpagina.md`, punt 6b): Zet scans die na een import verspreid over losse Metingen
 * staan, in één keer in één Meting en koppelt ze aan de juiste Respondent. Alles of niets: Vóór het schrijven wordt het
 * eindresultaat gecontroleerd (`lib/samenbrengen.ts`), en bij één fout verandert er niets. Per scan werken zowel
 * `scanUitvoeringId` als `organisatieLidId` bij (`beheerpagina.md`, Twee verwijzingen per scan). Antwoorden en organisatie
 * blijven ongewijzigd. Bron-Metingen die leeg raken, blijven staan.
 */

export type SamenbrengDoel =
  | { soort: "bestaand"; metingId: string }
  | {
      soort: "nieuw";
      /** Leeg: "Hele organisatie". De naam van de Meting maakt de app uit onderdeel en ronde. */
      onderdeel?: string;
      /** Een bestaande ronde, of `nieuweRondeLabel` voor een nieuwe. Een van beide is verplicht. */
      rondeId?: string;
      nieuweRondeLabel?: string;
    };

export type SamenbrengResultaat =
  | {
      ok: true;
      aantal: number;
      doelMetingId: string;
      doelLabel: string;
      rondeLabel: string | null;
      /** Bron-Metingen die na afloop leeg zijn (in te zien voor "Lege Metingen verwijderen"). */
      legeMetingen: { id: string; label: string }[];
    }
  | { ok: false; reden: string; fouten?: Record<string, string> };

export function brengScansSamen(
  organisatieId: string,
  doel: SamenbrengDoel,
  regels: SamenbrengRegel[]
): SamenbrengResultaat {
  if (regels.length === 0) return { ok: false, reden: "Geen scans geselecteerd." };
  const alles = laadAlles();
  const organisatie: Organisatie | undefined = alles.find((o) => o.id === organisatieId);
  if (!organisatie) return { ok: false, reden: "Organisatie niet gevonden." };

  // De scans: Allemaal van deze organisatie en van hetzelfde Assessment.
  const gevonden = regels.map((r) => zoekScanInvulling(alles, r.invullingId));
  if (gevonden.some((g) => !g || g.organisatie.id !== organisatie.id)) {
    return { ok: false, reden: "Een van de scans bestaat niet meer of hoort bij een andere organisatie." };
  }
  const assessmentIds = new Set(gevonden.map((g) => g!.scanUitvoering.assessmentId));
  if (assessmentIds.size !== 1) return { ok: false, reden: "De scans horen bij verschillende Assessment-types." };
  const assessmentId = [...assessmentIds][0];

  // De doel-Meting.
  let doelMeting: ScanUitvoering | undefined;
  let nieuweMeting = false;
  let nieuweRondeAangemaakt: Ronde | undefined;
  let ronde: Ronde | undefined;
  if (doel.soort === "bestaand") {
    doelMeting = organisatie.scanUitvoeringen.find((m) => m.id === doel.metingId);
    if (!doelMeting) return { ok: false, reden: "Doel-Meting niet gevonden." };
    if (doelMeting.assessmentId !== assessmentId) return { ok: false, reden: "Doel-Meting heeft een ander Assessment-type." };
    if (isSamengesteld(doelMeting)) return { ok: false, reden: "Een samengestelde Meting heeft geen scans." };
    ronde = doelMeting.rondeId ? rondesVan(organisatie).find((r) => r.id === doelMeting!.rondeId) : undefined;
  }

  const bronnen: SamenbrengBron[] = regels.map((r, i) => ({
    invullingId: r.invullingId,
    metingId: gevonden[i]!.scanUitvoering.id,
    lidId: gevonden[i]!.invulling.organisatieLidId,
  }));
  const fouten = controleerSamenbrengen(organisatie, bronnen, regels, doelMeting?.id ?? null);
  if (Object.keys(fouten).length > 0) return { ok: false, reden: "Niet alle regels kloppen.", fouten };

  if (doel.soort === "nieuw") {
    const onderdeel = doel.onderdeel?.trim() || STANDAARD_ONDERDEEL;
    if (doel.rondeId) {
      ronde = rondesVan(organisatie).find((r) => r.id === doel.rondeId);
      if (!ronde) return { ok: false, reden: "Ronde niet gevonden." };
      const bestaand = metingMetCombinatie(organisatie, ronde.id, onderdeel, assessmentId);
      if (bestaand) return { ok: false, reden: botsingTekst(ronde.label, bestaand.label, "nieuw") };
    } else if (doel.nieuweRondeLabel?.trim()) {
      ronde = {
        id: nieuwId(),
        organisatieId: organisatie.id,
        label: doel.nieuweRondeLabel.trim(),
        aangemaaktOp: new Date().toISOString(),
      };
      organisatie.rondes = [...rondesVan(organisatie), ronde];
      nieuweRondeAangemaakt = ronde;
    }
    if (!ronde) return { ok: false, reden: "Kies een ronde of geef een nieuwe ronde een naam." };
    const label = genereerLabel(onderdeel, ronde.label);
    doelMeting = {
      id: nieuwId(),
      organisatieId: organisatie.id,
      assessmentId,
      rondeId: ronde.id,
      label,
      onderdeel,
      aangemaaktOp: new Date().toISOString(),
      invullingen: [],
    };
    organisatie.scanUitvoeringen.push(doelMeting);
    nieuweMeting = true;
  }
  const doelM = doelMeting!;

  // Verplaatsen en koppelen.
  const groepId = nieuweGroepId();
  const gelogd: Parameters<typeof logAudit>[0] = [];
  if (nieuweRondeAangemaakt) {
    gelogd.push({
      actie: "ronde.aangemaakt",
      entiteitType: "ronde",
      entiteitId: nieuweRondeAangemaakt.id,
      entiteitNaam: nieuweRondeAangemaakt.label,
      groepId,
      details: { ...organisatieContext(organisatie), aantalMetingen: 1 },
    });
  }
  if (nieuweMeting) {
    gelogd.push({
      actie: "meting.aangemaakt",
      entiteitType: "meting",
      entiteitId: doelM.id,
      entiteitNaam: doelM.label,
      groepId,
      details: { ...metingContext(organisatie, doelM), onderdeel: doelM.onderdeel ?? STANDAARD_ONDERDEEL, ronde: ronde?.label ?? null },
    });
  }

  const assessmentNaam = metingContext(organisatie, doelM).assessmentNaam;
  const legeKandidaten = new Map<string, ScanUitvoering>();
  const perBron = new Map<string, { bron: ScanUitvoering; aantal: number }>();
  const nieuweLeden = new Map<string, OrganisatieLid>(); // e-mailadres -> aangemaakte Respondent

  regels.forEach((regel, i) => {
    const { scanUitvoering: bronMeting, invulling } = gevonden[i]!;

    // 1. De Respondent.
    let doelLid: OrganisatieLid | undefined;
    let nieuweRespondent = false;
    if (regel.respondent.soort === "bestaand") {
      doelLid = organisatie.leden.find((l) => l.id === (regel.respondent as { respondentId: string }).respondentId);
    } else if (regel.respondent.soort === "nieuw") {
      const email = normaliseerEmail(regel.respondent.email);
      doelLid = nieuweLeden.get(email);
      if (!doelLid) {
        doelLid = {
          id: nieuwId(),
          organisatieId: organisatie.id,
          email,
          naam: regel.respondent.naam.trim() || null,
          functie: regel.respondent.functie.trim(),
          team: regel.respondent.team.trim(),
          notities: "",
          toegangscode: genereerUniekeToegangscode(alles),
          aangemaaktOp: new Date().toISOString(),
        };
        organisatie.leden.push(doelLid);
        nieuweLeden.set(email, doelLid);
        nieuweRespondent = true;
        gelogd.push({
          actie: "respondent.aangemaakt",
          entiteitType: "respondent",
          entiteitId: doelLid.id,
          groepId,
          details: organisatieContext(organisatie),
        });
      }
    }
    const respondentGewijzigd = !!doelLid && doelLid.id !== invulling.organisatieLidId;
    if (doelLid) invulling.organisatieLidId = doelLid.id;

    // 2. De Meting.
    const metingVerplaatst = bronMeting.id !== doelM.id;
    if (metingVerplaatst) {
      bronMeting.invullingen = bronMeting.invullingen.filter((x) => x.id !== invulling.id);
      invulling.scanUitvoeringId = doelM.id;
      doelM.invullingen.push(invulling);
      legeKandidaten.set(bronMeting.id, bronMeting);
      const huidig = perBron.get(bronMeting.id);
      if (huidig) huidig.aantal++;
      else perBron.set(bronMeting.id, { bron: bronMeting, aantal: 1 });
    }

    if (respondentGewijzigd) {
      gelogd.push({
        actie: "respons.respondentGewijzigd",
        entiteitType: "scan",
        entiteitId: invulling.id,
        groepId,
        // Geen persoonsgegevens in de log (datamodel.md, Audit).
        details: { ...metingContext(organisatie, doelM), nieuweRespondent, vanuit: "Scans samenbrengen" },
      });
    }
  });

  for (const g of perBron.values()) {
    gelogd.push({
      actie: "respons.metingVerplaatst",
      entiteitType: "meting",
      entiteitId: g.bron.id,
      entiteitNaam: g.bron.label,
      groepId,
      details: {
        ...organisatieContext(organisatie),
        bronMeting: g.bron.label,
        doelMeting: doelM.label,
        assessmentNaam,
        aantal: g.aantal,
        vanuit: "Scans samenbrengen",
      },
    });
  }

  slaAlles(alles);
  logAudit(gelogd);

  const legeMetingen = [...legeKandidaten.values()]
    .filter((m) => m.id !== doelM.id && m.invullingen.length === 0)
    .map((m) => ({ id: m.id, label: m.label }));
  return {
    ok: true,
    aantal: regels.length,
    doelMetingId: doelM.id,
    doelLabel: doelM.label,
    rondeLabel: ronde?.label ?? null,
    legeMetingen,
  };
}
