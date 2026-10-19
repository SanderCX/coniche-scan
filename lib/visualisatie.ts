/**
 * Berekeningen voor de visualisatie van hoge en lage scores (`visualisatie-scores.md`, onderdeel A tot en met E). Pure
 * functies zonder opslag. Alles wordt berekend en nooit opgeslagen. De scores komen uit de gedeelde scorefunctie
 * (`lib/scoring.ts`): Een gemiddelde over een groep is het gemiddelde antwoord per vraag en daarop de bouwblokscore, zoals bij
 * de benchmark (`benchmark.md`, Gedeelde regels). Er is dus geen tweede rekenmethode.
 *
 * Getoonde waarden zijn op één decimaal afgerond (half-away-from-zero). Posities, spreiding en kwartielen rekenen met de
 * ruwe waarde, zodat bij vier vragen per bouwblok de stappen van 0,25 behouden blijven.
 */
import { Assessment, BenchmarkLezing, Bouwblok, Classificatie, ScanInvulling } from "./types";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";
import {
  bouwblokScore,
  bouwblokScoreRuw,
  categorieScore,
  classificatie,
  gemiddeldeAntwoordenVoorMeting,
  gewichtVan,
  overallScore,
} from "./scoring";

export const KLASSE_LABEL: Record<Classificatie, string> = {
  rood: "Basis op Orde",
  oranje: "Uitbouwen",
  groen: "Sterk punt",
};

/**
 * Het woord voor een bouwblok in de weergaven van de resultaten, de benchmark en Verkennen: "bouwblok" waar de Assessment het
 * "bouwsteen" noemt (`visualisatie-scores.md`, J: "Bouwblok" en niet "Bouwsteen"), anders de eigen eenheid van de Assessment
 * (bijvoorbeeld "domein" bij de AI-scan). De respondent ziet in zijn eigen scan het woord van de Assessment.
 */
export function bouwblokWoorden(assessment: Pick<Assessment, "bouwblokEenheidEnkelvoud" | "bouwblokEenheidMeervoud">): { enkelvoud: string; meervoud: string } {
  const enkelvoud = assessment.bouwblokEenheidEnkelvoud;
  if (enkelvoud.toLowerCase() === "bouwsteen") return { enkelvoud: "bouwblok", meervoud: "bouwblokken" };
  return { enkelvoud: enkelvoud.toLowerCase(), meervoud: assessment.bouwblokEenheidMeervoud.toLowerCase() };
}

/** Eén decimaal, met `toFixed(1)` zoals de rest van de app (`CLAUDE.md`, Afronding). */
export function rond1(n: number): number {
  return Number(n.toFixed(1));
}

export function klasseVan(score: number | null): Classificatie | null {
  return score === null ? null : classificatie(rond1(score));
}

/** De bouwblokken in de volgorde van het model, met hun groep (categorie) en gewicht. */
export interface BouwblokRij {
  bouwblok: Bouwblok;
  groepId: string;
  groepNaam: string | null;
  groepKleur: string | null;
  gewicht: number;
}

export function bouwblokRijen(assessment: Assessment): BouwblokRij[] {
  return alleBouwblokkenMetGroep(assessment).map(({ bouwblok, groepId, groepNaam, groepKleur }) => ({
    bouwblok,
    groepId,
    groepNaam,
    groepKleur,
    gewicht: gewichtVan(bouwblok),
  }));
}

function afgerond(invullingen: ScanInvulling[]): ScanInvulling[] {
  return invullingen.filter((i) => i.status === "afgerond");
}

function gemiddelde(waarden: number[]): number | null {
  return waarden.length === 0 ? null : waarden.reduce((a, b) => a + b, 0) / waarden.length;
}

/** Standaardafwijking van de steekproef (n − 1). Bij minder dan twee waarden is er geen spreiding. */
export function steekproefSd(waarden: number[]): number | null {
  if (waarden.length < 2) return null;
  const m = waarden.reduce((a, b) => a + b, 0) / waarden.length;
  const som = waarden.reduce((a, w) => a + (w - m) ** 2, 0);
  return Math.sqrt(som / (waarden.length - 1));
}

/* ---------- A. Eén meting ---------- */

export interface RijEenMeting {
  rij: BouwblokRij;
  /** Het gemiddelde over de afgeronde scans, via de gedeelde scorefunctie. Leeg zonder afgeronde scan. */
  score: number | null;
  klasse: Classificatie | null;
  /** De laagste en hoogste bouwblokscore van een afgeronde scan. */
  laagste: number | null;
  hoogste: number | null;
}

export interface EenMetingWeergave {
  aantalScans: number;
  rijen: RijEenMeting[];
  totaal: number | null;
  totaalKlasse: Classificatie | null;
  hoogsteBouwblok: { score: number; naam: string } | null;
  laagsteBouwblok: { score: number; naam: string } | null;
  verdeling: Record<Classificatie, number>;
}

