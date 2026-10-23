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
import { alleBouwblokResultaten, BouwblokResultaat, classificatie } from "./scoring";
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

export interface OpruimResultaat {
  /** Adviesverlopen die geen Meting meer over hadden en zijn verdwenen. */
  verdwenen: Adviesverloop[];
  /** Adviesverlopen waarvan Metingen van een ander Assessment zijn losgekoppeld omdat de Benchmark er niet meer voor staat. */
  losgekoppeld: { adviesverloop: Adviesverloop; metingIds: string[] }[];
}

/**
 * Houdt de adviesverlopen kloppend na elke wijziging (`datamodel.md`, Verwijderen en datakoppelingen), eenmalig in `slaAlles`: Een gekoppelde Meting die
 * er niet meer is valt weg, `startMetingId` en `peilMetingId` die naar haar wezen worden de eerstvolgende gekoppelde Meting, en de `metingId` van een
 * stap wordt `null`. Houdt een adviesverloop geen Meting over (bijvoorbeeld door een samengestelde Meting die vervalt), dan verdwijnt het. Met `benchmarks`
 * worden ook de Metingen van een ander Assessment losgekoppeld als de gekozen Benchmark er niet meer is, de Organisatie er niet meer in zit of een van de
 * Assessments er niet meer in zit (`datamodel.md`, Ander Assessment). Geeft terug wat er is verdwenen of losgekoppeld, voor het audit-log.
 */
export function ruimAdviesverlopenOp(organisatie: Organisatie, benchmarks?: Benchmark[]): OpruimResultaat {
  const uit: OpruimResultaat = { verdwenen: [], losgekoppeld: [] };
  if (!organisatie.adviesverlopen) return uit;
  const bestaand = new Map(organisatie.scanUitvoeringen.map((m) => [m.id, m]));
  const over: Adviesverloop[] = [];
  for (const av of organisatie.adviesverlopen) {
    let metingen = av.metingen.filter((m) => bestaand.has(m.metingId));
    let benchmarkId = av.benchmarkId ?? null;
    const losgemaakt: string[] = [];
    if (benchmarks && metingen.length > 0) {
      const assessmentIds = [...new Set(metingen.map((m) => bestaand.get(m.metingId)!.assessmentId))];
      if (assessmentIds.length > 1) {
        const bm = benchmarkId ? benchmarks.find((b) => b.id === benchmarkId) : undefined;
        const geldig = !!bm && benchmarkGeldigVoorOrganisatie(bm, organisatie.id) && assessmentIds.every((id) => bm.assessmentIds.includes(id));
        if (!geldig) {
          const primair = bestaand.get(metingen.some((m) => m.metingId === av.startMetingId) ? av.startMetingId : metingen[0].metingId)!.assessmentId;
          const rest = metingen.filter((m) => bestaand.get(m.metingId)!.assessmentId === primair);
          losgemaakt.push(...metingen.filter((m) => !rest.includes(m)).map((m) => m.metingId));
          metingen = rest;
          benchmarkId = null;
        }
      } else {
        benchmarkId = null;
      }
    }
    if (metingen.length === 0) {
      uit.verdwenen.push(av);
      continue;
    }
    const eerstvolgende = [...metingen].map((m) => bestaand.get(m.metingId)!).sort((a, b) => vergelijkNieuwsteEerst(b, a))[0].id;
    const nieuw: Adviesverloop = {
      ...av,
      metingen,
      benchmarkId,
      startMetingId: metingen.some((m) => m.metingId === av.startMetingId) ? av.startMetingId : eerstvolgende,
      peilMetingId: av.peilMetingId === null || metingen.some((m) => m.metingId === av.peilMetingId) ? av.peilMetingId : eerstvolgende,
      stappen: av.stappen.map((s) => (s.metingId && !metingen.some((m) => m.metingId === s.metingId) ? { ...s, metingId: null } : s)),
    };
    if (losgemaakt.length > 0) uit.losgekoppeld.push({ adviesverloop: nieuw, metingIds: losgemaakt });
    over.push(nieuw);
  }
  organisatie.adviesverlopen = over;
  return uit;
}

