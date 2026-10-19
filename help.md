# Coniche Scan: Help

**Voorstel van 19 oktober 2026, ontworpen in "Coniche Scan Help" (borden Help voor Respondent en Lead, Help voor Admin en Consultant en Help in het accountmenu), nog niet gebouwd.** Sander vroeg om een overzichtelijke helppagina die de werking van alle onderdelen beschrijft, in een variant voor de Respondent en Lead en een voor de Admin en Consultant, met plaatje en praatje.

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
  4. De illustratie in een kaart met een kop, het label "Voorbeeld met voorbeelddata" en, waar nodig, een legenda.
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

## Eerste set onderwerpen

De eerste versie bevat de onderwerpen hieronder. Twee ervan zijn in het ontwerp uitgewerkt en dienen als voorbeeld voor de rest. De andere schrijft Claude Code op basis van de specs, waarna Joost de inhoud beoordeelt.

- **Respondent en Lead.** Zo werkt de scan, Een scan invullen, Verder waar je was gebleven, Mijn metingen (`visualisatie-mijn-metingen.md`), **Je resultaten lezen** (uitgewerkt, `visualisatie-scores.md`, onderdeel A en `visualisatie-mijn-metingen.md`), Je score vergelijken, Resultaten van je Organisatie, Spreiding binnen een Meting (`visualisatie-scores.md`, onderdeel B), Benchmark en vergelijking (`benchmark.md`, View voor een Lead).
- **Admin en Consultant.** Zo werkt Coniche Scan, Rollen en rechten, Een scan aanmaken, Respondenten toevoegen, Metingen en onderdelen, Een samengestelde Meting maken (`benchmark.md`, Samengestelde Meting), Resultaten van een Meting, Leads toegang geven (`beheerpagina.md`, punt 6a), **Verkennen** (uitgewerkt, `visualisatie-verkennen.md`, met de Meetperiode), Benchmarks (`benchmark.md`), Gebruikers en Instellingen en drempels (beide alleen Admin, `beheerpagina.md`, Instellingen).

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
- De exacte route van de pagina en hoe die past bij de bestaande routes. Dat beslist Sander.

## Gebouwd

Nog niets.
