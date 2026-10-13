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

/** De niet-lege teksten uit een lijst waarden, getrimd en zonder dubbelen op hoofdletters (de eerste schrijfwijze wint). */
export function uniekeTeksten(waarden: unknown[]): string[] {
  const gezien = new Map<string, string>();
  for (const waarde of waarden) {
    if (typeof waarde !== "string") continue;
    const schoon = waarde.trim();
    if (schoon && !gezien.has(schoon.toLowerCase())) gezien.set(schoon.toLowerCase(), schoon);
  }
  return [...gezien.values()];
}

/** Alle ingevulde, niet-lege teksten op dit pad over de organisaties heen (getrimd, zonder dubbelen op hoofdletters). */
export function gebruikteWaarden(organisaties: { kenmerken: Record<string, unknown> }[], pad: string[]): string[] {
  return uniekeTeksten(organisaties.map((o) => waardeOpPad(o.kenmerken ?? {}, pad)));
}

/** Alle ingevulde functies van de Respondenten over de organisaties heen (`Respondent.functie`, vrije tekst of keuze). */
export function gebruikteFuncties(organisaties: { leden: { functie: string | null }[] }[]): string[] {
  return uniekeTeksten(organisaties.flatMap((o) => (o.leden ?? []).map((l) => l.functie)));
}

/**
 * De keuzelijst: eerst de opties die vooraan horen (`voorop`, in de gegeven volgorde), daarna de vaste opties en wat er
 * verder is ingevuld, samen op alfabet (hoofdletterongevoelig). De huidige waarde van deze organisatie staat er altijd
 * in, ook als hij nergens anders voorkomt. "Anders…" is geen onderdeel van de lijst: Dat staat in het formulier altijd
 * onderaan.
 */
export function optieLijst(vast: string[], gebruikt: string[], huidige?: string, voorop: string[] = []): string[] {
  const sleutels = new Set<string>();
  const kop: string[] = [];
  for (const waarde of voorop) {
    const schoon = waarde.trim();
    if (!schoon || sleutels.has(schoon.toLowerCase())) continue;
    sleutels.add(schoon.toLowerCase());
    kop.push(schoon);
  }
  const lijst: string[] = [];
  for (const waarde of [...vast, ...gebruikt, huidige ?? ""]) {
    const schoon = waarde.trim();
    if (!schoon || sleutels.has(schoon.toLowerCase())) continue;
    sleutels.add(schoon.toLowerCase());
    lijst.push(schoon);
  }
  lijst.sort((a, b) => a.localeCompare(b, "nl", { sensitivity: "base", numeric: true }));
  return [...kop, ...lijst];
}

/** Een ingetypte waarde: Getrimd, en met de spelling van een bestaande optie als die er hoofdletterongevoelig mee overeenkomt. */
export function kiesSpelling(invoer: string, lijst: string[]): string {
  const schoon = invoer.trim();
  return lijst.find((o) => o.toLowerCase() === schoon.toLowerCase()) ?? schoon;
}
