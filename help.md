# Coniche Scan: Help

**Voorstel van 19 oktober 2026, ontworpen in "Coniche Scan Help" (borden Help voor Respondent en Lead, Help voor Admin en Consultant, Help in het accountmenu, Animatie: Meetperiode kiezen en Wat krijg je), gebouwd op 19 oktober 2026 (zie Gebouwd).** Sander vroeg om een overzichtelijke helppagina die de werking van alle onderdelen beschrijft, in een variant voor de Respondent en Lead en een voor de Admin en Consultant, met plaatje en praatje.

## Wat het is

Een helppagina binnen de app waarop elke rol leest hoe de onderdelen werken die voor die rol bestaan. De Help is geen kopie van de specs. De specs zijn voor bouwers geschreven en bevatten bouwstatus, open punten en namen van instellingen. De Help is in gewone taal voor de gebruiker. De korte tekst achter een Info-icoon blijft zoals hij is (`stylesheet.md`, Info-icoon). De Help geeft de langere uitleg met een illustratie, en een Info-icoon kan later naar het bijbehorende onderwerp verwijzen (Open punten).

## Plek in de app

Een regel "Help" in het menu rechtsboven, op de bestaande menu's. Het ontwerp toont de menu's vereenvoudigd. De regels hieronder volgen de bestaande opbouw.

- **Admin en Consultant.** In het Accountmenu (`beheerpagina.md`, Accountmenu) staat Help na "Mijn account" en, voor een Admin, na "Instellingen". De scheidingslijn boven "Uitloggen" blijft staan.
- **Respondent en Lead.** In het menu "Mijn gegevens" (`CLAUDE.md`, sectie 3, "Mijn gegevens"-menu) staat Help tussen "Gegevens bekijken/wijzigen" en "Uitloggen".
- **Zonder menu.** Op de publieke schermen en de intake is er geen menu en dus geen Help (Open punten).
- **Pagina.** De Help opent als een eigen pagina met de gewone navigatiebalk, geen modal. Het logo en de exit-actie van de nav-volgorderegel (`CLAUDE.md`, Globale layout) blijven werken zoals op elke andere pagina. Het kruimelpad is Help › {onderwerp}.
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
- **Termen.** Zoals `CLAUDE.md`, Terminologie: Organisatie, Meting, Respondent, Ingevulde scan. De woorden in de interface zijn leidend, dus "Bouwblok" en geen "Bouwsteen".
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
  - **Wat krijg ik** (16 seconden), voor Respondent en Lead. Hij staat in Help in het onderwerp "Je resultaten lezen" en op de Assessment-landingspagina (`CLAUDE.md`, sectie 3, scherm 2). De film laat drie stappen zien. Eerst beantwoordt een Respondent een voorbeeldvraag met een score van 1 tot 5. Dan verschijnt direct het resultaat, met de totaalscore en de score per categorie als staven. Als laatste komen bij elke categorie de stip met het gemiddelde van de groep en de grijze lijn van de laagste tot de hoogste score erbij, met een legenda. Dat laatste is wat een Lead extra ziet (`visualisatie-scores.md`, onderdeel A, Drempel).
  - **De Meetperiode kiezen** (12 seconden), voor Admin en Consultant. Hij staat in Help in het onderwerp "Verkennen". De film laat zien hoe de keuze bij Meetperiode van "Meest recente" naar "Periode" gaat, hoe de twee datums erbij komen en hoe het aantal Organisaties in de pool daalt van 38 naar 32 van de 44.
