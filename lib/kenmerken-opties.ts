/**
 * Optielijsten voor organisatievelden waar naast de vaste keuzes ook een eigen invoer mag (`VeldDefinitie.eigenOptie`,
 * bijv. de Oplossing bij Techstack, Contact center). Een eigen invoer wordt als gewone tekst bij de organisatie
 * opgeslagen. De lijst waaruit de volgende organisatie kiest, is de vaste lijst plus alles wat organisaties daar al
 * hebben ingevuld: Er is dus geen aparte opslag van "toegevoegde opties" die uit de pas kan lopen.
 */

/** De waarde op een pad in `kenmerken` (genest op veld-id's), of `undefined`. */
export function waardeOpPad(kenmerken: Record<string, unknown>, pad: string[]): unknown {
  let huidig: unknown = kenmerken;
  for (const stap of pad) {
    if (typeof huidig !== "object" || huidig === null) return undefined;
    huidig = (huidig as Record<string, unknown>)[stap];
  }
  return huidig;
}

/** Alle ingevulde, niet-lege teksten op dit pad over de organisaties heen (getrimd, zonder dubbelen op hoofdletters). */
export function gebruikteWaarden(organisaties: { kenmerken: Record<string, unknown> }[], pad: string[]): string[] {
  const gezien = new Map<string, string>();
  for (const organisatie of organisaties) {
    const waarde = waardeOpPad(organisatie.kenmerken ?? {}, pad);
    if (typeof waarde !== "string") continue;
    const schoon = waarde.trim();
    if (schoon && !gezien.has(schoon.toLowerCase())) gezien.set(schoon.toLowerCase(), schoon);
  }
  return [...gezien.values()];
}

/**
 * De keuzelijst: de vaste opties en wat er verder is ingevuld, samen op alfabet (hoofdletterongevoelig). De huidige
 * waarde van deze organisatie staat er altijd in, ook als hij nergens anders voorkomt. "Anders…" is geen onderdeel van
 * de lijst: Dat staat in het formulier altijd onderaan.
 */
export function optieLijst(vast: string[], gebruikt: string[], huidige?: string): string[] {
  const sleutels = new Set<string>();
  const lijst: string[] = [];
  for (const waarde of [...vast, ...gebruikt, huidige ?? ""]) {
    const schoon = waarde.trim();
    if (!schoon || sleutels.has(schoon.toLowerCase())) continue;
    sleutels.add(schoon.toLowerCase());
    lijst.push(schoon);
  }
  return lijst.sort((a, b) => a.localeCompare(b, "nl", { sensitivity: "base", numeric: true }));
}

/** Een ingetypte waarde: Getrimd, en met de spelling van een bestaande optie als die er hoofdletterongevoelig mee overeenkomt. */
export function kiesSpelling(invoer: string, lijst: string[]): string {
  const schoon = invoer.trim();
  return lijst.find((o) => o.toLowerCase() === schoon.toLowerCase()) ?? schoon;
}