export function eenMeting(assessment: Assessment, invullingen: ScanInvulling[]): EenMetingWeergave {
  const scans = afgerond(invullingen);
  const antwoorden = gemiddeldeAntwoordenVoorMeting(assessment, scans);
  const rijen: RijEenMeting[] = bouwblokRijen(assessment).map((rij) => {
    const score = scans.length === 0 ? null : bouwblokScore(rij.bouwblok, antwoorden);
    const perScan = scans
      .map((s) => bouwblokScoreRuw(rij.bouwblok, s.antwoorden))
      .filter((w): w is number => w !== null);
    return {
      rij,
      score,
      klasse: klasseVan(score),
      laagste: perScan.length === 0 ? null : Math.min(...perScan),
      hoogste: perScan.length === 0 ? null : Math.max(...perScan),
    };
  });
  const metScore = rijen.filter((r): r is RijEenMeting & { score: number } => r.score !== null);
  const hoogste = metScore.reduce<(typeof metScore)[number] | null>((m, r) => (m === null || r.score > m.score ? r : m), null);
  const laagste = metScore.reduce<(typeof metScore)[number] | null>((m, r) => (m === null || r.score < m.score ? r : m), null);
  const verdeling: Record<Classificatie, number> = { rood: 0, oranje: 0, groen: 0 };
  for (const r of rijen) if (r.klasse) verdeling[r.klasse] += 1;
  const totaal = scans.length === 0 ? null : overallScore(assessment, antwoorden);
  return {
    aantalScans: scans.length,
    rijen,
    totaal,
    totaalKlasse: klasseVan(totaal),
    hoogsteBouwblok: hoogste ? { score: hoogste.score, naam: hoogste.rij.bouwblok.naam } : null,
    laagsteBouwblok: laagste ? { score: laagste.score, naam: laagste.rij.bouwblok.naam } : null,
    verdeling,
  };
}

/* ---------- B. Spreiding binnen een Meting ---------- */

export type SpreidingsLabel = "Eensgezind" | "Wisselend" | "Verdeeld";

/** Eerste inschatting (`visualisatie-scores.md`, Spreidingslabel): De grenzen worden bijgesteld met echte data. */
export const SPREIDING_GRENZEN = { wisselend: 0.55, verdeeld: 0.8 };

export function spreidingsLabel(sd: number): SpreidingsLabel {
  if (sd < SPREIDING_GRENZEN.wisselend) return "Eensgezind";
  if (sd < SPREIDING_GRENZEN.verdeeld) return "Wisselend";
  return "Verdeeld";
}

export interface RijSpreiding {
  rij: BouwblokRij;
  /** De ruwe bouwblokscore van elke scan in de vergelijkgroep (bij een scan-view zonder die scan). */
  scores: number[];
  /** Dezelfde scores met het id van de scan (of de eenheid) erbij, in dezelfde volgorde. Voor de vorm van een stip bij onderdelen. */
  punten: { id: string; score: number }[];
  gemiddelde: number | null;
  sd: number | null;
  label: SpreidingsLabel | null;
  /** De scan van de view (alleen bij `focusInvullingId`): Zijn score krijgt de ring. */
  focusScore: number | null;
  /** De scan ligt onder het gemiddelde van de anderen. */
  onderGemiddelde: boolean;
}

export interface SpreidingWeergave {
  /** Alle afgeronde scans in de Meting, ook de scan van de view. */
  aantalScans: number;
  rijen: RijSpreiding[];
  meestVerdeeld: { naam: string; sd: number } | null;
  meestEensgezind: { naam: string; sd: number } | null;
  /** Alleen bij een scan-view: Het aantal bouwblokken waarop de scan onder het gemiddelde van de anderen ligt. */
  aantalOnderGemiddelde: number | null;
}

/**
 * De vergelijkgroep van een scan-view is alle andere afgeronde scans in de Meting (`benchmark.md`, Niveau 3). Zonder
 * `focusInvullingId` tellen alle scans mee.
 */
export function spreiding(assessment: Assessment, invullingen: ScanInvulling[], focusInvullingId?: string): SpreidingWeergave {
  const scans = afgerond(invullingen);
  const focus = focusInvullingId ? scans.find((s) => s.id === focusInvullingId) : undefined;
  const groep = focus ? scans.filter((s) => s.id !== focus.id) : scans;
  const rijen: RijSpreiding[] = bouwblokRijen(assessment).map((rij) => {
    const punten = groep
      .map((s) => ({ id: s.id, score: bouwblokScoreRuw(rij.bouwblok, s.antwoorden) }))
      .filter((p): p is { id: string; score: number } => p.score !== null);
    const scores = punten.map((p) => p.score);
    const gem = gemiddelde(scores);
    const sd = steekproefSd(scores);
    const focusScore = focus ? bouwblokScoreRuw(rij.bouwblok, focus.antwoorden) : null;
    return {
      rij,
      scores,
      punten,
      gemiddelde: gem,
      sd,
      label: sd === null ? null : spreidingsLabel(sd),
      focusScore,
      onderGemiddelde: focusScore !== null && gem !== null && focusScore < gem,
    };
  });
  const metSd = rijen.filter((r): r is RijSpreiding & { sd: number } => r.sd !== null);
  const meest = (voorkeur: (a: number, b: number) => boolean) =>
    metSd.reduce<(typeof metSd)[number] | null>((m, r) => (m === null || voorkeur(r.sd, m.sd) ? r : m), null);
  const verdeeld = meest((a, b) => a > b);
  const eensgezind = meest((a, b) => a < b);
  return {
    aantalScans: scans.length,
    rijen,
    meestVerdeeld: verdeeld ? { naam: verdeeld.rij.bouwblok.naam, sd: verdeeld.sd } : null,
    meestEensgezind: eensgezind ? { naam: eensgezind.rij.bouwblok.naam, sd: eensgezind.sd } : null,
    aantalOnderGemiddelde: focus ? rijen.filter((r) => r.onderGemiddelde).length : null,
  };
}

/** Sorteert de rijen van grote naar kleine spreiding (`visualisatie-scores.md`, B, Sortering). Rijen zonder spreiding staan onderaan. */
export function sorteerOpSpreiding<T extends { sd: number | null }>(rijen: T[]): T[] {
  return [...rijen].sort((a, b) => (b.sd ?? -1) - (a.sd ?? -1));
}

/* ---------- C. Tussen Metingen ---------- */

export type Richting = "stijging" | "daling" | "gelijk";

