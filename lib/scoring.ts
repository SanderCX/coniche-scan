import { Assessment, Bouwblok, Classificatie, ScanInvulling } from "./types";
import { alleBouwblokkenMetGroep, alleVragen, actieveVragen, isVlakkeAssessment } from "./assessment-structuur";

function round1(n: number): number {
  return Number(n.toFixed(1));
}

/** Gewicht van een bouwblok: standaard 1, een ongeldige waarde telt als 1 (`datamodel.md`, Bouwblok.gewicht). */
export function gewichtVan(bouwblok: Bouwblok): number {
  return typeof bouwblok.gewicht === "number" && bouwblok.gewicht > 0 ? bouwblok.gewicht : 1;
}

function beantwoordeScores(bouwblok: Bouwblok, antwoorden: Record<string, number>): number[] {
  return bouwblok.vragen
    .map((v) => antwoorden[v.id])
    .filter((s): s is number => typeof s === "number");
}

/** Bouwblokscore zonder afronding. Alleen voor verdere berekening; getoond wordt `bouwblokScore`. */
function bouwblokScoreRuw(bouwblok: Bouwblok, antwoorden: Record<string, number>): number | null {
  const scores = beantwoordeScores(bouwblok, antwoorden);
  return scores.length === 0 ? null : scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** Bouwblokscore = gemiddelde van de scores op de vragen binnen dat bouwblok. Ongewogen. */
export function bouwblokScore(
  bouwblok: Bouwblok,
  antwoorden: Record<string, number>
): number | null {
  const ruw = bouwblokScoreRuw(bouwblok, antwoorden);
  return ruw === null ? null : round1(ruw);
}

/**
 * Groepscore (categorie of, bij een platte assessment, het bouwblok zelf) =
 * gewogen gemiddelde van de bouwblokscores: `Σ(g × score) / Σ g`
 * (`datamodel.md`, Scoreberekening). Bouwblokken zonder antwoorden doen niet mee.
 */
export function categorieScore(
  bouwblokken: { bouwblok: Bouwblok }[],
  antwoorden: Record<string, number>
): number | null {
  let som = 0;
  let gewichten = 0;
  for (const { bouwblok } of bouwblokken) {
    const score = bouwblokScoreRuw(bouwblok, antwoorden);
    if (score === null) continue;
    const g = gewichtVan(bouwblok);
    som += g * score;
    gewichten += g;
  }
  return gewichten === 0 ? null : round1(som / gewichten);
}

/**
 * Overall = `Σ(g × som antwoorden per blok) / Σ(g × aantal beantwoorde vragen
 * per blok)`, uit de ruwe antwoorden en niet uit afgeronde bouwblokscores of
 * categoriescores (`datamodel.md`, Scoreberekening). Bij een afgeronde scan is
 * het aantal beantwoorde vragen gelijk aan het aantal vragen in het blok.
 */
export function overallScoreRuw(assessment: Assessment, antwoorden: Record<string, number>): number | null {
  let teller = 0;
  let noemer = 0;
  for (const { bouwblok } of alleBouwblokkenMetGroep(assessment)) {
    const scores = beantwoordeScores(bouwblok, antwoorden);
    const g = gewichtVan(bouwblok);
    teller += g * scores.reduce((a, b) => a + b, 0);
    noemer += g * scores.length;
  }
  return noemer === 0 ? null : teller / noemer;
}

export function overallScore(assessment: Assessment, antwoorden: Record<string, number>): number | null {
  const ruw = overallScoreRuw(assessment, antwoorden);
  return ruw === null ? null : round1(ruw);
}

/** Bevestigd (zie CLAUDE.md sectie 3, geverifieerd met twee losse datasets). */
export function classificatie(score: number): Classificatie {
  if (score < 2.5) return "rood";
  if (score < 3.5) return "oranje";
  return "groen";
}

export function voortgang(assessment: Assessment, antwoorden: Record<string, number>): {
  beantwoord: number;
  totaal: number;
  percentage: number;
} {
  // Gearchiveerde vragen tellen hier niet mee (lib/assessment-structuur.ts,
  // `actieveVragen`): een lopende invulling moet ze niet meer hoeven
  // beantwoorden om op 100% te komen.
  const vragen = actieveVragen(assessment);
  const beantwoord = vragen.filter((v) => typeof antwoorden[v.id] === "number").length;
  const totaal = vragen.length;
  return {
    beantwoord,
    totaal,
    percentage: totaal === 0 ? 0 : Math.round((beantwoord / totaal) * 100),
  };
}

export interface BouwblokResultaat {
  bouwblok: Bouwblok;
  /** Gewicht van het bouwblok (1 = normaal, wordt dan nergens getoond). */
  gewicht: number;
  groepId: string;
  groepNaam: string | null;
  score: number | null;
}

export function alleBouwblokResultaten(
  assessment: Assessment,
  antwoorden: Record<string, number>
): BouwblokResultaat[] {
  return alleBouwblokkenMetGroep(assessment).map(({ bouwblok, groepId, groepNaam }) => ({
    bouwblok,
    groepId,
    groepNaam,
    gewicht: gewichtVan(bouwblok),
    score: bouwblokScore(bouwblok, antwoorden),
  }));
}

export interface GroepResultaat {
  groepId: string;
  groepNaam: string;
  kleur: string | null;
  score: number | null;
  /** Alleen bij een platte assessment (de groep is het bouwblok): het gewicht, voor de factor bij de naam. */
  gewicht?: number;
}

/**
 * Voor een assessment met categorieën: één resultaat per categorie
 * (gemiddelde van de bouwblokscores erbinnen). Voor een platte assessment
 * (geen categorieën, zoals de AI-Volwassenheidsscan): elk bouwblok is zijn
 * eigen "groep", dus dit levert dezelfde granulariteit als de bouwblok-
 * resultaten. Sortering op waarde volgt `scoresPerGroepGesorteerd`.
 */
export function alleGroepResultaten(
  assessment: Assessment,
  bouwblokResultaten: BouwblokResultaat[],
  antwoorden: Record<string, number>
): GroepResultaat[] {
  const isVlak = isVlakkeAssessment(assessment);

  let resultaten: GroepResultaat[];
  if (isVlak) {
    resultaten = bouwblokResultaten.map((r) => ({
      groepId: r.bouwblok.id,
      groepNaam: r.bouwblok.naam,
      kleur: null,
      score: r.score,
      gewicht: r.gewicht,
    }));
  } else {
    resultaten = assessment.categorieen!.map((categorie) => {
      const bouwblokken = bouwblokResultaten.filter((r) => r.groepId === categorie.id);
      return {
        groepId: categorie.id,
        groepNaam: categorie.naam,
        kleur: categorie.kleur,
        score: categorieScore(bouwblokken, antwoorden),
      };
    });
  }

  if (assessment.scoresPerGroepGesorteerd) {
    resultaten = [...resultaten].sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
  }
  return resultaten;
}

export function bouwblokStatus(
  bouwblok: Bouwblok,
  antwoorden: Record<string, number>
): { status: "nog-niet-begonnen" | "bezig" | "afgerond"; beantwoord: number; totaal: number } {
  const beantwoord = bouwblok.vragen.filter((v) => typeof antwoorden[v.id] === "number").length;
  const totaal = bouwblok.vragen.length;
  const status =
    beantwoord === 0 ? "nog-niet-begonnen" : beantwoord === totaal ? "afgerond" : "bezig";
  return { status, beantwoord, totaal };
}

/** Top 3 sterktes (hoogste scores) en Top 3 verbeterkansen (laagste scores). */
export function topSterktesEnVerbeterkansen(bouwblokResultaten: BouwblokResultaat[]) {
  const metScore = bouwblokResultaten.filter(
    (r): r is BouwblokResultaat & { score: number } => r.score !== null
  );
  const gesorteerd = [...metScore].sort((a, b) => b.score - a.score);
  return {
    sterktes: gesorteerd.slice(0, 3),
    verbeterkansen: [...gesorteerd].reverse().slice(0, 3),
  };
}

export function isVolledigIngevuld(
  antwoorden: Record<string, number>,
  assessment: Assessment
): boolean {
  const v = voortgang(assessment, antwoorden);
  return v.beantwoord === v.totaal;
}

/**
 * Gemiddelde per vraag over alle afgeronde invullingen van één Meting
 * (`datamodel.md`, Scoreberekening: één gedeelde functie, geen losse
 * herimplementatie per plek). Gebruikt door zowel de beheer-Rapportage
 * (`/beheer/rapportage/[scanUitvoeringId]`) als de Lead-resultatenpagina
 * (`/s/[code]/resultaten/[scanUitvoeringId]`, beheerpagina.md punt 6a) —
 * dezelfde uitkomst, ongeacht wie er kijkt.
 */
export function gemiddeldeAntwoordenVoorMeting(
  assessment: Assessment,
  invullingen: ScanInvulling[]
): Record<string, number> {
  const afgerond = invullingen.filter((i) => i.status === "afgerond");
  const gemiddeldeAntwoorden: Record<string, number> = {};
  for (const vraag of alleVragen(assessment)) {
    const waarden = afgerond
      .map((i) => i.antwoorden[vraag.id])
      .filter((w): w is number => typeof w === "number");
    if (waarden.length > 0) {
      gemiddeldeAntwoorden[vraag.id] = waarden.reduce((a, b) => a + b, 0) / waarden.length;
    }
  }
  return gemiddeldeAntwoorden;
}
