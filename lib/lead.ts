/**
 * De Lead-rol (`datamodel.md` deel 2, Wat een Lead mag zien): Een Respondent is Lead als hij de rol heeft. Wat een Lead ziet,
 * staat per weergave in `Organisatie.leadToegang` (`lib/lead-toegang.ts`). Eén plek voor de vraag "is dit een Lead", zodat
 * badge, lijsten, rechten en de tabel Leads dezelfde definitie gebruiken.
 */
import { OrganisatieLid } from "./types";

export function isLead(lid: Pick<OrganisatieLid, "lead">): boolean {
  return lid.lead === true;
}
