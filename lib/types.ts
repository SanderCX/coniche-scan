export interface Vraag {
  id: string;
  volgnummer: number;
  tekst: string;
  /** Zie `Bouwblok.gearchiveerd` hieronder — dezelfde reden, op vraagniveau. */
  gearchiveerd?: boolean;
}

export interface Bouwblok {
  id: string;
  volgnummer: number;
  naam: string;
  omschrijving: string;
  /** Lopende tekst in de Toelichtingsmodal (`stylesheet.md`). Leeg: dat onderdeel ontbreekt. Alinea's gescheiden door een lege regel. */
  toelichting: string | null;
  /** Blok "CENTRALE VRAAG" in dezelfde modal. Leeg: het blok ontbreekt. `undefined`: nog niet gevuld, `lib/assessment-migratie.ts` vult het bij het laden. */
  centraleVraag?: string | null;
  tags: string[];
  /** Standaard 1; een getal groter dan 0, ook decimalen. Werkt door in categorie- en overallscore (`lib/scoring.ts`), niet in de bouwblokscore. Zie datamodel.md, Bouwblok. */
  gewicht: number;
  vragen: Vraag[];
  /**
   * "Verwijderen" in het contentbeheerscherm zet dit i.p.v. het record echt
   * te verwijderen (datamodel.md, "Content bewerken"): een bouwblok/vraag
   * waar al antwoorden aan hangen mag niet verdwijnen, anders verdwijnen
   * scores uit eerdere invullingen mee. Gearchiveerde bouwblokken/vragen
   * tellen niet meer mee voor NIEUWE invullingen (doorloopflow, voortgang,
   * landingspagina-tellingen — `lib/assessment-structuur.ts`,
   * `actieve*`-functies) maar blijven gewoon staan voor het herberekenen
   * van bestaande scores (`bouwblokScore` e.a. lezen nog altijd het volledige,
   * ongefilterde `vragen`/`bouwblokken`-array).
   */
  gearchiveerd?: boolean;
}

