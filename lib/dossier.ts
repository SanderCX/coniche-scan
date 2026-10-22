/**
 * Het Dossier van een Organisatie (`dossier.md`, `datamodel.md`, Dossieritem): De regels voor de velden, de status van een item, de
 * volgorde en wat een Lead ziet. Pure functies zonder opslag.
 *
 * Wat een Lead ziet, komt uit `leadDossier`. Dat geeft een eigen vorm terug zonder `caseOrganisatieId` en zonder naam van de Organisatie in
 * de Case, zodat die gegevens niet in de schermen van de Lead kunnen komen (`dossier.md`, Wat de Lead ziet). In het prototype staat alle
 * data in de browser; met de database wordt dit aan de serverkant bepaald.
 */
import type { Assessment, Benchmark, Dossier, Dossieritem, Kanaal, KpiDefinitie, Organisatie, OrganisatieLid, ToonProfiel } from "./types";
import { OrganisatieProfiel, PROFIEL_BLOKKEN, ProfielBlok, organisatieProfiel } from "./organisatie-profiel";
import { KpiRingInvoer, kpiRingInvoer, kpiRingInvoerVoorLead } from "./kpi-ringen";
import { organisatieVelden } from "@/data/organisatie-velden";
import { KorteNamen, SECTOR_VELD_ID, korteNaamWaarde } from "./korte-namen";
import { Controle, normaliseerUrl, schoon } from "./contactpersonen";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";
import { classificatie } from "./scoring";
import { benchmarkGeldigVoorOrganisatie, heeftBenchmarkToegang, leadsMetBenchmark } from "./lead-toegang";

export const TITEL_MAX = 200;
export const TOELICHTING_MAX = 400;
export const SAMENVATTING_MAX = 600;
export const BRON_MAX = 80;
export const OMVANG_MAX = 40;
export const TOT_RESULTAAT_MAX = 40;

export const PLAATS_MAX = 80;

/** De naam van het Dossier bij de Lead: Hoogstens 80 tekens (`dossier.md`, Naam en scorebron). */
export const NAAM_VOOR_LEAD_MAX = 80;

/** De standaardnaam van het Dossier bij de Lead: "Dossier {Organisatie}". */
export function standaardNaamVoorLead(organisatieNaam: string): string {
  return `Dossier ${organisatieNaam}`;
}

/** De naam van het Dossier bij de Lead: De eigen naam, of "Dossier {Organisatie}" zolang er geen is (`dossier.md`, Naam en scorebron). */
export function naamVoorLeadVan(organisatie: Pick<Organisatie, "naam" | "dossier">): string {
  const eigen = organisatie.dossier?.naamVoorLead?.trim();
  return eigen || standaardNaamVoorLead(organisatie.naam);
}

/** Controleert een nieuwe naam voor de Lead: Getrimd, hoogstens 80 tekens. Leeg is toegestaan (dan geldt de standaardnaam). */
export function controleerNaamVoorLead(invoer: string): Controle<string> {
  const naam = invoer.trim();
  if (naam.length > NAAM_VOOR_LEAD_MAX) return { ok: false, reden: `De naam mag hoogstens ${NAAM_VOOR_LEAD_MAX} tekens hebben.` };
  return { ok: true, waarde: naam };
}
/** Het Assessment waarvan de bouwblokken als eerste aan een item gekoppeld kunnen worden (`dossier.md`, Koppeling aan bouwblokken). */
export const DOSSIER_ASSESSMENT_ID = "klantcontact-volwassenheid";

/**
 * De Assessments waarvan de bouwblokken (en de AI-domeinen) aan een item gekoppeld kunnen worden, in de volgorde van de pillen (`dossier.md`,
 * Koppeling aan bouwblokken, besloten door Joost op 21 oktober 2026): De Klantcontact Volwassenheidsscan en de AI-scan. Een bouwblok van
 * een ander Assessment is niet te kiezen.
 */
export const DOSSIER_ASSESSMENT_IDS = ["klantcontact-volwassenheid", "ai-volwassenheid"] as const;

export type DossierSoort = Dossieritem["soort"];

export const DOSSIER_SOORTEN: DossierSoort[] = ["case", "benchmark", "nieuws", "event", "blog"];

/** Alle blokken van het profiel uit: De beginstand van `Dossier.toonProfiel` (`dossier.md`, Profiel van de Organisatie). */
export function geenProfiel(): ToonProfiel {
  return { cijfers: false, kanalen: false, techstack: false, overig: false, kpis: false };
}

export function leegDossier(): Dossier {
  return { zichtbaar: false, zichtbaarSinds: null, naamVoorLead: "", toonProfiel: geenProfiel(), radarBronnen: [], gewijzigdOp: null, items: [] };
}

