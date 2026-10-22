/**
 * De groepsberekeningen van de Quickscan Ziekenhuis (`visualisatie-quickscan.md`): Het gemiddelde en de spreiding over de
 * scans van een Meting (weergave 3), de verdeling van de antwoorden per vraag (weergave 4) en de vergelijking tussen
 * organisaties (weergave 5). Pure functies zonder opslag, alles wordt berekend en nooit opgeslagen. Ze bouwen voort op de
 * score van één scan (`lib/quickscan.ts`) en gebruiken dezelfde afronding en klassen.
 *
 * Elke scan telt even zwaar mee. Een afdeling telt per scan alleen mee als ze in die scan van toepassing is.
 */
import { Antwoord, Assessment, Bouwblok, Categorie, Classificatie } from "./types";
import {
  MIN_VRAGEN_STERKSTE_BASIS,
  QuickscanAfdeling,
  QuickscanBouwblok,
  QuickscanResultaat,
  Tellingen,
  klasseVanPercentage,
  procent,
  quickscanResultaat,
} from "./quickscan";
import { gewichtVan } from "./scoring";
import { SPREIDING_STANDAARD_QUICKSCAN, SpreidingGrenzen, spreidingLabelVoor } from "./spreiding-grenzen";
import { getSpreidingGrenzen } from "./instellingen-store";
import { groepStatistiek, GroepStatistiek, PositieLabel } from "./visualisatie";

/** Eén afgeronde scan, zoals de berekeningen hem nodig hebben. */
export interface QuickscanScan {
  id: string;
  antwoorden: Record<string, Antwoord>;
  relevantie?: Record<string, boolean>;
}

/** De afgeronde scans van een Meting als invoer voor de berekeningen. Een scan die niet is afgerond, telt niet mee. */
export function quickscanScansVan(
  invullingen: { id: string; status: string; antwoorden: Record<string, Antwoord>; relevantie?: Record<string, boolean> }[]
): QuickscanScan[] {
  return invullingen
    .filter((i) => i.status === "afgerond")
    .map((i) => ({ id: i.id, antwoorden: i.antwoorden, relevantie: i.relevantie }));
}

/** De startwaarden van de grenzen in procentpunten (`visualisatie-quickscan.md`, 3): Onder 14, 14 tot 20 en vanaf 20. Instelbaar door een Admin. */
export const QS_SPREIDING_GRENZEN = SPREIDING_STANDAARD_QUICKSCAN;
/** Een bouwblok met minder vragen krijgt geen spreidingslabel: De uitkomsten zijn dan te grof. */
export const QS_MIN_VRAGEN_SPREIDING = 3;
/** Minder relevante scans dan dit voor een afdeling geeft "Te weinig antwoorden". */
export const QS_MIN_SCANS_SPREIDING = 3;
/** "Onbekend bij x van y": Minstens dit aandeel van de respondenten en minstens drie van hen kozen Weet ik niet. */
export const QS_ONBEKEND_AANDEEL = 0.4;
export const QS_ONBEKEND_MIN = 3;

export type SpreidingLabelQs = "Eensgezind" | "Wisselend" | "Verdeeld";

/** Het label bij een standaardafwijking in procentpunten, met de grenzen uit de instellingen (`beheerpagina.md`, formulier Spreiding). */
export function spreidingLabelQs(sd: number, grenzen: SpreidingGrenzen = getSpreidingGrenzen().quickscan): SpreidingLabelQs {
  return spreidingLabelVoor(sd, grenzen);
}

/** Standaardafwijking van de steekproef (n − 1), of `null` bij minder dan twee waarden. */
export function steekproefSdQs(waarden: number[]): number | null {
  if (waarden.length < 2) return null;
  const gem = waarden.reduce((a, b) => a + b, 0) / waarden.length;
  const som = waarden.reduce((s, w) => s + (w - gem) ** 2, 0);
  return Math.sqrt(som / (waarden.length - 1));
}

/** Wat er in de plaats van een spreidingslabel staat als er geen label is. */
export type SpreidingUitkomst =
  | { soort: "label"; label: SpreidingLabelQs }
  | { soort: "weinigVragen"; vragen: number }
  | { soort: "weinigAntwoorden" };

/* ---------- Weergave 3: Gemiddelde en spreiding over een Meting ---------- */

