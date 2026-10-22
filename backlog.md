# Coniche Scan: Backlog

Bewust nog niet opgepakt. Geen prioritering.

## Techniek en infrastructuur

- **Database**: Vervanging van localStorage door een gedeelde database.
  De tijdelijke Neon-opslag vervalt. De database wordt Azure SQL
  Database, uitgewerkt in `azure-plan.md`. Pas daarna werken
  links in elke browser en komen antwoorden van respondenten centraal
  binnen.
- **Rollen, rechten en inlog** (`datamodel.md` deel 2):
  Admin, Consultant, Lead, 2FA, audit. Met de database.
- **E-mailverificatie bij het openen van de link**: Code per mail, 15
  minuten geldig (`datamodel.md`, Toegangscode). Met de database en de
  mailserver.
- **Coniche-mailserver (SMTP)**: Voor uitnodigingen en verificatiecodes.
  De bestaande Gmail-koppeling is alleen voor testen. Mailprovider kiezen
  (bijvoorbeeld SendGrid), SPF, DKIM en DMARC configureren, een apart domein
  registreren voor scan- en surveyverkeer, en de reminder-functionaliteit en
  het verzendgedrag testen.
- **Antwoorden als losse records**: Handig voor export en aggregatie
  zodra de database er is. Nu volstaat een lijst per ingevulde scan.
- **Responsive**: De app is nu alleen voor desktop.
- **Servicewindow voor beheer**: Een vast tijdvenster waarbinnen beheer
  plaats kan vinden, zoals onderhoud, een update, een migratie of een grote
  import of verplaatsactie, zonder dat iemand op dat moment met data bezig
  is. Bedoeld gedrag:
  - Een Admin plant een window met start, einde en reden.
  - Vóór de start krijgen ingelogde gebruikers (beheer en respondenten) een
    waarschuwing met aftelling dat ze worden uitgelogd, bijvoorbeeld 30, 10
    en 5 minuten van tevoren.
  - Bij de start worden alle sessies beëindigd. Een scan die nog in
    invulling is, slaat eerst de antwoorden op, zodat er geen voortgang
    verloren gaat, en het Bewerkslot (`datamodel.md`) wordt vrijgegeven.
  - Tijdens het window kan niemand inloggen of een persoonlijke link
    openen. Beide tonen een melding met het verwachte einde.
  - De Admin ziet vóór de start wie er nog actief is en kan pas beginnen
    als er niemand meer is ingelogd, of bewust doorzetten.
  - Het begin en einde van het window worden gelogd (`AuditEvent`).
  Nog open: De maximale duur, of een window ook direct (zonder plan) te
  starten is, en de vorm van de waarschuwing. Hangt af van echte sessies en
  het Bewerkslot, dus van fase 2 hieronder.

## Voor productie

- **Privacy en retentie** (`privacy-pagina.md`, `go-live-plan.md` fase 7):
  Bewaartermijn per uitvraag instelbaar, een notificatieproces voor
  aflopende bewaartermijnen, een vastgelegde procedure voor verlengen en
  verwijderen, en back-upretentie afgestemd op het dataretentiebeleid.
- **Testknop** (vragenlijst automatisch invullen): Alleen tonen aan
  ingelogde beheerders, en alleen als de instelling `testknopAan` aan staat
  (`beheerpagina.md`, Schakelaar Testknop), standaard uit. De keuze "Gemiddelde
  score" is een keuzelijst (combobox) met de waarden 2, 3 en 4, geen half
  invulveld. De werking van de knop blijft zoals nu.
- **Testdata**: Seed-data met een testorganisatie en testrespondent
  opruimen.
- **Data-integriteit** (`beheerpagina.md`, punt 13): Controlefunctie die na
  een verwijderactie aantoont dat er niets meer verwijst naar het
  verwijderde record, zodat er geen wees-data achterblijft. Bestaat als
  knop "Controleer nu". Uitwerking met modal per controle staat in de
  spec. Nog te beslissen: Blijft hij in productie.
- **Bronformaat "Oude tool" verwijderen bij Import** (`import-scans.md`):
  Zodra de historische migratie uit de oude, stopgezette
  tool voltooid is, kan dat bronformaat uit de CSV-import. "Coniche Scan
  (eigen export)" blijft wel bestaan, dat is geen eenmalige migratie
  maar een blijvende manier om data tussen browsers te verplaatsen
  zolang de opslag nog localStorage is.

## Functioneel

- **Zorgspecifieke teksten voor Visie en Bouwstenen**: De
  Zorgscan gebruikt op de Assessment-pagina voorlopig dezelfde secties als
  Klantcontact Volwassenheid (`schermen.md`, Assessment-pagina). Later krijgen
  Visie en Bouwstenen voor Zorg eigen teksten.
- **Content voor de Quickscan Ziekenhuis op de Assessment-pagina**: Nu geen sub-nav en geen extra content. Nog te bepalen wat er komt.

- **Conflict oplossen bij omhangen naar een andere Meting**
  (`beheerpagina.md`, punt 6b): Heeft de Respondent in de doel-Meting al een
  scan, dan komt er naast de waarschuwing een modal met beide scans naast
  elkaar, waarin één scan aan een andere of nieuwe Respondent wordt
  gekoppeld. Spec is uitgeschreven. Nog te bouwen.
- **Landingspagina als leadgenerator**: De assessment-landingspagina
  krijgt een knop "Toegang aanvragen" in plaats van de uitgeschakelde
  "Start assessment".
- **Respons aan een andere Respondent hangen, binnen dezelfde
  organisatie**: Nu kun je een Respondent bewerken (`beheerpagina.md`,
  punt 6b), waarbij alle scans van die Respondent meegaan. Een losse
  ingevulde scan aan een andere Respondent hangen kan nog niet. Nodig
  zodra een organisatie meerdere contactpersonen heeft die elk een deel van
  de geïmporteerde scans hebben ingevuld. Bedoelde uitwerking: Een rij
  in de lijst Respondenten aanvinken, waarna de knop "Toewijzen"
  verschijnt (`beheerpagina.md`, punt 6b).
- **Opnieuw invullen door de respondent**: De respondent start zelf,
  vanuit de scan, een nieuwe poging. Beheer verwijdert alleen.
- **Terugkomen bij eerdere scans**: Via de persoonlijke link naar een
  uitgebreidere omgeving met alle eigen metingen en resultaten.
- **AI-managementsamenvatting**: Wordt nieuw opgezet.
- **Afwijking en spreiding bovenop de aggregatie**: Het gemiddelde per
  Meting op organisatieniveau is gebouwd (`beheerpagina.md`,
  Organisatie-resultaten). Een maat voor afwijking/spreiding tussen
  respondenten daarbovenop is ontworpen: `visualisatie-scores.md`, onderdeel A en B.
- **Vergelijking tussen Metingen**: Dit item
  "Trend tussen Metingen van dezelfde organisatie" en de ronde
  zijn vervangen. Een Meting heeft een onderdeel en een meetdatum, en een
  vergelijking tussen Metingen is een benchmark binnen een organisatie
  (niveau 2) die de Admin zelf aanmaakt, eerst met twee Metingen. De Admin
  kiest een lezing, Ontwikkeling over tijd (weergave C) of Naast elkaar
  (weergave H):
  `benchmark.md`, Niveau 2, `visualisatie-scores.md`, onderdeel C, E, H,
  `datamodel.md`, Meting en `beheerpagina.md`, punt 5 en 14. Nog niet
  ontworpen: De weergave bij drie of meer Metingen, bijvoorbeeld een lijn per
  bouwsteen over de meetdata.
