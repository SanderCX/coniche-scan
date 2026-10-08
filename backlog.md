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
  ingelogde beheerders, en voor productie verwijderen.
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
  respondenten daarbovenop is nog geen ontwerpkeuze.
- **Trend tussen Metingen van dezelfde organisatie**: De aggregatie
  (`beheerpagina.md`, Organisatie-resultaten) werkt nu alleen bínnen
  één Meting. "Zijn we vooruitgegaan sinds de nulmeting" — twee of meer
  Metingen van dezelfde organisatie naast elkaar, per categorie/
  bouwblok — is nog geen ontwerp.
- **Benchmark, niveau 1 (tussen organisaties)**: Gebouwd (PR 61,
  `benchmark.md`). Daarbij nog niet gedekt: Export (PDF, CSV, InDesign) van
  een benchmark, rechten voor een Consultant, een vastgezette versie voor de
  Lead in plaats van live cijfers, de range van de groep als band, de tekst in
  de publieke privacypagina en in het toestemmingsvakje van de intake, en
  ontwikkeling in de tijd binnen een benchmark. Het berekenen moet op de
  server, zie Fase 2.
- **Benchmark, niveau 2 (binnen een organisatie, tussen Metingen)**:
  Besproken en uitgewerkt als voorstel in `benchmark.md`, nog te bouwen. Een
  Meting per bedrijfsonderdeel van één organisatie naast elkaar, op dezelfde
  plek als niveau 1, met `Benchmark.niveau`. Eerst alleen voor een Admin.
  Open: Of een Lead de view van zijn Meting ziet, en met welke drempel.
- **Benchmark, niveau 3 (binnen een Meting)**: Hoe scoort een scan ten
  opzichte van de andere scans in dezelfde Meting. Het kader staat in
  `benchmark.md`. Het ontwerp van de spreiding (verdeling per bouwblok,
  laagste tot hoogste score, de plek van een scan daarin) en van de hoge en
  lage scores moet nog worden bedacht. Houd rekening met herleidbaarheid bij
  weinig scans. Sluit aan op "Afwijking en spreiding bovenop de aggregatie"
  hierboven.
- **Benchmark of gemiddelde opslaan als samengestelde Meting**: Een
  gemiddelde over meerdere Metingen van één organisatie (zie niveau 2)
  vastleggen als eigen Meting, zodat een organisatie met meerdere delen als
  één deelnemer meedoet aan een benchmark tussen organisaties. De
  samengestelde Meting verwijst naar de Metingen waaruit ze bestaat en
  kopieert geen antwoorden. Ze staat in de lijst Metingen met een badge
  "Gemiddelde", heeft geen respondenten en is niet invulbaar. Een Lead kan Lead
  worden op een samengestelde Meting (`RespondentRolMeting`) en ziet dan alleen
  het gemiddelde, niet de onderliggende Metingen. Nog te beslissen: Wat er
  gebeurt als een onderliggende Meting wordt verwijderd. Blokkeren kan niet,
  want verwijderen moet altijd kunnen (bewaartermijn, AVG-verzoek). Voorstel:
  De Meting valt uit de samenstelling, de bevestiging noemt de samengestelde
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
  contentpagina (Visie, Bouwstenen, AI-scan, 2030, dus
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
  leespagina's Bouwstenen/AI-scan en/of in de modal van de
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
  geen veld hiervoor op `Bouwblok`, zie `datamodel.md`).

## Uit de scan van 2 oktober 2026

Gevonden bij een scan van de hele oplossing. De volgorde: Eerst alle
functionaliteit afronden, dan de database en rollen en rechten, en daarna
deployment, beveiliging en stabiliteit. Een deel is al opgepakt, zie
"Gedaan" hieronder en `changelog.md`.

### Gedaan (2 oktober 2026)

- Next.js naar 16.3.8 (kritieke RCE), `npm audit` schoon.
- `/api/mail` en `lib/mailer.ts` verwijderd (open mailrelay, ongebruikt).
- De sleutel `gebruikers` gaat niet meer via `/api/store` en de rij met
  wachtwoorden is uit Neon verwijderd. Gebruikers leven nu per browser.
