# Coniche Scan: Content van het adviesverloop

De inhoud van het adviesverloop (`adviesverloop.md`): De zes fasen van het adviesproces, per fase de use cases met per rol een context en een prompt voor Copilot, de drie rollen en de uitleg over context in Copilot. Dit is de beginwaarde van de Adviescatalogus (`beheerpagina.md`, punt 17); de structuur volgt `datamodel.md`, Adviesverloop. De teksten komen uit de Boks-app en zijn inhoudelijk niet gewijzigd. Alleen de gedachtestreepjes zijn vervangen door komma's.

**Opbouw van een use case.** Code, titel, apps, omschrijving en per rol een Context en een Prompt. De Context beschrijft de situatie van de rol bij deze use case, de Prompt is de vraag aan Copilot. Niet elke use case heeft een prompt voor elke rol.

**Rollen en bronnen.** In de bron heten de rollen Co, Lot en Piet. In de interface heten ze Consultant, Teamleider (interim) en Salesmanager. De teksten binnen een Context noemen de bronnamen soms nog.

## Rollen

Per rol de tekst die Copilot vertelt wie de gebruiker is. Dit is het eerste niveau van de context (`Wie ben jij`). In de app is de tekst een standaardwaarde die de Consultant in eigen woorden aanpast (`adviesverloop.md`, Prompt klaarzetten).

### Consultant

- **Bron**: Co (co), Consultant Klantcontact bij Coniche
- **Motto**: Ik zie wat er nodig is, in processen, systemen én mensen.
- **Kleur**: #FF671F

**Persona-tekst**

Je ondersteunt mij, Co, als Consultant Klantcontact bij Coniche. Coniche is een gespecialiseerd adviesbureau dat organisaties helpt op het gebied van klantcontact. Mijn werk: ik help organisaties hun klantcontactomgeving structureel verbeteren, van strategie tot uitvoering. Ik adviseer op tactisch en strategisch niveau, ontwerp klantcontactomgevingen, schrijf adviesrapporten en presenteer aanbevelingen aan directies en stuurgroepen. Mijn specialismen zijn klantcontact in de zorg en AI-toepassingen in dienstverlening. Mijn werkstijl: direct, inhoudelijk, warm en praktijkgericht. Geen overbodige managementjargon. Wanneer ik je een prompt stuur ben ik bezig met een specifieke taak binnen een adviesopdracht. Stem je antwoorden af op mijn rol en de klantcontactsector. Antwoord altijd in het Nederlands, tenzij ik anders vraag.

### Salesmanager

- **Bron**: Piet (piet), Salesmanager bij Coniche
- **Motto**: Een goede opdracht begint met het juiste gesprek.
- **Kleur**: #ffc043

**Persona-tekst**

Je ondersteunt mij, Piet, als Salesmanager bij Coniche. Coniche is een gespecialiseerd adviesbureau dat organisaties helpt op het gebied van klantcontact. Mijn werk: ik ben verantwoordelijk voor nieuwe opdrachten, het warm houden van relaties en het tijdig bespreken van verlengingen van lopende opdrachten van mijn collega's. Ik bezoek events, voer kennismakingsgesprekken, schrijf offertes en zorg dat Coniche zichtbaar en relevant blijft in de markt. Mijn werkstijl: commercieel maar inhoudelijk, direct en relatieгericht. Ik verkoop niet, ik verbind de juiste mensen met de juiste vraagstukken. Wanneer ik je een prompt stuur ben ik bezig met een commerciële taak: een gesprek voorbereiden, een voorstel schrijven of een relatie onderhouden. Stem je antwoorden af op mijn rol en de klantcontactsector. Antwoord altijd in het Nederlands, tenzij ik anders vraag.

### Teamleider (interim)

- **Bron**: Lot (lot), Teamleider Klantcontact bij Coniche
- **Motto**: Teams groeien niet van harder werken, maar van slimmer samenwerken.
- **Kleur**: #225ba0

**Persona-tekst**

Je ondersteunt mij, Lot, als interim Teamleider Klantcontact bij Coniche. Coniche is een gespecialiseerd adviesbureau dat organisaties helpt op het gebied van klantcontact. Mijn werk: ik word bij verschillende organisaties ingezet om teams aan te sturen, processen te structureren en verbeteringen door te voeren, operationeel én tactisch. Mijn specialismen zijn klantcontact in de zorg en AI-toepassingen in dienstverlening. Mijn werkstijl: direct, energiek, mensengericht. Ik zie snel wat er speelt en krijg mensen in beweging zonder te pushen. Wanneer ik je een prompt stuur ben ik bezig met een concrete situatie in een klantcontactomgeving. Stem je antwoorden af op mijn rol als leidinggevende in die context. Antwoord altijd in het Nederlands, tenzij ik anders vraag.

## Context in drie niveaus

De kwaliteit van Copilot's antwoorden hangt direct af van hoeveel context je meegeeft. Hoe beter Copilot jou en je situatie kent, hoe beter het antwoord. Drie niveaus, oplopend in kracht.

### Niveau 1: Wie ben jij?

- **Niveau**: Gebruikersniveau, eenmalig per gesprek
- **Uitleg**: Je vertelt Copilot wie je bent: je rol, je werkwijze, je sector en hoe je wil dat hij met je communiceert. Dit geef je één keer mee aan het begin van een nieuw gesprek. Daarna past Copilot elk antwoord automatisch aan op jouw context.
- **Typisch**: Naam, rol, organisatie, specialismen, werkstijl, taal.

### Niveau 2: Waar werk je aan?

- **Niveau**: Opdrachtcontext, per gesprek of per onderwerp
- **Uitleg**: Je vertelt Copilot in welke situatie je zit: bij welke klant, wat er speelt, wat de aanleiding is. Dit geef je mee als je een nieuw onderwerp aansnijdt of van opdracht wisselt. Combineer dit met de use case-prompt uit de navigator voor het beste resultaat.
- **Typisch**: Type organisatie, sector, aanleiding, fase van het traject, betrokken personen.

### Niveau 3: Wat wil je nu?

- **Niveau**: Taakniveau, per prompt
- **Uitleg**: De concrete vraag of opdracht aan Copilot. Hoe specifieker je bent over het gewenste resultaat, de doelgroep, het format en eventuele beperkingen, hoe beter het antwoord.
- **Typisch**: De taak, het gewenste resultaat, format (bijv. maximaal één A4), toon (bijv. geen jargon), doelgroep van de output.

## Copilot-agent

De Copilot Agent. Een Copilot Agent bouw je gewoon in de Copilot-app zelf, geen technische kennis vereist. Je configureert een eigen assistent met drie onderdelen.

- **Instructies**: Een vaste persoonlijkheid en toon die altijd actief zijn, ook zonder dat je het elke keer hoeft te typen.
- **Kennisbronnen**: Je koppelt eigen documenten, SharePoint-mappen of interne bestanden zodat Copilot altijd de juiste bronnen gebruikt.
- **Acties**: Wat de agent mag doen, zoals zoeken of samenvatten.

Praktisch voorbeeld voor Coniche: een agent die altijd de laatste methodes, referentiecases en offertesjablonen bij de hand heeft. Elke collega gebruikt hem, niemand hoeft elke keer opnieuw context mee te geven.

## Apps

De apps die bij een use case horen.

| Code | App |
|---|---|
| `copilot` | Copilot (app) |
| `word` | Word |
| `excel` | Excel |
| `ppt` | PowerPoint |
| `outlook` | Outlook |
| `teams` | Teams |
| `onenote` | OneNote |
| `studio` | Copilot Studio |

## Fasen en use cases

### Fase 1: Acquireren & Starten

- **Korte naam**: Acquireren
- **Omschrijving**: Marktverkenning, netwerken, intakegesprekken en het opbouwen van een relatie met de client. De adviseur identificeert behoeften en bepaalt de reikwijdte van de opdracht.
- **Kleur**: #FF671F

#### 1-1 Markt- en sectoronderzoek

- **Apps**: Copilot (app)
- **Omschrijving**: Gebruik Copilot (app) om actuele sectortrends, concurrentieanalyses en brancheberichten samen te vatten. Bouw in minuten een contextschets op voor een nieuwe prospect.

##### Rol Consultant

- **Context**: Co bereidt zich voor op een intakegesprek met een regionale zorginstelling die haar klantcontactcentrum wil moderniseren. Hij gebruikt Copilot om snel de actuele uitdagingen in klantcontact binnen de zorgsector in kaart te brengen.
- **Prompt**: Geef een overzicht van de vijf belangrijkste uitdagingen in klantcontact bij zorgorganisaties in Nederland in 2026-2030. Denk aan personeelstekort, digitalisering, bereikbaarheid en patiëntbeleving.

##### Rol Salesmanager

