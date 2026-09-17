import { Classificatie } from "./types";

/**
 * Officiële Coniche-huisstijlkleuren per categorie, zie stylesheet.md.
 * De keys (oranje/blauw/paars/groen/goud) blijven ongewijzigd t.o.v. eerdere
 * versies zodat bestaande content (categorie.kleur-waarden) blijft werken —
 * alleen de kleuren zelf zijn vervangen door de officiële huisstijl.
 */
export const CATEGORIE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  oranje: {
    bg: "bg-cat-overkoepelend",
    text: "text-cat-overkoepelend",
    border: "border-cat-overkoepelend",
  },
  blauw: {
    bg: "bg-cat-organisatie",
    text: "text-cat-organisatie",
    border: "border-cat-organisatie",
  },
  paars: {
    bg: "bg-cat-procestech",
    text: "text-cat-procestech",
    border: "border-cat-procestech",
  },
  groen: {
    bg: "bg-cat-mens",
    text: "text-cat-mens",
    border: "border-cat-mens",
  },
  goud: {
    bg: "bg-cat-fundament",
    text: "text-cat-fundament",
    border: "border-cat-fundament",
  },
};

/** Universele statuskleuren, geen merkidentiteit — exacte Tailwind-tinten (zie stylesheet.md). */
export const CLASSIFICATIE_HEX: Record<Classificatie, string> = {
  rood: "#dc2626",
  oranje: "#f97316",
  groen: "#16a34a",
};

export const CLASSIFICATIE_INFO: Record<
  Classificatie,
  { label: string; bg: string; text: string; omschrijving: string }
> = {
  rood: {
    label: "Basis op Orde",
    bg: "bg-red-600",
    text: "text-red-600",
    omschrijving:
      "De basis moet op dit punt eerst op orde gemaakt worden om verder te kunnen uitbouwen.",
  },
  oranje: {
    label: "Uitbouwen",
    bg: "bg-orange-500",
    text: "text-orange-600",
    omschrijving:
      "De basis is op orde en je bent onderweg, maar er is nog een verbeterstap nodig om richting excellent te gaan.",
  },
  groen: {
    label: "Sterk punt",
    bg: "bg-green-600",
    text: "text-green-600",
    omschrijving:
      "Hier is de organisatie al heel goed in. Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere bouwblokken.",
  },
};
