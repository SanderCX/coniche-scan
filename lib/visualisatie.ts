/**
 * Berekeningen voor de visualisatie van hoge en lage scores (`visualisatie-scores.md`, onderdeel A tot en met E). Pure
 * functies zonder opslag. Alles wordt berekend en nooit opgeslagen. De scores komen uit de gedeelde scorefunctie
 * (`lib/scoring.ts`): Een gemiddelde over een groep is het gemiddelde antwoord per vraag en daarop de bouwblokscore, zoals bij
 * de benchmark (`benchmark.md`, Gedeelde regels). Er is dus geen tweede rekenmethode.
 *
 * Getoonde waarden zijn op één decimaal afgerond (half-away-from-zero). Posities, spreiding en kwartielen rekenen met de
 * ruwe waarde, zodat bij vier vragen per bouwblok de stappen van 0,25 behouden blijven.
 */
import { Assessment, Bouwblok, Classificatie, ScanInvulling } from "./types";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";
import {
  bouwblokScore,
  bouwblokScoreRuw,
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
    const scores = groep.map((s) => bouwblokScoreRuw(rij.bouwblok, s.antwoorden)).filter((w): w is number => w !== null);
    const gem = gemiddelde(scores);
    const sd = steekproefSd(scores);
    const focusScore = focus ? bouwblokScoreRuw(rij.bouwblok, focus.antwoorden) : null;
    return {
      rij,
      scores,
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
  const vorig = gemiddeldeAntwoordenVoorMeting(assessment, vorigeInvullingen);
  const huidig = gemiddeldeAntwoordenVoorMeting(assessment, huidigeInvullingen);
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
}

export interface MatrixWeergave {
  kolommen: { label: string; sublabel?: string; aantalScans: number; totaal: number | null; totaalKlasse: Classificatie | null }[];
  rijen: MatrixRij[];
  hoogsteMeting: { label: string; totaal: number } | null;
  laagsteMeting: { label: string; totaal: number } | null;
  grootsteVerschil: { naam: string; verschil: number } | null;
  aantalAfwijkend: number;
}

/** Een afwijking van deze grootte of meer van het rijgemiddelde krijgt een rand (`visualisatie-scores.md`, E). */
export const MATRIX_AFWIJKING = 0.5;

export function matrix(assessment: Assessment, kolommen: MatrixKolomInvoer[]): MatrixWeergave {
  const rijen: MatrixRij[] = bouwblokRijen(assessment).map((rij) => {
    const scores = kolommen.map((k) => bouwblokScore(rij.bouwblok, k.antwoorden));
    const aanwezig = scores.filter((s): s is number => s !== null);
    const gem = gemiddelde(aanwezig);
    const cellen: MatrixCel[] = scores.map((score) => ({
      score,
      klasse: klasseVan(score),
      // Op de getoonde waarden: Een afwijking van precies 0,5 telt mee.
      afwijkend: score !== null && gem !== null && rond1(Math.abs(score - gem)) >= MATRIX_AFWIJKING,
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
    };
  });
  const totalen = kolommen.map((k) => (k.aantalScans === 0 ? null : overallScore(assessment, k.antwoorden)));
  const metTotaal = kolommen
    .map((k, i) => ({ label: k.label, totaal: totalen[i] }))
    .filter((k): k is { label: string; totaal: number } => k.totaal !== null);
  const hoogste = metTotaal.reduce<(typeof metTotaal)[number] | null>((m, k) => (m === null || k.totaal > m.totaal ? k : m), null);
  const laagste = metTotaal.reduce<(typeof metTotaal)[number] | null>((m, k) => (m === null || k.totaal < m.totaal ? k : m), null);
  const grootste = rijen.reduce<MatrixRij | null>((m, r) => (r.verschil !== null && (m === null || r.verschil > (m.verschil ?? -1)) ? r : m), null);
  return {
    kolommen: kolommen.map((k, i) => ({
      label: k.label,
      sublabel: k.sublabel,
      aantalScans: k.aantalScans,
      totaal: totalen[i],
      totaalKlasse: klasseVan(totalen[i]),
    })),
    rijen,
    hoogsteMeting: hoogste,
    laagsteMeting: laagste,
    grootsteVerschil: grootste && grootste.verschil !== null ? { naam: grootste.rij.bouwblok.naam, verschil: grootste.verschil } : null,
    aantalAfwijkend: rijen.reduce((n, r) => n + r.cellen.filter((c) => c.afwijkend).length, 0),
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

/** Sorteersleutel: De achternaam (het laatste woord), daarna de hele naam. Het e-mailadres staat voor wie geen naam heeft. */
function achternaamSleutel(naam: string): [string, string] {
  const woorden = naam.trim().split(/\s+/).filter(Boolean);
  return [(woorden[woorden.length - 1] ?? "").toLowerCase(), naam.trim().toLowerCase()];
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
  naamVan: (invulling: ScanInvulling) => string
): AntwoordenWeergave {
  const scans = afgerond(invullingen)
    .map((i) => ({ invulling: i, naam: naamVan(i) }))
    .sort((a, b) => {
      const [aa, an] = achternaamSleutel(a.naam);
      const [ba, bn] = achternaamSleutel(b.naam);
      return aa.localeCompare(ba, "nl") || an.localeCompare(bn, "nl");
    });
  const gebruikt = new Map<string, number>();
  const kolommen: AntwoordenKolom[] = scans.map((s) => {
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
