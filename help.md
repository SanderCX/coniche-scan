# Coniche Scan: Help

Sander vroeg om een overzichtelijke helppagina die de werking van alle onderdelen beschrijft, in een variant voor de Respondent en Lead en een voor de Admin en Consultant, met plaatje en praatje.

## Wat het is

Een helppagina binnen de app waarop elke rol leest hoe de onderdelen werken die voor die rol bestaan. De Help is geen kopie van de specs. De specs zijn voor bouwers geschreven en bevatten bouwstatus, open punten en namen van instellingen. De Help is in gewone taal voor de gebruiker. De korte tekst achter een Info-icoon blijft zoals hij is (`stylesheet.md`, Info-icoon). De Help geeft de langere uitleg met een illustratie, en een Info-icoon kan later naar het bijbehorende onderwerp verwijzen (Open punten).

## Plek in de app

Een regel "Help" in het menu rechtsboven, op de bestaande menu's. Het ontwerp toont de menu's vereenvoudigd. De regels hieronder volgen de bestaande opbouw.

- **Admin en Consultant.** In het Accountmenu (`beheerpagina.md`, Accountmenu) staat Help na "Mijn account" en, voor een Admin, na "Instellingen". De scheidingslijn boven "Uitloggen" blijft staan.
- **Respondent en Lead.** In het menu "Mijn gegevens" (`schermen.md`, Mijn gegevens-menu) staat Help tussen "Gegevens bekijken/bewerken" en "Uitloggen".
- **Zonder menu.** Op de publieke schermen en de intake is er geen menu en dus geen Help (Open punten).
- **Pagina.** De Help opent als een eigen pagina met de gewone navigatiebalk, geen modal. Het logo en de exit-actie van de navigatieregel (`schermen.md`, Globale layout) blijven werken zoals op elke andere pagina. Het kruimelpad is Help › {onderwerp}.
- **Toetsenbord en toegankelijkheid.** Zoals de Dropdown-knop in `stylesheet.md`. De illustraties hebben een tekstalternatief (Illustraties).

## Rol en inhoud

De rol bepaalt welke onderwerpen er zijn. Een onderwerp dat de gebruiker niet kan gebruiken, staat niet in de inhoudsopgave en is ook niet te openen met de directe link.

| Onderwerpgroep | Respondent | Lead | Consultant | Admin |
|---|---|---|---|---|
| Beginnen (hoe de scan werkt, invullen, hervatten) | Ja | Ja | Ja | Ja |
| Je resultaten (Mijn metingen, resultaten lezen) | Ja | Ja | Ja | Ja |
| Voor Leads (resultaten van de Organisatie, spreiding, benchmark en vergelijking) | Nee | Naar toegang | Nee | Nee |
| Scans en Metingen (aanmaken, Respondenten, onderdelen, samengestelde Meting) | Nee | Nee | Ja | Ja |
| Resultaten voor beheer (resultaten van een Meting, Leads toegang geven) | Nee | Nee | Ja | Ja |
| Verkennen en Benchmarks | Nee | Nee | Nee | Ja |
| Instellingen (Gebruikers, drempels en termijnen, teksten) | Nee | Nee | Nee | Ja |

- **Lead naar toegang.** Een Lead ziet alleen de onderwerpen over wat hij kan openen. Heeft hij Resultaten, dan ziet hij de uitleg over resultaten van zijn Organisatie. Heeft hij het vinkje voor Spreiding, voor Antwoorden of voor een benchmark, dan ziet hij ook dat onderwerp (`beheerpagina.md`, punt 6a). Wat de Admin voor hem niet heeft aangezet, staat er niet.
- **Respondent.** Een Respondent ziet Beginnen en Je resultaten, voor zover hij resultaten kan zien.
- **Consultant.** Dezelfde pagina als een Admin, zonder de onderwerpen die alleen een Admin ziet. In de inhoudsopgave van een Admin staat bij die onderwerpen het label "Admin", zodat de Admin weet dat een Consultant ze niet ziet.
- **Rol uit de sessie.** De rol en de toegang komen uit de sessie op de server. De pagina bepaalt dat niet in de browser. Er komt geen nieuw recht in de rechtenmatrix. Elke herkende gebruiker kan de Help openen, en de inhoud volgt de rol.

