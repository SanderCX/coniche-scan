# Coniche Scan: Visualisatie van hoge en lage scores

**Status.** Ontwerprichting besloten door Joost op 12 oktober 2026. Gebouwd op 13 oktober 2026 (A tot en met E, de navigatie en de schakelaar), met de afwijkingen en wat nog niet is gebouwd onder Gebouwd. Wat een voorstel is dat nog bevestiging vraagt, staat per onderdeel aangegeven. Dit bestand beschrijft wat getoond wordt en hoe het berekend wordt. De precieze opmaak (maten, kleuren, lettergrootte) volgt `stylesheet.md`. Waar dit bestand daar iets aan toevoegt, staat dat onder Nieuwe stijlwaarden.

**Visueel referentieontwerp.** Het canvas "Coniche Scan – visualisatie van scores" (vijf borden, voorbeeldgegevens) is een ontwerpschets en geen code. Waar schets en tekst verschillen, geldt de tekst. De borden staan ook als afbeelding in de map `afbeeldingen` (`visualisatie-a-een-meting.png`, `visualisatie-b-spreiding.png`, `visualisatie-c-tussen-metingen.png`, `visualisatie-d-tussen-organisaties.png` en `visualisatie-e-matrix.png`). Het canvas zelf is privé en moet door Joost gedeeld worden voordat Sander het kan openen.

## Wat het oplost

Een resultaat moet in één blik laten zien waar een organisatie hoog en laag scoort. Dat geldt op vier plekken, met dezelfde schaal en dezelfde leesrichting:

| Weergave | Vraag | Niveau in `benchmark.md` | Wie ziet het |
|---|---|---|---|
| A. Eén meting | Waar scoren we hoog en laag? | Geen benchmark, de Organisatie-resultaten (`beheerpagina.md`) | Admin, Consultant, Lead |
| B. Spreiding | Zijn de respondenten het eens? | Niveau 3, binnen een Meting | Admin, Lead met toewijzing |
| C. Tussen metingen | Wat is er veranderd sinds de vorige Meting? | Trend in de tijd (`backlog.md`), valt buiten niveau 2 | Admin, Consultant, Lead |
| D. Tussen organisaties | Waar zitten we boven of onder de groep? | Niveau 1, de view per organisatie | Admin, Lead met toewijzing |
| E. Matrix | Welke Metingen of organisaties wijken af, op welk bouwblok? | Niveau 2, binnen een organisatie, en niveau 1, tussen organisaties | Alleen Admin |

## Gedeelde regels

Deze regels gelden voor alle vijf de weergaven.

**Schaal en banden.** De horizontale as loopt van 1 tot 5. De positie van een score is `(score − 1) / 4` van de breedte. Achter elke rij staan drie banden die de classificatie van `CLAUDE.md` (sectie 1) volgen: onder 2,5 (Basis op Orde, 37,5% van de breedte), 2,5 tot en met 3,49 (Uitbouwen, 25%) en vanaf 3,5 (Sterk punt, 37,5%). Boven de eerste rij staan de drie namen. Bij D en E vervalt de bandachtergrond, zie daar.

**Volgorde en groepering.** Bouwblokken staan in de volgorde van het model: Overkoepelend (1 en 2), Organisatie, Proces & Tech, Mens, Fundament (15). Boven elke groep staat de categorienaam als klein label. Links van de bouwblokknaam staat het volgnummer en een accentrand van 4px in de categoriekleur (zelfde patroon als `bouwstenenmodel-visual.md`). De categoriekleur wordt nergens als vulling gebruikt. Bij AI-volwassenheid, dat geen categorielaag heeft, vervallen de groepslabels en staan de acht domeinen op volgorde.

**Getallen.** Eén decimaal, met komma. Bouwblokscores zijn ongewogen, zoals overal (`CLAUDE.md`, sectie 1). Een totaalscore komt uit de gedeelde scorefunctie met `Bouwblok.gewicht` en niet uit het gemiddelde van de getoonde bouwblokscores. Heeft een bouwblok een gewicht ongelijk aan 1, dan staat de factor ("2×") achter de naam. Scores worden berekend en nooit opgeslagen (`datamodel.md`, Scoreberekening).

