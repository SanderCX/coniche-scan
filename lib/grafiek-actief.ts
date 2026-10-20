import { useState } from "react";

/**
 * Welk deel van de radar en het staafdiagram is actief bij hover of toetsenbordfocus (`stylesheet.md`, Radar en staafdiagram op het
 * resultaatscherm, Hover tussen radar en staafdiagram). `groepKey` is de categorie van een bouwblok, en bij een Assessment zonder
 * categorielaag het bouwblok zelf (het domein). Met `bouwblokId` is het één bouwblok (een knooppunt of een kolom), zonder is het een hele categorie
 * (een balk).
 */
export interface GrafiekActief {
  groepKey: string;
  bouwblokId?: string;
}

export type ZetActief = (actief: GrafiekActief | null) => void;

/** De sleutel van de groep van een bouwblok: De categorie, en zonder categorielaag (`_vlak`) het bouwblok zelf. */
export function groepSleutel(groepId: string, bouwblokId: string): string {
  return groepId === "_vlak" ? bouwblokId : groepId;
}

/**
 * De actieve staat van een grafiek: Die van de ouder als die er een meegeeft (zodat de radar en het staafdiagram elkaar kunnen
 * oplichten), anders een eigen staat.
 */
export function useGrafiekActief(extern?: { actief?: GrafiekActief | null; onActief?: ZetActief }): { actief: GrafiekActief | null; zet: ZetActief } {
  const [eigen, setEigen] = useState<GrafiekActief | null>(null);
  if (extern?.onActief) return { actief: extern.actief ?? null, zet: extern.onActief };
  return { actief: eigen, zet: setEigen };
}

/** Hoe een deel van de grafiek getekend wordt bij de actieve staat. */
export type Staat = "normaal" | "actief" | "groep" | "gedimd";

/**
 * De staat van een bouwblok bij de actieve staat. `actief`: Het bouwblok zelf (hover op een knooppunt of kolom) of, bij een hele categorie,
 * elk bouwblok ervan. `groep`: Een ander bouwblok van de actieve categorie, als een knooppunt de actieve is. `gedimd`: Alles daarbuiten.
 */
export function staatVan(actief: GrafiekActief | null, groepKey: string, bouwblokId: string): Staat {
  if (!actief) return "normaal";
  if (actief.groepKey !== groepKey) return "gedimd";
  if (!actief.bouwblokId) return "actief";
  return actief.bouwblokId === bouwblokId ? "actief" : "groep";
}
