export interface Vraag {
  id: string;
  volgnummer: number;
  tekst: string;
  /** Alleen bij antwoordType "spanning": De korte naam van de invalshoek, boven de vraag ("Noodzaak"). Leeg: Niets tonen. */
  invalshoek?: string | null;
  /** Alleen bij antwoordType "spanning": De toelichting "Waar je op let" achter een Info-knop bij de vraag. Leeg: Geen Info-knop. */
  aandachtspunt?: string | null;
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
  /**
   * Alleen bij antwoordType "ja-nee-weetniet": De zin onder de afdelingskaart als dit bouwblok het grootste aandachtspunt van de
   * afdeling is (`content-ziekenhuis-quickscan.md`). Leeg: Er staat geen zin.
   */
  aandachtZin?: string | null;
  /** Alleen bij antwoordType "spanning": Naam voor rijen en tooltips waar de volledige naam te lang is ("Verhaal"). Leeg: De volledige naam. */
  korteNaam?: string | null;
  /** Alleen bij antwoordType "spanning": Vijf teksten, één per niveau 1 tot en met 5, het ijkpunt uit het boek voor dit veld. */
  ijkpunten?: string[] | null;
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
  /**
   * De respondent kan aangeven dat deze categorie niet van toepassing is (`datamodel.md`, Optionele categorieën). Standaard
   * `false`: Dan verandert er niets.
   */
  optioneel?: boolean;
  /** Definitie onder de naam in de doorloopflow (Quickscan, de afdeling). Leeg: Er staat niets. */
  omschrijving?: string | null;
}

/** Hoe een vraag wordt beantwoord en hoe de score wordt berekend (`datamodel.md`, Antwoordtype). */
export type AntwoordType = "schaal" | "ja-nee-weetniet" | "spanning";

/**
 * Een antwoord op een vraag: 1 tot en met 5 bij antwoordType "schaal", Ja, Nee of Weet ik niet bij "ja-nee-weetniet", en 0 tot en
 * met 5 bij "spanning" (0 is "Kan ik niet beoordelen": Een geldig antwoord dat niet meetelt in de score).
 */
export type Antwoord = number | "ja" | "nee" | "weet-niet";

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
  /**
   * Weergavenaam van het veld in lijsten en grafieken (`datamodel.md`, Korte namen). Leeg betekent `label`. De namen die een
   * Admin invult staan bij de instellingen (`Instellingen.korteNamen`), de definities zelf zijn vaste data.
   */
  korteNaam?: string;
  /** Weergave-eenheid bij getal en percentage (bijv. "s"), gebruikt door Verkennen bij de drempel. Leeg bij een percentage is "%". */
  eenheid?: string;
  type: VeldType;
  opties?: string[];
  /**
   * Alleen voor type "select": Naast de vaste `opties` is er een keuze "Anders…" met een invoerveld. De ingevulde tekst
   * wordt daarna ook aangeboden aan andere organisaties (`lib/kenmerken-opties.ts`).
   */
  eigenOptie?: boolean;
  /**
   * Alleen voor type "select" met `eigenOptie`: Opties die altijd bovenaan staan, in deze volgorde en niet
   * alfabetisch (bijv. "Geen ondersteuning" voor de partijen). Ze staan niet in `opties`. Staat hier de hele lijst in,
   * dan blijft de aangeleverde volgorde en komt eigen invoer daarna op alfabet (bijv. Deploymentmodel).
   */
  voorop?: string[];
  /** Alleen voor type "select" met `eigenOptie`: De hint in het invoerveld bij "Anders…" (standaard "Naam van de oplossing"). */
  eigenOptiePlaceholder?: string;
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
  /** Verouderd: Zelf/extern uit de tijd vóór "Ondersteund door". Niet meer in het formulier, alleen gelezen voor oude data. */
  ondersteuning?: "zelf" | "extern";
  /** "Ondersteund door": "Geen ondersteuning" of een partij. Gaat voor op `ondersteuning`. */
  ondersteuner?: string;
  /** Keuzelijsten op dezelfde regel, `data/organisatie-velden.ts`. */
  deploymentmodel?: string;
  cloudleverancier?: string;
  /** Alleen bij LLM-oplossing: Hoe het model wordt aangeboden (`leverancier` is dan de modelfamilie). */
  toegangsroute?: string;
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
  /** De 1–5-schaal. Leeg bij antwoordType "ja-nee-weetniet": Dan is er geen schaal (`datamodel.md` noemt dat `null`). */
  schaal: SchaalLabel[];
  /** Standaard "schaal" (1–5). Zie `datamodel.md`, Antwoordtype. */
  antwoordType?: AntwoordType;
  /** Regel boven de vragen in de doorloopflow. Leeg: De standaardtekst voor de 1–5-schaal. */
  instructieregel?: string | null;
  /** Alleen als een Categorie optioneel is: De Ja/Nee-vraag bovenaan die categorie. */
  relevantieVraag?: string | null;
  /** Alleen bij antwoordType "spanning": De tekst van de open vraag onder elk veld. Leeg: Het gewone opmerkingenveld. */
  openVraag?: string | null;
  /** Alleen bij antwoordType "spanning": De opties van de vraag Rolgroep in de intake. Leeg: De vraag ontbreekt. */
  rolgroepen?: string[] | null;
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
/** Een kanaal waarop contact verloopt (`datamodel.md`, KPI's en kanalen). Eén lijst voor het hele platform, beheerd door een Admin. */
export interface Kanaal {
  id: string;
  /** Uniek, hoofdletterongevoelig. */
  naam: string;
  volgorde: number;
}

