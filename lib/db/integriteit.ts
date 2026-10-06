import { Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "../types";
import { laadAlles, slaAlles } from "./store";
import { getAssessment } from "../assessment-store";
import { verplaatsRespondentNaarOrganisatie } from "./verplaatsen";
import { logAudit, metExtraDetails } from "../audit-store";
import { metingContext, organisatieContext } from "../audit-context";

/**
 * Data-integriteit (`beheerpagina.md`, punt 13): Controleert of er verwijzingen zijn naar een record dat niet
 * meer bestaat, en biedt per vondst koppelen of verwijderen. De data staat genest (een scan hangt onder zijn
 * Meting, die onder zijn Organisatie), dus zulke verwijzingen ontstaan alleen door een fout in een verwijder-
 * of verplaatsactie of door beschadigde data. Daarom controleren we de `id`-verwijzingen zelf.
 */

export type ControleId =
  | "scan-zonder-respondent"
  | "scan-zonder-meting"
  | "respondent-zonder-organisatie"
  | "meting-zonder-organisatie"
  | "lead-zonder-meting";

export interface Vondst {
  controle: ControleId;
  /** Uniek per vondst. */
  sleutel: string;
  /** De Organisatie waar het record in staat (niet de ontbrekende). */
  organisatieId: string;
  organisatieNaam: string;
  /** Het record waar het om gaat: scan-, Respondent- of Meting-id. */
  recordId: string;
  /** De ontbrekende verwijzing. */
  ontbrekendId: string;
  /** Leesbare regels voor in de modal. Persoonsgegevens mogen hier (alleen Admin), nooit in de audit-log. */
  regels: string[];
  /** Voor "Verwijderen": hoeveel scans meegaan. */
  aantalScans?: number;
}

export interface ControleUitkomst {
  id: ControleId;
  titel: string;
  vondsten: Vondst[];
}

export const CONTROLE_TITELS: Record<ControleId, string> = {
  "scan-zonder-respondent": "Ingevulde scans zonder bestaande Respondent",
  "scan-zonder-meting": "Ingevulde scans zonder bestaande Meting",
  "respondent-zonder-organisatie": "Respondenten zonder bestaande Organisatie",
  "meting-zonder-organisatie": "Metingen zonder bestaande Organisatie",
  "lead-zonder-meting": "Leads met toegang tot een niet-bestaande Meting",
};

const assessmentNaam = (id: string) => getAssessment(id)?.naam ?? id;
const datum = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("nl-NL") : "niet afgerond");

export function controleerIntegriteit(alles: Organisatie[] = laadAlles()): ControleUitkomst[] {
  const orgIds = new Set(alles.map((o) => o.id));
  const uit: Record<ControleId, Vondst[]> = {
    "scan-zonder-respondent": [],
    "scan-zonder-meting": [],
    "respondent-zonder-organisatie": [],
    "meting-zonder-organisatie": [],
    "lead-zonder-meting": [],
  };

  for (const o of alles) {
    const lidIds = new Set(o.leden.map((l) => l.id));
    const metingIds = new Set(o.scanUitvoeringen.map((m) => m.id));
    const basis = { organisatieId: o.id, organisatieNaam: o.naam };

    for (const m of o.scanUitvoeringen) {
      if (!orgIds.has(m.organisatieId)) {
        uit["meting-zonder-organisatie"].push({
          ...basis,
          controle: "meting-zonder-organisatie",
          sleutel: `mzo-${m.id}`,
          recordId: m.id,
          ontbrekendId: m.organisatieId,
          regels: [`Meting: ${m.label}`, `Assessment: ${assessmentNaam(m.assessmentId)}`, `Aantal scans: ${m.invullingen.length}`, `Ontbrekende Organisatie: ${m.organisatieId}`],
          aantalScans: m.invullingen.length,
        });
      }
      for (const i of m.invullingen) {
        const scanRegels = [`Meting: ${m.label}`, `Assessment: ${assessmentNaam(m.assessmentId)}`, `Afgerond op: ${datum(i.afgerondOp)}`];
        if (!lidIds.has(i.organisatieLidId)) {
          uit["scan-zonder-respondent"].push({
            ...basis,
            controle: "scan-zonder-respondent",
            sleutel: `szr-${i.id}`,
            recordId: i.id,
            ontbrekendId: i.organisatieLidId,
            regels: [...scanRegels, `Ontbrekende Respondent: ${i.organisatieLidId}`],
          });
        }
        if (!metingIds.has(i.scanUitvoeringId)) {
          const lid = o.leden.find((l) => l.id === i.organisatieLidId);
          uit["scan-zonder-meting"].push({
            ...basis,
            controle: "scan-zonder-meting",
            sleutel: `szm-${i.id}`,
            recordId: i.id,
            ontbrekendId: i.scanUitvoeringId,
            regels: [`Respondent: ${lid?.naam || lid?.email || "onbekend"}`, `Organisatie: ${o.naam}`, ...scanRegels.slice(1), `Ontbrekende Meting: ${i.scanUitvoeringId}`],
          });
        }
      }
    }

    for (const l of o.leden) {
      const scans = o.scanUitvoeringen.reduce((n, m) => n + m.invullingen.filter((i) => i.organisatieLidId === l.id).length, 0);
      if (!orgIds.has(l.organisatieId)) {
        uit["respondent-zonder-organisatie"].push({
          ...basis,
          controle: "respondent-zonder-organisatie",
          sleutel: `rzo-${l.id}`,
          recordId: l.id,
          ontbrekendId: l.organisatieId,
          regels: [`Naam: ${l.naam || "(leeg)"}`, `E-mail: ${l.email}`, `Aantal scans: ${scans}`, `Ontbrekende Organisatie: ${l.organisatieId}`],
          aantalScans: scans,
        });
      }
      for (const metingId of l.leadMetingIds) {
        if (!metingIds.has(metingId)) {
          uit["lead-zonder-meting"].push({
            ...basis,
            controle: "lead-zonder-meting",
            sleutel: `lzm-${l.id}-${metingId}`,
            recordId: l.id,
            ontbrekendId: metingId,
            regels: [`Respondent: ${l.naam || l.email}`, `Organisatie: ${o.naam}`, `Ontbrekende Meting: ${metingId}`],
          });
        }
      }
    }
  }
  return (Object.keys(CONTROLE_TITELS) as ControleId[]).map((id) => ({ id, titel: CONTROLE_TITELS[id], vondsten: uit[id] }));
}

