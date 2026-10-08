import { Assessment, Benchmark, BenchmarkLid, BenchmarkNiveau, Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "./types";
import { alleVragen } from "./assessment-structuur";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  BouwblokResultaat,
  gemiddeldeAntwoordenVoorMeting,
  GroepResultaat,
  overallScore,
} from "./scoring";

/**
 * Berekeningen voor een benchmark (`benchmark.md`, Berekening). Pure functies zonder opslag. Alles wordt berekend en
 * nooit opgeslagen. De scores komen uit de gedeelde scorefunctie (`lib/scoring.ts`, `datamodel.md`, Scoreberekening),
 * dus er is geen tweede rekenmethode. Omdat die berekening lineair is, komt de score op de gemiddelde antwoorden uit op
 * hetzelfde als het gemiddelde van de scores van de organisaties.
 *
 * Elke organisatie telt per Assessment even zwaar mee, ongeacht het aantal respondenten.
 */

/** Het niveau van een benchmark: Ontbreekt het veld, dan is het een benchmark tussen organisaties (`datamodel.md`, deel 3). */
export function niveauVan(benchmark: Pick<Benchmark, "niveau">): BenchmarkNiveau {
  return benchmark.niveau ?? "organisaties";
}

/** Minimaal aantal leden per Assessment op niveau 2: Een benchmark binnen een organisatie heeft minstens twee Metingen (`benchmark.md`, Niveau 2). */
export const MIN_METINGEN_PER_ASSESSMENT = 2;

export function aantalAfgerond(meting: ScanUitvoering): number {
  return meting.invullingen.filter((i) => i.status === "afgerond").length;
}

/** Gemiddelde per vraag over een aantal antwoordensets. Een vraag zonder enig antwoord ontbreekt. */
export function middelAntwoorden(sets: Record<string, number>[], assessment: Assessment): Record<string, number> {
  const uit: Record<string, number> = {};
  for (const vraag of alleVragen(assessment)) {
    const waarden = sets.map((s) => s[vraag.id]).filter((w): w is number => typeof w === "number");
    if (waarden.length > 0) uit[vraag.id] = waarden.reduce((a, b) => a + b, 0) / waarden.length;
  }
  return uit;
}

/* ---------- Samenstellen ---------- */

export interface KandidaatMeting {
  meting: ScanUitvoering;
  aantalAfgerond: number;
}

export interface KandidaatOrganisatie {
  organisatie: Organisatie;
  /** Per gekozen Assessment waarvoor de organisatie een Meting met genoeg afgeronde scans heeft, meest recente eerst. */
  perAssessment: { assessmentId: string; metingen: KandidaatMeting[] }[];
}

/**
 * De organisaties in de keuzelijst bij het samenstellen (`benchmark.md`, Samenstellen, stap 2): Alleen met de vlag
 * `benchmarkToegestaan` en minstens één Meting van een gekozen Assessment met minimaal `minScans` afgeronde scans.
 */
export function kandidaatOrganisaties(
  organisaties: Organisatie[],
  assessmentIds: string[],
  minScans: number
): KandidaatOrganisatie[] {
  const uit: KandidaatOrganisatie[] = [];
  for (const organisatie of organisaties) {
    if (!organisatie.benchmarkToegestaan) continue;
    const perAssessment = assessmentIds
      .map((assessmentId) => ({
        assessmentId,
        metingen: organisatie.scanUitvoeringen
          .filter((m) => m.assessmentId === assessmentId && aantalAfgerond(m) >= minScans)
          .map((meting) => ({ meting, aantalAfgerond: aantalAfgerond(meting) }))
          .sort((a, b) => b.meting.aangemaaktOp.localeCompare(a.meting.aangemaaktOp)),
      }))
      .filter((p) => p.metingen.length > 0);
    if (perAssessment.length > 0) uit.push({ organisatie, perAssessment });
  }
  return uit.sort((a, b) => a.organisatie.naam.localeCompare(b.organisatie.naam, "nl"));
}

/**
 * Organisaties met de vlag die niet in de keuzelijst staan, met per gekozen Assessment de reden (`benchmark.md`, Samenstellen,
 * stap 2): Geen Meting van dat Assessment, of geen Meting met genoeg afgeronde scans. De lijst zelf blijft ongewijzigd:
 * Alleen een hulp, zodat een Admin ziet waarom een organisatie die meedoet toch ontbreekt.
 */