## Opbouw van de pagina

- **Zijbalk.** Links een zoekveld ("Zoek in de help") en de inhoudsopgave, gegroepeerd per onderwerpgroep met de groepsnaam als kop in kleine hoofdletters. Het open onderwerp is gemarkeerd. Onder de inhoudsopgave staat een zin over wat de gebruiker wel en niet ziet, bij een Lead en Respondent "Je ziet alleen uitleg over wat je zelf kunt gebruiken", bij een Admin en Consultant "Een Consultant ziet de onderdelen met het label Admin niet".
- **Artikel.** Rechts van de zijbalk staat één onderwerp, in een kolom van maximaal 780 pixels. De opbouw is altijd gelijk.
  1. Een regel Help met een badge voor de rol (bijvoorbeeld "Respondent en Lead" of "Admin").
  2. De titel en daaronder één alinea die zegt waar het onderwerp over gaat.
  3. De kaart "In het kort" met twee tot vier zinnen.
  4. De illustratie in een kaart met een kop, het label "Voorbeeld met voorbeelddata" en, waar nodig, een legenda. Heeft het onderwerp een film (Films), dan staat die in een eigen kaart vóór de illustratie, onder "In het kort".
  5. Een kop "Wat je ziet" of "Wat elke keuze doet" met een genummerde lijst. De nummers staan ook als markering in de illustratie, zodat tekst en plaatje bij elkaar horen.
  6. Optioneel een voorbeeld uit de praktijk in een kaart.
  7. Optioneel een kader "Let op" voor een grens, een uitzondering of een gevolg dat de gebruiker moet weten.
  8. "Zie ook" met een tot drie verwijzingen naar andere onderwerpen.
- **Breedte.** De pagina is vloeiend en werkt op de breedte van de rest van de app. De zijbalk stapelt boven het artikel bij een smal scherm.
- **Zoeken.** Het zoekveld filtert de inhoudsopgave op titel en tekst van de onderwerpen die de gebruiker mag zien, zonder paginavernieuwing. De eerste versie zoekt in de browser op de teksten die al zijn opgehaald.
- **Kleuren.** Zoals `stylesheet.md`. De illustraties gebruiken de kleuren per categorie en de klassekleuren uit `CLAUDE.md`, sectie 2.

## Inhoud

De inhoud staat als Markdown-bestanden in de repo, in de map `help/`. Een onderwerp is één bestand. De app leest ze bij het bouwen in en toont alleen de onderwerpen die de rol mag zien.

- **Bestandsnaam.** Kort en in kleine letters, bijvoorbeeld `resultaten-lezen.md` en `verkennen.md`.
- **Kopgegevens bovenaan het bestand.**
  - `titel`: De titel van het onderwerp.
  - `groep`: De onderwerpgroep uit Rol en inhoud.
  - `volgorde`: Een getal binnen de groep.
  - `rollen`: De rollen die het onderwerp zien, uit Respondent, Lead, Consultant en Admin.
  - `toegang`: Alleen bij Lead. De toegang die hij nodig heeft, bijvoorbeeld `resultaten`, `spreiding`, `antwoorden` of `benchmark`.
  - `afbeelding`: De naam van het SVG-bestand in `help/afbeeldingen/`, of leeg.
  - `film`: De naam van de film (Films), of leeg.
  - `bronnen`: De specs waaruit het onderwerp volgt, bijvoorbeeld `visualisatie-verkennen.md`.
  - `bijgewerkt`: De datum van de laatste inhoudelijke wijziging.