export interface RijTussenMetingen {
  rij: BouwblokRij;
  vorig: number | null;
  huidig: number | null;
  /** Getoonde waarde van de nieuwere Meting min de getoonde waarde van de oudere, zodat wat de lezer ziet optelt. */
  verschil: number | null;
  richting: Richting | null;
  vorigeKlasse: Classificatie | null;
  huidigeKlasse: Classificatie | null;
  klasseGewisseld: boolean;
}

export interface TussenMetingenWeergave {
  rijen: RijTussenMetingen[];
  totaalVorig: number | null;
  totaalHuidig: number | null;
  gestegen: number;
  gedaald: number;
  gewisseld: number;
}

export function tussenMetingen(
  assessment: Assessment,
  vorigeInvullingen: ScanInvulling[],
  huidigeInvullingen: ScanInvulling[]
): TussenMetingenWeergave {
  return tussenMetingenUitAntwoorden(
    assessment,
    gemiddeldeAntwoordenVoorMeting(assessment, vorigeInvullingen),
    gemiddeldeAntwoordenVoorMeting(assessment, huidigeInvullingen)
  );
}

/**
 * Weergave C uit twee antwoordensets, het gemiddelde per vraag van elke Meting. Een samengestelde Meting levert zo haar
 * gemiddelde van gemiddelden zonder dat ze scans nodig heeft (`benchmark.md`, Niveau 2).
 */
export function tussenMetingenUitAntwoorden(
  assessment: Assessment,
  vorig: Record<string, number>,
  huidig: Record<string, number>
): TussenMetingenWeergave {
  const rijen: RijTussenMetingen[] = bouwblokRijen(assessment).map((rij) => {
    const v = bouwblokScore(rij.bouwblok, vorig);
    const h = bouwblokScore(rij.bouwblok, huidig);
    const verschil = v !== null && h !== null ? rond1(h - v) : null;
    const vk = klasseVan(v);
    const hk = klasseVan(h);
    return {
      rij,
      vorig: v,
      huidig: h,
      verschil,
      richting: verschil === null ? null : verschil > 0 ? "stijging" : verschil < 0 ? "daling" : "gelijk",
      vorigeKlasse: vk,
      huidigeKlasse: hk,
      klasseGewisseld: vk !== null && hk !== null && vk !== hk,
    };
  });
  return {
    rijen,
    totaalVorig: overallScore(assessment, vorig),
    totaalHuidig: overallScore(assessment, huidig),
    gestegen: rijen.filter((r) => r.richting === "stijging").length,
    gedaald: rijen.filter((r) => r.richting === "daling").length,
    gewisseld: rijen.filter((r) => r.klasseGewisseld).length,
  };
}

/* ---------- H. Metingen naast elkaar ---------- */

/** Welke van twee Metingen hoger scoort op een rij: De eerste, de tweede, of gelijk bij gelijke getoonde waarden. */
export type HogerKant = "eerste" | "tweede" | "gelijk";

/** Welke Meting hoger scoort, op de getoonde waarden (één decimaal). `null` als een van beide ontbreekt. */
export function hogerKant(eerste: number | null, tweede: number | null): HogerKant | null {
  if (eerste === null || tweede === null) return null;
  const a = rond1(eerste);
  const b = rond1(tweede);
  return a === b ? "gelijk" : a > b ? "eerste" : "tweede";
}

export interface RijNaastElkaar {
  rij: BouwblokRij;
  eerste: number | null;
  tweede: number | null;
  /** Het verschil als getal zonder teken: De getoonde waarden van beide Metingen, de ene min de andere. */
  verschil: number | null;
  hoger: HogerKant | null;
  eersteKlasse: Classificatie | null;
  tweedeKlasse: Classificatie | null;
}

export interface NaastElkaarWeergave {
  rijen: RijNaastElkaar[];
  totaalEerste: number | null;
  totaalTweede: number | null;
  /** Het aantal bouwblokken waar de eerste Meting (de cirkel) hoger scoort, waar de tweede (de ruit) hoger scoort, en gelijk. */
  eersteHoger: number;
  tweedeHoger: number;
  gelijk: number;
}

/**
 * Weergave H uit twee antwoordensets, het gemiddelde per vraag van elke Meting (`visualisatie-scores.md`, H). Zonder richting:
 * Er is geen "vorige" en "huidige", alleen de eerste en de tweede Meting in de volgorde van de lezing (op naam).
 */
export function naastElkaarUitAntwoorden(
  assessment: Assessment,
  eerste: Record<string, number>,
  tweede: Record<string, number>
): NaastElkaarWeergave {
  const rijen: RijNaastElkaar[] = bouwblokRijen(assessment).map((rij) => {
    const a = bouwblokScore(rij.bouwblok, eerste);
    const b = bouwblokScore(rij.bouwblok, tweede);
    return {
      rij,
      eerste: a,
      tweede: b,
      verschil: a !== null && b !== null ? rond1(Math.abs(a - b)) : null,
      hoger: hogerKant(a, b),
      eersteKlasse: klasseVan(a),
      tweedeKlasse: klasseVan(b),
    };
  });
  return {
    rijen,
    totaalEerste: overallScore(assessment, eerste),
    totaalTweede: overallScore(assessment, tweede),
    eersteHoger: rijen.filter((r) => r.hoger === "eerste").length,
    tweedeHoger: rijen.filter((r) => r.hoger === "tweede").length,
    gelijk: rijen.filter((r) => r.hoger === "gelijk").length,
  };
}

/* ---------- D. Tussen organisaties ---------- */

export interface GroepStatistiek {
  min: number;
  q1: number;
  gemiddelde: number;
  q3: number;
  max: number;
}

/** Kwartiel met lineaire interpolatie, zoals `KWARTIEL.INC` in Excel: Positie `(n − 1) × p` op de gesorteerde waarden. */
export function kwantiel(gesorteerd: number[], p: number): number {
  if (gesorteerd.length === 1) return gesorteerd[0];
  const positie = (gesorteerd.length - 1) * p;
  const onder = Math.floor(positie);
  const boven = Math.ceil(positie);
  return gesorteerd[onder] + (gesorteerd[boven] - gesorteerd[onder]) * (positie - onder);
}