export function totaalVondsten(uitkomst: ControleUitkomst[]): number {
  return uitkomst.reduce((n, c) => n + c.vondsten.length, 0);
}

/* ---------- Acties per vondst ---------- */

const VANUIT = { vanuit: "Data-integriteit" };

interface RuweScan {
  organisatie: Organisatie;
  meting: ScanUitvoering;
  invulling: ScanInvulling;
}

/** Zoekt een scan ook als zijn Respondent ontbreekt (`zoekScanInvulling` slaat zulke scans over). */
function zoekRuweScan(alles: Organisatie[], scanId: string): RuweScan | null {
  for (const organisatie of alles) {
    for (const meting of organisatie.scanUitvoeringen) {
      const invulling = meting.invullingen.find((i) => i.id === scanId);
      if (invulling) return { organisatie, meting, invulling };
    }
  }
  return null;
}

export interface ActieResultaat {
  ok: boolean;
  reden?: string;
}

/** Scan zonder Respondent: Aan een Respondent van dezelfde Organisatie als de Meting koppelen. */
export function koppelWeesScanAanRespondent(scanId: string, lidId: string): ActieResultaat {
  return metExtraDetails(VANUIT, () => {
    const alles = laadAlles();
    const g = zoekRuweScan(alles, scanId);
    if (!g) return { ok: false, reden: "Ingevulde scan niet gevonden." };
    const lid = g.organisatie.leden.find((l) => l.id === lidId);
    if (!lid) return { ok: false, reden: "De gekozen Respondent bestaat niet in deze organisatie." };
    if (g.meting.invullingen.some((i) => i.id !== scanId && i.organisatieLidId === lidId)) {
      return { ok: false, reden: "Deze Respondent heeft in deze Meting al een scan." };
    }
    g.invulling.organisatieLidId = lidId;
    slaAlles(alles);
    logAudit({
      actie: "respons.respondentGewijzigd",
      entiteitType: "scan",
      entiteitId: scanId,
      details: { ...metingContext(g.organisatie, g.meting), nieuweRespondent: false },
    });
    return { ok: true };
  });
}

