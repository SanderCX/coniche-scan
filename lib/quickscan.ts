/**
 * De score in punten en procenten voor een Assessment met antwoordType "ja-nee-weetniet" (de Quickscan, `datamodel.md`,
 * Scoreberekening; `content-ziekenhuis-quickscan.md`). Pure functies zonder opslag. Alle scores worden berekend en nooit
 * opgeslagen. Ja is 1 punt, Nee en Weet ik niet zijn 0 punten, en Weet ik niet blijft als eigen antwoord bewaard zodat het
 * resultaat per antwoord kan tellen.
 *
 * Met `p` het aantal Ja in een bouwblok, `n` het aantal vragen en `g` het gewicht (`Bouwblok.gewicht`):
 * - Bouwblokscore = `p / n`, ongewogen.
 * - Categoriescore (de afdeling) = `Σ(g × p) / Σ(g × n)`: Geen gemiddelde van de bouwblokpercentages, want dat laat een
 *   bouwblok van 1 vraag even zwaar tellen als een bouwblok van 10.
 * - Overall = `Σ(g × p) / Σ(g × n)` over de categorieën die van toepassing zijn, uit de ruwe antwoorden.
 * - Afronding alleen op getoonde waarden: Hele procenten, half-away-from-zero. Klasse en kleur volgen het afgeronde percentage.
 */
import { Antwoord, Assessment, Bouwblok, Categorie, Classificatie } from "./types";
import { categorieVanToepassing, gewichtVan } from "./scoring";

export function isJaNeeWeetNiet(assessment: Pick<Assessment, "antwoordType">): boolean {
  return assessment.antwoordType === "ja-nee-weetniet";
}

/** Grenzen van de klassen in hele procenten (`CLAUDE.md`, sectie 1, Classificatie bij Ja / Nee / Weet ik niet). */
export const GOED_OP_ORDE_VANAF = 80;
export const GEMIDDELD_VANAF = 50;

/** Hele procenten, half-away-from-zero. `breuk` is de verhouding tussen 0 en 1. */
export function procent(breuk: number): number {
  return Math.round(breuk * 100 + Number.EPSILON);
}

/** Klasse van een afgerond percentage: Rood onder 50, oranje van 50 tot en met 79, groen vanaf 80. */
export function klasseVanPercentage(percentage: number): Classificatie {
  if (percentage >= GOED_OP_ORDE_VANAF) return "groen";
  if (percentage >= GEMIDDELD_VANAF) return "oranje";
  return "rood";
}

/** De namen van de klassen bij een afdeling en een dimensie, en bij de totaalscore (`CLAUDE.md`, sectie 1). */
export const KLASSE_NAAM = {
  afdeling: { groen: "Goed op orde", oranje: "Gemiddeld inzicht", rood: "Ontwikkelruimte" },
  totaal: { groen: "Sterk ontwikkeld", oranje: "Gemiddeld ontwikkeld", rood: "Aanzienlijke ontwikkelruimte" },
} as const satisfies Record<string, Record<Classificatie, string>>;

export interface Tellingen {
  ja: number;
  nee: number;
  weetNiet: number;
}

export interface QuickscanBouwblok {
  bouwblok: Bouwblok;
  gewicht: number;
  /** Aantal Ja. */
  punten: number;
  /** Aantal vragen dat meetelt. */
  vragen: number;
  /** De exacte verhouding, voor het vergelijken van bouwblokken (niet het afgeronde percentage). */
  breuk: number | null;
  percentage: number | null;
  klasse: Classificatie | null;
  tellingen: Tellingen;
}

export interface QuickscanChip {
  bouwblok: Bouwblok;
}

