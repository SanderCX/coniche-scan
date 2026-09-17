import { Classificatie } from "./types";

/**
 * Officiële Coniche-huisstijlkleuren per categorie, zie stylesheet.md
 * (bevestigd via coniche-v4.html). De keys (oranje/blauw/paars/groen/goud)
 * blijven ongewijzigd t.o.v. eerdere versies zodat bestaande content
 * (categorie.kleur-waarden) blijft werken.
 */
export const CATEGORIE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  oranje: { bg: "bg-or", text: "text-or", border: "border-or" },
  blauw: { bg: "bg-bl", text: "text-bl", border: "border-bl" },
  paars: { bg: "bg-pu", text: "text-pu", border: "border-pu" },
  groen: { bg: "bg-gr", text: "text-gr", border: "border-gr" },
  goud: { bg: "bg-ye", text: "text-ye", border: "border-ye" },
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
