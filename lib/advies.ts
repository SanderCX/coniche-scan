/**
 * De regels van het adviesverloop (`adviesverloop.md`, `datamodel.md`, Adviesverloop): Welke Metingen bij een adviesverloop horen, de peilmeting, de
 * shortlist, de voortgang door de fasen, het contextblok en de tekst die naar Copilot gaat. Pure functies zonder opslag.
 */
import type {
  AdviesCatalogus,
  AdviesFase,
  Adviesstap,
  Adviesverloop,
  Assessment,
  Benchmark,
  Bouwblok,
  Classificatie,
  KpiDefinitie,
  Organisatie,
  ScanUitvoering,
  UseCase,
} from "./types";
import { aantalAfgerondInMeting, gemiddeldeAntwoordenVoorMetingMetSamenstelling, isSamengesteld, maandJaar, meetdatumVan, onderdeelEenheden, vergelijkNieuwsteEerst } from "./metingen";
import { alleBouwblokResultaten, BouwblokResultaat, classificatie, overallScore } from "./scoring";
import { spreiding, eenhedenSpreiding, rond1, spreidingsLabel, SpreidingsLabel } from "./visualisatie";
import { bouwBenchmarkSecties, bouwOrganisatieView } from "./benchmark";
import { benchmarkGeldigVoorOrganisatie } from "./lead-toegang";
import { kpiWaardeVan } from "./kpi";
import { formatScore } from "./format";
import { profielCijfers } from "./organisatie-profiel";
import { toonKpiGetal } from "./kpi";
import { CLASSIFICATIE_INFO } from "./colors";

/** Het aantal bouwstenen met de laagste score dat standaard in de shortlist staat (`beheerpagina.md`, punt 10, `shortlistAantal`). */
export const SHORTLIST_STANDAARD = 3;
export const LABEL_MAX = 40;

/** De naam van een klasse in de catalogus ("basis", "uitbouwen", "sterk"). */
export type KlasseCode = "basis" | "uitbouwen" | "sterk";
export const klasseCodeVan = (k: Classificatie): KlasseCode => (k === "rood" ? "basis" : k === "oranje" ? "uitbouwen" : "sterk");

/* ---------- Welk adviesverloop ---------- */

export function adviesverlopenVan(organisatie: Pick<Organisatie, "adviesverlopen">): Adviesverloop[] {
  return organisatie.adviesverlopen ?? [];
}

/** Het adviesverloop waar een Meting bij hoort (een Meting hoort bij hoogstens één adviesverloop). */
export function adviesverloopVoorMeting(organisatie: Pick<Organisatie, "adviesverlopen">, metingId: string): Adviesverloop | undefined {
  return adviesverlopenVan(organisatie).find((a) => a.metingen.some((m) => m.metingId === metingId));
}

/** Het lopende adviesverloop van een Organisatie en Onderdeel (`null` is de hele Organisatie): Hoogstens één. */
export function lopendAdviesverloop(organisatie: Pick<Organisatie, "adviesverlopen">, onderdeelId: string | null): Adviesverloop | undefined {
  return adviesverlopenVan(organisatie).find((a) => a.status === "lopend" && a.onderdeelId === onderdeelId);
}

/** Of er in de hele app een adviesverloop bestaat: Dan staan de fasen vast (`beheerpagina.md`, punt 17). */
export function bestaatAdviesverloop(organisaties: Pick<Organisatie, "adviesverlopen">[]): boolean {
  return organisaties.some((o) => adviesverlopenVan(o).length > 0);
}

export function aantalStappenMetUseCase(organisaties: Pick<Organisatie, "adviesverlopen">[], useCaseId: string): number {
  return organisaties.reduce((n, o) => n + adviesverlopenVan(o).reduce((m, a) => m + a.stappen.filter((s) => s.useCaseId === useCaseId).length, 0), 0);
}

/** Het adviesverloop van een Onderdeel (of de hele Organisatie) dat het verwijderen van het Onderdeel hindert, of `undefined`. */
export const adviesverloopVanOnderdeel = (organisatie: Pick<Organisatie, "adviesverlopen">, onderdeelId: string): Adviesverloop | undefined =>
  adviesverlopenVan(organisatie).find((a) => a.onderdeelId === onderdeelId);