/** Zet een adviesverloop uit de opslag om naar de huidige vorm: Ontbrekende velden krijgen hun beginwaarde, de vervallen velden gaan weg. */
export function migreerAdviesverloop(invoer: Adviesverloop): Adviesverloop {
  const { extraBouwsteenIds: _extra, rolTekst: _rolTekst, ...rest } = invoer as Adviesverloop & { extraBouwsteenIds?: unknown; rolTekst?: unknown };
  void _extra;
  void _rolTekst;
  return {
    ...rest,
    benchmarkId: rest.benchmarkId ?? null,
    shortlistBouwsteenIds: Array.isArray(rest.shortlistBouwsteenIds) ? rest.shortlistBouwsteenIds : null,
    nvFaseIds: Array.isArray(rest.nvFaseIds) ? rest.nvFaseIds : [],
    nvUseCaseIds: Array.isArray(rest.nvUseCaseIds) ? rest.nvUseCaseIds : [],
    metingen: Array.isArray(rest.metingen) ? rest.metingen : [],
    stappen: Array.isArray(rest.stappen) ? rest.stappen : [],
  };
}

/* ---------- Metingen koppelen ---------- */

/** Een adviesverloop werkt op scans met een schaal van 1 tot 5: Alleen daar zijn bouwstenen te rangschikken op score. */
export const heeftBouwstenenMetScore = (assessment: Pick<Assessment, "antwoordType"> | undefined): boolean => !!assessment && (assessment.antwoordType ?? "schaal") === "schaal";

export const heeftAfgerondeScans = (organisatie: Pick<Organisatie, "scanUitvoeringen">, meting: ScanUitvoering): boolean => aantalAfgerondInMeting(organisatie, meting) > 0;

/**
 * De Benchmarks waarin de Organisatie meedoet en alle genoemde Assessments zitten (`benchmark.md`, Benchmark per Assessment): De keuze voor een adviesverloop met
 * Metingen van verschillende Assessments (`datamodel.md`, Ander Assessment). Alleen Benchmarks tussen organisaties tellen.
 */