- **Context**: Piet bereidt zich voor op een event over klantcontact in de zorg. Hij gebruikt Copilot om snel te begrijpen wat er speelt in de sector zodat hij relevante gesprekken kan voeren.
- **Prompt**: Geef een overzicht van de vijf actuele thema's die nu leven bij directeuren en managers in klantcontact binnen de zorgsector. Wat zijn de urgente vraagstukken waar zij mee worstelen en welke oplossingsrichtingen zijn populair?

#### 1-2 Klantprofiel samenstellen

- **Apps**: Copilot (app)
- **Omschrijving**: Laat Copilot relevante informatie over de potentiele clientorganisatie verzamelen: jaarverslagen, nieuws, strategie en cultuur. Ideale voorbereiding op het intakegesprek.

##### Rol Consultant

- **Context**: Co gaat op gesprek bij een grote gemeente die haar KCC wil herinrichten. Met Copilot maakt hij een profiel van de organisatie: wat speelt er, welke publieke informatie is er, en wat zijn bekende pijnpunten bij gemeentelijk klantcontact?
- **Prompt**: Stel een klantprofiel op voor een middelgrote Nederlandse gemeente met een gemeentelijk Klant Contact Centrum. Beschrijf typische uitdagingen, recente ontwikkelingen in gemeentelijke dienstverlening en relevante benchmarks.

##### Rol Teamleider (interim)

- **Context**: Lot start over twee weken als interim teamleider bij een zorginstelling. Ze gebruikt Copilot om snel inzicht te krijgen in de organisatie: teamgrootte, wat er speelt en bekende pijnpunten in klantcontact bij dit type organisatie.
- **Prompt**: Stel een organisatieprofiel op voor een middelgrote zorginstelling met een klantcontactteam. Beschrijf de typische teamstructuur, veel voorkomende uitdagingen voor teamleiders en relevante ontwikkelingen in klantcontact binnen de zorg.

##### Rol Salesmanager

- **Context**: Piet gaat volgende week op gesprek bij een prospect die hij ontmoette op een event. Hij wil goed voorbereid zijn en de organisatie snappen voordat hij aankomt.
- **Prompt**: Stel een gespreksvoorbereiding op voor een salesgesprek bij een middelgrote zorgverzekeraar. Beschrijf: wat de organisatie doet, wat er publiekelijk speelt, mogelijke uitdagingen in hun klantcontact en drie haakjes die ik kan gebruiken om het gesprek relevant te maken.

#### 1-3 Acquisitie- en netwerkmails

- **Apps**: Outlook
- **Omschrijving**: Stel gerichte, persoonlijke acquisitie-emails op met Copilot in Outlook. Verwerk context over de ontvanger en laat Copilot de toon en inhoud optimaliseren.

##### Rol Consultant

- **Context**: Na een congres over AI in klantcontact wil Co contact leggen met een contactcentermanager die ze sprak. Hij vraagt Copilot om een persoonlijke, relevante opvolgmail te schrijven zonder generieke praatjes.
- **Prompt**: Schrijf een korte, persoonlijke follow-up mail aan een contactcentermanager die ik ontmoette op een AI & klantcontact congres. Wij spraken over de kansen van AI-gestuurde kwaliteitsmonitoring. Toon: direct, warm, professioneel. Geen verkooppraatje.

##### Rol Salesmanager

- **Context**: Piet wil na een event contact opnemen met drie mensen die hij sprak. Hij vraagt Copilot om per persoon een korte, persoonlijke opvolgmail te schrijven die aansluit op het gesprek.
- **Prompt**: Schrijf een opvolgmail na een kennismakingsgesprek op een klantcontact-event. De ontvanger is contactcentermanager bij een gemeente. We spraken over de uitdagingen van digitalisering bij hun KCC. Toon: persoonlijk, geen verkooppraatje, wel een concrete volgende stap voorstellen.

#### 1-4 Intakegesprek voorbereiden

- **Apps**: Word, OneNote, Copilot (app)
- **Omschrijving**: Genereer een gespreksagenda, vragenlijst en achtergrondnotitie voor het intakegesprek. Copilot formuleert ook een eerste probleemhypothese op basis van beschikbare info.

##### Rol Consultant

- **Context**: Co heeft een intake bij een verzekeraar die haar klantcontactstrategie wil herijken naar aanleiding van dalende NPS-scores. Hij laat Copilot een gespreksagenda en vragenlijst opstellen die ingaat op strategie, processen en menselijke kant.
- **Prompt**: Maak een gespreksagenda en vragenlijst voor een intake met een verzekeraar over dalende NPS-scores in het klantcontactcentrum. Behandel: huidige situatie, root causes, organisatiecultuur, beschikbare data en verwachtingen van het adviestraject.

##### Rol Teamleider (interim)

- **Context**: Lot gaat haar eerste kennismakingsgesprek in bij een gemeente waar ze als interim teamleider start. Ze wil scherp krijgen wat de opdracht inhoudt, wat er van haar verwacht wordt en hoe het team er nu voor staat.
- **Prompt**: Maak een gespreksagenda en vragenlijst voor mijn eerste kennismakingsgesprek als interim teamleider bij een gemeentelijk klantcontactteam. Ik wil inzicht in: de opdracht en verwachtingen, de huidige teamdynamiek, openstaande uitdagingen en mijn speelruimte als leidinggevende.

##### Rol Salesmanager

- **Context**: Piet heeft een eerste kennismakingsgesprek bij een telecombedrijf dat worstelt met hoge klantenservicekosten. Hij wil het gesprek goed openen, de juiste vragen stellen en de situatie scherp krijgen.
- **Prompt**: Maak een gespreksvoorbereiding voor een eerste salesgesprek bij een telecombedrijf over klantcontactoptimalisatie. Geef me: een sterke openingsvraag, vijf onderzoekende vragen om de pijn en urgentie boven tafel te krijgen, en een mogelijke afsluiting die leidt naar een vervolgstap.

#### 1-5 Intakegesprek samenvatten

- **Apps**: Teams, Outlook
- **Omschrijving**: Na het intakegesprek maakt Copilot in Teams automatisch een samenvatting met actiepunten, sleutelzinnen van de client en afgesproken vervolgstappen.

##### Rol Consultant

- **Context**: Na een intensief intakegesprek met drie stakeholders van een zorgverzekeraar laat Co Copilot de opname samenvatten. Hij wil een helder beeld van de probleemstelling, de belangen van elke deelnemer en de afgesproken vervolgstappen.
- **Prompt**: Maak een samenvatting van dit intakegesprek met drie deelnemers. Beschrijf per deelnemer hun kernboodschap en belang. Formuleer de gedeelde probleemstelling en lijst de concrete vervolgafspraken op.

##### Rol Teamleider (interim)

- **Context**: Lot heeft net haar kennismakingsgesprek afgerond met de opdrachtgever en teamleads. Ze laat Copilot de Teams-opname samenvatten zodat ze een scherp startdocument heeft voor haar eerste weken.
- **Prompt**: Maak een samenvatting van dit kennismakingsgesprek als basis voor mijn start als interim teamleider. Noteer per gesprekspartner wat zij verwachten van mijn rol. Zet de drie belangrijkste aandachtspunten op een rij en lijst mijn concrete acties voor de eerste twee weken op.

##### Rol Salesmanager

- **Context**: Piet heeft net een goed eerste gesprek gehad met een prospect. Hij laat Copilot de aantekeningen samenvatten zodat hij direct een intern briefing kan sturen aan Co of Lot.
- **Prompt**: Maak een interne gespreksnotitie op basis van mijn aantekeningen van dit salesgesprek. Beschrijf: de situatie bij de klant, de uitgesproken pijn en urgentie, wat de klant zoekt, en mijn inschatting van de kans. Sluit af met een aanbeveling voor de vervolgstap en wie van ons team het best past bij deze opdracht.

#### 1-6 Positionering aanscherpen

- **Apps**: Copilot (app), Word
- **Omschrijving**: Vraag Copilot om je profiel te vergelijken met vergelijkbare aanbieders. Gebruik de inzichten om je reputatie en propositie scherper te formuleren.

##### Rol Consultant

- **Context**: Coniche wil haar positie in de markt voor klantcontactadvies in de zorgsector scherper neerzetten. Co gebruikt Copilot om de propositie aan te scherpen en te onderscheiden van grote adviesbureaus.
- **Prompt**: Analyseer de positionering van een gespecialiseerd klantcontactadviesbureau ten opzichte van grote managementadviesbureaus. Wat zijn de onderscheidende voordelen op het gebied van specialisme, aanpak en klantgerichtheid in de zorgsector?

##### Rol Salesmanager

- **Context**: Piet merkt dat prospects Coniche soms verwarren met grotere generieke adviesbureaus. Hij wil scherper formuleren wat Coniche onderscheidt en dat ook mondeling makkelijk kunnen uitleggen.
- **Prompt**: Help me een scherpe positioneringszin formuleren voor Coniche als gespecialiseerd klantcontactadviesbureau. Wat onderscheidt ons van grote managementadviesbureaus en van recruitment/detacheringsbureaus? Geef drie varianten: een voor een elevator pitch, een voor LinkedIn en een voor een offertedocument.

