/**
 * De radar op de Dossierpagina van een Lead (`dossier.md`, Radar met filter, Welke scores): De groepsscore per bouwblok van één Meting per
 * Assessment (de Klantcontact Volwassenheidsscan of de AI-scan, elk met een eigen radar) van deze Organisatie. Welke Meting dat is, stelt een
 * Consultant of Admin in per Dossier en per Assessment (`Dossier.radarBronnen`, besloten door Joost op 21 oktober 2026): Automatisch is de meest
 * recente Meting (op meetdatum) waarvan de Lead de Resultaten mag inzien, Handmatig een vaste Meting. Is er zo'n Meting niet, of heeft ze geen
 * afgeronde scan, dan zijn alle scores `null`: Het Dossier lekt geen scores die de Lead niet mag zien.
 */
import type { Assessment, Organisatie, ScanUitvoering } from "./types";
import { BouwblokResultaat, alleBouwblokResultaten } from "./scoring";
import { leadsMetWeergave, metingIdsMetWeergave } from "./lead-toegang";
import { gemiddeldeAntwoordenVoorMetingMetSamenstelling, nieuwsteEerst } from "./metingen";
import { DOSSIER_ASSESSMENT_ID } from "./dossier";

/** De scorebron van een Assessment in het Dossier: Handmatig een vaste Meting, of `null` voor automatisch. */
export function radarBronVan(organisatie: Pick<Organisatie, "dossier">, assessmentId: string): string | null {
  return organisatie.dossier?.radarBronnen?.find((b) => b.assessmentId === assessmentId)?.metingId ?? null;
}

/**
 * De Meting waarvan de scores in de radar staan, of `null`. Automatisch (de standaard) is de meest recente Meting van het Assessment die de Lead
 * mag inzien; met een handmatige bron is het die ene Meting, en ziet deze Lead hem niet, dan zijn er geen scores.
 */
export function dossierRadarMeting(organisatie: Organisatie, lidId: string, assessmentId: string = DOSSIER_ASSESSMENT_ID): ScanUitvoering | null {
  const ids = new Set(metingIdsMetWeergave(organisatie, lidId, "resultaten"));
  const kandidaten = organisatie.scanUitvoeringen.filter((m) => ids.has(m.id) && m.assessmentId === assessmentId);
  const vast = radarBronVan(organisatie, assessmentId);
  if (vast) return kandidaten.find((m) => m.id === vast) ?? null;
  return nieuwsteEerst(kandidaten)[0] ?? null;
}

/** Een Meting die in het paneel "Instellingen voor de Lead" te kiezen is, of waarom niet. */
export interface RadarKeuze {
  meting: ScanUitvoering;
  /** Het aantal afgeronde scans in de Meting (bij een samengestelde Meting de scans van de onderliggende Metingen). */
  aantalScans: number;
  /** Ziet minstens één Lead van de Organisatie de Resultaten van deze Meting? Anders is ze niet te kiezen. */
  zichtbaar: boolean;
}

/** Of minstens één Lead van de Organisatie de Resultaten van deze Meting ziet. Zonder Leads geldt een Meting als zichtbaar: Er is dan niemand die ze mist. */
export function metingZichtbaarVoorLead(organisatie: Pick<Organisatie, "leden" | "leadToegang">, metingId: string): boolean {
  if (!organisatie.leden.some((l) => l.lead === true)) return true;
  return leadsMetWeergave(organisatie, "resultaten", metingId).length > 0;
}

/**
 * De Metingen van een Assessment waaruit de Consultant kiest (`dossier.md`, Naam en scorebron), nieuwste eerst. Een Meting waarvan de Lead de
 * Resultaten niet mag inzien is er wel, uitgeschakeld.
 */
