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

export interface Assessment {
  id: string;
  naam: string;
  subtitel: string;
  beschrijving: string;
  doelgroep: string;
  icoon: string;
  geschatteDuur: string;
  categorieen: Categorie[];
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
