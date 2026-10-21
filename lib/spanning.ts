/**
 * De score van een Assessment met antwoordType "spanning" (de Digitale Spanningsmeter, `datamodel.md`, Antwoordtype en
 * Scoreberekening, Spanningsmeter; `content-spanningsmeter.md`). Pure functies zonder opslag. Alle scores worden berekend en nooit
 * opgeslagen.
 *
 * Er is geen overall-score. De uitkomst is een score per spanningsveld (een `Bouwblok`), een niveau en de spanning tussen de velden:
 * - Veldscore = gemiddelde van de beoordeelde antwoorden (1 tot en met 5). Een 0 ("Kan ik niet beoordelen") telt niet mee in teller
 *   en noemer. Zijn er minder dan drie beoordeeld, dan heeft het veld geen score ("Onvoldoende zicht").
 * - Niveau = de getoonde veldscore afgerond op een heel getal (half-away-from-zero), met de naam uit `Assessment.schaal`.
 * - Spanning per veld, behalve het eerste: `score(veld) − min(score van alle voorgaande velden)`, op de ongeronde scores.
 * - Grootste spanning = het veld met de grootste absolute spanning (bij gelijk het eerste).
 * - Gemiddeld niveau = gemiddelde van de veldscores: een weergave en geen score.
 * - Groep: gemiddelde, laagste, hoogste en spreiding per veld over de afgeronde scans, de spanning op de groepsgemiddelden, en per
 *   rolgroep een gemiddelde zolang de rolgroep minstens `spanningMinPerRol` scans heeft.
 */
import { Antwoord, Assessment, Bouwblok, ScanInvulling } from "./types";
import { alleBouwblokkenMetGroep } from "./assessment-structuur";

export function isSpanning(assessment: Pick<Assessment, "antwoordType"> | null | undefined): boolean {
  return assessment?.antwoordType === "spanning";
}

/** Het minimale aantal beoordeelde vragen (1 tot en met 5) in een veld voor een veldscore (`datamodel.md`, Veldscore). */
export const MIN_BEOORDEELD = 3;

/** De waarde van het antwoord "Kan ik niet beoordelen". */
export const KAN_IK_NIET_BEOORDELEN = 0;

export type Niveau = 1 | 2 | 3 | 4 | 5;

/** Half-away-from-zero op één decimaal, ook voor negatieve getallen en met de drijvende-komma-ruis eruit. */
export function rond1(n: number): number {
  const teken = n < 0 ? -1 : 1;
  return teken * (Math.round((Math.abs(n) + 1e-9) * 10) / 10) || 0;
}

/** Het niveau bij een veldscore: De getoonde score (één decimaal) afgerond op een heel getal. Onder 1,5 is 1, vanaf 4,5 is 5. */
export function niveauVan(score: number): Niveau {
  const n = Math.round(rond1(score) + 1e-9);
  return Math.min(5, Math.max(1, n)) as Niveau;
}

/** De namen en de betekenis van de vijf niveaus (`content-spanningsmeter.md`, Schaal en niveaus). */
export const NIVEAUS: { niveau: Niveau; naam: string; betekenis: string; grenzen: string }[] = [
  { niveau: 1, naam: "Reactief", betekenis: "We handelen vooral als het pijn doet.", grenzen: "Onder 1,5" },
  { niveau: 2, naam: "Gefragmenteerd", betekenis: "De spanning is zichtbaar, maar komt niet samen.", grenzen: "1,5 tot en met 2,49" },
  { niveau: 3, naam: "Georganiseerd", betekenis: "De spanning wordt besproken binnen bestaande structuren.", grenzen: "2,5 tot en met 3,49" },
  {
    niveau: 4,
    naam: "Geïntegreerd",
    betekenis: "De spanning wordt gebruikt om keuzes en samenwerking te versterken.",
    grenzen: "3,5 tot en met 4,49",
  },
  { niveau: 5, naam: "Adaptief", betekenis: "De spanning voedt het verandervermogen van de organisatie.", grenzen: "Vanaf 4,5" },
];

