import { Assessment, Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "./types";
import { alleBouwblokkenMetGroep, isVlakkeAssessment } from "./assessment-structuur";
import { alleBouwblokResultaten, alleGroepResultaten, overallScore, voortgang } from "./scoring";

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

/**
 * `groepsScores` met de hand opgebouwd (niet `JSON.stringify`): de spec
 * schrijft de score-decimalen met een komma (Excel-NL), wat van dit veld
 * strikt genomen geen valide JSON meer maakt. Dat is bewust — dit is de
 * laatste stap in de keten, niets leest de CSV terug in de app
 * (export-csv.md).
 */
function groepsScoresVeld(
  type: "categorie" | "bouwblok",
  groepen: { groepNaam: string; score: number | null }[]
): string {
  const items = groepen
    .map((g) => `{"naam":${JSON.stringify(g.groepNaam)},"score":${g.score !== null ? csvGetal(g.score) : "null"}}`)
    .join(",");
  return `{"type":${JSON.stringify(type)},"groepen":[${items}]}`;
}

function bouwRij(ctx: CsvRijContext): string[] {
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
    const groepResultaten = alleGroepResultaten(assessment, bouwblokResultaten);
    const overall = overallScore(bouwblokResultaten.map((r) => r.score));
    overallVeld = overall !== null ? csvGetal(overall) : "";

    groepen = groepsScoresVeld(
      isVlakkeAssessment(assessment) ? "bouwblok" : "categorie",
      groepResultaten.map((g) => ({ groepNaam: g.groepNaam, score: g.score }))
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

  return [
    organisatie.naam,
    scanUitvoering.label,
    assessment.naam,
    lid.naam ?? "",
    lid.email,
    lid.functie,
    lid.team,
    invulling.status,
    invulling.uitgenodigdOp,
    invulling.gestartOp ?? "",
    invulling.afgerondOp ?? "",
    String(beantwoord),
    String(totaal),
    overallVeld,
    groepen,
    JSON.stringify(organisatie.kenmerken),
    antwoordenVeld,
    opmerkingenVeld,
  ];
}

/** UTF-8 met BOM, puntkomma-gescheiden, CRLF — Excel-NL opent dit zonder handmatige encoding-keuze (export-csv.md, "CSV-formaat"). */
export function genereerScansCsv(rijen: CsvRijContext[]): string {
  const regels = [KOLOMMEN.join(";"), ...rijen.map((r) => bouwRij(r).map(csvVeld).join(";"))];
  return "﻿" + regels.join("\r\n") + "\r\n";
}

function saneerBestandsnaam(naam: string): string {
  return naam.replace(/[^\p{L}\p{N} ._-]/gu, "");
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