- **Tekst.** De vaste koppen uit Opbouw van de pagina staan als koppen in het bestand, in die volgorde. De genummerde lijst in het bestand heeft dezelfde nummers als de markeringen in de afbeelding.
- **Taal.** Nederlands. De Help is in de eerste versie niet vertaald.
- **Controle bij het bouwen.** Bij het bouwen controleert een script dat de kopgegevens kloppen, dat de bronnen bestaan, dat de afbeelding aanwezig is en dat elke rol hoogstens verwijst naar onderwerpen die ze mag zien.

## Schrijfregels

- **Aanspreken.** Je-vorm.
- **Termen.** Zoals `CLAUDE.md`, Terminologie: Organisatie, Meting, Respondent, Ingevulde scan. De woorden in de interface zijn leidend, dus "Bouwsteen" en niet "Bouwblok".
- **Geen bouwdetails.** Geen bouwstatus, geen open punten, geen namen van instellingen in code (`benchmarkMinScans`). Een grens die een Admin kan aanpassen, staat als "de grens bij Instellingen, onder Drempels en termijnen", met het getal waar dat een Respondent of Lead helpt. Een getal dat in de app aanpasbaar is, zet de Help niet vast in tekst die achterloopt. Staat het getal wel in de tekst, dan is het de beginwaarde en zegt de zin dat de Admin die kan aanpassen.
- **Lengte.** Eén onderwerp per bestand, op één scherm te lezen. Elke genummerde regel is één tot drie zinnen.
- **Getallen.** Met een decimale komma (3,5). Datums als dd-mm-jjjj.
- **Schrijfstijl.** Zoals de andere specs: Geen gedachtestreepjes, na een dubbele punt een hoofdletter, en weinig retorische figuren.
- **Geen klantgegevens.** Voorbeelden gebruiken voorbeelddata en verzonnen namen, nooit echte Organisaties of Respondenten.

## Illustraties

- **Eén illustratie per onderwerp**, een SVG in `help/afbeeldingen/`. Geen screenshots, omdat die bij elke aanpassing van de app verouderen.
- **Bron.** De illustratie is een vereenvoudigde tekening van het scherm, afgeleid van de ontwerpen in Claude Design, met voorbeelddata. Het label "Voorbeeld met voorbeelddata" staat erbij.
- **Markeringen.** Een donkere cirkel met een nummer, met dezelfde nummers als de lijst eronder. De markering ligt naast het onderdeel en niet erover.
- **Opmaak.** Zoals `stylesheet.md`. Getallen in de illustratie volgen de decimale komma.
- **Toegankelijkheid.** Een tekstalternatief dat zegt wat de illustratie laat zien, en tekst met voldoende contrast.
- **Bijwerken.** Verandert een scherm dat in een illustratie staat, dan wordt de illustratie mee aangepast (Actueel houden).

## Films

Een film is een korte bewegende uitleg bij een onderwerp. Hij is een toevoeging en nooit de enige plek waar iets staat. Alles wat de film laat zien, staat ook in gewone tekst op dezelfde pagina, zodat het ook leesbaar is voor wie de film niet ziet of niet wil afspelen.

- **Twee films in de eerste versie.**
  - **Wat krijg ik** (16 seconden), voor Respondent en Lead. Hij staat in Help in het onderwerp "Je resultaten lezen" en op de Assessment-pagina (`schermen.md`). De film laat drie stappen zien. Eerst beantwoordt een Respondent een voorbeeldvraag met een score van 1 tot 5. Dan verschijnt direct het resultaat, met de totaalscore en de score per categorie als staven. Als laatste komen bij elke categorie de stip met het gemiddelde van de groep en de grijze lijn van de laagste tot de hoogste score erbij, met een legenda. Dat laatste is wat een Lead extra ziet (`visualisatie-scores.md`, onderdeel A, Drempel).
  - **De Meetperiode kiezen** (12 seconden), voor Admin en Consultant. Hij staat in Help in het onderwerp "Verkennen". De film laat zien hoe de keuze bij Meetperiode van "Meest recente" naar "Periode" gaat, hoe de twee datums erbij komen en hoe het aantal Organisaties in de pool daalt van 38 naar 32 van de 44.