#### 1-7 Event voorbereiden

- **Apps**: Copilot (app), Word
- **Omschrijving**: Gebruik Copilot om een event goed voor te bereiden: wie wil je spreken, wat is je doel, welke haakjes gebruik je en hoe houd je het gesprek relevant.

##### Rol Salesmanager

- **Context**: Piet gaat naar een klantcontact-vakbeurs. Hij wil zijn tijd goed gebruiken en niet van stand naar stand lopen zonder doel. Hij vraagt Copilot te helpen met een scherpe voorbereiding.
- **Prompt**: Help me een event-voorbereiding maken voor een klantcontact vakbeurs. Ik wil: (1) drie typen bezoekers omschrijven die interessant zijn voor Coniche, (2) per type een openingsvraag die het gesprek op gang brengt zonder verkoopsfeer, (3) een checklist voor wat ik na het event direct doe met nieuwe contacten.

#### 1-8 Koud kennismakingsgesprek voorbereiden

- **Apps**: Copilot (app), Word
- **Omschrijving**: Gebruik Copilot om een koud gesprek voor te bereiden: onderzoek de organisatie, vind een relevant haakje en formuleer een opening die nieuwsgierigheid wekt zonder direct te verkopen.

##### Rol Salesmanager

- **Context**: Piet belt volgende week koud een contactcentermanager bij een energiebedrijf. Er is geen warme intro. Hij wil een sterke opening en een relevante invalshoek waarmee hij direct waarde toont.
- **Prompt**: Bereid een koud kennismakingsgesprek voor met een contactcentermanager bij een energiebedrijf. Geef me: (1) wat er publiekelijk speelt bij energiebedrijven op het gebied van klantcontact, (2) een openingszin die nieuwsgierigheid wekt zonder direct te pitchen, (3) twee vragen die het gesprek op gang brengen en mij helpen te beoordelen of er een match is.

#### 1-9 LinkedIn post schrijven na event

- **Apps**: Copilot (app)
- **Omschrijving**: Gebruik Copilot om na een event een relevante LinkedIn post te schrijven die je netwerk warm houdt en Coniche zichtbaar maakt zonder reclamefeer.

##### Rol Salesmanager

- **Context**: Piet was gisteren op een klantcontact-event en wil zijn netwerk laten weten wat hem opviel. Geen saaie terugblik maar een post die mensen aan het denken zet.
- **Prompt**: Schrijf een LinkedIn post na een klantcontact-vakbeurs. Ik wil één scherpe observatie delen over wat ik hoorde van meerdere managers. Toon: persoonlijk, inhoudelijk, geen reclame voor Coniche. Eindig met een open vraag die reacties uitlokt. Lengte: maximaal 150 woorden.

#### 1-10 CV aanscherpen voor opdracht

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Laat Copilot je CV aanscherpen op de specifieke opdracht en organisatie. Benadruk relevante ervaring en pas de toon aan op de opdrachtgever.

##### Rol Teamleider (interim)

- **Context**: Lot solliciteert op een interim teamleider-opdracht bij een zorgverzekeraar. Ze wil haar CV aanscherpen zodat haar ervaring met klantcontact in de zorg en leidinggeven aan verandertrajecten duidelijk naar voren komt.
- **Prompt**: Scherp mijn CV aan voor een interim teamleider-opdracht bij een zorgverzekeraar. Benadruk mijn ervaring met klantcontactteams in de zorg, situationeel leiderschap en het begeleiden van verbetertrajecten. Toon: zelfverzekerd, concreet, geen cv-jargon.

### Fase 2: Offreren & Overeenkomen

- **Korte naam**: Offreren
- **Omschrijving**: Opstellen van de offerte, afstemmen van rollen, taken en honorarium, en vastleggen van afspraken. De basis voor een succesvolle samenwerkingsrelatie.
- **Kleur**: #225ba0

#### 2-1 Offerte genereren en verfijnen

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot in Word om op maat gemaakte offertes te genereren op basis van intake-informatie. Pas toon, structuur en inhoud aan met gerichte prompts.

##### Rol Consultant

- **Context**: Co schrijft een offerte voor een herontwerp van het klantcontactproces bij een energieleverancier. Hij gebruikt Copilot om de intake-notities om te zetten naar een professioneel samenwerkingsvoorstel met duidelijke scope en aanpak.
- **Prompt**: Schrijf op basis van deze intake-notities een offerte voor een klantcontact-optimalisatietraject bij een energieleverancier. Onderdelen: probleemanalyse, aanpak in fasen, verwachte resultaten, inzet en investering. Toon: professioneel maar toegankelijk.

##### Rol Salesmanager

- **Context**: Piet heeft een goed gesprek gehad en de prospect verwacht een voorstel. Hij gebruikt Copilot om snel een scherpe offerte op te zetten op basis van zijn gespreksnotities.
- **Prompt**: Schrijf op basis van deze gespreksnotities een beknopte offerte voor een klantcontact-adviestraject. Onderdelen: onze interpretatie van de vraag, voorgestelde aanpak in twee of drie fasen, wat de klant kan verwachten en de investering. Toon: zelfverzekerd, helder, geen consultancy-jargon.

#### 2-2 Projectbegroting opstellen

- **Apps**: Excel
- **Omschrijving**: Laat Copilot in Excel een begroting-sjabloon invullen op basis van het plan van aanpak, inclusief urenraming per fase en adviseurstarief.

##### Rol Consultant

- **Context**: Co werkt met Copilot een begroting voor een 16-weekse transformatie uit: personeelsuren, overheadkosten, licenties en interne kosten van de opdrachtgever. Copilot helpt snelle scenario-analyses te maken.
- **Prompt**: Maak een gedetailleerde projectbegroting voor een klantcontact-verbetertraject van 16 weken. Inclusief: dagschuifposten per fase, overhead, outplacement voor de adviseur. Maak ook een scenario met 20% efficiency-verbetering.

##### Rol Salesmanager

- **Context**: Piet wil een realistische begroting opstellen voor een traject waarbij Co als consultant wordt ingezet. Hij wil snel zien wat de marge is bij verschillende scenario's.
- **Prompt**: Maak een eenvoudige projectbegroting voor een adviestraject van 10 weken met één senior consultant. Inclusief: dagprijs, geschat aantal dagen per fase, totaalbedrag en een scenario met 20% extra buffer. Presenteer het overzichtelijk.

#### 2-3 Samenwerkingsvoorstel presenteren

- **Apps**: PowerPoint, Copilot (app)
- **Omschrijving**: Genereer een overtuigende presentatie in PowerPoint met de aanpak, fasering, deliverables en resultaten. Copilot maakt de structuur en vult slides in.

##### Rol Consultant

- **Context**: Co presenteert morgen aan het stuurgroepvoorzitterschap van een zorginstelling. Hij gebruikt Copilot om snel een professionele pitchpresentatie op te bouwen die de urgentie en het voorstel helder uiteen zet.
- **Prompt**: Maak een PowerPoint-opzet voor een pitchpresentatie aan een zorginstellingsstuurgroep. Slides: 1) de uitdaging in cijfers, 2) onze aanpak in 3 fasen, 3) verwachte impact op bereikbaarheid en patiënttevredenheid, 4) investering en tijdlijn, 5) volgende stap.

##### Rol Salesmanager

- **Context**: Piet mag zijn voorstel presenteren aan het MT van een prospect. Hij heeft 20 minuten en wil Coniche neerzetten als de logische keuze zonder dat het een verkooppresentatie wordt.
- **Prompt**: Maak een structuur voor een 20-minuten pitch aan een MT over een samenwerking met Coniche. Slides: 1) wat wij verstaan onder de uitdaging die zij hebben, 2) onze aanpak in drie stappen, 3) wat dit oplevert in concrete termen, 4) waarom Coniche en niet een groot bureau, 5) voorstel voor een volgende stap.

#### 2-4 Contracttekst controleren

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Laat Copilot een concept-overeenkomst doornemen op ontbrekende elementen: geheimhouding, aansprakelijkheid, wijzigingsprocedures en betalingsafspraken.

##### Rol Consultant

- **Context**: Een nieuwe opdrachtgever stuurt een eigen raamcontract door. Co laat Copilot de tekst checken op geheimhouding, aansprakelijkheid en de specifieke afspraken die hij in de offerte heeft gemaakt.
- **Prompt**: Controleer dit concept-raamcontract op de volgende punten: (1) geheimhoudingsclausule, (2) aansprakelijkheidsbeperking, (3) intellectueel eigendom van deliverables, (4) opzegmogelijkheden. Geef per punt aan of het aanwezig, ontbrekend of onduidelijk is.

##### Rol Salesmanager

