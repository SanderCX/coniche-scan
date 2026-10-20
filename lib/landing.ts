import { Assessment } from "./types";
import { bouwblokWoorden } from "./visualisatie";

/**
 * De uitleg in de hero van de landingspagina (`CLAUDE.md`, scherm 2, Bovenkant, besloten door Joost op 20 oktober 2026): Eén zin, de eerste van
 * `Assessment.beschrijving`. De tweede zin komt niet meer in de hero voor. Bij een tekst uit de tijd van de oude hero, waarin de eerste zin
 * "op 15 bouwblokken, verdeeld over 5 pijlers — van strategie tot cultuur" noemt, vervalt dat stuk: Het staat in de link eronder.
 */
export function heroUitleg(beschrijving: string): string {
  const eerste = beschrijving.trim().split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/)[0] ?? "";
  return eerste.replace(/\s+op \d+ bouwblokken, verdeeld over \d+ pijlers( — van strategie tot cultuur)?/, "");
}

/**
 * De link onder de uitleg ("15 bouwblokken in 5 pijlers", naar het bouwstenenmodel): Alleen bij een Assessment met de Bouwsteen als eenheid en een
 * categorielaag, dus de Klantcontact Volwassenheidsscan en de Zorgscan. Het aantal komt uit de actieve content.
 */
export function bouwstenenLink(assessment: Assessment): { tekst: string; href: string } | null {
  if (assessment.bouwblokLabel !== "Bouwsteen") return null;
  const categorieen = (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd);
  if (categorieen.length === 0) return null;
  const aantal = categorieen.reduce((som, c) => som + c.bouwblokken.filter((b) => !b.gearchiveerd).length, 0);
  return { tekst: `${aantal} ${bouwblokWoorden(assessment).meervoud} in ${categorieen.length} pijlers`, href: "/bouwstenen" };
}