export interface Categorie {
  id: string;
  naam: string;
  kleur: string;
  volgorde: number;
  bouwblokken: Bouwblok[];
  /** Zie `Bouwblok.gearchiveerd` hierboven — dezelfde reden, op categorieniveau. */
  gearchiveerd?: boolean;
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
  /** Eyebrow in de Toelichtingsmodal, standaard "Bouwsteen" (Klantcontact, Zorg) of "AI-domein" (AI-scan). */
  bouwblokLabel: string;
  /** Kop van de wegingskaart op de intake (`CLAUDE.md`, scherm 4). Leeg: standaardtitel. */
  wegingTitel?: string | null;
  /** Tekst van de wegingskaart, per Assessment aanpasbaar. Leeg: standaardtekst. */
  wegingToelichting?: string | null;
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

/** Rollen aan de beheerkant (`datamodel.md` deel 2, Rollen). Lead en
 * Respondent zijn organisatiekant-rollen, geen `Gebruiker` — die hebben nog
 * geen eigen UI (`beheerpagina.md` punt 9: "Respondenten en Leads
 * blijven bereikbaar via de organisatie, niet hier"). */
export type BeheerRol = "admin" | "consultant";

/**
 * Iemand van Coniche die inlogt in beheer (`datamodel.md` deel 2,
 * Gebruiker). **Prototype-niveau**, zelfde disclaimer als
 * `lib/admin-auth.ts`: `wachtwoord` staat hier in platte tekst
 * (localStorage, geen backend), geen 2FA (`tfaGeheim`/`tfaActief` uit de
 * spec bewust weggelaten — die komen pas met een echte backend, ook zo
 * genoemd in `beheerpagina.md` punt 9). Ook geen aparte
 * `Rol`/`Permissie`/`RolPermissie`-tabellen: Met precies twee beheerrollen
 * en een rechtenmatrix die voor de helft nog "te bevestigen" is
 * (`datamodel.md` deel 2, Rechtenmatrix), zou een volledig databankdreven
 * permissiesysteem nu ongebruikte flexibiliteit zijn. Rechten staan
 * daarom in code, gecentraliseerd in `lib/rechten.ts`, niet als losse
 * datarecords — makkelijk later alsnog te normaliseren als de matrix
 * stabiel is.
 */
export interface Gebruiker {
  id: string;
  email: string;
  naam: string;
  wachtwoord: string;
  rol: BeheerRol;
  /** Nooit hard verwijderd (`datamodel.md` deel 2, Verwijderen en archiveren). */
  actief: boolean;
  laatstIngelogdOp: string | null;
  aangemaaktOp: string;
}

/**
 * Datamodel vanaf hier volgt datamodel-rbac-voorstel.md, sectie 1/3 voor de
 * structuur (`Gebruiker` hierboven is inmiddels wel gebouwd, prototype-
 * niveau — zie `datamodel.md` deel 2; `Sessie`/`VerificatieCode`/
 * `ToegangsSessie`/`AuditEvent` nog niet, dat vereist een echte backend,
 * zie changelog.md).
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
  /**
   * `gebruikerId` van de Consultant/Admin die deze organisatie aanmaakte —
   * samen met `toegewezenAan` het bereik "eigen" in de rechtenmatrix
   * (`datamodel.md` deel 2, Eigenaarschap en toegang van/tot
   * organisaties). `null` bij organisaties die al bestonden vóór dit veld
   * (seed-data, of aangemaakt vóór gebruikersbeheer): Die zijn alleen voor
   * een Admin zichtbaar/bewerkbaar, nooit voor een Consultant, tot een
   * Admin het eigenaarschap alsnog toekent of de organisatie toewijst.
   */
  aangemaaktDoor: string | null;
  /**
   * `gebruikerId`'s van Consultants die een Admin deze organisatie expliciet
   * heeft toegewezen, bovenop het eigenaarschap van `aangemaaktDoor`
   * (`OrganisatieToegang` in `datamodel.md` deel 2). Genest hier in plaats
   * van een losse tabel — zelfde structuurkeuze als `leden`/
   * `scanUitvoeringen` hierboven, praktisch voor een localStorage-blob.
   */
  toegewezenAan: string[];
  /**
   * Of deze organisatie in een benchmark mag worden opgenomen (`datamodel.md` deel 3, `benchmark.md`, Toestemming en
   * privacy). Een Admin zet de vlag nadat dit met de organisatie is afgesproken. Standaard `false`.
   */
  benchmarkToegestaan: boolean;
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
  /**
   * `ScanUitvoering.id`'s (van deze organisatie) waar dit lid Lead-toegang
   * toe heeft — `datamodel.md` deel 2, `RespondentRolMeting`. Leeg = geen
   * Lead. Bewust genest hier in plaats van een losse
   * `RespondentRolMeting`-tabel/-array: een Lead bestaat per definitie niet
   * zonder minstens 1 gekoppelde Meting (`beheerpagina.md` punt 6a), dus is
   * er ook geen apart "is Lead"-veld nodig.
   */
  leadMetingIds: string[];
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
  /** Moment waarop de regel in de app is aangemaakt (`datamodel.md`, ScanInvulling). Bij een import het importmoment, niet de datum uit het bestand. */
  aangemaaktOp: string;
  /** Moment van uitnodigen — blijft staan, ook na een reset van de invulling. */
  uitgenodigdOp: string;
  /** Moment dat de respondent scherm 4 (intake) indiende, null zolang status "uitgenodigd" is. */
  gestartOp: string | null;
  afgerondOp: string | null;
  /** Bewaartermijn ingevulde scans (datamodel.md deel 2): zet de "Data ouder dan de bewaartermijn"-melding uit tot deze datum. `null` = geen verlenging aangevraagd. */
  bewaarVerlengdTot: string | null;
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

/**
 * Een benchmark (`datamodel.md` deel 3, `benchmark.md`): De samenstelling van een zelf gekozen groep organisaties.
 * Scores staan hier niet: Die worden altijd berekend uit de scans (`lib/benchmark.ts`).
 */
export interface Benchmark {
  id: string;
  naam: string;
  /** Eén of meer Assessments. Elk heeft in de weergave een eigen sectie, scores van verschillende Assessments worden niet samengevoegd. */
  assessmentIds: string[];
  /** Per organisatie hoogstens één lid per Assessment. */
  leden: BenchmarkLid[];
  /**
   * Meldingen voor de beheerweergave, bijvoorbeeld "Organisatie X is uit de benchmark gehaald omdat de Meting is
   * verwijderd" (`benchmark.md`, Samenstellen: Valt een lid weg, dan meldt de beheerweergave dat). Niet in het
   * datamodel: Een hulp voor het scherm, door een Admin weg te klikken.
   */
  meldingen: { tekst: string; op: string }[];
  aangemaaktOp: string;
  /** `Gebruiker.id` van de Admin. */
  aangemaaktDoor: string;
}

/** Eén organisatie met één Assessment en één Meting in een benchmark. */
export interface BenchmarkLid {
  organisatieId: string;
  /** Een van `Benchmark.assessmentIds`. */
  assessmentId: string;
  /** Een Meting van deze organisatie en dit Assessment. */
  metingId: string;
}

/** Een view van een benchmark voor een Lead van de organisatie waarvan de view is. */
export interface BenchmarkToewijzing {
  id: string;
  benchmarkId: string;
  /** De organisatie waarvan de view is. */
  organisatieId: string;
  /** `OrganisatieLid.id` van de Lead. */
  respondentId: string;
  /** `Gebruiker.id` van de Admin. */
  toegewezenDoor: string;
  toegewezenOp: string;
}
