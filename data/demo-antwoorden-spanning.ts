/**
 * Voorbeelddata van de Spanningsmeter voor de voorbeeld-output en de film (`visualisatie-spanningsmeter.md`, Wat krijg ik):
 * De fictieve deelnemer en de fictieve groep van 12 scans uit het rekenvoorbeeld (`datamodel.md`, Scoreberekening, Spanningsmeter).
 * Gesloten deterministische data: Dezelfde getallen horen overal terug te komen (Technologie als grootste spanning, Gedrag het meest
 * uiteenlopend, groepsgemiddelden 3,6, 2,9, 2,7, 3,2, 2,5 en 3,9).
 */
import { Antwoord } from "@/lib/types";
import { SpanningScan } from "@/lib/spanning";
import { spanningsmeter } from "./spanningsmeter-assessment";

const velden = [...(spanningsmeter.bouwblokken ?? [])].sort((a, b) => a.volgnummer - b.volgnummer);

function uitWaarden(perVeld: number[][]): Record<string, Antwoord> {
  const uit: Record<string, Antwoord> = {};
  velden.forEach((veld, i) => veld.vragen.forEach((v, j) => (uit[v.id] = perVeld[i][j])));
  return uit;
}

/** De fictieve deelnemer: Verhaal 3,8, Regie 2,6, Gedrag 2,2, Data 3,4, Processen 2,4 en Technologie 4,0. */
export const demoAntwoordenSpanning: Record<string, Antwoord> = uitWaarden([
  [4, 4, 4, 4, 3],
  [3, 3, 2, 3, 2],
  [2, 2, 3, 2, 2],
  [3, 4, 3, 3, 4],
  [2, 3, 2, 3, 2],
  [4, 4, 4, 4, 4],
]);

/** Vijf antwoorden van 1 tot en met 5 met een vaste som, zo gelijk mogelijk verdeeld. */
function metSom(som: number): number[] {
  const basis = Math.floor(som / 5);
  return [0, 1, 2, 3, 4].map((i) => basis + (i < som - basis * 5 ? 1 : 0));
}

/**
 * De som van de vijf antwoorden per veld, per scan (12 scans). De sommen zijn zo gekozen dat de groepsgemiddelden 3,6, 2,9, 2,7, 3,2, 2,5 en 3,9 zijn, dat Gedrag van 1,4 tot 4,0
 * loopt.
 */
const SOMMEN: number[][] = [
  [15, 15, 15, 15, 15, 18, 18, 18, 18, 23, 23, 23],
  [12, 12, 12, 12, 12, 15, 15, 15, 15, 18, 18, 18],
  [7, 20, 11, 11, 11, 14, 14, 14, 14, 15, 15, 16],
  [14, 14, 14, 14, 14, 16, 16, 16, 16, 19, 19, 20],
  [11, 11, 11, 11, 11, 12, 12, 12, 12, 16, 16, 15],
  [20, 20, 20, 20, 20, 19, 19, 19, 19, 19, 19, 20],
];
/** Vier fictieve antwoorden op de open vraag (`Assessment.openVraag`), per scan en per veld: Voorbeelddata voor de kaart Voorbeelden uit de groep. */
const OPMERKINGEN: Record<number, Record<number, string>> = {
  1: { 3: "In het klantoverleg van maart bleek dat drie teams dezelfde klantvraag anders beantwoordden. Niemand voelde zich verantwoordelijk om dat recht te zetten." },
  4: { 3: "Bij de introductie van de nieuwe chatbot kregen medewerkers één uur uitleg. Daarna moesten ze het zelf uitzoeken, en dat gebeurde nauwelijks." },
  7: { 6: "Het CRM kan klantcontacten tonen, maar kanalen zijn niet gekoppeld. Een klant die belt na een chat begint steeds opnieuw." },
  9: { 1: "In de strategiesessie van januari is de klantbelofte vastgesteld, maar de teams kennen haar niet en gebruiken haar niet bij prioriteiten." },
};

/** Twaalf fictieve scans van één Meting. */
export const demoSpanningGroep: SpanningScan[] = Array.from({ length: 12 }, (_, s) => ({
  antwoorden: uitWaarden(SOMMEN.map((veldSommen) => metSom(veldSommen[s]))),
  opmerkingen: Object.fromEntries(
    Object.entries(OPMERKINGEN[s] ?? {}).map(([veldnr, tekst]) => [velden[Number(veldnr) - 1].id, tekst])
  ),
}));