- **Context**: De klant stuurt een eigen inkoopcontract. Piet wil snel weten of er punten in staan die ongunstig zijn voor Coniche voordat hij het doorstuurt naar de directie.
- **Prompt**: Controleer dit inkoopcontract op punten die ongunstig kunnen zijn voor een adviesbureau. Let specifiek op: aansprakelijkheidsclausules, betalingstermijnen, exclusiviteitsbepalingen, eigendom van deliverables en opzegmogelijkheden. Geef per punt een korte beoordeling en een suggestie voor herformulering.

#### 2-5 Planning en mijlpalen uitwerken

- **Apps**: Word, Excel
- **Omschrijving**: Gebruik Copilot om een faseplanning te maken met mijlpalen, doorlooptijden en verantwoordelijkheden, klaar als bijlage bij de offerte.

##### Rol Consultant

- **Context**: Het traject bij een telecombedrijf start over drie weken. Co maakt een projectplanning die aansluit bij de besluitvormingscyclus van de opdrachtgever en ruimte laat voor iteratie na de diagnosefase.
- **Prompt**: Maak een projectplanning voor een klantcontact-verbetertraject van 16 weken. Fase 1: diagnose en interviews (weken 1-4). Fase 2: analyse en rapportage (weken 5-7). Fase 3: ontwerp nieuw model (weken 8-11). Fase 4: implementatiebegeleiding (weken 12-16). Inclusief mijlpalen en review-momenten.

##### Rol Teamleider (interim)

- **Context**: Lot is gevraagd voor een interim opdracht van twaalf weken bij een gemeente. Ze werkt een startplanning uit die aansluit bij haar kennismakingsgesprekken, de eerste teamobservaties en de verwachte besluitvormingsmomenten van de opdrachtgever.
- **Prompt**: Maak een planning voor een interim teamleider-opdracht van 12 weken. Week 1-2: kennismaken en observeren. Week 3-4: diagnose en eerste bevindingen. Week 5-9: verbeteringen doorvoeren. Week 10-12: borgen en overdracht voorbereiden. Inclusief mijlpalen en check-in momenten met de opdrachtgever.

##### Rol Salesmanager

- **Context**: Piet heeft de deal binnen en wil een heldere startplanning maken die hij kan delen met zowel de klant als met Co die de opdracht gaat uitvoeren.
- **Prompt**: Maak een beknopte startplanning voor een nieuw adviestraject van 12 weken. Onderdelen: kick-off, eerste diagnosefase, tussentijdse review met opdrachtgever en eindoplevering. Incluud de key contactmomenten waarbij Piet als accountmanager aanschuift.

#### 2-6 Verlengingsgesprek voorbereiden

- **Apps**: Copilot (app), Word
- **Omschrijving**: Gebruik Copilot om een verlengingsgesprek voor te bereiden voor een lopende opdracht van Co of Lot. Breng de waarde in kaart, anticipeer op bezwaren en formuleer een helder voorstel.

##### Rol Salesmanager

- **Context**: Co zit al drie maanden bij een zorgverzekeraar en de opdracht loopt over zes weken af. Piet wil het verlengingsgesprek goed voorbereiden en tijdig het gesprek aangaan met de opdrachtgever.
- **Prompt**: Bereid een verlengingsgesprek voor over de lopende opdracht van onze consultant bij een opdrachtgever. Help me met: (1) hoe ik de behaalde waarde tot nu toe in kaart breng, (2) drie vragen om te toetsen of er nog behoefte is aan verlenging of uitbreiding, (3) hoe ik een verlengingsvoorstel introduceer zonder dat het voelt als druk zetten.

#### 2-7 Verlengingsvoorstel opstellen

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Stel een kort en scherp voorstel op voor de verlenging van een lopende opdracht. Benadruk de behaalde resultaten en beschrijf wat de volgende fase oplevert.

##### Rol Salesmanager

- **Context**: Na het verlengingsgesprek wil Piet een beknopt voorstel sturen. Lot heeft goede resultaten geboekt en de klant staat open voor verlenging. Piet wil het voorstel klein houden maar wel overtuigend.
- **Prompt**: Schrijf een beknopt verlengingsvoorstel voor een interim teamleider-opdracht die verlengd wordt met drie maanden. Onderdelen: korte terugblik op wat al bereikt is, wat de focus wordt in de verlengingsperiode, de investering en een concrete volgende stap. Maximaal één A4. Toon: zakelijk maar warm.

### Fase 3: Onderzoeken & Beeldvormen

- **Korte naam**: Onderzoeken
- **Omschrijving**: Gegevensverzameling, diagnose en analyse. De adviseur brengt de situatie van de client in beeld via interviews, documenten en observaties.
- **Kleur**: #197f4e

#### 3-1 Interviews en vergaderingen analyseren

- **Apps**: Teams, Copilot (app)
- **Omschrijving**: Gebruik Copilot in Teams om transcripties van interviews en workshops samen te vatten. Extraheer thema's, spanningsvelden en kernuitspraken automatisch.

##### Rol Consultant

- **Context**: Co voert in een week twaalf interviews met medewerkers en leidinggevenden van een contactcenter. Hij laat Copilot de transcripties analyseren op terugkerende themas, spanningsvelden en verbeterpunten.
- **Prompt**: Analyseer deze twaalf interviewtranscripties uit een klantcontactorganisatie. Identificeer: (1) de drie meest genoemde knelpunten, (2) verschillen in beleving tussen medewerkers en leidinggevenden, (3) onderliggende oorzaken, (4) al bestaande verbeterideeën vanuit de vloer.

##### Rol Teamleider (interim)

- **Context**: Lot heeft in haar eerste twee weken tien korte gesprekken gevoerd met teamleden. Ze laat Copilot de aantekeningen analyseren om snel een eerlijk beeld te krijgen van wat er speelt in het team.
- **Prompt**: Analyseer deze gespreksaantekeningen uit individuele kennismakingsgesprekken met teamleden van een klantcontactteam. Identificeer: (1) terugkerende frustraties, (2) wat het team energie geeft, (3) onderlinge spanningen of blinde vlekken, (4) concrete verbeterwensen vanuit de medewerkers zelf.

#### 3-2 Documenten samenvatten en doorzoeken

- **Apps**: Copilot (app), Word
- **Omschrijving**: Upload rapporten, jaarverslagen of beleidsdocumenten en laat Copilot de kern samenvatten, inhoud vergelijken en gerichte vragen beantwoorden.

##### Rol Consultant

- **Context**: De opdrachtgever levert een stapel rapporten aan: een klanttevredenheidsonderzoek, een personeelsverloopanalyse en een recent IT-audit. Co vraagt Copilot de rode draad over alle documenten heen te destilleren.
- **Prompt**: Lees deze drie documenten: klanttevredenheidsrapport, personeelsverloopanalyse en IT-audit van het klantcontactcentrum. Beschrijf de onderlinge samenhang en geef drie overkoepelende conclusies die in alle drie terugkomen.

##### Rol Teamleider (interim)

- **Context**: Lot krijgt bij haar start een stapel documenten: een recent medewerkerstevredenheidsonderzoek, het teamplan van vorig jaar en de laatste kwartaalrapportage. Ze vraagt Copilot de belangrijkste signalen eruit te halen.
- **Prompt**: Lees deze drie documenten: medewerkerstevredenheidsonderzoek, teamplan en kwartaalrapportage van een klantcontactteam. Wat zijn de drie meest opvallende signalen? Waar zit consistentie tussen de documenten en waar zitten opvallende tegenstellingen?

#### 3-3 Kwantitatieve data analyseren

- **Apps**: Excel
- **Omschrijving**: Gebruik Copilot in Excel voor snelle analyses: trends herkennen, outliers signaleren, visualisaties genereren en complexe formules toelichten in gewone taal.

##### Rol Consultant

- **Context**: Co analyseert de KPI-data van het contactcenter: AHT, FCR, NPS, bezettingsgraad en verloop over de afgelopen twee jaar. Hij vraagt Copilot om trends te signaleren en afwijkingen te duiden.
- **Prompt**: Analyseer deze contactcenter KPI-data van de afgelopen 24 maanden. Toon trends in AHT, FCR en NPS. Signaleer de drie meest opvallende afwijkingen en geef mogelijke verklaringen. Maak een overzichtsgrafiek per KPI.

##### Rol Teamleider (interim)

- **Context**: Lot wil in haar eerste weken grip krijgen op de teamcijfers: bezetting, AHT, verzuim en kwaliteitsscores. Ze gebruikt Copilot om snel de meest opvallende patronen te zien zonder zelf uren in Excel te zitten.
- **Prompt**: Analyseer de KPI-data van dit klantcontactteam over de afgelopen zes maanden. Kijk naar: bezettingsgraad, AHT, verzuimpercentage en kwaliteitsscores. Welke drie trends of afwijkingen vallen op en wat kunnen mogelijke oorzaken zijn vanuit teamdynamiek of werkdruk?

#### 3-4 Thema's en patronen identificeren