- **Varianten van Wat krijg ik per Assessment-type (design `Film-AI` en `Film-Quickscan` in `Claude outputs/resultaatkop/`).** De film heeft dezelfde opbouw, maten en drie stapkaarten voor elk type, met de kleuren en eenheden van dat type. Het gaat om het eindbeeld (stap 3), de vulling van de ring en de rijen. Toont een film bij de AI-scan de antwoordopties van een vraag (stap 1), dan staan die onder elkaar, zoals in de echte vragenlijst (`stylesheet.md`, Doorloopflow), en nooit naast elkaar. Dit geldt voor alle films van de AI-scan. De Spanningsmeter heeft in de vragenlijst ronde knoppen naast elkaar (`visualisatie-spanningsmeter.md`, Antwoordkeuze), dus daar staan ze in de film ook naast elkaar:
  - **Klantcontact Volwassenheid**: Zoals hierboven beschreven, vijf categorieën in hun eigen kleur, ring 3,4.
  - **Zorgscan**: Dezelfde film als Klantcontact Volwassenheid (dezelfde vijf categorieën), met de weging erbij, want de Zorgscan weegt drie bouwstenen dubbel (`content-zorgscan.md`, Weging: Bouwsteen 4, 10 en 11). Onder de klassenaam bij de ring staat een regel van 12px in `--ink-s`: "Drie bouwstenen tellen 2× mee". Stapkaart 2 eindigt met "Bouwstenen die zwaarder meetellen, tonen hun factor, zoals 2×." Het aantal komt uit de gewichten van de Assessment, de film noemt geen namen van bouwstenen. Een Assessment zonder gewichten ongelijk aan 1 toont deze regel en zin niet.
  - **AI-scan**: Geen categorieën, dus acht rijen, een per domein, in volgorde 1 tot en met 8. Voor elke naam staat de nummercirkel van het domein (22px, 11px, gewicht 700, rand in de domeinkleur, `stylesheet.md`, Groepskleuren) en de staaf heeft de domeinkleur. De rijen zijn 36px hoog. Ring 2,5 met de klasse Uitbouwen en vulling tot (2,5 − 1) / 4, in de volle kleur van de afgeronde score (3, geel). De klassegrenzen 2,5 en 3,5 staan als stippellijn door de rijen. Stapkaart 2: "Direct daarna zie je je resultaat: De totaalscore en een staaf per domein." Voorbeelddata: Strategie en governance 2,8, Data, integratie en architectuur 2,4, Use-cases en automatisering 2,0, Performance, monitoring en kwaliteit 2,0, Mensen, skills en adoptie 2,4, Security, risk en compliance 3,6, Operating model en schaalbaarheid 2,2 en Klant- en kanaalervaring 2,2, met groepsgemiddelden van 3,9, 3,8, 3,4, 3,4, 3,8, 4,0, 3,7 en 3,4.
  - **Quickscan (Ja / Nee / Weet ik niet)**: Percentages in plaats van scores van 1 tot 5. Ring 58% met de klasse "Gemiddeld ontwikkeld" (de klassenamen van de totaalscore, `content-ziekenhuis-quickscan.md`) en vulling tot 58%, in de klassekleur (oranje). Vier rijen, een per afdeling (Poliklinieken, Verpleegafdelingen, Receptie / Centrale, Patiëntenservice), zonder nummercirkel, 52px hoog, de staaf in de klassekleur van de afdeling (groen vanaf 80%, oranje van 50% tot 80%, rood eronder, `--stat-green`, `--stat-amber`, `--stat-red`) en stippellijnen op 50% en 80%. De waarde achter de staaf is een percentage. Stapkaart 1: "Je beantwoordt een vraag met Ja, Nee of Weet ik niet." Stapkaart 2: "Direct daarna zie je je resultaat: Het totaalpercentage en een staaf per afdeling." Legenda: "Gemiddelde van de groep" en "Laagste tot hoogste percentage". Voorbeelddata: 85%, 64%, 47% en 36% voor de afdelingen, met groepsgemiddelden van 72%, 70%, 58% en 52%. Afdelingen die niet van toepassing zijn komen in de film niet voor.
  - **Spanningsmeter (`visualisatie-spanningsmeter.md`, Film Wat krijg ik)**: Zes rijen, een per spanningsveld, met het nummerbolletje van het veld en een balk; daarna de radar met de eigen lijn; daarna de band van de groep met de ring om de grootste spanning. De stapzinnen wijken af van de andere types en stap 3 noemt het groepsbeeld in plaats van de drempelzin.
  - **Stap 3 voor alle types** is dezelfde zin: "Een Lead ziet er het gemiddelde en de spreiding van de groep bij, zodra er genoeg scans zijn." De drempel staat ook hier niet in de film (zie Drempel in de film).