/**
 * Waarom een Meting niet verwijderd kan worden (`datamodel.md`, Verwijderen en datakoppelingen): Het is de enige gekoppelde Meting van een
 * adviesverloop. `null` als het kan.
 */
export function blokkadeVerwijderenMeting(organisatie: Pick<Organisatie, "adviesverlopen">, metingId: string): string | null {
  const av = adviesverloopVoorMeting(organisatie, metingId);
  if (!av || av.metingen.length > 1) return null;
  return "Dit is de enige Meting van een adviesverloop. Verwijder eerst dat adviesverloop of koppel er een andere Meting aan.";
}

/**
 * Houdt de adviesverlopen kloppend na elke wijziging (`datamodel.md`, Verwijderen en datakoppelingen), eenmalig in `slaAlles`: Een gekoppelde Meting die
 * er niet meer is valt weg, `startMetingId` en `peilMetingId` die naar haar wezen worden de eerstvolgende gekoppelde Meting, en de `metingId` van een
 * stap wordt `null`. Houdt een adviesverloop geen Meting over (bijvoorbeeld door een samengestelde Meting die vervalt), dan verdwijnt het. Geeft de
 * verdwenen adviesverlopen terug voor het audit-log.
 */
export function ruimAdviesverlopenOp(organisatie: Organisatie): Adviesverloop[] {
  if (!organisatie.adviesverlopen) return [];
  const bestaand = new Set(organisatie.scanUitvoeringen.map((m) => m.id));
  const weg: Adviesverloop[] = [];
  const over: Adviesverloop[] = [];
  for (const av of organisatie.adviesverlopen) {
    const metingen = av.metingen.filter((m) => bestaand.has(m.metingId));
    if (metingen.length === 0) {
      weg.push(av);
      continue;
    }
    const eerstvolgende = [...metingen]
      .map((m) => organisatie.scanUitvoeringen.find((s) => s.id === m.metingId)!)
      .sort((a, b) => vergelijkNieuwsteEerst(b, a))[0].id;
    over.push({
      ...av,
      metingen,
      startMetingId: bestaand.has(av.startMetingId) && metingen.some((m) => m.metingId === av.startMetingId) ? av.startMetingId : eerstvolgende,
      peilMetingId: av.peilMetingId === null || metingen.some((m) => m.metingId === av.peilMetingId) ? av.peilMetingId : eerstvolgende,
      stappen: av.stappen.map((s) => (s.metingId && !bestaand.has(s.metingId) ? { ...s, metingId: null } : s)),
    });
  }
  const gewijzigd = weg.length > 0 || over.some((a, i) => JSON.stringify(a) !== JSON.stringify(organisatie.adviesverlopen!.filter((x) => !weg.includes(x))[i]));
  if (gewijzigd) organisatie.adviesverlopen = over;
  return weg;
}

/* ---------- Metingen koppelen ---------- */

/** Een adviesverloop werkt op scans met een schaal van 1 tot 5: Alleen daar zijn bouwstenen te rangschikken op score. */
export const heeftBouwstenenMetScore = (assessment: Pick<Assessment, "antwoordType"> | undefined): boolean => !!assessment && (assessment.antwoordType ?? "schaal") === "schaal";

export const heeftAfgerondeScans = (organisatie: Pick<Organisatie, "scanUitvoeringen">, meting: ScanUitvoering): boolean => aantalAfgerondInMeting(organisatie, meting) > 0;

/** Of er een benchmark is waarin de Organisatie meedoet en beide Assessments zitten (`benchmark.md`, Benchmark per Assessment). */
export function benchmarkMetBeideAssessments(benchmarks: Benchmark[], organisatieId: string, a: string, b: string): boolean {
  return benchmarks.some((bm) => benchmarkGeldigVoorOrganisatie(bm, organisatieId) && bm.assessmentIds.includes(a) && bm.assessmentIds.includes(b));
}

