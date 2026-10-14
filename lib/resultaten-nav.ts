/**
 * De hoofdlink waarlangs een pagina is bereikt (`beheerpagina.md`, Navigatie in beheer): Het Meting-overzicht en de
 * resultatenpagina's bereik je vanuit Organisaties en vanuit Resultaten. Het kruimelpad en de actieve hoofdlink volgen de
 * weg waarlangs je kwam. Dat staat in de adresbalk als `?via=resultaten`, zodat terugkeren en delen hetzelfde pad geven.
 */
export const VIA_RESULTATEN = "resultaten";

/** Voegt `via=resultaten` toe aan een adres, zodat de volgende pagina het pad van Resultaten volgt. */
export function metVia(href: string, via: boolean): string {
  if (!via) return href;
  const [pad, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("via", VIA_RESULTATEN);
  return `${pad}?${params.toString()}`;
}

export interface Kruimel {
  label: string;
  href?: string;
}

/**
 * Het kruimelpad naar een Meting (`beheerpagina.md`, Navigatie in beheer): Via Resultaten is het Resultaten › Organisatie ›
 * Ronde › Meting (de ronde ontbreekt bij een Meting zonder ronde), anders Organisaties › Organisatie › Meting. `laatste` is
 * een extra deel erachter, bijvoorbeeld "Resultaten van de Meting"; dan is de Meting zelf een link.
 */
export function kruimelsVoorMeting(
  organisatie: { id: string; naam: string },
  meting: { id: string; label: string },
  ronde: { id: string; label: string } | undefined,
  via: boolean,
  laatste?: string
): Kruimel[] {
  const metingHref = metVia(`/beheer/metingen/${meting.id}`, via);
  const metingDeel: Kruimel = laatste ? { label: meting.label, href: metingHref } : { label: meting.label };
  const staart: Kruimel[] = laatste ? [metingDeel, { label: laatste }] : [metingDeel];
  if (via) {
    return [
      { label: "Resultaten", href: "/beheer/resultaten/rondes" },
      { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
      ...(ronde ? [{ label: ronde.label, href: metVia(`/beheer/rondes/${ronde.id}`, true) }] : []),
      ...staart,
    ];
  }
  return [
    { label: "Organisaties", href: "/beheer/organisaties" },
    { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
    ...staart,
  ];
}
