import { Assessment, Benchmark, BenchmarkLid, Organisatie, ScanUitvoering } from "./types";
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
    const rijen = benchmark.leden
      .filter((l) => l.assessmentId === assessmentId)
      .map((l) => bouwRij(l, assessment, organisaties))
      .filter((r): r is BenchmarkRij => r !== null)
      .sort((a, b) => a.organisatie.naam.localeCompare(b.organisatie.naam, "nl"));
    const metLid = new Set(rijen.map((r) => r.organisatie.id));
    secties.push({
      assessment,
      rijen,
      ontbrekend: alleOrganisaties.filter((o) => !metLid.has(o.id)),
      teller: { x: rijen.length, y: alleOrganisaties.length },
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

export interface OrganisatieView {
  assessment: Assessment;
  rij: BenchmarkRij;
  /** Aantal organisaties in de rest van de groep, zonder de organisatie zelf. */
  aantalAnderen: number;
  /** Aantal organisaties in de groep voor dit Assessment, inclusief de organisatie zelf. */
  aantalInGroep: number;
  organisatie: BenchmarkResultaten;
  /** De rest van de groep, zonder de organisatie zelf: Anders trekt ze het gemiddelde naar zichzelf toe (`benchmark.md`). */
  rest: BenchmarkResultaten | null;
  /** Verschil per bouwblok (organisatie min rest), op volgnummer. */
  verschillen: { bouwblok: BouwblokResultaat["bouwblok"]; score: number | null; rest: number | null; verschil: number | null }[];
  /** De groep is groot genoeg voor een Lead (`benchmarkMinOrganisaties`, inclusief de organisatie zelf). */
  voldoetAanDrempel: boolean;
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
  const organisatie = resultatenVan(sectie.assessment, rij.antwoorden);
  const rest = anderen.length > 0 ? resultatenVan(sectie.assessment, middelAntwoorden(anderen.map((r) => r.antwoorden), sectie.assessment)) : null;
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
    assessment: sectie.assessment,
    rij,
    aantalAnderen: anderen.length,
    aantalInGroep: sectie.rijen.length,
    organisatie,
    rest,
    verschillen,
    voldoetAanDrempel: sectie.rijen.length >= minOrganisaties && anderen.length > 0,
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
  assessments: Assessment[]
): { assessmentNamen: string[]; organisatieNamen: string[] } {
  return {
    assessmentNamen: assessmentIds.map((id) => assessments.find((a) => a.id === id)?.naam ?? "Onbekend Assessment"),
    organisatieNamen: [...new Set(leden.map((l) => l.organisatieId))].map(
      (id) => organisaties.find((o) => o.id === id)?.naam ?? "Onbekende organisatie"
    ),
  };
}