export function groepStatistiek(waarden: number[]): GroepStatistiek | null {
  if (waarden.length === 0) return null;
  const gesorteerd = [...waarden].sort((a, b) => a - b);
  return {
    min: gesorteerd[0],
    q1: kwantiel(gesorteerd, 0.25),
    gemiddelde: gesorteerd.reduce((a, b) => a + b, 0) / gesorteerd.length,
    q3: kwantiel(gesorteerd, 0.75),
    max: gesorteerd[gesorteerd.length - 1],
  };
}

export type PositieLabel = "Bovenste kwart" | "Middenmoot" | "Onderste kwart";

export interface RijTussenOrganisaties {
  rij: BouwblokRij;
  eigen: number | null;
  groep: GroepStatistiek | null;
  /** Getoonde score van X min het getoonde groepsgemiddelde. */
  verschil: number | null;
  positie: PositieLabel | null;
}

export interface TussenOrganisatiesWeergave {
  /** Het aantal andere leden waarmee X wordt vergeleken. */
  grootte: number;
  rijen: RijTussenOrganisaties[];
  boven: number;
  inBovensteKwart: number;
  inOndersteKwart: number;
}

/**
 * De score van lid X tegenover de overige leden van de groep (zonder X, elk lid even zwaar). Het groepsgemiddelde,
 * het minimum, het maximum en de kwartielen komen uit de bouwblokscores van die leden.
 */
export function tussenOrganisaties(
  assessment: Assessment,
  eigenAntwoorden: Record<string, number>,
  anderenAntwoorden: Record<string, number>[]
): TussenOrganisatiesWeergave {
  const rijen: RijTussenOrganisaties[] = bouwblokRijen(assessment).map((rij) => {
    const eigenRuw = bouwblokScoreRuw(rij.bouwblok, eigenAntwoorden);
    const anderen = anderenAntwoorden
      .map((a) => bouwblokScoreRuw(rij.bouwblok, a))
      .filter((w): w is number => w !== null);
    const groep = groepStatistiek(anderen);
    let positie: PositieLabel | null = null;
    if (eigenRuw !== null && groep !== null) {
      positie = eigenRuw > groep.q3 ? "Bovenste kwart" : eigenRuw < groep.q1 ? "Onderste kwart" : "Middenmoot";
    }
    const eigenGetoond = eigenRuw === null ? null : rond1(eigenRuw);
    const verschil = eigenGetoond !== null && groep !== null ? rond1(eigenGetoond - rond1(groep.gemiddelde)) : null;
    return { rij, eigen: eigenGetoond, groep, verschil, positie };
  });
  return {
    grootte: anderenAntwoorden.length,
    rijen,
    boven: rijen.filter((r) => r.verschil !== null && r.verschil > 0).length,
    inBovensteKwart: rijen.filter((r) => r.positie === "Bovenste kwart").length,
    inOndersteKwart: rijen.filter((r) => r.positie === "Onderste kwart").length,
  };
}

/* ---------- E. Matrix voor Metingen binnen een organisatie ---------- */

export interface MatrixKolomInvoer {
  label: string;
  /** Onder de kop: Bij kolommen met organisaties het label van de Meting (`visualisatie-scores.md`, E, Niveau 1). */
  sublabel?: string;
  /** De volledige naam als `label` de korte naam is (`datamodel.md`, Organisatie): Komt in de tooltip van de kop. */
  volledigeNaam?: string;
  aantalScans: number;
  antwoorden: Record<string, number>;
}

export interface MatrixCel {
  score: number | null;
  klasse: Classificatie | null;
  /** Wijkt 0,5 of meer af van het gemiddelde van de rij: Krijgt een zwarte rand. */
  afwijkend: boolean;
}

export interface MatrixRij {
  rij: BouwblokRij;
  cellen: MatrixCel[];
  gemiddelde: number | null;
  laagste: number | null;
  hoogste: number | null;
  /** Hoogste min laagste van de rij, voor "bouwblok met het grootste verschil tussen Metingen". */
  verschil: number | null;
  /** Bij precies twee kolommen op niveau 2: De tweede min de eerste kolom (de nieuwere Meting min de oudere). */
  verschilTweeMetingen: number | null;
  /** Bij precies twee kolommen met de lezing Naast elkaar: Welke kolom hoger scoort, of gelijk. */
  hogerKolom: HogerKant | null;
}

/** Een categorie in de matrix op niveau 2 met twee Metingen: Eigen scores per kolom en het verschil. */
export interface MatrixGroepRij {
  groepId: string;
  naam: string;
  kleur: string | null;
  /** De index in `rijen` van het laatste bouwblok van deze categorie: De groeprij staat daaronder. */
  naRij: number;
  cellen: MatrixCel[];
  verschilTweeMetingen: number | null;
  hogerKolom: HogerKant | null;
}
export interface MatrixWeergave {
  kolommen: { label: string; sublabel?: string; volledigeNaam?: string; aantalScans: number; totaal: number | null; totaalKlasse: Classificatie | null }[];
  rijen: MatrixRij[];
  hoogsteMeting: { label: string; sublabel?: string; totaal: number } | null;
  laagsteMeting: { label: string; sublabel?: string; totaal: number } | null;
  grootsteVerschil: { naam: string; verschil: number } | null;
  aantalAfwijkend: number;
  /**
   * Op niveau 2 bij precies twee Metingen een kolom Verschil (`visualisatie-scores.md`, E, Volgorde van de kolommen): De
   * nieuwere Meting min de oudere, per bouwblok, per categorie en voor de totaalscore. De kolommen staan dan op meetdatum.
   */
  metVerschil: boolean;
  /**
   * Bij precies twee Metingen met de lezing Naast elkaar (voorstel): Een kolom Hoogste in plaats van Verschil, met het symbool
   * van de Meting die op die rij hoger scoort en "Gelijk" bij gelijke getoonde waarden. De kolommen staan op naam.
   */
  metHoogste: boolean;
  groepRijen: MatrixGroepRij[];
  totaalVerschil: number | null;
  totaalHoger: HogerKant | null;
}