**Kleur nooit alleen.** Elke stip, cel of lijn heeft een getal of label erbij. Rood en groen komen alleen samen voor als klassekleur, met het getal ernaast. Voor richting (stijging en daling) en positie (boven en onder de groep) gebruiken C en D blauw en oranje.

**Bovenaan** staat een rij met vier tegels met kerncijfers. Welke vier staat per weergave.

**Alleen desktop**, zoals de rest van de app.

**Lege en onvolledige toestand.** Een bouwblok zonder afgeronde scan toont een streepje en geen stip. Een weergave zonder enige afgeronde scan toont de bestaande lege-toestand van de resultaatcomponenten.

## Navigatie

**Besloten op 12 oktober 2026.** De weergaven komen in aanvulling op de bestaande resultaatschermen. Wat er nu is, blijft ongewijzigd. Er komt een schakelaar bij en een knop om te vergelijken.

**Regels**

- Het kruimelpad blijft de hiërarchie volgen (Organisaties › Organisatie › Meting › Resultaten, `beheerpagina.md`, Navigatie in beheer). Een weergave staat niet in het pad.
- Wisselen van weergave is een knop en geen link (`CLAUDE.md`, Uitgangspunten), omdat dezelfde gegevens anders worden getoond.
- De gekozen weergave staat in de adresbalk, zodat de terugknop van de browser werkt en de link te delen is. `?weergave=` met de waarden `bouwblok` en `spreiding` (zonder parameter is het Overzicht), `?vergelijk=<metingId>` voor weergave C en `?focus=<scanId>` voor de scan die in B de ring krijgt. Het bestaande `?scan=` blijft voor de modal.
- De schakelaar is een nieuw component, zie `stylesheet.md`, Weergave-schakelaar. De bestaande tabbalk blijft voor lijstpagina's.

**Resultatenpagina van een Meting** (`beheerpagina.md`, punt 4, Organisatie-resultaten)

- Onder de kop staat de schakelaar met drie weergaven: Overzicht, Per bouwblok en Spreiding. Overzicht is de standaard en is de huidige pagina (classificatiecirkel, radar, staafdiagram per categorie, top 3, legenda). Per bouwblok is weergave A, Spreiding is weergave B zonder ring.
- Rechts van de schakelaar staat de knop "Vergelijk met vorige Meting". Hij is er alleen als er een eerdere Meting van hetzelfde Assessment is waarvan het aantal afgeronde scans minstens `benchmarkMinScans` is. Zijn er meerdere eerdere Metingen, dan wordt het een dropdown-knop met de Metingen op label, de meest recente bovenaan.
- Tijdens een vergelijking toont de pagina weergave C. De schakelaar is dan verborgen. Er staat een knop "Vergelijking sluiten" die terugkeert naar de weergave van daarvoor. Boven de titel staat als eyebrow "Vergelijking met {label van de vorige Meting}".
- Een Admin ziet onder de weergave de link "Bekijk in benchmark" als de organisatie (niveau 1) of de Meting (niveau 2) lid is van een benchmark. Zit ze in meer dan één, dan is het een keuzelijst.

**Resultatenpagina van één scan** (beheer, kruimelpad … › Resultaten van {Respondent})

- Een tweede schakelaar met Scores van deze scan en Positie in de Meting. Positie in de Meting is weergave B met de ring op deze scan (`?focus=<scanId>`). Dit is de view van niveau 3.
- Is het aantal afgeronde scans in de Meting kleiner dan `benchmarkMinRespondenten`, dan is "Positie in de Meting" uitgeschakeld, met de reden in een Info-icoon (`info.positieMeting`).
- Het Scan-overzicht (modal) krijgt bij "Resultaten bekijken" geen extra knop. De schakelaar staat op de resultatenpagina zelf.
- De respondent zelf ziet op het resultatenscherm (`CLAUDE.md`, scherm 6) geen schakelaar. Er verandert niets aan scherm 6 en aan de PDF-export.