- `/api/store` begrenst de bodygrootte, `/api/export-pdf` begrenst grootte en
  gelijktijdige headless browsers. Dev-server alleen op `127.0.0.1`.
- Tests met vitest (`npm test`): scoring, importdetectie, verplaats- en
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
- **Paginering** van de lijsten Respondenten en Ingevulde scans.
- **Spec en code gelijktrekken**: `Assessment.bouwblokLabel` in de spec
  tegenover `bouwblokEenheidEnkelvoud`/`Meervoud` in de code, en
  `Bouwblok.centraleVraag` als echt veld tegenover de lookup-tabellen.
- **Import**: Twee uploads van dezelfde organisatie geven twee Metingen met
  dezelfde naam ("Legacy-import 2026"). Bedenk een onderscheidend label.
- **Opsplitsen** van de Import-pagina (590 regels).
- **Meer tests**: Import (parsen en valideren van rijen), `scan-slot`, de
  overige stores.

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

## Openstaand na de changelog (7 oktober 2026)

Wat uit Sanders changelog nog niet gebouwd is of nog moet worden afgestemd. De rest van de changelog is gebouwd en staat in de specs.

**Besloten, nog te bouwen of te verwerken**
- **Zorgscan-gewichten**: Bouwblok 4, 10 en 11 staan op 2, de spec is leidend
  (`CLAUDE.md`, Scoringslogica). De seed staat op 2. Nog te controleren: De
  opgeslagen data in de database en in bestaande browsers.
- **Organisatievelden** (`beheerpagina.md`, punt 3): De tab bestaat nog
  niet. `VeldDefinitieEditor` staat klaar en moet in een pagina onder
  Applicatie of bij Organisaties worden gebruikt, zoals de spec vraagt.
- **Losse bestanden in de repo opruimen**: `v1-aanpassingen.md`,
  `datamodel-rbac-voorstel.md`, `coniche_bouwstenen.md` en
  `OverlegMetJoost.md` mogen weg (Joost akkoord, 8 oktober). Sander
  verwijdert ze via een PR. De open vragen die alleen daarin staan, zijn
  hieronder vastgelegd, onder "Open vragen uit de losse bestanden".
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
  velden `Bouwblok.toelichting` en `Bouwblok.centraleVraag` van het Assessment
  (een aanpassing in Content wijzigt dan ook de publieke pagina), of mogen ze
  uit elkaar lopen. Nu gebruiken `/bouwstenen` en `/ai-scan` nog hun eigen
  statische content.
- **Content-pagina's, opslag**: Voorstel is zoals bij Algemene teksten: Een
  gewijzigde tekst gaat voor op de standaardtekst, met "Standaardtekst
  herstellen", zonder versiebeheer, archiveren of publicatiestap, en met een
  auditregel met alleen de sleutel. Nog te bevestigen, evenals Admin-only.
- **Knop "Bekijk" in lijstrijen**: Het label is "Bekijk" zonder pijltjes (in de
  code gedaan). Het uiterlijk is nog open. Er zijn drie opties: grijze rand en donkere tekst zoals
  alle compacte knoppen (nu), oranje tekst met grijze rand, of een oranje rand
  bij hover voor alle `.btn-outline` knoppen. Ook de kleur van de aangewezen
  rij hoort daarbij. Volgt in `stylesheet.md`.
- **Eigenaarschap van een organisatie zonder aanmaker**: Voor een organisatie
  met `aangemaaktDoor: null` bestaat "Organisatie-toegang toewijzen". Open: Is
  dat voldoende, of is een losse actie "eigenaarschap overzetten" nodig.
- **Zorgscan-inhoud**: 29 van de 60 vragen zijn nog gelijk aan de
  Klantcontact-scan, dus niet sector-vertaald. Inhoudelijke input van Joost en
  Sander nodig (`content-zorgscan.md`).

## Content-onderhoud

- **Periodieke check op `content-2030.md`**: Elke 2 maanden een seintje
  om te checken of het duidingsstuk nog actueel is: Nieuwe
  onderzoeken/cijfers van de gebruikte bronnen (Stanford HAI, McKinsey,
  Deloitte, Gartner) en eventueel nieuwe, relevant wordende topics.