/** Een afwijking van deze grootte of meer van het rijgemiddelde krijgt een rand (`visualisatie-scores.md`, E). */
export const MATRIX_AFWIJKING = 0.5;

/**
 * `groepsvergelijking` (standaard aan): Niveau 1 zet de organisaties naast het gemiddelde van de rij en geeft een cel die 0,5 of
 * meer afwijkt een rand. Uit (niveau 2, ook de matrix onder een samengestelde Meting): Er is geen groep om van af te wijken,
 * dus geen rand, en bij precies twee kolommen komt er een kolom Verschil (de tweede min de eerste, dus de kolommen staan op
 * meetdatum met de oudste links).
 */
export function matrix(
  assessment: Assessment,
  kolommen: MatrixKolomInvoer[],
  opties: { groepsvergelijking?: boolean; lezing?: BenchmarkLezing } = {}
): MatrixWeergave {
  const groepsvergelijking = opties.groepsvergelijking ?? true;
  const tweeKolommen = !groepsvergelijking && kolommen.length === 2;
  const naastElkaar = opties.lezing === "naastElkaar";
  const metVerschil = tweeKolommen && !naastElkaar;
  const metHoogste = tweeKolommen && naastElkaar;
  const verschilTussen = (a: number | null, b: number | null) => (a !== null && b !== null ? rond1(b - a) : null);
  const bouwRijen = bouwblokRijen(assessment);
  const rijen: MatrixRij[] = bouwRijen.map((rij) => {
    const scores = kolommen.map((k) => bouwblokScore(rij.bouwblok, k.antwoorden));
    const aanwezig = scores.filter((s): s is number => s !== null);
    const gem = gemiddelde(aanwezig);
    const cellen: MatrixCel[] = scores.map((score) => ({
      score,
      klasse: klasseVan(score),
      // Op de getoonde waarden: Een afwijking van precies 0,5 telt mee.
      afwijkend: groepsvergelijking && score !== null && gem !== null && rond1(Math.abs(score - gem)) >= MATRIX_AFWIJKING,
    }));
    const laagste = aanwezig.length ? Math.min(...aanwezig) : null;
    const hoogste = aanwezig.length ? Math.max(...aanwezig) : null;
    return {
      rij,
      cellen,
      gemiddelde: gem === null ? null : rond1(gem),
      laagste,
      hoogste,
      verschil: laagste !== null && hoogste !== null ? rond1(hoogste - laagste) : null,
      verschilTweeMetingen: metVerschil ? verschilTussen(scores[0], scores[1]) : null,
      hogerKolom: metHoogste ? hogerKant(scores[0], scores[1]) : null,
    };
  });
  // Per categorie (alleen bij een Assessment met categorielaag) de score en het verschil, onder het laatste bouwblok.
  const groepRijen: MatrixGroepRij[] = [];
  if (metVerschil || metHoogste) {
    bouwRijen.forEach((rij, i) => {
      if (rij.groepNaam === null) return;
      const laatsteVanGroep = i === bouwRijen.length - 1 || bouwRijen[i + 1].groepId !== rij.groepId;
      if (!laatsteVanGroep) return;
      const leden = bouwRijen.filter((r) => r.groepId === rij.groepId);
      const scores = kolommen.map((k) => categorieScore(leden, k.antwoorden));
      groepRijen.push({
        groepId: rij.groepId,
        naam: rij.groepNaam,
        kleur: rij.groepKleur,
        naRij: i,
        cellen: scores.map((score) => ({ score, klasse: klasseVan(score), afwijkend: false })),
        verschilTweeMetingen: metVerschil ? verschilTussen(scores[0], scores[1]) : null,
        hogerKolom: metHoogste ? hogerKant(scores[0], scores[1]) : null,
      });
    });
  }
  const totalen = kolommen.map((k) => (k.aantalScans === 0 ? null : overallScore(assessment, k.antwoorden)));
  const metTotaal = kolommen
    .map((k, i) => ({ label: k.label, sublabel: k.sublabel, totaal: totalen[i] }))
    .filter((k): k is { label: string; sublabel: string | undefined; totaal: number } => k.totaal !== null);
  const hoogste = metTotaal.reduce<(typeof metTotaal)[number] | null>((m, k) => (m === null || k.totaal > m.totaal ? k : m), null);
  const laagste = metTotaal.reduce<(typeof metTotaal)[number] | null>((m, k) => (m === null || k.totaal < m.totaal ? k : m), null);
  const grootste = rijen.reduce<MatrixRij | null>((m, r) => (r.verschil !== null && (m === null || r.verschil > (m.verschil ?? -1)) ? r : m), null);
  return {
    kolommen: kolommen.map((k, i) => ({
      label: k.label,
      sublabel: k.sublabel,
      volledigeNaam: k.volledigeNaam,
      aantalScans: k.aantalScans,
      totaal: totalen[i],
      totaalKlasse: klasseVan(totalen[i]),
    })),
    rijen,
    hoogsteMeting: hoogste,
    laagsteMeting: laagste,
    grootsteVerschil: grootste && grootste.verschil !== null ? { naam: grootste.rij.bouwblok.naam, verschil: grootste.verschil } : null,
    aantalAfwijkend: rijen.reduce((n, r) => n + r.cellen.filter((c) => c.afwijkend).length, 0),
    metVerschil,
    metHoogste,
    groepRijen,
    totaalVerschil: metVerschil ? verschilTussen(totalen[0], totalen[1]) : null,
    totaalHoger: metHoogste ? hogerKant(totalen[0], totalen[1]) : null,
  };
}