export interface MetingBouwblok {
  bouwblok: Bouwblok;
  gewicht: number;
  vragen: number;
  /** De score per relevante scan als percentage (0 tot 100), niet afgerond. */
  scores: number[];
  /** Gemiddelde van de scores als percentage (0 tot 100), niet afgerond, `null` zonder relevante scans. */
  gemiddelde: number | null;
  /** Het afgeronde gemiddelde, voor weergave, klasse en kleur. */
  percentage: number | null;
  klasse: Classificatie | null;
  /** Gemiddeld aantal punten per scan, voor "x/y". */
  punten: number;
  sd: number | null;
  spreiding: SpreidingUitkomst | null;
  /** Per voorkomend afgerond percentage het aantal scans. Eén scan is een kleine stip zonder getal. */
  bollen: { percentage: number; aantal: number }[];
  tellingen: Tellingen;
}

export interface MetingAfdeling {
  categorie: Categorie;
  /** Aantal afgeronde scans waarin de afdeling van toepassing is, en alle afgeronde scans. */
  relevanteScans: number;
  alleScans: number;
  vanToepassing: boolean;
  bouwblokken: MetingBouwblok[];
  /** Gemiddeld gewogen aantal punten en het maximum per scan. */
  punten: number;
  maximum: number;
  gemiddelde: number | null;
  percentage: number | null;
  klasse: Classificatie | null;
  sd: number | null;
  spreiding: SpreidingUitkomst | null;
  scores: number[];
  bollen: { percentage: number; aantal: number }[];
  aandachtspunt: MetingBouwblok | null;
  sterksteBasis: MetingBouwblok | null;
  tellingen: Tellingen;
}

export interface QuickscanMeting {
  aantalScans: number;
  afdelingen: MetingAfdeling[];
  /** Totaal van de Meting: Alle punten van de relevante afdelingen gedeeld door alle mogelijke punten (open punt 2). */
  punten: number;
  maximum: number;
  percentage: number | null;
  klasse: Classificatie | null;
  aantalVanToepassing: number;
  sterkste: MetingAfdeling[];
  meesteOntwikkelruimte: MetingAfdeling[];
}

function bollenVan(scores: number[]): { percentage: number; aantal: number }[] {
  const per = new Map<number, number>();
  for (const s of scores) per.set(procent(s / 100), (per.get(procent(s / 100)) ?? 0) + 1);
  return [...per.entries()].map(([percentage, aantal]) => ({ percentage, aantal })).sort((a, b) => a.percentage - b.percentage);
}

function gem(waarden: number[]): number | null {
  return waarden.length === 0 ? null : waarden.reduce((a, b) => a + b, 0) / waarden.length;
}

function spreidingVan(scores: number[], vragen: number | null, relevanteScans: number): SpreidingUitkomst | null {
  if (relevanteScans === 0) return null;
  if (vragen !== null && vragen < QS_MIN_VRAGEN_SPREIDING) return { soort: "weinigVragen", vragen };
  if (relevanteScans < QS_MIN_SCANS_SPREIDING) return { soort: "weinigAntwoorden" };
  const sd = steekproefSdQs(scores);
  return sd === null ? { soort: "weinigAntwoorden" } : { soort: "label", label: spreidingLabelQs(sd) };
}

function uniekeExtreem<T>(lijst: T[], waarde: (x: T) => number, kies: "laagste" | "hoogste"): T | null {
  if (lijst.length === 0) return null;
  const doel = kies === "laagste" ? Math.min(...lijst.map(waarde)) : Math.max(...lijst.map(waarde));
  const gelijk = lijst.filter((x) => waarde(x) === doel);
  return gelijk.length === 1 ? gelijk[0] : null;
}

/**
 * Het gemiddelde en de spreiding over de afgeronde scans van een Meting (`visualisatie-quickscan.md`, 3). Per scan en bouwblok is
 * de score het aantal Ja gedeeld door het aantal vragen. Het gemiddelde van een afdeling komt uit de afdelingsscores van de scans
 * waarin ze van toepassing is, het totaal uit alle punten gedeeld door alle mogelijke punten.
 */
