/**
 * De KPI-ringen in het organisatiepaneel en in het profiel van de Lead (`dossier.md`, KPI-ringen; `beheerpagina.md`, Organisatiepaneel, KPI's). Pure
 * functies. Een KPI met een schaal (`schaalMin` en `schaalMax`) is een ring, gevuld volgens (waarde − min) gedeeld door (max − min). Zonder gekozen kanaal
 * toont de ring Algemeen. Bij een gekozen kanaal zijn er drie toestanden: De waarde bij het kanaal (kanaalkleur, met een stip op Algemeen), alleen
 * Algemeen (oranje) of geen van beide (uitgegrijsd). Bij een gekozen Onderdeel staat een KPI die niet per Onderdeel mag uitgegrijsd met "n.v.t.".
 */
import type { KpiDefinitie, Organisatie } from "./types";
import { kpiWaardeVan } from "./kpi";

/** De waarden die een ring nodig heeft: Alleen de plek die getoond wordt, zodat een Lead niet meer krijgt dan hij mag zien. */
export interface KpiRingInvoer {
  id: string;
  naam: string;
  eenheid: string | null;
  schaalMin: number;
  schaalMax: number;
  perKanaal: boolean;
  perOnderdeel: boolean;
  /** Algemeen bij Algemeen (`kanaalId: null`) van de gekozen plek. */
  algemeen: number | null;
  /** De waarden per kanaal van de gekozen plek, naar kanaal-id. Leeg zolang de kanalen niet getoond worden. */
  kanalen: Record<string, number>;
}

export type RingToestand = "algemeen" | "kanaal" | "leeg" | "nvt";

export interface KpiRing {
  id: string;
  naam: string;
  toestand: RingToestand;
  /** Hoe ver de ring gevuld is, van 0 tot 1. Nul bij `leeg` en `nvt`. */
  fractie: number;
  /** De waarde in het midden ("440 s", "92%", "+34"), leeg bij `leeg` en `nvt`. */
  tekst: string;
  /** De plek van de stip op de ring (0 tot 1) als Algemeen ook bekend is bij een kanaalwaarde. */
  stip: number | null;
  /** De regel onder de naam: "Algemeen +34", "Niet ingevuld", "n.v.t." of leeg. */
  regel: string;
  /** Het kanaal waarvan de waarde getoond wordt, `null` bij Algemeen. */
  kanaalId: string | null;
  ariaLabel: string;
}

const nl = (n: number) => n.toLocaleString("nl-NL", { maximumFractionDigits: 1 });

/** Een waarde met de eenheid erbij: "440 s", "92%" en bij een positieve NPS "+34". Het "aantal" van een KPI heeft geen eenheid. */
export function kpiRingTekst(waarde: number, kpi: Pick<KpiRingInvoer, "id" | "eenheid">): string {
  const getal = `${kpi.id === "nps" && waarde > 0 ? "+" : ""}${nl(waarde)}`;
  if (kpi.eenheid === "%") return `${getal}%`;
  if (kpi.eenheid && kpi.eenheid !== "aantal") return `${getal} ${kpi.eenheid}`;
  return getal;
}

const fractieVan = (w: number, min: number, max: number) => Math.min(1, Math.max(0, (w - min) / (max - min)));

