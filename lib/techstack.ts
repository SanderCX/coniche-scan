/**
 * Techstack-ondersteuning (`datamodel.md`, Organisatievelden, Techstack). Bij een categorie met een lijst partijen is
 * "Ondersteund door" één keuzelijst: "Geen ondersteuning" (de organisatie ondersteunt het zelf) of een partij. Daaruit
 * volgt `zelf` of `extern`, zodat exports (InDesign `ondersteuning`) hun waarden houden. LLM-oplossing heeft geen
 * "Ondersteund door" en dus ook geen `ondersteuning`.
 */

/** De eerste keuze in elke lijst "Ondersteund door": De organisatie ondersteunt de oplossing zelf. */
export const GEEN_ONDERSTEUNING = "Geen ondersteuning";

function tekstOf(waarde: unknown): string {
  return typeof waarde === "string" ? waarde.trim() : "";
}

/**
 * `zelf` of `extern` voor één techstack-categorie (het object onder `kenmerken.techstack[categorieId]`). De gekozen
 * partij gaat voor; zonder partij geldt het oude veld `ondersteuning`. Leeg als er niets bekend is.
 */
export function ondersteuningVan(item: unknown): "zelf" | "extern" | undefined {
  if (typeof item !== "object" || item === null) return undefined;
  const { ondersteuner, ondersteuning } = item as Record<string, unknown>;
  const partij = tekstOf(ondersteuner);
  if (partij) return partij === GEEN_ONDERSTEUNING ? "zelf" : "extern";
  return ondersteuning === "zelf" || ondersteuning === "extern" ? ondersteuning : undefined;
}

/**
 * Zet het oude veld `ondersteuning` om naar "Ondersteund door" voor de categorieën met een lijst partijen:
 * - "zelf" wordt "Geen ondersteuning".
 * - Is er al een partij of "Geen ondersteuning" gekozen, dan vervalt het oude veld.
 * - "extern" zonder bekende partij blijft staan: De partij is niet te raden. De export gebruikt dan het oude veld
 *   totdat iemand een partij kiest.
 * Geeft hetzelfde object terug als er niets te doen is.
 */
export function migreerTechstackOndersteuning(
  kenmerken: Record<string, unknown>,
  categorieIdsMetLijst: string[]
): Record<string, unknown> {
  const techstack = kenmerken.techstack;
  if (typeof techstack !== "object" || techstack === null) return kenmerken;

  const nieuw: Record<string, unknown> = { ...(techstack as Record<string, unknown>) };
  let gewijzigd = false;
  for (const id of categorieIdsMetLijst) {
    const item = nieuw[id];
    if (typeof item !== "object" || item === null) continue;
    const { ondersteuning, ...rest } = item as Record<string, unknown>;
    if (ondersteuning === undefined) continue;
    if (tekstOf(rest.ondersteuner)) {
      nieuw[id] = rest;
    } else if (ondersteuning === "zelf") {
      nieuw[id] = { ...rest, ondersteuner: GEEN_ONDERSTEUNING };
    } else {
      continue;
    }
    gewijzigd = true;
  }
  return gewijzigd ? { ...kenmerken, techstack: nieuw } : kenmerken;
}