export function quickscanMeting(assessment: Assessment, scans: QuickscanScan[]): QuickscanMeting {
  const perScan = scans.map((s) => quickscanResultaat(assessment, s.antwoorden, s.relevantie));
  const categorieen = (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd);

  const afdelingen: MetingAfdeling[] = categorieen.map((categorie, ci) => {
    // De scans waarin deze afdeling van toepassing is, met haar resultaat in die scan.
    const relevant: QuickscanAfdeling[] = perScan
      .map((r) => r.afdelingen[ci])
      .filter((a): a is QuickscanAfdeling => a !== undefined && a.vanToepassing && a.maximum > 0);
    const bouwblokken: MetingBouwblok[] = categorie.bouwblokken
      .filter((b) => !b.gearchiveerd)
      .map((bouwblok, bi) => {
        const leden: QuickscanBouwblok[] = relevant
          .map((a) => a.bouwblokken[bi])
          .filter((b): b is QuickscanBouwblok => b !== undefined && b.vragen > 0);
        const scores = leden.map((b) => (b.breuk as number) * 100);
        const gemiddelde = gem(scores);
        const percentage = gemiddelde === null ? null : procent(gemiddelde / 100);
        const vragen = leden[0]?.vragen ?? bouwblok.vragen.filter((v) => !v.gearchiveerd).length;
        return {
          bouwblok,
          gewicht: gewichtVan(bouwblok),
          vragen,
          scores,
          gemiddelde,
          percentage,
          klasse: percentage === null ? null : klasseVanPercentage(percentage),
          punten: gem(leden.map((b) => b.punten)) ?? 0,
          sd: steekproefSdQs(scores),
          spreiding: spreidingVan(scores, vragen, leden.length),
          bollen: bollenVan(scores),
          tellingen: leden.reduce<Tellingen>(
            (t, b) => ({ ja: t.ja + b.tellingen.ja, nee: t.nee + b.tellingen.nee, weetNiet: t.weetNiet + b.tellingen.weetNiet }),
            { ja: 0, nee: 0, weetNiet: 0 }
          ),
        };
      });
    const scores = relevant.map((a) => (a.breuk as number) * 100);
    const gemiddelde = gem(scores);
    const percentage = gemiddelde === null ? null : procent(gemiddelde / 100);
    const maximum = relevant[0]?.maximum ?? bouwblokken.reduce((s, b) => s + b.gewicht * b.vragen, 0);
    // Chips alleen bij minstens twee dimensies, en alleen als er één laagste respectievelijk hoogste is.
    const metScore = bouwblokken.filter((b) => b.gemiddelde !== null);
    const kanChips = bouwblokken.length >= 2;
    return {
      categorie,
      relevanteScans: relevant.length,
      alleScans: scans.length,
      vanToepassing: relevant.length > 0,
      bouwblokken,
      punten: gem(relevant.map((a) => a.punten)) ?? 0,
      maximum,
      gemiddelde,
      percentage,
      klasse: percentage === null ? null : klasseVanPercentage(percentage),
      sd: steekproefSdQs(scores),
      spreiding: spreidingVan(scores, null, relevant.length),
      scores,
      bollen: bollenVan(scores),
      aandachtspunt: kanChips ? uniekeExtreem(metScore, (b) => b.gemiddelde as number, "laagste") : null,
      sterksteBasis: kanChips
        ? uniekeExtreem(
            metScore.filter((b) => b.vragen >= MIN_VRAGEN_STERKSTE_BASIS),
            (b) => b.gemiddelde as number,
            "hoogste"
          )
        : null,
      tellingen: bouwblokken.reduce<Tellingen>(
        (t, b) => ({ ja: t.ja + b.tellingen.ja, nee: t.nee + b.tellingen.nee, weetNiet: t.weetNiet + b.tellingen.weetNiet }),
        { ja: 0, nee: 0, weetNiet: 0 }
      ),
    };
  });

  // Het totaal: Alle punten van de relevante afdelingen gedeeld door alle mogelijke punten, over alle scans.
  const totaalPunten = perScan.reduce((s, r) => s + r.punten, 0);
  const totaalMax = perScan.reduce((s, r) => s + r.maximum, 0);
  const percentage = totaalMax === 0 ? null : procent(totaalPunten / totaalMax);

  const metGemiddelde = afdelingen.filter((a) => a.vanToepassing && a.gemiddelde !== null);
  let sterkste: MetingAfdeling[] = [];
  let meeste: MetingAfdeling[] = [];
  if (metGemiddelde.length >= 2) {
    const hoogste = Math.max(...metGemiddelde.map((a) => a.gemiddelde as number));
    const laagste = Math.min(...metGemiddelde.map((a) => a.gemiddelde as number));
    if (hoogste !== laagste) {
      sterkste = metGemiddelde.filter((a) => a.gemiddelde === hoogste);
      meeste = metGemiddelde.filter((a) => a.gemiddelde === laagste);
    }
  }
  const n = scans.length || 1;
  return {
    aantalScans: scans.length,
    afdelingen,
    punten: totaalPunten / n,
    maximum: totaalMax / n,
    percentage,
    klasse: percentage === null ? null : klasseVanPercentage(percentage),
    aantalVanToepassing: afdelingen.filter((a) => a.vanToepassing).length,
    sterkste,
    meesteOntwikkelruimte: meeste,
  };
}