/** De KPI's met een schaal van de gekozen plek, in de volgorde van de definities. Met `metKanalen` ook de waarden per kanaal. */
export function kpiRingInvoer(
  organisatie: Pick<Organisatie, "kpiWaarden">,
  definities: KpiDefinitie[],
  opties: { onderdeelId: string | null; metKanalen: boolean }
): KpiRingInvoer[] {
  return [...definities]
    .sort((a, b) => a.volgorde - b.volgorde)
    .flatMap((k) => {
      if (k.schaalMin === null || k.schaalMin === undefined || k.schaalMax === null || k.schaalMax === undefined) return [];
      const kanalen: Record<string, number> = {};
      if (opties.metKanalen && k.perKanaal) {
        for (const w of organisatie.kpiWaarden ?? []) {
          if (w.kpiId === k.id && w.onderdeelId === opties.onderdeelId && w.kanaalId !== null) kanalen[w.kanaalId] = w.waarde;
        }
      }
      return [
        {
          id: k.id,
          naam: k.naam,
          eenheid: k.eenheid,
          schaalMin: k.schaalMin,
          schaalMax: k.schaalMax,
          perKanaal: k.perKanaal,
          perOnderdeel: k.perOnderdeel,
          algemeen: kpiWaardeVan(organisatie, k.id, { onderdeelId: opties.onderdeelId, kanaalId: null }),
          kanalen,
        },
      ];
    });
}

/**
 * Eén ring bij een gekozen kanaal (of zonder). `nvt` is voor een gekozen Onderdeel bij een KPI die niet per Onderdeel mag. Een kanaalwaarde telt alleen bij
 * een KPI die per kanaal mag.
 */
export function bouwKpiRing(inv: KpiRingInvoer, kanaalId: string | null, opties: { onderdeelGekozen?: boolean } = {}): KpiRing {
  const leeg = (toestand: "leeg" | "nvt"): KpiRing => ({
    id: inv.id,
    naam: inv.naam,
    toestand,
    fractie: 0,
    tekst: "",
    stip: null,
    regel: toestand === "nvt" ? "n.v.t." : "Niet ingevuld",
    kanaalId: null,
    ariaLabel: toestand === "nvt" ? `${inv.naam} niet van toepassing` : `${inv.naam} niet ingevuld`,
  });
  if (opties.onderdeelGekozen && !inv.perOnderdeel) return leeg("nvt");
  const kanaalWaarde = kanaalId !== null && inv.perKanaal ? (inv.kanalen[kanaalId] ?? null) : null;
  const { algemeen } = inv;
  if (kanaalWaarde !== null) {
    const tekst = kpiRingTekst(kanaalWaarde, inv);
    const algTekst = algemeen === null ? null : kpiRingTekst(algemeen, inv);
    return {
      id: inv.id,
      naam: inv.naam,
      toestand: "kanaal",
      fractie: fractieVan(kanaalWaarde, inv.schaalMin, inv.schaalMax),
      tekst,
      stip: algemeen === null ? null : fractieVan(algemeen, inv.schaalMin, inv.schaalMax),
      regel: algTekst === null ? "" : `Algemeen ${algTekst}`,
      kanaalId,
      ariaLabel: algTekst === null ? `${inv.naam} ${tekst}` : `${inv.naam} ${tekst}, Algemeen ${algTekst}`,
    };
  }
  if (algemeen === null) return leeg("leeg");
  const tekst = kpiRingTekst(algemeen, inv);
  return { id: inv.id, naam: inv.naam, toestand: "algemeen", fractie: fractieVan(algemeen, inv.schaalMin, inv.schaalMax), tekst, stip: null, regel: "", kanaalId: null, ariaLabel: `${inv.naam} ${tekst}` };
}

/**
 * Wat de Lead ziet: Een KPI zonder enige waarde (geen Algemeen en geen enkele kanaalwaarde) valt weg, en zijn alle KPI's zo leeg, dan valt het hele
 * blok weg (`dossier.md`, KPI-ringen). In de beheerweergave valt niets weg.
 */
export function kpiRingInvoerVoorLead(invoer: KpiRingInvoer[]): KpiRingInvoer[] {
  return invoer.filter((k) => k.algemeen !== null || Object.keys(k.kanalen).length > 0);
}

/** De kop van het blok: "KPI's", met erachter het gekozen Onderdeel en het gekozen kanaal. Een deel dat niet gekozen is, valt weg. */
export function kopTekstKpis(delen: (string | null | undefined)[]): string {
  return ["KPI's", ...delen.filter((d): d is string => !!d)].join(" · ");
}