/** Een KPI en op welke plekken er een waarde voor mag staan (`datamodel.md`, KPI's en kanalen). Algemeen mag altijd. */
export interface KpiDefinitie {
  /** Bijvoorbeeld "aht": Het pad `kpis.aht` in de korte namen en in een opgeslagen verkenning. */
  id: string;
  naam: string;
  /** Bijvoorbeeld "s", "%" of "aantal", of `null` zonder eenheid. */
  eenheid: string | null;
  perOnderdeel: boolean;
  perKanaal: boolean;
  volgorde: number;
}

/**
 * Eén KPI-waarde (`datamodel.md`, KPI's en kanalen): Uniek op Organisatie, Onderdeel, kanaal en KPI. `onderdeelId: null` is
 * Algemeen (de hele organisatie), `kanaalId: null` is Algemeen bij het kanaal (alle kanalen samen). Een lege cel is geen record.
 */
export interface KpiWaarde {
  organisatieId: string;
  onderdeelId: string | null;
  kanaalId: string | null;
  kpiId: string;
  waarde: number;
}

/** Een deel van een Organisatie waarover een Meting gaat en waarvoor KPI-waarden kunnen staan (`datamodel.md`, Onderdeel). */
export interface Onderdeel {
  id: string;
  organisatieId: string;
  naam: string;
  aangemaaktOp: string;
}

/** Een relevante contactpersoon bij een Organisatie, met een LinkedIn-profiel (`datamodel.md`, Contactpersoon). Geen Respondent en geen gebruiker. */
export interface Contactpersoon {
  id: string;
  naam: string;
  /** Functie bij de Organisatie, vrije tekst. */
  functie: string;
  /** Het adres van het LinkedIn-profiel, altijd met https://. Leeg als er geen is. */
  linkedinUrl: string;
  /** Waarom de persoon relevant is, vrije tekst. */
  notitie: string;
  aangemaaktOp: string;
}

/**
 * Een item in het Dossier van een Organisatie (`datamodel.md`, Dossieritem; `dossier.md`): Nieuws, een Case, een Event of een Blog. De velden
 * die bij een soort horen, zijn bij de andere soorten leeg.
 */
export interface Dossieritem {
  id: string;
  /** Staat vast na het aanmaken. */
  soort: "nieuws" | "case" | "event" | "blog";
  titel: string;
  /** Voor Nieuws de reden waarom het relevant is, voor een Case "Waarom dit voor jullie telt". De Lead leest deze tekst. */
  toelichting: string;
  zichtbaarVoorLead: boolean;
  /** `Bouwblok.id` van de Klantcontact Volwassenheidsscan en de AI-scan (de AI-domeinen). */
  bouwblokIds: string[];
  /** Nieuws en Blog: verplicht. Case en Event: optioneel. Altijd http of https. */
  url: string;
  aangemaaktOp: string;
  gewijzigdOp: string;
  /** Alleen Nieuws en Blog: De publicatie of de site. */
  bron: string;
  /** Alleen Nieuws en Blog: jjjj-mm-dd, leeg als het onbekend is. */
  gepubliceerdOp: string;
  /** Alleen Event: De startdatum, jjjj-mm-dd, verplicht. */
  datum: string;
  /** Alleen Event: jjjj-mm-dd, leeg bij een event van één dag, niet voor `datum`. */
  einddatum: string;
  /** Alleen Event: Bijvoorbeeld "Utrecht" of "Online". */
  plaats: string;
  /** Alleen Case: Verplicht. */
  samenvatting: string;
  /** Alleen Case: De Organisatie waar de case over gaat, `null` als die is verwijderd of nog niet is gekozen. */
  caseOrganisatieId: string | null;
  /** Alleen Case: Bijvoorbeeld "800 medewerkers". */
  omvang: string;
  /** Alleen Case: Bijvoorbeeld "6 weken". */
  totResultaat: string;
}

