"use client";

import { AntwoordenNamenSchakelaar } from "@/components/beheer/AntwoordenNamenSchakelaar";
import { BenchmarkVlag } from "@/components/beheer/BenchmarkVlag";
import { CaseVlag } from "@/components/beheer/CaseVlag";
import { Organisatie } from "@/lib/types";

/**
 * Het vlak Afspraken in het organisatiepaneel (`beheerpagina.md`, punt 4, Afspraken, voorstel van 19 oktober 2026), alleen voor een Admin:
 * Wat met de organisatie is afgesproken over haar gegevens, als drie schakelaars naast elkaar (de derde, "Mag als case gebruikt worden", sinds het Dossier van 20 oktober 2026, `dossier.md`) met elk een Info-icoon. Ze staan uit bij een
 * nieuwe organisatie en horen bovenaan, zodat een Admin in één blik ziet wat aan staat.
 */
export function AfsprakenKaart({ organisatie }: { organisatie: Organisatie }) {
  return (
    <section className="op-vlak" aria-label="Afspraken">
      <div className="beheer-kaart-kop">
        <h2>Afspraken</h2>
      </div>
      <div className="afspraken-rij">
        <BenchmarkVlag organisatie={organisatie} />
        <AntwoordenNamenSchakelaar organisatie={organisatie} />
        <CaseVlag organisatie={organisatie} />
      </div>
    </section>
  );
}