/**
 * De Meting in de vorm van het resultaat van één scan, zodat het scherm van de eigen scan (weergave 1 en 2) ook het gemiddelde
 * van een Meting kan tonen (`visualisatie-quickscan.md`, 3: "in elke kaart het gemiddelde van de Meting in plaats van de score
 * van één scan"). Punten en maximum zijn gemiddelden per scan.
 */
export function metingAlsResultaat(meting: QuickscanMeting): QuickscanResultaat {
  const afdelingen: QuickscanAfdeling[] = meting.afdelingen.map((a) => {
    const bouwblokken: QuickscanBouwblok[] = a.bouwblokken.map((b) => ({
      bouwblok: b.bouwblok,
      gewicht: b.gewicht,
      punten: b.punten,
      vragen: b.vragen,
      breuk: b.gemiddelde === null ? null : b.gemiddelde / 100,
      percentage: b.percentage,
      klasse: b.klasse,
      tellingen: b.tellingen,
    }));
    const kies = (m: MetingBouwblok | null) => (m ? (bouwblokken.find((b) => b.bouwblok.id === m.bouwblok.id) ?? null) : null);
    return {
      categorie: a.categorie,
      vanToepassing: a.vanToepassing,
      bouwblokken,
      punten: a.punten,
      maximum: a.maximum,
      breuk: a.gemiddelde === null ? null : a.gemiddelde / 100,
      percentage: a.percentage,
      klasse: a.klasse,
      tellingen: a.tellingen,
      aandachtspunt: kies(a.aandachtspunt),
      sterksteBasis: kies(a.sterksteBasis),
    };
  });
  const kiesAfdeling = (lijst: MetingAfdeling[]) =>
    lijst.map((a) => afdelingen.find((x) => x.categorie.id === a.categorie.id)).filter((a): a is QuickscanAfdeling => a !== undefined);
  return {
    afdelingen,
    punten: meting.punten,
    maximum: meting.maximum,
    percentage: meting.percentage,
    klasse: meting.klasse,
    aantalVanToepassing: meting.aantalVanToepassing,
    aantalAfdelingen: afdelingen.length,
    sterkste: kiesAfdeling(meting.sterkste),
    meesteOntwikkelruimte: kiesAfdeling(meting.meesteOntwikkelruimte),
  };
}

/* ---------- Weergave 4: Antwoorden per vraag ---------- */

export interface VraagVerdeling {
  vraagId: string;
  /** "3.2": Het volgnummer van het bouwblok en dat van de vraag. */
  nummer: string;
  /** De dimensie waar de vraag in staat, voor de tegels "Minst vaak Ja" en "Vaakst Weet ik niet". */
  bouwblokNaam: string;
  tekst: string;
  ja: number;
  nee: number;
  weetNiet: number;
  /** Aantal respondenten dat deze afdeling relevant vond. */
  respondenten: number;
  /** Aandeel Ja onder de respondenten (0 tot 100), afgerond op hele procenten. */
  jaPercentage: number | null;
  /** "Onbekend bij x van y": Weet ik niet bij minstens 40% en minstens drie respondenten. */
  onbekend: boolean;
}

export interface DimensieVerdeling {
  bouwblok: Bouwblok;
  gewicht: number;
  /** Gemiddeld percentage Ja van de dimensie. */
  percentage: number | null;
  vragen: VraagVerdeling[];
}

export interface AfdelingVerdeling {
  categorie: Categorie;
  respondenten: number;
  dimensies: DimensieVerdeling[];
  ja: number;
  nee: number;
  weetNiet: number;
  minstJa: VraagVerdeling | null;
  vaakstWeetNiet: VraagVerdeling | null;
}