/** Scan zonder Meting: Aan een Meting van dezelfde Organisatie en hetzelfde Assessment koppelen. */
export function koppelWeesScanAanMeting(scanId: string, metingId: string): ActieResultaat {
  return metExtraDetails(VANUIT, () => {
    const alles = laadAlles();
    const g = zoekRuweScan(alles, scanId);
    if (!g) return { ok: false, reden: "Ingevulde scan niet gevonden." };
    const doel = g.organisatie.scanUitvoeringen.find((m) => m.id === metingId);
    if (!doel) return { ok: false, reden: "De gekozen Meting bestaat niet in deze organisatie." };
    if (doel.assessmentId !== g.meting.assessmentId) return { ok: false, reden: "De Meting heeft een ander Assessment-type." };
    if (doel.id !== g.meting.id) {
      if (doel.invullingen.some((i) => i.organisatieLidId === g.invulling.organisatieLidId)) {
        return { ok: false, reden: "Deze Respondent heeft in die Meting al een scan." };
      }
      g.meting.invullingen = g.meting.invullingen.filter((i) => i.id !== scanId);
      doel.invullingen.push(g.invulling);
    }
    g.invulling.scanUitvoeringId = doel.id;
    slaAlles(alles);
    logAudit({
      actie: "respons.metingVerplaatst",
      entiteitType: "scan",
      entiteitId: scanId,
      details: { ...organisatieContext(g.organisatie), bronMeting: g.meting.label, doelMeting: doel.label, aantal: 1 },
    });
    return { ok: true };
  });
}

/** Respondent zonder Organisatie: Aan een bestaande Organisatie koppelen, zoals "Hele respondent verplaatsen". */
export function koppelWeesRespondentAanOrganisatie(lidId: string, organisatieId: string): ActieResultaat {
  return metExtraDetails(VANUIT, () => {
    const alles = laadAlles();
    const bron = alles.find((o) => o.leden.some((l) => l.id === lidId));
    if (!bron) return { ok: false, reden: "Respondent niet gevonden." };
    if (bron.id === organisatieId) {
      const lid = bron.leden.find((l) => l.id === lidId)!;
      lid.organisatieId = bron.id;
      slaAlles(alles);
      logAudit({ actie: "respondent.bewerkt", entiteitType: "respondent", entiteitId: lidId, details: { ...organisatieContext(bron), velden: ["organisatie"] } });
      return { ok: true };
    }
    const r = verplaatsRespondentNaarOrganisatie(lidId, organisatieId, []);
    return { ok: r.ok, reden: r.reden };
  });
}

/** Meting zonder Organisatie: Aan een bestaande Organisatie koppelen. */
export function koppelWeesMetingAanOrganisatie(metingId: string, organisatieId: string): ActieResultaat {
  return metExtraDetails(VANUIT, () => {
    const alles = laadAlles();
    const bron = alles.find((o) => o.scanUitvoeringen.some((m) => m.id === metingId));
    const doel = alles.find((o) => o.id === organisatieId);
    if (!bron || !doel) return { ok: false, reden: "Meting of Organisatie niet gevonden." };
    const meting = bron.scanUitvoeringen.find((m) => m.id === metingId)!;
    if (bron.id !== doel.id) {
      bron.scanUitvoeringen = bron.scanUitvoeringen.filter((m) => m.id !== metingId);
      doel.scanUitvoeringen.push(meting);
      // De Respondenten van de scans moeten in de doelorganisatie bestaan: Hergebruik op e-mailadres, anders een kopie.
      for (const i of meting.invullingen) {
        const lid = bron.leden.find((l) => l.id === i.organisatieLidId);
        if (!lid || doel.leden.some((l) => l.id === lid.id)) continue;
        const zelfdeEmail = doel.leden.find((l) => l.email === lid.email);
        if (zelfdeEmail) i.organisatieLidId = zelfdeEmail.id;
        else doel.leden.push({ ...lid, organisatieId: doel.id, leadMetingIds: [] });
      }
    }
    meting.organisatieId = doel.id;
    slaAlles(alles);
    logAudit({ actie: "meting.verplaatst", entiteitType: "meting", entiteitId: metingId, entiteitNaam: meting.label, details: { ...metingContext(doel, meting), bronOrganisatieNaam: bron.naam } });
    return { ok: true };
  });
}

/** Lead met niet-bestaande Meting: Alleen de toegang vervalt, de Respondent blijft. */
export function verwijderLeadVerwijzing(lidId: string, metingId: string): ActieResultaat {
  return metExtraDetails(VANUIT, () => {
    const alles = laadAlles();
    const o = alles.find((x) => x.leden.some((l) => l.id === lidId));
    const lid: OrganisatieLid | undefined = o?.leden.find((l) => l.id === lidId);
    if (!o || !lid) return { ok: false, reden: "Respondent niet gevonden." };
    lid.leadMetingIds = lid.leadMetingIds.filter((id) => id !== metingId);
    slaAlles(alles);
    logAudit({ actie: "respondent.leadVerwijzingVerwijderd", entiteitType: "respondent", entiteitId: lidId, details: { ...organisatieContext(o), aantalMetingenNa: lid.leadMetingIds.length } });
    return { ok: true };
  });
}