- **Varianten van Wat krijg ik per Assessment-type (besloten door Joost en gebouwd op 20 oktober 2026, design `Film-AI` en `Film-Quickscan` in `Claude outputs/resultaatkop/`).** De film heeft dezelfde opbouw, maten en drie stapkaarten voor elk type, met de kleuren en eenheden van dat type. Het gaat om het eindbeeld (stap 3), de vulling van de ring en de rijen:
  - **Klantcontact Volwassenheid**: Zoals hierboven beschreven, vijf categorieën in hun eigen kleur, ring 3,4.
  - **Zorgscan**: Dezelfde film als Klantcontact Volwassenheid (dezelfde vijf categorieën), met de weging erbij, want de Zorgscan weegt drie bouwblokken dubbel (`content-zorgscan.md`, Weging: Bouwblok 4, 10 en 11). Onder de klassenaam bij de ring staat een regel van 12px in `--ink-s`: "Drie bouwblokken tellen 2× mee". Stapkaart 2 eindigt met "Bouwblokken die zwaarder meetellen, tonen hun factor, zoals 2×." Het aantal komt uit de gewichten van de Assessment, de film noemt geen namen van bouwblokken. Een Assessment zonder gewichten ongelijk aan 1 toont deze regel en zin niet.
  - **AI-scan**: Geen categorieën, dus acht rijen, een per domein, in volgorde 1 tot en met 8. Voor elke naam staat de nummercirkel van het domein (22px, 11px, gewicht 700, rand in de domeinkleur, `stylesheet.md`, Domeinkleuren) en de staaf heeft de domeinkleur. De rijen zijn 36px hoog. Ring 2,5 met de klasse Uitbouwen en vulling tot (2,5 − 1) / 4, in de volle kleur van de afgeronde score (3, geel). De klassegrenzen 2,5 en 3,5 staan als stippellijn door de rijen. Stapkaart 2: "Direct daarna zie je je resultaat: de totaalscore en een staaf per domein." Voorbeelddata: Strategie en governance 2,8, Data, integratie en architectuur 2,4, Use-cases en automatisering 2,0, Performance, monitoring en kwaliteit 2,0, Mensen, skills en adoptie 2,4, Security, risk en compliance 3,6, Operating model en schaalbaarheid 2,2 en Klant- en kanaalervaring 2,2, met groepsgemiddelden van 3,9, 3,8, 3,4, 3,4, 3,8, 4,0, 3,7 en 3,4.
  - **Quickscan (Ja / Nee / Weet ik niet)**: Percentages in plaats van scores van 1 tot 5. Ring 58% met de klasse "Gemiddeld ontwikkeld" (de klassenamen van de totaalscore, `content-ziekenhuis-quickscan.md`) en vulling tot 58%, in de klassekleur (oranje). Vier rijen, een per afdeling (Poliklinieken, Verpleegafdelingen, Receptie / Centrale, Patiëntenservice), zonder nummercirkel, 52px hoog, de staaf in de klassekleur van de afdeling (groen vanaf 80%, oranje van 50% tot 80%, rood eronder, `--stat-green`, `--stat-amber`, `--stat-red`) en stippellijnen op 50% en 80%. De waarde achter de staaf is een percentage. Stapkaart 1: "Je beantwoordt een vraag met Ja, Nee of Weet ik niet." Stapkaart 2: "Direct daarna zie je je resultaat: het totaalpercentage en een staaf per afdeling." Legenda: "Gemiddelde van de groep" en "Laagste tot hoogste percentage". Voorbeelddata: 85%, 64%, 47% en 36% voor de afdelingen, met groepsgemiddelden van 72%, 70%, 58% en 52%. Afdelingen die niet van toepassing zijn komen in de film niet voor.
  - **Stap 3 voor alle types** is dezelfde zin: "Een Lead ziet er het gemiddelde en de spreiding van de groep bij, zodra er genoeg scans zijn." De drempel staat ook hier niet in de film (zie Drempel in de film).