/** De gekoppelde Metingen (die nog bestaan), de oudste eerst. */
export function gekoppeldeMetingen(organisatie: Pick<Organisatie, "scanUitvoeringen">, av: Adviesverloop): ScanUitvoering[] {
  const ids = new Set(av.metingen.map((m) => m.metingId));
  return organisatie.scanUitvoeringen.filter((m) => ids.has(m.id)).sort((a, b) => vergelijkNieuwsteEerst(b, a));
}

/** Het label van een gekoppelde Meting, of `null`. */
export const labelVan = (av: Adviesverloop, metingId: string): string | null => av.metingen.find((m) => m.metingId === metingId)?.label?.trim() || null;

/** "Nulmeting", of de naam van de Meting zelf zonder label. */
export const metingNaamInTraject = (av: Adviesverloop, meting: ScanUitvoering): string => labelVan(av, meting.id) ?? meting.label;

/**
 * De peilmeting: De gekozen gekoppelde Meting, of de meest recente gekoppelde Meting met afgeronde scans (`peilMetingId: null`, `adviesverloop.md`,
 * Metingen in het adviesverloop). Een gekozen Meting zonder afgeronde scans of die niet meer gekoppeld is, telt niet.
 */
export function peilMeting(organisatie: Pick<Organisatie, "scanUitvoeringen">, av: Adviesverloop): ScanUitvoering | null {
  const gekoppeld = gekoppeldeMetingen(organisatie, av);
  const gekozen = av.peilMetingId ? gekoppeld.find((m) => m.id === av.peilMetingId) : undefined;
  if (gekozen && heeftAfgerondeScans(organisatie, gekozen)) return gekozen;
  const metScans = gekoppeld.filter((m) => heeftAfgerondeScans(organisatie, m));
  return metScans.length > 0 ? metScans[metScans.length - 1] : null;
}

/** De eerste gekoppelde Meting: De Meting waarmee het adviesverloop is geopend (of, als die weg is, de oudste gekoppelde). */
export function eersteMeting(organisatie: Pick<Organisatie, "scanUitvoeringen">, av: Adviesverloop): ScanUitvoering | null {
  const gekoppeld = gekoppeldeMetingen(organisatie, av);
  return gekoppeld.find((m) => m.id === av.startMetingId) ?? gekoppeld[0] ?? null;
}

export interface KoppelRij {
  meting: ScanUitvoering;
  assessment: Assessment | undefined;
  gekoppeld: boolean;
  /** Waarom de Meting niet te kiezen is, of `null`. Een gekoppelde Meting die niet los kan, heeft ook een reden ("Minstens één Meting"). */
  reden: string | null;
  /** De reden is een harde grens (niet wijzigen) of alleen een uitleg bij een aangevinkte Meting. */
  vast: boolean;
}

/**
 * De Metingen van de Organisatie en het Onderdeel voor de modal Metingen koppelen (`adviesverloop.md`, Modals voor de Metingen), met per Meting of ze te kiezen is.
 * `av` is het adviesverloop, of `null` bij het starten: Dan is `startMetingId` de Meting waarmee het begint.
 */