- **Films over de radar (design `Film-Radar-rapport` en `Film-Dossier` in `Claude outputs/resultaatkop/`).** Twee films met dezelfde opbouw als Wat krijg ik (16 seconden, drie stapkaarten, pauzeknop, `Voorbeeld met voorbeelddata`):
  - **De radar in je resultaten**, voor Respondent en Lead. Hij staat in Help in het onderwerp "Je resultaten lezen", na Wat krijg ik. Stap 1: Je ziet je score per bouwsteen in de radar en per categorie in het staafdiagram. Stap 2: De cursor gaat over bouwsteen 4 ("Leren uit klantcontact"): Het knooppunt, de taartpunt en de score-stip lichten op, de balk van de categorie krijgt een ring van 3px en de andere balken dimmen, en de tooltip staat buiten de radar ("4 · Leren uit klantcontact", "2,3 · Basis op orde"). Stap 3: De cursor gaat over de balk Mens: Bouwstenen 11 tot en met 14 lichten op in de radar en de tooltip staat boven de balk ("Mens", "3,7 · Sterk punt"). De regels van de hover staan in `stylesheet.md`, Radar en staafdiagram op het resultaatscherm, Hover tussen radar en staafdiagram.
  - **Het dossier lezen**, voor de Lead. Hij staat in Help in het onderwerp "Het dossier lezen" (voor een Lead) en op de pagina Dossier (`dossier.md`, Dossier lezen). Stap 1: De radar toont alleen actieve knooppunten voor bouwstenen waar items bij staan (4, 7 en 13), met rechts de lijst met bouwstenen. Stap 2: Een klik op bouwsteen 7 toont de filterbalk ("Systemen & Tools", "2 items in dit dossier") en laat alleen de items bij die bouwsteen staan: Een case en een nieuwsbericht. Stap 3: Een klik op "Alle items tonen ×" haalt het filter weg. De voorbeelditems bevatten geen naam van een Organisatie. De film toont onder de lijst ook de regel met de bron van de scores ("Scores uit de meting … van oktober 2026") met de link "Bekijk de meting" (`dossier.md`, Bron van de scores), zodat de Lead ziet dat de cijfers uit een meting komen. De lijst rechts van de radar heeft de opmaak uit `dossier.md` (Verdeling rechts van de radar). De kaart heeft de warme achtergrond met rand, de kop "Waar dit dossier over gaat" en de zin over het kiezen van een bouwsteen staan rechts boven de rijen, en elke rij is een witte kaart met een cirkel in de categoriekleur, de slanke balk met stip, de score en de klasse. De rijen staan op laagste score: 7 (2,2), 4 (2,3) en 13 (4,1). De legenda met de drie klassen staat horizontaal onder de rijen, zonder aswaarden. De gekozen bouwsteen 7 staat daardoor bovenaan de lijst.
  - **AI-variant van de Dossier-film (ontwerp `Film-Dossier-AI`).** Op de landingspagina van de AI-scan staat dezelfde film met een radar van 8 taartpunten van 45° in de domeinkleuren (`visual-bouwstenen-en-domeinen.md`). Alleen de domeinen met items in het Dossier (3, 5 en 6 in het voorbeeld) zijn gevuld en klikbaar. De teksten spreken van "domein" in plaats van "bouwsteen". De lijst heeft dezelfde opmaak als in de film voor de Klantcontact Volwassenheid, met de rijen 3 (2,0), 5 (2,4) en 6 (3,6) op laagste score. Alleen de cirkel van 5 heeft een donker nummer (op geel), de andere hebben een wit nummer. De radar op de landingspagina heeft dezelfde scores als de film (`visual-bouwstenen-en-domeinen.md`, Voorbeeldscores). De eerste film (Wat krijg ik) noemt "een staaf per domein" in plaats van "per categorie".
  - **Op de open pagina's.** In de sectie "Wat krijg ik" van de Assessment-pagina's (`schermen.md`) staan Wat krijg ik van het type en daaronder "Het dossier, de radar voor de Lead" (bij de Quickscan alleen Wat krijg ik, want die heeft geen bouwstenen met een radar). De film "De radar in je resultaten" staat daar niet (open punt, `CLAUDE.md`, sectie 5).