/** Het Dossier van een Organisatie (`datamodel.md`, Dossieritem). */
export interface Dossier {
  /** Of de Leads van de Organisatie het Dossier zien. Standaard `false`. */
  openVoorLead: boolean;
  /** Het moment waarop `openVoorLead` voor het laatst aan ging. */
  openSinds: string | null;
  /** De laatste wijziging in wat een Lead ziet. */
  gewijzigdOp: string | null;
  items: Dossieritem[];
}

export interface Organisatie {
  id: string;
  naam: string;
  /** Relevante contactpersonen, op alfabet getoond. Ontbreekt bij data van vóór dit veld. */
  contactpersonen?: Contactpersoon[];
  /** Het Dossier met Nieuws en Cases (`dossier.md`). Ontbreekt bij data van vóór dit veld, dan is het leeg en dicht. */
  dossier?: Dossier;
  /**
   * Of deze Organisatie als Case bij een andere Organisatie mag voorkomen (`datamodel.md` deel 3, Uitbreiding op Organisatie, de Afspraak
   * "Mag als case gebruikt worden"). Standaard `false`.
   */
  caseToegestaan?: boolean;
  /** De Onderdelen van deze Organisatie, één keer per Organisatie. "Hele organisatie" is er geen van. Ontbreekt bij data van vóór dit veld. */
  onderdelen?: Onderdeel[];
  /** De KPI-waarden van deze Organisatie, per plek (Onderdeel), kanaal en KPI (`datamodel.md`, KPI's en kanalen). Ontbreekt bij data van vóór dit veld. */
  kpiWaarden?: KpiWaarde[];
  /**
   * Weergavenaam voor kolomkoppen in matrices en heatmaps (`datamodel.md`, Organisatie), maximaal 30 tekens. Leeg of ontbrekend
   * betekent dat `naam` zelf geldt.
   */
  korteNaam?: string | null;
  /** Volgt de (platformbrede) organisatieVelden-lijst, altijd bewerkbaar. */
  kenmerken: Record<string, unknown>;
  leden: OrganisatieLid[];
  scanUitvoeringen: ScanUitvoering[];
  /** Wat elke Lead van deze organisatie ziet (`beheerpagina.md`, punt 6a). Ontbreekt bij data van vóór dit veld. */
  leadToegang?: LeadToegang[];
  /**
   * Of een Lead bij Antwoorden de namen van de respondenten ziet (`datamodel.md` deel 3, Uitbreiding op Organisatie). Standaard
   * `false`: Dan staan er R1 tot en met Rn. Een Admin zet het na afstemming met de opdrachtgever.
   */
  antwoordenMetNamen?: boolean;
  /** Een melding aan de Admin over de omzetting van het bereik van een Lead naar vinkjes (`beheerpagina.md`, punt 6a, Overgang). */
  leadOvergangMelding?: string | null;
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
   * De Lead-rol (`RespondentRol`, `datamodel.md` deel 2, Wat een Lead mag zien). Wat een Lead ziet, staat in
   * `Organisatie.leadToegang`. Gebruik `isLead` uit `lib/lead.ts`.
   */
  lead?: boolean;
  /**
   * Alleen in data van vóór de tabel Leads (14 oktober 2026): Het bereik van een Lead. Het laden zet ze om in `lead` en
   * `Organisatie.leadToegang` en laat ze vallen (`beheerpagina.md`, punt 6a, Overgang). Nooit meer zelf zetten.
   */
  leadMetingIds?: string[];
  leadVoorOrganisatie?: boolean;
  /**
   * Het moment waarop de Lead de Dossierpagina voor het laatst opende (`dossier.md`, Mijn metingen: De tag "Nieuw"). `null` of
   * ontbrekend: Nog nooit.
   */
  dossierGezienOp?: string | null;
  aangemaaktOp: string;
}

/** Een weergave die een Lead kan krijgen (`datamodel.md` deel 2, `LeadToegang`). */
export type LeadWeergave = "resultaten" | "spreiding" | "antwoorden" | "uitnodigen" | "exporteren" | "benchmark";