- **Films over de radar (voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026, design `Film-Radar-rapport` en `Film-Dossier` in `Claude outputs/resultaatkop/`, door Joost goedgekeurd).** Twee films met dezelfde opbouw als Wat krijg ik (16 seconden, drie stapkaarten, pauzeknop, `Voorbeeld met voorbeelddata`):
  - **De radar in je resultaten**, voor Respondent en Lead. Hij staat in Help in het onderwerp "Je resultaten lezen", na Wat krijg ik. Stap 1: Je ziet je score per bouwblok in de radar en per categorie in het staafdiagram. Stap 2: De cursor gaat over bouwblok 4 ("Leren uit klantcontact"): het knooppunt, de taartpunt en de score-stip lichten op, de balk van de categorie krijgt een ring van 3px en de andere balken dimmen, en de tooltip staat buiten de radar ("4 · Leren uit klantcontact", "2,3 · Basis op Orde"). Stap 3: De cursor gaat over de balk Mens: bouwblokken 11 tot en met 14 lichten op in de radar en de tooltip staat boven de balk ("Mens", "3,7 · Sterk punt"). De regels van de hover staan in `stylesheet.md`, Radar en staafdiagram op het resultaatscherm, Hover tussen radar en staafdiagram.
  - **Het dossier lezen**, voor de Lead. Hij staat in Help in het onderwerp "Het dossier lezen" (voor een Lead) en op de pagina Dossier (`dossier.md`, scherm 5). Stap 1: De radar toont alleen actieve knooppunten voor bouwblokken waar items bij staan (4, 7 en 13), met rechts de lijst met bouwblokken. Stap 2: Een klik op bouwblok 7 toont de filterbalk ("Systemen & Tools", "2 items in dit dossier") en laat alleen de items bij dat bouwblok staan: een case en een nieuwsbericht. Stap 3: Een klik op "Alle items tonen ×" haalt het filter weg. De voorbeelditems bevatten geen naam van een Organisatie.
  - **Zo gebouwd (21 oktober 2026).** `components/help/RadarFilms.tsx` heeft de twee podia (`RadarFilmPodium`, `DossierFilmPodium`) met een kleine radar van 15 knooppunten in SVG, en `HelpFilm` heeft de namen `radar` en `dossier` (`FilmNaam`, `HELP_FILMS`). De basisstaat in `help.css` is het eindbeeld (stap 3: Mens aangewezen, of het filter weg), de animaties staan in het blok voor beweging. Een onderwerp kan meer films hebben, gescheiden door een komma in de kopgegevens (`film: wat-krijg-ik, radar`, "Je resultaten lezen"). De film "Het dossier lezen" staat bij het nieuwe onderwerp "Het dossier lezen" (voor een Lead) en onder "Wat krijg ik" op de Assessment-pagina (`CLAUDE.md`, scherm 2); het onderwerp "Het Dossier van je consultant" gaat over de kaart op Mijn metingen. Afwijking: De nummers en kleuren van de knooppunten, de scores (4 is 2,3 en Mens is 3,7) en de teksten van de voorbeelditems zijn voorbeelddata die ik heb bedacht, het ontwerp is voor mij niet leesbaar.
  - **Op de open pagina's (besloten door Joost op 21 oktober 2026).** In de sectie "Wat krijg ik" van de Assessment-pagina's (`CLAUDE.md`, sectie 3, scherm 2) staan Wat krijg ik van het type en daaronder "Het dossier, de radar voor de Lead". De film "De radar in je resultaten" staat daar niet (open punt, `CLAUDE.md`, sectie 5).