/** Het Dossier van een Organisatie, of een leeg en dicht Dossier bij data van vóór het Dossier. */
export function dossierVan(organisatie: Pick<Organisatie, "dossier">): Dossier {
  return organisatie.dossier ?? leegDossier();
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

/** Een datum als jjjj-mm-dd die bestaat. */
function geldigeDatum(d: string): boolean {
  return DATUM.test(d) && !Number.isNaN(Date.parse(d));
}

/** Vandaag als jjjj-mm-dd, in de lokale tijd. */
export function vandaag(nu: Date = new Date()): string {
  const m = String(nu.getMonth() + 1).padStart(2, "0");
  const d = String(nu.getDate()).padStart(2, "0");
  return `${nu.getFullYear()}-${m}-${d}`;
}

/** Een Event is verlopen vanaf de dag na `einddatum`, of na `datum` als er geen einddatum is (`dossier.md`, Regels). Andere soorten verlopen niet. */
export function isVerlopen(item: Pick<Dossieritem, "soort" | "datum" | "einddatum">, nu: Date = new Date()): boolean {
  if (item.soort !== "event" || !item.datum) return false;
  return (item.einddatum || item.datum) < vandaag(nu);
}

export interface DossierInvoer {
  soort: DossierSoort;
  titel: string;
  toelichting: string;
  url: string;
  bouwblokIds: string[];
  zichtbaarVoorLead: boolean;
  bron: string;
  gepubliceerdOp: string;
  datum: string;
  einddatum: string;
  plaats: string;
  samenvatting: string;
  caseOrganisatieId: string | null;
  omvang: string;
  totResultaat: string;
  benchmarkId: string | null;
}

/** Een lege invoer voor een nieuw item van dit soort. */
export function leegDossierInvoer(soort: DossierSoort): DossierInvoer {
  return {
    soort,
    titel: "",
    toelichting: "",
    url: "",
    bouwblokIds: [],
    zichtbaarVoorLead: false,
    bron: "",
    gepubliceerdOp: "",
    datum: "",
    einddatum: "",
    plaats: "",
    samenvatting: "",
    caseOrganisatieId: null,
    omvang: "",
    totResultaat: "",
    benchmarkId: null,
  };
}

/** De invoer van een bestaand item, voor het formulier. */
export function invoerVanItem(item: Dossieritem): DossierInvoer {
  const { id: _id, aangemaaktOp: _a, gewijzigdOp: _g, ...invoer } = item;
  void _id; void _a; void _g;
  return invoer;
}

/**
 * De invoer van een item controleren en schoonmaken (`dossier.md`, Regels). Een Nieuws- of Blogitem heeft een titel en een geldig adres nodig, een
 * Event een titel en een datum (met een optionele einddatum die niet voor de datum ligt), een Case een titel, een samenvatting en een
 * Organisatie in de case (die niet de eigen Organisatie is). Velden van de andere soorten worden leeg bewaard. Of het item open mag staan, hangt af van de Afspraak en de Sector van de Organisatie in de case: Dat controleert
 * `kanOpenZetten`, omdat het van andere Organisaties afhangt.
 */
export function controleerDossieritem(invoer: DossierInvoer, eigenOrganisatieId: string, benchmarkKeuze?: BenchmarkKeuze): Controle<DossierInvoer> {
  if (invoer.soort === "benchmark") return controleerBenchmarkItem(invoer, benchmarkKeuze);
  const titel = schoon(invoer.titel);
  if (!titel) return { ok: false, reden: "Vul een titel in." };
  if (titel.length > TITEL_MAX) return { ok: false, reden: `De titel mag maximaal ${TITEL_MAX} tekens hebben.` };
  const toelichting = invoer.toelichting.trim();
  if (toelichting.length > TOELICHTING_MAX) return { ok: false, reden: `De toelichting mag maximaal ${TOELICHTING_MAX} tekens hebben.` };
  const bouwblokIds = [...new Set(invoer.bouwblokIds)];

  let url = "";
  if (invoer.url.trim()) {
    const genormaliseerd = normaliseerUrl(invoer.url);
    if (!genormaliseerd) return { ok: false, reden: "Dit is geen geldig webadres." };
    url = genormaliseerd;
  } else if (invoer.soort === "nieuws") {
    return { ok: false, reden: "Vul het adres van het artikel in." };
  } else if (invoer.soort === "blog") {
    return { ok: false, reden: "Vul het adres van de blog in." };
  }

  const basis = { ...leegDossierInvoer(invoer.soort), soort: invoer.soort, titel, toelichting, url, bouwblokIds, zichtbaarVoorLead: invoer.zichtbaarVoorLead };

  if (invoer.soort === "event") {
    const datum = invoer.datum.trim();
    if (!datum) return { ok: false, reden: "Vul de datum in." };
    if (!geldigeDatum(datum)) return { ok: false, reden: "De datum klopt niet." };
    const einddatum = invoer.einddatum.trim();
    if (einddatum && !geldigeDatum(einddatum)) return { ok: false, reden: "De einddatum klopt niet." };
    if (einddatum && einddatum < datum) return { ok: false, reden: "De einddatum ligt voor de datum." };
    const plaats = schoon(invoer.plaats);
    if (plaats.length > PLAATS_MAX) return { ok: false, reden: `De plaats mag maximaal ${PLAATS_MAX} tekens hebben.` };
    return { ok: true, waarde: { ...basis, datum, einddatum, plaats } };
  }

  if (invoer.soort === "nieuws" || invoer.soort === "blog") {
    const bron = schoon(invoer.bron);
    if (bron.length > BRON_MAX) return { ok: false, reden: `De bron mag maximaal ${BRON_MAX} tekens hebben.` };
    const gepubliceerdOp = invoer.gepubliceerdOp.trim();
    if (gepubliceerdOp && !geldigeDatum(gepubliceerdOp)) {
      return { ok: false, reden: "De datum klopt niet." };
    }
    return { ok: true, waarde: { ...basis, bron, gepubliceerdOp } };
  }

  const samenvatting = invoer.samenvatting.trim();
  if (!samenvatting) return { ok: false, reden: "Vul een samenvatting in." };
  if (samenvatting.length > SAMENVATTING_MAX) return { ok: false, reden: `De samenvatting mag maximaal ${SAMENVATTING_MAX} tekens hebben.` };
  if (!invoer.caseOrganisatieId) return { ok: false, reden: "Kies de organisatie in de case." };
  if (invoer.caseOrganisatieId === eigenOrganisatieId) return { ok: false, reden: "Een case verwijst niet naar de eigen organisatie." };
  const omvang = schoon(invoer.omvang);
  if (omvang.length > OMVANG_MAX) return { ok: false, reden: `De omvang mag maximaal ${OMVANG_MAX} tekens hebben.` };
  const totResultaat = schoon(invoer.totResultaat);
  if (totResultaat.length > TOT_RESULTAAT_MAX) return { ok: false, reden: `Tot resultaat mag maximaal ${TOT_RESULTAAT_MAX} tekens hebben.` };
  return { ok: true, waarde: { ...basis, samenvatting, caseOrganisatieId: invoer.caseOrganisatieId, omvang, totResultaat } };
}

/**
 * De keuze voor een item van soort Benchmark: De benchmarks waaruit gekozen kan worden (die de Organisatie van het Dossier bevatten) en de
 * benchmarks die al in het Dossier staan, zonder het item dat nu bewerkt wordt (`dossier.md`, Regels, Soort Benchmark).
 */
export interface BenchmarkKeuze {
  kiesbaar: Pick<Benchmark, "id">[];
  alInDossier: string[];
}

/**
 * Een item van soort Benchmark controleren (`dossier.md`, Regels, Soort Benchmark): Een benchmark is verplicht, er is geen eigen titel en geen eigen
 * link (de titel is de naam van de benchmark en de link volgt uit `benchmarkId`). Dezelfde benchmark staat hoogstens één keer in een Dossier.
 * Zonder `keuze` wordt alleen gecontroleerd of er een benchmark is gekozen.
 */
function controleerBenchmarkItem(invoer: DossierInvoer, keuze?: BenchmarkKeuze): Controle<DossierInvoer> {
  const toelichting = invoer.toelichting.trim();
  if (toelichting.length > TOELICHTING_MAX) return { ok: false, reden: `De toelichting mag maximaal ${TOELICHTING_MAX} tekens hebben.` };
  if (!invoer.benchmarkId) return { ok: false, reden: "Kies een benchmark." };
  if (keuze) {
    if (!keuze.kiesbaar.some((b) => b.id === invoer.benchmarkId)) return { ok: false, reden: "Deze benchmark is niet te kiezen: De organisatie doet er niet aan mee." };
    if (keuze.alInDossier.includes(invoer.benchmarkId)) return { ok: false, reden: "Deze benchmark staat al in het Dossier." };
  }
  return {
    ok: true,
    waarde: {
      ...leegDossierInvoer("benchmark"),
      toelichting,
      bouwblokIds: [...new Set(invoer.bouwblokIds)],
      zichtbaarVoorLead: invoer.zichtbaarVoorLead,
      benchmarkId: invoer.benchmarkId,
    },
  };
}

/**
 * De benchmarks waaruit een Consultant kiest bij een Benchmark-item: Alleen die waarin de Organisatie zit (bij een Verkenning: waarvan de uitkomst haar
 * bevat). De benchmarks moeten hun leden hebben (`getBenchmarksMetLeden`). Op alfabet. Een benchmark die per scan vergelijkt (niveau 3) heeft geen
 * view voor een Lead en valt dus af (`benchmarkGeldigVoorOrganisatie`).
 */
export function benchmarksVoorDossier(benchmarks: Benchmark[], organisatieId: string): Benchmark[] {
  return benchmarks.filter((b) => benchmarkGeldigVoorOrganisatie(b, organisatieId)).sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
}

/** Het aantal organisaties in een benchmark (bij een benchmark binnen een organisatie is dat altijd 1). */
export function aantalOrganisatiesInBenchmark(benchmark: Pick<Benchmark, "leden">): number {
  return new Set(benchmark.leden.map((l) => l.organisatieId)).size;
}

/** De regel onder de naam van een benchmark: "{Assessment}, {n} organisaties, {k} van {m} Leads hebben toegang" (`dossier.md`, Scherm 1, Rijen). */
export function benchmarkRijRegel(benchmark: Benchmark | undefined, assessments: Pick<Assessment, "id" | "naam">[], organisatie: Pick<Organisatie, "leden" | "leadToegang">): string {
  if (!benchmark) return "";
  const namen = benchmark.assessmentIds.map((id) => assessments.find((a) => a.id === id)?.naam).filter((n): n is string => !!n).join(", ");
  const leads = organisatie.leden.filter((l) => l.lead === true).length;
  const metToegang = leadsMetBenchmark(organisatie, benchmark.id).length;
  const n = aantalOrganisatiesInBenchmark(benchmark);
  const delen = [namen, `${n} ${n === 1 ? "organisatie" : "organisaties"}`, metToegang === 0 ? "geen Lead heeft toegang" : `${metToegang} van ${leads} Leads hebben toegang`];
  return delen.filter(Boolean).join(", ");
}

/** De regel op de pagina van de Lead: "Vergelijking van {n} organisaties, {Assessment}" (het aantal valt weg onder `benchmarkMinOrganisaties`), of van Metingen. */
export function benchmarkLeadRegel(benchmark: Benchmark, assessments: Pick<Assessment, "id" | "naam">[], minOrganisaties: number): string {
  const namen = benchmark.assessmentIds.map((id) => assessments.find((a) => a.id === id)?.naam).filter((n): n is string => !!n).join(", ");
  if ((benchmark.niveau ?? "organisaties") === "metingen") return `Vergelijking van Metingen, ${namen}`;
  const n = aantalOrganisatiesInBenchmark(benchmark);
  return n >= minOrganisaties ? `Vergelijking van ${n} organisaties, ${namen}` : `Vergelijking, ${namen}`;
}

/** De Sector van een Organisatie (`sbi-indeling.md`), leeg als die niet is ingevuld. */
function sectorVan(organisatie: Pick<Organisatie, "kenmerken">): string {
  let huidig: unknown = organisatie.kenmerken;
  for (const sleutel of SECTOR_VELD_ID.split(".")) {
    if (huidig === null || typeof huidig !== "object") return "";
    huidig = (huidig as Record<string, unknown>)[sleutel];
  }
  return typeof huidig === "string" ? huidig.trim() : "";
}

/**
 * De branche van een Case (`dossier.md`, Regels): De korte naam van de Sector uit de Kenmerken van de Organisatie in de case. Niet te
 * bewerken. Leeg als die Organisatie geen Sector heeft.
 */
export function brancheVan(organisatie: Pick<Organisatie, "kenmerken"> | undefined, korteNamen?: KorteNamen): string {
  if (!organisatie) return "";
  const sector = sectorVan(organisatie);
  return sector ? korteNaamWaarde(korteNamen, SECTOR_VELD_ID, sector) : "";
}

/**
 * Of een item open mag staan voor de Lead: Alleen een Case heeft voorwaarden (`dossier.md`, Regels en Scherm 3). De Organisatie in de case
 * moet bestaan, de Afspraak "Mag als case gebruikt worden" hebben en een Sector. `null` als het mag, anders de reden.
 */
export function kanOpenZetten(
  invoer: Pick<DossierInvoer, "soort" | "caseOrganisatieId">,
  caseOrganisatie: Pick<Organisatie, "naam" | "kenmerken" | "caseToegestaan"> | undefined
): string | null {
  if (invoer.soort !== "case") return null;
  if (!invoer.caseOrganisatieId || !caseOrganisatie) return "Kies de organisatie in de case.";
  if (caseOrganisatie.caseToegestaan !== true) return "Zonder toestemming van de organisatie in de case kan een case niet zichtbaar worden.";
  if (!sectorVan(caseOrganisatie)) return `Vul de Sector in bij de Kenmerken van ${caseOrganisatie.naam}.`;
  return null;
}

export type DossierStatus = "zichtbaar" | "intern" | "verlopen" | "toestemming-ontbreekt" | "kies-organisatie" | "geen-toegang" | "kies-benchmark";

/** De benchmarks en de Organisatie die nodig zijn om de status van een Benchmark-item te bepalen (bestaat de benchmark nog, heeft een Lead toegang). */
export interface BenchmarkContext {
  benchmarks: Pick<Benchmark, "id">[];
  organisatie: Pick<Organisatie, "leden" | "leadToegang">;
}

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  zichtbaar: "Zichtbaar voor Lead",
  intern: "Intern",
  verlopen: "Verlopen",
  "toestemming-ontbreekt": "Toestemming ontbreekt",
  "kies-organisatie": "Kies een organisatie",
  "geen-toegang": "Geen toegang voor Lead",
  "kies-benchmark": "Kies een benchmark",
};

