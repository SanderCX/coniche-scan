/**
 * Wat een Lead ziet (`datamodel.md` deel 2, `LeadToegang`; `beheerpagina.md`, punt 6a). Pure functies zonder opslag.
 *
 * Een Admin vinkt per Lead aan welke weergave van welke Meting of benchmark hij ziet, in één tabel per organisatie. Er is geen
 * bereik "hele organisatie" en toegang erft nergens van mee: Een nieuwe Meting of benchmark begint voor elke Lead zonder vinkje.
 * Een Lead zonder vinkje ziet niets.
 *
 * Afhankelijkheden tussen de vinkjes: Spreiding, Antwoorden en Exporteren kunnen alleen aan als Resultaten van dezelfde Meting
 * aan staat. Een samengestelde Meting heeft alleen Resultaten. Uitnodigen is onafhankelijk. Een benchmark binnen een
 * organisatie (niveau 2) kan alleen als de Lead Resultaten heeft voor een lid-Meting van die benchmark.
 */
import { Benchmark, LeadToegang, LeadWeergave, Organisatie, OrganisatieLid, ScanUitvoering } from "./types";

/** Een vergelijking tussen Metingen heeft minstens twee Metingen (`benchmark.md`, Niveau 2). */
const MIN_LEDEN_VERGELIJKING = 2;

export const LEAD_WEERGAVE_LABEL: Record<LeadWeergave, string> = {
  resultaten: "Resultaten",
  spreiding: "Spreiding",
  antwoorden: "Antwoorden",
  uitnodigen: "Uitnodigen",
  exporteren: "Exporteren",
  benchmark: "Benchmark",
};

/** De vijf weergaven per Meting, in de volgorde van de tabel. */
export const METING_WEERGAVEN: Exclude<LeadWeergave, "benchmark">[] = [
  "resultaten",
  "spreiding",
  "antwoorden",
  "uitnodigen",
  "exporteren",
];

/** De weergaven die niet los staan: Ze hebben Resultaten van dezelfde Meting nodig. */
const HANGT_AF_VAN_RESULTATEN: LeadWeergave[] = ["spreiding", "antwoorden", "exporteren"];

const isSamengesteld = (m: Pick<ScanUitvoering, "samenstelling">) => Array.isArray(m.samenstelling);

/** De sleutel van één vinkje: Respondent, weergave en Meting of benchmark. */
export function toegangSleutel(t: Pick<LeadToegang, "respondentId" | "weergave" | "metingId" | "benchmarkId">): string {
  return `${t.respondentId}::${t.weergave}::${t.weergave === "benchmark" ? (t.benchmarkId ?? "") : (t.metingId ?? "")}`;
}

export function leadToegangVan(org: Pick<Organisatie, "leadToegang">): LeadToegang[] {
  return org.leadToegang ?? [];
}

export function toegangVanLead(org: Pick<Organisatie, "leadToegang">, respondentId: string): LeadToegang[] {
  return leadToegangVan(org).filter((t) => t.respondentId === respondentId);
}

export function heeftMetingToegang(
  org: Pick<Organisatie, "leadToegang">,
  respondentId: string,
  weergave: Exclude<LeadWeergave, "benchmark">,
  metingId: string
): boolean {
  return leadToegangVan(org).some((t) => t.respondentId === respondentId && t.weergave === weergave && t.metingId === metingId);
}

export function heeftBenchmarkToegang(org: Pick<Organisatie, "leadToegang">, respondentId: string, benchmarkId: string): boolean {
  return leadToegangVan(org).some((t) => t.respondentId === respondentId && t.weergave === "benchmark" && t.benchmarkId === benchmarkId);
}

/** De Metingen waarvoor deze Lead minstens één weergave aan heeft, in de volgorde van de Metingen van de organisatie. */
export function metingenMetToegang(org: Pick<Organisatie, "leadToegang" | "scanUitvoeringen">, respondentId: string): ScanUitvoering[] {
  const ids = new Set(
    toegangVanLead(org, respondentId)
      .filter((t) => t.weergave !== "benchmark" && t.metingId)
      .map((t) => t.metingId as string)
  );
  return org.scanUitvoeringen.filter((m) => ids.has(m.id));
}

