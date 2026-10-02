# Coniche Scan: Backlog

Bewust nog niet opgepakt. Geen prioritering.

## Techniek en infrastructuur

- **Database**: Postgres op Neon, ter vervanging van localStorage. Pas
  daarna werken links in elke browser en komen antwoorden van
  respondenten centraal binnen.
- **Rollen, rechten en inlog** (`datamodel.md` deel 2):
  Admin, Consultant, Lead, 2FA, audit. Met de database.
- **E-mailverificatie bij het openen van de link**: Code per mail, 15
  minuten geldig (`datamodel.md`, Toegangscode). Met de database en de
  mailserver.
- **Coniche-mailserver (SMTP)**: Voor uitnodigingen en verificatiecodes.
  De bestaande Gmail-koppeling is alleen voor testen.
- **Antwoorden als losse records**: Handig voor export en aggregatie
  zodra de database er is. Nu volstaat een lijst per ingevulde scan.
- **Responsive**: De app is nu alleen voor desktop.

## Voor productie

- **Testknop** (vragenlijst automatisch invullen): Alleen tonen aan
  ingelogde beheerders, en voor productie verwijderen.
- **Testdata**: Seed-data met een testorganisatie en testrespondent
  opruimen.
- **Verificatie op "niets blijft achter" bij verwijderen**: Een
  eenvoudige controlefunctie (bijv. een testknop voor beheerders) die
  na een verwijderactie aantoont dat er niets meer verwijst naar het
  verwijderde record (`datamodel.md`, Verwijderen en datakoppelingen).
  Zelf ook weer opruimen voor productie, net als de testknop hierboven.
- **Bronformaat "Oude tool" verwijderen bij Import** (`import-scans.md`):
  Zodra de historische migratie uit de oude, stopgezette
  tool voltooid is, kan dat bronformaat uit de CSV-import. "Coniche Scan
  (eigen export)" blijft wel bestaan, dat is geen eenmalige migratie
  maar een blijvende manier om data tussen browsers te verplaatsen
  zolang de opslag nog localStorage is.

## Functioneel

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
- **Weging per bouwblok** (eerst overleggen met Joost): Gewogen scoring
  in plaats van de huidige ongewogen berekening, met Zorgscan-bouwblokken
  4, 10 en 11 op gewicht 2. De volledige uitwerking staat al in de specs
  maar is bewust **niet gebouwd**: `CLAUDE.md` (sectie 1 Scoringslogica,
  intake-Wegingskaart, "2×"-chip in doorloopflow en resultaten) en
  `beheerpagina.md` punt 1 en 2 (Weging per bouwblok, Wegingstekst per
  Assessment, `Assessment.wegingTitel`/`wegingToelichting`, auditregel
  `bouwblok.gewichtGewijzigd`). Raakt ook PDF, CSV (`gewicht` in
  `groepsScores`), InDesign en de Organisatie-resultaten. Tot het besluit
  valt rekent de app ongewogen en staat `gewicht` overal op 1.
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
- **Geanonimiseerd benchmark tussen organisaties/sectoren**: "Hoe
  scoor ik tov vergelijkbare bedrijven." Vraagt eigen keuzes over
  anonimisering en welke data samengevoegd mag worden — nog geen scope
  of ontwerp.
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

Gevonden bij een scan van de hele oplossing. De volgorde is bewust: Eerst
alle functionaliteit afronden, dan de database en rollen en rechten, en
daarna deployment, beveiliging en stabiliteit. Niets hieronder is opgepakt.

### Fase 1: Functioneel afronden

- **Audit-log** (`beheerpagina.md` punt 12): Ook nodig om overgeslagen scans
  bij verplaatsen en samenvoegen te loggen, zoals de spec voorschrijft.
- **Content-pagina's** beheerbaar maken (punt 11) en **Organisatievelden**
  zelf beheerbaar met de tab Organisatievelden (punt 3).
- **Paginering** van de lijsten Respondenten en Ingevulde scans (en de
  filters in de URL), zodra er meer data is.
- **Spec en code gelijktrekken**: `Assessment.bouwblokLabel` in de spec
  tegenover `bouwblokEenheidEnkelvoud`/`Meervoud` in de code, en
  `Bouwblok.centraleVraag` als echt veld tegenover de lookup-tabellen
  (`datamodel.md`).
- **Import**: Twee uploads van dezelfde organisatie geven twee Metingen met
  dezelfde naam ("Legacy-import 2026"). Bedenk een onderscheidend label of
  toon de herkomst in de Meting-lijst.
- **Toegankelijkheid**: Focusval en focus terug in de modals, en de rijen in
  de lijst Respondenten bereikbaar met het toetsenbord (nu alleen met de muis).
- **Tests** voor de scoring, de import en de verplaats-/samenvoeglogica in
  `lib/db.ts`. Een scratch-test met de zes scenario's bestaat al en is het
  startpunt.
- **Opruimen**: `lib/db.ts` (1180 regels) en de pagina's voor Content en
  Import opsplitsen, de exportcode in de twee respondent-resultatenpagina's
  naar `lib/beheer-export.ts` brengen, en het oude prototype in de root
  (`index.html`, `css/`, `js/`, `server.ps1`, `designer-preview-homepage.html`)
  verwijderen.
- **Versiebeheer**: De wijzigingen vaker committen, zodat teruggezette
  spec-bestanden direct te zien zijn.

### Fase 2: Database en rollen en rechten

- **Eén record per entiteit** in plaats van één JSON-blob per sleutel. Nu
  geldt "laatste schrijver wint" over alle organisaties heen: Twee
  beheerders of tabs overschrijven elkaar, en een pagina-load kan lokale,
  nog niet gesynchroniseerde wijzigingen overschrijven. Minimaal een
  versiecontrole (`updated_at`) bij het opslaan.
- **Rechten server-side afdwingen**: Nu gebeurt dat alleen in de browser
  en is de sessie een id in `sessionStorage` (`datamodel.md` deel 2).
- **Wachtwoorden gehasht** opslaan en de sleutel `gebruikers` pas naar de
  database synchroniseren zodra dat zo is: Nu staan de wachtwoorden in
  leesbare tekst in Neon.

### Fase 3: Deployment, beveiliging en stabiliteit

- **API-routes beveiligen**: `/api/store/[key]` heeft geen enkele
  beveiliging (iedereen die de server bereikt kan alles lezen en
  overschrijven), `/api/mail` is een open mailrelay via het Gmail-account en
  `/api/export-pdf` start zonder inlog een browser.
- **Next.js** upgraden naar 16.3.8 (kritieke RCE in `next/og`, GHSA-vcvr-r3jv-pc5j).
- **Dev-server** alleen op localhost (`next dev -H 127.0.0.1`).
- **PDF-export op serverless hosting**: `puppeteer` per verzoek is daar
  lastig (zie `go-live-plan.md`).
- **Schrijfverkeer**: Elke wijziging stuurt de hele blob naar Neon. Op
  record-niveau (fase 2) verdwijnt dit vanzelf.
- **Neon-back-ups** en een herstelprocedure, plus rate limiting op de routes.

## Content-onderhoud

- **Periodieke check op `content-2030.md`**: Elke 2 maanden een seintje
  om te checken of het duidingsstuk nog actueel is: Nieuwe
  onderzoeken/cijfers van de gebruikte bronnen (Stanford HAI, McKinsey,
  Deloitte, Gartner) en eventueel nieuwe, relevant wordende topics.