export function radarKeuzes(organisatie: Organisatie, assessmentId: string, aantalScans: (m: ScanUitvoering) => number): RadarKeuze[] {
  return nieuwsteEerst(organisatie.scanUitvoeringen.filter((m) => m.assessmentId === assessmentId)).map((meting) => ({
    meting,
    aantalScans: aantalScans(meting),
    zichtbaar: metingZichtbaarVoorLead(organisatie, meting.id),
  }));
}

/** De meest recente Meting die nu automatisch de scores levert (voor de hint in het paneel): De nieuwste die een Lead mag inzien, anders `null`. */
export function automatischeRadarMeting(organisatie: Organisatie, assessmentId: string): ScanUitvoering | null {
  const kandidaten = organisatie.scanUitvoeringen.filter((m) => m.assessmentId === assessmentId && metingZichtbaarVoorLead(organisatie, m.id));
  return nieuwsteEerst(kandidaten)[0] ?? null;
}

/** Een handmatig gekozen Meting die er niet meer is of die de Lead niet meer mag zien. */
export interface VerlorenRadarBron {
  assessmentId: string;
  metingId: string;
  reden: "verwijderd" | "niet-zichtbaar";
  /** Het label van de Meting zoals ze er was (alleen als ze er nog is). */
  metingLabel: string | null;
}

/** De handmatig gekozen Metingen van het Dossier die niet (meer) zichtbaar zijn voor de Lead (`dossier.md`, Welke scores). */
export function verlorenRadarBronnen(organisatie: Pick<Organisatie, "dossier" | "scanUitvoeringen" | "leden" | "leadToegang">): VerlorenRadarBron[] {
  const verloren: VerlorenRadarBron[] = [];
  for (const bron of organisatie.dossier?.radarBronnen ?? []) {
    if (!bron.metingId) continue;
    const meting = organisatie.scanUitvoeringen.find((m) => m.id === bron.metingId);
    if (!meting) verloren.push({ assessmentId: bron.assessmentId, metingId: bron.metingId, reden: "verwijderd", metingLabel: null });
    else if (!metingZichtbaarVoorLead(organisatie, meting.id)) {
      verloren.push({ assessmentId: bron.assessmentId, metingId: bron.metingId, reden: "niet-zichtbaar", metingLabel: meting.label });
    }
  }
  return verloren;
}

/**
 * Zet het Dossier op onzichtbaar waar een gekozen Meting haar zichtbaarheid verloor: Omdat de weergave Resultaten voor de Lead is uitgezet of
 * de Meting is verwijderd (`dossier.md`, Welke scores). Eén plek, aangeroepen bij elke schrijfactie. Geeft per Organisatie de verloren bronnen
 * terug, voor de audit-log.
 */
export function verbergDossiersMetVerlorenBron(alles: Organisatie[]): { organisatie: Organisatie; verloren: VerlorenRadarBron[] }[] {
  const uit: { organisatie: Organisatie; verloren: VerlorenRadarBron[] }[] = [];
  for (const organisatie of alles) {
    if (!organisatie.dossier?.zichtbaar) continue;
    const verloren = verlorenRadarBronnen(organisatie);
    if (verloren.length === 0) continue;
    organisatie.dossier.zichtbaar = false;
    uit.push({ organisatie, verloren });
  }
  return uit;
}

/** De bouwblokken voor de radar, met scores uit de gekozen Meting of zonder scores. Gearchiveerde bouwblokken hebben geen knooppunt. */
export function dossierRadar(
  assessment: Assessment,
  organisatie: Organisatie,
  lidId: string
): { resultaten: BouwblokResultaat[]; heeftScores: boolean; meting: ScanUitvoering | null } {
  const meting = dossierRadarMeting(organisatie, lidId, assessment.id);
  const gemiddeld = meting ? gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, meting) : {};
  const alle = alleBouwblokResultaten(assessment, gemiddeld).filter((r) => !r.bouwblok.gearchiveerd);
  const heeftScores = alle.some((r) => r.score !== null);
  return { resultaten: heeftScores ? alle : alle.map((r) => ({ ...r, score: null })), heeftScores, meting };
}