/* ---------- G. Antwoorden per vraag ---------- */

export interface AntwoordenKolom {
  invullingId: string;
  /** De volledige naam (tooltip), of het e-mailadres zolang de naam leeg is. */
  naam: string;
  initialen: string;
}

export interface AntwoordenVraagRij {
  vraagId: string;
  /** "3.2": Het volgnummer van het bouwblok en dat van de vraag. */
  nummer: string;
  tekst: string;
  /** Per kolom het antwoord (1 tot 5), of `null` bij een onbeantwoorde vraag. */
  antwoorden: (number | null)[];
  gemiddelde: number | null;
  /** Aantal beantwoorde antwoorden. */
  n: number;
}

export interface AntwoordenBouwblokRij {
  rij: BouwblokRij;
  /** Per kolom de bouwblokscore van die respondent (ruw, getoond op één decimaal). */
  scores: (number | null)[];
  /** Het gemiddelde van de vraaggemiddelden, zoals bij weergave A. */
  gemiddelde: number | null;
  n: number;
  vragen: AntwoordenVraagRij[];
}

export interface AntwoordenWeergave {
  kolommen: AntwoordenKolom[];
  rijen: AntwoordenBouwblokRij[];
  /** Totaalscore per respondent (gedeelde scorefunctie met `Bouwblok.gewicht`). */
  totaal: (number | null)[];
  totaalGemiddelde: number | null;
  totaalN: number;
  aantalRespondenten: number;
  /** Beantwoorde antwoorden en het aantal dat er had kunnen zijn (respondenten × vragen). */
  beantwoord: number;
  mogelijk: number;
  laagsteVraag: { score: number; bouwblok: string; nummer: string } | null;
  hoogsteVraag: { score: number; bouwblok: string; nummer: string } | null;
}

/** Initialen uit een naam: De eerste letter van het eerste en het laatste woord, of de eerste twee letters van één woord. */
export function initialenVan(naam: string): string {
  const woorden = naam.trim().split(/\s+/).filter(Boolean);
  if (woorden.length === 0) return "?";
  if (woorden.length === 1) return woorden[0].slice(0, 2).toUpperCase();
  return (woorden[0][0] + woorden[woorden.length - 1][0]).toUpperCase();
}

/** Een eenvoudige, stabiele hash (FNV-1a) van een tekst: Alleen voor een vaste volgorde, nooit voor iets beveiligends. */
function hash(tekst: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Sorteersleutel: De achternaam (het laatste woord), daarna de hele naam. Het e-mailadres staat voor wie geen naam heeft. */
function achternaamSleutel(naam: string): [string, string] {
  const woorden = naam.trim().split(/\s+/).filter(Boolean);
  return [(woorden[woorden.length - 1] ?? "").toLowerCase(), naam.trim().toLowerCase()];
}

/**
 * De kolommen van "Per respondent" bij een scan zonder 1–5-schaal (de Quickscan, `visualisatie-quickscan.md`, 4): Dezelfde
 * volgorde en dezelfde namen als weergave G. Anoniem (R1 tot en met Rn, in een vaste volgorde uit een hash van het scan-id) of
 * alfabetisch op achternaam, met initialen die bij gelijke letters een volgnummer krijgen.
 */
export function kolommenVoorScans(scans: { id: string; naam: string }[], anoniem: boolean): AntwoordenKolom[] {
  const lijst = anoniem
    ? scans.map((s) => ({ ...s, naam: "" })).sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id))
    : [...scans].sort((a, b) => {
        const [aa, an] = achternaamSleutel(a.naam);
        const [ba, bn] = achternaamSleutel(b.naam);
        return aa.localeCompare(ba, "nl") || an.localeCompare(bn, "nl");
      });
  const gebruikt = new Map<string, number>();
  return lijst.map((s, i) => {
    if (anoniem) return { invullingId: s.id, naam: "", initialen: `R${i + 1}` };
    const basis = initialenVan(s.naam);
    const keer = (gebruikt.get(basis) ?? 0) + 1;
    gebruikt.set(basis, keer);
    return { invullingId: s.id, naam: s.naam, initialen: keer === 1 ? basis : `${basis}${keer}` };
  });
}

/**
 * De antwoorden per vraag van één Meting (`visualisatie-scores.md`, G): Eén kolom per afgeronde scan, de rijen de bouwblokken
 * met hun vragen. De kolommen staan alfabetisch op achternaam. Gelijke initialen krijgen een volgnummer ("JJ", "JJ2"), zodat de
 * kolomkoppen te onderscheiden zijn. Alles komt uit de gedeelde scorefuncties, er is geen tweede rekenmethode. Gearchiveerde
 * vragen tellen mee voor wie ze beantwoordde (`datamodel.md`, Content bewerken).
 */