/** De naam van een niveau: Uit `Assessment.schaal` als die er is, anders de vaste naam. */
export function niveauNaam(assessment: Pick<Assessment, "schaal"> | null | undefined, niveau: Niveau): string {
  return assessment?.schaal?.find((s) => s.waarde === niveau)?.label ?? NIVEAUS[niveau - 1].naam;
}

export const KAN_IK_NIET_TEKST = "Kan ik niet beoordelen";

/** Het getal met een decimale komma en één decimaal ("3,8"). */
export function fmt1(n: number): string {
  return rond1(n).toFixed(1).replace(".", ",");
}

/** Een verschil met het teken: "+1,2" of "−0,4" (een echt min-teken). Nul is "0,0". */
export function fmtVerschil(n: number): string {
  const r = rond1(n);
  if (r === 0) return "0,0";
  return `${r > 0 ? "+" : "−"}${fmt1(Math.abs(r))}`;
}

/** De velden van de Spanningsmeter in de volgorde van `Bouwblok.volgnummer`. Gearchiveerde velden doen niet mee. */
export function spanningsvelden(assessment: Assessment): Bouwblok[] {
  return alleBouwblokkenMetGroep(assessment)
    .map((b) => b.bouwblok)
    .filter((b) => !b.gearchiveerd)
    .sort((a, b) => a.volgnummer - b.volgnummer);
}

/** De korte naam van een veld, anders de volledige naam. */
export function veldKorteNaam(veld: Pick<Bouwblok, "naam" | "korteNaam">): string {
  return veld.korteNaam?.trim() || veld.naam;
}

/** De beoordeelde antwoorden in een veld: 1 tot en met 5. Een 0 en een ontbrekend antwoord tellen niet. */
export function beoordeeldeAntwoorden(veld: Bouwblok, antwoorden: Record<string, Antwoord>): number[] {
  return veld.vragen
    .filter((v) => !v.gearchiveerd)
    .map((v) => antwoorden[v.id])
    .filter((a): a is number => typeof a === "number" && a >= 1 && a <= 5);
}

export interface VeldScore {
  veld: Bouwblok;
  volgnummer: number;
  /** Aantal beoordeelde vragen (1 tot en met 5). */
  beoordeeld: number;
  /** Aantal vragen in het veld. */
  vragen: number;
  /** De ongeronde veldscore, `null` bij minder dan drie beoordeelde vragen ("Onvoldoende zicht"). */
  ruw: number | null;
  /** De getoonde veldscore, één decimaal. */
  score: number | null;
  niveau: Niveau | null;
  /** De ongeronde spanning (`score − min(voorgaande)`), `null` bij het eerste veld met een score. */
  spanning: number | null;
  /** Het voorgaande veld met de laagste score: Het veld waar de spanning aan gemeten wordt. */
  referentie: Bouwblok | null;
}

export interface SpanningProfiel {
  velden: VeldScore[];
  /** Het veld met de grootste absolute spanning, `null` bij minder dan twee velden met een score. */
  grootste: VeldScore | null;
  /** Het gemiddelde van de veldscores (een weergave, geen score), `null` zonder veldscores. */
  gemiddeld: { ruw: number; score: number; niveau: Niveau } | null;
}