- **Zo gebouwd (20 oktober 2026).** `lib/film.ts` kiest de variant (`filmVariant`: Ja / Nee / Weet ik niet is `quickscan`, zonder categorielaag is `domeinen`, anders `categorieen`) en rekent de weging uit de gewichten (`filmWeging`). `HelpFilm` krijgt daarvoor `assessment`: De landingspagina geeft het Assessment mee, Help niet en toont dus de variant met categorieën. De film staat nu bij elk Assessment, dus ook bij de Quickscan (daar vervalt de knop "Bekijk wat je krijgt" voor de knop onder de film). De ring heeft `--ring-vul` en `--ring-kleur`, de rijen van de AI-scan en de Quickscan hebben een eigen opmaak (`.film-rij--domein`, `.film-rij--afdeling`, `.film-grens`) en de balkanimaties lopen tot en met rij 8. Afwijkingen: De nummercirkel van de AI-scan heeft een getal van 11px (`--fs-11`, sinds 21 oktober 2026; eerder 12px). De spec geeft bij de Quickscan alleen het gemiddelde van de groep, dus het laagste en hoogste percentage (51 tot 93, 44 tot 90, 30 tot 81 en 27 tot 77) zijn voorbeelddata die ik heb bedacht. De AI-scan toont bij de stip geen lijn van laagste tot hoogste, want de spec noemt daar alleen de groepsgemiddelden, en de legenda heeft er alleen de stip. De weging van de Zorgscan staat alleen in de film zolang de bouwblokken in de opgeslagen Assessment echt een gewicht ongelijk aan 1 hebben: Staan ze er (nog) op 1, dan verschijnt de regel niet, zoals de spec zegt (`CLAUDE.md`, sectie 5, Weging).
- **Een film per onderwerp, kort.** Meer films komen alleen als een onderwerp er duidelijk beter van wordt. Elke film heeft eigen voorbeelddata en laat nooit echte Organisaties of Respondenten zien.
- **Gebouwd met CSS-animaties**, geen video. De film gebruikt dezelfde kleuren, balken en componenten als de app, zodat hij meeverandert met de stylesheet. Getallen hebben een decimale komma.
- **Stapkaarten.** Onder de film staan altijd drie of vier kaarten met een nummer en één zin per stap. Het nummer van de stap die loopt, is oranje en de kaart krijgt een oranje rand. De kaarten zijn ook het tekstalternatief. Een film zonder stapkaarten is niet af.
- **Pauzeknop.** Rechtsboven in de kaart staat een knop "Pauzeer" die wisselt naar "Afspelen". De film start vanzelf en herhaalt zichzelf. De knop is bereikbaar met het toetsenbord.
- **Verminderde beweging.** Staat in het systeem de voorkeur voor verminderde beweging aan, dan staat de film stil op het eindbeeld (bij Wat krijg ik het resultaat met de groep) en blijft de pauzeknop weg.
- **Tekstalternatief.** De film heeft een beschrijving voor schermlezers die zegt wat er gebeurt, in een of twee zinnen.
- **Label.** Boven de film staat "Voorbeeld met voorbeelddata" met de duur.
- **Ring** (gebouwd op 19 oktober 2026, een ring met een vulling tot (3,4 − 1) / 4). De ring in de film heeft de volle kleur van de afgeronde score (`stylesheet.md`, Drie niveaus van scorekleur). Het voorbeeldtotaal 3,4 rondt af op 3 en is dus geel (`--score-3`).
- **Drempel in de film.** De film toont de stip en de lijn van de groep zonder getal voor het minimum. De stapkaart zegt dat een Lead gemiddelde en spreiding ziet zodra er genoeg scans zijn. De grens is een instelling die een Admin kan aanpassen (beginwaarde 5, `visualisatie-scores.md`, onderdeel A), en de Help zet dat getal dus niet in de film. Het kader "Let op" bij "Je resultaten lezen" noemt de beginwaarde.
- **Op de Assessment-landingspagina.** De film staat tussen de hero en het blok "Praktische informatie", met dezelfde stapkaarten en daaronder de knop "Bekijk de voorbeeld-output" naar de Voorbeeld-output (scherm 3). Alle cijfers in de film zijn voorbeelddata, en dat staat er ook bij. In Help staat de film zonder die knop.
- **Waar niet.** Er is geen film voor de Respondent die een scan invult. Daar loopt niets af waar een film bij helpt.

## Eerste set onderwerpen

De eerste versie bevat de onderwerpen hieronder. Twee ervan zijn in het ontwerp uitgewerkt, elk met een film, en dienen als voorbeeld voor de rest. De andere schrijft Claude Code op basis van de specs, waarna Joost de inhoud beoordeelt.

- **Respondent en Lead.** Zo werkt de scan, Een scan invullen, Verder waar je was gebleven, Mijn metingen (`visualisatie-mijn-metingen.md`), **Je resultaten lezen** (uitgewerkt, `visualisatie-scores.md`, onderdeel A en `visualisatie-mijn-metingen.md`, met de films Wat krijg ik en De radar in je resultaten), **Het dossier lezen** (alleen voor een Lead, `dossier.md`, scherm 5, met de film Het dossier lezen), Je score vergelijken, Resultaten van je Organisatie, Spreiding binnen een Meting (`visualisatie-scores.md`, onderdeel B), Benchmark en vergelijking (`benchmark.md`, View voor een Lead), Het Dossier van je consultant (`dossier.md`, scherm 4 en 5, gebouwd op 21 oktober 2026).
- **Admin en Consultant.** Zo werkt Coniche Scan, Rollen en rechten, Een scan aanmaken, Respondenten toevoegen, Metingen en onderdelen, Contactpersonen (`beheerpagina.md`, punt 4), Het Dossier van een Organisatie (`dossier.md`, gebouwd op 21 oktober 2026), Een samengestelde Meting maken (`benchmark.md`, Samengestelde Meting), Resultaten van een Meting, Leads toegang geven (`beheerpagina.md`, punt 6a), **Verkennen** (uitgewerkt, `visualisatie-verkennen.md`, met de Meetperiode), Benchmarks (`benchmark.md`), Gebruikers en Instellingen en drempels (beide alleen Admin, `beheerpagina.md`, Instellingen).