export function antwoordenPerVraag(
  assessment: Assessment,
  invullingen: ScanInvulling[],
  naamVan: (invulling: ScanInvulling) => string,
  opties: {
    /**
     * Een Lead zonder namen (`Organisatie.antwoordenMetNamen` uit): De kolommen heten R1 tot en met Rn, zonder naam in een
     * tooltip, in een vaste volgorde uit een hash van het scan-id. Die volgorde volgt dus niet de naam en niet het moment van
     * afronden, zodat ze geen aanwijzing geeft (`beheerpagina.md`, punt 6a, Namen bij Antwoorden).
     */
    anoniem?: boolean;
  } = {}
): AntwoordenWeergave {
  const afgeronde = afgerond(invullingen).map((i) => ({ invulling: i, naam: opties.anoniem ? "" : naamVan(i) }));
  const scans = opties.anoniem
    ? afgeronde.sort((a, b) => hash(a.invulling.id) - hash(b.invulling.id) || a.invulling.id.localeCompare(b.invulling.id))
    : afgeronde.sort((a, b) => {
        const [aa, an] = achternaamSleutel(a.naam);
        const [ba, bn] = achternaamSleutel(b.naam);
        return aa.localeCompare(ba, "nl") || an.localeCompare(bn, "nl");
      });
  const gebruikt = new Map<string, number>();
  const kolommen: AntwoordenKolom[] = scans.map((s, i) => {
    if (opties.anoniem) return { invullingId: s.invulling.id, naam: "", initialen: `R${i + 1}` };
    const basis = initialenVan(s.naam);
    const keer = (gebruikt.get(basis) ?? 0) + 1;
    gebruikt.set(basis, keer);
    return { invullingId: s.invulling.id, naam: s.naam, initialen: keer === 1 ? basis : `${basis}${keer}` };
  });

  const gemiddeld = gemiddeldeAntwoordenVoorMeting(assessment, scans.map((s) => s.invulling));
  let beantwoord = 0;
  let mogelijk = 0;
  let laagste: AntwoordenWeergave["laagsteVraag"] = null;
  let hoogste: AntwoordenWeergave["hoogsteVraag"] = null;

  const rijen: AntwoordenBouwblokRij[] = bouwblokRijen(assessment).map((rij) => {
    const vragen: AntwoordenVraagRij[] = rij.bouwblok.vragen.map((vraag) => {
      const antwoorden = scans.map((s) => {
        const a = s.invulling.antwoorden[vraag.id];
        return typeof a === "number" ? a : null;
      });
      const gegeven = antwoorden.filter((a): a is number => a !== null);
      return {
        vraagId: vraag.id,
        nummer: `${rij.bouwblok.volgnummer}.${vraag.volgnummer}`,
        tekst: vraag.tekst,
        antwoorden,
        gemiddelde: gemiddelde(gegeven),
        n: gegeven.length,
      };
    });
    // Een gearchiveerde vraag die niemand beantwoordde, heeft geen rij: Er valt niets te tonen.
    const getoond = vragen.filter((v, i) => v.n > 0 || !rij.bouwblok.vragen[i].gearchiveerd);
    for (const v of getoond) {
      if (v.gemiddelde === null) continue;
      if (laagste === null || v.gemiddelde < laagste.score) laagste = { score: v.gemiddelde, bouwblok: rij.bouwblok.naam, nummer: v.nummer };
      if (hoogste === null || v.gemiddelde > hoogste.score) hoogste = { score: v.gemiddelde, bouwblok: rij.bouwblok.naam, nummer: v.nummer };
    }
    beantwoord += getoond.reduce((n, v) => n + v.n, 0);
    mogelijk += getoond.length * scans.length;
    return {
      rij,
      scores: scans.map((s) => bouwblokScoreRuw(rij.bouwblok, s.invulling.antwoorden)),
      gemiddelde: scans.length === 0 ? null : bouwblokScoreRuw(rij.bouwblok, gemiddeld),
      n: getoond.reduce((n, v) => n + v.n, 0),
      vragen: getoond,
    };
  });

  return {
    kolommen,
    rijen,
    totaal: scans.map((s) => overallScore(assessment, s.invulling.antwoorden)),
    totaalGemiddelde: scans.length === 0 ? null : overallScore(assessment, gemiddeld),
    totaalN: beantwoord,
    aantalRespondenten: scans.length,
    beantwoord,
    mogelijk,
    laagsteVraag: laagste,
    hoogsteVraag: hoogste,
  };
}


/* ---------- I. Eenheden: onderdelen, Metingen en organisaties ---------- */

/**
 * Een eenheid in een groep (`visualisatie-scores.md`, I en J): Bij een samengestelde Meting en een vergelijking een onderdeel (een
 * Meting), bij een benchmark tussen organisaties een lid. Elke eenheid heeft haar gemiddelde antwoord per vraag en telt even zwaar
 * mee, ongeacht het aantal scans (`datamodel.md`, Gemiddelde over een groep leden). De weergaven A en B rekenen met de eenheden
 * alsof het scans zijn, zodat er geen tweede rekenmethode bij komt.
 */
export interface EenheidInvoer {
  id: string;
  label: string;
  /** Onder de naam, bijvoorbeeld de meetdatum. */
  sublabel?: string;
  aantalScans: number;
  antwoorden: Record<string, number>;
}

/** De eenheden als afgeronde scans met het gemiddelde antwoord van de eenheid. Het id is `eenheid-<id>`. */
export function eenhedenAlsScans(eenheden: EenheidInvoer[]): ScanInvulling[] {
  return eenheden.map(
    (e) =>
      ({
        id: eenheidScanId(e.id),
        scanUitvoeringId: "",
        organisatieLidId: "",
        status: "afgerond",
        antwoorden: e.antwoorden,
        opmerkingenPerBouwblok: {},
        aangemaaktOp: "",
        uitgenodigdOp: "",
        gestartOp: null,
        afgerondOp: null,
        bewaarVerlengdTot: null,
      }) as ScanInvulling
  );
}

export function eenheidScanId(id: string): string {
  return `eenheid-${id}`;
}

/** Weergave A over eenheden: Een stip op het gemiddelde van de eenheden en een lijn van de laagste tot de hoogste eenheid. */
export function eenhedenGemiddeld(assessment: Assessment, eenheden: EenheidInvoer[]): EenMetingWeergave {
  return eenMeting(assessment, eenhedenAlsScans(eenheden));
}