- **Een film per onderwerp, kort.** Meer films komen alleen als een onderwerp er duidelijk beter van wordt. Elke film heeft eigen voorbeelddata en laat nooit echte Organisaties of Respondenten zien.
- **CSS-animaties**, geen video. De film gebruikt dezelfde kleuren, balken en componenten als de app, zodat hij meeverandert met de stylesheet. Getallen hebben een decimale komma.
- **Stapkaarten.** Onder de film staan altijd drie of vier kaarten met een nummer en één zin per stap. Het nummer van de stap die loopt, is oranje en de kaart krijgt een oranje rand. De kaarten zijn ook het tekstalternatief. Een film zonder stapkaarten is niet af.
- **Pauzeknop.** Rechtsboven in de kaart staat een knop "Pauzeer" die wisselt naar "Afspelen". De film start vanzelf en herhaalt zichzelf. De knop is bereikbaar met het toetsenbord.
- **Verminderde beweging.** Staat in het systeem de voorkeur voor verminderde beweging aan, dan staat de film stil op het eindbeeld (bij Wat krijg ik het resultaat met de groep) en blijft de pauzeknop weg.
- **Tekstalternatief.** De film heeft een beschrijving voor schermlezers die zegt wat er gebeurt, in een of twee zinnen.
- **Label.** Boven de film staat "Voorbeeld met voorbeelddata" met de duur.
- **Ring** (een ring met een vulling tot (3,4 − 1) / 4). De ring in de film heeft de volle kleur van de afgeronde score (`stylesheet.md`, Drie niveaus van scorekleur). Het voorbeeldtotaal 3,4 rondt af op 3 en is dus geel (`--score-3`).
- **Drempel in de film.** De film toont de stip en de lijn van de groep zonder getal voor het minimum. De stapkaart zegt dat een Lead gemiddelde en spreiding ziet zodra er genoeg scans zijn. De grens is een instelling die een Admin kan aanpassen (beginwaarde 5, `visualisatie-scores.md`, onderdeel A), en de Help zet dat getal dus niet in de film. Het kader "Let op" bij "Je resultaten lezen" noemt de beginwaarde.
- **Op de Assessment-landingspagina.** De film staat in de sectie "Wat krijg ik", tussen "Praktisch" en de afsluitende Visie (volgorde van), met dezelfde stapkaarten en daaronder de knop "Bekijk de voorbeeld-output" naar de Voorbeeld-output. Alle cijfers in de film zijn voorbeelddata, en dat staat er ook bij. In Help staat de film zonder die knop.
- **Waar niet.** Er is geen film voor de Respondent die een scan invult. Daar loopt niets af waar een film bij helpt.

## Eerste set onderwerpen

De eerste versie bevat de onderwerpen hieronder. Twee ervan zijn in het ontwerp uitgewerkt, elk met een film, en dienen als voorbeeld voor de rest. De andere schrijft Claude Code op basis van de specs, waarna Joost de inhoud beoordeelt.