**Benchmark** (Admin)

- Weergave D staat in de view per organisatie en weergave E in het detail van een benchmark op niveau 2, onder het kruimelpad Benchmark › {naam} (`beheerpagina.md`, punt 14). Er komt geen schakelaar bij.

**Lead**

- Op zijn eigen resultaten ziet een Lead de schakelaar met Overzicht en Per bouwblok, en de knop voor de vergelijking met de vorige Meting. Spreiding en Positie in de Meting zijn er alleen als weergave die een Admin heeft toegewezen (`benchmark.md`, Toewijzen aan een Lead op alle niveaus). Die staat als kaart op zijn pagina "Mijn metingen", zoals nu al gespecificeerd.

## A. Eén meting

**Plek.** De weergave Per bouwblok op de resultatenpagina van een Meting (`beheerpagina.md`, Organisatie-resultaten), naast het bestaande Overzicht dat ongewijzigd blijft. Dezelfde component wordt hergebruikt voor de Lead op zijn pagina. Zie Navigatie.

**Data.** Per bouwblok het gemiddelde antwoord per vraag over de afgeronde scans van de Meting, daarop de gedeelde scorefunctie (zoals bij `benchmark.md`, Gedeelde regels, met de scans als leden).

**Opbouw.** Per bouwblok een rij met:

- Een stip op de gemiddelde score, gekleurd naar de klasse. Kleuren: `--stat-red` (Basis op Orde), `--stat-amber` (Uitbouwen) en `--stat-green` (Sterk punt). Dit is een klasse van drie stappen en dus een bewuste keuze naast de vijf scorekleuren van `stylesheet.md` (zie Open punten).
- Een dunne lijn van de laagste tot de hoogste bouwblokscore van een afgeronde scan.
- Rechts het gemiddelde als getal, vet.

**Tegels.** Totaalscore met de klasse, hoogste bouwblok (score en naam), laagste bouwblok (score en naam), en de verdeling van de bouwblokken over de drie klassen.

**Drempel.** De lijn van laagste tot hoogste toont de score van één scan en is bij weinig scans herleidbaar. Voor een Admin staat de lijn altijd aan. Voor een Lead staat de lijn pas aan vanaf `benchmarkMinRespondenten` (voorstel, startwaarde 5, zie `benchmark.md`, Niveau 3).

## B. Spreiding binnen een Meting (niveau 3)

Dit vult het onderdeel "Nog te ontwerpen" van `benchmark.md`, niveau 3.

**Plek.** De weergave Spreiding op de resultatenpagina van een Meting (zonder ring, voor een Admin) en de weergave Positie in de Meting op de resultatenpagina van één scan (met ring). Dat tweede is de view van niveau 3. Zie Navigatie.

**Data.** Per bouwblok de bouwblokscore van elke afgeronde scan. Bij vier vragen per bouwblok zijn dat stappen van 0,25. De vergelijkgroep van een scan-view is alle andere afgeronde scans in de Meting, zonder de scan zelf (`benchmark.md`, Niveau 3). Gemiddelde en spreiding komen dus uit de andere scans. Zonder scan-view (de weergave onder A) tellen alle scans mee.

**Opbouw.** Per bouwblok een rij met:

- Eén stip per scan, op de bouwblokscore. Scans met dezelfde score staan onder elkaar gestapeld, in het midden van de rij uitgelijnd. De stippen zijn grijs en niet te onderscheiden van elkaar.
- Een verticale streep op het gemiddelde.
- Bij een scan-view een oranje ring op de score van die scan (`--or`). De ring vervangt de stip van die scan.
- Rechts het gemiddelde als getal en een label voor de spreiding.

