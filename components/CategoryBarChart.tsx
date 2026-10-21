"use client";

import { GroepResultaat } from "@/lib/scoring";
import { CategorieStaafdiagram } from "@/components/CategorieStaafdiagram";
import { DomeinKolommen } from "@/components/DomeinKolommen";
import { GrafiekActief, ZetActief } from "@/lib/grafiek-actief";

/**
 * `horizontaal` (CLAUDE.md sectie 3, scherm 6): Bij een Assessment zonder
 * categorie-laag (bijv. de AI-volwassenheidsscan) vervalt het staafdiagram per
 * categorie voor een staand kolomdiagram per domein, in de volgorde van de
 * domeinen en niet op score gesorteerd (`DomeinKolommen`, `stylesheet.md`, Domeinen).
 *
 * `vergelijking` (`benchmark.md`, View per organisatie): Het gemiddelde van de rest van de groep, als neutrale balk
 * naast de score van de organisatie. Gelijk aan `resultaten` qua volgorde. Beide diagrammen zijn HTML en CSS en scrollen nooit.
 */
export function CategoryBarChart({
  resultaten,
  horizontaal = false,
  vergelijking,
  naam = "Score",
  vergelijkingNaam = "Rest van de groep",
  actief,
  onActief,
}: {
  resultaten: GroepResultaat[];
  horizontaal?: boolean;
  vergelijking?: GroepResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
  /** De actieve staat van de ouder, zodat de radar en dit diagram elkaar oplichten (`lib/grafiek-actief.ts`). */
  actief?: GrafiekActief | null;
  onActief?: ZetActief;
}) {
  // Zonder categorielaag (de AI-scan): Een staand kolomdiagram per domein, in de volgorde van de domeinen (`components/DomeinKolommen.tsx`).
  if (horizontaal) {
    return <DomeinKolommen resultaten={resultaten} vergelijking={vergelijking} naam={naam} vergelijkingNaam={vergelijkingNaam} actief={actief} onActief={onActief} />;
  }

  // Het staafdiagram per categorie (`components/CategorieStaafdiagram.tsx`): Het getal staat in de tooltip, niet boven de balk. Met een tweede reeks
  // (de rest van de groep in een benchmark) staan er twee balken per categorie.
  return (
    <CategorieStaafdiagram resultaten={resultaten} vergelijking={vergelijking} naam={naam} vergelijkingNaam={vergelijkingNaam} actief={actief} onActief={onActief} />
  );
}
