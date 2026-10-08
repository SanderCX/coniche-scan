import { Assessment, Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "./types";
import { alleBouwblokkenMetGroep, isVlakkeAssessment } from "./assessment-structuur";
import { alleBouwblokResultaten, alleGroepResultaten, overallScore, voortgang } from "./scoring";
import { formatGewicht } from "./format";

/**
 * CSV-export van ingevulde scans (`export-csv.md`), vanaf de
 * resultatenpagina (één scan) en `beheerpagina.md` punt 7,
 * Ingevulde scans (één of meerdere geselecteerde scans, binnen één
 * organisatie). Client-side: alle data staat al in de browser
 * (localStorage), geen serverroute nodig zoals bij de PDF-export.
 */
export interface CsvRijContext {
  organisatie: Organisatie;
  scanUitvoering: ScanUitvoering;
  lid: OrganisatieLid;
  invulling: ScanInvulling;
  assessment: Assessment;
}

const KOLOMMEN = [
  "organisatie_naam",
  "meting_label",
  "assessment_naam",
  "respondent_naam",
  "respondent_email",
  "respondent_functie",
  "respondent_team",
  "status",
  "aangemaakt_op",
  "uitgenodigd_op",
  "gestart_op",
  "afgerond_op",
  "aantal_beantwoord",
  "aantal_vragen_totaal",
  "overall_score",
  "groepsScores",
  "organisatie_kenmerken",
  "antwoorden",
  "opmerkingen_per_bouwblok",
];

function labelVoorSchaal(assessment: Assessment, score: number): string {
  const afgerond = Math.min(5, Math.max(1, Math.round(score)));
  return assessment.schaal.find((s) => s.waarde === afgerond)?.label ?? String(afgerond);
}

/** Standaard CSV-escaping: veld tussen dubbele aanhalingstekens, interne aanhalingstekens verdubbeld. */
function csvVeld(waarde: string): string {
  return `"${waarde.replace(/"/g, '""')}"`;
}

/** Excel-NL-notatie: komma als decimaalteken, niet een punt (export-csv.md, "CSV-formaat"). */
function csvGetal(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

/** Gewicht in de CSV: Nederlandse komma bij een decimaal (`1,5`), geen overbodige decimalen (`2`). */
function csvGewicht(gewicht: number): string {
  return formatGewicht(gewicht);
}

interface CsvBouwblokScore {
  nummer: number;
  naam: string;
  score: number | null;
  gewicht: number;
}

interface CsvGroepScore {
  groepNaam: string;
  score: number | null;
  /** Bij type "bouwblok" is de groep zelf een bouwblok: `nummer` en `gewicht` staan dan direct op de groep. */
  nummer?: number;
  gewicht?: number;
  /** Bij type "categorie": De bouwblokken binnen de groep, met het gewicht per bouwblok. */
  bouwblokken?: CsvBouwblokScore[];
}

const csvScore = (score: number | null) => (score !== null ? csvGetal(score) : "null");

/**
 * `groepsScores` met de hand opgebouwd (niet `JSON.stringify`): de spec
 * schrijft de score-decimalen met een komma (Excel-NL), wat van dit veld
 * strikt genomen geen valide JSON meer maakt. Dat is bewust — dit is de
 * laatste stap in de keten, niets leest de CSV terug in de app
 * (export-csv.md). Het gewicht staat er altijd, ook bij 1: Dit is machinedata,
 * geen weergave.
 */
function groepsScoresVeld(type: "categorie" | "bouwblok", groepen: CsvGroepScore[]): string {
  const items = groepen
    .map((g) => {
      const basis = `"naam":${JSON.stringify(g.groepNaam)},"score":${csvScore(g.score)}`;
      if (g.bouwblokken) {
        const blokken = g.bouwblokken
          .map(
            (b) =>
              `{"nummer":${b.nummer},"naam":${JSON.stringify(b.naam)},"score":${csvScore(b.score)},"gewicht":${csvGewicht(b.gewicht)}}`
          )
          .join(",");
        return `{${basis},"bouwblokken":[${blokken}]}`;
      }
      return `{${basis},"nummer":${g.nummer ?? 0},"gewicht":${csvGewicht(g.gewicht ?? 1)}}`;
    })
    .join(",");
  return `{"type":${JSON.stringify(type)},"groepen":[${items}]}`;
}

function bouwRijRecord(ctx: CsvRijContext): Record<string, string> {
  const { organisatie, scanUitvoering, lid, invulling, assessment } = ctx;
  const { beantwoord, totaal } = voortgang(assessment, invulling.antwoorden);

  let overallVeld = "";
  let groepen = "";

  // Score-samenvatting alleen bij een afgeronde invulling (export-csv.md,
  // "Berekende score-samenvatting"): geen score op een onvolledige invulling.
  // `antwoorden`/`opmerkingen_per_bouwblok` hieronder kennen die restrictie
  // niet — die tonen gewoon wat er tot nu toe al ingevuld is, ook bij
  // "bezig" (`aantal_beantwoord` hierboven doet dat ook al).
  if (invulling.status === "afgerond") {
    const bouwblokResultaten = alleBouwblokResultaten(assessment, invulling.antwoorden);
    const groepResultaten = alleGroepResultaten(assessment, bouwblokResultaten, invulling.antwoorden);
    const overall = overallScore(assessment, invulling.antwoorden);
    overallVeld = overall !== null ? csvGetal(overall) : "";

    const vlak = isVlakkeAssessment(assessment);
    groepen = groepsScoresVeld(
      vlak ? "bouwblok" : "categorie",
      groepResultaten.map((g) => {
        if (vlak) {
          // De groep is het bouwblok zelf.
          const r = bouwblokResultaten.find((x) => x.bouwblok.id === g.groepId);
          return { groepNaam: g.groepNaam, score: g.score, nummer: r?.bouwblok.volgnummer ?? 0, gewicht: r?.gewicht ?? 1 };
        }
        return {
          groepNaam: g.groepNaam,
          score: g.score,
          bouwblokken: bouwblokResultaten
            .filter((r) => r.groepId === g.groepId)
            .map((r) => ({ nummer: r.bouwblok.volgnummer, naam: r.bouwblok.naam, score: r.score, gewicht: r.gewicht })),
        };
      })
    );
  }

  const antwoordItems = alleBouwblokkenMetGroep(assessment).flatMap(({ bouwblok }) =>
    bouwblok.vragen
      .filter((v) => typeof invulling.antwoorden[v.id] === "number")
      .map((v) => ({
        bouwblokId: bouwblok.id,
        bouwblokNaam: bouwblok.naam,
        vraagId: v.id,
        vraagTekst: v.tekst,
        score: invulling.antwoorden[v.id],
        schaalLabel: labelVoorSchaal(assessment, invulling.antwoorden[v.id]),
      }))
  );
  const antwoordenVeld = JSON.stringify(antwoordItems);

  // Alleen bouwblokken met een ingevulde opmerking (export-csv.md,
  // "Antwoorden"): een leeg gemaakte opmerking (respondent typt iets en
  // wist het weer) laat een lege string in `opmerkingenPerBouwblok` achter
  // die hier niet als "ingevuld" mag tellen.
  const opmerkingenMetInhoud = Object.fromEntries(
    Object.entries(invulling.opmerkingenPerBouwblok).filter(([, tekst]) => tekst.trim() !== "")
  );
  const opmerkingenVeld = JSON.stringify(opmerkingenMetInhoud);

  return {
    organisatie_naam: organisatie.naam,
    meting_label: scanUitvoering.label,
    assessment_naam: assessment.naam,
    respondent_naam: lid.naam ?? "",
    respondent_email: lid.email,
    respondent_functie: lid.functie,
    respondent_team: lid.team,
    respondent_notities: lid.notities,
    respondent_aangemaakt_op: lid.aangemaaktOp,
    status: invulling.status,
    aangemaakt_op: invulling.aangemaaktOp,
    uitgenodigd_op: invulling.uitgenodigdOp,
    gestart_op: invulling.gestartOp ?? "",
    afgerond_op: invulling.afgerondOp ?? "",
    aantal_beantwoord: String(beantwoord),
    aantal_vragen_totaal: String(totaal),
    overall_score: overallVeld,
    groepsScores: groepen,
    organisatie_kenmerken: JSON.stringify(organisatie.kenmerken),
    antwoorden: antwoordenVeld,
    opmerkingen_per_bouwblok: opmerkingenVeld,
  };
}

function bouwRij(ctx: CsvRijContext): string[] {
  const record = bouwRijRecord(ctx);
  return KOLOMMEN.map((k) => record[k] ?? "");
}

/** UTF-8 met BOM, puntkomma-gescheiden, CRLF — Excel-NL opent dit zonder handmatige encoding-keuze (export-csv.md, "CSV-formaat"). */
export function genereerScansCsv(rijen: CsvRijContext[]): string {
  const regels = [KOLOMMEN.join(";"), ...rijen.map((r) => bouwRij(r).map(csvVeld).join(";"))];
  return "﻿" + regels.join("\r\n") + "\r\n";
}

/**
 * Inzage (AVG), `export-csv.md`: Alle scans van één Respondent (ook `uitgenodigd` en `bezig`), één rij per scan, met
 * dezelfde kolomstructuur als hierboven plus `respondent_notities` en `respondent_aangemaakt_op`, en zonder
 * `organisatie_kenmerken`. Een Respondent zonder scans geeft één rij met alleen de persoonsgegevens.
 */
const INZAGE_KOLOMMEN = [
  ...KOLOMMEN.slice(0, KOLOMMEN.indexOf("respondent_team") + 1),
  "respondent_notities",
  "respondent_aangemaakt_op",
  ...KOLOMMEN.slice(KOLOMMEN.indexOf("respondent_team") + 1).filter((k) => k !== "organisatie_kenmerken"),
];

export function genereerInzageCsv(
  organisatie: Organisatie,
  lid: OrganisatieLid,
  assessments: Assessment[]
): { csv: string; aantalScans: number } {
  const scans: CsvRijContext[] = organisatie.scanUitvoeringen.flatMap((scanUitvoering) =>
    scanUitvoering.invullingen
      .filter((i) => i.organisatieLidId === lid.id)
      .flatMap((invulling) => {
        const assessment = assessments.find((a) => a.id === scanUitvoering.assessmentId);
        return assessment ? [{ organisatie, scanUitvoering, lid, invulling, assessment }] : [];
      })
  );
  const records: Record<string, string>[] =
    scans.length > 0
      ? scans.map(bouwRijRecord)
      : [
          {
            organisatie_naam: organisatie.naam,
            respondent_naam: lid.naam ?? "",
            respondent_email: lid.email,
            respondent_functie: lid.functie,
            respondent_team: lid.team,
            respondent_notities: lid.notities,
            respondent_aangemaakt_op: lid.aangemaaktOp,
          },
        ];
  const regels = [INZAGE_KOLOMMEN.join(";"), ...records.map((r) => INZAGE_KOLOMMEN.map((k) => csvVeld(r[k] ?? "")).join(";"))];
  return { csv: "\uFEFF" + regels.join("\r\n") + "\r\n", aantalScans: scans.length };
}

/** "Inzage <Organisatie> - <Respondent> - <datum>.csv"; Is de naam leeg, dan staat het e-mailadres op die plek. */
export function inzageBestandsnaam(organisatie: Organisatie, lid: OrganisatieLid, datum = new Date()): string {
  const iso = datum.toISOString().slice(0, 10);
  return `${saneerBestandsnaam(`Inzage ${organisatie.naam} - ${lid.naam || lid.email} - ${iso}`)}.csv`;
}

function saneerBestandsnaam(naam: string): string {
  return naam.replace(/[^\p{L}\p{N} ._@-]/gu, "");
}

/** Eén scan (resultatenpagina): "<Organisatie> - <Respondent> - <Meting>.csv". */
export function csvBestandsnaamEnkel(ctx: CsvRijContext): string {
  const respondentNaam = ctx.lid.naam || ctx.lid.email;
  return `${saneerBestandsnaam(`${ctx.organisatie.naam} - ${respondentNaam} - ${ctx.scanUitvoering.label}`)}.csv`;
}

/** Meerdere scans (Ingevulde scans, bulk): "Ingevulde scans export <datum>.csv". */
export function csvBestandsnaamBulk(datum = new Date()): string {
  const iso = datum.toISOString().slice(0, 10);
  return `Ingevulde scans export ${iso}.csv`;
}

/** Triggert een browserdownload van tekst (CSV) zonder server-omweg. */
export function downloadTekstBestand(inhoud: string, bestandsnaam: string, mimeType: string): void {
  const blob = new Blob([inhoud], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = bestandsnaam;
  link.click();
  URL.revokeObjectURL(url);
}
