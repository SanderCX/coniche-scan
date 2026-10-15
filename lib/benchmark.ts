import { Assessment, Benchmark, BenchmarkLezing, BenchmarkLid, BenchmarkNiveau, Organisatie, OrganisatieLid, ScanInvulling, ScanUitvoering } from "./types";
import { alleVragen } from "./assessment-structuur";
import {
  aantalAfgerondInMeting,
  gemiddeldeAntwoordenVoorMetingMetSamenstelling,
  isSamengesteld,
  meetdatumVan,
  onderdeelVan,
  onderliggendeMetingen,
  vergelijkNieuwsteEerst,
  vergelijkOudsteEerst,
  voldoetAanMinScans,
} from "./metingen";
import { SpreidingWeergave, spreiding, tussenOrganisaties, TussenOrganisatiesWeergave } from "./visualisatie";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  BouwblokResultaat,
  GroepResultaat,
  numeriekeAntwoorden,
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
        // Een samengestelde Meting voldoet als elke onderliggende Meting aan `minScans` voldoet (`benchmark.md`).
        metingen: organisatie.scanUitvoeringen
          .filter((m) => m.assessmentId === assessmentId && voldoetAanMinScans(organisatie, m, minScans))
          .map((meting) => ({ meting, aantalAfgerond: aantalAfgerondInMeting(organisatie, meting) }))
          .sort((a, b) => vergelijkNieuwsteEerst(a.meting, b.meting)),
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
      const meeste = Math.max(...metingen.map((m) => aantalAfgerondInMeting(organisatie, m)));
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
  // Bij een samengestelde Meting het gemiddelde van de onderliggende Metingen, elke Meting even zwaar.
  const antwoorden = gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, meting);
  return {
    organisatie,
    meting,
    aantalAfgerond: aantalAfgerondInMeting(organisatie, meting),
    antwoorden,
    overall: overallScore(assessment, antwoorden),
  };
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
    const naastElkaar = binnenOrganisatie && lezingVan(benchmark, organisaties) === "naastElkaar";
    const rijen = benchmark.leden
      .filter((l) => l.assessmentId === assessmentId)
      .map((l) => bouwRij(l, assessment, organisaties))
      .filter((r): r is BenchmarkRij => r !== null)
      // Tussen organisaties op naam van de organisatie, binnen een organisatie bij Ontwikkeling over tijd op meetdatum met de
      // oudste eerst, bij dezelfde datum op de naam van de Meting, en bij Naast elkaar op de naam van de Meting
      // (`benchmark.md`, Niveau 2, Volgorde).
      .sort((a, b) =>
        naastElkaar
          ? a.meting.label.localeCompare(b.meting.label, "nl") || vergelijkOudsteEerst(a.meting, b.meting)
          : binnenOrganisatie
            ? vergelijkOudsteEerst(a.meting, b.meting)
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
  /**
   * Weergave D (`visualisatie-scores.md`): Per bouwblok de band van minimum tot maximum van de groep, de kwartielen en het
   * gemiddelde, zonder X. Alleen aggregaten: Geen antwoorden van andere leden en geen namen. `null` zonder andere leden.
   */
  groep: TussenOrganisatiesWeergave | null;
  /**
   * Weergave B op niveau 3: De scores van de scans in de Meting, met een ring op de scan van de view. Alleen bij een
   * scan-view (`bouwScanView`). De stippen hebben geen naam.
   */
  spreiding?: SpreidingWeergave;
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
    groep: anderen.length > 0 ? tussenOrganisaties(assessment, eigen, anderen) : null,
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
 * De secties die een Lead van niveau 1 mag zien (`benchmark.md`, View voor een Lead): Alleen de secties waarvan de groep aan de
 * drempel voldoet, anders ziet hij een vergelijking met te weinig anderen om anoniem te blijven. Of de Lead het vinkje voor deze
 * benchmark heeft, controleert de aanroeper: Van de Lead zelf speelt niets mee, niet zijn eigen scan en niet de Metingen waarvoor
 * hij Resultaten heeft.
 */
export function viewsVoorLead(secties: BenchmarkSectie[], organisatieId: string, minOrganisaties: number): OrganisatieView[] {
  return secties
    .map((s) => bouwOrganisatieView(s, organisatieId, minOrganisaties))
    .filter((v): v is OrganisatieView => v !== null && v.voldoetAanDrempel);
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

/**
 * De Metingen van één organisatie in één Assessment die op niveau 2 kunnen meedoen, met per Meting de reden als ze niet kan
 * (`benchmark.md`, Niveau 2, Welke Metingen): Een meetdatum is nodig en minimaal `minScans` afgeronde scans, een samengestelde
 * Meting voldoet als haar onderliggende Metingen voldoen. Het onderdeel mag verschillen. Geen vlag nodig: De gegevens verlaten
 * de organisatie niet. Nieuwste eerst.
 */
export function metingenVoorVergelijking(
  organisatie: Organisatie,
  assessmentId: string,
  minScans: number
): (KandidaatMeting & { reden: string | null })[] {
  return organisatie.scanUitvoeringen
    .filter((m) => m.assessmentId === assessmentId)
    .sort(vergelijkNieuwsteEerst)
    .map((meting) => ({
      meting,
      aantalAfgerond: aantalAfgerondInMeting(organisatie, meting),
      reden: !meetdatumVan(meting)
        ? "Vul eerst de meetdatum in"
        : !voldoetAanMinScans(organisatie, meting, minScans)
          ? `Minder dan ${minScans} afgeronde scans`
          : null,
    }));
}

/** De Metingen van één organisatie in één Assessment die op niveau 3 meedoen: Geen samengestelde Meting, meest recente eerst. */
export function kandidaatMetingen(organisatie: Organisatie, assessmentId: string, minScans: number): KandidaatMeting[] {
  // Een samengestelde Meting heeft geen scans en dus geen spreiding binnen de Meting (`benchmark.md`, Niveau 3).
  return organisatie.scanUitvoeringen
    .filter((m) => !isSamengesteld(m) && m.assessmentId === assessmentId && aantalAfgerond(m) >= minScans)
    .sort(vergelijkNieuwsteEerst)
    .map((meting) => ({ meting, aantalAfgerond: aantalAfgerond(meting) }));
}

/**
 * De Assessments van een organisatie waarvoor ze genoeg Metingen heeft voor een vergelijking tussen Metingen: Minstens
 * twee bruikbare Metingen (`benchmark.md`, Niveau 2, Samenstellen).
 */
export function assessmentsVoorMetingenBenchmark(
  organisatie: Organisatie,
  minScans: number
): { assessmentId: string; metingen: KandidaatMeting[] }[] {
  const assessmentIds = [...new Set(organisatie.scanUitvoeringen.map((m) => m.assessmentId))];
  return assessmentIds
    .map((assessmentId) => ({
      assessmentId,
      metingen: metingenVoorVergelijking(organisatie, assessmentId, minScans)
        .filter((m) => m.reden === null)
        .map(({ meting, aantalAfgerond }) => ({ meting, aantalAfgerond })),
    }))
    .filter((p) => p.metingen.length >= MIN_METINGEN_PER_ASSESSMENT);
}

/** De organisaties in de keuzelijst van niveau 2: Minstens één Assessment met twee bruikbare Metingen. */
export function organisatiesVoorMetingenBenchmark(organisaties: Organisatie[], minScans: number): Organisatie[] {
  return organisaties
    .filter((o) => assessmentsVoorMetingenBenchmark(o, minScans).length > 0)
    .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
}

/**
 * Doen een samengestelde Meting en een van haar onderliggende Metingen allebei mee? Dan tellen dezelfde scans twee keer mee in
 * de vergelijking en staat er bij het opslaan een waarschuwing (`benchmark.md`, Niveau 2, Welke Metingen).
 */
export function dubbelTellendeMetingen(organisatie: Pick<Organisatie, "scanUitvoeringen">, metingIds: string[]): ScanUitvoering[] {
  const gekozen = new Set(metingIds);
  return organisatie.scanUitvoeringen.filter(
    (m) => gekozen.has(m.id) && isSamengesteld(m) && onderliggendeMetingen(organisatie, m).some((o) => gekozen.has(o.id))
  );
}

/** Een Meting in de vergelijking: Haar eigen scores, nooit een groepsgemiddelde (`benchmark.md`, Niveau 2, Berekening). */
export interface VergelijkingsMeting {
  organisatie: Organisatie;
  meting: ScanUitvoering;
  aantalAfgerond: number;
  antwoorden: Record<string, number>;
  overall: number | null;
}

/**
 * Eén Assessment van een vergelijking tussen Metingen: De Metingen op meetdatum, de oudste eerst. Bij precies twee Metingen
 * is dat weergave C met de kolom Verschil in weergave E. Elke Meting telt even zwaar mee.
 */
export interface MetingenVergelijking {
  assessment: Assessment;
  /** De lezing van de benchmark: Bepaalt de volgorde, de weergave (C of H) en de kolom rechts in de matrix. */
  lezing: BenchmarkLezing;
  metingen: VergelijkingsMeting[];
}

/**
 * De vergelijkingen van een benchmark binnen een organisatie, per Assessment (`benchmark.md`, Niveau 2). `alleenMetingIds`
 * beperkt de Metingen: Een Lead ziet alleen de Metingen waarvoor hij Resultaten heeft, en een sectie met minder dan twee
 * Metingen valt dan weg, want er is niets te vergelijken.
 */
export function bouwMetingenVergelijkingen(
  benchmark: Benchmark,
  assessments: Assessment[],
  organisaties: Organisatie[],
  opties: { alleenMetingIds?: string[] } = {}
): MetingenVergelijking[] {
  return bouwBenchmarkSecties(benchmark, assessments, organisaties)
    .map((sectie) => ({
      assessment: sectie.assessment,
      lezing: lezingVan(benchmark, organisaties),
      metingen: sectie.rijen
        .filter((r) => !opties.alleenMetingIds || opties.alleenMetingIds.includes(r.meting.id))
        .map((r) => ({ organisatie: r.organisatie, meting: r.meting, aantalAfgerond: r.aantalAfgerond, antwoorden: r.antwoorden, overall: r.overall })),
    }))
    .filter((v) => !opties.alleenMetingIds || v.metingen.length >= MIN_METINGEN_PER_ASSESSMENT);
}

/** De korte naam van een lezing, voor in een keuzelijst en een lijst (`benchmark.md`, Niveau 2, Lezing). */
export const LEZING_NAAM: Record<BenchmarkLezing, string> = {
  ontwikkeling: "ontwikkeling",
  "naastElkaar": "naast elkaar",
};

/** De titel van de keuze in de schakelaar "Lees als" en de uitleg eronder (`beheerpagina.md`, punt 14). */
export const LEZING_KEUZE: Record<BenchmarkLezing, { titel: string; uitleg: string }> = {
  ontwikkeling: {
    titel: "Ontwikkeling over tijd",
    uitleg: "Dezelfde Meting op twee momenten. Het onderdeel is gelijk en de meetdatum verschilt.",
  },
  "naastElkaar": {
    titel: "Naast elkaar",
    uitleg: "Twee onderdelen of samenstellingen op een vergelijkbaar meetmoment.",
  },
};

/**
 * Het voorstel van de app voor de lezing bij een selectie (`benchmark.md`, Niveau 2, Voorstel van de app): Metingen met hetzelfde
 * onderdeel en verschillende meetdata zijn een ontwikkeling, in elk ander geval staan ze naast elkaar.
 */
export function voorstelLezing(metingen: Pick<ScanUitvoering, "onderdeel" | "meetdatum">[]): BenchmarkLezing {
  if (metingen.length < 2) return "naastElkaar";
  const zelfdeOnderdeel = new Set(metingen.map(onderdeelVan)).size === 1;
  const datums = metingen.map(meetdatumVan);
  const verschillendeDatums = datums.every((d) => d !== null) && new Set(datums).size === datums.length;
  return zelfdeOnderdeel && verschillendeDatums ? "ontwikkeling" : "naastElkaar";
}

/**
 * De lezing van een benchmark binnen een organisatie. Staat `lezing` er niet op (een benchmark van vóór de lezing), dan volgt ze
 * uit de leden volgens het voorstel van de app. Een Meting die niet meer bestaat telt niet mee.
 */
export function lezingVan(benchmark: Pick<Benchmark, "lezing" | "leden">, organisaties: Pick<Organisatie, "id" | "scanUitvoeringen">[]): BenchmarkLezing {
  if (benchmark.lezing === "ontwikkeling" || benchmark.lezing === "naastElkaar") return benchmark.lezing;
  const metingen = benchmark.leden
    .map((l) => organisaties.find((o) => o.id === l.organisatieId)?.scanUitvoeringen.find((m) => m.id === l.metingId))
    .filter((m): m is ScanUitvoering => m !== undefined);
  return voorstelLezing(metingen);
}

/**
 * Welke Metingen kunnen bij de gekozen Metingen bij de lezing Ontwikkeling over tijd (`benchmark.md`, Niveau 2, Lezing): Alleen
 * Metingen met hetzelfde onderdeel als de eerst gekozen Meting. Geeft per Meting de reden als het niet kan, anders `null`.
 * Zonder keuze kan elke Meting.
 */
export function redenOntwikkeling(
  meting: Pick<ScanUitvoering, "onderdeel">,
  gekozen: Pick<ScanUitvoering, "onderdeel">[]
): string | null {
  if (gekozen.length === 0) return null;
  const onderdeel = onderdeelVan(gekozen[0]);
  return onderdeelVan(meting) === onderdeel ? null : `Ander onderdeel dan ${onderdeel}`;
}

/** Hebben twee of meer gekozen Metingen dezelfde meetdatum? Dan is er bij Ontwikkeling over tijd geen volgorde: Opslaan kan niet. */
export function gelijkeMeetdata(metingen: Pick<ScanUitvoering, "meetdatum">[]): boolean {
  const datums = metingen.map(meetdatumVan).filter((d): d is string => d !== null);
  return new Set(datums).size !== datums.length;
}

/** Het aantal dagen tussen de oudste en de nieuwste meetdatum van de Metingen, of `null` als er minder dan twee een datum hebben. */
export function dagenTussenMeetdata(metingen: Pick<ScanUitvoering, "meetdatum">[]): number | null {
  const datums = metingen.map(meetdatumVan).filter((d): d is string => d !== null).sort();
  if (datums.length < 2) return null;
  const dag = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
  return Math.round((dag(datums[datums.length - 1]) - dag(datums[0])) / 86_400_000);
}

/* ---------- Niveau 3: Binnen een Meting ---------- */

/** De organisaties in de keuzelijst van niveau 3: Minstens één Meting met minimaal `minScans` afgeronde scans. */
export function organisatiesVoorScansBenchmark(organisaties: Organisatie[], minScans: number): Organisatie[] {
  return organisaties
    .filter((o) => o.scanUitvoeringen.some((m) => !isSamengesteld(m) && aantalAfgerond(m) >= minScans))
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
          antwoorden: numeriekeAntwoorden(invulling.antwoorden),
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
  return {
    ...maakVergelijking(sectie.assessment, scan.antwoorden, anderen.map((s) => s.antwoorden), sectie.scans.length, minScans),
    spreiding: spreiding(sectie.assessment, sectie.scans.map((s) => s.invulling), invullingId),
  };
}

/* ---------- De view van een Lead, op alle niveaus ---------- */

/** De drempels per niveau (`beheerpagina.md`, punt 10, Instellingen). */
export interface BenchmarkDrempels {
  /** Niveau 1: `benchmarkMinOrganisaties`. */
  minOrganisaties: number;
  /** Niveau 3: `benchmarkMinRespondenten`. Niveau 2 heeft geen eigen drempel: Het minimum is twee Metingen. */
  minRespondenten: number;
}

/** De view zonder de rij met de organisatie en Meting erachter: Een Lead krijgt alleen het lid zelf en aggregaten. */
function zonderRij(view: OrganisatieView): VergelijkingsView {
  const { rij, ...schoon } = view;
  void rij;
  return schoon;
}

export type LeadBenchmarkView =
  | {
      niveau: "organisaties";
      /** De naam van het lid van de view, voor de Lead zelf: Zijn organisatie. Nooit een ander lid. */
      eigenNaam: string;
      views: VergelijkingsView[];
    }
  | {
      niveau: "metingen";
      /** Per Assessment de vergelijking van de lid-Metingen waarvoor de Lead Resultaten heeft. */
      vergelijkingen: MetingenVergelijking[];
    };

/**
 * Wat een Lead ziet van een benchmark waarvoor hij het vinkje heeft (`benchmark.md`, View voor een Lead). Niveau 1: De view van
 * zijn organisatie tegenover de rest van de groep, per Assessment waarvan de groep aan de drempel voldoet. Niveau 2: De
 * vergelijking met de Metingen die lid zijn van de benchmark en waarvoor hij Resultaten heeft (`resultatenMetingIds`), en niet
 * meer dan dat: Heeft hij Resultaten op minder dan twee van de leden, dan is er niets te vergelijken. Niveau 3 heeft geen view
 * voor een Lead. Nooit de namen van andere leden. Zonder zichtbare sectie is de lijst leeg en staat er niets, ook geen kaart.
 */
export function leadViewsVoorBenchmark(
  benchmark: Benchmark,
  assessments: Assessment[],
  organisaties: Organisatie[],
  organisatie: Organisatie,
  resultatenMetingIds: string[],
  drempels: BenchmarkDrempels
): LeadBenchmarkView[] {
  const niveau = niveauVan(benchmark);
  if (niveau === "scans") return [];
  if (!benchmark.leden.some((l) => l.organisatieId === organisatie.id)) return [];
  if (niveau === "organisaties") {
    const secties = bouwBenchmarkSecties(benchmark, assessments, organisaties);
    const views = viewsVoorLead(secties, organisatie.id, drempels.minOrganisaties);
    return views.length === 0 ? [] : [{ niveau, eigenNaam: organisatie.naam, views: views.map(zonderRij) }];
  }
  const vergelijkingen = bouwMetingenVergelijkingen(benchmark, assessments, organisaties, { alleenMetingIds: resultatenMetingIds });
  return vergelijkingen.length === 0 ? [] : [{ niveau, vergelijkingen }];
}
