"use client";

import { useState } from "react";
import { BouwblokResultaat, GroepResultaat } from "@/lib/scoring";
import { GrafiekActief } from "@/lib/grafiek-actief";
import { RadarChartView } from "./RadarChartView";
import { CategoryBarChart } from "./CategoryBarChart";

/**
 * De twee kaarten naast elkaar op het resultaatscherm (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm): De radar en het
 * staafdiagram per categorie, of bij een Assessment zonder categorielaag (de AI-scan) het kolomdiagram per domein. Ze delen de actieve staat, dus hover
 * of focus op een knooppunt laat de balk of kolom oplichten en andersom (`lib/grafiek-actief.ts`).
 */
export function ResultaatKaarten({
  bouwblokResultaten,
  groepResultaten,
  vlak,
  radarTitel,
  groepTitel,
  vergelijkingBouwblokken,
  vergelijkingGroepen,
  naam,
  vergelijkingNaam,
}: {
  bouwblokResultaten: BouwblokResultaat[];
  groepResultaten: GroepResultaat[];
  /** Zonder categorielaag: Het kolomdiagram per domein in plaats van het staafdiagram per categorie. */
  vlak: boolean;
  radarTitel: string;
  groepTitel: string;
  /** Een tweede reeks, bijvoorbeeld de rest van de groep in een benchmark (`benchmark.md`, View per organisatie). */
  vergelijkingBouwblokken?: BouwblokResultaat[];
  vergelijkingGroepen?: GroepResultaat[];
  naam?: string;
  vergelijkingNaam?: string;
}) {
  const [actief, setActief] = useState<GrafiekActief | null>(null);
  return (
    <div className="resultaat-kaarten">
      <section className="resultaat-kaart">
        <h3>{radarTitel}</h3>
        <RadarChartView
          resultaten={bouwblokResultaten}
          vergelijking={vergelijkingBouwblokken}
          naam={naam}
          vergelijkingNaam={vergelijkingNaam}
          actief={actief}
          onActief={setActief}
        />
      </section>
      <section className="resultaat-kaart">
        <h3>{groepTitel}</h3>
        <CategoryBarChart
          resultaten={groepResultaten}
          vergelijking={vergelijkingGroepen}
          horizontaal={vlak}
          naam={naam}
          vergelijkingNaam={vergelijkingNaam}
          actief={actief}
          onActief={setActief}
        />
      </section>
    </div>
  );
}