export function koppelRijen(
  organisatie: Organisatie,
  av: Adviesverloop | null,
  onderdeelId: string | null,
  assessments: Assessment[],
  benchmarks: Benchmark[],
  startMetingId?: string
): KoppelRij[] {
  const eerste = av ? eersteMeting(organisatie, av) : organisatie.scanUitvoeringen.find((m) => m.id === startMetingId) ?? null;
  const gekoppeldeIds = new Set(av ? av.metingen.map((m) => m.metingId) : startMetingId ? [startMetingId] : []);
  return organisatie.scanUitvoeringen
    .filter((m) => (m.onderdeelId ?? null) === onderdeelId)
    .sort((a, b) => vergelijkNieuwsteEerst(a, b))
    .map((meting) => {
      const assessment = assessments.find((a) => a.id === meting.assessmentId);
      const gekoppeld = gekoppeldeIds.has(meting.id);
      const ander = adviesverlopenVan(organisatie).find((x) => x.id !== av?.id && x.metingen.some((k) => k.metingId === meting.id));
      let reden: string | null = null;
      let vast = false;
      if (ander) {
        reden = "Hoort bij een ander adviesverloop";
        vast = true;
      } else if (!heeftAfgerondeScans(organisatie, meting)) {
        reden = "Nog geen afgeronde scans";
        vast = true;
      } else if (!heeftBouwstenenMetScore(assessment)) {
        reden = "Alleen voor scans met een schaal van 1 tot 5";
        vast = true;
      } else if (eerste && eerste.assessmentId !== meting.assessmentId && !benchmarkMetBeideAssessments(benchmarks, organisatie.id, eerste.assessmentId, meting.assessmentId)) {
        reden = "Geen benchmark met beide Assessments";
        vast = true;
      } else if (gekoppeld && gekoppeldeIds.size <= 1) {
        reden = "Minstens één Meting";
        vast = true;
      }
      // Een Meting die al gekoppeld is en een harde reden heeft (bijvoorbeeld door een latere wijziging), blijft los te koppelen.
      if (gekoppeld && vast && reden !== "Minstens één Meting") vast = false;
      return { meting, assessment, gekoppeld, reden, vast };
    });
}

/* ---------- Scores van de peilmeting ---------- */

export interface ShortlistRij {
  resultaat: BouwblokResultaat;
  bouwblok: Bouwblok;
  score: number;
  klasse: Classificatie;
  /** Een van de laagste scores (staat er altijd in) of door de Consultant toegevoegd. */
  standaard: boolean;
}

/** De scores van een Meting per bouwsteen, zoals de resultatenpagina ze toont (`gemiddeldeAntwoordenVoorMetingMetSamenstelling`). */
export function metingResultaten(assessment: Assessment, organisatie: Pick<Organisatie, "scanUitvoeringen">, meting: ScanUitvoering): BouwblokResultaat[] {
  return alleBouwblokResultaten(assessment, gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, meting));
}

/** De bouwstenen met een score, van laag naar hoog. Bij gelijke scores wint het laagste nummer (`adviesverloop.md`, Standaard). */
export function opLaagsteScore(resultaten: BouwblokResultaat[]): (BouwblokResultaat & { score: number })[] {
  return resultaten
    .filter((r): r is BouwblokResultaat & { score: number } => r.score !== null)
    .sort((a, b) => a.score - b.score || a.bouwblok.volgnummer - b.bouwblok.volgnummer);
}

/**
 * De shortlist: De `aantal` bouwstenen met de laagste score plus de bouwstenen die de Consultant toevoegde, in de volgorde van de score. De laagste
 * scores worden altijd uit de peilmeting afgeleid en niet opgeslagen (`datamodel.md`, Shortlist).
 */
export function shortlist(resultaten: BouwblokResultaat[], extraIds: string[], aantal: number): ShortlistRij[] {
  const gerangschikt = opLaagsteScore(resultaten);
  const laagste = new Set(gerangschikt.slice(0, aantal).map((r) => r.bouwblok.id));
  const extra = new Set(extraIds);
  return gerangschikt
    .filter((r) => laagste.has(r.bouwblok.id) || extra.has(r.bouwblok.id))
    .map((r) => ({ resultaat: r, bouwblok: r.bouwblok, score: r.score, klasse: classificatie(rond1(r.score)), standaard: laagste.has(r.bouwblok.id) }));
}

/** "+0,4 sinds de eerste Meting" bij meer gekoppelde Metingen van hetzelfde Assessment: Het verschil tussen de peilmeting en de eerste Meting. */
export function verschilSindsEerste(
  assessment: Assessment,
  organisatie: Pick<Organisatie, "scanUitvoeringen">,
  av: Adviesverloop
): Map<string, number> | null {
  const peil = peilMeting(organisatie, av);
  const eerste = eersteMeting(organisatie, av);
  if (!peil || !eerste || peil.id === eerste.id || peil.assessmentId !== eerste.assessmentId || !heeftAfgerondeScans(organisatie, eerste)) return null;
  const nu = metingResultaten(assessment, organisatie, peil);
  const toen = new Map(metingResultaten(assessment, organisatie, eerste).map((r) => [r.bouwblok.id, r.score]));
  const verschil = new Map<string, number>();
  for (const r of nu) {
    const eerder = toen.get(r.bouwblok.id);
    if (r.score !== null && eerder !== null && eerder !== undefined) verschil.set(r.bouwblok.id, rond1(r.score - eerder));
  }
  return verschil;
}

