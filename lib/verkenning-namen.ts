/**
 * De namen bij de filters van een verkenning, met de korte namen (`visualisatie-verkennen.md`, Korte namen) en de naam van een
 * Organisatie bij het kenmerk Organisatie. Aparte module, zodat `lib/verkenning-benchmark.ts` zonder opslag blijft.
 */
import { KorteNamen, korteNaamVeld, korteNaamWaarde } from "./korte-namen";
import { Organisatie } from "./types";
import { KANALEN_ID, ONDERDEEL_ID, ORGANISATIE_ID, filterVelden, onderdeelVelden, veldLabelZonderGroep } from "./verkennen";
import { kanaalNaam } from "./verkenning-benchmark";

export function maakFilterNamen(korteNamen: KorteNamen, organisaties: Pick<Organisatie, "id" | "naam">[]) {
  const velden = [...filterVelden(), ...onderdeelVelden()];
  return {
    veld: (kenmerk: string): string => {
      if (kenmerk === KANALEN_ID) return korteNaamVeld(korteNamen, KANALEN_ID, "Ingezette kanalen");
      if (kenmerk === ORGANISATIE_ID) return "Organisatie";
      if (kenmerk === ONDERDEEL_ID) return "Onderdeel";
      const veld = velden.find((v) => v.id === kenmerk);
      return veld ? korteNaamVeld(korteNamen, kenmerk, veldLabelZonderGroep(veld)) : kenmerk;
    },
    waarde: (kenmerk: string, waarde: string): string => {
      if (kenmerk === KANALEN_ID) return kanaalNaam(waarde);
      if (kenmerk === ORGANISATIE_ID) return organisaties.find((o) => o.id === waarde)?.naam ?? waarde;
      if (kenmerk === ONDERDEEL_ID) return waarde;
      return korteNaamWaarde(korteNamen, kenmerk, waarde);
    },
  };
}
