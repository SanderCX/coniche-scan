export interface Vraag {
  id: string;
  volgnummer: number;
  tekst: string;
}

export interface Bouwblok {
  id: string;
  volgnummer: number;
  naam: string;
  omschrijving: string;
  /** Langere uitleg, getoond in een overlay naast de titel (zie v1-aanpassingen.md punt 3). */
  toelichting: string;
  tags: string[];
  vragen: Vraag[];
}

export interface Categorie {
  id: string;
  naam: string;
  kleur: string;
  volgorde: number;
  bouwblokken: Bouwblok[];
}

export interface SchaalLabel {
  waarde: 1 | 2 | 3 | 4 | 5;
  label: string;
}

export type VeldType =
  | "tekst"
  | "getal"
  | "select"
  | "select-met-verdeling"
  | "percentage"
  | "groep";

export interface VeldDefinitie {
  id: string;
  label: string;
  type: VeldType;
  opties?: string[];
  subvelden?: VeldDefinitie[];
}

export interface TechstackItem {
  categorie: string;
  leverancier: string;
  ondersteuning: "zelf" | "extern";
}

export interface FeatureCard {
  titel: string;
  tekst: string;
}

export interface Assessment {
  id: string;
  naam: string;
  subtitel: string;
  beschrijving: string;
  doelgroep: string;
  icoon: string;
  geschatteDuur: string;
  /** Niet elk Assessment-type heeft een categorie-laag (zie AI-Volwassenheidsscan). */
  categorieen: Categorie[] | null;
  /** Gebruikt i.p.v. categorieen wanneer die ontbreekt: platte lijst bouwblokken. */
  bouwblokken: Bouwblok[] | null;
  /** AI-scan sorteert groepsscores op waarde, Klantcontact-scan houdt vaste volgorde aan. */
  scoresPerGroepGesorteerd: boolean;
  /** UI-woord voor één bouwblok, bijv. "Bouwblok" of "Domein". */
  bouwblokEenheidEnkelvoud: string;
  /** UI-woord voor meerdere bouwblokken na een aantal, bijv. "bouwblokken" of "AI-domeinen". */
  bouwblokEenheidMeervoud: string;
  featureCards: FeatureCard[];
  schaal: SchaalLabel[];
  organisatieVelden: VeldDefinitie[];
}

export interface Organisatie {
  id: string;
  assessmentId: string;
  naam: string;
  kenmerken: Record<string, unknown>;
  respondenten: Respondent[];
}

export type RespondentStatus = "uitgenodigd" | "bezig" | "afgerond";

export interface Respondent {
  id: string;
  organisatieId: string;
  email: string;
  naam: string;
  rol: string;
  team: string;
  notities: string;
  antwoorden: Record<string, number>;
  opmerkingenPerBouwblok: Record<string, string>;
  status: RespondentStatus;
  gestartOp: string;
  afgerondOp: string | null;
}

export type Classificatie = "rood" | "oranje" | "groen";