- **Respondent en Lead.** Zo werkt de scan, Een scan invullen, Verder waar je was gebleven, Mijn metingen (`visualisatie-mijn-metingen.md`), **Je resultaten lezen** (uitgewerkt, `visualisatie-scores.md`, onderdeel A en `visualisatie-mijn-metingen.md`, met de films Wat krijg ik en De radar in je resultaten), **Het dossier lezen** (alleen voor een Lead, `dossier.md`, Dossier lezen, met de film Het dossier lezen), Je score vergelijken, Resultaten van je Organisatie, Spreiding binnen een Meting (`visualisatie-scores.md`, onderdeel B), Benchmark en vergelijking (`benchmark.md`, View voor een Lead), Het Dossier van je consultant (`dossier.md`, Mijn metingen en Dossier lezen).
- **Admin en Consultant.** Zo werkt Coniche Scan, Rollen en rechten, Een scan aanmaken, Respondenten toevoegen, Metingen en onderdelen, Contactpersonen (`beheerpagina.md`, punt 4), Het Dossier van een Organisatie (`dossier.md`), Een samengestelde Meting maken (`benchmark.md`, Samengestelde Meting), Resultaten van een Meting, Leads toegang geven (`beheerpagina.md`, punt 6a), **Verkennen** (uitgewerkt, `visualisatie-verkennen.md`, met de Meetperiode), Benchmarks (`benchmark.md`), Gebruikers en Instellingen en drempels (beide alleen Admin, `beheerpagina.md`, Instellingen).

Het onderwerp "Je resultaten lezen" legt uit wat de grafiek Per categorie toont. Dat zijn de staaf met de score van de Organisatie, de stip met het gemiddelde van de groep, de grijze lijn van de laagste tot de hoogste score en de stippellijnen bij 2,5 en 3,5. Het kader "Let op" noemt dat stip en lijn er pas staan bij minimaal `benchmarkMinRespondenten` scans (beginwaarde 5).

Het onderwerp "Verkennen" legt de drie keuzes bovenaan uit (Assessment, Eenheid, Meetperiode), met het voorbeeld van een eerste meting in januari en een volgende meting in oktober.

## Actueel houden

- **Regel.** Verandert een spec iets wat een gebruiker ziet of doet, dan gaat het helpbestand in `bronnen` mee. De wijziging staat in de changelog van de repo (`changelog.md`), met de naam van het helpbestand.
- **Wie.** Claude Code doet dit in dezelfde wijziging als de spec of de code. Een onderwerp dat bij een nieuwe spec nog niet bestaat, wordt in dezelfde wijziging aangemaakt of staat bij de open punten van dit bestand.
- **Controle.** Het script uit Inhoud geeft een waarschuwing als een bron nieuwer is dan `bijgewerkt` van het onderwerp dat ernaar verwijst.
- **Inhoud.** Joost bewaakt de inhoud, zoals bij de andere specs.

## Open punten

- Help op de publieke schermen en de intake, zonder menu. Mogelijk antwoord: Niet in de eerste versie.
- Of een Info-icoon doorlinkt naar het bijbehorende onderwerp (bijvoorbeeld "Meer uitleg" onder de korte tekst).
- Of de zoekfunctie in een latere versie ook op trefwoorden werkt, zoals "drempel" en "periode".
- Of een Admin de helpteksten op de plek zelf kan aanpassen, zoals de Info-iconen (`beheerpagina.md`, punt 2a). Mogelijk antwoord: Nee, de teksten zijn onderdeel van de release.
- Welke helponderwerpen een Spanningsmeter-variant krijgen (Je resultaten lezen, Mijn metingen) zodra die er is, volgens "Actueel houden".
- Of de films later ook op de publieke schermen buiten de Assessment-pagina komen, en of er een film bij komt voor Samenstellen of een opgeslagen verkenning. Mogelijk antwoord: Pas na gebruik van de eerste twee.
- De exacte route van de pagina en hoe die past bij de bestaande routes. Dat beslist Sander.