Het onderwerp "Je resultaten lezen" legt uit wat de grafiek Per categorie toont. Dat zijn de staaf met de score van de Organisatie, de stip met het gemiddelde van de groep, de grijze lijn van de laagste tot de hoogste score en de stippellijnen bij 2,5 en 3,5. Het kader "Let op" noemt dat stip en lijn er pas staan bij minimaal `benchmarkMinRespondenten` scans (beginwaarde 5).

Het onderwerp "Verkennen" legt de drie keuzes bovenaan uit (Assessment, Eenheid, Meetperiode), met het voorbeeld van een eerste meting in januari en een volgende ronde in oktober.

## Actueel houden

- **Regel.** Verandert een spec iets wat een gebruiker ziet of doet, dan gaat het helpbestand in `bronnen` mee. De wijziging staat in de changelog (`changelog.md`), met de naam van het helpbestand.
- **Wie.** Claude Code doet dit in dezelfde ronde als de spec of de code. Een onderwerp dat bij een nieuwe spec nog niet bestaat, wordt in dezelfde ronde aangemaakt of staat bij de open punten van dit bestand.
- **Controle.** Het script uit Inhoud geeft een waarschuwing als een bron nieuwer is dan `bijgewerkt` van het onderwerp dat ernaar verwijst.
- **Inhoud.** Joost bewaakt de inhoud, zoals bij de andere specs.

## Open punten

- Help op de publieke schermen en de intake, zonder menu. Voorstel: Niet in de eerste versie.
- Of een Info-icoon doorlinkt naar het bijbehorende onderwerp (bijvoorbeeld "Meer uitleg" onder de korte tekst).
- Of de zoekfunctie in een latere versie ook op trefwoorden werkt, zoals "drempel" en "periode".
- Of een Admin de helpteksten op de plek zelf kan aanpassen, zoals de Info-iconen (`beheerpagina.md`, punt 2a). Voorstel: Nee, de teksten zijn onderdeel van de release.
- Of de films later ook op de publieke schermen buiten scherm 2 komen, en of er een film bij komt voor Samenstellen of een opgeslagen verkenning. Voorstel: Pas na gebruik van de eerste twee.
- De exacte route van de pagina en hoe die past bij de bestaande routes. Dat beslist Sander.

## Gebouwd

Gebouwd op 19 oktober 2026, op verzoek van Sander. De inhoud is door Claude Code geschreven op basis van de specs en moet door Joost worden beoordeeld.