/**
 * De status van een item voor de Consultant (`dossier.md`, Scherm 1): "Kies een organisatie" bij een Case zonder Organisatie,
 * "Toestemming ontbreekt" bij een Case waarvan de Organisatie de Afspraak niet (meer) heeft, ook als het item op Zichtbaar voor Lead
 * stond, "Verlopen" bij een Event waarvan de datum voorbij is, anders "Zichtbaar voor Lead" of "Intern".
 */
export function itemStatus(
  item: Dossieritem,
  alle: Pick<Organisatie, "id" | "caseToegestaan">[],
  nu: Date = new Date(),
  benchmarkContext?: BenchmarkContext
): DossierStatus {
  if (isVerlopen(item, nu)) return "verlopen";
  if (item.soort === "benchmark") {
    // Zonder benchmarks (de context) is niet te zien of de benchmark nog bestaat of een Lead er toegang toe heeft.
    if (!item.benchmarkId) return "kies-benchmark";
    if (benchmarkContext) {
      if (!benchmarkContext.benchmarks.some((b) => b.id === item.benchmarkId)) return "kies-benchmark";
      if (item.zichtbaarVoorLead && leadsMetBenchmark(benchmarkContext.organisatie, item.benchmarkId).length === 0) return "geen-toegang";
    }
  }
  if (item.soort === "case") {
    if (!item.caseOrganisatieId) return "kies-organisatie";
    const o = alle.find((x) => x.id === item.caseOrganisatieId);
    if (!o || o.caseToegestaan !== true) return "toestemming-ontbreekt";
  }
  return item.zichtbaarVoorLead ? "zichtbaar" : "intern";
}