/** Weergave B over eenheden (Spreiding tussen onderdelen of organisaties). Met `focusId` krijgt die eenheid de ring en telt ze niet mee. */
export function eenhedenSpreiding(assessment: Assessment, eenheden: EenheidInvoer[], focusId?: string): SpreidingWeergave {
  return spreiding(assessment, eenhedenAlsScans(eenheden), focusId ? eenheidScanId(focusId) : undefined);
}

/** Spreiding tussen onderdelen is er vanaf drie onderdelen: Bij twee zegt een standaardafwijking weinig (`visualisatie-scores.md`, I). */
export const MIN_ONDERDELEN_SPREIDING = 3;

/** De zes vormen van Naast elkaar, in de volgorde waarin de onderdelen ze krijgen (`visualisatie-scores.md`, I). */
export type Vorm = "cirkel" | "ruit" | "vierkant" | "driehoek-omhoog" | "driehoek-omlaag" | "plus";
export const VORMEN: Vorm[] = ["cirkel", "ruit", "vierkant", "driehoek-omhoog", "driehoek-omlaag", "plus"];
export const VORM_NAAM: Record<Vorm, string> = {
  cirkel: "cirkel",
  ruit: "ruit",
  vierkant: "vierkant",
  "driehoek-omhoog": "driehoek omhoog",
  "driehoek-omlaag": "driehoek omlaag",
  plus: "plus",
};
/** Naast elkaar is er bij hoogstens zes onderdelen: Er zijn zes vormen. */
export const MAX_NAAST_ELKAAR = VORMEN.length;

/** De vorm van de eenheid op deze plek in de invoer. */
export function vormVoor(index: number): Vorm {
  return VORMEN[index % VORMEN.length];
}

export interface PuntMeerdere {
  /** De index van de eenheid in de invoer, en dus van haar vorm. */
  index: number;
  score: number;
  klasse: Classificatie;
}

export interface RijMeerdere {
  rij: BouwblokRij;
  punten: PuntMeerdere[];
  /** Het gemiddelde van de eenheden op deze rij (de streep). */
  gemiddelde: number | null;
  /** Hoogste min laagste getoonde score van de rij. */
  verschil: number | null;
}

export interface MeerdereWeergave {
  eenheden: { id: string; label: string; sublabel?: string; vorm: Vorm; aantalScans: number; totaal: number | null; totaalKlasse: Classificatie | null }[];
  rijen: RijMeerdere[];
  hoogste: { label: string; totaal: number } | null;
  laagste: { label: string; totaal: number } | null;
  grootsteVerschil: { naam: string; verschil: number } | null;
}

/**
 * Weergave A als Naast elkaar bij meer dan twee eenheden (`visualisatie-scores.md`, I): Elke eenheid heeft een eigen vorm op haar
 * eigen score, gekleurd naar de klasse, met de streep op het gemiddelde. Eenheden met dezelfde score staan onder elkaar
 * gestapeld. De vorm onderscheidt de eenheden, niet de kleur.
 */
export function eenhedenNaastElkaar(assessment: Assessment, eenheden: EenheidInvoer[]): MeerdereWeergave {
  const rijen: RijMeerdere[] = bouwblokRijen(assessment).map((rij) => {
    const punten: PuntMeerdere[] = [];
    eenheden.forEach((e, index) => {
      const score = bouwblokScore(rij.bouwblok, e.antwoorden);
      const klasse = klasseVan(score);
      if (score !== null && klasse) punten.push({ index, score, klasse });
    });
    const gem = gemiddelde(punten.map((p) => p.score));
    const scores = punten.map((p) => p.score);
    return {
      rij,
      punten,
      gemiddelde: gem,
      verschil: scores.length > 0 ? rond1(Math.max(...scores) - Math.min(...scores)) : null,
    };
  });
  const totalen = eenheden.map((e) => (e.aantalScans === 0 ? null : overallScore(assessment, e.antwoorden)));
  const metTotaal = eenheden
    .map((e, i) => ({ label: e.label, totaal: totalen[i] }))
    .filter((k): k is { label: string; totaal: number } => k.totaal !== null);
  const hoogste = metTotaal.reduce<(typeof metTotaal)[number] | null>((m, k) => (m === null || k.totaal > m.totaal ? k : m), null);
  const laagste = metTotaal.reduce<(typeof metTotaal)[number] | null>((m, k) => (m === null || k.totaal < m.totaal ? k : m), null);
  const grootste = rijen.reduce<RijMeerdere | null>((m, r) => (r.verschil !== null && (m === null || r.verschil > (m.verschil ?? -1)) ? r : m), null);
  return {
    eenheden: eenheden.map((e, i) => ({
      id: e.id,
      label: e.label,
      sublabel: e.sublabel,
      vorm: vormVoor(i),
      aantalScans: e.aantalScans,
      totaal: totalen[i],
      totaalKlasse: klasseVan(totalen[i]),
    })),
    rijen,
    hoogste,
    laagste,
    grootsteVerschil: grootste && grootste.verschil !== null ? { naam: grootste.rij.bouwblok.naam, verschil: grootste.verschil } : null,
  };
}

/** Eenheden met dezelfde score op een rij staan onder elkaar, in het midden uitgelijnd: De k-de van n op `k − (n − 1) / 2` stapjes. */
export function stapelStappen(scores: number[]): number[] {
  const aantal = new Map<string, number>();
  for (const s of scores) aantal.set(s.toFixed(3), (aantal.get(s.toFixed(3)) ?? 0) + 1);
  const geteld = new Map<string, number>();
  return scores.map((score) => {
    const sleutel = score.toFixed(3);
    const k = geteld.get(sleutel) ?? 0;
    geteld.set(sleutel, k + 1);
    return k - ((aantal.get(sleutel) ?? 1) - 1) / 2;
  });
}