/** Een verschil met teken en komma: "+0,4", "−0,2" en "0,0". */
export function verschilTekst(v: number): string {
  const t = formatScore(Math.abs(v));
  return v > 0 ? `+${t}` : v < 0 ? `−${t}` : t;
}

export interface BenchmarkVerschil {
  /** Het verschil tussen de peilmeting en de rest van de groep, per bouwsteen. */
  perBouwsteen: Map<string, { rest: number; verschil: number }>;
  aantalAnderen: number;
}

/**
 * Het verschil met de benchmark per bouwsteen (`adviesverloop.md`, Scherm Adviesverloop, Rijen): De peilmeting tegenover het gemiddelde van de rest van de groep in de
 * eerste benchmark tussen organisaties waarin de Organisatie meedoet en dit Assessment zit. `null` zonder zo'n benchmark of als de groep onder
 * `benchmarkMinOrganisaties` blijft.
 */
export function benchmarkVerschil(
  assessment: Assessment,
  peilResultaten: BouwblokResultaat[],
  organisatie: Organisatie,
  organisaties: Organisatie[],
  assessments: Assessment[],
  benchmarks: Benchmark[],
  minOrganisaties: number
): BenchmarkVerschil | null {
  for (const bm of benchmarks) {
    if ((bm.niveau ?? "organisaties") !== "organisaties" || !bm.assessmentIds.includes(assessment.id) || !benchmarkGeldigVoorOrganisatie(bm, organisatie.id)) continue;
    const sectie = bouwBenchmarkSecties(bm, assessments, organisaties).find((s) => s.assessment.id === assessment.id);
    const view = sectie ? bouwOrganisatieView(sectie, organisatie.id, minOrganisaties) : null;
    if (!view || !view.voldoetAanDrempel || !view.rest) continue;
    const rest = new Map(view.rest.bouwblokken.map((b) => [b.bouwblok.id, b.score]));
    const perBouwsteen = new Map<string, { rest: number; verschil: number }>();
    for (const r of peilResultaten) {
      const restScore = rest.get(r.bouwblok.id);
      if (r.score !== null && restScore !== null && restScore !== undefined) perBouwsteen.set(r.bouwblok.id, { rest: restScore, verschil: rond1(r.score - restScore) });
    }
    return { perBouwsteen, aantalAnderen: view.aantalAnderen };
  }
  return null;
}

export interface BouwsteenSpreiding {
  sd: number;
  label: SpreidingsLabel;
}

/** De spreiding (standaardafwijking en label) per bouwsteen binnen de Meting. Bij een samengestelde Meting tussen de onderliggende Metingen. */
export function spreidingPerBouwsteen(assessment: Assessment, organisatie: Pick<Organisatie, "scanUitvoeringen" | "onderdelen">, meting: ScanUitvoering): Map<string, BouwsteenSpreiding> {
  const weergave = isSamengesteld(meting) ? eenhedenSpreiding(assessment, onderdeelEenheden(assessment, organisatie, meting)) : spreiding(assessment, meting.invullingen);
  const uit = new Map<string, BouwsteenSpreiding>();
  for (const rij of weergave.rijen) if (rij.sd !== null) uit.set(rij.rij.bouwblok.id, { sd: rij.sd, label: spreidingsLabel(rij.sd) });
  return uit;
}

/* ---------- Fasen en stappen ---------- */

/** De use cases van een fase in de volgorde van de catalogus, zonder de verborgen use cases. */
export function casesVanFase(catalogus: AdviesCatalogus, faseId: string): UseCase[] {
  return catalogus.useCases.filter((u) => u.faseId === faseId && !u.verborgen).sort((a, b) => a.volgorde - b.volgorde);
}