**Spreidingslabel.** Op basis van de standaardafwijking (steekproef, n − 1) van de bouwblokscores in de vergelijkgroep. Voorstel: onder 0,55 is Eensgezind, van 0,55 tot 0,8 is Wisselend en vanaf 0,8 is Verdeeld. De grenzen zijn een eerste inschatting en moeten met echte data worden bijgesteld. Verdeeld is het enige label met een volle vulling, zodat het opvalt.

**Sortering.** Standaard in de volgorde van het model. Een schakelaar "Sorteer op spreiding" zet de rijen van grote naar kleine spreiding, zonder groepslabels. De accentrand in de categoriekleur blijft staan.

**Tegels.** Aantal respondenten (afgeronde scans), meest verdeeld bouwblok (standaardafwijking en naam), meest eensgezind bouwblok, en bij een scan-view het aantal bouwblokken waarop de scan onder het gemiddelde van de anderen ligt.

**Privacy.** Geldt `benchmarkMinRespondenten` uit `benchmark.md`. De stippen hebben geen naam, geen tooltip en geen aanklikbaar gedrag voor een Lead. Voor een Admin blijft het anoniem, tenzij `beheerpagina.md` anders besluit (zie Open punten).

## C. Tussen metingen

**Plek.** De knop "Vergelijk met vorige Meting" op de resultatenpagina van een Meting (zie Navigatie). Een Lead vergelijkt zijn eigen Meting met een eerdere Meting waarop hij ook Lead is. Dit is het item "Trend tussen Metingen van dezelfde organisatie" uit `backlog.md`. Het is niet hetzelfde als niveau 2 van de benchmark.

**Data.** Het gemiddelde per bouwblok van beide Metingen, berekend als bij A. Het verschil is de getoonde waarde van de nieuwere Meting min de getoonde waarde van de oudere, zodat wat de lezer ziet optelt. Alleen Metingen van hetzelfde Assessment zijn te vergelijken. Beide Metingen moeten voldoen aan `benchmarkMinScans`.

**Opbouw.** Per bouwblok een rij met:

- Een holle ring op de vorige Meting (grijs).
- Een gevulde stip op de huidige Meting, gekleurd naar de klasse zoals bij A.
- Een lijn ertussen: blauw (`--bl`) bij een stijging, donkeroranje bij een daling, grijs bij geen verandering.
- Rechts het verschil met een driehoekje en een teken ("▲ +0,3", "▼ −0,3"), en als het bouwblok van klasse wisselt een label zoals "Basis op orde → Uitbouwen".

**Tegels.** Totaalscore van de vorige en huidige Meting ("2,9 → 3,1"), aantal bouwblokken gestegen, aantal gedaald, aantal van klasse gewisseld.

**Meer dan twee Metingen.** Hier is nog geen ontwerp voor. Voorstel voor later is een lijn per bouwblok over de Metingen heen.

## D. Tussen organisaties (niveau 1)

**Plek.** De view per organisatie (`benchmark.md`, Niveau 1, View per organisatie). Dit werkt het voorstel "de range van de groep als band" uit en vervangt de lijst met het verschil per bouwblok door deze weergave. Radar en staafdiagram per categorie blijven staan.

**Data.** Per bouwblok de score van de organisatie X en de scores van de overige leden (zonder X, per Assessment, elk lid even zwaar). Daaruit het groepsgemiddelde, het minimum, het maximum en het eerste en derde kwartiel (lineair geïnterpoleerd, zoals `KWARTIEL.INC` in Excel).

**Opbouw.** Per bouwblok een rij met:

- Een lichte band van het minimum tot het maximum van de groep.
- Een donkerder band van het eerste tot het derde kwartiel (de middelste helft).
- Een streep op het groepsgemiddelde.
- Een oranje stip met witte rand op de score van X (`--or`). Dezelfde kleur als "X" in de radar.
- Rechts de score van X, het verschil met het groepsgemiddelde en een label voor de positie.

