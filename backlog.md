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
- **Bronformaat "Oude tool" uit de import-CSV-functie verwijderen**
  (`import-legacy-scans.md`): Zodra de historische migratie vanuit de
  oude, stopgezette tool voltooid is, heeft dit formaat geen functie
  meer. Bronformaat "Coniche Scan (eigen export)" blijft wél bestaan
  (data verplaatsen tussen browsers zolang de opslag localStorage is).

## Functioneel

- **Data-ouderdom**: Een melding als data te oud wordt, met de
  mogelijkheid om te controleren of die nog klopt en eventueel te
  verwijderen. Bewaartermijn nog te bepalen.
- **Landingspagina als leadgenerator**: De assessment-landingspagina
  krijgt een knop "Toegang aanvragen" in plaats van de uitgeschakelde
  "Start assessment".
- **Opnieuw invullen door de respondent**: De respondent start zelf,
  vanuit de scan, een nieuwe poging. Beheer verwijdert alleen.
- **Terugkomen bij eerdere scans**: Via de persoonlijke link naar een
  uitgebreidere omgeving met alle eigen metingen en resultaten.
- **AI-managementsamenvatting**: Wordt nieuw opgezet.
- **Aggregatie over meerdere respondenten binnen een meting**:
  Gemiddelde, afwijking, spreiding. Nog geen ontwerpkeuze.
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

## Content-onderhoud

- **Periodieke check op `content-2030.md`**: Elke 2 maanden een seintje
  om te checken of het duidingsstuk nog actueel is: Nieuwe
  onderzoeken/cijfers van de gebruikte bronnen (Stanford HAI, McKinsey,
  Deloitte, Gartner) en eventueel nieuwe, relevant wordende topics.