/** De Meting-id's waarvoor deze Lead een bepaalde weergave aan heeft. */
export function metingIdsMetWeergave(
  org: Pick<Organisatie, "leadToegang">,
  respondentId: string,
  weergave: Exclude<LeadWeergave, "benchmark">
): string[] {
  return toegangVanLead(org, respondentId)
    .filter((t) => t.weergave === weergave && t.metingId)
    .map((t) => t.metingId as string);
}

export function benchmarkIdsMetToegang(org: Pick<Organisatie, "leadToegang">, respondentId: string): string[] {
  return toegangVanLead(org, respondentId)
    .filter((t) => t.weergave === "benchmark" && t.benchmarkId)
    .map((t) => t.benchmarkId as string);
}

/** De Leads van een organisatie die deze weergave van deze Meting zien. */
export function leadsMetWeergave(
  org: Pick<Organisatie, "leadToegang" | "leden">,
  weergave: Exclude<LeadWeergave, "benchmark">,
  metingId: string
): OrganisatieLid[] {
  return org.leden.filter((l) => l.lead === true && heeftMetingToegang(org, l.id, weergave, metingId));
}

/** De Leads van een organisatie met minstens één weergave van deze Meting aan. */
export function leadsMetToegangTotMeting(org: Pick<Organisatie, "leadToegang" | "leden">, metingId: string): OrganisatieLid[] {
  return org.leden.filter(
    (l) => l.lead === true && toegangVanLead(org, l.id).some((t) => t.weergave !== "benchmark" && t.metingId === metingId)
  );
}

/** De Leads van een organisatie die deze benchmark zien. */
export function leadsMetBenchmark(org: Pick<Organisatie, "leadToegang" | "leden">, benchmarkId: string): OrganisatieLid[] {
  return org.leden.filter((l) => l.lead === true && heeftBenchmarkToegang(org, l.id, benchmarkId));
}

/** De samenvatting onder het vakje "Lead" in het Respondent-overzicht (`beheerpagina.md`, punt 6a). */
export function leadSamenvatting(org: Pick<Organisatie, "leadToegang">, lid: Pick<OrganisatieLid, "id" | "lead">): string {
  if (lid.lead !== true) return "Geen Lead";
  const n = toegangVanLead(org, lid.id).length;
  return n === 0 ? "Lead, ziet nog niets" : `Lead, ziet ${n} ${n === 1 ? "weergave" : "weergaven"}`;
}

/**
 * Of een benchmark nog geldig is voor deze organisatie: De benchmark bestaat, de organisatie doet mee (een lid) en het niveau
 * is "organisaties" of "metingen". Niveau 3 (scans) heeft geen kolom voor een Lead (`benchmark.md`, View voor een Lead).
 */
export function benchmarkGeldigVoorOrganisatie(benchmark: Benchmark | undefined, organisatieId: string): boolean {
  if (!benchmark) return false;
  if ((benchmark.niveau ?? "organisaties") === "scans") return false;
  return benchmark.leden.some((l) => l.organisatieId === organisatieId);
}

/**
 * Houdt de vinkjes kloppend (muteert de organisatie, geeft het aantal verwijderde vinkjes). Een vinkje valt weg als:
 * de Respondent geen Lead meer is of niet meer bestaat, de Meting niet meer bestaat, een samengestelde Meting iets anders dan
 * Resultaten heeft, Spreiding, Antwoorden of Exporteren zonder Resultaten staat, of (met `benchmarks`) de benchmark niet meer
 * bestaat, de organisatie er geen lid meer van is, of bij niveau 2 de Lead geen Resultaten meer heeft voor een lid-Meting.
 */