- **Apps**: Copilot (app), Word
- **Omschrijving**: Vraag Copilot om grote hoeveelheden kwalitatieve input te clusteren in thema's. Ideaal na enquetes, focusgroepen of multi-stakeholder interviews.

##### Rol Consultant

- **Context**: Na een workshop met 25 medewerkers heeft Co een muur vol post-its. Hij voert de samenvattingen in en vraagt Copilot de input te clusteren in themas voor zijn diagnose-rapportage.
- **Prompt**: Cluster deze 47 observaties en ideeën uit een medewerkersworkshop in maximaal zes themas. Geef elk thema een naam, een korte beschrijving en de drie meest representatieve uitspraken als illustratie.

##### Rol Teamleider (interim)

- **Context**: Na een teamsessie heeft Lot tientallen reacties opgehaald over wat goed gaat en wat beter kan. Ze vraagt Copilot de input te ordenen zodat ze in haar volgende teamoverleg met concrete thema's aan de slag kan.
- **Prompt**: Cluster deze input uit een teamsessie in maximaal vijf thema's. Geef elk thema een pakkende naam en twee of drie representatieve uitspraken. Geef ook aan welk thema de meeste urgentie heeft op basis van de frequentie en toon van de reacties.

#### 3-5 Enquete ontwerpen

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Laat Copilot een maatwerksvragenlijst opstellen gericht op de veranderkundige diagnose of medewerkerstevredenheid, afgestemd op het clientsysteem.

##### Rol Consultant

- **Context**: Co wil de beleving van klanten meten voor en na een verbetertraject bij een zorgverzekeraar. Hij laat Copilot een korte, valide CX-enquete opstellen die ook als 0-meting dient.
- **Prompt**: Ontwerp een klanttevredenheidsenquete voor een zorgverzekeraar klantcontactcentrum. Max. 10 vragen. Meet: bereikbaarheid, oplossingsgerichtheid, vriendelijkheid en overall tevredenheid. Inclusief een NPS-vraag. Gebruik duidelijke, toegankelijke taal voor verzekerden.

#### 3-6 Diagnostisch beeld formuleren

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot om ruwe onderzoeksbevindingen om te zetten naar een helder diagnostisch memo, klaar voor bespreking met de client en opdrachtgever.

##### Rol Consultant

- **Context**: Na weken van interviews, data-analyse en documentenstudie formuleert Co het diagnostisch beeld. Hij vraagt Copilot te helpen de bevindingen samen te vatten tot een scherp, leesbaar memo voor de stuurgroep.
- **Prompt**: Schrijf een diagnostisch memo voor de stuurgroep op basis van deze onderzoeksbevindingen. Structuur: kernbevinding in één zin, de drie hoofdproblemen met onderbouwing, de onderliggende oorzaken, en wat er op het spel staat als er niet wordt ingegrepen. Maximaal twee A4.

##### Rol Teamleider (interim)

- **Context**: Na twee weken observeren, gesprekken voeren en data lezen wil Lot haar eerste bevindingen helder op papier hebben. Ze gebruikt Copilot om haar aantekeningen om te zetten naar een beknopt beeld dat ze kan delen met de opdrachtgever.
- **Prompt**: Schrijf een beknopt bevindingenmemo op basis van mijn eerste twee weken als interim teamleider. Structuur: mijn kernobservatie in één zin, drie sterke punten van het team, drie verbeterpunten met onderbouwing, en mijn voorgestelde focus voor de komende weken. Maximaal één A4.

#### 3-7 Benchmarking en sectornormen

- **Apps**: Copilot (app)
- **Omschrijving**: Zoek via Copilot (app) naar benchmarks en best practices in de sector, zodat de situatie van de client in de juiste context geplaatst kan worden.

##### Rol Consultant

- **Context**: Co wil de KPI-resultaten van haar opdrachtgever vergelijken met sectorgemiddelden voor klantcontact in de zorg. Hij zoekt benchmarks voor FCR, AHT en bereikbaarheid.
- **Prompt**: Geef benchmarkgegevens voor klantcontactcentra in de Nederlandse zorgsector. Specificeer: gemiddelde FCR (First Call Resolution), AHT (Average Handling Time), bereikbaarheidspercentage en NPS. Geef ook aan welke organisaties als best practice gelden en waarom.

#### 3-8 Capaciteitsanalyse uitvoeren

- **Apps**: Excel, Copilot (app)
- **Omschrijving**: Breng met Copilot het verschil in kaart tussen beschikbare capaciteit en het werkelijke aanbod. Identificeer pieken, onderbezetting en structurele knelpunten in de planning.

##### Rol Teamleider (interim)

- **Context**: Lot ziet dat haar team regelmatig onder druk staat maar weet niet precies waar de pijn zit. Ze gebruikt Copilot om de bezettingsdata naast het aanbod te leggen en structurele patronen te ontdekken.
- **Prompt**: Analyseer deze capaciteits- en aanboddata van een klantcontactteam. Identificeer: (1) op welke dagen en tijden de bezetting structureel tekortschiet, (2) of het een planningsprobleem of een capaciteitsprobleem is, (3) welke drie aanpassingen direct verlichting zouden geven. Presenteer de uitkomst als een overzichtelijk actieoverzicht.

### Fase 4: Oplossen & Ontwerpen

- **Korte naam**: Oplossen
- **Omschrijving**: Uitwerken van alternatieven, aanbevelingen formuleren en de veranderstrategie bepalen. De adviseur helpt de client anders naar het probleem te kijken.
- **Kleur**: #ffc043

#### 4-1 Brainstormen en alternatieven verkennen

- **Apps**: Copilot (app)
- **Omschrijving**: Gebruik Copilot (app) als denkpartner voor oplossingsrichtingen, scenario's en onconventionele aanpakken. Stel gerichte what-if-vragen.

##### Rol Consultant

- **Context**: De diagnose is helder: te hoge AHT, lage FCR en hoog verloop. Nu zoekt Co naar creatieve interventies die verder gaan dan de standaard-oplossingen. Hij gebruikt Copilot als sparringpartner.
- **Prompt**: Denk mee over oplossingen voor een klantcontactcentrum met hoge AHT, lage FCR en hoog medewerkersverloop. Geef zowel de voor de hand liggende aanpakken als drie verrassende, innovatieve alternatieven. Sluit af met de vraag welke combinatie het meeste synergie oplevert.

##### Rol Teamleider (interim)

- **Context**: Lot ziet dat het team vastloopt op dezelfde problemen maar de standaardoplossingen niet werken. Ze gebruikt Copilot als sparringpartner om verder te denken dan de voor de hand liggende ingrepen.
- **Prompt**: Denk mee over verbeteringen voor een klantcontactteam met hoog verzuim, dalende kwaliteitsscores en lage teamenergie. Geef drie voor de hand liggende aanpakken én drie verrassende alternatieven die verder gaan dan roosters en targets. Welke combinatie heeft de meeste kans van slagen bij een team dat al vaak verandering heeft meegemaakt?

#### 4-2 Veranderstrategie uitwerken

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Laat Copilot helpen bij het formuleren van een veranderstrategie: eerste, tweede of derde orde, fasering, interventievormen en verwachte weerstandspunten.

##### Rol Consultant

- **Context**: Bij een grote gemeente met sterk verkokerd management en veel weerstand bij teamleiders kiest Co bewust voor een bottom-up veranderstrategie. Hij vraagt Copilot te helpen de aanpak te beschrijven en te onderbouwen.
- **Prompt**: Beschrijf een bottom-up veranderstrategie voor de herinrichting van een gemeentelijk klantcontactcentrum. De organisatie heeft: sterk verkokerd management, betrokken medewerkers aan de basis, lage digitale volwassenheid en een recente reorganisatie. Welke interventievolgorde werkt het best en waarom?

##### Rol Teamleider (interim)

- **Context**: Lot wil in haar team een cultuurverandering doorvoeren rond eigenaarschap en kwaliteit. Ze weet dat top-down aansturen niet werkt en vraagt Copilot te helpen een aanpak te formuleren die aansluit bij de teamdynamiek.
- **Prompt**: Beschrijf een veranderstrategie voor een klantcontactteam dat meer eigenaarschap moet ontwikkelen rond kwaliteit en klantgerichtheid. Het team is gewend aan strakke sturing van bovenaf en reageert sceptisch op nieuwe initiatieven. Welke interventievolgorde werkt het best en hoe betrek ik de informele leiders in het team?

#### 4-3 Business case modelleren

- **Apps**: Excel
- **Omschrijving**: Gebruik Copilot in Excel om kosten-batenanalyses en scenario-modellen op te bouwen voor de aanbevolen oplossingen en alternatieven.

##### Rol Consultant

- **Context**: Co bouwt een business case voor de implementatie van een AI-gestuurde gespreksassistent in het contactcenter. Hij modelleert drie scenario's: minimaal, gemiddeld en ambitieus, met investering en terugverdientijd.
- **Prompt**: Bouw een business case voor AI-gespreksondersteuning in een contactcenter met 80 fte. Modelleer drie scenario's op basis van: reductie AHT (5%, 12%, 20%), verwachte FCR-stijging en kosten van implementatie. Bereken terugverdientijd per scenario.

