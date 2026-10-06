import { Assessment } from "@/lib/types";
import { isVlakkeAssessment } from "@/lib/assessment-structuur";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  overallScore,
  classificatie,
  topSterktesEnVerbeterkansen,
  voortgang,
} from "@/lib/scoring";
import { radarChartSvg, barChartSvg } from "@/lib/pdf/charts";
import { escapeXml, slug } from "./xml-utils";
import { standaloneSvg, scoreAlgemeenSvg, top3ListSvg } from "./charts";
import { kenmerkenXml } from "./kenmerken-xml";
import { contentSectieXml } from "./content-sectie";

export interface ExportIndesignPayload {
  assessment: Assessment;
  antwoorden: Record<string, number>;
  organisatieNaam: string;
  organisatieKenmerken: Record<string, unknown>;
  respondentNaam: string;
  respondentFunctie: string;
  respondentTeam: string;
  metingLabel: string;
  afgerondOp: string | null;
}

export interface IndesignExportResultaat {
  /** Bestandsnaam van de ZIP, `<Organisatie> InDesign Export.zip`. */
  bestandsnaam: string;
  /** Alle bestanden die in de ZIP horen: pad → tekstinhoud (XML/SVG, allemaal tekst). */
  bestanden: Record<string, string>;
}

function formatDatum(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

/** Bouwt de XML + losse SVG-bestanden voor de InDesign-export van één ingevulde scan (export-indesign.md). */
export function buildIndesignExport(payload: ExportIndesignPayload): IndesignExportResultaat {
  const { assessment, antwoorden, organisatieNaam, organisatieKenmerken, respondentNaam, respondentFunctie, respondentTeam, metingLabel, afgerondOp } =
    payload;

  const bouwblokResultaten = alleBouwblokResultaten(assessment, antwoorden);
  const groepResultaten = alleGroepResultaten(assessment, bouwblokResultaten, antwoorden);
  const overall = overallScore(assessment, antwoorden);
  const overallKlasse = overall !== null ? classificatie(overall) : null;
  const { beantwoord, totaal } = voortgang(assessment, antwoorden);
  const { sterktes, verbeterkansen } = topSterktesEnVerbeterkansen(bouwblokResultaten);

  // Valt terug op de volledige assessment-naam als een (oud opgeslagen)
  // assessment nog geen kortLabel heeft — zelfde afwijking als
  // lib/pdf/bestandsnaam.ts, hier ook toegepast op het <kortLabel>-element
  // verderop, niet alleen op de bestandsnaam-slug.
  const kortLabel = assessment.kortLabel || assessment.naam;
  const orgSlug = slug(organisatieNaam);
  const scanSlug = slug(kortLabel);
  const bestandsnaamRadar = `${orgSlug}-${scanSlug}-radar.svg`;
  const bestandsnaamStaaf = `${orgSlug}-${scanSlug}-staafdiagram.svg`;
  const bestandsnaamScoreAlgemeen = `${orgSlug}-${scanSlug}-score-algemeen.svg`;
  const bestandsnaamTop3Sterktes = `${orgSlug}-${scanSlug}-top3-sterktes.svg`;
  const bestandsnaamTop3Verbeterkansen = `${orgSlug}-${scanSlug}-top3-verbeterkansen.svg`;

  const groepsScoresXml = `<groepsScores type="${isVlakkeAssessment(assessment) ? "bouwblok" : "categorie"}">${groepResultaten
    .map((g) => `<groep naam="${escapeXml(g.groepNaam)}" score="${g.score !== null ? g.score.toFixed(1) : ""}" />`)
    .join("")}</groepsScores>`;

  const href = (bestand: string) => `file:///./${bestand}`;

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<scanExport>` +
    `<organisatie><naam>${escapeXml(organisatieNaam)}</naam>${kenmerkenXml(organisatieKenmerken)}</organisatie>` +
    `<respondent><naam>${escapeXml(respondentNaam)}</naam><functie>${escapeXml(respondentFunctie || "n.v.t.")}</functie><team>${escapeXml(respondentTeam || "n.v.t.")}</team></respondent>` +
    `<meting><label>${escapeXml(metingLabel)}</label></meting>` +
    `<assessment><naam>${escapeXml(assessment.naam)}</naam><kortLabel>${escapeXml(kortLabel)}</kortLabel></assessment>` +
    `<datum>${formatDatum(afgerondOp)}</datum>` +
    `<overallScore waarde="${overall !== null ? overall.toFixed(1) : ""}" van="5" />` +
    `<voortgang beantwoord="${beantwoord}" totaal="${totaal}" />` +
    groepsScoresXml +
    `<charts>` +
    `<scoreAlgemeen href="${href(bestandsnaamScoreAlgemeen)}" />` +
    `<radar href="${href(bestandsnaamRadar)}" />` +
    `<staafdiagram href="${href(bestandsnaamStaaf)}" />` +
    `<top3Sterktes href="${href(bestandsnaamTop3Sterktes)}" />` +
    `<top3Verbeterkansen href="${href(bestandsnaamTop3Verbeterkansen)}" />` +
    `</charts>` +
    contentSectieXml(assessment.pdfContentSecties) +
    `</scanExport>`;

  const radarSvg = standaloneSvg(
    radarChartSvg(bouwblokResultaten.map((r) => ({ label: `${r.bouwblok.volgnummer}. ${r.bouwblok.naam}`, score: r.score })))
  );
  const staafSvg = standaloneSvg(barChartSvg(groepResultaten.map((r) => ({ label: r.groepNaam, score: r.score }))));
  const scoreAlgemeenSvgTekst =
    overall !== null && overallKlasse ? scoreAlgemeenSvg(overall, overallKlasse) : standaloneSvg('<svg viewBox="0 0 1 1"></svg>');
  const top3SterktesSvg = top3ListSvg(sterktes.map((r) => ({ naam: r.bouwblok.naam, score: r.score })));
  const top3VerbeterkansenSvg = top3ListSvg(verbeterkansen.map((r) => ({ naam: r.bouwblok.naam, score: r.score })));

  return {
    bestandsnaam: `${organisatieNaam.replace(/[^\p{L}\p{N} ._-]/gu, "")} InDesign Export.zip`,
    bestanden: {
      "scan-export.xml": xml,
      [bestandsnaamRadar]: radarSvg,
      [bestandsnaamStaaf]: staafSvg,
      [bestandsnaamScoreAlgemeen]: scoreAlgemeenSvgTekst,
      [bestandsnaamTop3Sterktes]: top3SterktesSvg,
      [bestandsnaamTop3Verbeterkansen]: top3VerbeterkansenSvg,
    },
  };
}