export function nietTeKiezenOrganisaties(
  organisaties: Organisatie[],
  assessments: { id: string; naam: string }[],
  assessmentIds: string[],
  minScans: number
): { organisatie: Organisatie; redenen: string[] }[] {
  const kiesbaar = new Set(kandidaatOrganisaties(organisaties, assessmentIds, minScans).map((k) => k.organisatie.id));
  const uit: { organisatie: Organisatie; redenen: string[] }[] = [];
  for (const organisatie of organisaties) {
    if (!organisatie.benchmarkToegestaan || kiesbaar.has(organisatie.id)) continue;
    const redenen = assessmentIds.map((assessmentId) => {
      const naam = assessments.find((a) => a.id === assessmentId)?.naam ?? "onbekend Assessment";
      const metingen = organisatie.scanUitvoeringen.filter((m) => m.assessmentId === assessmentId);
      if (metingen.length === 0) return `geen Meting van ${naam}`;
      const meeste = Math.max(...metingen.map(aantalAfgerond));
      return `${naam}: hoogstens ${meeste} afgeronde ${meeste === 1 ? "scan" : "scans"} in één Meting, minimaal ${minScans} nodig`;
    });
    uit.push({ organisatie, redenen });
  }
  return uit.sort((a, b) => a.organisatie.naam.localeCompare(b.organisatie.naam, "nl"));
}

/** Voorgekozen: De meest recente Meting met genoeg afgeronde scans (`benchmark.md`, Samenstellen, stap 3). */
export function standaardMetingId(metingen: KandidaatMeting[]): string | null {
  return metingen[0]?.meting.id ?? null;
}

/* ---------- Secties ---------- */

export interface BenchmarkRij {
  organisatie: Organisatie;
  meting: ScanUitvoering;
  aantalAfgerond: number;
  /** Gemiddelde per vraag over de afgeronde scans van de Meting. */
  antwoorden: Record<string, number>;
  overall: number | null;
}

export interface BenchmarkSectie {
  assessment: Assessment;
  /** De leden waarvan organisatie en Meting nog bestaan. */
  rijen: BenchmarkRij[];
  /** Organisaties in de benchmark zonder lid voor dit Assessment (alleen de Admin ziet dit). */
  ontbrekend: Organisatie[];
  /** "X van Y organisaties" (`benchmark.md`, Teller): X met een lid voor dit Assessment, Y alle organisaties in de benchmark. */
  teller: { x: number; y: number };
  /** Gemiddelde per vraag van de groep. */
  groepAntwoorden: Record<string, number>;
}

function bouwRij(lid: BenchmarkLid, assessment: Assessment, organisaties: Organisatie[]): BenchmarkRij | null {
  const organisatie = organisaties.find((o) => o.id === lid.organisatieId);
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === lid.metingId);
  if (!organisatie || !meting || meting.assessmentId !== assessment.id) return null;
  const antwoorden = gemiddeldeAntwoordenVoorMeting(assessment, meting.invullingen);
  return { organisatie, meting, aantalAfgerond: aantalAfgerond(meting), antwoorden, overall: overallScore(assessment, antwoorden) };
}

