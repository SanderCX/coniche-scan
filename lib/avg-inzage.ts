import { Assessment, Organisatie, OrganisatieLid } from "./types";
import { downloadTekstBestand } from "./csv-export";

/**
 * AVG-verzoek, Inzage (beheerpagina.md punt 6b): alle data van deze
 * respondent — persoonsgegevens én scanresultaten over ALLE metingen van
 * de organisatie heen. Bestandsformaat JSON: eenvoudigst om alles (geneste
 * antwoorden/opmerkingen) leesbaar in één bestand te krijgen.
 */
export function downloadAvgInzage(organisatie: Organisatie, lid: OrganisatieLid, assessments: Assessment[]): void {
  const scans = organisatie.scanUitvoeringen.flatMap((s) =>
    s.invullingen
      .filter((i) => i.organisatieLidId === lid.id)
      .map((i) => ({
        meting: s.label,
        assessment: assessments.find((a) => a.id === s.assessmentId)?.naam ?? "Onbekend type",
        status: i.status,
        uitgenodigdOp: i.uitgenodigdOp,
        gestartOp: i.gestartOp,
        afgerondOp: i.afgerondOp,
        antwoorden: i.antwoorden,
        opmerkingenPerBouwblok: i.opmerkingenPerBouwblok,
      }))
  );
  const data = {
    naam: lid.naam,
    email: lid.email,
    functie: lid.functie,
    team: lid.team,
    notities: lid.notities,
    scans,
  };
  downloadTekstBestand(JSON.stringify(data, null, 2), `AVG-inzage - ${lid.naam || lid.email}.json`, "application/json");
}