export interface QuickscanAfdeling {
  categorie: Categorie;
  /** Van toepassing: `relevantie` is niet `false` (`datamodel.md`, Optionele categorieën). */
  vanToepassing: boolean;
  bouwblokken: QuickscanBouwblok[];
  /** `Σ(g × p)` en `Σ(g × n)`. Bij gewicht 1 overal het aantal Ja en het aantal vragen. */
  punten: number;
  maximum: number;
  breuk: number | null;
  percentage: number | null;
  klasse: Classificatie | null;
  tellingen: Tellingen;
  /** Het bouwblok met de laagste score, alleen bij minstens 2 bouwblokken en als het er één is (geen gelijkstand). */
  aandachtspunt: QuickscanBouwblok | null;
  /** Het bouwblok met de hoogste score onder de bouwblokken met minstens 3 vragen, alleen als het er één is. */
  sterksteBasis: QuickscanBouwblok | null;
}

export interface QuickscanResultaat {
  afdelingen: QuickscanAfdeling[];
  /** `Σ(g × p)` en `Σ(g × n)` over de afdelingen die van toepassing zijn. */
  punten: number;
  maximum: number;
  percentage: number | null;
  klasse: Classificatie | null;
  aantalVanToepassing: number;
  aantalAfdelingen: number;
  /** De afdelingen met het hoogste percentage. Leeg als er maar één afdeling van toepassing is of alle gelijk zijn. */
  sterkste: QuickscanAfdeling[];
  /** De afdelingen met het laagste percentage. Leeg onder dezelfde voorwaarden. */
  meesteOntwikkelruimte: QuickscanAfdeling[];
}

/** Een bouwblok telt zijn niet-gearchiveerde vragen, en een gearchiveerde vraag alleen als er een antwoord op staat. */
function meetellendeVragen(bouwblok: Bouwblok, antwoorden: Record<string, Antwoord>) {
  return bouwblok.vragen.filter((v) => !v.gearchiveerd || antwoorden[v.id] !== undefined);
}

function bouwblokResultaat(bouwblok: Bouwblok, antwoorden: Record<string, Antwoord>): QuickscanBouwblok {
  const vragen = meetellendeVragen(bouwblok, antwoorden);
  const tellingen: Tellingen = { ja: 0, nee: 0, weetNiet: 0 };
  for (const v of vragen) {
    const a = antwoorden[v.id];
    if (a === "ja") tellingen.ja += 1;
    else if (a === "nee") tellingen.nee += 1;
    else if (a === "weet-niet") tellingen.weetNiet += 1;
  }
  const n = vragen.length;
  const breuk = n === 0 ? null : tellingen.ja / n;
  const percentage = breuk === null ? null : procent(breuk);
  return {
    bouwblok,
    gewicht: gewichtVan(bouwblok),
    punten: tellingen.ja,
    vragen: n,
    breuk,
    percentage,
    klasse: percentage === null ? null : klasseVanPercentage(percentage),
    tellingen,
  };
}

function unieke<T>(lijst: T[], waarde: (x: T) => number, kies: "laagste" | "hoogste"): T | null {
  if (lijst.length === 0) return null;
  const doel = kies === "laagste" ? Math.min(...lijst.map(waarde)) : Math.max(...lijst.map(waarde));
  const gelijk = lijst.filter((x) => waarde(x) === doel);
  return gelijk.length === 1 ? gelijk[0] : null;
}