export function quickscanVerdeling(assessment: Assessment, scans: QuickscanScan[]): AfdelingVerdeling[] {
  const categorieen = (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd);
  return categorieen.map((categorie) => {
    const relevant = scans.filter((s) => s.relevantie?.[categorie.id] !== false);
    const dimensies: DimensieVerdeling[] = categorie.bouwblokken
      .filter((b) => !b.gearchiveerd)
      .map((bouwblok) => {
        const vragen: VraagVerdeling[] = bouwblok.vragen
          .filter((v) => !v.gearchiveerd)
          .map((v) => {
            let ja = 0;
            let nee = 0;
            let weetNiet = 0;
            for (const s of relevant) {
              const a = s.antwoorden[v.id];
              if (a === "ja") ja += 1;
              else if (a === "nee") nee += 1;
              else if (a === "weet-niet") weetNiet += 1;
            }
            const totaal = ja + nee + weetNiet;
            return {
              vraagId: v.id,
              nummer: `${bouwblok.volgnummer}.${v.volgnummer}`,
              bouwblokNaam: bouwblok.naam,
              tekst: v.tekst,
              ja,
              nee,
              weetNiet,
              respondenten: relevant.length,
              jaPercentage: totaal === 0 ? null : procent(ja / totaal),
              onbekend: weetNiet >= QS_ONBEKEND_MIN && totaal > 0 && weetNiet / totaal >= QS_ONBEKEND_AANDEEL,
            };
          });
        const metScore = vragen.filter((v) => v.jaPercentage !== null);
        const gemiddeld = gem(metScore.map((v) => v.ja / (v.ja + v.nee + v.weetNiet)));
        return { bouwblok, gewicht: gewichtVan(bouwblok), percentage: gemiddeld === null ? null : procent(gemiddeld), vragen };
      });
    const alleVragen = dimensies.flatMap((d) => d.vragen);
    const metAntwoord = alleVragen.filter((v) => v.ja + v.nee + v.weetNiet > 0);
    // Bij gelijkstand de eerste in de volgorde van het model: Een tegel die leeg blijft, zegt niets.
    const eerste = (lijst: VraagVerdeling[], waarde: (v: VraagVerdeling) => number, kies: "laagste" | "hoogste") => {
      if (lijst.length === 0) return null;
      const doel = kies === "laagste" ? Math.min(...lijst.map(waarde)) : Math.max(...lijst.map(waarde));
      return lijst.find((v) => waarde(v) === doel) ?? null;
    };
    const minst = eerste(metAntwoord, (v) => v.ja / (v.ja + v.nee + v.weetNiet), "laagste");
    const vaakst = eerste(
      metAntwoord.filter((v) => v.weetNiet > 0),
      (v) => v.weetNiet / (v.ja + v.nee + v.weetNiet),
      "hoogste"
    );
    return {
      categorie,
      respondenten: relevant.length,
      dimensies,
      ja: alleVragen.reduce((s, v) => s + v.ja, 0),
      nee: alleVragen.reduce((s, v) => s + v.nee, 0),
      weetNiet: alleVragen.reduce((s, v) => s + v.weetNiet, 0),
      minstJa: minst,
      vaakstWeetNiet: vaakst,
    };
  });
}

/* ---------- Weergave 5: Benchmark tussen organisaties ---------- */

/** Een lid van de vergelijkgroep: Eén organisatie met haar Meting als aggregaat. */
export interface QuickscanLid {
  organisatieId: string;
  meting: QuickscanMeting;
}

export interface BenchmarkRijQs {
  /** "totaal", "afdeling" of "dimensie". */
  soort: "totaal" | "afdeling" | "dimensie";
  sleutel: string;
  naam: string;
  /** "Afdeling · Dimensie" bij een dimensie, anders de naam. */
  gewicht: number;
  /** Het afgeronde percentage van X, `null` zonder score (of bij een afdeling die niet van toepassing is). */
  eigen: number | null;
  nietVanToepassing: boolean;
  /** De overige leden (zonder X), alleen die waarvoor de rij een score heeft. */
  groep: GroepStatistiek | null;
  aantalAnderen: number;
  /** Getoonde waarde van X min het getoonde groepsgemiddelde, in procentpunten. */
  verschil: number | null;
  positie: PositieLabel | null;
  /** De groep (X inbegrepen) is kleiner dan `benchmarkMinOrganisaties`. */
  teWeinig: boolean;
}

