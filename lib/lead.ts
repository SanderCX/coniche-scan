/**
 * Het bereik van een Lead (`datamodel.md` deel 2, Het bereik van een Lead; `benchmark.md`, Bereik van een Lead).
 *
 * Een Lead heeft een van twee bereiken: Specifieke Metingen (`leadMetingIds`, standaard) of de hele organisatie
 * (`leadVoorOrganisatie`). Een Respondent is Lead als een van beide geldt. Bij de hele organisatie tellen alle Metingen
 * van zijn organisatie mee, ook Metingen die later worden aangemaakt.
 *
 * Eén plek, zodat badge, lijsten, rechten en de benchmark dezelfde definitie gebruiken.
 */

export interface LeadBereikLid {
  organisatieId: string;
  leadMetingIds: string[];
  leadVoorOrganisatie?: boolean;
}

/** Een Respondent is Lead als `leadVoorOrganisatie` aan staat of als hij minstens één Meting heeft (`datamodel.md`, Wat een Lead is). */
export function isLead(lid: Pick<LeadBereikLid, "leadMetingIds" | "leadVoorOrganisatie">): boolean {
  return lid.leadVoorOrganisatie === true || lid.leadMetingIds.length > 0;
}

/** Lead voor de hele organisatie van zijn eigen Respondent-record. */
export function isLeadVoorOrganisatie(lid: Pick<LeadBereikLid, "leadVoorOrganisatie">): boolean {
  return lid.leadVoorOrganisatie === true;
}

/**
 * De Meting-id's die een Lead mag zien: Alle Metingen van zijn organisatie bij `leadVoorOrganisatie`, anders de
 * Metingen in `leadMetingIds` (`RespondentRolMeting`).
 */
export function leadMetingIdsVan(lid: LeadBereikLid, organisatie: { scanUitvoeringen: { id: string }[] }): string[] {
  if (lid.leadVoorOrganisatie === true) return organisatie.scanUitvoeringen.map((s) => s.id);
  return lid.leadMetingIds;
}

/** Heeft de Lead bereik op deze organisatie als geheel? Alleen bij `leadVoorOrganisatie`, en alleen zijn eigen organisatie. */
export function heeftBereikOpOrganisatie(lid: LeadBereikLid, organisatieId: string): boolean {
  return lid.leadVoorOrganisatie === true && lid.organisatieId === organisatieId;
}

/**
 * Heeft de Lead bereik op deze Meting van deze organisatie? Bij de hele organisatie op elke Meting daarvan, anders op de
 * Metingen in `leadMetingIds`. Een Lead heeft nooit bereik op een andere organisatie.
 */
export function heeftBereikOpMeting(lid: LeadBereikLid, organisatieId: string, metingId: string): boolean {
  if (lid.organisatieId !== organisatieId) return false;
  return lid.leadVoorOrganisatie === true || lid.leadMetingIds.includes(metingId);
}

/** De samenvatting onder het vakje "Lead" in het Respondent-overzicht (`beheerpagina.md`, punt 6a). */
export function leadSamenvatting(lid: Pick<LeadBereikLid, "leadMetingIds" | "leadVoorOrganisatie">): string {
  if (lid.leadVoorOrganisatie === true) return "Lead voor de hele organisatie";
  const aantal = lid.leadMetingIds.length;
  if (aantal === 0) return "Geen Lead";
  return `Lead voor ${aantal} ${aantal === 1 ? "Meting" : "Metingen"}`;
}
