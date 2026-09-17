import { Assessment, Bouwblok, Classificatie, Respondent } from "./types";
import { alleBouwblokkenMetGroep, alleVragen } from "./assessment-structuur";

function round1(n: number): number {
  return Number(n.toFixed(1));
}

function gemiddelde(waarden: number[]): number | null {
  if (waarden.length === 0) return null;
  return round1(waarden.reduce((a, b) => a + b, 0) / waarden.length);
}

/** Bouwblokscore = gemiddelde van de scores op de vragen binnen dat bouwblok. */
export function bouwblokScore(
  bouwblok: Bouwblok,
  antwoorden: Record<string, number>
): number | null {
  const scores = bouwblok.vragen
    .map((v) => antwoorden[v.id])
    .filter((s): s is number => typeof s === "number");
  return gemiddelde(scores);
}

/** Groepscore = gemiddelde van de bouwblokscores binnen die groep (categorie of, bij een platte assessment, het bouwblok zelf). */
export function categorieScore(bouwblokScores: (number | null)[]): number | null {
  return gemiddelde(bouwblokScores.filter((s): s is number => s !== null));
}

/**
 * Overall score = gemiddelde van ALLE bouwblokscores samen, niet het
 * gemiddelde van de groepscores (groepen hebben ongelijk veel bouwblokken,
 * dus zouden anders niet evenredig meewegen).
 */
export function overallScore(alleBouwblokScores: (number | null)[]): number | null {
  return gemiddelde(alleBouwblokScores.filter((s): s is number => s !== null));
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
  const vragen = alleVragen(assessment);
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
    score: bouwblokScore(bouwblok, antwoorden),
  }));
}

export interface GroepResultaat {
  groepId: string;
  groepNaam: string;
  kleur: string | null;
  score: number | null;
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
  bouwblokResultaten: BouwblokResultaat[]
): GroepResultaat[] {
  const isVlak = assessment.categorieen === null || assessment.categorieen.length === 0;

  let resultaten: GroepResultaat[];
  if (isVlak) {
    resultaten = bouwblokResultaten.map((r) => ({
      groepId: r.bouwblok.id,
      groepNaam: r.bouwblok.naam,
      kleur: null,
      score: r.score,
    }));
  } else {
    resultaten = assessment.categorieen!.map((categorie) => {
      const scores = bouwblokResultaten
        .filter((r) => r.groepId === categorie.id)
        .map((r) => r.score);
      return {
        groepId: categorie.id,
        groepNaam: categorie.naam,
        kleur: categorie.kleur,
        score: categorieScore(scores),
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

export function isVolledigIngevuld(respondent: Respondent, assessment: Assessment): boolean {
  const v = voortgang(assessment, respondent.antwoorden);
  return v.beantwoord === v.totaal;
}