/** Eén sectie per gekozen Assessment, in de volgorde van de benchmark. Een Assessment dat niet meer bestaat valt weg. */
export function bouwBenchmarkSecties(
  benchmark: Benchmark,
  assessments: Assessment[],
  organisaties: Organisatie[]
): BenchmarkSectie[] {
  const organisatieIds = [...new Set(benchmark.leden.map((l) => l.organisatieId))].filter((id) =>
    organisaties.some((o) => o.id === id)
  );
  const alleOrganisaties = organisatieIds.map((id) => organisaties.find((o) => o.id === id)!);
  const secties: BenchmarkSectie[] = [];
  for (const assessmentId of benchmark.assessmentIds) {
    const assessment = assessments.find((a) => a.id === assessmentId);
    if (!assessment) continue;
    const binnenOrganisatie = niveauVan(benchmark) === "metingen";
    const rijen = benchmark.leden
      .filter((l) => l.assessmentId === assessmentId)
      .map((l) => bouwRij(l, assessment, organisaties))
      .filter((r): r is BenchmarkRij => r !== null)
      // Tussen organisaties op naam van de organisatie, binnen een organisatie op de Meting (de naam is het label).
      .sort((a, b) =>
        binnenOrganisatie
          ? a.meting.label.localeCompare(b.meting.label, "nl") || a.meting.aangemaaktOp.localeCompare(b.meting.aangemaaktOp)
          : a.organisatie.naam.localeCompare(b.organisatie.naam, "nl")
      );
    const metLid = new Set(rijen.map((r) => r.organisatie.id));
    secties.push({
      assessment,
      rijen,
      // Binnen een organisatie is er maar één organisatie en kiest de Admin de Metingen zelf: Geen ontbrekende en geen Y.
      ontbrekend: binnenOrganisatie ? [] : alleOrganisaties.filter((o) => !metLid.has(o.id)),
      teller: { x: rijen.length, y: binnenOrganisatie ? rijen.length : alleOrganisaties.length },
      groepAntwoorden: middelAntwoorden(
        rijen.map((r) => r.antwoorden),
        assessment
      ),
    });
  }
  return secties;
}

/* ---------- Resultaten uit antwoorden ---------- */

export interface BenchmarkResultaten {
  overall: number | null;
  bouwblokken: BouwblokResultaat[];
  groepen: GroepResultaat[];
}

/** De scores van een antwoordenset, via de gedeelde scorefunctie. */
export function resultatenVan(assessment: Assessment, antwoorden: Record<string, number>): BenchmarkResultaten {
  const bouwblokken = alleBouwblokResultaten(assessment, antwoorden);
  return {
    overall: overallScore(assessment, antwoorden),
    bouwblokken,
    groepen: alleGroepResultaten(assessment, bouwblokken, antwoorden),
  };
}

/* ---------- View per organisatie ---------- */

/**
 * Een lid naast de rest van de groep, zonder het lid zelf (`benchmark.md`, View per organisatie): Zou het lid meetellen, dan trekt
 * het het gemiddelde naar zichzelf toe en kan het bij een kleine groep de scores van de anderen terugrekenen. Hetzelfde
 * op alle niveaus: Een organisatie, een Meting of een scan.
 */
export interface VergelijkingsView {
  assessment: Assessment;
  /** Aantal leden in de rest van de groep, zonder het lid zelf. */
  aantalAnderen: number;
  /** Aantal leden in de groep voor dit Assessment, inclusief het lid zelf. */
  aantalInGroep: number;
  organisatie: BenchmarkResultaten;
  /** De rest van de groep, zonder het lid zelf. */
  rest: BenchmarkResultaten | null;
  /** Verschil per bouwblok (lid min rest), op volgnummer. */
  verschillen: { bouwblok: BouwblokResultaat["bouwblok"]; score: number | null; rest: number | null; verschil: number | null }[];
  /** De groep is groot genoeg (`benchmarkMinOrganisaties` op niveau 1, twee Metingen op niveau 2, `benchmarkMinScans` op niveau 3). */
  voldoetAanDrempel: boolean;
}

export interface OrganisatieView extends VergelijkingsView {
  rij: BenchmarkRij;
}

/** Het lid naast de rest, uit hun antwoorden. De gedeelde scorefunctie, dus geen tweede rekenmethode. */
function maakVergelijking(
  assessment: Assessment,
  eigen: Record<string, number>,
  anderen: Record<string, number>[],
  aantalInGroep: number,
  drempel: number
): VergelijkingsView {
  const organisatie = resultatenVan(assessment, eigen);
  const rest = anderen.length > 0 ? resultatenVan(assessment, middelAntwoorden(anderen, assessment)) : null;
  const verschillen = organisatie.bouwblokken.map((b, i) => {
    const restScore = rest?.bouwblokken[i]?.score ?? null;
    return {
      bouwblok: b.bouwblok,
      score: b.score,
      rest: restScore,
      verschil: b.score !== null && restScore !== null ? Number((b.score - restScore).toFixed(1)) : null,
    };
  });
  return {
    assessment,
    aantalAnderen: anderen.length,
    aantalInGroep,
    organisatie,
    rest,
    verschillen,
    voldoetAanDrempel: aantalInGroep >= drempel && anderen.length > 0,
  };
}