#### 4-4 Adviesrapport schrijven

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot in Word om bevindingen, aanbevelingen en de gekozen aanpak te bundelen in een professioneel, leesbaar rapport.

##### Rol Consultant

- **Context**: Co schrijft het eindadvies voor de herinrichting van het klantcontactproces. Het rapport moet zowel de directie als de operationele teamleiders overtuigen. Hij gebruikt Copilot voor structuur en toon.
- **Prompt**: Schrijf de managementsamenvatting en het aanbevelingshoofdstuk van een adviesrapport over herinrichting van een klantcontactcentrum. Toon: overtuigend maar niet arrogant, data-onderbouwd, met oog voor de menselijke kant van verandering. Maximaal drie concrete aanbevelingen met prioritering.

#### 4-5 Aanbevelingen presenteren

- **Apps**: PowerPoint, Copilot (app)
- **Omschrijving**: Genereer een overtuigende management-presentatie in PowerPoint: diagnose, conclusies, aanbevelingen en implementatiepad.

##### Rol Consultant

- **Context**: Co presenteert haar aanbevelingen aan de RvB van een zorginstelling. Hij heeft 20 minuten. De presentatie moet de urgentie overbrengen, vertrouwen wekken en een duidelijk besluit uitlokken.
- **Prompt**: Maak een structuur voor een 20-minuten directiepresentatie met aanbevelingen voor klantcontactverbetering in een zorginstelling. Slides: opening met de kern van het probleem in een cijfer, diagnose in drie bullets, drie aanbevelingen met impact, implementatiepad, en een beslispunt aan het einde.

##### Rol Teamleider (interim)

- **Context**: Lot presenteert na zes weken haar bevindingen en verbeterplan aan de opdrachtgever. Ze heeft 30 minuten en wil draagvlak creëren voor haar aanpak zonder de organisatie te overvragen.
- **Prompt**: Maak een structuur voor een 30-minuten presentatie van mijn bevindingen en verbeterplan als interim teamleider. Slides: opening met de situatie zoals ik die aantrof, drie kernbevindingen met onderbouwing, mijn voorgestelde aanpak met concrete stappen, wat ik nodig heb van de organisatie, en een heldere volgende stap.

#### 4-6 Stakeholder- en weerstandsanalyse

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Vraag Copilot om een stakeholderanalyse te structureren: wie zijn de change-agents, wie zijn de sceptici, en welke interventies passen bij welke groep?

##### Rol Consultant

- **Context**: Voor het verandertraject bij een zorgverzekeraar brengt Co alle stakeholders in kaart: van enthousiaste IT-manager tot sceptische teamleiders en een directeur die het budget bewaakt. Hij vraagt Copilot te helpen de aanpak per groep te bepalen.
- **Prompt**: Maak een stakeholderanalyse voor een klantcontact-verandertraject bij een zorgverzekeraar. Stakeholders: directie, HR, IT, teamleiders, medewerkers contactcenter, kwaliteitsafdeling. Geef per groep: belang, invloed, verwachte houding en de beste manier om hen te betrekken of te overtuigen.

##### Rol Teamleider (interim)

- **Context**: Lot merkt dat haar verbeterinitiatieven op weerstand stuiten bij een aantal teamleden en een afdelingsmanager. Ze vraagt Copilot te helpen de belangrijkste stakeholders in kaart te brengen en per persoon de beste aanpak te bepalen.
- **Prompt**: Maak een stakeholderanalyse voor een verbetertraject binnen een klantcontactteam. Betrokkenen: opdrachtgever, afdelingsmanager, teamleden, HR en een informele leider in het team. Geef per stakeholder: hun belang, verwachte houding en de meest effectieve manier om hen te betrekken of weerstand te verminderen.

#### 4-7 Coachingsgesprek voorbereiden

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot om een coachingsgesprek voor te bereiden op basis van observaties, data en eerdere afspraken. Scherp de kernboodschap aan en bedenk de juiste vragen.

##### Rol Teamleider (interim)

- **Context**: Lot heeft een coachingsgesprek met een teamlid dat kwalitatief onderpresteert maar duidelijk potentie heeft. Ze wil het gesprek goed voorbereiden: niet confronterend, maar wel direct en oplossingsgericht.
- **Prompt**: Bereid een coachingsgesprek voor met een medewerker in een klantcontactteam die kwalitatief onderpresteert terwijl er duidelijk potentie is. Geef me: (1) een openingszin die het gesprek veilig maakt, (2) drie onderzoekende vragen om de oorzaak te achterhalen, (3) een manier om samen tot een concreet verbeterafspraak te komen. Toon: direct, warm, gericht op groei.

### Fase 5: Implementeren

- **Korte naam**: Implementeren
- **Omschrijving**: Doorvoeren van oplossingen en veranderingen bij de client. De adviseur begeleidt de uitvoering, bewaakt de voortgang en helpt weerstand te overbruggen.
- **Kleur**: #3a70bf

#### 5-1 Veranderplan uitwerken

- **Apps**: Word, Excel
- **Omschrijving**: Gebruik Copilot in Word of Excel om gedetailleerde veranderplannen te maken met activiteiten, werkvormen, faciliteiten, tijdlijn en eigenaarschap.

##### Rol Consultant

- **Context**: Co begeleidt de implementatie van een nieuw kwaliteitsmonitoringssysteem. Hij werkt het veranderplan uit met activiteiten, eigenaren, doorlooptijden en de communicatiemomenten per fase.
- **Prompt**: Maak een implementatieplan voor de uitrol van een nieuw kwaliteitsmonitoringssysteem in een contactcenter met 120 medewerkers en 8 teamleiders. Inclusief: activiteiten per fase, verantwoordelijken, tijdlijn van 12 weken, afhankelijkheden en risico's per fase.

##### Rol Teamleider (interim)

- **Context**: Lot wil de komende weken drie concrete verbeteringen doorvoeren in haar team. Ze werkt een overzichtelijk plan uit met acties, eigenaren en een realistische tijdlijn die het team niet overvraagt.
- **Prompt**: Maak een implementatieplan voor drie verbeteringen in een klantcontactteam van 18 medewerkers: (1) betere gespreksopening, (2) kortere wachttijden door slimmere bezetting, (3) meer eigenaarschap bij medewerkers op kwaliteit. Per verbetering: concrete acties, wie verantwoordelijk, tijdlijn van 6 weken en mogelijke weerstand.

#### 5-2 Communicatieplan opstellen

- **Apps**: Word, Outlook
- **Omschrijving**: Laat Copilot een communicatieplan genereren: boodschappen per doelgroep, kanalen, timing en formats. Van managementbrief tot medewerker-update.

##### Rol Consultant

- **Context**: De nieuwe werkwijze gaat live in drie weken. Co schrijft een communicatieplan dat medewerkers, teamleiders en directie op het juiste moment de juiste boodschap geeft, zonder ze te overladen.
- **Prompt**: Schrijf een communicatieplan voor de livegang van een nieuw klantcontact-werkproces. Doelgroepen: medewerkers contactcenter, teamleiders, directie. Per doelgroep: kernboodschap, kanaal, timing en wie communiceert. Zorg voor een opbouwende lijn van informatief naar activerend.

##### Rol Teamleider (interim)

- **Context**: Lot voert een nieuwe werkwijze in rond kwaliteitsfeedback. Ze wil dat medewerkers, de opdrachtgever en HR dit op het juiste moment horen, zonder dat het als een verrassing of extra druk voelt.
- **Prompt**: Schrijf een communicatieplan voor de invoering van een nieuwe feedbackwerkwijze in een klantcontactteam. Doelgroepen: medewerkers, opdrachtgever en HR. Per doelgroep: kernboodschap, kanaal, timing en toon. Zorg dat medewerkers het ervaren als iets wat hen helpt, niet als controle.

#### 5-3 Voortgangsrapportages genereren

- **Apps**: Word, Excel
- **Omschrijving**: Gebruik Copilot om periodieke voortgangsrapportages samen te stellen op basis van behaalde mijlpalen, resultaten en openstaande acties.

##### Rol Consultant

- **Context**: Co rapporteert tweewekelijks aan de stuurgroep. Hij wil een vaste structuur die de voortgang op mijlpalen, KPI-beweging en openstaande risicos compact weergeeft.
- **Prompt**: Schrijf een tweewekelijkse voortgangsrapportage voor de stuurgroep van een klantcontact-implementatietraject. Vaste structuur: status mijlpalen (RAG), KPI-beweging t.o.v. 0-meting, gerealiseerde acties, openstaande risico's, beslispunten voor de stuurgroep.

##### Rol Teamleider (interim)