- **KPI's, peildatum en ontwikkeling in de tijd**: Een
  KPI-waarde heeft in het voorstel geen peildatum, zodat het model niet
  explodeert in waarden maal kanalen maal tijd (`datamodel.md`, KPI's en
  kanalen, Geen tijd). Later komt een peildatum bij de waarde, met een
  weergave van de ontwikkeling. Bestaande waarden krijgen dan een lege datum.
- **KPI's, wat het voorstel van 19 oktober 2026 openlaat** (`datamodel.md`,
  KPI's en kanalen, Open punten, en `beheerpagina.md`, punt 3): Een eigen stand
  "niet van toepassing" bij een kanaal, het verwijderen van een KPI-definitie en
  het hernoemen van een kanaal. Het potlood en de modal voor het wijzigen van een
  Onderdeel, de modal "+ Onderdeel toevoegen" en de knoppen Opslaan en
  Annuleren in de tab KPI's en kanalen staan niet in het design.
- **Verkennen**: Een Admin-scherm om de hele
  pool van een Assessment te filteren, te groeperen en te vergelijken
  (`visualisatie-verkennen.md`, `beheerpagina.md` punt 15). Kenmerken, Groeperen
  op (versie 6 van het visual design), de drempels als instellingen en de
  ronde na PR 121 zijn gebouwd. Bewust later:
  - Een versie voor de Consultant, met de namen van niet-eigen Organisaties
    afgeschermd en de drempel `benchmarkMinOrganisaties` voor beide kanten van
    een splitsing.
  - Filter op bereik (sliders) bij getalkenmerken, naast de drempel bij het
    groeperen.
  - AHT per kanaal. Uitgewerkt in het voorstel van 19 oktober 2026 (KPI's per
    plek en kanaal, `datamodel.md`, KPI's en kanalen, en
    `visualisatie-verkennen.md`, KPI's als kenmerk).
  - Een filterstand bewaren als benchmark, en het resultaat zo aan een Lead
    tonen.
  - Export van de gefilterde pool als CSV.
  - Verkennen voor de Quickscan Ziekenhuis (percentages) en voor meerdere
    Metingen per Organisatie.
  - Een eigen veld Branche (vijf of zes Coniche-branches, los van SBI). Vraag
    van 15 oktober 2026, nog niet besloten. SBI-secties sluiten niet aan bij de
    indeling van de eigen klanten (verzekeraars zitten in Sectie L, Afdeling 65).
- **Kopiëren van een Meting naar een nieuwe meetdatum (bewust niet opgepakt)**: Een functie die onderdeel en Assessment van een eerdere
  Meting overneemt, zoals "Nieuwe ronde starten" dat deed. Joost vond dit te
  complex. Elke Meting wordt apart gepland.
- **Benchmark, niveau 1 (tussen organisaties)**: Gebouwd (PR 61,
  `benchmark.md`). Daarbij nog niet gedekt: Export (PDF, CSV, InDesign) van
  een benchmark, rechten voor een Consultant, een vastgezette versie voor de
  Lead in plaats van live cijfers, de range van de groep als band, de tekst in
  de publieke privacypagina en in het toestemmingsvakje van de intake, en
  ontwikkeling in de tijd binnen een benchmark. Het berekenen moet op de
  server, zie Fase 2.
- **Benchmark, niveau 2 (binnen een organisatie, tussen Metingen)**:
  Gebouwd op 14 oktober 2026 (`benchmark.md`, Niveau 2): Een vergelijking van
  twee Metingen met de lezing Ontwikkeling over tijd of Naast elkaar, voor een
  Admin en voor een Lead met het vinkje in het Leads-venster.
- **Benchmark, niveau 3 (binnen een Meting)**: Hoe scoort een scan ten
  opzichte van de andere scans in dezelfde Meting. Het kader staat in
  `benchmark.md`. Het ontwerp van de spreiding (een stip per scan, gemiddelde,
  de plek van een scan daarin) en van de hoge en lage scores staat in
  `visualisatie-scores.md`, onderdeel B. Houd rekening met herleidbaarheid bij weinig scans, zie de drempel
  `benchmarkMinRespondenten`.
- **Benchmark of gemiddelde opslaan als samengestelde Meting**: Samen met het veld `onderdeel` op de Meting, zie
  `benchmark.md`, Onderdeel en samengestelde Meting, en `datamodel.md`,
  Meting. Elke onderliggende Meting telt één keer mee, ongeacht het aantal
  scans. Oorspronkelijke omschrijving: Een
  gemiddelde over meerdere Metingen van één organisatie (zie niveau 2)
  vastleggen als eigen Meting, zodat een organisatie met meerdere delen als
  één deelnemer meedoet aan een benchmark tussen organisaties. De
  samengestelde Meting verwijst naar de Metingen waaruit ze bestaat en
  kopieert geen antwoorden. Ze staat in de lijst Metingen met een badge
  "Gemiddelde", heeft geen respondenten en is niet invulbaar. Een Lead krijgt
  Resultaten op een samengestelde Meting (`LeadToegang`) en ziet dan alleen het
  gemiddelde, niet de onderliggende Metingen. Dat vinkje zet de Admin expliciet
  en erft niet mee (`benchmark.md`, View voor een Lead). Besloten en gebouwd: Wat er
  gebeurt als een onderliggende Meting wordt verwijderd. Blokkeren kan niet,
  want verwijderen moet altijd kunnen (bewaartermijn, AVG-verzoek). Zo is het
  gebouwd: De Meting valt uit de samenstelling, de bevestiging noemt de samengestelde
  Metingen waarin ze zit en dat het gemiddelde daardoor verandert, en een
  samengestelde Meting zonder leden verdwijnt. Het alternatief is bij het
  opslaan de gemiddelde antwoorden per vraag vast te leggen. Dan verandert het
  gemiddelde niet, maar het botst met het principe dat scores worden berekend
  en moet nog worden getoetst aan de bewaartermijn. De eerder voorbereide
  weergave van een gemiddelde over een selectie van Metingen met
  selectievakjes in de lijst Metingen is vervallen. Niveau 2 van de benchmark
  komt in de plaats.
- **Export van het organisatieresultaat**: De aggregatieweergave
  (`beheerpagina.md`, Organisatie-resultaten) is er, een PDF/CSV/
  InDesign-export ervan nog niet. De bestaande exports blijven per één
  scan.
- **Adoptiescan**: Nog geen scope of ontwerp, ook niet duidelijk of dit
  een sector-variant is (zelfde mechanisme als Zorg) of een écht ander
  scan-type met een eigen bouwstenenmodel.
- **Organisatiekenmerken deels door de klant laten invullen**: Kan straks
  via een recht voor de Lead (`datamodel.md` deel 2).
- **Resultatenpagina met uitkomsten** (nog te besluiten): De
  organisatiekenmerken (AHT, NPS, CSAT en dergelijke) naast de scores
  tonen (`inhoudelijk-fundament.md` sectie 1).
- **Planning bij een meting**: Open vanaf, sluit op, status.
- **Content presenteerbaar maken (toggle Lezen/Presenteren)**: Elke
  contentsectie op de Assessment-pagina (Visie, Bouwstenen, AI-scan, 2030, dus
  `visie-coniche.md`, `visie-ai-klantcontact.md`, `content-2030.md`)
  krijgt naast de leesweergave een presenteerweergave: Schermvullend,
  stap voor stap, bedoeld voor sales en consultants om het
  Coniche-verhaal mee te vertellen bij een klant. Acceptatiecriteria:
  - Toggle "Lezen / Presenteren" op elke contentpagina.
  - Content wordt automatisch opgesplitst in logische, schermvullende
    secties, geen handmatige indeling per pagina.
  - Doorlopende "volgende stap"-navigatie tussen secties.
  - Een bijgewerkt md-bestand verschijnt zonder handmatige aanpassing
    correct in de presentatieweergave, het md-bestand blijft de bron.
  - Ruimte voor een vaste visual-placeholder per sectie. Mogelijk
    raakvlak met `bouwstenenmodel-visual.md`/`ai-domeinenmodel-visual.md`
    (die hebben ook nog geen plek, zie die bestanden), maar dat is een
    aparte afweging, niet automatisch hetzelfde ding.
  Eerste stap: Een proof-of-concept op één of twee onderwerpen, niet in
  één keer alle vier.
- **Kleine calls to action bij de bouwstenen-content**: Op de
  secties Bouwstenen en AI op de Assessment-pagina en/of in de modal van de
  bouwstenenmodel-visual/ai-domeinenmodel-visual (nog te bepalen welke,
  zie ook de open plek-vraag in die bestanden). Drie soorten links, per
  bouwsteen of domein:
  - Naar andere content over die bouwsteen (blogs, whitepapers).
  - Naar opleidingen/trainingen over de bouwstenen in het algemeen of
    over die ene bouwsteen specifiek.
  - Naar een visie- of inspiratiesessie bij Coniche, over de bouwstenen
    in het algemeen of over die ene bouwsteen specifiek.
  - Structurele verwijzing vanuit scanresultaten naar concreet
    Coniche-aanbod (modules/producten) dat bij een lage score op die
    bouwsteen past, niet alleen losse contentlinks maar een brug naar
    wat Coniche daadwerkelijk aanbiedt.
  Vormgeving nog open: Een apart paneeltje naast de tekst, een sectie
  onderaan de modal, of iets anders. Vraagt ook een plek in het
  datamodel om deze links per bouwsteen te kunnen vastleggen (nu nog
  geen veld hiervoor op `Bouwsteen`, zie `datamodel.md`).

### Quickscan Ziekenhuis (antwoordType Ja / Nee / Weet ik niet)

Gebouwd op 14 oktober 2026 (`content-ziekenhuis-quickscan.md`, Gebouwd). Bewust
nog niet opgepakt:

- **PDF-export**: Eerst specificeren (eigen `export-pdf-visual-*.md`). De
  PDF van de oude tool is alleen een referentie voor de inhoud.
- **CSV- en InDesign-export** voor dit antwoordType: `export-csv.md` en
  `export-indesign.md` gaan uit van een score van 1 tot 5.
- **Import van scans uit de oude tool, en niets verliezen bij het
  uitzetten van het oude platform.** De batch-export van de oude tool is
  alleen een overzicht (organisatie, status, voortgang, contactgegevens)
  zonder vragen en antwoorden en volstaat niet. Voor het uitzetten is per
  scan een export nodig met alle antwoorden, de vraagtekst, de dimensie
  per vraag en de afdelingen die niet van toepassing waren. Die gaat
  onbewerkt in het archief (`go-live-plan.md`, Fase 5). De import in het
  nieuwe model volgt na de rework van de scan, zie hieronder. Het veld
  Voortgang in de oude export komt boven 100% uit (107), dus daar kan
  niet op worden gerekend. De drie scans in de batch-export lijken
  testscans (fictieve organisaties, dezelfde invuller); controleren of er
  echte scans bestaan.
- **Gemiddelde over meerdere Respondenten, spreiding en benchmark tussen
  organisaties** voor dit antwoordType zijn gebouwd op 15 oktober 2026
  (`visualisatie-quickscan.md`). Nog niet: De vergelijking tussen Metingen
  (weergave C, E en H in percentages), een samengestelde Meting en de
  benchmark binnen een organisatie of een Meting.
- **Afdelingen toevoegen** (bijvoorbeeld de SEH). Nu zijn het vier vaste
  afdelingen. Of een afdeling niet van toepassing is, geeft de Respondent
  zelf aan in de scan.
- **Gemiddelde en benchmark bij afdelingen die niet van toepassing
  zijn**: Respondenten kunnen verschillende afdelingen als Nee
  beantwoorden, dus niet elke scan heeft dezelfde vragen. Gebouwd met de
  keuze alle punten gedeeld door alle mogelijke punten van de relevante
  afdelingen (`visualisatie-quickscan.md`, Gebouwd). Joost bevestigt dit
  nog (open punt 2 daar).
- **Managementsamenvatting**: De PDF van de oude tool had een AI-tekst die
  uitging van een score "van 5" en dus niet bij deze scoring past. Niet
  overnemen; zie de bestaande backlog-regel over de AI-samenvatting.
- **Wegen per afdeling in één handeling**: Nu moet het gewicht op alle
  bouwstenen van een afdeling worden gezet. Een beheerhulp of een
  gewicht op de categorie kan later.
- **Rework van de scan zelf.** De scan lijkt snel in elkaar gezet. De
  spec legt hem vast zoals hij is. Punten die bij het uitwerken
  opvielen, nog niet besloten:
  - De vragen gaan bijna allemaal over telefonie, terwijl de scan
    "Klantcontact" heet. Andere kanalen komen alleen terloops voor
    (selfservice, portaal, chatbot).
  - De dimensies zijn niet vergelijkbaar tussen afdelingen: Mensen
    ontbreekt bij twee afdelingen, heeft 1 vraag bij de poliklinieken en
    6 bij de verpleegafdelingen.
  - Weet ik niet telt als Nee. De score maakt dus geen verschil tussen
    "niet geregeld" en "geen zicht op".
  - Een aantal vragen bevat twee vragen in één, bijvoorbeeld "binnenkomen
    én worden afgehandeld", zodat Ja of Nee niet eenduidig is.
  - "Grootste aandachtspunt" verschijnt ook als alle dimensies hoog
    scoren (bijvoorbeeld 100% en 90%) en leest dan als een tekort. Een
    drempel kan dat voorkomen.

## Uit de scan van 2 oktober 2026

Gevonden bij een scan van de hele oplossing. De volgorde: Eerst alle
functionaliteit afronden, dan de database en rollen en rechten, en daarna
deployment, beveiliging en stabiliteit. Een deel is al opgepakt, zie
"Gedaan" hieronder en `changelog.md`.

### Gedaan

- Next.js naar 16.3.8 (kritieke RCE), `npm audit` schoon.
- `/api/mail` en `lib/mailer.ts` verwijderd (open mailrelay, ongebruikt).
- De sleutel `gebruikers` gaat niet meer via `/api/store` en de rij met
  wachtwoorden is uit Neon verwijderd. Gebruikers leven nu per browser.
- `/api/store` begrenst de bodygrootte, `/api/export-pdf` begrenst grootte en
  gelijktijdige headless browsers. Dev-server alleen op `127.0.0.1`.
- Tests met vitest (`npm test`): Scoring, importdetectie, verplaats- en
  samenvoeglogica.
- Opgeruimd: `lib/db.ts` gesplitst in `lib/db/`, de Content-pagina gesplitst,
  exportcode in de respondentpagina's naar `lib/scan-export.ts`, het oude
  prototype naar `archief-prototype/`.
- Toegankelijkheid: Focusval en focus terug in de modals, zichtbare focus bij
  toetsenbordnavigatie, een knop "Bekijk" in elke klikbare rij.
- Gecommit (checkpoints), zodat teruggezette specs direct te zien zijn.

### Fase 1: Functioneel afronden

- **Audit-log** (`beheerpagina.md` punt 12): Ook nodig om overgeslagen scans
  bij verplaatsen en samenvoegen te loggen, zoals de spec voorschrijft.
- **Content-pagina's** beheerbaar maken (punt 11) en **Organisatievelden**
  zelf beheerbaar met de tab Organisatievelden (punt 3).
- **Paginering** van de lijsten Respondenten en Metingen en de scanlijst in het Meting-overzicht.
- **Spec en code gelijktrekken**: `Assessment.bouwsteenLabel` in de spec
  tegenover `bouwsteenEenheidEnkelvoud`/`Meervoud` in de code, en
  `Bouwsteen.centraleVraag` als echt veld tegenover de lookup-tabellen.
- **Import**: Twee uploads van dezelfde organisatie geven twee Metingen met
  dezelfde naam ("Legacy-import 2026"). Bedenk een onderscheidend label.
- **Opsplitsen** van de Import-pagina (590 regels).
- **Meer tests**: Import (parsen en valideren van rijen), `scan-slot`, de
  overige stores.
- **Tabel Leads en hoofdlink Resultaten**: Eén
  tabel per organisatie waarin een Admin per Lead aanvinkt welke weergaven hij
  ziet (`beheerpagina.md`, punt 6a), met `LeadToegang` in plaats van
  `RespondentRolMeting`, `leadVoorOrganisatie` en `BenchmarkToewijzing`, en de
  hoofdlink Resultaten met Metingen en Benchmarks, zonder de pagina Ingevulde
  scans en met Import op organisatieniveau (punt 7 en 8). De tab Rondes en de
  ronde zelf zijn op 14 oktober 2026 vervallen, de Meting heeft een meetdatum.
  De tabel staat als compact blok Leads met een Leads-venster (modal) omdat de
  tabel breed is (`beheerpagina.md`, punt 6a, `stylesheet.md`,
  `.modal-box--vol`).
- **Andere Respondent koppelen vanuit het Scan-overzicht**: Een
  naamwijziging via "Respondent bewerken" geldt voor alle scans van de
  Respondent. Nodig: De vaste regel "Deze wijziging geldt voor alle {n} scans"
  in dat formulier, en de actie "Andere Respondent koppelen" in het
  Scan-overzicht (hergebruik het blok uit "Conflict oplossen") voor een
  wijziging bij één scan (`beheerpagina.md`, punt 7).
- **Rol / functie als keuzelijst**: In de intake, in "Mijn gegevens"
  en in "Respondent bewerken" (en dus ook in "Nieuwe Respondent" en "Andere
  Respondent koppelen") een keuzelijst met de 29 waarden uit
  `content-respondentrol.md` en "Anders…" met een invoerveld. De waarde blijft
  gewone tekst in `Respondent.functie`. Eigen invoer komt in de lijst zolang
  iemand hem gebruikt, zoals bij Techstack (`lib/kenmerken-opties.ts`).
- **Toelichting-veld in het contentbeheer werkt niet bij de bestaande
  Assessments**: Bij Klantcontact, AI en Zorg gebruikt de toelichting een losse
  lookup-tabel (`data/bouwstenen-content.ts`, `data/ai-domeinen-content.ts`) en
  niet het veld `Bouwsteen.toelichting`. Alleen bij een zelf aangemaakt bouwsteen
  heeft het veld effect. Open: Het scherm laten waarschuwen als het veld wordt
  genegeerd, of de lookup-tabellen vervangen door het veld.
- **Instellingen in het Accountmenu**: De hoofdlink "Applicatie" vervalt
  en wordt de rij "Instellingen" in het Accountmenu, alleen voor een Admin
  (`beheerpagina.md`, Accountmenu en Instellingen). Te bouwen: De rij met
  scheidingslijn boven "Uitloggen"; de pagina met tabbalk (Gebruikers, Drempels
  en termijnen, Algemene teksten, Content-pagina's, Audit-log,
  Data-integriteit); het onderdeel dat nu Instellingen heet hernoemen naar
  Drempels en termijnen; de route en de kruimelpaden; de plekken in
  `data/info-teksten.ts` ("Applicatie, Instellingen" wordt "Instellingen,
  Drempels en termijnen"). De actieve staat van de Accountmenu-knop
  staat in `stylesheet.md`, Dropdown-knop.
- **Mijn account in het Accountmenu (zonder wachtwoord)**: Een Admin of Consultant wijzigt
  zijn eigen naam en wachtwoord (`beheerpagina.md`, Accountmenu). Het
  e-mailadres is alleen-lezen. Te bouwen: De rij en de modal, het recht
  `account.bewerken` (bereik `zelf`) en `gebruiker.eigenGegevensGewijzigd`. De
  naam kan nu al, het wachtwoord komt met de echte inlog (Fase 2). Besloten: Een
  Admin kan het e-mailadres van een gebruiker wel wijzigen, via Instellingen,
  Gebruikers (punt 9), maar een gebruiker zelf niet.

### Fase 2: Database en rollen en rechten

- **Eén record per entiteit** in plaats van één JSON-blob per sleutel. Nu
  geldt "laatste schrijver wint" over alle organisaties heen: Twee
  beheerders of tabs overschrijven elkaar, en een pagina-load kan lokale,
  nog niet gesynchroniseerde wijzigingen overschrijven.
- **Rechten server-side afdwingen**: Nu gebeurt dat alleen in de browser
  en is de sessie een id in `sessionStorage` (`datamodel.md` deel 2).
- **Wachtwoorden gehasht** en echte inlog met sessies en 2FA, waarna
  `gebruikers` weer centraal kan.
- **Respondenten krijgen alleen hun eigen gegevens**: Nu haalt elke browser
  de volledige blob van alle organisaties op (ook bij een persoonlijke link).
- **Benchmark op de server berekenen**: Een Lead mag alleen het
  geaggregeerde resultaat ontvangen en nooit de scans van andere
  organisaties (`benchmark.md`). Dat kan pas als de berekening aan de
  serverkant draait. Dat geldt sterker voor de niveaus binnen een organisatie
  en binnen een Meting.

### Fase 3: Deployment, beveiliging en stabiliteit

- **`/api/store` en `/api/export-pdf` beveiligen** met inlog of een
  respondent-token: Ze zijn nu zonder autorisatie bereikbaar.
- **PDF-export op serverless hosting**: `puppeteer` per verzoek is daar
  lastig (zie `go-live-plan.md`).
- **Schrijfverkeer**: Elke wijziging stuurt de hele blob naar de database. Op
  record-niveau (fase 2) verdwijnt dit vanzelf.
- **Back-ups van Azure SQL** en een herstelprocedure, plus rate limiting per IP-adres
  op de routes.
- **Account lockout** na een vast aantal mislukte inlogpogingen, en 2FA waar
  relevant (`go-live-plan.md`, fase 2).
- **Databasequeries volledig geparametriseerd** (preventie van SQL-injectie)
  en **inputvalidatie** op URL-, formulier- en API-verkeer.
- **DDoS-bescherming** configureren, bijvoorbeeld via Azure Application
  Gateway met WAF, afhankelijk van de hostingkeuze.
- **Security logging en monitoring** inrichten, plus incidentmanagement en
  een back-up- en restoreproces beschreven.
- **Werkwijze Azure DevOps of GitHub** vastleggen.

### Security-validatie vóór productie

Onderdeel van de go/no-go-eis in `go-live-plan.md`: Livegang voor externe
klanten alleen na deze vier punten.

- Onafhankelijke code review.
- Penetratietest op de productie-kandidaat.
- DDoS- en belastingtest om het platformgedrag onder piekbelasting te
  valideren, inclusief rate limiting.
- Bevindingen verwerken en een hertest op kritieke kwetsbaarheden.

## Openstaand na de changelog

Wat uit Sanders changelog nog niet gebouwd is of nog moet worden afgestemd. De rest van de changelog is gebouwd en staat in de specs.

**Besloten, nog te bouwen of te verwerken**
- **Zorgscan-gewichten**: Bouwsteen 4, 10 en 11 staan op 2, de spec is leidend
  (`CLAUDE.md`, Scoringslogica). De seed staat op 2. Nog te controleren: De
  opgeslagen data in de database en in bestaande browsers.
- **Fout: Omgehangen scans verschijnen in de data-integriteitscontrole**
 : Bij elke verplaatsing van een scan (naar een andere
  organisatie of Meting, hele Respondent of losse respons) werkt de code
  `organisatieLidId` bij maar niet `scanUitvoeringId`. De scan staat dan in de
  doel-Meting, maar verwijst nog naar de oude Meting. Bij een andere
  organisatie meldt de controle "Ingevulde scans zonder bestaande Meting",
  terwijl er niets mis is. Binnen één organisatie blijft de verwijzing
  onopgemerkt onjuist. Herstel: Beide verwijzingen bijwerken in alle
  verplaatsfuncties (`lib/db/verplaatsen.ts`), en een eenmalige reparatie
  voor scans die al verplaatst zijn (de Meting waarin ze staan is de
  juiste). Scans die in de controle zijn verwijderd, zijn niet terug te
  halen zonder back-up.
- **Import: Eén Meting per bronnaam** (`import-scans.md`, Meting): Worden
  meerdere bronnamen uit het bestand aan één organisatie gekoppeld, dan krijgt
  elke bronnaam een eigen Meting, met de bronnaam achter het label. Komt
  dezelfde Respondent twee keer in dezelfde Meting voor, dan krijgt de tweede
  scan een eigen Meting met de datum in het label. Gespecificeerd op 8 oktober
  2026, nog niet gebouwd (nu groepeert `lib/db/import.ts` op organisatie,
  Assessment en label).
- **Notitie per scan en Scans samenbrengen**:
  Bij het importeren van meerdere bestanden kreeg dezelfde Respondent alle
  `start_comment`-teksten als één geplakte notitie. Herstel: `start_comment`
  wordt `ScanInvulling.notitie` en de import schrijft niet meer naar
  `Respondent.notities` (`datamodel.md`, Notitie op de scan, `import-scans.md`,
  Notitie per scan). Bestaande geplakte notities zijn niet te herstellen, dus
  die scans opnieuw importeren. Daarbij hoort de actie "Scans samenbrengen in
  één Meting" (`beheerpagina.md`, bij "Respons naar andere Meting verplaatsen"):
  Eén scherm dat per scan de Respondent koppelt en alles in één ronde en
  Meting zet. Ook nodig: Kolom Notitie in de scanlijst van het Meting-overzicht en het
  Scan-overzicht, kolom `scan_notitie` in de CSV-export (`export-csv.md`).
- **Fout: "Naar ronde…" werkt niet voor Metingen met hetzelfde onderdeel**
  (op vervallen met de ronde): Geïmporteerde Metingen hebben allemaal het onderdeel "Hele
  organisatie", ook als het label een onderdeel noemt ("Zuid-Nederland |
  0-meting"). Ze botsen daardoor op de uniciteitsregel van de ronde, en de actie
  doet dan niets zonder melding. In "Scans samenbrengen" geeft het formulier
  alleen de uitweg "kies die Meting", niet "geef een ander onderdeel". Herstel
  (`beheerpagina.md`, punt 5, Naar ronde…, en "Scans samenbrengen"): Een modal
  met één regel per Meting en een invoerveld Onderdeel, voorgevuld uit het label
  vóór " | ", met controle per regel en alles of niets. Ook het Meting-overzicht
  krijgt "Naar ronde…". Meldingen bij een botsing noemen beide uitwegen
  (`datamodel.md`, Botsing).
- **Label van een Meting verdwijnt als invoerveld** (op aangepast, met onderdeel en meetdatum in plaats van onderdeel en ronde, en de naam is weer aan te passen): Het
  label was ambigu naast onderdeel en ronde, en verplicht op sommige schermen en
  leeg toegestaan op andere. Nu vult niemand het in. Een Meting heeft alleen
  Onderdeel en Ronde (plus Assessment bij aanmaken), de naam maakt de app
  (`datamodel.md`, Naam van een Meting). Aanpassen kan achter een potlood naast
  de naam, met alleen die twee velden. Verwijderen uit: De formulieren voor
  aanmaken, Wijzigen, Samengestelde Meting en Scans samenbrengen. Een Meting
  zonder ronde houdt haar oude label. Nieuw: Info-icoon `info.metingBegrippen` met
  de begrippen boven de lijst Metingen (`beheerpagina.md`, punt 5, Begrippen).
- **Overzicht per vraag op ronde-niveau, en de samengestelde Meting** (nog uit te werken, besproken met Joost; op is de ronde vervallen, dus "het bereik van een ronde" hieronder moet opnieuw worden bekeken, bijvoorbeeld als de scans van een gekozen groep Metingen): Er is een nieuw overzicht
  op het laagste niveau, met alle scores per vraag per scan in één beeld. Het
  werkt bij één klant met één Meting en zes Respondenten (Eneco), maar niet bij
  een klant met zes Metingen van elk één scan (Univé), want daar zijn het zes
  onderdelen. Vraag: Kunnen die scans ook in één Meting? Technisch kan dat met
  "Scans samenbrengen", maar het kost structuur:
  - Eén Meting heeft één onderdeel. De onderdelen vallen weg en moeten op de
    Respondent (veld Team) terecht komen.
  - Ontwikkeling per onderdeel (Zuid-Nederland tegen Zuid-Nederland in de
    nameting) verdwijnt, en niveau 2 (tussen Metingen binnen een organisatie)
    ook. Alleen de ontwikkeling van het geheel blijft.
  - Een scan hoort bij één Meting. Na samenbrengen zijn de oorspronkelijke
    Metingen leeg en kan de samengestelde Meting niets meer middelen.
  - Het gemiddelde blijft gelijk zolang elke Meting precies één scan had (elke
    Meting even zwaar is dan hetzelfde als elke scan even zwaar).
  Richting om morgen uit te werken: Het overzicht per vraag niet aan één Meting
  koppelen maar aan het bereik van een ronde (alle scans van dezelfde ronde en
  hetzelfde Assessment). Eneco toont dan zes Respondenten uit één Meting, Univé
  zes scans uit zes Metingen met het onderdeel als kopje. Onderdelen, ontwikkeling
  en gemiddelde blijven bestaan. Sluit aan op "Overzicht van een ronde" in
  `visualisatie-scores.md`.
  Te beslissen:
  - Wie mag individuele scans zien. Een samengestelde Meting heeft nu geen
    Respondenten en een Lead ziet alleen het gemiddelde. Voorstel: Het overzicht
    per scan alleen voor Admin en Consultant.
  - Hoe een samengestelde Meting zich hiertoe verhoudt (doorlezen naar de scans
    van haar Metingen, of alleen via de ronde).
  - Waar het overzicht staat (Meting-overzicht, rondekop of beide).
- **Assessment verwijderen** (`beheerpagina.md`, punt 1, `datamodel.md`,
  Verwijderen en datakoppelingen): Gespecificeerd, nog niet gebouwd. Alleen
  mogelijk als er geen Meting van het Assessment bestaat, met een
  bevestiging dat het niet ongedaan kan worden gemaakt.
- **Organisatievelden** (`beheerpagina.md`, punt 3): De tab bestaat nog
  niet. `VeldDefinitieEditor` staat klaar en moet in een pagina onder
  Instellingen of bij Organisaties worden gebruikt, zoals de spec vraagt.
- **Losse bestanden in de repo opruimen**: `coniche_bouwblokken.md` mag uit
  de repo (Joost akkoord). De open vragen uit eerder verwijderde
  losse bestanden staan hieronder, onder "Open vragen uit de losse
  bestanden".
- **Content-pagina's** (`beheerpagina.md`, punt 11): Beheerbaar maken is
  gespecificeerd en de spec is leidend. Sander twijfelt nog over de beste
  uitvoering. Pas als een nieuw overleg-document in de map staat, wordt er
  iets mee gedaan.

**Afstemmen met de build (Sander)**
- **Audit-log**: Staat alleen in de browser. Wordt een tabel in de database
  (`azure-plan.md`).
- **Sessieduur**: Volgt met de backend (`beheerpagina.md`, Instellingen).
- **Opruimen voor livegang**: `devAutoLogin`, seed-accounts en de tijdelijke
  Beheer-link in de footer (`go-live-plan.md`).

**Open vragen uit de losse bestanden (voor het verwijderen)**
- **Content-pagina's, opmaak (Visie en 2030)**: Eén tekstveld per pagina, per
  tekstblok bewerken, of hybride met vaste kaarten en cyclus in de code. De
  pagina's bevatten checklistkaarten, een verbetercyclus van vijf stappen,
  genummerde kaarten en iconen. Per tekstblok verliest niets, één tekstveld
  volgt de spec letterlijk maar maakt de pagina's plat. Nog geen keuze.
- **Content-pagina's, velden (Bouwstenen en AI)**: Naam, omschrijving en
  centrale vraag bewerkbaar, de visual zelf vast. Open: Is er één bron met de
  velden `Bouwsteen.toelichting` en `Bouwsteen.centraleVraag` van het Assessment
  (een aanpassing in Content wijzigt dan ook de publieke pagina), of mogen ze
  uit elkaar lopen. Nu gebruiken de secties Bouwstenen en AI op de Assessment-pagina nog hun eigen
  statische content.
- **Content-pagina's, opslag**: Voorstel is zoals bij Algemene teksten: Een
  gewijzigde tekst gaat voor op de standaardtekst, met "Standaardtekst
  herstellen", zonder versiebeheer, archiveren of publicatiestap, en met een
  auditregel met alleen de sleutel. Nog te bevestigen, evenals Admin-only.
- **Knop "Bekijk" in lijstrijen**: Het label is "Bekijk" zonder pijltjes (in de
  code gedaan). Het uiterlijk is nog open. Er zijn drie opties: Grijze rand en donkere tekst zoals
  alle compacte knoppen (nu), oranje tekst met grijze rand, of een oranje rand
  bij hover voor alle `.btn-outline` knoppen. Ook de kleur van de aangewezen
  rij hoort daarbij. Volgt in `stylesheet.md`.
- **Eigenaarschap van een organisatie zonder aanmaker**: Voor een organisatie
  met `aangemaaktDoor: null` bestaat "Organisatie-toegang toewijzen". Open: Is
  dat voldoende, of is een losse actie "eigenaarschap overzetten" nodig.
- **Zorgscan-inhoud**: 29 van de 60 vragen zijn nog gelijk aan de
  Klantcontact-scan, dus niet sector-vertaald. Inhoudelijke input van Joost en
  Sander nodig (`content-zorgscan.md`).

**Te bespreken met Joost: Rol / functie en Techstack**

De volledige punten staan onderaan `content-respondentrol.md` (punt 4) en
`content-techstack.md` (punt 6). Wat de bouw het meest raakt:

- **Rol / functie, verplicht of optioneel**: Het veld is nu verplicht in de intake,
  terwijl `privacy-pagina.md` de intakegegevens optioneel noemt. Dat moet gelijk
  zijn, ook bij een keuzelijst.
- **Rol / functie, "Anders…"**: De keuzelijst houdt het vrije veld open. Wil
  Coniche een analyse per rol, dan moet "Anders…" er niet in.
- **Rol / functie, één lijst of per Assessment**: De lijst is klantcontactgericht
  en geldt nu voor alle Assessments, ook de Zorgscan.
- **Techstack, namen van partijen**: "Deloitte" en "Deloitte Digital", "NTT Data"
  en "NTT Data Business Solutions" staan als verschillende partijen in de lijsten.
- **Techstack, `ondersteuner` en `toegangsroute` in de InDesign-export**: Dat
  verandert het contract met het sjabloon.
- **Techstack-lijsten beheerbaar maken**: Nu staan ze in de code
  (`beheerpagina.md`, punt 3).

**Te bespreken met Joost: Look & feel**

Suggesties uit een doorloop van de specs en de code, nog niet getoetst aan
screenshots van de draaiende app. Niets is besloten of gebouwd.

- **Contrast, merkbesluit**: Wit op `--or` (`#ff671f`) is ongeveer 3:1, onder
  WCAG AA voor tekst van 14px. Dat geldt voor `.btn-or` en voor oranje
  links op wit. Opties: Knoptekst in `--pu`, een iets donkerder oranje voor
  knoppen, of grotere en dikkere tekst. Het is merkkleur, dus dit is aan
  Coniche. Sinds 15 oktober 2026 raakt het ook elke gekozen pil
  (`stylesheet.md`, Keuzepil en pilvormige groep).
- **Contrast, scorekleuren**: Witte tekst op `--score-2` (`#e8871e`) is
  ongeveer 2,6:1. Donkere tekst werkt daar beter (`stylesheet.md`,
  Scorekleuren).
- **Contrast, `--ink-s`**: `#888884` is ongeveer 3,5:1 voor hints en labels.
  Een tint donkerder (rond `#6f6f6b`) lost dat op.
- **Grafiektekst**: Opgelost in het voorstel van 15 oktober 2026: Minimaal 12px (`--fs-12`), zie `stylesheet.md`, Lettergroottes. Gebouwd op 15 oktober 2026.
- **Foutstaten in formulieren**: Rode rand met een korte melding onder het
  veld. Staat al als open punt in `stylesheet.md`.
- **Lege, laad- en opgeslagen-staten**: Een vaste lege staat met uitleg en
  een knop naar de volgende stap, en één vaste terugkoppeling na opslaan
  (toast of `.beheer-melding`).
- **Display-maten en spacing**: Gebouwd op 15 oktober 2026 (`stylesheet.md`,
  Lettergroottes en Afstanden): Acht maten in even px (`--fs-12` tot
  `--fs-48`), de Tailwind-schaal beperkt tot dezelfde acht maten
  (`@theme` in `app/globals.css`), `--control-h` op 40px en de tekst in
  grafieken op 12px. Wat nog openstaat: De afstandstokens (`--sp-*`) zijn
  alleen toegepast in de onderdelen die zijn aangeraakt. Bestaande marges en
  gaps (`.82rem`, `1.7rem`, `.6rem`, `1.2rem`, `1.8rem`) gaan mee naar het
  raster zodra een onderdeel wordt aangeraakt. Inline styles (bijv.
  `app/page.tsx`) naar klassen. Het scherm is na de verkleining van de
  tekst (interface 14px in plaats van 13,6px) niet per scherm doorlopen op
  uitlijning.
- **Opmaakronde van 15 oktober 2026** (`stylesheet.md`): Gebouwd op dezelfde
  dag: De pilvormige groep en de keuzepil, drie niveaus van scorekleur,
  verschil in blauw en `--dal`, de driehoek bij een afwijkende cel, kolomkoppen
  van 96px op één regel met een tooltip en `Organisatie.korteNaam`. De pil
  staat in de weergave-schakelaar, Verkennen en de antwoorden van de
  Quickscan. Nog niet: Een doorloop van de overige keuzeknoppen in de app
  op de pil. Het visual design van Verkennen (versie 6) is gebouwd. De
  PDF-export valt er niet onder.
- **Vragenlijst en resultaten**: Duidelijkere actieve staat op de gekozen
  schaalwaarde, de hele antwoordrij klikbaar, een zichtbare
  "opgeslagen"-indicator en een korte uitleg boven de grafieken.
- **Beheertabellen**: Duidelijkere rijhover of zebra-strepen, sticky
  tabelkoppen bij lange lijsten, en filters en sortering onthouden bij
  de lijsten onder Resultaten en Respondenten.
- **Merkafwerking**: Footer-logo (witte variant) en Source Serif 4 voor een
  citaat, beide al open punt in `stylesheet.md`. Daarnaast iconen of
  illustraties op lege pagina's in de stijl van de Assessment-iconen.
- **Donkere modus**: Niet nodig.

Voorgestelde volgorde als het wordt opgepakt: Foutstaten, de contrastwijzigingen
(`--ink-s`, scoretekst) en de display-schaal. Het oranje knopcontrast eerst
als merkbesluit bespreken.

- **Assessmentcirkel op Kies jouw assessment uitbreiden** (besloten ontwerp, `schermen.md`, Kies jouw assessment): Wat de cirkel doet bij minder of meer dan vijf Assessments (bijvoorbeeld een deel per Assessment met een verschillende grootte, of een tweede cirkel) en of de stip op de visual later het gemiddelde van de branche ten opzichte van de eigen score toont (nu een vaste markering op een hoekpunt van de voorbeeldlijn). Daarnaast de vraag of er een generieke Quickscan komt, zodat de cirkel drie vaste assen heeft (snel, uitgebreid, AI).

### Spanningsmeter (antwoordType spanning)

Ontworpen en gespecificeerd (`content-spanningsmeter.md`, `visualisatie-spanningsmeter.md`), nog niet gebouwd. Bewust nog niet opgepakt:

- **Validatie van de vragen**: De vier stappen uit `content-spanningsmeter.md`, Validatie. Zolang die niet gedaan zijn, kan het resultaat een label "pilot" krijgen.
- **Import**: Het importbestand van de opzet (Excel of CSV) inlezen (`import-scans.md`).
- **PDF, CSV en InDesign**: Eigen exportspecs. De CSV heeft voor dit type per veld een score en een spanning in plaats van groepsscores per bouwsteen (`export-csv.md`).
- **Verdeling per veld**: Het aantal scans per niveau, zoals de bron vraagt, naast laagste en hoogste score.
- **Benchmark, Verkennen en vergelijking tussen Metingen**: Nog niet voor dit type (`benchmark.md`, `visualisatie-verkennen.md`).
- **Dossier en film**: Het Dossier en de film "Het dossier" voor dit type.
- **Zorg-variant** en andere sector-varianten van de Spanningsmeter.
- **Help**: De helpbestanden en de film Wat krijg ik krijgen een variant voor dit type (`help.md`, Films).

## Content-onderhoud

- **Periodieke check op `content-2030.md`**: Elke 2 maanden een seintje
  om te checken of het duidingsstuk nog actueel is: Nieuwe
  onderzoeken/cijfers van de gebruikte bronnen (Stanford HAI, McKinsey,
  Deloitte, Gartner) en eventueel nieuwe, relevant wordende topics.

## Responsive

De app is alleen voor desktopbreedte (`CLAUDE.md`, Uitgangspunten). Onderstaande regels voor smallere schermen zijn uit de specs gehaald en staan hier voor later.

- stylesheet.md: h1 op publieke pagina's: onder 900px 32px; h2 onder 900px 24px.
- stylesheet.md: Voortgang op smalle schermen: Onder 900px toont `.flow-mobiel-voortgang` een compacte, sticky voortgangsbalk.
- stylesheet.md: Gelijke breedte van knoppen: Breekt de rij op smalle schermen af naar meerdere regels, dan is de breedste knop per regel leidend.
- stylesheet.md: Radar en staafdiagram: Onder 1000px schermbreedte staan de twee kaarten onder elkaar. Is de kaart van het staafdiagram smaller dan zijn plot (onder 500px), dan wordt het diagram horizontaal (strijdig met de regel dat een diagram nooit scrolt).
- stylesheet.md: Classificatie: Onder 640px staan de drie klassen onder elkaar, links uitgelijnd.
- stylesheet.md: Modal `.modal-box--vol`: Op een scherm smaller dan 720px vult het venster het hele scherm.
- visualisatie-mijn-metingen.md: Kaarten: Twee kaarten naast elkaar vanaf 1120 px breedte, daaronder onder elkaar. Onder 920 px staan de blokken onder elkaar en zijn de teaser-rijen smaller (naam 130 px, waarde 40 px). Onder 640 px is de h1 32 px, staan knoppen op 100% breedte en de teaser-balken onder het getal. Onder 720 px komt het zijblok van het paneel boven de rijen. Knoppen mogen onder elkaar staan op 100% breedte.
- visualisatie-spanningsmeter.md: Radar en score per veld: Onder 1000px schermbreedte staan de twee kaarten onder elkaar.
- visualisatie-verkennen.md: De kaart Kenmerken staat links of boven de kaart Vergelijken (op smalle schermen boven).
- visualisatie-verkennen.md: De kaart Kenmerken staat links of boven de kaart Vergelijken (op smalle schermen boven).
- dossier.md: Verdeling rechts van de radar: Op een smaller scherm komt de verdeling onder de radar.

## Code volgt de spec

Plekken waar de code nog moet worden aangepast aan de spec.

- Antraciet `#44403c` als sleutel in de code migreren naar het merkgeel `--fu` (stylesheet.md, Niet gebruiken).
- Dossier: hernoem in de code `openVoorLead`, `openSinds` en `dossier.geopend` naar de termen uit dossier.md (`zichtbaar` en `zichtbaarSinds`).
- `Meting.onderdeel` bestaat niet als veld (`datamodel.md`, Meting). Haal resterende verwijzingen in de code weg.
- Kaart "Lead met een eigen scan die nog niet is afgerond" gebruikt het paneel Lead zonder eigen scan (`visualisatie-mijn-metingen.md`). De build toont nu twee blokken.
- De Spreidingslabel-drempels (`visualisatie-scores.md`, `visualisatie-quickscan.md`) zijn Admin-instelbare startwaarden. Voeg ze toe aan Instellingen (`beheerpagina.md`) en het datamodel.
- De sectie "AI in klantcontact" is een radar met acht taartpunten (`visual-bouwstenen-en-domeinen.md`). De build toont nog een raster van vier kolommen.
- Hernoem bouwblok naar bouwsteen in code en database: de entiteit `Bouwblok` wordt `Bouwsteen`, `Assessment.bouwblokLabel` wordt `bouwsteenLabel`, `bouwblokIds` wordt `bouwsteenIds`, de routes `/bouwblokken` en `/bouwstenen` blijven als redirect naar de Assessment-pagina, `info.contentBouwblokLabel` wordt `info.contentBouwsteenLabel`, `components/assessment/BouwblokkenSectie.tsx` wordt `BouwstenenSectie.tsx`. Zie ook de lijst met veldnamen in `datamodel.md`. De database heeft hiervoor een migratie nodig.
- De kop van een bouwsteen in de doorloopflow is maximaal 800px breed (`stylesheet.md`, Doorloopflow). De code toont nu 664px.
- Organisatie-detail volgt het organisatiepaneel (`beheerpagina.md`, Organisatiepaneel): één witte kaart met kop, cijferrij, kanalen (ingezet gekleurd, niet ingezet lichtgrijs), Techstack, Toegang, Afspraken en Contactpersonen, daarna aparte kaarten voor Dossier, KPI's, Metingen, Respondenten en Leads. Zie ook Sectiekaart en Kanaalkleuren in `stylesheet.md`.
- Startset KPI's: NPS krijgt `perKanaal` waar (`datamodel.md`, KPI's en kanalen), zodat NPS per kanaal in te vullen is.
- Open: Kleur en icoon per Kanaal staan alleen in `stylesheet.md` voor de zes startkanalen. Een door een Admin toegevoegd Kanaal heeft geen kleur. Besluit nodig: Een veld `kleur` op `Kanaal`, of een neutrale kleur (`--ink-m`) met een standaard icoon.
- Open: De velden Adoptie mijnomgeving/app, Klantcontact management & support en IT DevOps-medewerkers staan nog niet in het design van het organisatiepaneel.
- Profiel voor de Lead in het Dossier: veld `Organisatie.dossier.toonProfiel` (vier schakelaars), de groep Zichtbaar voor de Lead in het venster Kenmerken bewerken, de profielkaart bij de Lead (`dossier.md`, Profiel van de Organisatie), `info.profielLead` en het audit-event `dossier.profielGewijzigd`. Design: bord D en E in het Design-artifact "Organisatiescherm: visuele varianten".
- Het staafdiagram per categorie is overal een staand kolomdiagram (`stylesheet.md`, Staafdiagram per categorie). De build toont op het resultaatscherm bij een smalle kaart nog een liggend diagram. Haal de liggende variant weg en laat de kolommen op een smalle kaart meeschalen, met alleen nummers onder de balk onder 88px per kolom.
- De klassenaam onder de ring (bijvoorbeeld "Gemiddeld ontwikkeld") staat in de build linksuitgelijnd en op twee regels. Volgens `stylesheet.md` (Score-ring) staat hij gecentreerd onder de ring en op één regel. Pas de build aan.
- Het instructievlak in de vragenlijst is even breed als de kop (800px), niet 664px (`stylesheet.md`, Doorloopflow).
- Testknop: Voeg de instelling `testknopAan` toe aan Instellingen en toon het vlak alleen als hij aan staat.
- Kop op Kies jouw assessment: De tekst zonder selectie is "Actionable advies voor het verbeteren van je klantcontact" (`schermen.md`).
- Nummercirkels bij de AI-scan en de Spanningsmeter hebben een wit nummer, behalve bij het gele domein of veld (`stylesheet.md`, Domeinkleuren en Veldkleuren). De build toont nu een donker nummer bij turquoise en lavendel.
- De radars van de AI-scan en de Spanningsmeter (Assessment-pagina, films) zijn in de build vlakker dan die van Volwassenheid en Zorg. Breng ze op hetzelfde niveau: Dezelfde dikte van de lijn, vulling en stippen als de radar van Volwassenheid, en de voorbeeldscores uit de spec. AI-scan: 2,8 / 2,4 / 2,0 / 2,0 / 2,4 / 3,6 / 2,2 / 2,2 (`visual-bouwstenen-en-domeinen.md`, Voorbeeldscores). Spanningsmeter: 3,8 / 2,6 / 2,2 / 3,4 / 2,4 / 4,0 (`visualisatie-spanningsmeter.md`). Hoekpunt op straal (score − 1) × 37,5px. De build toont nu een bijna ronde, lage veelhoek, dat is een fout.
- De films van de AI-scan tonen de antwoordopties onder elkaar, zoals in de echte vragenlijst (`help.md`, Films). Nu staan ze naast elkaar. Bij de Spanningsmeter blijven de ronde knoppen naast elkaar, ook in de film.
- Het Benchmark-icoon in de Dossier-rij (`dossier.md`, Soortkleur en icoon) is een ander staafdiagram dan bij "Benchmarks" op de pagina van de Lead. Gebruik hetzelfde icoon met gevulde staven, alleen in `--pu` op `#efeaf2`.
- KPI-ringen in het Profiel voor de Lead (`dossier.md`, KPI-ringen): Vijfde schakelaar `Organisatie.dossier.toonProfiel.kpis` (`datamodel.md`, Dossieritem) en in Kenmerken bewerken, nieuwe velden `schaalMin` en `schaalMax` bij `KpiDefinitie` met startwaarden en invoer in het formulier voor de KPI-definitie, het blok KPI's met ringen onder de Kanalen, kanaalkeuze via de ingezette kanaalpillen, drie toestanden per ring (kanaal, alleen Algemeen, niet ingevuld) en het weglaten van lege KPI's voor de Lead. Design: bord F, G en H in het Design-artifact "Organisatiescherm: visuele varianten".
- KPI's in beheer (`beheerpagina.md`, Organisatiepaneel, KPI's): De kaart KPI's met de tabel vervalt. Het blok KPI's met ringen komt onder de Kanalen in het organisatiepaneel, met een keuzelijst voor het Onderdeel. De knop "Bewerken" wordt een menu met Kenmerken, KPI's invullen en Onderdelen. Nieuw is de modal Onderdelen (namen wijzigen, verwijderen en toevoegen) die de kolomkop-modals en "+ Onderdeel toevoegen" vervangt. Design: bord C, F, G en H.
- KPI CES (Customer Effort Score) in de startset (`datamodel.md`, KPI's en kanalen): Schaal 1 tot 7, per Onderdeel en per kanaal. In de tab KPI's en kanalen komen de kolommen Schaal van en Schaal tot (`beheerpagina.md`). CES staat niet in het InDesign-sjabloon en krijgt daar geen element zolang het sjabloon er niet om vraagt.