export const fasenOpVolgorde = (catalogus: AdviesCatalogus): AdviesFase[] => [...catalogus.fasen].sort((a, b) => a.volgorde - b.volgorde);

/** De use cases die meetellen in de fasestrook (`inStrook`), per fase. */
export const strookUseCases = (catalogus: AdviesCatalogus, faseId: string): UseCase[] => casesVanFase(catalogus, faseId).filter((u) => u.inStrook);

export interface FaseVoortgang {
  fase: AdviesFase;
  gedaan: number;
  totaal: number;
  /** Alle stappen van de fase zijn gedaan. */
  klaar: boolean;
  /** De eerste fase met een open stap. */
  huidig: boolean;
  /** De gedane stappen, de nieuwste eerst, elk met zijn use case. */
  stappen: { stap: Adviesstap; useCase: UseCase | undefined }[];
  /** De volgende use case in de strook zonder stap. */
  volgende: UseCase | null;
}

/**
 * De voortgang per fase voor de fasestrook (`adviesverloop.md`, De fasestrook): Een use case in de strook telt één keer, hoe vaak hij ook voor een bouwsteen is
 * gedaan. Klaar is een fase waarvan alle use cases in de strook gedaan zijn (een fase zonder use cases in de strook is niet klaar en niet huidig).
 * De huidige fase is de eerste met een open stap (`datamodel.md`, Huidige fase).
 */
export function faseVoortgang(catalogus: AdviesCatalogus, av: Pick<Adviesverloop, "stappen">): FaseVoortgang[] {
  const gedaanIds = new Set(av.stappen.map((s) => s.useCaseId));
  let huidigGezet = false;
  return fasenOpVolgorde(catalogus).map((fase) => {
    const strook = strookUseCases(catalogus, fase.id);
    const gedaan = strook.filter((u) => gedaanIds.has(u.id)).length;
    const volgende = strook.find((u) => !gedaanIds.has(u.id)) ?? null;
    const klaar = strook.length > 0 && gedaan === strook.length;
    const huidig = !huidigGezet && volgende !== null;
    if (huidig) huidigGezet = true;
    const stappen = av.stappen
      .filter((s) => catalogus.useCases.find((u) => u.id === s.useCaseId)?.faseId === fase.id)
      .sort((a, b) => b.gedaanOp.localeCompare(a.gedaanOp))
      .map((stap) => ({ stap, useCase: catalogus.useCases.find((u) => u.id === stap.useCaseId) }));
    return { fase, gedaan, totaal: strook.length, klaar, huidig, stappen, volgende };
  });
}

/** De fase van de regel in lijsten: "Oplossen · 0 van 4". Alle fasen klaar: De laatste fase. Zonder use cases in de strook: `null`. */
export function faseRegel(catalogus: AdviesCatalogus, av: Pick<Adviesverloop, "stappen">): string | null {
  const v = faseVoortgang(catalogus, av);
  const kies = v.find((f) => f.huidig) ?? [...v].reverse().find((f) => f.totaal > 0);
  return kies ? `${kies.fase.korteNaam} · ${kies.gedaan} van ${kies.totaal}` : null;
}

/** Het aantal Adviesstappen dat in de strook meetelt en gedaan is, over alle fasen. */
export const aantalGedaan = (catalogus: AdviesCatalogus, av: Pick<Adviesverloop, "stappen">): number => faseVoortgang(catalogus, av).reduce((n, f) => n + f.gedaan, 0);