export function ruimLeadToegangOp(org: Organisatie, benchmarks?: Benchmark[]): number {
  const voor = leadToegangVan(org).length;
  if (voor === 0 && org.leadToegang === undefined) return 0;
  const leads = new Set(org.leden.filter((l) => l.lead === true).map((l) => l.id));
  const metingen = new Map(org.scanUitvoeringen.map((m) => [m.id, m]));
  const gezien = new Set<string>();
  let lijst = leadToegangVan(org).filter((t) => {
    if (!leads.has(t.respondentId)) return false;
    if (t.weergave === "benchmark") return !!t.benchmarkId;
    const m = t.metingId ? metingen.get(t.metingId) : undefined;
    if (!m) return false;
    if (isSamengesteld(m) && t.weergave !== "resultaten") return false;
    return true;
  });
  // Dubbele vinkjes tellen één keer.
  lijst = lijst.filter((t) => {
    const k = toegangSleutel(t);
    if (gezien.has(k)) return false;
    gezien.add(k);
    return true;
  });
  // Afhankelijk van Resultaten van dezelfde Meting.
  const resultaten = new Set(lijst.filter((t) => t.weergave === "resultaten").map((t) => `${t.respondentId}::${t.metingId}`));
  lijst = lijst.filter((t) => !HANGT_AF_VAN_RESULTATEN.includes(t.weergave) || resultaten.has(`${t.respondentId}::${t.metingId}`));
  if (benchmarks) {
    const perId = new Map(benchmarks.map((b) => [b.id, b]));
    lijst = lijst.filter((t) => {
      if (t.weergave !== "benchmark") return true;
      const b = perId.get(t.benchmarkId as string);
      if (!benchmarkGeldigVoorOrganisatie(b, org.id)) return false;
      if ((b!.niveau ?? "organisaties") === "metingen") {
        // Niveau 2: De vergelijking is van Metingen, dus de Lead heeft Resultaten nodig op minstens twee lid-Metingen van deze
        // benchmark: Met minder is er niets te vergelijken (`benchmark.md`, View voor een Lead).
        return (
          b!.leden.filter((l) => l.organisatieId === org.id && resultaten.has(`${t.respondentId}::${l.metingId}`)).length >=
          MIN_LEDEN_VERGELIJKING
        );
      }
      return true;
    });
  }
  org.leadToegang = lijst;
  return voor - lijst.length;
}

/* ---------- De cellen van het Leads-venster ---------- */

export interface LeadDrempels {
  /** `benchmarkMinRespondenten`: Het minimale aantal afgeronde scans in een Meting voor Spreiding en anonieme Antwoorden. */
  minRespondenten: number;
}

/**
 * Is een cel van het Leads-venster grijs, en waarom (`beheerpagina.md`, punt 6a, Grijze cellen)? `resultatenAan` is de (concept)stand
 * van Resultaten van dezelfde Meting voor deze Lead. Geeft `null` als de cel aan te vinken is, anders de reden voor het
 * Info-icoon `info.leadToegangCel`.
 */
export function metingCelReden(opts: {
  weergave: Exclude<LeadWeergave, "benchmark">;
  meting: Pick<ScanUitvoering, "samenstelling">;
  resultatenAan: boolean;
  afgerondeScans: number;
  antwoordenMetNamen: boolean;
  drempels: LeadDrempels;
  /**
   * Is de weergave voor het Assessment van deze Meting uitgewerkt? Niet bij Ja / Nee / Weet ik niet: Daar is alleen
   * Uitnodigen beschikbaar (`backlog.md`, Quickscan Ziekenhuis). Standaard ja.
   */
  ondersteund?: boolean;
}): string | null {
  const { weergave, meting, resultatenAan, afgerondeScans, antwoordenMetNamen, drempels, ondersteund = true } = opts;
  if (!ondersteund && weergave !== "uitnodigen") {
    return "Deze weergave is nog niet beschikbaar voor een Assessment met Ja / Nee / Weet ik niet.";
  }
  if (weergave === "resultaten") return null;
  if (weergave === "uitnodigen") {
    return isSamengesteld(meting) ? "Een samengestelde Meting heeft geen Respondenten om uit te nodigen." : null;
  }
  if (isSamengesteld(meting)) return "Een samengestelde Meting heeft alleen Resultaten.";
  if (!resultatenAan) return "Zet eerst Resultaten van deze Meting aan.";
  if (weergave === "spreiding" && afgerondeScans < drempels.minRespondenten) {
    return `Deze Meting heeft ${afgerondeScans} afgeronde ${afgerondeScans === 1 ? "scan" : "scans"}. Spreiding is er pas vanaf ${drempels.minRespondenten}, anders is een scan te herleiden naar een persoon.`;
  }
  if (weergave === "antwoorden" && !antwoordenMetNamen && afgerondeScans < drempels.minRespondenten) {
    return `Antwoorden zijn hier anoniem en deze Meting heeft ${afgerondeScans} afgeronde ${afgerondeScans === 1 ? "scan" : "scans"}. Dat kan pas vanaf ${drempels.minRespondenten}, anders zijn de antwoorden te herleiden naar een persoon.`;
  }
  return null;
}

