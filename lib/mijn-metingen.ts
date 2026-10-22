/**
 * Rekenwerk voor de pagina "Mijn metingen" (`visualisatie-mijn-metingen.md`): De teaser van een afgeronde scan en van de hele
 * Meting, de volgorde van de secties en de relatieve tijd bij "Laatst opgeslagen". Pure functies. De getallen komen uit dezelfde
 * berekening als de resultatenpagina (`lib/scoring.ts`, `lib/quickscan.ts`), er is geen aparte opslag van teaserwaarden.
 */
import { Antwoord, Assessment, ScanInvulling } from "./types";
import { isVlakkeAssessment } from "./assessment-structuur";
import {
  alleBouwblokResultaten,
  alleGroepResultaten,
  classificatie,
  gemiddeldeAntwoordenVoorMeting,
  overallScore,
} from "./scoring";
import { KLASSE_NAAM, isJaNeeWeetNiet, quickscanResultaat, QuickscanResultaat } from "./quickscan";
import { metingAlsResultaat, quickscanMeting, quickscanScansVan } from "./quickscan-groep";
import { Classificatie } from "./types";
import { isSpanning, spanningZin, spanningProfiel, groepProfiel, spanningScansVan, fmt1, niveauNaam, veldKorteNaam } from "./spanning";
import { veldKleur, tekstOpVeldKleur, domeinKleur, tekstOpKleur } from "./colors";
import { kleineLetter } from "./visualisatie";
import { CATEGORIE_COLORS, CLASSIFICATIE_INFO } from "./colors";

const MAANDEN_LANG = [
  "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december",
];

/** "12 oktober 2026" uit een datum (`JJJJ-MM-DD`) of een ISO-tijdstip. Leeg als er geen datum in te lezen is. */
export function langeDatum(tijdstip: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(tijdstip ?? "");
  if (!m) return "";
  return `${Number(m[3])} ${MAANDEN_LANG[Number(m[2]) - 1]} ${m[1]}`;
}

/** "oktober 2026", voor "Meting oktober 2026". */
export function maandJaarLang(datum: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})/.exec(datum ?? "");
  return m ? `${MAANDEN_LANG[Number(m[2]) - 1]} ${m[1]}` : "";
}

/** Het aantal kalenderdagen tussen twee tijdstippen in de lokale tijdzone, `nu` minus `eerder`. */
function dagenTussen(eerder: Date, nu: Date): number {
  const a = Date.UTC(eerder.getFullYear(), eerder.getMonth(), eerder.getDate());
  const b = Date.UTC(nu.getFullYear(), nu.getMonth(), nu.getDate());
  return Math.round((b - a) / 86_400_000);
}

/** Tot en met dit aantal dagen staat "Laatst opgeslagen" in dagen, daarna als datum (`visualisatie-mijn-metingen.md`, Inhoud per status). */
export const MAX_DAGEN_RELATIEF = 6;

/**
 * "vandaag", "gisteren", "3 dagen geleden" en vanaf 7 dagen de datum ("12 oktober 2026"). Bij een ontbrekend of ongeldig tijdstip
 * is het leeg: De regel "Laatst opgeslagen" vervalt dan.
 */