/** De tekst bij een stap in het paneel: "Prompt gekopieerd · 22 okt 2026" of "Gemarkeerd als gedaan · 22 okt 2026". */
export function stapTekst(stap: Adviesstap): string {
  const datum = new Date(stap.gedaanOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  return `${stap.status === "promptGekopieerd" ? "Prompt gekopieerd" : "Gemarkeerd als gedaan"} · ${datum}`;
}

/** Een webadres in een stap: Leeg, of http of https. */
export function controleerLink(invoer: string): { ok: true; link: string } | { ok: false; reden: string } {
  const t = invoer.trim();
  if (!t) return { ok: true, link: "" };
  try {
    const u = new URL(t);
    if (u.protocol === "http:" || u.protocol === "https:") return { ok: true, link: u.toString() };
  } catch {
    /* geen geldig adres */
  }
  return { ok: false, reden: "Dit is geen geldig webadres (http of https)." };
}

/* ---------- Use cases bij een bouwsteen ---------- */

/** De use cases van de fase voor een bouwsteen: Eerst de use cases die voor die bouwsteen of klasse zijn voorgesteld, daarna de rest (`adviesverloop.md`, Uitwerking per bouwsteen). */
export function casesVoorBouwsteen(catalogus: AdviesCatalogus, faseId: string, bouwsteenId: string, klasse: Classificatie): UseCase[] {
  const code = klasseCodeVan(klasse);
  const voorgesteld = (u: UseCase) => u.bouwsteenIds.includes(bouwsteenId) || u.klassen.includes(code);
  const lijst = casesVanFase(catalogus, faseId);
  return [...lijst.filter(voorgesteld), ...lijst.filter((u) => !voorgesteld(u))];
}

/** De prompt van een use case voor een rol: Leeg als de use case voor die rol geen prompt heeft (de Consultant vult hem dan zelf in). */
export const promptVoorRol = (useCase: UseCase, rolId: string): { context: string; prompt: string } =>
  useCase.prompts.find((p) => p.rolId === rolId) ?? { context: "", prompt: "" };

/* ---------- Contextblok en prompt ---------- */

export interface ContextInvoer {
  organisatie: Organisatie;
  onderdeelNaam: string;
  assessment: Assessment;
  peil: ScanUitvoering;
  peilLabel: string;
  resultaten: BouwblokResultaat[];
  /** De bouwsteen waar het om gaat, of `null`. */
  bouwsteenId: string | null;
  spreiding: Map<string, BouwsteenSpreiding>;
  benchmark: BenchmarkVerschil | null;
  /** De scores van de eerste gekoppelde Meting van hetzelfde Assessment, als die er is en een andere Meting is dan de peilmeting. */
  eerste: { label: string; maand: string; resultaten: BouwblokResultaat[] } | null;
  kpiDefinities: KpiDefinitie[];
  /** `benchmarkMinRespondenten`: Onder dit aantal afgeronde scans gaan er geen scores naar Copilot (`adviesverloop.md`, Contextblok). */
  minRespondenten: number;
}

const klasseNaam = (score: number) => CLASSIFICATIE_INFO[classificatie(rond1(score))].label;

/**
 * Het contextblok voor Copilot (`adviesverloop.md`, Contextblok): Gegevens op groepsniveau uit de peilmeting. Nooit antwoorden per persoon, namen of
 * opmerkingen, en geen scores van een groep onder de minimale groepsgrootte. De Consultant ziet en past het blok aan voor het wordt gekopieerd.
 */
export function bouwContextblok(i: ContextInvoer): string {
  const aantal = aantalAfgerondInMeting(i.organisatie, i.peil);
  const regels: string[] = [];
  regels.push(`Assessment: ${i.assessment.naam}`);
  regels.push(`Meting: ${i.peilLabel}${meetdatumVan(i.peil) ? ` (${maandJaar(meetdatumVan(i.peil)!)})` : ""}`);
  regels.push(`Organisatie: ${i.organisatie.naam}`);
  regels.push(`Onderdeel: ${i.onderdeelNaam}`);
  regels.push(`Afgeronde scans: ${aantal}`);
  const kenmerken: string[] = [];
  const sector = (i.organisatie.kenmerken["sector-subsector"] as { sector?: string; subsector?: string } | undefined) ?? {};
  if (sector.sector) kenmerken.push(`Sector: ${sector.sector}`);
  if (sector.subsector) kenmerken.push(`Subsector: ${sector.subsector}`);
  for (const c of profielCijfers(i.organisatie)) kenmerken.push(`${c.waarde} ${c.toelichting}`);

  if (aantal < i.minRespondenten) {
    regels.push("");
    regels.push(`Scores: Niet meegenomen. Er zijn minder dan ${i.minRespondenten} afgeronde scans, dus de gegevens van de groep blijven buiten Copilot.`);
  } else {
    const overall = overallScore(i.assessment, gemiddeldeAntwoordenVoorMetingMetSamenstelling(i.assessment, i.organisatie, i.peil));
    if (overall !== null) regels.push(`Totaalscore: ${formatScore(overall)} (${klasseNaam(overall)})`);
    const gerangschikt = i.resultaten.filter((r) => r.score !== null).sort((a, b) => (a.score as number) - (b.score as number) || a.bouwblok.volgnummer - b.bouwblok.volgnummer);
    const regel = (r: BouwblokResultaat): string => {
      const score = r.score as number;
      const delen = [`${r.bouwblok.volgnummer}. ${r.bouwblok.naam}: ${formatScore(score)} (${klasseNaam(score)})`];
      const b = i.benchmark?.perBouwsteen.get(r.bouwblok.id);
      if (b) delen.push(`benchmark ${verschilTekst(b.verschil)}`);
      const s = i.spreiding.get(r.bouwblok.id);
      if (s) delen.push(`spreiding ${s.label.toLowerCase()}`);
      const eerder = i.eerste?.resultaten.find((e) => e.bouwblok.id === r.bouwblok.id)?.score;
      if (i.eerste && eerder !== null && eerder !== undefined) delen.push(`${verschilTekst(rond1(score - eerder))} sinds ${i.eerste.label}`);
      return `- ${delen.join(", ")}`;
    };
    const focus = i.bouwsteenId ? gerangschikt.find((r) => r.bouwblok.id === i.bouwsteenId) : undefined;
    if (focus) {
      regels.push("");
      regels.push("Waar het om gaat:");
      regels.push(regel(focus));
    }
    const basis = gerangschikt.filter((r) => classificatie(rond1(r.score as number)) === "rood" && r.bouwblok.id !== focus?.bouwblok.id);
    if (basis.length > 0) {
      regels.push("");
      regels.push("Basis op orde brengen:");
      regels.push(...basis.map(regel));
    }
    const sterk = gerangschikt.filter((r) => classificatie(rond1(r.score as number)) === "groen" && r.bouwblok.id !== focus?.bouwblok.id);
    if (sterk.length > 0) {
      regels.push("");
      regels.push("Sterke punten:");
      regels.push(...sterk.map(regel));
    }
  }

  const kpis = [...i.kpiDefinities]
    .sort((a, b) => a.volgorde - b.volgorde)
    .flatMap((k) => {
      const w = kpiWaardeVan(i.organisatie, k.id, { onderdeelId: null, kanaalId: null });
      return w === null ? [] : [`- ${k.naam}: ${toonKpiGetal(w)}${k.eenheid && k.eenheid !== "aantal" ? ` ${k.eenheid}` : ""}`];
    });
  if (kpis.length > 0) {
    regels.push("");
    regels.push("KPI's van de organisatie (Algemeen):");
    regels.push(...kpis);
  }
  if (kenmerken.length > 0) {
    regels.push("");
    regels.push("Kenmerken van de organisatie:");
    regels.push(...kenmerken.map((k) => `- ${k}`));
  }
  return regels.join("\n");
}

/** De tekst die op het klembord komt: De rol, de context en de prompt onder elkaar (`adviesverloop.md`, Prompt klaarzetten, Kopiëren). */
export function bouwPromptTekst(rolTekst: string, context: string, prompt: string): string {
  return [rolTekst.trim(), context.trim(), prompt.trim()].filter(Boolean).join("\n\n");
}

/** De onderdeelnaam voor in teksten: "Hele organisatie" of de naam van het Onderdeel. */
export function onderdeelNaamVan(organisatie: Pick<Organisatie, "onderdelen">, onderdeelId: string | null): string {
  return onderdeelId === null ? "Hele organisatie" : (organisatie.onderdelen ?? []).find((o) => o.id === onderdeelId)?.naam ?? "Hele organisatie";
}