- **Routes.** `/help` en `/help/{onderwerp}` voor een Respondent of Lead, met de persoonlijke code in de adresbalk (`/help?code=…`, zoals bij Mijn metingen). `/beheer/help` en `/beheer/help/{onderwerp}` voor een Admin of Consultant, binnen de beheeromgeving. Eén component voor beide (`components/help/HelpPagina.tsx`). Zonder code is er op `/help` alleen een korte melding met een link naar Toegang (Open punten, Help zonder menu). Zonder onderwerp in de route staat het eerste onderwerp van de rol open. Een onderwerp dat de rol niet mag zien, geeft de melding "Dit onderwerp bestaat niet" met de inhoudsopgave ernaast.
- **Menu.** De rij "Help" staat in het Accountmenu na "Mijn account" en "Instellingen" (`components/beheer/BeheerChrome.tsx`) en in "Mijn gegevens" na "Gegevens bekijken/wijzigen" (`components/MijnGegevensMenu.tsx`). Op `/beheer/help` is de rij gemarkeerd.
- **Inhoud.** 28 bestanden in `help/` (op 21 oktober 2026 kwamen er twee bij voor het Dossier en `contactpersonen-en-nieuws` werd `contactpersonen`), met twee SVG's in `help/afbeeldingen/` (de twee uitgewerkte onderwerpen). `npm run help` (`scripts/bouw-help.ts`, Node 24 met type stripping) leest ze, controleert ze (`lib/help-bron.ts`, `controleerHelp`) en schrijft `data/help-onderwerpen.ts`. Het draait vanzelf voor `npm run dev` en `npm run build`, en `lib/help.test.ts` controleert dat het bestand bij de bronnen past. Gecontroleerd worden de kopgegevens, de groep en de rollen per groep, de bronnen, de afbeelding, de vaste koppen in de vaste volgorde, de genummerde lijst tegenover de markeringen `data-nr` in de SVG, en dat elke rol van een onderwerp alle verwijzingen onder Zie ook kan volgen. Een bron die volgens git nieuwer is dan `bijgewerkt` geeft een waarschuwing.
- **Rol en toegang.** Een beheerder krijgt zijn rol uit `Gebruiker.rol`. Een Respondent is Lead als hij de Lead-rol heeft en krijgt dan de weergaven uit zijn `LeadToegang` mee (`lib/help.ts`, `helpRolRespondent`). Een onderwerp over een Lead-weergave (`toegang`) staat er alleen bij het bijbehorende vinkje. De rol komt dus nog uit de browser, zoals de rest van het prototype. Met de backend moet dat uit de sessie komen (Rol en inhoud).
- **Pagina.** Zijbalk met zoekveld en inhoudsopgave, het artikel in de vaste opbouw en de film vóór de illustratie, onder In het kort. Een Admin ziet het label "Admin" achter de onderwerpen die een Consultant niet ziet. De badge boven de titel is "Iedereen", "Respondent en Lead", "Admin en Consultant" of de rol. Het zoeken filtert in de browser op titel en tekst, waarbij elk woord moet voorkomen.
- **Films.** `components/help/HelpFilm.tsx` en `app/styles/help.css`: Twee films met CSS-animaties, drie stapkaarten waarvan de lopende een oranje rand en een oranje nummer heeft, een pauzeknop (`aria-pressed`) en een verborgen beschrijving voor schermlezers. Bij verminderde beweging staat de film op het eindbeeld en is de pauzeknop weg. Wat krijg ik staat ook op de Assessment-landingspagina, onder de drie kaarten en boven Praktische informatie, met de knop "Bekijk de voorbeeld-output". Die knop vervangt de knop "Bekijk wat je krijgt" in de hero. Bij een scan met Ja / Nee / Weet ik niet (de Quickscan) staat de film er niet, want hij toont staven op de schaal van 1 tot 5. Daar blijft "Bekijk wat je krijgt" staan.

**Afwijkingen en invullingen waar de spec open liet**:
- De twee films hebben een eigen kop (de titel van de film) boven het label "Voorbeeld met voorbeelddata" (zonder de duur, vervallen op 20 oktober 2026).
- Alleen "Je resultaten lezen" en "Verkennen" hebben een illustratie. De andere onderwerpen hebben `afbeelding` leeg, zoals de kopgegevens dat toestaan. Voor de rest moeten illustraties nog worden ontworpen.
- "Je score vergelijken" legt uit hoe een Respondent zijn score kan vergelijken: de klassen, de categorieën naast elkaar (staafdiagram met stippellijnen op de klassegrenzen), de radar en de top 3. Joost heeft het onderwerp goedgekeurd op 19 oktober 2026, met vier hulpmiddelen in de tekst en onder "Let op" een slotalinea over de reikwijdte: Het onderwerp gaat over de Klantcontact Volwassenheidsscan en de Zorgscan, de AI-scan toont de domeinen in een eigen overzicht, en de Quickscan werkt met percentages en de klassen Goed op orde, Gemiddeld inzicht en Ontwikkelruimte. Een eigen variant voor de AI-scan en de Quickscan is een open punt.
- Twee onderwerpen voor een Lead zijn erbij gekomen: "Antwoorden per vraag" (toegang `antwoorden`) en "Respondenten uitnodigen" (toegang `uitnodigen`), omdat een Lead die vinkjes kan hebben. Ook "KPI's invullen" is erbij gekomen (`datamodel.md`, Help).
- "Leads toegang geven" heeft alleen de rol Admin, hoewel de tabel in Rol en inhoud de groep Resultaten voor beheer aan de Consultant geeft. Het Leads-venster is Admin-only (`beheerpagina.md`, punt 6a). Het onderwerp heeft daarom het label Admin.
- Een rol die op een onderwerp niet mag, bestaat voor die rol niet: Er is geen aparte pagina "geen toegang".

