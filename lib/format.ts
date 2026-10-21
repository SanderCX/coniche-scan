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

/**
 * De klasse en stijl voor de vulling van een balk (`stylesheet.md`, Balklijst): Een percentage van het spoor, afgerond op hele
 * pixels en met minstens 4px bij een waarde boven nul (`.balk-vul`). Bij nul staat alleen het spoor.
 */
export function balkVul(percentage: number): { className: string; style: Record<string, string | number> } {
  const p = Math.min(100, Math.max(0, percentage));
  return p > 0 ? { className: "balk-vul", style: { "--p": `${p}%` } } : { className: "", style: { width: 0 } };
}

/**
 * Een koppelteken in een samengestelde woordgroep krijgt een niet-brekende spatie erachter (`stylesheet.md`, Kop van de Assessment-pagina en
 * sectie-inleiding): "zorg- en welzijnsorganisaties" breekt dan niet na "zorg-", zodat er geen regel eindigt op een halve woordgroep.
 */
export function nbspNaKoppelteken(tekst: string): string {
  return tekst.replace(/(\p{L})- (?=\p{L})/gu, "$1-\u00a0");
}