/** Zet ongeronde veldscores (per veld, `null` bij geen score) om in een profiel met niveaus, spanning en het gemiddelde. */
function profielUitScores(
  velden: Bouwblok[],
  scores: { ruw: number | null; beoordeeld: number; vragen: number }[]
): SpanningProfiel {
  const uit: VeldScore[] = [];
  velden.forEach((veld, i) => {
    const { ruw, beoordeeld, vragen } = scores[i];
    let spanning: number | null = null;
    let referentie: Bouwblok | null = null;
    if (ruw !== null) {
      let laagste: number | null = null;
      for (let j = 0; j < i; j++) {
        const r = scores[j].ruw;
        if (r !== null && (laagste === null || r < laagste)) {
          laagste = r;
          referentie = velden[j];
        }
      }
      if (laagste !== null) spanning = ruw - laagste;
    }
    uit.push({
      veld,
      volgnummer: veld.volgnummer,
      beoordeeld,
      vragen,
      ruw,
      score: ruw === null ? null : rond1(ruw),
      niveau: ruw === null ? null : niveauVan(ruw),
      spanning,
      referentie,
    });
  });
  let grootste: VeldScore | null = null;
  for (const v of uit) {
    if (v.spanning === null) continue;
    // De absolute waarde vergelijken op één decimaal, zodat twee gelijk getoonde spanningen het eerste veld krijgen.
    if (grootste === null || Math.abs(rond1(v.spanning)) > Math.abs(rond1(grootste.spanning ?? 0))) grootste = v;
  }
  const metScore = uit.filter((v) => v.ruw !== null);
  const gemiddeldRuw = metScore.length === 0 ? null : metScore.reduce((a, v) => a + (v.ruw as number), 0) / metScore.length;
  return {
    velden: uit,
    grootste,
    gemiddeld: gemiddeldRuw === null ? null : { ruw: gemiddeldRuw, score: rond1(gemiddeldRuw), niveau: niveauVan(gemiddeldRuw) },
  };
}

/** Het profiel van één scan: Veldscore, niveau en spanning per veld, de grootste spanning en het gemiddelde niveau. */
export function spanningProfiel(assessment: Assessment, antwoorden: Record<string, Antwoord>): SpanningProfiel {
  const velden = spanningsvelden(assessment);
  const scores = velden.map((veld) => {
    const beoordeeld = beoordeeldeAntwoorden(veld, antwoorden);
    return {
      ruw: beoordeeld.length < MIN_BEOORDEELD ? null : beoordeeld.reduce((a, b) => a + b, 0) / beoordeeld.length,
      beoordeeld: beoordeeld.length,
      vragen: veld.vragen.filter((v) => !v.gearchiveerd).length,
    };
  });
  return profielUitScores(velden, scores);
}

/** De zin bij een spanning, met de volledige veldnamen: "Technologie loopt 1,8 voor op Mensen & gedrag." */
export function spanningZin(v: VeldScore): string | null {
  if (v.spanning === null || !v.referentie) return null;
  const verschil = fmt1(Math.abs(v.spanning));
  return v.spanning >= 0
    ? `${v.veld.naam} loopt ${verschil} voor op ${v.referentie.naam}.`
    : `${v.veld.naam} blijft ${verschil} achter bij ${v.referentie.naam}.`;
}

/** Eén scan in een groep: De antwoorden en de rolgroep. */
export interface SpanningScan {
  antwoorden: Record<string, Antwoord>;
  rolgroep?: string | null;
}

export interface GroepVeld extends VeldScore {
  /** Laagste en hoogste veldscore van een afgeronde scan in dit veld, `null` zonder scans met een score. */
  laagste: number | null;
  hoogste: number | null;
  /** Hoogste min laagste. */
  spreiding: number | null;
  /** Het aantal scans met een veldscore in dit veld ("n beoordeeld"). */
  scansMetScore: number;
}

export interface RolKolom {
  rolgroep: string;
  scans: number;
  /** Het gemiddelde per veld in de volgorde van de velden, `null` als niemand in de rolgroep het veld beoordeelde. */
  gemiddelden: (number | null)[];
}

export interface GroepProfiel extends Omit<SpanningProfiel, "velden"> {
  velden: GroepVeld[];
  /** Het aantal afgeronde scans in de groep. */
  scans: number;
  /** Het veld met de grootste spreiding (bij gelijk het eerste), `null` bij minder dan twee scans. */
  meestUiteenlopend: GroepVeld | null;
  /** De zichtbare rolgroepen, in de volgorde van `Assessment.rolgroepen`. Leeg bij minder dan twee zichtbare rolgroepen. */
  rollen: RolKolom[];
  /** Het verschil per veld tussen het hoogste en laagste rolgemiddelde, in de volgorde van de velden. */
  rolVerschil: (number | null)[];
  /** Het veld met het grootste rolverschil. */
  grootsteRolVerschil: number | null;
}

/**
 * Het profiel van een groep afgeronde scans. De spanning wordt berekend op de groepsgemiddelden en niet als gemiddelde van de
 * spanningen van de personen. `minPerRol` is `Instellingen.spanningMinPerRol`.
 */