export function geschikteBenchmarks(benchmarks: Benchmark[], organisatieId: string, assessmentIds: string[]): Benchmark[] {
  return benchmarks.filter(
    (bm) => (bm.niveau ?? "organisaties") === "organisaties" && benchmarkGeldigVoorOrganisatie(bm, organisatieId) && assessmentIds.every((id) => bm.assessmentIds.includes(id))
  );
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
  const gekoppeldeIds = new Set(av ? av.metingen.map((m) => m.metingId) : startMetingId ? [startMetingId] : []);
  const gekoppeldeAssessments = [...new Set(organisatie.scanUitvoeringen.filter((m) => gekoppeldeIds.has(m.id)).map((m) => m.assessmentId))];
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
      } else if (
        gekoppeldeAssessments.length > 0 &&
        !gekoppeldeAssessments.includes(meting.assessmentId) &&
        geschikteBenchmarks(benchmarks, organisatie.id, [...gekoppeldeAssessments, meting.assessmentId]).length === 0
      ) {
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
 * De shortlist (`datamodel.md`, Shortlist): Standaard (`gekozenIds` is `null`) de `aantal` bouwstenen met de laagste score, bij gelijke score op nummer. Die lijst
 * wordt altijd uit de scores van de peilmeting afgeleid en niet opgeslagen. Heeft de Consultant zelf gekozen, dan zijn het die bouwstenen in die volgorde;
 * een bouwsteen zonder score van de peilmeting valt er dan uit. `standaard` is of de bouwsteen bij de laagste scores hoort ("Door jou toegevoegd" als niet).
 */
export function shortlist(resultaten: BouwblokResultaat[], gekozenIds: string[] | null, aantal: number): ShortlistRij[] {
  const gerangschikt = opLaagsteScore(resultaten);
  const laagste = new Set(gerangschikt.slice(0, aantal).map((r) => r.bouwblok.id));
  const rij = (r: BouwblokResultaat & { score: number }): ShortlistRij => ({
    resultaat: r,
    bouwblok: r.bouwblok,
    score: r.score,
    klasse: classificatie(rond1(r.score)),
    standaard: laagste.has(r.bouwblok.id),
  });
  if (gekozenIds === null) return gerangschikt.slice(0, aantal).map(rij);
  const perId = new Map(gerangschikt.map((r) => [r.bouwblok.id, r]));
  return gekozenIds.flatMap((id) => (perId.has(id) ? [rij(perId.get(id)!)] : []));
}

/** Een bouwsteen een plek omhoog (`-1`) of omlaag (`1`) in een lijst; aan de uiteinden verandert er niets. */
export function verplaatsInLijst(ids: string[], id: string, richting: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + richting;
  if (i === -1 || j < 0 || j >= ids.length) return ids;
  const kopie = [...ids];
  [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  return kopie;
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

type StappenEnNv = Pick<Adviesverloop, "stappen"> & Partial<Pick<Adviesverloop, "nvFaseIds" | "nvUseCaseIds">>;

export interface FaseUseCase {
  useCase: UseCase;
  /** De stap als de use case gedaan is (voor een bouwsteen of voor de hele Organisatie). */
  stap: Adviesstap | undefined;
  /** Niet van toepassing verklaard (en nog geen stap). */
  nv: boolean;
}

export interface FaseVoortgang {
  fase: AdviesFase;
  gedaan: number;
  /** Het aantal use cases in de strook dat meetelt: Zonder de n.v.t. verklaarde. */
  totaal: number;
  /** Het aantal n.v.t. verklaarde use cases in de strook. */
  nv: number;
  /** Alle use cases van de fase zijn n.v.t.: De telling is "n.v.t.". */
  alleNv: boolean;
  /** De Consultant heeft de fase overgeslagen: Telt niet mee. */
  overgeslagen: boolean;
  /** Alle stappen van de fase die meetellen zijn gedaan. */
  klaar: boolean;
  /** De eerste fase die niet is overgeslagen en een open stap heeft. */
  huidig: boolean;
  /** De gedane stappen, de nieuwste eerst, elk met zijn use case. */
  stappen: { stap: Adviesstap; useCase: UseCase | undefined }[];
  /** Alle use cases in de strook van de fase, in de volgorde van de catalogus, met hun stap of n.v.t. */
  useCases: FaseUseCase[];
  /** De volgende use case in de strook die niet n.v.t. is en nog geen stap heeft. */
  volgende: UseCase | null;
}

/**
 * De voortgang per fase voor de fasestrook (`adviesverloop.md`, De fasestrook): Een use case in de strook telt één keer, hoe vaak hij ook voor een bouwsteen is
 * gedaan. Klaar is een fase waarvan alle use cases die meetellen gedaan zijn. Een overgeslagen fase en een n.v.t. verklaarde use case tellen niet mee
 * (`datamodel.md`, Niet van toepassing). De huidige fase is de eerste fase die niet is overgeslagen en nog een open stap heeft (`datamodel.md`, Huidige fase).
 */
export function faseVoortgang(catalogus: AdviesCatalogus, av: StappenEnNv): FaseVoortgang[] {
  const gedaanIds = new Set(av.stappen.map((s) => s.useCaseId));
  const nvFasen = new Set(av.nvFaseIds ?? []);
  const nvUseCases = new Set(av.nvUseCaseIds ?? []);
  let huidigGezet = false;
  return fasenOpVolgorde(catalogus).map((fase) => {
    const strook = strookUseCases(catalogus, fase.id);
    const overgeslagen = nvFasen.has(fase.id);
    const useCases: FaseUseCase[] = strook.map((useCase) => ({
      useCase,
      stap: av.stappen.filter((s) => s.useCaseId === useCase.id).sort((a, b) => b.gedaanOp.localeCompare(a.gedaanOp))[0],
      nv: nvUseCases.has(useCase.id) && !gedaanIds.has(useCase.id),
    }));
    const meetellend = useCases.filter((u) => !u.nv);
    const gedaan = meetellend.filter((u) => u.stap).length;
    const volgende = meetellend.find((u) => !u.stap)?.useCase ?? null;
    const klaar = !overgeslagen && meetellend.length > 0 && gedaan === meetellend.length;
    const huidig = !overgeslagen && !huidigGezet && volgende !== null;
    if (huidig) huidigGezet = true;
    const stappen = av.stappen
      .filter((s) => catalogus.useCases.find((u) => u.id === s.useCaseId)?.faseId === fase.id)
      .sort((a, b) => b.gedaanOp.localeCompare(a.gedaanOp))
      .map((stap) => ({ stap, useCase: catalogus.useCases.find((u) => u.id === stap.useCaseId) }));
    return {
      fase,
      gedaan,
      totaal: meetellend.length,
      nv: useCases.length - meetellend.length,
      alleNv: useCases.length > 0 && meetellend.length === 0,
      overgeslagen,
      klaar,
      huidig,
      stappen,
      useCases,
      volgende,
    };
  });
}

/** De fase van de regel in lijsten: "Oplossen · 0 van 4". Alle fasen klaar: De laatste fase die meetelt. Zonder use cases in de strook: `null`. */
export function faseRegel(catalogus: AdviesCatalogus, av: StappenEnNv): string | null {
  const v = faseVoortgang(catalogus, av);
  const kies = v.find((f) => f.huidig) ?? [...v].reverse().find((f) => f.totaal > 0 && !f.overgeslagen);
  return kies ? `${kies.fase.korteNaam} · ${kies.gedaan} van ${kies.totaal}` : null;
}

/** Het aantal Adviesstappen dat in de strook meetelt en gedaan is, over alle fasen. */
export const aantalGedaan = (catalogus: AdviesCatalogus, av: StappenEnNv): number => faseVoortgang(catalogus, av).reduce((n, f) => n + f.gedaan, 0);

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

/** De use cases van de fase voor een bouwsteen, zonder de n.v.t. verklaarde: Eerst de use cases die voor die bouwsteen of klasse zijn voorgesteld, daarna de rest (`adviesverloop.md`, Uitwerking per bouwsteen). */
export function casesVoorBouwsteen(
  catalogus: AdviesCatalogus,
  faseId: string,
  bouwsteenId: string,
  klasse: Classificatie,
  nvUseCaseIds: string[] = []
): UseCase[] {
  const code = klasseCodeVan(klasse);
  const voorgesteld = (u: UseCase) => u.bouwsteenIds.includes(bouwsteenId) || u.klassen.includes(code);
  // Een use case die de Consultant niet van toepassing verklaarde, verschijnt niet (`adviesverloop.md`, Uitwerking per bouwsteen).
  const lijst = casesVanFase(catalogus, faseId).filter((u) => !nvUseCaseIds.includes(u.id));
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
  /** De bouwstenen op de shortlist in de gekozen volgorde: Alleen die komen in het blok, ook als andere bouwstenen laag scoren. */
  shortlistIds: string[];
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
  const sector = (i.organisatie.kenmerken["sector-subsector"] as { sector?: string; subsector?: string } | undefined) ?? {};
  if (sector.sector) regels.push(`Sector: ${sector.sector}`);
  if (sector.subsector) regels.push(`Subsector: ${sector.subsector}`);
  const kenmerken: string[] = profielCijfers(i.organisatie).map((c) => `${c.waarde} ${c.toelichting}`);

  if (aantal < i.minRespondenten) {
    regels.push("");
    regels.push(`Scores: Niet meegenomen. Er zijn minder dan ${i.minRespondenten} afgeronde scans, dus de gegevens van de groep blijven buiten Copilot.`);
  } else {
    const metScore = (id: string) => i.resultaten.find((r) => r.bouwblok.id === id && r.score !== null);
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
    // De bouwsteen waar het om gaat, en de andere bouwstenen op de shortlist: Wat niet op de shortlist staat gaat niet naar Copilot (`adviesverloop.md`, Contextblok).
    const focus = i.bouwsteenId ? metScore(i.bouwsteenId) : undefined;
    if (focus) {
      regels.push("");
      regels.push("Waar het om gaat:");
      regels.push(regel(focus));
    }
    const anderen = i.shortlistIds.filter((id) => id !== focus?.bouwblok.id).flatMap((id) => (metScore(id) ? [metScore(id)!] : []));
    if (anderen.length > 0) {
      regels.push("");
      regels.push(focus ? "Andere bouwstenen op de shortlist:" : "Bouwstenen op de shortlist:");
      regels.push(...anderen.map(regel));
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

/**
 * De tekst die op het klembord komt (`adviesverloop.md`, Prompt klaarzetten, Kopiëren): Eerst "Over mij", dan de tekst van de rol, de context en de prompt onder
 * elkaar. Lege delen vallen weg.
 */
export function bouwPromptTekst(overMij: string, rolTekst: string, context: string, prompt: string): string {
  return [overMij.trim(), rolTekst.trim(), context.trim(), prompt.trim()].filter(Boolean).join("\n\n");
}

/** De onderdeelnaam voor in teksten: "Hele organisatie" of de naam van het Onderdeel. */
export function onderdeelNaamVan(organisatie: Pick<Organisatie, "onderdelen">, onderdeelId: string | null): string {
  return onderdeelId === null ? "Hele organisatie" : (organisatie.onderdelen ?? []).find((o) => o.id === onderdeelId)?.naam ?? "Hele organisatie";
}

