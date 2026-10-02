import { Assessment, ContentBron } from "@/lib/types";
import { alleBouwblokkenMetGroep, isVlakkeAssessment } from "@/lib/assessment-structuur";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  bouwblokScore,
  overallScore,
  classificatie,
  topSterktesEnVerbeterkansen,
  voortgang,
} from "@/lib/scoring";
import { scoreKleur, CLASSIFICATIE_INFO, CLASSIFICATIE_SCORES, SCORE_KLEUR, ANTWOORD_KLEUR } from "@/lib/colors";
import { toelichtingVoor } from "@/lib/bouwblok-info";
import { contentVoorBron } from "./content-secties";
import { radarChartSvg, barChartSvg } from "./charts";
import { escapeHtml } from "./escape-html";
import { visieIntro } from "@/data/visie-content";

export interface ExportPdfPayload {
  assessment: Assessment;
  antwoorden: Record<string, number>;
  opmerkingenPerBouwblok: Record<string, string>;
  organisatieNaam: string;
  respondentNaam: string;
  afgerondOp: string | null;
}

/** Titel in de hero van een algemene sectie: dezelfde als op de bijbehorende webpagina. */
const HERO_TITEL: Partial<Record<ContentBron, string>> = {
  "visie-coniche.md-deel1": "Onze visie op goed klantcontact",
  "content-2030.md": "Klantcontact richting 2030",
};

/**
 * Secties waarvan de pagina-indeling vaststaat krijgen pagina's zonder
 * bovenmarge, zodat de oranje gloed vanaf de paginarand loopt. Visie past op
 * 1 pagina; 2030 is handmatig over pagina's verdeeld (`.pdf-pagina`, met eigen
 * bovenruimte). Een sectie met vrij doorlopende tekst hoort hier niet in:
 * elke vervolgpagina zou dan zonder bovenmarge beginnen.
 */
const PAST_OP_1_PAGINA: ContentBron[] = ["visie-coniche.md-deel1", "content-2030.md"];

/** Subtitel onder de hero-titel van een algemene sectie (alleen waar de webpagina er een heeft). */
const HERO_SUBTITEL: Partial<Record<ContentBron, string>> = {
  "visie-coniche.md-deel1": visieIntro,
};

