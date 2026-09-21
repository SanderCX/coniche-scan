import { Classificatie } from "./types";

/**
 * Officiële Coniche-huisstijlkleuren per categorie, zie stylesheet.md
 * (bevestigd via `tokens.css`). De keys (oranje/blauw/paars/groen/goud)
 * blijven ongewijzigd t.o.v. eerdere versies zodat bestaande content
 * (categorie.kleur-waarden) blijft werken.
 */
export const CATEGORIE_COLORS: Record<
  string,
  { bg: string; text: string; border: string; hex: string }
> = {
  oranje: { bg: "bg-or", text: "text-or", border: "border-or", hex: "#ff671f" },
  blauw: { bg: "bg-bl", text: "text-bl", border: "border-bl", hex: "#225ba0" },
  paars: { bg: "bg-pu", text: "text-pu", border: "border-pu", hex: "#392944" },
  groen: { bg: "bg-gr", text: "text-gr", border: "border-gr", hex: "#197f4e" },
  goud: { bg: "bg-ye", text: "text-ye", border: "border-ye", hex: "#ffc043" },
};

/**
 * Universele statuskleuren voor de classificatie "Basis op Orde"/"Uitbouwen"/
 * "Sterk punt" — bewust GEEN categoriekleur (zie stylesheet.md, `--stat-*`
 * in tokens.css). Exacte waarden komen letterlijk uit tokens.css.
 */
export const CLASSIFICATIE_HEX: Record<Classificatie, string> = {
  rood: "#dc2626",
  oranje: "#e8871e",
  groen: "#22a06b",
};

export const CLASSIFICATIE_INFO: Record<
  Classificatie,
  { label: string; bg: string; text: string; kleur: string; omschrijving: string }
> = {
  rood: {
    label: "Basis op Orde",
    bg: "bg-stat-red",
    text: "text-stat-red",
    kleur: "var(--stat-red)",
    omschrijving:
      "De basis moet op dit punt eerst op orde gemaakt worden om verder te kunnen uitbouwen.",
  },
  oranje: {
    label: "Uitbouwen",
    bg: "bg-stat-amber",
    text: "text-stat-amber",
    kleur: "var(--stat-amber)",
    omschrijving:
      "De basis is op orde en je bent onderweg, maar er is nog een verbeterstap nodig om richting excellent te gaan.",
  },
  groen: {
    label: "Sterk punt",
    bg: "bg-stat-green",
    text: "text-stat-green",
    kleur: "var(--stat-green)",
    omschrijving:
      "Hier is de organisatie al heel goed in. Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere bouwblokken.",
  },
};