/** Het resultaat van een scan: Per afdeling en per dimensie, en de totaalscore, uit de ruwe antwoorden en de relevantie. */
export function quickscanResultaat(
  assessment: Assessment,
  antwoorden: Record<string, Antwoord>,
  relevantie?: Record<string, boolean>
): QuickscanResultaat {
  const afdelingen: QuickscanAfdeling[] = (assessment.categorieen ?? [])
    .filter((c) => !c.gearchiveerd)
    .map((categorie) => {
      const vanToepassing = categorieVanToepassing(assessment, categorie.id, relevantie);
      const bouwblokken = categorie.bouwblokken
        .filter((b) => !b.gearchiveerd)
        .map((b) => bouwblokResultaat(b, antwoorden));
      const punten = bouwblokken.reduce((s, b) => s + b.gewicht * b.punten, 0);
      const maximum = bouwblokken.reduce((s, b) => s + b.gewicht * b.vragen, 0);
      const breuk = maximum === 0 ? null : punten / maximum;
      const percentage = breuk === null ? null : procent(breuk);
      const tellingen = bouwblokken.reduce<Tellingen>(
        (t, b) => ({ ja: t.ja + b.tellingen.ja, nee: t.nee + b.tellingen.nee, weetNiet: t.weetNiet + b.tellingen.weetNiet }),
        { ja: 0, nee: 0, weetNiet: 0 }
      );
      // Chips alleen bij minstens 2 bouwblokken (`content-ziekenhuis-quickscan.md`, Regels voor de bouwblokken per afdeling).
      const metScore = bouwblokken.filter((b) => b.breuk !== null);
      const kanChips = bouwblokken.length >= 2;
      const aandachtspunt = kanChips ? unieke(metScore, (b) => b.breuk as number, "laagste") : null;
      const sterksteBasis = kanChips
        ? unieke(
            metScore.filter((b) => b.vragen >= MIN_VRAGEN_STERKSTE_BASIS),
            (b) => b.breuk as number,
            "hoogste"
          )
        : null;
      return {
        categorie,
        vanToepassing,
        bouwblokken,
        punten,
        maximum,
        breuk,
        percentage,
        klasse: percentage === null ? null : klasseVanPercentage(percentage),
        tellingen,
        aandachtspunt,
        sterksteBasis,
      };
    });

  const meetellend = afdelingen.filter((a) => a.vanToepassing);
  const punten = meetellend.reduce((s, a) => s + a.punten, 0);
  const maximum = meetellend.reduce((s, a) => s + a.maximum, 0);
  const percentage = maximum === 0 ? null : procent(punten / maximum);

  // "Sterkste afdeling" en "Meeste ontwikkelruimte": Op de exacte verhouding, bij gelijkstand alle gelijke afdelingen, en geen
  // van beide bij één afdeling of als alle afdelingen gelijk zijn.
  const metBreuk = meetellend.filter((a) => a.breuk !== null);
  let sterkste: QuickscanAfdeling[] = [];
  let meeste: QuickscanAfdeling[] = [];
  if (metBreuk.length >= 2) {
    const hoogste = Math.max(...metBreuk.map((a) => a.breuk as number));
    const laagste = Math.min(...metBreuk.map((a) => a.breuk as number));
    if (hoogste !== laagste) {
      sterkste = metBreuk.filter((a) => a.breuk === hoogste);
      meeste = metBreuk.filter((a) => a.breuk === laagste);
    }
  }

  return {
    afdelingen,
    punten,
    maximum,
    percentage,
    klasse: percentage === null ? null : klasseVanPercentage(percentage),
    aantalVanToepassing: meetellend.length,
    aantalAfdelingen: afdelingen.length,
    sterkste,
    meesteOntwikkelruimte: meeste,
  };
}

/**
 * Het minimale aantal vragen van een dimensie om "Relatief sterkste basis" te kunnen zijn, zodat een bouwblok met één of twee
 * vragen niet vanzelf 100% scoort en de chip bepaalt (`content-ziekenhuis-quickscan.md`, open punt 1). Eén waarde in de code.
 */
export const MIN_VRAGEN_STERKSTE_BASIS = 3;

/** Heeft elke afdeling evenveel vragen? Dan toont de legenda ook de punten per afdeling, anders alleen percentages. */
export function afdelingenHebbenEvenveelVragen(resultaat: QuickscanResultaat): boolean {
  const aantallen = new Set(resultaat.afdelingen.map((a) => a.bouwblokken.reduce((s, b) => s + b.vragen, 0)));
  return aantallen.size <= 1;
}

/** De punten bij een percentagegrens voor een afdeling met `vragen` vragen: De kleinste en grootste punten in een klasse. */
export function puntenRange(vragen: number, klasse: Classificatie): [number, number] {
  const punten = Array.from({ length: vragen + 1 }, (_, p) => p);
  const inKlasse = punten.filter((p) => klasseVanPercentage(procent(p / vragen)) === klasse);
  return [inKlasse[0] ?? 0, inKlasse[inKlasse.length - 1] ?? 0];
}