**Positielabel.** Bovenste kwart als de score van X boven het derde kwartiel ligt, Onderste kwart als hij onder het eerste kwartiel ligt, anders Middenmoot. Bovenste kwart in blauw, Onderste kwart in oranje, Middenmoot zonder kleur.

**Tegels.** Grootte van de vergelijkgroep, aantal bouwblokken boven het groepsgemiddelde, aantal in het bovenste kwart, aantal in het onderste kwart.

**Onderschrift.** De bestaande tekst "Vergelijkgroep van n organisaties, samengesteld door Coniche" en de peildatum, onder de weergave.

**Privacy.** Het maximum en het minimum zijn de score van één organisatie, al staat er geen naam bij. Zie Open punten voor de drempel. De view toont nooit namen van andere organisaties (`benchmark.md`).

## E. Matrix voor Metingen en organisaties (niveau 2 en 1)

**Plek.** De weergave van niveau 2 (`benchmark.md`, Niveau 2, Weergave), per Assessment, naast het gemiddelde van alle gekozen Metingen. Op niveau 1 staat dezelfde matrix per Assessment onder de gemiddelden van de groep (`benchmark.md`, Niveau 1, Weergave voor de Admin), met organisaties als kolommen. Alleen voor een Admin, omdat de kolomkoppen de labels van de Metingen tonen en een Lead die van andere Metingen niet mag zien (`benchmark.md`, Toewijzen aan een Lead op alle niveaus). Een Lead krijgt de view van zijn Meting tegenover de rest, in de opbouw van D.

**Data.** Per bouwblok het gemiddelde van elke gekozen Meting. Elke Meting telt even zwaar mee, ongeacht het aantal respondenten.

**Opbouw.** Rijen zijn bouwblokken, kolommen zijn de Metingen met hun label en het aantal afgeronde scans eronder. Elke cel is gevuld naar de klasse, met het getal erin. Rechts staan het gemiddelde van de rij en het bereik (laagste tot hoogste). Onderaan staat een rij Totaalscore, gekleurd op dezelfde manier. Een cel die 0,5 of meer afwijkt van het gemiddelde van de rij krijgt een zwarte rand van 2px.

**Tegels.** Hoogste Meting en laagste Meting (totaalscore en label), bouwblok met het grootste verschil tussen Metingen, aantal cellen met een zwarte rand.

**Niveau 1, kolommen met organisaties.** Besloten op 13 oktober 2026, gebouwd op 13 oktober 2026. De opbouw, de kleuren, de zwarte rand, de rij Totaalscore en de tegels zijn gelijk aan niveau 2. Wat anders is:

- De kolomkop is de organisatienaam, met daaronder het label van de Meting en het aantal afgeronde scans. Op niveau 2 is de kop het label van de Meting.
- De tegels heten Hoogste organisatie en Laagste organisatie, met de totaalscore en de organisatienaam.
- Organisaties zonder lid bij dit Assessment hebben geen kolom.
- De matrix is alleen voor de Admin. De privacyregel van D geldt voor een Lead en verandert daar niets aan, omdat een Lead de matrix niet ziet.
- Een Lead met een toegewezen view krijgt nooit de kolommen van andere organisaties, ook niet anoniem.

**Andere kolommen.** Opeenvolgende Metingen in de tijd in dezelfde matrix is nu geen besluit en vraagt eerst een uitwerking.

## Gebouwd

Gebouwd op 13 oktober 2026. De berekeningen staan in `lib/visualisatie.ts` (met tests), de weergaven in
`components/visualisatie/`, de schakelaar is `WeergaveWissel`.

**Plekken**

- A en B: `MetingWeergaven` op de resultatenpagina van een Meting in beheer en voor de Lead
  (`/s/[code]/resultaten/[scanUitvoeringId]`). B op niveau 3 staat ook in de view van een scan (benchmark) en in
  "Positie in de Meting" op de resultatenpagina van één scan.