/**
 * Eén vinkje in de tabel Leads (`beheerpagina.md`, punt 6a): De Lead ziet deze weergave van deze Meting of deze benchmark.
 * Uniek per combinatie van Respondent, weergave en Meting of benchmark. Een nieuwe Meting of benchmark begint voor elke Lead
 * zonder vinkje en toegang erft nergens van mee.
 */
export interface LeadToegang {
  respondentId: string;
  weergave: LeadWeergave;
  /** Bij alle weergaven behalve `benchmark`. */
  metingId?: string;
  /** Bij `benchmark`. */
  benchmarkId?: string;
  /** `Gebruiker.id` van de Admin. */
  toegekendDoor: string;
  toegekendOp: string;
}

/**
 * Eén afname van één scan-type bij één organisatie, voor één onderdeel en op één meetdatum (`datamodel.md`, Meting).
 * Geen status/openVanaf/sluitOp (nog): plannen van een meetperiode is bewust nog niet gebouwd, zie backlog.md.
 */
export interface ScanUitvoering {
  id: string;
  organisatieId: string;
  assessmentId: string;
  /** De naam van de Meting (`datamodel.md`, Naam van een Meting): Gemaakt uit onderdeel en meetdatum, tenzij `labelHandmatig`. */
  label: string;
  /** De gebruiker heeft de naam zelf aangepast: Hij volgt onderdeel en meetdatum niet meer. */
  labelHandmatig?: boolean;
  /**
   * De dag waarop gemeten wordt, `JJJJ-MM-DD` zonder tijdstip (`datamodel.md`, Onderdeel en meetdatum). Ontbreekt bij een Meting
   * uit de tijd van de rondes: Ze toont "Datum ontbreekt" en doet niet mee aan een samenstelling of vergelijking.
   */
  meetdatum?: string;
  /**
   * Het Onderdeel van de Organisatie waar de Meting over gaat (`datamodel.md`, Onderdeel): `null` of afwezig is "Hele organisatie". De naam
   * staat alleen bij het Onderdeel en wordt opgezocht met `onderdeelVan` (`lib/metingen.ts`). Het tekstveld `onderdeel` van vóór 19 oktober
   * 2026 is vervallen en wordt bij het laden nog één keer gelezen om de Onderdelen aan te maken (`lib/onderdelen.ts`).
   */
  onderdeelId?: string | null;
  /**
   * Alleen bij een samengestelde Meting (`benchmark.md`, Onderdeel en samengestelde Meting): De Meting-id's waarvan ze het
   * gemiddelde is. Een samengestelde Meting heeft geen Respondenten en geen `invullingen`.
   */
  samenstelling?: string[];
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
  antwoorden: Record<string, Antwoord>;
  /**
   * Alleen bij optionele categorieën (`Categorie.optioneel`): Per categorie `true` (van toepassing) of `false` (niet van
   * toepassing). Ontbreekt de categorie, dan is de vraag nog niet beantwoord (`datamodel.md`, Optionele categorieën).
   */
  relevantie?: Record<string, boolean>;
  opmerkingenPerBouwblok: Record<string, string>;
  /** Alleen bij `Assessment.rolgroepen`: De gekozen optie in de intake, voor de analyse per groep (`datamodel.md`, Scoreberekening). */
  rolgroep?: string | null;
  /**
   * Notitie bij het starten van déze scan (`datamodel.md`, Notitie op de scan). Bij een import de `start_comment`. Hoort bij
   * de scan en niet bij de Respondent: Eén Respondent kan veel scans hebben. Ontbreekt bij data van vóór dit veld.
   */
  notitie?: string | null;
  /** Moment waarop de regel in de app is aangemaakt (`datamodel.md`, ScanInvulling). Bij een import het importmoment, niet de datum uit het bestand. */
  aangemaaktOp: string;
  /** Moment van uitnodigen — blijft staan, ook na een reset van de invulling. */
  uitgenodigdOp: string;
  /** Moment dat de respondent scherm 4 (intake) indiende, null zolang status "uitgenodigd" is. */
  gestartOp: string | null;
  afgerondOp: string | null;
  /**
   * Moment van het laatste opslaan van een antwoord, voor "Laatst opgeslagen" op Mijn metingen (`visualisatie-mijn-metingen.md`).
   * Gezet bij elke wijziging van de antwoorden. Ontbreekt bij data van vóór dit veld.
   */
  laatstOpgeslagenOp?: string | null;
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
  antwoorden: Record<string, Antwoord>;
  relevantie?: Record<string, boolean>;
  opmerkingenPerBouwblok: Record<string, string>;
}

