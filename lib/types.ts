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
  /** Standaard 1 (geen effect op de score-berekening, die blijft nog een ongewogen gemiddelde). Zie datamodel.md, Bouwblok. */
  gewicht: number;
  vragen: Vraag[];
}

export interface Categorie {
  id: string;
  naam: string;
  kleur: string;
  volgorde: number;
  /** Standaard 1 (geen effect op de score-berekening, die blijft nog een ongewogen gemiddelde). Zie datamodel.md, Categorie. */
  gewicht: number;
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
  | "select-afhankelijk"
  | "select-met-verdeling"
  | "percentage"
  | "groep";

export interface VeldDefinitie {
  id: string;
  label: string;
  type: VeldType;
  opties?: string[];
  /**
   * Alleen voor type "select-afhankelijk": id van het broer-veld binnen
   * dezelfde groep waarvan de gekozen waarde bepaalt welke opties hier
   * beschikbaar zijn (bijv. Subsector hangt af van Sector,
   * `sbi-indeling.md`). Geen keuze bij het broer-veld: dit veld staat
   * uitgeschakeld.
   */
  afhankelijkVan?: string;
  /** Alleen voor type "select-afhankelijk": optielijst per waarde van `afhankelijkVan`. */
  optiesPerWaarde?: Record<string, string[]>;
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

/**
 * Vaste lijst bronnen voor de PDF-slotsectie
 * (export-pdf-visual-volwassenheidsscan.md, "Slotsectie per scan-type"),
 * geen vrij tekstveld: voorkomt dat een beheerder een niet-bestaande bron
 * intypt, waardoor de sectie stilletjes leeg zou blijven zonder
 * foutmelding. De bouwsteen-/domeinbeschrijvingen ("visie-coniche.md
 * deel 2", "visie-ai-klantcontact.md") staan hier bewust niet meer in:
 * die tekst zit al per bouwblok verweven (`Bouwblok.toelichting`, via
 * `lib/bouwblok-info.ts`), geen aparte slotsectie nodig.
 */
export type ContentBron = "visie-coniche.md-deel1" | "content-2030.md";

export interface PdfContentSectie {
  titel: string;
  bron: ContentBron;
}

export interface Assessment {
  id: string;
  naam: string;
  subtitel: string;
  beschrijving: string;
  doelgroep: string;
  icoon: string;
  geschatteDuur: string;
  /** Kort label voor de PDF-footer, bijv. "Volwassenheidsscan" of "AI-scan" (export-pdf-visual-volwassenheidsscan.md). */
  kortLabel: string;
  /** Slotsectie van de PDF-export, na alle bouwblokken/domeinen (export-pdf-visual-volwassenheidsscan.md, "Slotsectie per scan-type"). Geen slotsectie: null. */
  pdfContentSecties: PdfContentSectie | null;
  /** Niet elk Assessment-type heeft een categorie-laag (zie AI-volwassenheidsscan). */
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
  // Let op: organisatieVelden staat hier bewust niet meer — die zijn platformbreed
  // geworden, zie data/organisatie-velden.ts (datamodel-rbac-voorstel.md, keuze 4).
  /** Herkomst-template bij een sector-variant (bijv. Zorgscan). null bij een op zichzelf staand Assessment. Puur informatief, geen lopende koppeling — datamodel.md, Sector-varianten. */
  afgeleidVanAssessmentId: string | null;
}

/**
 * Datamodel vanaf hier volgt datamodel-rbac-voorstel.md, sectie 1/3 (deel 1:
 * alleen de structuur, geen Gebruiker/Sessie/Rol/Permissie/VerificatieCode/
 * AuditEvent — dat vereist een echte backend, zie changelog.md).
 *
 * Organisatie is niet langer aan één scan-type gebonden: een organisatie kan
 * meerdere ScanUitvoeringen hebben (verschillende assessment-types, of
 * dezelfde scan opnieuw als hermeting). Een OrganisatieLid is de persoon, los
 * van hoe vaak die persoon een scan invult — dat laatste is een
 * ScanInvulling, uniek per combinatie van lid + ScanUitvoering.
 *
 * Structuurkeuze t.o.v. het voorstel: leden/scanUitvoeringen/invullingen
 * zitten hier genest onder Organisatie (i.p.v. vier losse tabellen met
 * foreign keys) — dat is de vorm die voor een localStorage-blob praktisch
 * is (cascade-verwijderen is dan gratis) en sluit aan bij hoe dit al werkte
 * vóór deze refactor. Voor een echte database is normaliseren naar losse
 * tabellen de voor de hand liggende vervolgstap, niet nu gedaan.
 */
export interface Organisatie {
  id: string;
  naam: string;
  /** Volgt de (platformbrede) organisatieVelden-lijst, altijd bewerkbaar. */
  kenmerken: Record<string, unknown>;
  leden: OrganisatieLid[];
  scanUitvoeringen: ScanUitvoering[];
  aangemaaktOp: string;
  gewijzigdOp: string;
}

/**
 * De persoon (in de UI en specs: "Respondent" — zie CLAUDE.md,
 * Terminologie; de typenaam `OrganisatieLid` mag van v1-aanpassingen.md
 * punt 16 in de code blijven staan). Geen wachtwoord/account.
 *
 * `toegangscode` is de korte, niet-herleidbare code achter de publieke
 * link (v1-aanpassingen.md punt 2, `Toegangscode` in datamodel.md).
 * Bewuste vereenvoudiging t.o.v. het voorstel: geen aparte
 * `Toegangscode`-tabel — de code staat direct op het lid zelf, dat geeft
 * hetzelfde resultaat (verwijder het lid, en de code bestaat niet meer)
 * zonder een tweede structuur die met deze in de pas moet blijven lopen.
 */
export interface OrganisatieLid {
  id: string;
  organisatieId: string;
  email: string;
  /** Leeg tot de eerste intake, daarna vooringevuld bij een volgende scan. */
  naam: string | null;
  /** Was Respondent.rol — hernoemd om botsing met een toekomstige Rol-entiteit te voorkomen. */
  functie: string;
  team: string;
  notities: string;
  /** Uniek over alle organisaties heen, zie lib/toegangscode.ts. */
  toegangscode: string;
  aangemaaktOp: string;
}

/**
 * Eén geplande ronde van één scan-type bij één organisatie (bijv.
 * "Nulmeting 2026"). Geen status/openVanaf/sluitOp (nog): plannen van een
 * meetperiode is bewust nog niet gebouwd, zie backlog.md.
 */
export interface ScanUitvoering {
  id: string;
  organisatieId: string;
  assessmentId: string;
  label: string;
  aangemaaktOp: string;
  invullingen: ScanInvulling[];
}

export type ScanInvullingStatus = "uitgenodigd" | "bezig" | "afgerond";

/** Eén keer invullen door één lid binnen één ScanUitvoering. */
export interface ScanInvulling {
  id: string;
  scanUitvoeringId: string;
  organisatieLidId: string;
  status: ScanInvullingStatus;
  antwoorden: Record<string, number>;
  opmerkingenPerBouwblok: Record<string, string>;
  /** Moment van uitnodigen — blijft staan, ook na een reset van de invulling. */
  uitgenodigdOp: string;
  /** Moment dat de respondent scherm 4 (intake) indiende, null zolang status "uitgenodigd" is. */
  gestartOp: string | null;
  afgerondOp: string | null;
}

/**
 * Weergavemodel voor de doorloopflow-componenten (Sidebar/BouwblokForm/
 * MobielVoortgang): die tonen alleen naam + antwoorden + opmerkingen, wat nu
 * over twee records (OrganisatieLid + ScanInvulling) verdeeld is. Wordt per
 * pagina samengesteld, zie lib/db.ts `scanWeergave`.
 */
export interface ScanWeergave {
  naam: string | null;
  antwoorden: Record<string, number>;
  opmerkingenPerBouwblok: Record<string, string>;
}

export type Classificatie = "rood" | "oranje" | "groen";
