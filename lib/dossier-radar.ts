/**
 * De radar op de Dossierpagina van een Lead (`dossier.md`, Radar met filter, Welke scores): De groepsscore per bouwblok van de meest
 * recente Meting (op meetdatum) van de Klantcontact Volwassenheidsscan van deze Organisatie waarvan de Lead de Resultaten mag inzien. Is er
 * zo'n Meting niet, of heeft ze geen afgeronde scan, dan zijn alle scores `null`: Het Dossier lekt geen scores die de Lead niet mag zien.
 */
import type { Assessment, Organisatie, ScanUitvoering } from "./types";
import { BouwblokResultaat, alleBouwblokResultaten } from "./scoring";
import { metingIdsMetWeergave } from "./lead-toegang";
import { gemiddeldeAntwoordenVoorMetingMetSamenstelling, nieuwsteEerst } from "./metingen";
import { DOSSIER_ASSESSMENT_ID } from "./dossier";

/** De Meting waarvan de scores in de radar staan, of `null`. */
export function dossierRadarMeting(organisatie: Organisatie, lidId: string): ScanUitvoering | null {
  const ids = new Set(metingIdsMetWeergave(organisatie, lidId, "resultaten"));
  const kandidaten = organisatie.scanUitvoeringen.filter((m) => ids.has(m.id) && m.assessmentId === DOSSIER_ASSESSMENT_ID);
  return nieuwsteEerst(kandidaten)[0] ?? null;
}

/** De bouwblokken voor de radar, met scores uit de gekozen Meting of zonder scores. Gearchiveerde bouwblokken hebben geen knooppunt. */
export function dossierRadar(
  assessment: Assessment,
  organisatie: Organisatie,
  lidId: string
): { resultaten: BouwblokResultaat[]; heeftScores: boolean; meting: ScanUitvoering | null } {
  const meting = dossierRadarMeting(organisatie, lidId);
  const gemiddeld = meting ? gemiddeldeAntwoordenVoorMetingMetSamenstelling(assessment, organisatie, meting) : {};
  const alle = alleBouwblokResultaten(assessment, gemiddeld).filter((r) => !r.bouwblok.gearchiveerd);
  const heeftScores = alle.some((r) => r.score !== null);
  return { resultaten: heeftScores ? alle : alle.map((r) => ({ ...r, score: null })), heeftScores, meting };
}