- **Context**: Lot rapporteert elke twee weken aan haar opdrachtgever over de voortgang van haar opdracht. Ze wil een vaste structuur die compact is maar wel laat zien wat er écht speelt.
- **Prompt**: Schrijf een tweewekelijkse voortgangsupdate voor een opdrachtgever over mijn interim teamleider-opdracht. Structuur: wat ik deed, wat ik bereikte, wat ik tegenkwam, en wat de focus is voor de komende twee weken. Toon: direct, eigenaarschap, geen overdreven positief framing.

#### 5-4 Projectvergaderingen samenvatten

- **Apps**: Teams, Outlook
- **Omschrijving**: Copilot in Teams maakt automatisch verslagen van stuurgroep- en projectvergaderingen, inclusief actiepunten, eigenaren en deadlines.

##### Rol Consultant

- **Context**: Co leidt wekelijkse projectoverleggen met het implementatieteam van de opdrachtgever. Hij laat Copilot het verslag maken en stuurt het na afloop automatisch door via Outlook.
- **Prompt**: Maak een beknopt verslag van dit projectoverleg. Structuur: besluiten genomen, actiepunten (wie, wat, wanneer), openstaande vragen, en aandachtspunten voor het volgende overleg. Maximaal een halve A4.

##### Rol Teamleider (interim)

- **Context**: Lot leidt wekelijkse teamoverleggen en wil dat de besluiten en acties altijd helder vastgelegd worden. Ze laat Copilot het verslag maken zodat ze zelf aanwezig kan blijven in het gesprek.
- **Prompt**: Maak een beknopt verslag van dit teamoverleg. Structuur: besluiten genomen, actiepunten (wie, wat, wanneer), openstaande punten voor volgende keer. Maximaal een halve A4. Toon: feitelijk en concreet, geen notulen-taal.

#### 5-5 Trainingsmateriaal ontwikkelen

- **Apps**: Word, PowerPoint
- **Omschrijving**: Genereer trainingsscripts, handouts of workshopprogramma's met Copilot in Word en PowerPoint, afgestemd op het kennisniveau van de doelgroep.

##### Rol Consultant

- **Context**: Als onderdeel van de implementatie traint Co de teamleiders op het voeren van coachingsgesprekken op basis van de nieuwe kwaliteitsmonitoringdata. Hij maakt een workshopprogramma van een dagdeel.
- **Prompt**: Maak een workshopprogramma van een halve dag voor teamleiders in een contactcenter over het voeren van coachingsgesprekken op basis van kwaliteitsmonitoringdata. Inclusief: leerdoelen, werkvormen, tijdindeling en een oefencasus met een realistisch gespreksscenario.

##### Rol Teamleider (interim)

- **Context**: Lot wil haar team trainen op klantgericht communiceren. Ze maakt een korte, praktische sessie die direct toepasbaar is op de werkvloer, geen theorie, wel oefening.
- **Prompt**: Maak een trainingsopzet van 90 minuten voor een klantcontactteam over klantgericht communiceren. Inclusief: leerdoel, twee oefenscenario's gebaseerd op veel voorkomende gesprekken, en een reflectievraag aan het einde. Praktisch en activerend, geen PowerPoint-heavy aanpak.

#### 5-6 Werkprocessen automatiseren

- **Apps**: Copilot Studio
- **Omschrijving**: Gebruik Copilot Studio om eenvoudige automatiseringen of assistenten te bouwen die medewerkers ondersteunen bij de implementatie van nieuwe werkwijzen.

##### Rol Consultant

- **Context**: Co bouwt samen met de IT-afdeling van de opdrachtgever een eenvoudige Copilot-assistent die medewerkers helpt bij het opzoeken van veelgestelde vragen over het nieuwe werkproces.
- **Prompt**: Ontwerp de conversatiestructuur voor een interne Copilot-assistent voor medewerkers van een klantcontactcentrum. De assistent beantwoordt vragen over het nieuwe werkproces, escalatieroutes en kwaliteitsnormen. Geef voorbeelddialogen voor de drie meest voorkomende vragen.

#### 5-7 Stakeholder-updates draften

- **Apps**: Outlook, Copilot (app)
- **Omschrijving**: Laat Copilot in Outlook gerichte statusupdates opstellen voor verschillende stakeholdergroepen, afgestemd op hun betrokkenheid en informatiebehoeften.

##### Rol Consultant

- **Context**: Na een lastige week met vertraging in de IT-implementatie stuurt Co een eerlijke maar geruststellende update naar de directie. Hij vraagt Copilot te helpen de toon goed te krijgen: transparant, professioneel en oplossingsgericht.
- **Prompt**: Schrijf een stakeholder-update mail aan de directie over een twee weken vertraging in de IT-implementatie van het klantcontact-verbetertraject. Toon: transparant over de oorzaak, professioneel in de analyse, concreet over de herstelstappen en bijgestelde planning. Geen excuses, wel eigenaarschap.

##### Rol Teamleider (interim)

- **Context**: Het gaat minder goed dan verwacht in het team en Lot wil de opdrachtgever proactief informeren. Ze vraagt Copilot te helpen de boodschap eerlijk maar constructief te formuleren.
- **Prompt**: Schrijf een update mail aan mijn opdrachtgever over een tegenvaller in mijn interim opdracht: de beoogde verbetering in kwaliteitsscores blijft achter. Toon: eerlijk over de oorzaak, eigenaarschap voor mijn rol daarin, concreet over wat ik ga aanpassen. Geen excuses, wel een helder plan.

#### 5-8 Functioneringsgesprek voorbereiden

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot om een functioneringsgesprek voor te bereiden op basis van observaties, KPI-data en eerdere afspraken. Structureer de kernpunten en formuleer concrete ontwikkelafspraken.

##### Rol Teamleider (interim)

- **Context**: Lot heeft functioneringsgesprekken met haar teamleden. Ze wil per medewerker een goed voorbereide structuur hebben, niet te formeel, maar wel gericht op groei en concrete afspraken.
- **Prompt**: Maak een gespreksstructuur voor een functioneringsgesprek met een medewerker in een klantcontactteam. Onderdelen: (1) terugblik op afspraken en prestaties, (2) wat gaat goed en waarom, (3) één ontwikkelpunt met concrete actie, (4) afspraken voor de komende periode. Toon: gelijkwaardig, direct en gericht op groei, geen beoordelingsgesprek-sfeer.

### Fase 6: Evalueren & Afronden

- **Korte naam**: Evalueren
- **Omschrijving**: Afsluiting, rapportage en reflectie. De adviseur en client kijken terug op de opdracht, evalueren de resultaten en borgen kennis voor de toekomst.
- **Kleur**: #38845e

#### 6-1 Eindrapport opstellen

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot in Word om een professioneel eindrapport te genereren: uitgevoerde activiteiten, behaalde resultaten, conclusies en aanbevelingen voor de toekomst.

##### Rol Consultant

- **Context**: Het traject zit erop. Co schrijft het eindrapport dat zowel terugkijkt op de behaalde resultaten als vooruitkijkt naar de borging. Het rapport moet ook dienen als intern document voor de opdrachtgever.
- **Prompt**: Schrijf de structuur en de managementsamenvatting van een eindrapport voor een klantcontact-verbetertraject bij een zorgverzekeraar. Terugblik: wat is bereikt, welke KPIs zijn verbeterd en met hoeveel. Vooruitblik: borgingsmaatregelen en aanbevelingen voor doorontwikkeling.

#### 6-2 Evaluatie-enquete verwerken

- **Apps**: Excel, Copilot (app)
- **Omschrijving**: Laat Copilot klanttevredenheidsdata analyseren en samenvatten. Identificeer patronen in feedback en formuleer concrete verbeterpunten voor volgende opdrachten.

##### Rol Consultant

- **Context**: Na afronding heeft Co een klantmeting gehouden (n=340). Hij analyseert de resultaten en vergelijkt ze met de 0-meting aan het begin van het traject. Copilot helpt de verbeteringen te kwantificeren en te duiden.
- **Prompt**: Analyseer de resultaten van deze klanttevredenheidsmeting (n=340) en vergelijk ze met de 0-meting van 6 maanden geleden. Kwantificeer de verbeteringen per dimensie (bereikbaarheid, oplossingsgerichtheid, NPS). Geef een conclusie over de impact van het verbetertraject.

#### 6-3 Slotpresentatie maken

- **Apps**: PowerPoint, Copilot (app)
- **Omschrijving**: Genereer een slotpresentatie voor de stuurgroep met bereikte resultaten, learnings en aanbevelingen voor vervolgstappen.

##### Rol Consultant

- **Context**: Co sluit het traject af met een presentatie voor de stuurgroep. Hij wil afsluiten op een hoog, maar ook een duidelijk beeld geven van de volgende fase die de opdrachtgever zelf kan oppakken.
- **Prompt**: Maak een structuur voor een afsluitende stuurgroeppresentatie voor een klantcontact-verbetertraject. Slides: 1) wat hebben we bereikt in cijfers, 2) de drie meest impactvolle veranderingen, 3) wat we onderweg hebben geleerd, 4) de borging: wie doet wat na vandaag, 5) aanbeveling voor de volgende stap.