/** De view van één organisatie in één sectie: Haar Meting naast het gemiddelde van de rest van de groep. `null` als ze geen lid is. */
export function bouwOrganisatieView(
  sectie: BenchmarkSectie,
  organisatieId: string,
  minOrganisaties: number
): OrganisatieView | null {
  const rij = sectie.rijen.find((r) => r.organisatie.id === organisatieId);
  if (!rij) return null;
  const anderen = sectie.rijen.filter((r) => r.organisatie.id !== organisatieId);
  return {
    ...maakVergelijking(sectie.assessment, rij.antwoorden, anderen.map((r) => r.antwoorden), sectie.rijen.length, minOrganisaties),
    rij,
  };
}

/**
 * Niveau 2: De view van één Meting naast het gemiddelde van de overige Metingen, zonder die Meting zelf (`benchmark.md`,
 * Niveau 2). `minMetingen` is de drempel om de view aan een Lead te mogen toewijzen (`benchmarkMinMetingen`, inclusief de
 * Meting zelf).
 */
export function bouwMetingView(sectie: BenchmarkSectie, metingId: string, minMetingen: number = MIN_METINGEN_PER_ASSESSMENT): OrganisatieView | null {
  const rij = sectie.rijen.find((r) => r.meting.id === metingId);
  if (!rij) return null;
  const anderen = sectie.rijen.filter((r) => r.meting.id !== metingId);
  return {
    ...maakVergelijking(sectie.assessment, rij.antwoorden, anderen.map((r) => r.antwoorden), sectie.rijen.length, minMetingen),
    rij,
  };
}

/** De organisaties die in minstens één sectie een lid hebben, voor de lijst op de detailpagina. */
export function organisatiesInBenchmark(secties: BenchmarkSectie[]): Organisatie[] {
  const gezien = new Map<string, Organisatie>();
  for (const sectie of secties) {
    for (const r of sectie.rijen) gezien.set(r.organisatie.id, r.organisatie);
    for (const o of sectie.ontbrekend) gezien.set(o.id, o);
  }
  return [...gezien.values()].sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
}

/**
 * De secties die een Lead mag zien (`benchmark.md`, Toewijzen aan een Lead): Alleen voor Assessments waarvan hij de Meting
 * van zijn organisatie mag inzien (`leadMetingIds`) én waarvan de groep aan de drempel voldoet. Anders ziet hij een
 * vergelijking met resultaten die hij zelf niet mag openen, of met te weinig anderen om anoniem te blijven.
 */
export function viewsVoorLead(
  secties: BenchmarkSectie[],
  organisatieId: string,
  leadMetingIds: string[],
  minOrganisaties: number
): OrganisatieView[] {
  return secties
    .map((s) => bouwOrganisatieView(s, organisatieId, minOrganisaties))
    .filter((v): v is OrganisatieView => v !== null && v.voldoetAanDrempel && leadMetingIds.includes(v.rij.meting.id));
}

