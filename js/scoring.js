// Scoringslogica — CLAUDE.md sectie 3. Werkt op een bouwblokScores-map
// ({ [bouwblokId]: number }) zodat zowel echte respondent-antwoorden als de
// vaste preview-mockdata (previewData.js) dezelfde functies kunnen gebruiken.
import { alleBouwblokken, totaalAantalVragen } from "./data/assessments.js";

function round1(n) {
  return Number(n.toFixed(1));
}

export function computeBouwblokScores(assessment, antwoorden) {
  const scores = {};
  for (const bouwblok of alleBouwblokken(assessment)) {
    const waarden = bouwblok.vragen
      .map((v) => antwoorden[v.id])
      .filter((v) => typeof v === "number");
    if (waarden.length === bouwblok.vragen.length && waarden.length > 0) {
      scores[bouwblok.id] = round1(waarden.reduce((a, b) => a + b, 0) / waarden.length);
    }
  }
  return scores;
}

export function categorieScores(assessment, bouwblokScores) {
  if (!assessment.categorieen || !assessment.categorieen.length) return {};
  const result = {};
  for (const cat of assessment.categorieen) {
    const waarden = cat.bouwblokken
      .map((b) => bouwblokScores[b.id])
      .filter((v) => typeof v === "number");
    if (waarden.length === cat.bouwblokken.length) {
      result[cat.id] = round1(waarden.reduce((a, b) => a + b, 0) / waarden.length);
    }
  }
  return result;
}

// Overall = gemiddelde van ALLE bouwblokscores plat, NIET het gemiddelde van
// de categoriescores (CLAUDE.md sectie 3, expliciet geverifieerd).
export function overallScore(assessment, bouwblokScores) {
  const alle = alleBouwblokken(assessment);
  const waarden = alle.map((b) => bouwblokScores[b.id]).filter((v) => typeof v === "number");
  if (waarden.length !== alle.length || waarden.length === 0) return null;
  return round1(waarden.reduce((a, b) => a + b, 0) / waarden.length);
}

export function classify(score) {
  if (score == null) return null;
  if (score < 2.5) {
    return {
      key: "rood",
      label: "Basis op Orde",
      kleur: "var(--stat-red)",
      toelichting:
        "De basis moet op dit punt eerst op orde gemaakt worden om verder te kunnen uitbouwen.",
    };
  }
  if (score < 3.5) {
    return {
      key: "oranje",
      label: "Uitbouwen",
      kleur: "var(--stat-amber)",
      toelichting:
        "De basis is op orde en je bent onderweg, maar er is nog een verbeterstap nodig om richting excellent te gaan.",
    };
  }
  return {
    key: "groen",
    label: "Sterk punt",
    kleur: "var(--stat-green)",
    toelichting:
      "Hier is de organisatie al heel goed in. Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere bouwblokken.",
  };
}

export function progress(assessment, antwoorden) {
  const totaal = totaalAantalVragen(assessment);
  const beantwoord = alleBouwblokken(assessment)
    .flatMap((b) => b.vragen)
    .filter((v) => typeof antwoorden[v.id] === "number").length;
  return {
    beantwoord,
    totaal,
    percentage: totaal ? Math.round((beantwoord / totaal) * 100) : 0,
  };
}

export function bouwblokStatus(bouwblok, antwoorden) {
  const beantwoord = bouwblok.vragen.filter((v) => typeof antwoorden[v.id] === "number").length;
  if (beantwoord === 0) return "leeg";
  if (beantwoord === bouwblok.vragen.length) return "afgerond";
  return "bezig";
}

// Top 3 sterktes (hoogste score) en top 3 verbeterkansen (laagste score),
// simpelweg alle bouwblokken gesorteerd op score.
export function top3(assessment, bouwblokScores) {
  const alle = alleBouwblokken(assessment)
    .map((b) => ({ bouwblok: b, score: bouwblokScores[b.id] }))
    .filter((x) => typeof x.score === "number");
  const gesorteerd = alle.slice().sort((a, b) => b.score - a.score);
  return {
    sterktes: gesorteerd.slice(0, 3),
    verbeterkansen: gesorteerd.slice(-3).reverse(),
  };
}

// Groepsscores voor het resultatenscherm: per categorie als die bestaat,
// anders per los bouwblok/domein — optioneel gesorteerd op waarde.
export function groepScoresVoorResultaten(assessment, bouwblokScores) {
  let groepen;
  if (assessment.categorieen && assessment.categorieen.length) {
    const catScores = categorieScores(assessment, bouwblokScores);
    groepen = assessment.categorieen
      .slice()
      .sort((a, b) => a.volgorde - b.volgorde)
      .map((c) => ({ id: c.id, naam: c.naam, score: catScores[c.id] }));
  } else {
    groepen = (assessment.bouwblokken || []).map((b) => ({
      id: b.id,
      naam: b.naam,
      score: bouwblokScores[b.id],
    }));
  }
  if (assessment.scoresPerGroepGesorteerd) {
    groepen = groepen.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
  return groepen;
}