##### Rol Teamleider (interim)

- **Context**: Lot sluit haar interim opdracht af met een presentatie voor de opdrachtgever. Ze wil de behaalde resultaten laten zien, maar ook eerlijk zijn over wat er nog niet af is en hoe de organisatie zelfstandig verder kan.
- **Prompt**: Maak een structuur voor een afsluitende presentatie van mijn interim teamleider-opdracht. Slides: 1) hoe ik het team aantrof, 2) wat we samen hebben bereikt in cijfers en gedrag, 3) wat ik heb achtergelaten aan structuur en afspraken, 4) aandachtspunten voor de volgende leidinggevende, 5) mijn persoonlijk advies aan de organisatie.

#### 6-4 Lessons learned documenteren

- **Apps**: OneNote, Word
- **Omschrijving**: Gebruik Copilot in OneNote of Word om de lessons learned te structureren: wat werkte goed, wat anders, methodische en relationele inzichten.

##### Rol Consultant

- **Context**: Co documenteert de lessons learned van het traject voor intern gebruik bij Coniche. Hij wil de kennis over klantcontact in de zorg borgen en beschikbaar maken voor collega-consultants.
- **Prompt**: Structureer de lessons learned van een klantcontact-verbetertraject bij een zorginstelling voor intern gebruik door een adviesbureau. Categoriseer per: methodiek (wat werkte goed), klantrelatie (wat hebben we geleerd over de opdrachtgever), sector-inzichten (wat is specifiek voor zorg) en persoonlijke groei.

##### Rol Teamleider (interim)

- **Context**: Lot schrijft voor zichzelf en voor Coniche op wat ze heeft geleerd van deze opdracht. Wat werkte, wat niet, en wat ze een volgende keer anders zou doen.
- **Prompt**: Structureer mijn lessons learned van een interim teamleider-opdracht van 12 weken. Categoriseer per: aanpak (wat werkte goed), teamdynamiek (wat heb ik geleerd over dit team en deze organisatie), sector-inzichten (wat is specifiek voor deze context) en persoonlijke groei als leidinggevende.

#### 6-5 Kennisoverdracht borgen

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Laat Copilot helpen bij het opstellen van draaiboeken of handleidingen zodat de clientorganisatie zelfstandig verder kan met de nieuwe werkwijzen.

##### Rol Consultant

- **Context**: Co zorgt dat de opdrachtgever na afloop zelfstandig verder kan. Hij schrijft een beheersdraaiboek voor het nieuwe klantcontactproces en een handleiding voor de KPI-monitoring.
- **Prompt**: Schrijf een beheershandleiding voor teamleiders in een klantcontactcentrum na afronding van een verbetertraject. Beschrijf: hoe KPIs wekelijks te monitoren, wanneer te escaleren, hoe coachingsgesprekken te voeren op basis van data, en hoe het verbeterproces levend te houden.

##### Rol Teamleider (interim)

- **Context**: Lot wil ervoor zorgen dat alles wat ze heeft opgebouwd niet verdwijnt als ze vertrekt. Ze schrijft een overdrachtshandleiding voor haar opvolger of de vaste leidinggevende.
- **Prompt**: Schrijf een overdrachtshandleiding voor mijn opvolger als teamleider van een klantcontactteam. Beschrijf: de huidige staat van het team, lopende verbeteracties en wie de trekker is, afspraken die ik heb gemaakt met individuele medewerkers, aandachtspunten in de teamdynamiek en mijn advies voor de eerste weken.

#### 6-6 Nazorg en relatiebeheer

- **Apps**: Outlook
- **Omschrijving**: Gebruik Copilot in Outlook om gepersonaliseerde follow-up berichten te sturen na afronding. Onderhoud de langetermijnrelatie met de client.

##### Rol Consultant

- **Context**: Drie maanden na afronding stuurt Co een persoonlijke check-in naar de contactpersoon bij de opdrachtgever. Hij vraagt Copilot een warme, authentieke mail te schrijven die de relatie onderhoudt zonder salesy te zijn.
- **Prompt**: Schrijf een drie-maanden follow-up mail aan een opdrachtgever na afronding van een klantcontact-verbetertraject. Toon: warm, persoonlijk, oprecht geinteresseerd. Vraag naar de stand van de KPIs en of de nieuwe werkwijze beklijft. Geen verkoopboodschap. Sluit af met een concrete aanbieding om te helpen als er vragen zijn.

##### Rol Teamleider (interim)

- **Context**: Lot is klaar met haar opdracht en wil het contact warm houden met haar opdrachtgever. Ze vraagt Copilot een persoonlijke afscheidsmail te schrijven die de deur openhoudt voor een volgende keer.
- **Prompt**: Schrijf een afscheidsmail aan mijn opdrachtgever na afronding van mijn interim opdracht als teamleider. Toon: warm, persoonlijk en professioneel. Blik kort terug op wat we samen hebben bereikt, bedank het team en de opdrachtgever, en houd de deur open voor toekomstig contact zonder dat het als acquisitie voelt.

##### Rol Salesmanager

- **Context**: Een opdracht van Co is afgerond. Piet stuurt drie maanden later een check-in naar de opdrachtgever om de relatie warm te houden en te peilen of er nieuwe behoeften zijn.
- **Prompt**: Schrijf een drie-maanden check-in mail aan een opdrachtgever na afronding van een adviestraject door Coniche. Toon: persoonlijk, oprecht geïnteresseerd in hoe het nu gaat. Vraag naar de stand van zaken zonder direct te pushen op nieuwe opdrachten. Eindig met een laagdrempelig aanbod om te sparren als er iets speelt.

#### 6-7 Klantcase beschrijven

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot om een afgeronde opdracht om te zetten naar een scherpe klantcase die Coniche kan gebruiken in pitches, op de website of in offertes.

##### Rol Salesmanager

- **Context**: De opdracht van Co bij een zorgverzekeraar is succesvol afgerond. Piet wil er een referentieverhaal van maken dat hij kan inzetten bij vergelijkbare prospects.
- **Prompt**: Schrijf een klantcase op basis van deze projectinformatie. Structuur: (1) de situatie bij de klant in twee zinnen, (2) wat Coniche deed in drie bullets, (3) het resultaat in concrete cijfers of verandering, (4) een quote-waardig inzicht of les. Toon: concreet, bescheiden, geloofwaardig. Geen reclamefeer.

#### 6-8 Referentiegesprek voorbereiden

- **Apps**: Copilot (app)
- **Omschrijving**: Gebruik Copilot om een gesprek voor te bereiden waarbij je een tevreden klant vraagt om een referentie of testimonial voor Coniche.

##### Rol Salesmanager

- **Context**: Piet belt een opdrachtgever die erg tevreden was over de opdracht van Lot. Hij wil vragen of ze bereid zijn als referentie op te treden maar wil het gesprek niet ongemakkelijk laten worden.
- **Prompt**: Bereid een gesprek voor waarbij ik een tevreden opdrachtgever vraag om referentie voor Coniche. Geef me: (1) hoe ik het gesprek open zonder meteen te vragen, (2) een natuurlijke manier om de vraag te stellen, (3) wat ik concreet vraag: een quote, een case, een gesprek met een prospect of een LinkedIn-aanbeveling.

#### 6-9 CV updaten met opgedane ervaring

- **Apps**: Word, Copilot (app)
- **Omschrijving**: Gebruik Copilot om de afgesloten opdracht goed te verwoorden op je CV. Vertaal je werkzaamheden naar concrete resultaten en scherpe taal.

##### Rol Teamleider (interim)

- **Context**: Lot heeft haar opdracht afgerond en wil haar CV bijwerken voordat ze aan de volgende start. Ze wil de opdracht concreet en resultaatgericht beschrijven, niet wat ze deed, maar wat ze bereikte.
- **Prompt**: Schrijf een CV-omschrijving voor mijn afgesloten interim teamleider-opdracht. Vermeld: de organisatie en sector, de duur, mijn opdracht in één zin, en drie concrete resultaten of bijdragen die ik heb geleverd. Toon: actief, resultaatgericht, geen functieomschrijving-taal. Maximaal vijf regels.

## Open punten

- Welke use cases meetellen als stap in de fasestrook (`adviesverloop.md`, De fasestrook). In deze lijst staan er per fase tussen de 7 en 10.
- Welke use cases bij welke bouwsteen of klasse worden voorgesteld. De bron kent die koppeling niet.
- Use cases voor Lot (Teamleider) en Piet (Salesmanager) ontbreken bij een aantal use cases. De Consultant vult de prompt dan zelf in.
- Use cases die over de eigen werkzaamheden van Coniche gaan, zoals Offerte genereren, CV aanscherpen en Klantcase beschrijven, horen misschien niet bij het adviesverloop van een Meting.