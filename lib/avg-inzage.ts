import { Assessment, Organisatie, OrganisatieLid } from "./types";
import { downloadTekstBestand, genereerInzageCsv, inzageBestandsnaam } from "./csv-export";
import { logAudit } from "./audit-store";
import { organisatieContext } from "./audit-context";

/**
 * AVG-verzoek, Inzage (`beheerpagina.md` punt 6b, `export-csv.md` Inzage (AVG)): Een CSV met alle gegevens van deze
 * Respondent, één rij per scan. De actie is een gewone knop en vraagt geen bevestiging, omdat ze niets wijzigt. Elke
 * inzage wordt gelogd als `respondent.inzage`, met alleen het aantal scans en geen persoonsgegevens.
 */
export function downloadAvgInzage(organisatie: Organisatie, lid: OrganisatieLid, assessments: Assessment[]): void {
  const { csv, aantalScans } = genereerInzageCsv(organisatie, lid, assessments);
  downloadTekstBestand(csv, inzageBestandsnaam(organisatie, lid), "text/csv;charset=utf-8");
  logAudit({
    actie: "respondent.inzage",
    entiteitType: "respondent",
    entiteitId: lid.id,
    details: { ...organisatieContext(organisatie), aantalScans },
  });
}
