import { Controle } from "./contactpersonen";

/**
 * De grenzen van het spreidingslabel Eensgezind, Wisselend of Verdeeld (`beheerpagina.md`, formulier Spreiding; `datamodel.md`, Instellingen): Een
 * standaardafwijking onder `wisselend` is Eensgezind, van `wisselend` tot `verdeeld` Wisselend en daarboven Verdeeld. Voor de schaalscans in
 * scorepunten, voor de Quickscan in procentpunten. Pure functies: De instellingen zelf staan in `lib/instellingen-store.ts`.
 */
export interface SpreidingGrenzen {
  wisselend: number;
  verdeeld: number;
}

/** De startwaarden (`visualisatie-scores.md`, Spreidingslabel; `visualisatie-quickscan.md`, Spreidingslabel). */
export const SPREIDING_STANDAARD: SpreidingGrenzen = { wisselend: 0.55, verdeeld: 0.8 };
export const SPREIDING_STANDAARD_QUICKSCAN: SpreidingGrenzen = { wisselend: 14, verdeeld: 20 };

/** De vier velden van het formulier, met de namen van de instellingen. */
export const SPREIDING_SLEUTELS = ["spreidingWisselend", "spreidingVerdeeld", "spreidingWisselendQuickscan", "spreidingVerdeeldQuickscan"] as const;
export type SpreidingSleutel = (typeof SPREIDING_SLEUTELS)[number];

export type SpreidingInstellingen = Record<SpreidingSleutel, number>;

export const SPREIDING_STANDAARDWAARDEN: SpreidingInstellingen = {
  spreidingWisselend: SPREIDING_STANDAARD.wisselend,
  spreidingVerdeeld: SPREIDING_STANDAARD.verdeeld,
  spreidingWisselendQuickscan: SPREIDING_STANDAARD_QUICKSCAN.wisselend,
  spreidingVerdeeldQuickscan: SPREIDING_STANDAARD_QUICKSCAN.verdeeld,
};

/** Een getal uit een invoerveld: Met een komma of een punt als decimaalteken, groter dan 0. `null` bij alles anders. */
export function leesGrens(tekst: string): number | null {
  const t = tekst.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Een grens zoals hij op het scherm staat: Met een komma, zonder overbodige nullen ("0,55", "14"). */
export function grensTekst(n: number): string {
  return String(n).replace(".", ",");
}

/**
 * De invoer van het formulier controleren: Elk veld is een getal groter dan 0 en de grens voor Verdeeld ligt boven die voor Wisselend, bij de
 * schaalscans en bij de Quickscan. Een leeg of onleesbaar veld geeft de eerste fout.
 */
export function controleerSpreidingGrenzen(invoer: Record<SpreidingSleutel, string>): Controle<SpreidingInstellingen> {
  const waarde = {} as SpreidingInstellingen;
  for (const sleutel of SPREIDING_SLEUTELS) {
    const n = leesGrens(invoer[sleutel]);
    if (n === null) return { ok: false, reden: "Vul bij elk veld een getal groter dan 0 in, bijvoorbeeld 0,55." };
    waarde[sleutel] = n;
  }
  if (waarde.spreidingVerdeeld <= waarde.spreidingWisselend) return { ok: false, reden: "Bij de schaalscans moet de grens voor Verdeeld boven die voor Wisselend liggen." };
  if (waarde.spreidingVerdeeldQuickscan <= waarde.spreidingWisselendQuickscan) return { ok: false, reden: "Bij de Quickscan moet de grens voor Verdeeld boven die voor Wisselend liggen." };
  return { ok: true, waarde };
}

/** Het label bij een standaardafwijking. */
export function spreidingLabelVoor(sd: number, grenzen: SpreidingGrenzen): "Eensgezind" | "Wisselend" | "Verdeeld" {
  if (sd < grenzen.wisselend) return "Eensgezind";
  if (sd < grenzen.verdeeld) return "Wisselend";
  return "Verdeeld";
}
