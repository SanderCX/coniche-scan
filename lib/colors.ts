import { Classificatie } from "./types";

export const CATEGORIE_COLORS: Record<
  string,
  { bg: string; text: string; border: string; bgLicht: string; ring: string }
> = {
  oranje: {
    bg: "bg-orange-500",
    text: "text-orange-600",
    border: "border-orange-500",
    bgLicht: "bg-orange-50",
    ring: "ring-orange-500",
  },
  blauw: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    border: "border-blue-500",
    bgLicht: "bg-blue-50",
    ring: "ring-blue-500",
  },
  paars: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    border: "border-purple-500",
    bgLicht: "bg-purple-50",
    ring: "ring-purple-500",
  },
  groen: {
    bg: "bg-green-500",
    text: "text-green-600",
    border: "border-green-500",
    bgLicht: "bg-green-50",
    ring: "ring-green-500",
  },
  goud: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-500",
    bgLicht: "bg-amber-50",
    ring: "ring-amber-500",
  },
};

export const CLASSIFICATIE_HEX: Record<Classificatie, string> = {
  rood: "#ef4444",
  oranje: "#f97316",
  groen: "#22c55e",
};

export const CLASSIFICATIE_INFO: Record<
  Classificatie,
  { label: string; bg: string; text: string; omschrijving: string }
> = {
  rood: {
    label: "Basis op Orde",
    bg: "bg-red-500",
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
    bg: "bg-green-500",
    text: "text-green-600",
    omschrijving:
      "Hier is de organisatie al heel goed in. Benut dit optimaal en bouw het verder uit, ook ter ondersteuning van zwakkere bouwblokken.",
  },
};