export interface BenchmarkViewQs {
  /** Aantal leden in de vergelijkgroep, X inbegrepen. */
  groepsgrootte: number;
  rijen: BenchmarkRijQs[];
  boven: number;
  inBovensteKwart: number;
  inOndersteKwart: number;
  aantalMetScore: number;
}

function waardeVan(lid: QuickscanMeting, soort: BenchmarkRijQs["soort"], sleutel: string): number | null {
  if (soort === "totaal") return lid.percentage === null ? null : lid.percentage;
  if (soort === "afdeling") {
    const a = lid.afdelingen.find((x) => x.categorie.id === sleutel);
    return a && a.vanToepassing ? a.gemiddelde : null;
  }
  for (const a of lid.afdelingen) {
    if (!a.vanToepassing) continue;
    const b = a.bouwblokken.find((x) => x.bouwblok.id === sleutel);
    if (b) return b.gemiddelde;
  }
  return null;
}

/**
 * De view van een organisatie naast de rest van de groep (`visualisatie-quickscan.md`, 5): Per rij het percentage van X en de
 * statistiek van de overige leden, zonder X en elk lid even zwaar. Een lid dat een afdeling niet van toepassing vond, doet voor
 * die afdeling en haar dimensies niet mee. De waarden voor de statistiek zijn de onafgeronde percentages.
 */
export function quickscanBenchmark(
  assessment: Assessment,
  eigen: QuickscanLid,
  anderen: QuickscanLid[],
  minOrganisaties: number
): BenchmarkViewQs {
  const lijst: { soort: BenchmarkRijQs["soort"]; sleutel: string; naam: string; gewicht: number }[] = [
    { soort: "totaal", sleutel: "totaal", naam: "Totaal", gewicht: 1 },
  ];
  for (const categorie of (assessment.categorieen ?? []).filter((c) => !c.gearchiveerd)) {
    lijst.push({ soort: "afdeling", sleutel: categorie.id, naam: categorie.naam, gewicht: 1 });
    for (const b of categorie.bouwblokken.filter((x) => !x.gearchiveerd)) {
      lijst.push({ soort: "dimensie", sleutel: b.id, naam: `${categorie.naam} · ${b.naam}`, gewicht: gewichtVan(b) });
    }
  }
  const rijen: BenchmarkRijQs[] = lijst.map((r) => {
    const eigenRuw = waardeVan(eigen.meting, r.soort, r.sleutel);
    const nietVanToepassing =
      r.soort === "afdeling"
        ? !eigen.meting.afdelingen.find((a) => a.categorie.id === r.sleutel)?.vanToepassing
        : r.soort === "dimensie"
          ? eigenRuw === null && !eigen.meting.afdelingen.some((a) => a.vanToepassing && a.bouwblokken.some((b) => b.bouwblok.id === r.sleutel))
          : false;
    const rest = anderen.map((a) => waardeVan(a.meting, r.soort, r.sleutel)).filter((w): w is number => w !== null);
    const groep = groepStatistiek(rest);
    const eigenGetoond = eigenRuw === null ? null : procent(eigenRuw / 100);
    const teWeinig = rest.length + (eigenRuw === null ? 0 : 1) < minOrganisaties;
    let positie: PositieLabel | null = null;
    if (!nietVanToepassing && !teWeinig && eigenRuw !== null && groep !== null) {
      positie = eigenRuw > groep.q3 ? "Bovenste kwart" : eigenRuw < groep.q1 ? "Onderste kwart" : "Middenmoot";
    }
    const verschil = eigenGetoond !== null && groep !== null ? eigenGetoond - procent(groep.gemiddelde / 100) : null;
    return {
      ...r,
      eigen: nietVanToepassing ? null : eigenGetoond,
      nietVanToepassing,
      groep: teWeinig || nietVanToepassing ? null : groep,
      aantalAnderen: rest.length,
      verschil: teWeinig || nietVanToepassing ? null : verschil,
      positie,
      teWeinig,
    };
  });
  const dimensies = rijen.filter((r) => r.soort === "dimensie" && r.eigen !== null);
  return {
    groepsgrootte: anderen.length + 1,
    rijen,
    boven: dimensies.filter((r) => r.verschil !== null && r.verschil > 0).length,
    inBovensteKwart: dimensies.filter((r) => r.positie === "Bovenste kwart").length,
    inOndersteKwart: dimensies.filter((r) => r.positie === "Onderste kwart").length,
    aantalMetScore: dimensies.length,
  };
}