export type Classificatie = "rood" | "oranje" | "groen";

/**
 * Een benchmark (`datamodel.md` deel 3, `benchmark.md`): De samenstelling van een zelf gekozen groep organisaties.
 * Scores staan hier niet: Die worden altijd berekend uit de scans (`lib/benchmark.ts`).
 */
export type BenchmarkNiveau = "organisaties" | "metingen" | "scans";

/** Een benchmark tussen organisaties is een vaste groep (gekozen leden) of een verkenning (leden volgen uit filters, `benchmark.md`, Opgeslagen verkenning). */
export type BenchmarkSoort = "vasteGroep" | "verkenning";

/** De eenheid van een verkenning: Een lid is een Organisatie of een onderdeel (een Meting met een onderdeel). */
export type VerkenEenheid = "organisaties" | "onderdelen";

/**
 * De Meetperiode van een verkenning (`benchmark.md`, Welke Meting telt waar): Een begin- en einddatum op de meetdatum van de Meting
 * (`JJJJ-MM-DD`, beide inclusief). Per Organisatie, bij Onderdelen per onderdeel, telt de laatste Meting binnen de periode. Zonder
 * periode telt de meest recente Meting.
 */
export interface Meetperiode {
  van: string;
  totEnMet: string;
}

/** Eén filter van een opgeslagen verkenning: Een kenmerk (een veld, `__kanalen`, `__organisatie` of `__onderdeel`) met de gekozen waarden. */
export interface VerkenningFilter {
  kenmerk: string;
  waarden: string[];
}

/**
 * Hoe de Metingen van een benchmark binnen een organisatie gelezen worden (`benchmark.md`, Niveau 2, Lezing): De ontwikkeling
 * van één onderdeel over de tijd (weergave C), of Metingen op een vergelijkbaar meetmoment naast elkaar (weergave H).
 */
export type BenchmarkLezing = "ontwikkeling" | "naastElkaar";

export interface Benchmark {
  id: string;
  naam: string;
  /**
   * Wat een lid is (`benchmark.md`, Wat het is): `organisaties` is een organisatie met een Meting per Assessment (tussen
   * organisaties, met de vlag `benchmarkToegestaan`), `metingen` een Meting van één organisatie (binnen een organisatie),
   * `scans` één Meting waarin de afgeronde scans worden vergeleken. Ontbreekt het veld, dan is het `organisaties`.
   */
  niveau?: BenchmarkNiveau;
  /** Alleen bij niveau `organisaties` (voorstel van 16 oktober 2026): Ontbreekt het veld, dan is het een vaste groep. */
  soort?: BenchmarkSoort;
  /** Alleen bij soort `verkenning`. */
  eenheid?: VerkenEenheid;
  /** Alleen bij soort `verkenning`, minstens één. De leden zijn leeg en volgen bij elk gebruik uit deze filters. */
  filters?: VerkenningFilter[];
  /** Alleen bij soort `verkenning` (voorstel van 19 oktober 2026): Ontbreekt het veld, dan telt per lid de meest recente Meting. */
  meetperiode?: Meetperiode;
  /**
   * Alleen bij niveau `metingen` (`benchmark.md`, Niveau 2, Lezing): Hoe de Metingen gelezen worden. Ontbreekt het veld, dan
   * volgt de lezing uit de Metingen zelf (`lezingVan` in `lib/benchmark.ts`).
   */
  lezing?: BenchmarkLezing;
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

/**
 * Alleen voor de overgang naar `LeadToegang` (14 oktober 2026): Een view van een benchmark die op 13 oktober 2026 aan een
 * Lead is toegewezen. Bestaande toewijzingen worden bij het laden vinkjes in de tabel Leads en daarna gewist.
 */
export interface BenchmarkToewijzing {
  id: string;
  benchmarkId: string;
  /** De organisatie waarvan de view is (bij niveau 2 en 3: de organisatie van de Meting). */
  organisatieId: string;
  /** Niveau 2 en 3: De Meting van de view (`benchmark.md`, Toewijzen aan een Lead op alle niveaus). */
  metingId?: string;
  /** Niveau 3: De Respondent van wie de scan de view is. */
  onderwerpRespondentId?: string;
  /** `OrganisatieLid.id` van de Lead. */
  respondentId: string;
  /** `Gebruiker.id` van de Admin. */
  toegewezenDoor: string;
  toegewezenOp: string;
}