/** Een datum jjjj-mm-dd of een tijdstip als "14 okt 2026". */
export function datumKort(d: string): string {
  const datum = new Date(d.length === 10 ? `${d}T00:00:00Z` : d);
  return Number.isNaN(datum.getTime()) ? d : datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Cases met de nieuwste bovenaan, op het moment van toevoegen (`dossier.md`, Regels, Volgorde). */
export function casesNieuwsteEerst<T extends Pick<Dossieritem, "soort" | "aangemaaktOp">>(lijst: T[]): T[] {
  return lijst.filter((i) => i.soort === "case").sort((a, b) => b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

/** Benchmarks met de nieuwste bovenaan, op het moment van toevoegen. */
export function benchmarksNieuwsteEerst<T extends Pick<Dossieritem, "soort" | "aangemaaktOp">>(lijst: T[]): T[] {
  return lijst.filter((i) => i.soort === "benchmark").sort((a, b) => b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

/** Nieuws met het nieuwste bovenaan: Op publicatiedatum, en zonder datum op het moment van toevoegen. */
export function nieuwsNieuwsteEerst<T extends Pick<Dossieritem, "soort" | "gepubliceerdOp" | "aangemaaktOp">>(lijst: T[]): T[] {
  const sleutel = (n: T) => n.gepubliceerdOp || n.aangemaaktOp.slice(0, 10);
  return lijst
    .filter((i) => i.soort === "nieuws")
    .sort((a, b) => sleutel(b).localeCompare(sleutel(a)) || b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

/** Events met het eerstvolgende bovenaan, daarna de verlopen events met het meest recente eerst (`dossier.md`, Regels, Volgorde). */
export function eventsInVolgorde<T extends Pick<Dossieritem, "soort" | "datum" | "einddatum" | "aangemaaktOp">>(lijst: T[], nu: Date = new Date()): T[] {
  const events = lijst.filter((i) => i.soort === "event");
  const komend = events.filter((e) => !isVerlopen(e, nu)).sort((a, b) => a.datum.localeCompare(b.datum) || a.aangemaaktOp.localeCompare(b.aangemaaktOp));
  const verlopen = events.filter((e) => isVerlopen(e, nu)).sort((a, b) => b.datum.localeCompare(a.datum) || b.aangemaaktOp.localeCompare(a.aangemaaktOp));
  return [...komend, ...verlopen];
}

/** Blogs met het nieuwste bovenaan, zoals Nieuws: Op publicatiedatum, en zonder datum op het moment van toevoegen. */
export function blogsNieuwsteEerst<T extends Pick<Dossieritem, "soort" | "gepubliceerdOp" | "aangemaaktOp">>(lijst: T[]): T[] {
  const sleutel = (n: T) => n.gepubliceerdOp || n.aangemaaktOp.slice(0, 10);
  return lijst
    .filter((i) => i.soort === "blog")
    .sort((a, b) => sleutel(b).localeCompare(sleutel(a)) || b.aangemaaktOp.localeCompare(a.aangemaaktOp));
}

/** Alle items voor de Consultant: Eerst de Cases, dan de Benchmarks, het Nieuws, de Events en de Blogs, elk in de eigen volgorde. */
export function itemsInVolgorde<T extends Dossieritem>(lijst: T[], nu: Date = new Date()): T[] {
  return [...casesNieuwsteEerst(lijst), ...benchmarksNieuwsteEerst(lijst), ...nieuwsNieuwsteEerst(lijst), ...eventsInVolgorde(lijst, nu), ...blogsNieuwsteEerst(lijst)];
}

/** Het aantal items per soort. Een verlopen Event telt mee (`dossier.md`, Scherm 1, Filter). */
export function aantallPerSoort(lijst: Pick<Dossieritem, "soort">[]): { alles: number; cases: number; benchmarks: number; nieuws: number; events: number; blogs: number } {
  const n = (soort: DossierSoort) => lijst.filter((i) => i.soort === soort).length;
  return { alles: lijst.length, cases: n("case"), benchmarks: n("benchmark"), nieuws: n("nieuws"), events: n("event"), blogs: n("blog") };
}

/** Het aantal items dat de Lead nu zou zien als het Dossier zichtbaar was (voor de bevestiging bij Zichtbaar voor Lead). */
export function aantalZichtbaarVoorLead(organisatie: Organisatie, alle: Organisatie[], nu: Date = new Date(), benchmarks?: Benchmark[]): number {
  // Een verlopen Event dat op Zichtbaar voor Lead staat, ziet de Lead onder "Eerdere events": Het telt dus mee.
  const context = benchmarks ? { benchmarks, organisatie } : undefined;
  return dossierVan(organisatie).items.filter((i) => {
    const status = itemStatus(i, alle, nu, context);
    return status === "zichtbaar" || (status === "verlopen" && i.zichtbaarVoorLead);
  }).length;
}

/** Het aantal Cases bij andere Organisaties dat naar deze Organisatie verwijst (voor de bevestigingen). */
export function casesDieVerwijzenNaar(organisatieIds: string[], alle: Pick<Organisatie, "id" | "dossier">[]): { aantal: number; organisaties: number } {
  const ids = new Set(organisatieIds);
  let aantal = 0;
  let organisaties = 0;
  for (const o of alle) {
    if (ids.has(o.id)) continue;
    const n = dossierVan(o).items.filter((i) => i.soort === "case" && i.caseOrganisatieId && ids.has(i.caseOrganisatieId)).length;
    aantal += n;
    if (n > 0) organisaties += 1;
  }
  return { aantal, organisaties };
}

/** Het aantal Cases bij andere Organisaties dat open staat of stond en naar deze Organisatie verwijst, voor de bevestiging bij het uitzetten van de Afspraak. */
export function zichtbareCasesDieVerwijzenNaar(organisatieId: string, alle: Pick<Organisatie, "id" | "dossier">[]): { aantal: number; organisaties: number } {
  let aantal = 0;
  let organisaties = 0;
  for (const o of alle) {
    if (o.id === organisatieId) continue;
    const n = dossierVan(o).items.filter((i) => i.soort === "case" && i.caseOrganisatieId === organisatieId && i.zichtbaarVoorLead).length;
    aantal += n;
    if (n > 0) organisaties += 1;
  }
  return { aantal, organisaties };
}

/* ---------- Wat de Lead ziet ---------- */

export interface LeadCase {
  id: string;
  titel: string;
  samenvatting: string;
  toelichting: string;
  /** De korte naam van de Sector van de Organisatie in de case. */
  branche: string;
  omvang: string;
  totResultaat: string;
  url: string;
  bouwblokIds: string[];
  aangemaaktOp: string;
}

/** Een Benchmark in het Dossier zoals de Lead hem ziet: De naam van de benchmark is de titel, de link volgt uit `benchmarkId`. */
export interface LeadBenchmark {
  id: string;
  /** `Benchmark.id`, voor de link naar de benchmarkpagina van de Lead. */
  benchmarkId: string;
  /** De naam van de benchmark. */
  titel: string;
  /** "Vergelijking van {n} organisaties, {Assessment}". */
  regel: string;
  toelichting: string;
  bouwblokIds: string[];
  aangemaaktOp: string;
}

export interface LeadNieuws {
  id: string;
  titel: string;
  toelichting: string;
  bron: string;
  gepubliceerdOp: string;
  url: string;
  bouwblokIds: string[];
  aangemaaktOp: string;
}

/** Een Blog heeft dezelfde velden als Nieuws. */
export type LeadBlog = LeadNieuws;

export interface LeadEvent {
  id: string;
  titel: string;
  toelichting: string;
  datum: string;
  einddatum: string;
  plaats: string;
  /** Optioneel: De aanmeldpagina. */
  url: string;
  bouwblokIds: string[];
  aangemaaktOp: string;
  /** Volgt uit de datum (`isVerlopen`) op het moment van laden. */
  verlopen: boolean;
}

/**
 * Het profiel van de eigen Organisatie zoals de Lead het ziet: Alleen de blokken die de Consultant aan zette en die gegevens hebben. De andere
 * blokken zijn leeg. Toegang, Afspraken en Contactpersonen zitten er nooit in (`dossier.md`, Profiel van de Organisatie).
 */
export interface LeadProfiel extends Pick<OrganisatieProfiel, "naam" | "letter" | "sector" | "subsector" | "cijfers" | "kanalen" | "techstack" | "overig"> {
  /** De KPI's van de hele Organisatie als ringen (`lib/kpi-ringen.ts`), leeg als dat blok uit staat. */
  kpis: KpiRingInvoer[];
  /** De blokken die de Lead ziet, in vaste volgorde. */
  blokken: ProfielBlok[];
}

export interface LeadDossier {
  organisatieNaam: string;
  /** Het profiel bovenaan, `null` als er geen blok aan staat of de blokken die aan staan leeg zijn. */
  profiel: LeadProfiel | null;
  /** De titel van het Dossier bij de Lead: De naam voor de Lead, of "Dossier {Organisatie}" (`dossier.md`, Naam en scorebron). */
  naam: string;
  zichtbaarSinds: string | null;
  gewijzigdOp: string | null;
  cases: LeadCase[];
  benchmarks: LeadBenchmark[];
  nieuws: LeadNieuws[];
  /** Eerst de komende events, daarna de verlopen (`eventsInVolgorde`). */
  events: LeadEvent[];
  blogs: LeadBlog[];
}

/**
 * Wat nodig is om te bepalen welke Benchmarks deze Lead ziet (`dossier.md`, Wat de Lead ziet, voorwaarde 5): De Lead zelf, de benchmarks (met hun
 * leden) en de Assessments voor de regel. Zonder deze context ziet de Lead geen Benchmark-items.
 */
export interface LeadContext {
  leadId: string;
  benchmarks: Benchmark[];
  assessments: Pick<Assessment, "id" | "naam">[];
  /** `benchmarkMinOrganisaties`: Onder dit aantal staat het aantal organisaties niet in de regel. */
  minOrganisaties: number;
  /** De kanalen (`Instellingen.kanalen`) voor het blok Kanalen van het profiel. Zonder staat dat blok leeg. */
  kanalen?: Kanaal[];
  /** De KPI-definities (`Instellingen.kpiDefinities`) voor het blok KPI's van het profiel. Zonder staat dat blok leeg. */
  kpiDefinities?: KpiDefinitie[];
}

/**
 * Het Dossier zoals een Lead het ziet (`dossier.md`, Wat de Lead ziet): `null` als het Dossier niet zichtbaar is of er geen enkel item
 * zichtbaar is. Een item is zichtbaar als `zichtbaar` aan staat, het item op Zichtbaar voor Lead staat en, bij een Case, de
 * Organisatie in de case de Afspraak heeft en een Sector (de branche). De Case heeft in dit resultaat geen Organisatie-id en geen naam. Een
 * Event of Blog heeft geen toestemming van een andere Organisatie nodig.
 */
export function leadDossier(organisatie: Organisatie, alle: Organisatie[], korteNamen?: KorteNamen, nu: Date = new Date(), lead?: LeadContext): LeadDossier | null {
  const dossier = dossierVan(organisatie);
  if (!dossier.zichtbaar) return null;
  const zichtbaar = dossier.items.filter((i) => i.zichtbaarVoorLead);
  const cases: LeadCase[] = casesNieuwsteEerst(zichtbaar).flatMap((i) => {
    const o = alle.find((x) => x.id === i.caseOrganisatieId);
    if (!o || o.caseToegestaan !== true) return [];
    const branche = brancheVan(o, korteNamen);
    if (!branche) return [];
    return [
      {
        id: i.id,
        titel: i.titel,
        samenvatting: i.samenvatting,
        toelichting: i.toelichting,
        branche,
        omvang: i.omvang,
        totResultaat: i.totResultaat,
        url: i.url,
        bouwblokIds: i.bouwblokIds,
        aangemaaktOp: i.aangemaaktOp,
      },
    ];
  });
  // Een Benchmark ziet deze Lead alleen met zijn eigen vinkje voor die benchmark, en zolang de Organisatie nog in de benchmark zit.
  const benchmarks: LeadBenchmark[] = benchmarksNieuwsteEerst(zichtbaar).flatMap((i) => {
    if (!lead || !i.benchmarkId) return [];
    const benchmark = lead.benchmarks.find((b) => b.id === i.benchmarkId);
    if (!benchmark || !benchmarkGeldigVoorOrganisatie(benchmark, organisatie.id)) return [];
    if (!heeftBenchmarkToegang(organisatie, lead.leadId, benchmark.id)) return [];
    return [
      {
        id: i.id,
        benchmarkId: benchmark.id,
        titel: benchmark.naam,
        regel: benchmarkLeadRegel(benchmark, lead.assessments, lead.minOrganisaties),
        toelichting: i.toelichting,
        bouwblokIds: i.bouwblokIds,
        aangemaaktOp: i.aangemaaktOp,
      },
    ];
  });
  const artikel = (i: Dossieritem): LeadNieuws => ({
    id: i.id,
    titel: i.titel,
    toelichting: i.toelichting,
    bron: i.bron,
    gepubliceerdOp: i.gepubliceerdOp,
    url: i.url,
    bouwblokIds: i.bouwblokIds,
    aangemaaktOp: i.aangemaaktOp,
  });
  const nieuws: LeadNieuws[] = nieuwsNieuwsteEerst(zichtbaar).map(artikel);
  const blogs: LeadBlog[] = blogsNieuwsteEerst(zichtbaar).map(artikel);
  const events: LeadEvent[] = eventsInVolgorde(zichtbaar, nu).map((i) => ({
    id: i.id,
    titel: i.titel,
    toelichting: i.toelichting,
    datum: i.datum,
    einddatum: i.einddatum,
    plaats: i.plaats,
    url: i.url,
    bouwblokIds: i.bouwblokIds,
    aangemaaktOp: i.aangemaaktOp,
    verlopen: isVerlopen(i, nu),
  }));
  if (cases.length + benchmarks.length + nieuws.length + events.length + blogs.length === 0) return null;
  return {
    organisatieNaam: organisatie.naam,
    profiel: leadProfiel(organisatie, korteNamen, lead?.kanalen ?? [], lead?.kpiDefinities ?? []),
    naam: naamVoorLeadVan(organisatie),
    zichtbaarSinds: dossier.zichtbaarSinds,
    gewijzigdOp: dossier.gewijzigdOp,
    cases,
    benchmarks,
    nieuws,
    events,
    blogs,
  };
}

/**
 * Het profiel dat de Lead bovenaan het Dossier ziet (`dossier.md`, Wat de Lead ziet, Profiel): Alleen de eigen Organisatie en alleen de blokken van
 * `toonProfiel` die gegevens hebben. De blokken die uit staan, gaan nooit mee naar de Lead. `null` als er niets te tonen is.
 */
export function leadProfiel(organisatie: Organisatie, korteNamen: KorteNamen | undefined, kanalen: Kanaal[], kpiDefinities: KpiDefinitie[] = []): LeadProfiel | null {
  const toon = dossierVan(organisatie).toonProfiel ?? geenProfiel();
  if (!PROFIEL_BLOKKEN.some((b) => toon[b])) return null;
  const volledig = organisatieProfiel(organisatie, { kanalen, techstackVeld: organisatieVelden.find((v) => v.id === "techstack"), korteNamen });
  // De KPI's van de hele Organisatie (nooit van een Onderdeel); de waarden per kanaal alleen als ook het blok Kanalen aan staat.
  const kpis = toon.kpis ? kpiRingInvoerVoorLead(kpiRingInvoer(organisatie, kpiDefinities, { onderdeelId: null, metKanalen: toon.kanalen })) : [];
  const heeft = (b: ProfielBlok) => (b === "kpis" ? kpis.length > 0 : volledig[b].length > 0);
  const blokken = PROFIEL_BLOKKEN.filter((b) => toon[b] && heeft(b));
  if (blokken.length === 0) return null;
  // Een kanaal is te kiezen voor de ringen als beide blokken aan staan en het kanaal ingezet is (`dossier.md`, KPI-ringen, Kanaal kiezen).
  const kanaalKeuze = blokken.includes("kpis") && blokken.includes("kanalen");
  return {
    naam: volledig.naam,
    letter: volledig.letter,
    sector: volledig.sector,
    subsector: volledig.subsector,
    cijfers: blokken.includes("cijfers") ? volledig.cijfers : [],
    kanalen: blokken.includes("kanalen") ? volledig.kanalen.map((k) => ({ ...k, klikbaar: kanaalKeuze && k.ingezet })) : [],
    techstack: blokken.includes("techstack") ? volledig.techstack : [],
    overig: blokken.includes("overig") ? volledig.overig : [],
    kpis: blokken.includes("kpis") ? kpis : [],
    blokken,
  };
}

/** Of de kaart Dossier de tag "Nieuw" krijgt: Zolang de Lead de pagina niet heeft geopend na de laatste wijziging. */
export function isNieuwVoorLead(lid: Pick<OrganisatieLid, "dossierGezienOp">, dossier: Pick<Dossier, "gewijzigdOp" | "zichtbaarSinds">): boolean {
  if (!lid.dossierGezienOp) return true;
  const laatste = [dossier.gewijzigdOp, dossier.zichtbaarSinds].filter((x): x is string => !!x).sort().pop();
  return !!laatste && lid.dossierGezienOp < laatste;
}

/** De komende events van een Lead-Dossier: Een verlopen Event staat niet op de kaart en telt daar niet mee. */
function komendeEvents(d: Pick<LeadDossier, "events">): LeadEvent[] {
  return d.events.filter((e) => !e.verlopen);
}

export type VoorproefSoort = "case" | "benchmark" | "nieuws" | "event" | "blog";

/** De voorproef op de kaart (`visualisatie-mijn-metingen.md`, Dossierkaart): Ten hoogste drie titels, eerst de Cases, dan Nieuws, Events en Blogs. */
export function voorproef(d: Pick<LeadDossier, "cases" | "benchmarks" | "nieuws" | "events" | "blogs">, max = 3): { titels: { soort: VoorproefSoort; titel: string }[]; meer: number } {
  const alle = [
    ...d.cases.map((c) => ({ soort: "case" as const, titel: c.titel })),
    ...d.benchmarks.map((b) => ({ soort: "benchmark" as const, titel: b.titel })),
    ...d.nieuws.map((n) => ({ soort: "nieuws" as const, titel: n.titel })),
    ...komendeEvents(d).map((e) => ({ soort: "event" as const, titel: e.titel })),
    ...d.blogs.map((b) => ({ soort: "blog" as const, titel: b.titel })),
  ];
  return { titels: alle.slice(0, max), meer: Math.max(0, alle.length - max) };
}

/** "2 cases · 1 benchmark · 2 nieuwsberichten · 2 events · 1 blog", met het enkelvoud bij 1 en een soort zonder items weggelaten. Een verlopen Event telt niet mee. */
export function aantalTekst(d: Pick<LeadDossier, "cases" | "benchmarks" | "nieuws" | "events" | "blogs">): string {
  const delen: string[] = [];
  const voeg = (n: number, een: string, meer: string) => {
    if (n > 0) delen.push(`${n} ${n === 1 ? een : meer}`);
  };
  voeg(d.cases.length, "case", "cases");
  voeg(d.benchmarks.length, "benchmark", "benchmarks");
  voeg(d.nieuws.length, "nieuwsbericht", "nieuwsberichten");
  voeg(komendeEvents(d).length, "event", "events");
  voeg(d.blogs.length, "blog", "blogs");
  return delen.join(" · ");
}

/** Het aantal zichtbare items per bouwblok (`Bouwblok.id`), voor de radar en de lijst naast de radar. Ook de verlopen Events tellen mee. */
export function itemsPerBouwblok(d: Pick<LeadDossier, "cases" | "benchmarks" | "nieuws" | "events" | "blogs">): Map<string, number> {
  const kaart = new Map<string, number>();
  for (const i of [...d.cases, ...d.benchmarks, ...d.nieuws, ...d.events, ...d.blogs]) for (const id of i.bouwblokIds) kaart.set(id, (kaart.get(id) ?? 0) + 1);
  return kaart;
}

/** Filtert de zichtbare items op één bouwblok. Zonder bouwblok blijft alles staan. */
export function filterOpBouwblok(d: LeadDossier, bouwblokId: string | null): DossierLijsten {
  if (!bouwblokId) return { cases: d.cases, benchmarks: d.benchmarks, nieuws: d.nieuws, events: d.events, blogs: d.blogs };
  return {
    cases: d.cases.filter((c) => c.bouwblokIds.includes(bouwblokId)),
    benchmarks: d.benchmarks.filter((b) => b.bouwblokIds.includes(bouwblokId)),
    nieuws: d.nieuws.filter((n) => n.bouwblokIds.includes(bouwblokId)),
    events: d.events.filter((e) => e.bouwblokIds.includes(bouwblokId)),
    blogs: d.blogs.filter((b) => b.bouwblokIds.includes(bouwblokId)),
  };
}

/** De bouwblokken waaruit een item kiest bij de Klantcontact Volwassenheidsscan, in de volgorde van de nummers (`dossier.md`, Koppeling aan bouwblokken). */
export function dossierBouwblokken(assessments: Assessment[]) {
  return dossierBouwblokkenPerAssessment(assessments).find((a) => a.assessment.id === DOSSIER_ASSESSMENT_ID)?.bouwblokken ?? [];
}

/**
 * De bouwblokken per Assessment waaraan een item gekoppeld kan worden: De 15 bouwblokken van de Klantcontact Volwassenheidsscan en de 8
 * AI-domeinen van de AI-scan, voor zover die Assessments bestaan, elk in de volgorde van de nummers. Gearchiveerde bouwblokken zijn niet te
 * kiezen (een bestaande koppeling blijft staan).
 */
export function dossierBouwblokkenPerAssessment(assessments: Assessment[]) {
  return DOSSIER_ASSESSMENT_IDS.flatMap((id) => {
    const assessment = assessments.find((a) => a.id === id);
    if (!assessment) return [];
    const bouwblokken = alleBouwblokkenMetGroep(assessment)
      .filter((b) => !b.bouwblok.gearchiveerd)
      .sort((a, b) => a.bouwblok.volgnummer - b.bouwblok.volgnummer);
    return [{ assessment, bouwblokken }];
  });
}

/**
 * Het Dossier laden uit data van vóór het Dossier (`dossier.md`, Overgang): De bestaande `nieuwsartikelen` worden Dossieritems van soort
 * Nieuws, `notitie` wordt `toelichting`, en niets staat open of zichtbaar. Een Dossier dat er al is, blijft zoals het is. Het oude veld
 * wordt weggehaald.
 */
export function zetNieuwsartikelenOm(ruw: Record<string, unknown>): Dossier {
  const bestaand = ruw.dossier as Partial<Dossier> | undefined;
  const items: Dossieritem[] = Array.isArray(bestaand?.items) ? (bestaand!.items as Dossieritem[]).map(vulItemAan) : [];
  const oud = Array.isArray(ruw.nieuwsartikelen) ? (ruw.nieuwsartikelen as Record<string, unknown>[]) : [];
  for (const n of oud) {
    const id = String(n.id ?? "");
    if (!id || items.some((i) => i.id === id)) continue;
    items.push({
      ...vulItemAan({}),
      id,
      soort: "nieuws",
      titel: String(n.titel ?? ""),
      url: String(n.url ?? ""),
      bron: String(n.bron ?? ""),
      gepubliceerdOp: String(n.gepubliceerdOp ?? ""),
      toelichting: String(n.notitie ?? ""),
      aangemaaktOp: String(n.aangemaaktOp ?? ""),
      gewijzigdOp: String(n.aangemaaktOp ?? ""),
    });
  }
  // Data met de oude veldnamen `openVoorLead` en `openSinds` wordt omgezet naar `zichtbaar` en `zichtbaarSinds` (`dossier.md`, Overgang).
  const oudeNamen = bestaand as { openVoorLead?: boolean; openSinds?: string | null } | undefined;
  return {
    zichtbaar: bestaand?.zichtbaar === true || (bestaand?.zichtbaar === undefined && oudeNamen?.openVoorLead === true),
    zichtbaarSinds: bestaand?.zichtbaarSinds ?? oudeNamen?.openSinds ?? null,
    naamVoorLead: typeof bestaand?.naamVoorLead === "string" ? bestaand.naamVoorLead : "",
    // Data van vóór het profiel heeft geen `toonProfiel`: Alles uit (`dossier.md`, Profiel van de Organisatie).
    toonProfiel: {
      cijfers: bestaand?.toonProfiel?.cijfers === true,
      kanalen: bestaand?.toonProfiel?.kanalen === true,
      techstack: bestaand?.toonProfiel?.techstack === true,
      overig: bestaand?.toonProfiel?.overig === true,
      kpis: bestaand?.toonProfiel?.kpis === true,
    },
    radarBronnen: Array.isArray(bestaand?.radarBronnen)
      ? bestaand!.radarBronnen.filter((b) => b && typeof b.assessmentId === "string").map((b) => ({ assessmentId: b.assessmentId, metingId: b.metingId ?? null }))
      : [],
    gewijzigdOp: bestaand?.gewijzigdOp ?? null,
    items,
  };
}

function vulItemAan(i: Partial<Dossieritem>): Dossieritem {
  return {
    id: i.id ?? "",
    soort: i.soort === "case" || i.soort === "event" || i.soort === "blog" || i.soort === "benchmark" ? i.soort : "nieuws",
    titel: i.titel ?? "",
    toelichting: i.toelichting ?? "",
    zichtbaarVoorLead: i.zichtbaarVoorLead === true,
    bouwblokIds: Array.isArray(i.bouwblokIds) ? i.bouwblokIds : [],
    url: i.url ?? "",
    aangemaaktOp: i.aangemaaktOp ?? "",
    gewijzigdOp: i.gewijzigdOp ?? i.aangemaaktOp ?? "",
    bron: i.bron ?? "",
    gepubliceerdOp: i.gepubliceerdOp ?? "",
    datum: i.datum ?? "",
    einddatum: i.einddatum ?? "",
    plaats: i.plaats ?? "",
    samenvatting: i.samenvatting ?? "",
    caseOrganisatieId: i.caseOrganisatieId ?? null,
    omvang: i.omvang ?? "",
    totResultaat: i.totResultaat ?? "",
    benchmarkId: i.benchmarkId ?? null,
  };
}

/**
 * Een Case waarvan de Organisatie niet meer bestaat, krijgt `caseOrganisatieId: null` en staat niet meer open (`dossier.md`, Verwijderen en
 * datakoppelingen). Eén plek, aangeroepen bij elke schrijfactie. Een Benchmark waarvan de benchmark is verwijderd, wordt hetzelfde opgeruimd (alleen met `benchmarks`). Geeft het aantal aangepaste items terug.
 */
export function ruimDossierOp(alles: Organisatie[], benchmarks?: Pick<Benchmark, "id">[]): number {
  const bestaand = new Set(alles.map((o) => o.id));
  const bestaandeBenchmarks = benchmarks ? new Set(benchmarks.map((b) => b.id)) : null;
  let aantal = 0;
  for (const o of alles) {
    if (!o.dossier) continue;
    for (const i of o.dossier.items) {
      // Een Benchmark die niet meer bestaat: Het item vraagt om een nieuwe keuze en staat niet meer open (`dossier.md`, Verwijderen en datakoppelingen).
      if (i.soort === "benchmark" && i.benchmarkId && bestaandeBenchmarks && !bestaandeBenchmarks.has(i.benchmarkId)) {
        i.benchmarkId = null;
        i.zichtbaarVoorLead = false;
        i.gewijzigdOp = new Date().toISOString();
        o.dossier.gewijzigdOp = i.gewijzigdOp;
        aantal += 1;
        continue;
      }
      if (i.soort === "case" && i.caseOrganisatieId && !bestaand.has(i.caseOrganisatieId)) {
        i.caseOrganisatieId = null;
        i.zichtbaarVoorLead = false;
        i.gewijzigdOp = new Date().toISOString();
        o.dossier.gewijzigdOp = i.gewijzigdOp;
        aantal += 1;
      }
    }
  }
  return aantal;
}

/** De vier lijsten van het Dossier zoals de Lead ze ziet, of een gefilterd deel ervan. */
export interface DossierLijsten {
  cases: LeadCase[];
  benchmarks: LeadBenchmark[];
  nieuws: LeadNieuws[];
  events: LeadEvent[];
  blogs: LeadBlog[];
}

/** De soort waarop het soortfilter van de Lead filtert, `alles` voor geen filter (`dossier.md`, Scherm 5, Soortfilter). */
export type SoortFilter = "alles" | DossierSoort;

/** Filtert de lijsten op één soort. Bij `alles` blijft alles staan. */
export function filterOpSoort(l: DossierLijsten, soort: SoortFilter): DossierLijsten {
  if (soort === "alles") return l;
  return {
    cases: soort === "case" ? l.cases : [],
    benchmarks: soort === "benchmark" ? l.benchmarks : [],
    nieuws: soort === "nieuws" ? l.nieuws : [],
    events: soort === "event" ? l.events : [],
    blogs: soort === "blog" ? l.blogs : [],
  };
}

/** Het aantal items per soort voor de pillen van het soortfilter: Een verlopen Event telt niet mee. */
export function aantallenPerSoortLead(l: DossierLijsten): { alles: number; case: number; benchmark: number; nieuws: number; event: number; blog: number } {
  const event = l.events.filter((e) => !e.verlopen).length;
  return {
    alles: l.cases.length + l.benchmarks.length + l.nieuws.length + event + l.blogs.length,
    case: l.cases.length,
    benchmark: l.benchmarks.length,
    nieuws: l.nieuws.length,
    event,
    blog: l.blogs.length,
  };
}

/**
 * De secties van een item in de lijst van de Lead (`dossier.md`, Scherm 5, Lijst met rail "In dit dossier", besloten door Joost op 22 oktober
 * 2026): Een item staat in elke sectie waarin minstens één van zijn bouwblokken valt, met de klasse van de eigen score van dat bouwblok, over beide
 * Assessments heen. Een item zonder bouwblok, of waarvan geen enkel bouwblok een score heeft, staat in Algemeen.
 */
export type DossierSectie = "basis" | "uitbouwen" | "sterk" | "algemeen";

/** De secties in vaste volgorde, met de tekst onder de kop. `{eenheid}` is "bouwblok" of "domein". */
export const DOSSIER_SECTIES: { sectie: DossierSectie; naam: string; regel: string }[] = [
  { sectie: "basis", naam: "Basis op orde brengen", regel: "Hier ligt de meeste winst" },
  { sectie: "uitbouwen", naam: "Uitbouwen", regel: "Dit werkt al en kan verder groeien" },
  { sectie: "sterk", naam: "Sterk punt", regel: "Hier zijn jullie goed in, houd dat vast" },
  { sectie: "algemeen", naam: "Algemeen", regel: "Niet aan één {eenheid} gekoppeld" },
];

/** De sectie bij een score: Onder 2,5 Basis op orde brengen, van 2,5 tot 3,5 Uitbouwen en vanaf 3,5 Sterk punt (dezelfde grenzen als overal). */
export function sectieVanScore(score: number): Exclude<DossierSectie, "algemeen"> {
  const klasse = classificatie(score);
  return klasse === "rood" ? "basis" : klasse === "oranje" ? "uitbouwen" : "sterk";
}

/**
 * De secties van een item uit de scores per bouwblok (`Bouwblok.id`), in de vaste volgorde van de secties. Een bouwblok zonder score geeft geen
 * sectie. Heeft het item geen enkel bouwblok met een score, dan is Algemeen de enige sectie.
 */
export function sectiesVanItem(bouwblokIds: string[], scores: ReadonlyMap<string, number | null>): DossierSectie[] {
  const secties = new Set<DossierSectie>();
  for (const id of bouwblokIds) {
    const score = scores.get(id);
    if (score === null || score === undefined) continue;
    secties.add(sectieVanScore(score));
  }
  if (secties.size === 0) return ["algemeen"];
  return DOSSIER_SECTIES.map((d) => d.sectie).filter((x) => secties.has(x));
}

export interface DossierSectieInhoud {
  sectie: DossierSectie;
  naam: string;
  regel: string;
  lijsten: DossierLijsten;
  /** Het aantal items in de sectie, zonder verlopen Events. */
  aantal: number;
}

/**
 * Verdeelt de lijsten over de secties. Een item staat in elke sectie waarin een van zijn bouwblokken valt, dus de aantallen samen mogen hoger zijn
 * dan het aantal items. Een sectie zonder items valt weg. De volgorde in een sectie blijft die van de lijsten.
 */
export function verdeelOverSecties(l: DossierLijsten, scores: ReadonlyMap<string, number | null>, eenheid: string): DossierSectieInhoud[] {
  return DOSSIER_SECTIES.flatMap((definitie) => {
    const in_ = <T extends { bouwblokIds: string[] }>(lijst: T[]) => lijst.filter((i) => sectiesVanItem(i.bouwblokIds, scores).includes(definitie.sectie));
    const lijsten: DossierLijsten = { cases: in_(l.cases), benchmarks: in_(l.benchmarks), nieuws: in_(l.nieuws), events: in_(l.events), blogs: in_(l.blogs) };
    const totaal = lijsten.cases.length + lijsten.benchmarks.length + lijsten.nieuws.length + lijsten.events.length + lijsten.blogs.length;
    if (totaal === 0) return [];
    return [{ ...definitie, regel: definitie.regel.replace("{eenheid}", eenheid), lijsten, aantal: aantallenPerSoortLead(lijsten).alles }];
  });
}

/** De rijen van de verdeling rechts van de radar: Per actief bouwblok, de laagste score eerst, zonder score op het nummer van het bouwblok. */
export function sorteerVerdeling<T extends { score: number | null; volgnummer: number }>(rijen: T[]): T[] {
  const metScores = rijen.some((r) => r.score !== null);
  return [...rijen].sort((a, b) => {
    if (metScores) {
      if (a.score === null && b.score !== null) return 1;
      if (b.score === null && a.score !== null) return -1;
      if (a.score !== null && b.score !== null && a.score !== b.score) return a.score - b.score;
    }
    return a.volgnummer - b.volgnummer;
  });
}

/** Het aantal rijen van de verdeling dat eerst zichtbaar is, daaronder staat "Nog {n} bouwblokken tonen". */
export const VERDELING_EERST = 4;
