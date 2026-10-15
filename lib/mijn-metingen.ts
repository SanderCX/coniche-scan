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
  /** 0 tot en met 1. */
  fractie: number;
  /** De tekst rechts van de balk: "3,4" of "8/12 · 67%". */
  waarde: string;
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
  /** Regel onder het getal: "35 van 60 punten" of "Gemiddelde van 5 afgeronde scans". */
  sub: string | null;
  rijen: TeaserRij[];
}

const KLASSE_KLEUR: Record<Classificatie, string> = {
  groen: "var(--stat-green)",
  oranje: "var(--stat-amber)",
  rood: "var(--stat-red)",
};

const komma = (n: number, dec = 1) => n.toFixed(dec).replace(".", ",");

/** De celtint van een score (`stylesheet.md`, Drie niveaus van scorekleur): Stap 1 tot en met 5, afgerond op de getoonde waarde. */
export function celStap(score: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(Number(score.toFixed(1))))) as 1 | 2 | 3 | 4 | 5;
}

function schaalTeaser(assessment: Assessment, antwoorden: Record<string, Antwoord>, metSub: string | null, metGetal: boolean): Teaser | null {
  const overall = overallScore(assessment, antwoorden);
  if (overall === null) return null;
  const stap = celStap(overall);
  const klasse = classificatie(overall);
  const rijen: TeaserRij[] = [];
  // Zonder categorielaag (de AI-scan) is er alleen het totaal met de klassenpil.
  if (!isVlakkeAssessment(assessment)) {
    const groepen = alleGroepResultaten(assessment, alleBouwblokResultaten(assessment, antwoorden), antwoorden);
    for (const g of groepen) {
      if (g.score === null) continue;
      rijen.push({
        sleutel: g.groepId,
        naam: g.groepNaam,
        // `Categorie.kleur` is een sleutel ("blauw"), de hex staat in `CATEGORIE_COLORS` (`stylesheet.md`, Categoriekleuren).
        kleur: (g.kleur && CATEGORIE_COLORS[g.kleur as keyof typeof CATEGORIE_COLORS]?.hex) || "var(--or)",
        fractie: g.score / 5,
        waarde: komma(g.score),
      });
    }
  }
  void metGetal;
  return {
    soort: "schaal",
    getal: komma(overall),
    klasseNaam: CLASSIFICATIE_INFO[klasse].label,
    getalKleur: null,
    pilAchtergrond: `var(--score-${stap}-cel)`,
    pilTekst: `var(--score-${stap}-cel-tekst)`,
    sub: metSub,
    rijen,
  };
}

function quickscanTeaser(resultaat: QuickscanResultaat, metingModus: boolean, n?: number): Teaser | null {
  if (resultaat.percentage === null || resultaat.klasse === null) return null;
  const rijen: TeaserRij[] = resultaat.afdelingen
    .filter((a) => a.vanToepassing && a.percentage !== null && a.klasse !== null)
    .map((a) => ({
      sleutel: a.categorie.id,
      naam: a.categorie.naam,
      kleur: KLASSE_KLEUR[a.klasse as Classificatie],
      fractie: (a.percentage as number) / 100,
      // Een scan toont "punten/maximum · percentage", de hele meting alleen het percentage.
      waarde: metingModus ? `${a.percentage}%` : `${a.punten}/${a.maximum} · ${a.percentage}%`,
    }));
  return {
    soort: "percentage",
    getal: `${resultaat.percentage}%`,
    klasseNaam: KLASSE_NAAM.totaal[resultaat.klasse],
    getalKleur: KLASSE_KLEUR[resultaat.klasse],
    pilAchtergrond: null,
    pilTekst: null,
    sub: metingModus ? `Gemiddelde van ${n} afgeronde scans` : `${komma(resultaat.punten, 0)} van ${komma(resultaat.maximum, 0)} punten`,
    rijen,
  };
}

/** De teaser van een gemiddelde dat al is uitgerekend, bijvoorbeeld van een samengestelde Meting (alleen voor scans met een schaal). */
export function teaserVoorGemiddelden(assessment: Assessment, gemiddeldeAntwoorden: Record<string, number>, aantalScans: number): Teaser | null {
  if (isJaNeeWeetNiet(assessment)) return null;
  return schaalTeaser(assessment, gemiddeldeAntwoorden, `Gemiddelde van ${aantalScans} afgeronde scans`, true);
}

/** De teaser van één afgeronde scan. `null` als er niets te tonen is. */
export function teaserVoorScan(
  assessment: Assessment,
  antwoorden: Record<string, Antwoord>,
  relevantie?: Record<string, boolean>
): Teaser | null {
  if (isJaNeeWeetNiet(assessment)) return quickscanTeaser(quickscanResultaat(assessment, antwoorden, relevantie), false);
  return schaalTeaser(assessment, antwoorden, null, false);
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
    return quickscanTeaser(resultaat, true, afgerond.length);
  }
  const gemiddeld = gemiddeldeAntwoordenVoorMeting(assessment, afgerond);
  return schaalTeaser(assessment, gemiddeld, `Gemiddelde van ${afgerond.length} afgeronde scans`, true);
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