/**
 * De reden waarom een benchmarkkolom grijs is, of `null`. `voldoetAanDrempel`: Op niveau 1 voldoet minstens één Assessment van
 * de benchmark aan `benchmarkMinOrganisaties` (`benchmark.md`, Drempels). `aantalLidMetingenMetResultaten` geldt alleen voor
 * niveau 2: Minder dan twee betekent dat er niets te vergelijken is.
 */
export function benchmarkCelReden(opts: {
  niveau: "organisaties" | "metingen";
  voldoetAanDrempel: boolean;
  aantalLidMetingenMetResultaten: number;
}): string | null {
  if (opts.niveau === "organisaties" && !opts.voldoetAanDrempel) {
    return "Geen enkel Assessment in deze benchmark heeft een groep die groot genoeg is om anoniem te blijven.";
  }
  if (opts.niveau === "metingen" && opts.aantalLidMetingenMetResultaten < MIN_LEDEN_VERGELIJKING) {
    return "Deze vergelijking gaat over Metingen: Zet eerst Resultaten aan voor minstens twee Metingen in deze benchmark.";
  }
  return null;
}

/* ---------- De overgang van het bereik van een Lead ---------- */

/**
 * Zet het bereik van een Lead van vóór 14 oktober 2026 om in vinkjes (`beheerpagina.md`, punt 6a, Overgang): Een Lead met
 * `leadMetingIds` krijgt Resultaten, Uitnodigen en Exporteren voor die Metingen, een Lead met `leadVoorOrganisatie` die drie voor
 * alle Metingen die nu bestaan en niet voor latere. Een samengestelde Meting krijgt alleen Resultaten. De Admin krijgt een melding
 * als er een Lead voor de hele organisatie was. Muteert de organisatie en laat de oude velden vallen. Idempotent.
 */
export function zetLegacyBereikOm(org: Organisatie): void {
  const nu = new Date().toISOString();
  let hele = 0;
  const extra: LeadToegang[] = [];
  for (const lid of org.leden) {
    const heeftBereik = lid.leadVoorOrganisatie === true || (lid.leadMetingIds?.length ?? 0) > 0;
    if (!heeftBereik && lid.leadMetingIds === undefined && lid.leadVoorOrganisatie === undefined) continue;
    if (heeftBereik) {
      lid.lead = true;
      const ids =
        lid.leadVoorOrganisatie === true ? org.scanUitvoeringen.map((m) => m.id) : (lid.leadMetingIds ?? []);
      if (lid.leadVoorOrganisatie === true) hele += 1;
      for (const id of ids) {
        const m = org.scanUitvoeringen.find((x) => x.id === id);
        if (!m) continue;
        const weergaven: LeadWeergave[] = isSamengesteld(m) ? ["resultaten"] : ["resultaten", "uitnodigen", "exporteren"];
        for (const weergave of weergaven) {
          extra.push({ respondentId: lid.id, weergave, metingId: id, toegekendDoor: "systeem", toegekendOp: nu });
        }
      }
    }
    delete lid.leadMetingIds;
    delete lid.leadVoorOrganisatie;
  }
  if (extra.length > 0) {
    const bestaand = new Set(leadToegangVan(org).map(toegangSleutel));
    org.leadToegang = [...leadToegangVan(org), ...extra.filter((t) => !bestaand.has(toegangSleutel(t)))];
  }
  if (hele > 0) {
    const tekst = `${hele} ${hele === 1 ? "Lead was" : "Leads waren"} Lead voor de hele organisatie. Dat bereik bestaat niet meer: Resultaten, Uitnodigen en Exporteren staan nu aan voor de Metingen die er nu zijn, niet voor latere. Controleer het Leads-venster.`;
    org.leadOvergangMelding = org.leadOvergangMelding ? `${org.leadOvergangMelding} ${tekst}` : tekst;
  }
}