- C: de knop "Vergelijk met vorige Meting" (`?vergelijk=<metingId>`). Een dropdown-knop bij meer dan één eerdere Meting.
- D: de view per organisatie (niveau 1) en de view per Meting (niveau 2) van de benchmark, ook voor een Lead.
- E: de matrix in de sectie van een benchmark op niveau 2 (kolommen met Metingen) en op niveau 1 (kolommen met organisaties,
  met het label van de Meting en het aantal scans onder de naam), alleen voor de Admin. Bij veel kolommen scrolt de matrix
  horizontaal met een vaste eerste kolom.

**Afwijkingen en keuzes**

- De waarde van "Sorteer op spreiding" staat niet in de adresbalk.
- De kleuren van de stip zijn de drie klassekleuren (`--stat-red`, `--stat-amber`, `--stat-green`), zoals voorgesteld. De
  vijf scorekleuren van `stylesheet.md` zijn niet gebruikt (zie Open punten).
- De spreidingsgrenzen staan als constante (`SPREIDING_GRENZEN`, 0,55 en 0,8) en zijn nog niet instelbaar.
- Is een Lead voor een Meting een Lead met `benchmarkMinRespondenten` nog niet gehaald, dan staat de lijn van laagste tot
  hoogste score uit. Voor een Admin en een Consultant staat hij altijd aan.
- Zonder categorielaag (AI-volwassenheid) vervallen de groepslabels. Bij "Sorteer op spreiding" vervallen ze ook.
- Een Admin kan in B geen naam bij een stip zien (zie Open punten).
- Elke Meting in de matrix telt even zwaar mee. Met twee kolommen wijkt elke cel precies 0,5 of meer af van het
  rijgemiddelde en krijgt dus een rand. De regel is zo bedoeld, maar bij twee Metingen is de markering daardoor weinig
  onderscheidend.

**Nog niet gebouwd**

- Export van deze weergaven naar PDF, CSV en InDesign.
- Meer dan twee Metingen in C.
- Een eigen drempel voor de band en de kwartielen in D.

## Nieuwe stijlwaarden

Voorstel, op te nemen in `stylesheet.md` zodra ze zijn bevestigd:

| Gebruik | Waarde |
|---|---|
| Klassekleur stip, Basis op Orde | `--stat-red` (`#dc2626`) |
| Klassekleur stip, Uitbouwen | `--stat-amber` (`#e8871e`) |
| Klassekleur stip, Sterk punt | `--stat-green` (`#22a06b`) |
| Band achter de rij, achtereenvolgens | `--stat-red-faint`, `--stat-amber-faint`, `--stat-green-faint` |
| Celvulling matrix | `#f7c6c1` (tekst `#7f1d1d`), `#fde9c8` (tekst `#6b3a00`), `#c3e6d2` (tekst `#0e4d30`) |
| Stijging | `--bl` (`#225ba0`) |
| Daling | `#c2570c` (nieuw) |
| Positielabel boven de groep | vulling `#e8f1fb`, tekst `#174473`, rand `#bcd3ee` |
| Positielabel onder de groep | vulling `#fdf2e3`, tekst `#8a4a00`, rand `#f2cf9b` |
| Spreiding, stip van een respondent | `#5d6a78` met 75% dekking |

## Open punten

- Klassekleur met drie stappen (A, C, E) of de vijf scorekleuren van `stylesheet.md`. Het ontwerp gebruikt drie stappen omdat de weergave bij de classificatie hoort. Te bevestigen met Sander.
- De grenzen voor het spreidingslabel (0,55 en 0,8).
- Of de band en de kwartielen in D een eigen, hogere drempel krijgen dan `benchmarkMinOrganisaties`. Bij vijf leden in totaal bestaat de rest uit vier organisaties en zijn minimum en maximum dan vrij herleidbaar.
- Of een Admin in B de naam van een respondent bij een stip kan zien.
- Een extra uitsplitsing van B naar Rol, bijvoorbeeld management tegenover medewerkers. Zie `backlog.md`.
- Meer dan twee Metingen in C.
- Export van deze weergaven naar PDF, CSV en InDesign.