/** Namen voor het audit-log, zoals ze op dat moment zijn (`datamodel.md`, Audit, Benchmark). */
export function benchmarkNamen(
  assessmentIds: string[],
  leden: BenchmarkLid[],
  organisaties: Organisatie[],
  assessments: Assessment[],
  niveau: BenchmarkNiveau = "organisaties"
): { assessmentNamen: string[]; organisatieNamen: string[]; metingLabels?: string[] } {
  const namen = {
    assessmentNamen: assessmentIds.map((id) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend Assessment"),
    organisatieNamen: [...new Set(leden.map((l) => l.organisatieId))].map(
      (id) => organisaties.find((o) => o.id === id)?.naam ?? "Onbekende organisatie"
    ),
  };
  if (niveau === "organisaties") return namen;
  // Op de niveaus binnen een organisatie zijn de Metingen de leden: Hun labels zoals ze op dat moment waren.
  return {
    ...namen,
    metingLabels: leden.map(
      (l) => organisaties.find((o) => o.id === l.organisatieId)?.scanUitvoeringen.find((m) => m.id === l.metingId)?.label ?? "Onbekende Meting"
    ),
  };
}

/* ---------- Niveau 2: Binnen een organisatie ---------- */

/** De Metingen van één organisatie in één Assessment met genoeg afgeronde scans, meest recente eerst. Geen vlag nodig (`benchmark.md`, Niveau 2). */
export function kandidaatMetingen(organisatie: Organisatie, assessmentId: string, minScans: number): KandidaatMeting[] {
  return organisatie.scanUitvoeringen
    .filter((m) => m.assessmentId === assessmentId && aantalAfgerond(m) >= minScans)
    .map((meting) => ({ meting, aantalAfgerond: aantalAfgerond(meting) }))
    .sort((a, b) => b.meting.aangemaaktOp.localeCompare(a.meting.aangemaaktOp));
}

/**
 * De Assessments van een organisatie waarvoor ze genoeg Metingen heeft voor een benchmark binnen een organisatie: Minstens
 * twee Metingen met minimaal `minScans` afgeronde scans (`benchmark.md`, Niveau 2, Samenstellen).
 */
export function assessmentsVoorMetingenBenchmark(
  organisatie: Organisatie,
  minScans: number
): { assessmentId: string; metingen: KandidaatMeting[] }[] {
  const assessmentIds = [...new Set(organisatie.scanUitvoeringen.map((m) => m.assessmentId))];
  return assessmentIds
    .map((assessmentId) => ({ assessmentId, metingen: kandidaatMetingen(organisatie, assessmentId, minScans) }))
    .filter((p) => p.metingen.length >= MIN_METINGEN_PER_ASSESSMENT);
}

/** De organisaties in de keuzelijst van niveau 2: Minstens één Assessment met twee bruikbare Metingen. */
export function organisatiesVoorMetingenBenchmark(organisaties: Organisatie[], minScans: number): Organisatie[] {
  return organisaties
    .filter((o) => assessmentsVoorMetingenBenchmark(o, minScans).length > 0)
    .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
}

/* ---------- Niveau 3: Binnen een Meting ---------- */

/** De organisaties in de keuzelijst van niveau 3: Minstens één Meting met minimaal `minScans` afgeronde scans. */
export function organisatiesVoorScansBenchmark(organisaties: Organisatie[], minScans: number): Organisatie[] {
  return organisaties
    .filter((o) => o.scanUitvoeringen.some((m) => aantalAfgerond(m) >= minScans))
    .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
}

/** Eén afgeronde scan in een Meting, voor de Admin met de naam van de Respondent. */
export interface ScanRij {
  invulling: ScanInvulling;
  lid: OrganisatieLid;
  /** Naam van de Respondent, of het e-mailadres zolang de naam leeg is (zoals in de beheeroverzichten). */
  naam: string;
  antwoorden: Record<string, number>;
  overall: number | null;
}

export interface ScanSectie {
  assessment: Assessment;
  organisatie: Organisatie;
  meting: ScanUitvoering;
  /** De afgeronde scans in de Meting, op naam. */
  scans: ScanRij[];
}

/**
 * De sectie van een benchmark binnen een Meting (`benchmark.md`, Niveau 3): Eén lid, de Meting waarin de scans worden
 * vergeleken. `null` als de Meting, de organisatie of het Assessment niet meer bestaat. De scans zelf zijn geen leden: Ze volgen
 * uit de Meting.
 */
export function bouwScanSectie(benchmark: Benchmark, assessments: Assessment[], organisaties: Organisatie[]): ScanSectie | null {
  const lid = benchmark.leden[0];
  if (!lid) return null;
  const assessment = assessments.find((a) => a.id === lid.assessmentId);
  const organisatie = organisaties.find((o) => o.id === lid.organisatieId);
  const meting = organisatie?.scanUitvoeringen.find((m) => m.id === lid.metingId);
  if (!assessment || !organisatie || !meting || meting.assessmentId !== assessment.id) return null;
  const scans = meting.invullingen
    .filter((i) => i.status === "afgerond")
    .flatMap((invulling): ScanRij[] => {
      const respondent = organisatie.leden.find((l) => l.id === invulling.organisatieLidId);
      if (!respondent) return [];
      return [
        {
          invulling,
          lid: respondent,
          naam: respondent.naam || respondent.email,
          antwoorden: invulling.antwoorden,
          overall: overallScore(assessment, invulling.antwoorden),
        },
      ];
    })
    .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  return { assessment, organisatie, meting, scans };
}

/**
 * Niveau 3: Eén scan naast het gemiddelde van de andere afgeronde scans in dezelfde Meting, zonder de scan zelf. Elke scan telt
 * even zwaar mee. De ondergrens is `benchmarkMinScans`, inclusief de scan zelf (voorstel in `benchmark.md`, te bevestigen):
 * Bij weinig scans is de vergelijking te herleiden naar personen.
 */
export function bouwScanView(sectie: ScanSectie, invullingId: string, minScans: number): VergelijkingsView | null {
  const scan = sectie.scans.find((s) => s.invulling.id === invullingId);
  if (!scan) return null;
  const anderen = sectie.scans.filter((s) => s.invulling.id !== invullingId);
  return maakVergelijking(sectie.assessment, scan.antwoorden, anderen.map((s) => s.antwoorden), sectie.scans.length, minScans);
}

/* ---------- De view van een Lead, op alle niveaus ---------- */

/** De drempels per niveau (`beheerpagina.md`, punt 10, Instellingen). */
export interface BenchmarkDrempels {
  /** Niveau 1: `benchmarkMinOrganisaties`. */
  minOrganisaties: number;
  /** Niveau 2: `benchmarkMinMetingen`. */
  minMetingen: number;
  /** Niveau 3: `benchmarkMinRespondenten`. */
  minRespondenten: number;
}

/** De view zonder de rij met de organisatie en Meting erachter: Een Lead krijgt alleen het lid zelf en aggregaten. */
function zonderRij(view: OrganisatieView): VergelijkingsView {
  const { rij, ...schoon } = view;
  void rij;
  return schoon;
}

export interface LeadBenchmarkView {
  niveau: BenchmarkNiveau;
  /** De naam van het lid van de view, voor de Lead zelf: Zijn organisatie, zijn Meting of de Respondent van de scan. Nooit een ander lid. */
  eigenNaam: string;
  /** Het label van de Meting bij niveau 2 en 3. */
  metingLabel: string | null;
  views: VergelijkingsView[];
}

/**
 * Wat een Lead ziet van een toegewezen view (`benchmark.md`, Toewijzen aan een Lead op alle niveaus). Op elk niveau geldt: De
 * Lead mag de Meting van de view inzien (`leadMetingIds`) en de groep voldoet aan de drempel van dat niveau. Anders staat
 * er niets, ook geen kaart. Nooit de namen van andere leden: Alleen het lid zelf en aggregaten.
 */
export function leadViewVoorToewijzing(
  toewijzing: { organisatieId: string; metingId?: string; onderwerpRespondentId?: string },
  benchmark: Benchmark,
  assessments: Assessment[],
  organisaties: Organisatie[],
  leadMetingIds: string[],
  drempels: BenchmarkDrempels
): LeadBenchmarkView | null {
  const niveau = niveauVan(benchmark);
  if (niveau === "organisaties") {
    const organisatie = organisaties.find((o) => o.id === toewijzing.organisatieId);
    if (!organisatie) return null;
    const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
    const views = viewsVoorLead(secties, toewijzing.organisatieId, leadMetingIds, drempels.minOrganisaties);
    return { niveau, eigenNaam: organisatie.naam, metingLabel: null, views: views.map(zonderRij) };
  }
  if (!toewijzing.metingId || !leadMetingIds.includes(toewijzing.metingId)) return null;
  if (niveau === "metingen") {
    const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
    const sectie = secties.find((s) => s.rijen.some((r) => r.meting.id === toewijzing.metingId));
    const view = sectie ? bouwMetingView(sectie, toewijzing.metingId, drempels.minMetingen) : null;
    if (!sectie || !view) return null;
    const label = sectie.rijen.find((r) => r.meting.id === toewijzing.metingId)!.meting.label;
    return { niveau, eigenNaam: label, metingLabel: label, views: view.voldoetAanDrempel ? [zonderRij(view)] : [] };
  }
  const sectie = bouwScanSectie(benchmark, assessments, organisaties);
  if (!sectie || sectie.meting.id !== toewijzing.metingId) return null;
  const scan = sectie.scans.find((s) => s.lid.id === toewijzing.onderwerpRespondentId);
  const view = scan ? bouwScanView(sectie, scan.invulling.id, drempels.minRespondenten) : null;
  if (!scan || !view) return null;
  return { niveau, eigenNaam: scan.naam, metingLabel: sectie.meting.label, views: view.voldoetAanDrempel ? [view] : [] };
}