export function laatstOpgeslagenTekst(tijdstip: string | null | undefined, nu: Date = new Date()): string {
  if (!tijdstip) return "";
  const t = new Date(tijdstip);
  if (Number.isNaN(t.getTime())) return "";
  const dagen = dagenTussen(t, nu);
  if (dagen <= 0) return "vandaag";
  if (dagen === 1) return "gisteren";
  if (dagen <= MAX_DAGEN_RELATIEF) return `${dagen} dagen geleden`;
  return langeDatum(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`);
}

/* ---------- Teaser ---------- */

export interface TeaserRij {
  sleutel: string;
  naam: string;
  /** Kleur van de balk (een CSS-waarde). */
  kleur: string;
  /** 0 tot en met 1. Bij een schaal van 1 tot 5 is dat (score − 1) / 4: Het spoor begint op 1 (`visualisatie-mijn-metingen.md`, Schaal). */
  fractie: number;
  /** Alleen bij de hele Meting met een schaal: De laagste en hoogste score van een afgeronde scan, op dezelfde schaal als `fractie`. */
  lijn?: { van: number; tot: number };
  /** Tekstalternatief van de rij, bijvoorbeeld "Overkoepelend, gemiddelde 2,7, laagste 2,0, hoogste 3,6". */
  alt: string;
  /** De tekst rechts van de balk: "3,4" of "8/12 · 67%". Bij `nietBeantwoord` een streepje. */
  waarde: string;
  /** Alleen bij de Spanningsmeter: Het nummer van het veld in een bolletje in de veldkleur, voor de naam. */
  nummer?: { nr: number; achtergrond: string; tekst: string };
  /**
   * Alleen bij de Quickscan: De vragen van de afdeling zijn in deze scan niet beantwoord. De rij blijft staan, zonder balk en met een
   * streepje, en de afdeling telt niet mee in het totaal (`visualisatie-mijn-metingen.md`, Quickscan, Afdeling niet beantwoord).
   */
  nietBeantwoord?: boolean;
}

export interface Teaser {
  soort: "schaal" | "percentage";
  /** Het hoofdgetal: "3,4" of "58%". */
  getal: string;
  /** De klassenaam: Altijd naast de kleur, kleur is nooit het enige signaal. */
  klasseNaam: string | null;
  /** Kleur van het getal (alleen bij percentage) en van de klassenpil. */
  getalKleur: string | null;
  pilAchtergrond: string | null;
  pilTekst: string | null;
  /** Regel onder het getal: "35 van 60 punten". Bij de hele Meting leeg: Het aantal scans staat achter de titel. */
  sub: string | null;
  /**
   * `balk`: Een balk van 8px (eigen scan, en de Quickscan). `stip`: Een stip op het gemiddelde met een lijn van laagste tot hoogste
   * (hele Meting, voorstel van 19 oktober 2026). Alleen `stip` en `balk` met een schaal van 1 tot 5 tonen de ankers "1" en "5".
   */
  stijl: "balk" | "stip";
  /** De ankers "1" en "5" onder de onderste rij: Alleen bij een schaal van 1 tot 5. */
  ankers: boolean;
  /** Alleen bij de hele Meting: Het aantal afgeronde scans waarover het gemiddelde gaat, voor achter de titel ("6 scans"). */
  aantalScans?: number;
  rijen: TeaserRij[];
  /**
   * Voor de Kaart met cirkel (`visualisatie-mijn-metingen.md`, voorstel van 19 oktober 2026): De vulling van de ring (0 tot en met 1) en
   * de volle kleur van de afgeronde score of klasse, en de kleuren van de klassenchip.
   */
  ring: { fractie: number; kleur: string; chipAchtergrond: string; chipTekst: string };
  /** Alleen bij de Spanningsmeter: Het label onder het getal in de ring ("Gemiddeld niveau" in plaats van "Totaalscore"). */
  ringLabel?: string;
  /** Alleen bij de Spanningsmeter: Het tekstalternatief van de ring ("Gemiddeld niveau 3,1, Georganiseerd"). */
  ringAlt?: string;
  /** Alleen bij de Spanningsmeter: De kop boven de rijen ("Per spanningsveld"). */
  rijenLabel?: string;
  /** Alleen bij de Spanningsmeter: De zin over de grootste spanning onder het paneel ("Technologie loopt 1,8 voor op ..."). */
  spanningsZin?: string | null;
}

const KLASSE_KLEUR: Record<Classificatie, string> = {
  groen: "var(--stat-green)",
  oranje: "var(--stat-amber)",
  rood: "var(--stat-red)",
};

/** De celkleuren van de klassenchip bij een percentage (`visualisatie-quickscan.md`, Nieuwe stijlwaarden). */
export const KLASSE_CHIP: Record<Classificatie, { achtergrond: string; tekst: string }> = {
  groen: { achtergrond: "#e7f6ef", tekst: "#0e4d30" },
  oranje: { achtergrond: "#fdf2e3", tekst: "#6b3a00" },
  rood: { achtergrond: "#fdecec", tekst: "#7f1d1d" },
};

const komma = (n: number, dec = 1) => n.toFixed(dec).replace(".", ",");

/** De celtint van een score (`stylesheet.md`, Drie niveaus van scorekleur): Stap 1 tot en met 5, afgerond op de getoonde waarde. */
export function celStap(score: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(Number(score.toFixed(1))))) as 1 | 2 | 3 | 4 | 5;
}

/** Een score op de schaal 1 tot 5 als fractie van het spoor (0 tot en met 1). */
export function schaalFractie(score: number): number {
  return Math.min(1, Math.max(0, (score - 1) / 4));
}

/** "domein" wordt "Domein" (de eerste letter als hoofdletter). */
function komaHoofd(woord: string): string {
  return woord.charAt(0).toUpperCase() + woord.slice(1);
}

function schaalTeaser(
  assessment: Assessment,
  antwoorden: Record<string, Antwoord>,
  aantalScans?: number,
  spreiding?: Map<string, { van: number; tot: number }>
): Teaser | null {
  const overall = overallScore(assessment, antwoorden);
  if (overall === null) return null;
  const stap = celStap(overall);
  const klasse = classificatie(overall);
  const rijen: TeaserRij[] = [];
  if (isVlakkeAssessment(assessment)) {
    // Zonder categorielaag (de AI-scan, besloten door Joost op 22 oktober 2026): Een rij per domein, in de vaste volgorde 1 tot en met 8
    // (niet op score), met het nummer in de domeinkleur en "Per domein" als kop (`visualisatie-mijn-metingen.md`, AI-scan).
    for (const b of alleBouwblokResultaten(assessment, antwoorden)) {
      if (b.score === null) continue;
      const nr = b.bouwblok.volgnummer;
      const kleur = CATEGORIE_COLORS[domeinKleur(nr)].hex;
      const bereik = spreiding?.get(b.bouwblok.id);
      rijen.push({
        sleutel: b.bouwblok.id,
        naam: b.bouwblok.naam,
        nummer: { nr, achtergrond: kleur, tekst: tekstOpKleur(kleur) },
        kleur,
        fractie: schaalFractie(b.score),
        ...(bereik ? { lijn: { van: schaalFractie(bereik.van), tot: schaalFractie(bereik.tot) } } : {}),
        // Bijvoorbeeld "Domein 3, Use-cases en automatisering, jouw score 2,0, gemiddelde 3,4, laagste 2,0, hoogste 4,2".
        alt: bereik
          ? `${komaHoofd(assessment.bouwblokEenheidEnkelvoud)} ${nr}, ${b.bouwblok.naam}, gemiddelde ${komma(b.score)}, laagste ${komma(bereik.van)}, hoogste ${komma(bereik.tot)}`
          : `${komaHoofd(assessment.bouwblokEenheidEnkelvoud)} ${nr}, ${b.bouwblok.naam}, ${aantalScans === undefined ? "jouw score" : "gemiddelde"} ${komma(b.score)}`,
        waarde: komma(b.score),
      });
    }
  } else {
    const groepen = alleGroepResultaten(assessment, alleBouwblokResultaten(assessment, antwoorden), antwoorden);
    for (const g of groepen) {
      if (g.score === null) continue;
      const bereik = spreiding?.get(g.groepId);
      rijen.push({
        sleutel: g.groepId,
        naam: g.groepNaam,
        // `Categorie.kleur` is een sleutel ("blauw"), de hex staat in `CATEGORIE_COLORS` (`stylesheet.md`, Categoriekleuren).
        kleur: (g.kleur && CATEGORIE_COLORS[g.kleur as keyof typeof CATEGORIE_COLORS]?.hex) || "var(--or)",
        fractie: schaalFractie(g.score),
        ...(bereik ? { lijn: { van: schaalFractie(bereik.van), tot: schaalFractie(bereik.tot) } } : {}),
        alt: bereik
          ? `${g.groepNaam}, gemiddelde ${komma(g.score)}, laagste ${komma(bereik.van)}, hoogste ${komma(bereik.tot)}`
          : `${g.groepNaam}, ${aantalScans === undefined ? "jouw score" : "gemiddelde"} ${komma(g.score)}`,
        waarde: komma(g.score),
      });
    }
  }
  return {
    soort: "schaal",
    getal: komma(overall),
    klasseNaam: CLASSIFICATIE_INFO[klasse].label,
    getalKleur: null,
    pilAchtergrond: `var(--score-${stap}-cel)`,
    pilTekst: `var(--score-${stap}-cel-tekst)`,
    sub: null,
    stijl: aantalScans !== undefined ? "stip" : "balk",
    ankers: rijen.length > 0,
    ...(aantalScans !== undefined ? { aantalScans } : {}),
    rijen,
    ring: { fractie: schaalFractie(overall), kleur: `var(--score-${stap})`, chipAchtergrond: `var(--score-${stap}-cel)`, chipTekst: `var(--score-${stap}-cel-tekst)` },
    ...(isVlakkeAssessment(assessment) && rijen.length > 0 ? { rijenLabel: `Per ${kleineLetter(assessment.bouwblokEenheidEnkelvoud)}` } : {}),
  };
}

const KORT = (n: number) => fmt1(n);

/**
 * De teaser van de Spanningsmeter (`visualisatie-spanningsmeter.md`, Mijn metingen): De ring toont het Gemiddeld niveau (een
 * weergave, geen score), per spanningsveld een rij met het nummer in de veldkleur en de korte naam, en de zin over de grootste
 * spanning. Eigen scan: Een balk per veld. Hele Meting (`scans` gezet): Het gemiddelde met de laagste tot hoogste score van een scan.
 */
function spanningTeaser(assessment: Assessment, antwoorden?: Record<string, Antwoord>, scans?: ScanInvulling[]): Teaser | null {
  const groep = scans ? groepProfiel(assessment, spanningScansVan(scans)) : null;
  const profiel = groep ?? (antwoorden ? spanningProfiel(assessment, antwoorden) : null);
  if (!profiel || !profiel.gemiddeld) return null;
  const gem = profiel.gemiddeld;
  const stap = celStap(gem.score);
  const niveau = niveauNaam(assessment, gem.niveau);
  const rijen: TeaserRij[] = profiel.velden.map((v) => {
    const g = groep ? groep.velden.find((x) => x.veld.id === v.veld.id) : null;
    const naam = veldKorteNaam(v.veld);
    const nummer = { nr: v.volgnummer, achtergrond: veldKleur(v.volgnummer), tekst: tekstOpVeldKleur(v.volgnummer) };
    if (v.score === null) {
      return { sleutel: v.veld.id, naam, nummer, kleur: veldKleur(v.volgnummer), fractie: 0, alt: `${v.veld.naam}, onvoldoende zicht`, waarde: "–", nietBeantwoord: true };
    }
    return {
      sleutel: v.veld.id,
      naam,
      nummer,
      kleur: veldKleur(v.volgnummer),
      fractie: schaalFractie(v.score),
      ...(g && g.laagste !== null && g.hoogste !== null ? { lijn: { van: schaalFractie(g.laagste), tot: schaalFractie(g.hoogste) } } : {}),
      alt:
        g && g.laagste !== null && g.hoogste !== null
          ? `${v.veld.naam}, gemiddelde ${KORT(v.score)}, laagste ${KORT(g.laagste)}, hoogste ${KORT(g.hoogste)}`
          : `${v.veld.naam}, ${KORT(v.score)}`,
      waarde: KORT(v.score),
    };
  });
  return {
    soort: "schaal",
    getal: KORT(gem.score),
    klasseNaam: niveau,
    getalKleur: null,
    pilAchtergrond: `var(--score-${stap}-cel)`,
    pilTekst: `var(--score-${stap}-cel-tekst)`,
    sub: null,
    stijl: groep ? "stip" : "balk",
    ankers: true,
    ...(groep ? { aantalScans: groep.scans } : {}),
    rijen,
    ring: { fractie: schaalFractie(gem.score), kleur: `var(--score-${stap})`, chipAchtergrond: `var(--score-${stap}-cel)`, chipTekst: `var(--score-${stap}-cel-tekst)` },
    ringLabel: "Gemiddeld niveau",
    ringAlt: `Gemiddeld niveau ${KORT(gem.score)}, ${niveau}`,
    rijenLabel: "Per spanningsveld",
    spanningsZin: profiel.grootste ? spanningZin(profiel.grootste) : null,
  };
}

function quickscanTeaser(
  resultaat: QuickscanResultaat,
  metingModus: boolean,
  n?: number,
  spreiding?: Map<string, { van: number; tot: number }>
): Teaser | null {
  if (resultaat.percentage === null || resultaat.klasse === null) return null;
  // Een afdeling zonder beantwoorde vragen blijft als rij staan, zodat de volgorde gelijk blijft.
  const rijen: TeaserRij[] = resultaat.afdelingen.map((a) =>
    a.vanToepassing && a.percentage !== null && a.klasse !== null
      ? {
          sleutel: a.categorie.id,
          naam: a.categorie.naam,
          kleur: KLASSE_KLEUR[a.klasse as Classificatie],
          fractie: (a.percentage as number) / 100,
          ...(spreiding?.get(a.categorie.id) ? { lijn: { van: spreiding.get(a.categorie.id)!.van / 100, tot: spreiding.get(a.categorie.id)!.tot / 100 } } : {}),
          alt: spreiding?.get(a.categorie.id)
            ? `${a.categorie.naam}, gemiddelde ${a.percentage}%, laagste ${spreiding.get(a.categorie.id)!.van}%, hoogste ${spreiding.get(a.categorie.id)!.tot}%`
            : `${a.categorie.naam}, ${a.percentage}%`,
          // Een scan toont "punten/maximum · percentage", de hele meting alleen het percentage.
          waarde: metingModus ? `${a.percentage}%` : `${a.punten}/${a.maximum} · ${a.percentage}%`,
        }
      : {
          sleutel: a.categorie.id,
          naam: a.categorie.naam,
          kleur: "var(--ink-s)",
          fractie: 0,
          alt: `${a.categorie.naam}, niet beantwoord`,
          waarde: "–",
          nietBeantwoord: true,
        }
  );
  return {
    soort: "percentage",
    getal: `${resultaat.percentage}%`,
    klasseNaam: KLASSE_NAAM.totaal[resultaat.klasse],
    getalKleur: KLASSE_KLEUR[resultaat.klasse],
    pilAchtergrond: null,
    pilTekst: null,
    sub: metingModus ? null : `${komma(resultaat.punten, 0)} van ${komma(resultaat.maximum, 0)} punten`,
    // De Quickscan houdt een balk met het percentage tot Joost beslist over stip en lijn (`visualisatie-mijn-metingen.md`, Open punten).
    stijl: "balk",
    ankers: false,
    ...(metingModus ? { aantalScans: n } : {}),
    rijen,
    ring: {
      fractie: resultaat.percentage / 100,
      kleur: KLASSE_KLEUR[resultaat.klasse],
      chipAchtergrond: KLASSE_CHIP[resultaat.klasse].achtergrond,
      chipTekst: KLASSE_CHIP[resultaat.klasse].tekst,
    },
  };
}

/** De teaser van een gemiddelde dat al is uitgerekend, bijvoorbeeld van een samengestelde Meting (alleen voor scans met een schaal). */
export function teaserVoorGemiddelden(assessment: Assessment, gemiddeldeAntwoorden: Record<string, number>, aantalScans: number): Teaser | null {
  if (isJaNeeWeetNiet(assessment) || isSpanning(assessment)) return null;
  return schaalTeaser(assessment, gemiddeldeAntwoorden, aantalScans);
}

/** De teaser van één afgeronde scan. `null` als er niets te tonen is. */
export function teaserVoorScan(
  assessment: Assessment,
  antwoorden: Record<string, Antwoord>,
  relevantie?: Record<string, boolean>
): Teaser | null {
  if (isJaNeeWeetNiet(assessment)) return quickscanTeaser(quickscanResultaat(assessment, antwoorden, relevantie), false);
  if (isSpanning(assessment)) return spanningTeaser(assessment, antwoorden);
  return schaalTeaser(assessment, antwoorden);
}

/** Per categorie de laagste en hoogste score van een afgeronde scan. Zonder categorielaag per domein (het bouwblok). */
function spreidingPerGroep(assessment: Assessment, afgerond: ScanInvulling[]): Map<string, { van: number; tot: number }> {
  const uit = new Map<string, { van: number; tot: number }>();
  if (isVlakkeAssessment(assessment)) {
    // Zonder categorielaag per domein (het bouwblok zelf).
    for (const scan of afgerond) {
      for (const b of alleBouwblokResultaten(assessment, scan.antwoorden)) {
        if (b.score === null) continue;
        const huidig = uit.get(b.bouwblok.id);
        uit.set(b.bouwblok.id, huidig ? { van: Math.min(huidig.van, b.score), tot: Math.max(huidig.tot, b.score) } : { van: b.score, tot: b.score });
      }
    }
    return uit;
  }
  for (const scan of afgerond) {
    const groepen = alleGroepResultaten(assessment, alleBouwblokResultaten(assessment, scan.antwoorden), scan.antwoorden);
    for (const g of groepen) {
      if (g.score === null) continue;
      const huidig = uit.get(g.groepId);
      uit.set(g.groepId, huidig ? { van: Math.min(huidig.van, g.score), tot: Math.max(huidig.tot, g.score) } : { van: g.score, tot: g.score });
    }
  }
  return uit;
}

/** Per afdeling het laagste en hoogste percentage van een afgeronde scan waarin de afdeling van toepassing is (Quickscan). */
function spreidingPerAfdeling(assessment: Assessment, afgerond: ScanInvulling[]): Map<string, { van: number; tot: number }> {
  const uit = new Map<string, { van: number; tot: number }>();
  for (const scan of afgerond) {
    for (const a of quickscanResultaat(assessment, scan.antwoorden, scan.relevantie).afdelingen) {
      if (!a.vanToepassing || a.percentage === null) continue;
      const huidig = uit.get(a.categorie.id);
      uit.set(a.categorie.id, huidig ? { van: Math.min(huidig.van, a.percentage), tot: Math.max(huidig.tot, a.percentage) } : { van: a.percentage, tot: a.percentage });
    }
  }
  return uit;
}

/**
 * De teaser van de hele Meting (Lead): Het gemiddelde van alle afgeronde scans, met "Gemiddelde van n afgeronde scans" onder het
 * getal en zonder "x/y" in de rijen. `null` zonder afgeronde scans.
 */
export function teaserVoorMeting(assessment: Assessment, invullingen: ScanInvulling[]): Teaser | null {
  const afgerond = invullingen.filter((i) => i.status === "afgerond");
  if (afgerond.length === 0) return null;
  if (isJaNeeWeetNiet(assessment)) {
    const resultaat = metingAlsResultaat(quickscanMeting(assessment, quickscanScansVan(afgerond)));
    return quickscanTeaser(resultaat, true, afgerond.length, spreidingPerAfdeling(assessment, afgerond));
  }
  if (isSpanning(assessment)) return spanningTeaser(assessment, undefined, afgerond);
  const gemiddeld = gemiddeldeAntwoordenVoorMeting(assessment, afgerond);
  return schaalTeaser(assessment, gemiddeld, afgerond.length, spreidingPerGroep(assessment, afgerond));
}

/* ---------- Secties en respons ---------- */

/** Nog te doen: Uitgenodigd of Bezig, op uitnodigingsdatum, de oudste bovenaan (wie het langst wacht, staat bovenaan). */
export function sorteerNogTeDoen<T extends { invulling: Pick<ScanInvulling, "status" | "uitgenodigdOp"> }>(items: T[]): T[] {
  return items
    .filter((i) => i.invulling.status !== "afgerond")
    .sort((a, b) => a.invulling.uitgenodigdOp.localeCompare(b.invulling.uitgenodigdOp));
}

/** Afgerond: Op afrondingsdatum, de nieuwste bovenaan. */
export function sorteerAfgerond<T extends { invulling: Pick<ScanInvulling, "status" | "afgerondOp"> }>(items: T[]): T[] {
  return items
    .filter((i) => i.invulling.status === "afgerond")
    .sort((a, b) => (b.invulling.afgerondOp ?? "").localeCompare(a.invulling.afgerondOp ?? ""));
}

export interface Respons {
  afgerond: number;
  uitgenodigd: number;
  /** Hele procenten, 0 zonder uitgenodigden. */
  percentage: number;
  compleet: boolean;
}

/** "Uitgenodigd" is het aantal `ScanInvulling`-records van de Meting, ongeacht status. */
export function responsVan(invullingen: Pick<ScanInvulling, "status">[]): Respons {
  const uitgenodigd = invullingen.length;
  const afgerond = invullingen.filter((i) => i.status === "afgerond").length;
  return {
    afgerond,
    uitgenodigd,
    percentage: uitgenodigd === 0 ? 0 : Math.round((afgerond / uitgenodigd) * 100),
    compleet: uitgenodigd > 0 && afgerond === uitgenodigd,
  };
}

/**
 * Tussenstand of eindstand (`visualisatie-mijn-metingen.md`, Open punten): Er is nog geen sluitingsdatum, dus de Meting is
 * afgesloten zodra alle uitgenodigde scans zijn afgerond.
 */
export function isEindstand(respons: Respons): boolean {
  return respons.compleet;
}

/** De voornaam voor "Welkom terug, <voornaam>": Het eerste woord van de naam. Leeg zonder naam. */
export function voornaamVan(naam: string | null | undefined): string {
  return naam?.trim().split(/\s+/)[0] ?? "";
}
