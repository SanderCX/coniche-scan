/** Gewicht voor weergave: Nederlandse komma, geen overbodige decimalen (2 → "2", 1.5 → "1,5"). */
export function formatGewicht(gewicht: number): string {
  return String(Number(gewicht.toFixed(2))).replace(".", ",");
}

/** Leest een gewicht uit een tekstveld (komma of punt). `null` bij een ongeldige waarde of een waarde die niet groter is dan 0. */
export function parseGewicht(tekst: string): number | null {
  const getal = Number(tekst.trim().replace(",", "."));
  return Number.isFinite(getal) && getal > 0 ? getal : null;
}

/** Een score met één decimaal en een decimale komma ("3,8"), of een streepje zonder waarde. Overal waar een score als tekst staat. */
export function formatScore(score: number | null | undefined, decimalen = 1): string {
  return score === null || score === undefined ? "–" : score.toFixed(decimalen).replace(".", ",");
}