function formatDatum(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function labelVoorSchaal(assessment: Assessment, score: number): string {
  const afgerond = Math.min(5, Math.max(1, Math.round(score)));
  return assessment.schaal.find((s) => s.waarde === afgerond)?.label ?? String(afgerond);
}

/** Veilig voor gebruik binnen een CSS-string tussen dubbele aanhalingstekens. */
function cssTekst(t: string): string {
  return t.replace(/[\\"]/g, "\\$&").replace(/[\r\n]+/g, " ");
}

export function buildResultatenPdfHtml(payload: ExportPdfPayload, logoDataUri: string): string {
  const { assessment, antwoorden, opmerkingenPerBouwblok, organisatieNaam, respondentNaam, afgerondOp } =
    payload;

  const bouwblokResultaten = alleBouwblokResultaten(assessment, antwoorden);
  const groepResultaten = alleGroepResultaten(assessment, bouwblokResultaten);
  const overall = overallScore(bouwblokResultaten.map((r) => r.score));
  const overallKlasse = overall !== null ? classificatie(overall) : null;
  const overallKleur = overall !== null ? scoreKleur(overall) : "#888884";
  const { sterktes, verbeterkansen } = topSterktesEnVerbeterkansen(bouwblokResultaten);
  const { beantwoord, totaal } = voortgang(assessment, antwoorden);

  const radarSvg = radarChartSvg(
    bouwblokResultaten.map((r) => ({ label: `${r.bouwblok.volgnummer}. ${r.bouwblok.naam}`, score: r.score }))
  );
  const barSvg = barChartSvg(groepResultaten.map((r) => ({ label: r.groepNaam, score: r.score })));

  function top3Lijst(titel: string, items: { bouwblok: { naam: string }; score: number }[]): string {
    const rijen = items
      .map(
        (r) =>
          `<li><span class="score-badge klein" style="background:${scoreKleur(r.score)}">${r.score.toFixed(1)}</span>${escapeHtml(r.bouwblok.naam)}</li>`
      )
      .join("");
    return `<div class="top3-kolom"><h3>${titel}</h3><ul class="top3-lijst">${rijen}</ul></div>`;
  }

  const legendaHtml = (["rood", "oranje", "groen"] as const)
    .map((c) => {
      const info = CLASSIFICATIE_INFO[c];
      const scores = CLASSIFICATIE_SCORES[c];
      const stippen = scores
        .map((s) => `<span class="legenda-stip" style="background:${SCORE_KLEUR[s].hex}"></span>`)
        .join("");
      return `<div class="legenda-item">
        <span class="legenda-stippen">${stippen}</span>
        <div><p class="legenda-label" style="color:${SCORE_KLEUR[scores[0]].hex}">${escapeHtml(info.label)}</p>
        <p>${escapeHtml(info.omschrijving)}</p></div>
      </div>`;
    })
    .join("");

  // --- Per bouwblok: eerst de uitleg (indien beschikbaar), dan de vragen + score ---
  // toelichtingVoor() levert altijd op als er content voor dit bouwblok bestaat
  // (bouwstenen/AI-domeinen), ongeacht de slotsectie van dit Assessment: de
  // twee staan los van elkaar (export-pdf-visual-volwassenheidsscan.md,
  // "Slotsectie per scan-type").
  const slotsectie = assessment.pdfContentSecties;

  const bouwsteenBlokken = alleBouwblokkenMetGroep(assessment).map(({ bouwblok }) => {
    const score = bouwblokScore(bouwblok, antwoorden);
    const toelichting = toelichtingVoor(bouwblok);
    const scoreBadge =
      score !== null
        ? `<span class="score-badge" style="background:${scoreKleur(score)}">${score.toFixed(1)}</span>`
        : "";

    // Titel + score-badge rechtsboven, altijd — met of zonder rijke
    // toelichting (bouwstenen/AI-domeinen content). Zonder rijke content
    // (nog geen match in `lib/bouwblok-info.ts`, bijv. de Zorgscan, zie
    // v1-aanpassingen.md) valt dit terug op de kale bouwblok-naam plus
    // `Bouwblok.toelichting` als platte uitleg-alinea — geen "CENTRALE
    // VRAAG"-blok (dat bestaat alleen in de rijke content), maar wél de
    // uitleg zelf: Die ontbrak eerder helemaal in dit fallback-pad, terwijl
    // de toelichting-overlay in de doorloopflow (`components/BouwblokForm.tsx`)
    // daar al wel naar terugvalt. Geen los "bijlage"-kopje eronder (op
    // verzoek van Sander: dat was een dubbele titel).
    const uitlegHtml = toelichting
      ? `<div class="bouwsteen-uitleg">
          <div class="bouwsteen-kop">
            <div>
              <p class="eyebrow" style="color:${toelichting.accentColor}">${escapeHtml(toelichting.eyebrow)}</p>
              <h3 class="bouwsteen-titel">${escapeHtml(toelichting.titel)}</h3>
            </div>
            ${scoreBadge}
          </div>
          <div class="centrale-vraag-blok" style="border-color:${toelichting.accentColor}">
            <p class="centrale-vraag-label" style="color:${toelichting.accentColor}">CENTRALE VRAAG</p>
            <p class="centrale-vraag-tekst">${escapeHtml(toelichting.centraleVraag)}</p>
          </div>
          ${toelichting.beschrijving.map((t) => `<p>${escapeHtml(t)}</p>`).join("")}
        </div>`
      : `<div class="bouwsteen-uitleg">
          <div class="bouwsteen-kop">
            <h3 class="bouwsteen-titel">${escapeHtml(bouwblok.naam)}</h3>
            ${scoreBadge}
          </div>
          ${bouwblok.toelichting ? `<p>${escapeHtml(bouwblok.toelichting)}</p>` : ""}
        </div>`;

    const vraagRijen = bouwblok.vragen
      .map((vraag) => {
        const waarde = antwoorden[vraag.id];
        const heeftAntwoord = typeof waarde === "number";
        const antwoordKleur = heeftAntwoord ? ANTWOORD_KLEUR[waarde] : undefined;
        return `<tr>
          <td>${escapeHtml(vraag.tekst)}</td>
          <td class="cel-score"><span class="antwoord-badge"${antwoordKleur ? ` style="background:${antwoordKleur.bg};color:${antwoordKleur.text}"` : ""}>${heeftAntwoord ? waarde : "—"}</span></td>
          <td>${heeftAntwoord ? escapeHtml(labelVoorSchaal(assessment, waarde)) : "—"}</td>
        </tr>`;
      })
      .join("");
    const opmerking = opmerkingenPerBouwblok[bouwblok.id];

    return `<div class="bouwsteen-blok">
      ${uitlegHtml}
      <table class="vraag-tabel">
        <thead><tr><th>Vraag</th><th>Score</th><th>Antwoord</th></tr></thead>
        <tbody>${vraagRijen}</tbody>
      </table>
      ${opmerking ? `<p class="opmerking"><strong>Opmerking:</strong> ${escapeHtml(opmerking)}</p>` : ""}
    </div>`;
  });

  // 2 bouwstenen per pagina: elk paar krijgt een eigen pagina-vullende
  // flex-kolom (zelfde techniek als pagina 1), zodat de restruimte als
  // één ruime tussenruimte tussen de twee bouwstenen verschijnt in plaats
  // van als onbenutte witruimte onderaan de pagina te blijven staan.
  const bouwsteenParen: string[][] = [];
  for (let i = 0; i < bouwsteenBlokken.length; i += 2) {
    bouwsteenParen.push(bouwsteenBlokken.slice(i, i + 2));
  }
  // Scans met meer dan 4 vragen per bouwblok (AI-scan: 5 vragen en langere
  // uitleg) krijgen een compactere opmaak, zodat 2 per pagina ook daar past.
  const compact = alleBouwblokkenMetGroep(assessment).some(({ bouwblok }) => bouwblok.vragen.length > 4);
  const bouwblokkenHtml = bouwsteenParen
    .map(
      (paar) =>
        `<div class="bouwsteen-pagina${compact ? " compact" : ""}">${paar.join('<div class="streep"></div>')}</div>`
    )
    .join("");

  // --- Algemene duidingscontent (bijv. Visie/2030), als afsluitende sectie ---
  const algemeneSecties = slotsectie
    ? `<section class="pdf-sectie algemene-sectie${PAST_OP_1_PAGINA.includes(slotsectie.bron) ? " past-op-1-pagina" : ""}"><div class="kop-glow hero-sectie"><div class="kop-eyebrow">Coniche Scan</div><h1>${escapeHtml(HERO_TITEL[slotsectie.bron] ?? slotsectie.titel)}</h1>${HERO_SUBTITEL[slotsectie.bron] ? `<p class="hero-subtitel">${escapeHtml(HERO_SUBTITEL[slotsectie.bron]!)}</p>` : ""}</div>${contentVoorBron(slotsectie.bron)}</section>`
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(organisatieNaam)} – Resultaten</title>
<style>
  /* Footer via @page-marginboxen (i.p.v. Puppeteer's footerTemplate), omdat
     alleen zo het logo pas vanaf pagina 2 kan verschijnen (:first). */
  @page { size: A4; margin: 26mm 0 20mm;
    @bottom-left { content: "Pagina " counter(page) " / " counter(pages); font: 8px Arial, sans-serif; color: #888884; vertical-align: top; padding-top: 6mm; padding-left: 16mm; }
    @bottom-right { content: "${cssTekst(assessment.kortLabel ?? assessment.naam)}"; font: 700 8px Arial, sans-serif; color: #ff671f; vertical-align: top; padding-top: 6mm; padding-right: 42mm; background: url("${logoDataUri}") no-repeat right 16mm top 4mm / auto 9mm; }
  }
  @page algemene { margin-top: 0; }
  @page :first { margin-top: 0; @bottom-right { background: none; padding-right: 16mm; } }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #1c1c1a;
    font-size: 10.5pt;
    line-height: 1.55;
    margin: 0;
    padding: 0 16mm;
  }
  h1, h2, h3, h4 { font-weight: 800; color: #1c1c1a; margin: 0 0 0.4em; }
  h1 { font-size: 20pt; }
  h2 { font-size: 15pt; margin-top: 1.6em; border-top: 1px solid #e8e6e1; padding-top: 1em; }
  h3 { font-size: 12pt; margin-top: 1.2em; }
  p { margin: 0 0 0.8em; color: #4d4d49; }
  .eyebrow { font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; margin: 0 0 0.2em; }
  /* Pagina 1 (kop t/m legenda) vult de volledige beschikbare hoogte: een
     flex-kolom met justify-content 'space-between' verdeelt de 4 blokken
     evenredig over de pagina, in plaats van vaste margins die of te veel
     wit onderaan overlaten, of juist krap aanvoelen. */
  .pagina-1 { display: flex; flex-direction: column; justify-content: space-between; min-height: 271mm; }
  /* Oranje gloed achter de kop (zoals de hero op de webpagina's), volle paginabreedte; de eerste pagina heeft geen bovenmarge zodat de gloed tot de paginarand loopt. */
  .kop-glow { margin: 0 -16mm; padding: 17mm 16mm 8mm; background: linear-gradient(180deg, #fff2ec 0%, #ffffff 100%); }
  .kop-eyebrow { font-size: 8pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #ff671f; margin-bottom: 2px; }
  .kop { border-bottom: 3px solid #ff671f; padding-bottom: 10px; }
  .kop-boven { display: flex; align-items: center; justify-content: space-between; }
  .kop img { height: 32px; }
  .kop-tekst { text-align: right; }
  .kop-meta { color: #4d4d49; font-size: 10.5pt; font-weight: 700; margin-top: 4px; }
  .scores-blok { display: flex; flex-direction: column; gap: 20px; }
  .resultaten-header { text-align: center; }
  .classificatie-cirkel { width: 108px; height: 108px; border-radius: 50%; border: 7px solid var(--kleur); display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; }
  .classificatie-cirkel .score { font-size: 23pt; font-weight: 800; }
  .classificatie-cirkel .label { font-size: 8pt; font-weight: 700; color: var(--kleur); text-align: center; }
  .resultaten-header .naam { font-weight: 700; margin-top: 10px; font-size: 10.5pt; }
  .resultaten-header h2 { border: none; margin: 2px 0; padding: 0; font-size: 14pt; }
  .resultaten-header .voortgang { color: #888884; font-size: 9pt; }
  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
  .chart-blok h3 { text-align: center; margin-top: 0; margin-bottom: 0.5em; font-size: 11pt; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { text-align: left; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #888884; border-bottom: 1px solid #d4d1ca; padding: 6px 8px; }
  td { padding: 6px 8px; border-bottom: 1px solid #e8e6e1; font-size: 9.5pt; }
  .cel-score { text-align: right; width: 60px; }
  .score-badge { display: inline-block; min-width: 2em; text-align: center; color: #fff; font-weight: 800; border-radius: 4px; padding: 2px 8px; font-size: 9.5pt; }
  .score-badge.klein { margin-right: 8px; padding: 1px 6px; font-size: 8.5pt; }
  .top3-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .top3-grid h3 { margin-top: 0; font-size: 11pt; }
  .top3-lijst { list-style: none; padding: 0; margin: 0; }
  .top3-lijst li { display: flex; align-items: center; margin-bottom: 6px; font-size: 9.5pt; }
  h3.legenda-titel { margin-top: 0; margin-bottom: 0.6em; font-size: 11pt; }
  .legenda { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .legenda-item { display: flex; gap: 7px; align-items: flex-start; }
  .legenda-stippen { display: flex; gap: 3px; flex: none; margin-top: 3px; }
  .legenda-stip { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .legenda-label { font-weight: 700; margin: 0 0 0.2em; font-size: 9.5pt; }
  .legenda-item p { font-size: 8.3pt; line-height: 1.4; }
  .centrale-vraag { font-weight: 700; color: #1c1c1a; }
  .pdf-sectie { page-break-before: always; }
  /* Algemene duidingscontent (Visie/2030): verdicht zodat de Visie op 1 pagina past. */
  .algemene-sectie { font-size: 8.8pt; line-height: 1.4; }
  .algemene-sectie.past-op-1-pagina { page: algemene; }
  .hero-sectie { text-align: center; margin-bottom: 6mm; }
  .hero-sectie h1 { font-size: 20pt; margin: 2px 0 0; }
  .algemene-sectie h2 { margin-top: 0; padding-top: 0; border-top: none; font-size: 14pt; margin-bottom: 0.5em; }
  .algemene-sectie h3 { font-size: 10.5pt; margin-top: 0.9em; margin-bottom: 0.25em; }
  .algemene-sectie p { margin-bottom: 0.5em; }
  .algemene-sectie ul { margin-bottom: 0.5em; }
  .algemene-sectie li { margin-bottom: 0.15em; }
  /* 2 bouwstenen per pagina: elk paar krijgt een eigen pagina-vullende
     flex-kolom (zelfde techniek als pagina 1). De twee bouwstenen staan
     top-aligned direct onder elkaar met de streep ertussen op een vaste,
     kleine afstand (ca. 1 regel) — geen ruimteverdeling meer via
     margin: auto op de streep (die liet 'm voorheen in het midden van de
     vrije ruimte op de pagina zweven, met een veel grotere en per pagina
     wisselende afstand tot gevolg, op verzoek van Sander teruggedraaid).
     Onbenutte ruimte op een korter paar blijft nu gewoon onderaan de
     pagina staan. Elk bouwsteen-blok blijft ongesplitst
     (page-break-inside: avoid). */
  .bouwsteen-pagina { display: flex; flex-direction: column; min-height: 245mm; }
  .bouwsteen-pagina + .bouwsteen-pagina { page-break-before: always; }
  .bouwsteen-blok { page-break-inside: avoid; font-size: 8.3pt; line-height: 1.4; }
  .bouwsteen-blok:first-child { padding-bottom: 3mm; }
  .bouwsteen-blok:last-child { padding-bottom: 0; }
  .streep { height: 2px; background: #ff671f; margin: 0; flex: none; }
  .streep + .bouwsteen-blok { padding-top: 4mm; }
  .bouwsteen-blok p { margin-bottom: 0.5em; }
  .bouwsteen-pagina.compact .bouwsteen-blok { font-size: 8.2pt; line-height: 1.4; }
  .bouwsteen-pagina.compact .bouwsteen-blok:first-child { padding-bottom: 2mm; }
  .bouwsteen-pagina.compact .streep + .bouwsteen-blok { padding-top: 3mm; }
  .bouwsteen-pagina.compact .bouwsteen-blok p { margin-bottom: 0.4em; }
  .bouwsteen-pagina.compact .bouwsteen-uitleg { margin-bottom: 8px; }
  .bouwsteen-pagina.compact .centrale-vraag-blok { margin: 6px 0 8px; }
  .bouwsteen-pagina.compact table { margin: 6px 0; }
  .bouwsteen-pagina.compact td, .bouwsteen-pagina.compact th { padding-top: 2px; padding-bottom: 2px; }
  .bouwsteen-pagina.compact td { font-size: 7.8pt; }
  .bouwsteen-uitleg { page-break-inside: avoid; margin-bottom: 10px; }
  .bouwsteen-kop { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .bouwsteen-titel { margin-top: 0.1em; font-size: 10.5pt; }
  .centrale-vraag-blok { border-left: 3px solid; padding-left: 8px; margin: 8px 0 9px; }
  .centrale-vraag-label { font-size: 7pt; font-weight: 700; letter-spacing: 0.06em; margin: 0 0 0.15em; }
  .centrale-vraag-tekst { font-weight: 700; color: #1c1c1a; margin: 0; font-size: 8.7pt; }
  .bouwsteen-blok table { margin: 8px 0; }
  .bouwsteen-blok th { padding: 2px 5px; font-size: 7.3pt; }
  .bouwsteen-blok td { padding: 2px 5px; font-size: 7.8pt; }
  .vraag-tabel th:nth-child(2), .vraag-tabel td:nth-child(2) { text-align: center; width: 50px; }
  .antwoord-badge { display: inline-block; min-width: 1.6em; text-align: center; font-weight: 800; border-radius: 4px; padding: 1px 6px; }
  .opmerking { background: #faf9f7; border: 1px solid #e8e6e1; border-radius: 8px; padding: 6px 9px; margin: 5px 0 0; }
  /* 2030: opbouw en stijl van de webpagina (kaarten met nummercirkel, warme kenmerkenkaart). */
  .pdf-pagina { padding-top: 14mm; }
  .pdf-pagina + .pdf-pagina { page-break-before: always; }
  .hero-sectie + .pdf-pagina { padding-top: 0; }
  .algemene-sectie:has(.pdf-pagina) { font-size: 8.8pt; line-height: 1.45; }
  .pdf-pagina h2 { font-size: 15pt; margin: 1.5em 0 0.4em; }
  .pdf-pagina > h2:first-child { margin-top: 0; }
  .pdf-pagina p { margin-bottom: 0.6em; }
  .pdf-pagina ul { margin: 0 0 0.9em; padding-left: 18px; color: #4d4d49; }
  .pdf-pagina li { margin-bottom: 0.3em; }
  .kaarten { display: flex; flex-direction: column; gap: 8px; margin: 10px 0 12px; }
  .kaart { display: flex; gap: 12px; border: 1px solid #e8e6e1; border-radius: 10px; padding: 9px 14px; page-break-inside: avoid; }
  .kaart p { margin: 0.35em 0 0; }
  .kaart .kaart-titel { margin: 0; color: #1c1c1a; font-weight: 700; }
  .kaart-nummer { flex: none; width: 24px; height: 24px; border-radius: 50%; background: #fff2ec; color: #ff671f; font-weight: 800; font-size: 9pt; display: flex; align-items: center; justify-content: center; }
  .kenmerken-kaart { background: #faf9f7; border: 1px solid #e8e6e1; border-radius: 10px; padding: 14px 18px; margin: 20px 0 6px; page-break-inside: avoid; }
  .kenmerken-kaart h3 { margin-top: 0; font-size: 11.5pt; }
  .kenmerken-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 22px; margin-top: 10px; }
  .kenmerken-grid p { font-size: 8.6pt; line-height: 1.4; margin: 0; }
  .kenmerken-grid .kenmerk-titel { color: #1c1c1a; font-weight: 700; margin-bottom: 0.1em; }
  .hero-subtitel { max-width: 150mm; margin: 8px auto 0; font-size: 10.5pt; font-weight: 700; color: #1c1c1a; line-height: 1.45; }
  .vinkjes { list-style: none; padding: 0; margin: 10px 0 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 7px 22px; color: #1c1c1a; }
  .vinkjes li { display: flex; gap: 8px; align-items: flex-start; margin: 0; }
  .vink { flex: none; width: 15px; height: 15px; border-radius: 50%; background: #ff671f; color: #fff; font-size: 8pt; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
  .cyclus { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 14px 0 12px; }
  .cyclus-stap { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .cyclus-nummer { width: 30px; height: 30px; border-radius: 50%; background: #fff2ec; color: #ff671f; font-weight: 800; font-size: 11pt; display: flex; align-items: center; justify-content: center; }
  .cyclus-label { font-weight: 700; color: #1c1c1a; font-size: 8.8pt; }
  .cyclus-pijl { color: #ffd5c0; font-size: 15pt; margin-bottom: 16px; }
  /* Visie: dezelfde stijl, iets verdicht zodat alles op 1 pagina past. */
  .pdf-pagina.visie { font-size: 8.5pt; line-height: 1.42; }
  .pdf-pagina.visie h2 { font-size: 13pt; margin: 1.05em 0 0.3em; }
  .pdf-pagina.visie > h2:first-child { margin-top: 0; }
  .pdf-pagina.visie p { margin-bottom: 0.5em; }
  .pdf-pagina.visie .kenmerken-kaart { margin: 12px 0 4px; padding: 11px 16px; }
  .pdf-pagina.visie .vinkjes { margin: 8px 0 6px; gap: 5px 22px; }
  .pdf-pagina.visie .cyclus { margin: 9px 0 8px; }
  .content-groep { margin-bottom: 12px; }
  .content-item { margin-bottom: 10px; }
</style>
</head>
<body>
  <div class="pagina-1">
    <div class="kop-glow">
    <div class="kop">
      <div class="kop-boven">
        <img src="${logoDataUri}" alt="Coniche" />
        <div class="kop-tekst">
          <div class="kop-eyebrow">Coniche Scan</div>
        <h1>${escapeHtml(organisatieNaam)} – Resultaten</h1>
          <div class="kop-meta">${formatDatum(afgerondOp)} &nbsp;|&nbsp; ${escapeHtml(assessment.naam)} &nbsp;|&nbsp; ${escapeHtml(respondentNaam)}</div>
        </div>
      </div>
    </div>
    </div>

    <div class="scores-blok">
      <div class="resultaten-header">
        <div class="classificatie-cirkel" style="--kleur:${overallKleur}">
          <span class="score">${overall !== null ? overall.toFixed(1) : "—"}</span>
          <span class="label">${overallKlasse ? CLASSIFICATIE_INFO[overallKlasse].label : ""}</span>
        </div>
        <p class="naam">Resultaat voor ${escapeHtml(respondentNaam)}</p>
        <h2>${escapeHtml(assessment.naam)}</h2>
        <p class="voortgang">${beantwoord} van ${totaal} vragen beantwoord</p>
      </div>

      <div class="charts-grid">
        <div class="chart-blok"><h3>Alle ${escapeHtml(assessment.bouwblokEenheidMeervoud)}</h3>${radarSvg}</div>
        <div class="chart-blok"><h3>${
          isVlakkeAssessment(assessment)
            ? `Scores per ${escapeHtml(assessment.bouwblokEenheidEnkelvoud)}`
            : "Per categorie"
        }</h3>${barSvg}</div>
      </div>
    </div>

    <div class="top3-grid">
      ${top3Lijst("Top 3 Sterktes", sterktes)}
      ${top3Lijst("Top 3 Verbeterkansen", verbeterkansen)}
    </div>

    <div class="legenda-blok">
      <h3 class="legenda-titel">Legenda</h3>
      <div class="legenda">${legendaHtml}</div>
    </div>
  </div>

  <section class="pdf-sectie">
    ${bouwblokkenHtml}
  </section>

  ${algemeneSecties}
</body>
</html>`;
}