export function groepProfiel(assessment: Assessment, scans: SpanningScan[], minPerRol: number): GroepProfiel {
  const velden = spanningsvelden(assessment);
  const perScan = scans.map((s) => spanningProfiel(assessment, s.antwoorden));
  const perVeld = velden.map((_, i) => perScan.map((p) => p.velden[i].ruw).filter((r): r is number => r !== null));
  const scores = velden.map((veld, i) => ({
    ruw: perVeld[i].length === 0 ? null : perVeld[i].reduce((a, b) => a + b, 0) / perVeld[i].length,
    beoordeeld: perVeld[i].length,
    vragen: veld.vragen.filter((v) => !v.gearchiveerd).length,
  }));
  const basis = profielUitScores(velden, scores);
  const groepVelden: GroepVeld[] = basis.velden.map((v, i) => {
    const waarden = perVeld[i];
    const laagste = waarden.length === 0 ? null : Math.min(...waarden);
    const hoogste = waarden.length === 0 ? null : Math.max(...waarden);
    return {
      ...v,
      laagste: laagste === null ? null : rond1(laagste),
      hoogste: hoogste === null ? null : rond1(hoogste),
      spreiding: laagste === null || hoogste === null ? null : rond1(hoogste) - rond1(laagste),
      scansMetScore: waarden.length,
    };
  });
  // Het gemiddelde van een groep heeft geen drempel van drie beoordeelde vragen: Elke scan met een veldscore telt één keer.
  let meest: GroepVeld | null = null;
  if (scans.length >= 2) {
    for (const v of groepVelden) {
      if (v.spreiding === null) continue;
      if (meest === null || v.spreiding > (meest.spreiding ?? 0)) meest = v;
    }
  }

  // Per rolgroep: Alleen rolgroepen met minstens `minPerRol` scans.
  const rolnamen = assessment.rolgroepen ?? [];
  const zichtbaar: RolKolom[] = [];
  for (const rolgroep of rolnamen) {
    const indices = scans.map((s, i) => (s.rolgroep === rolgroep ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 0 || indices.length < Math.max(1, minPerRol)) continue;
    const gemiddelden = velden.map((_, vi) => {
      const waarden = indices.map((i) => perScan[i].velden[vi].ruw).filter((r): r is number => r !== null);
      return waarden.length === 0 ? null : waarden.reduce((a, b) => a + b, 0) / waarden.length;
    });
    zichtbaar.push({ rolgroep, scans: indices.length, gemiddelden });
  }
  const rollen = zichtbaar.length >= 2 ? zichtbaar : [];
  const rolVerschil = velden.map((_, vi) => {
    const waarden = rollen.map((r) => r.gemiddelden[vi]).filter((g): g is number => g !== null);
    return waarden.length < 2 ? null : Math.max(...waarden) - Math.min(...waarden);
  });
  const metVerschil = rolVerschil.filter((v): v is number => v !== null);
  return {
    ...basis,
    velden: groepVelden,
    scans: scans.length,
    meestUiteenlopend: meest,
    rollen,
    rolVerschil,
    grootsteRolVerschil: metVerschil.length === 0 ? null : Math.max(...metVerschil),
  };
}

/**
 * Mag een groepsweergave voor een Lead getoond worden? Eronder staat er geen gemiddelde, laagste en hoogste score, uitsplitsing
 * per rol en voorbeelden (`visualisatie-spanningsmeter.md`, Anonimiteit). `min` is `Instellingen.benchmarkMinRespondenten`.
 */
export function groepZichtbaar(afgerondeScans: number, min: number): boolean {
  return afgerondeScans >= min && afgerondeScans > 0;
}

/** De afgeronde invullingen van een Meting als scans voor een groepsprofiel. */
export function spanningScansVan(invullingen: ScanInvulling[]): SpanningScan[] {
  return invullingen.filter((i) => i.status === "afgerond").map((i) => ({ antwoorden: i.antwoorden, rolgroep: i.rolgroep ?? null }));
}
