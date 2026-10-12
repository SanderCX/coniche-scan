# Coniche Scan: Visualisatie van hoge en lage scores

**Status.** Ontwerprichting besloten door Joost op 12 oktober 2026. Nog niets gebouwd. Wat een voorstel is dat nog bevestiging vraagt, staat per onderdeel aangegeven. Dit bestand beschrijft wat getoond wordt en hoe het berekend wordt. De precieze opmaak (maten, kleuren, lettergrootte) volgt `stylesheet.md`. Waar dit bestand daar iets aan toevoegt, staat dat onder Nieuwe stijlwaarden.

**Visueel referentieontwerp.** Het canvas "Coniche Scan – visualisatie van scores" (vijf borden, voorbeeldgegevens) is een ontwerpschets en geen code. Waar schets en tekst verschillen, geldt de tekst. De borden staan ook als afbeelding in de map `afbeeldingen` (`visualisatie-a-een-meting.png`, `visualisatie-b-spreiding.png`, `visualisatie-c-tussen-metingen.png`, `visualisatie-d-tussen-organisaties.png` en `visualisatie-e-matrix.png`). Het canvas zelf is privé en moet door Joost gedeeld worden voordat Sander het kan openen.

## Wat het oplost

Een resultaat moet in één blik laten zien waar een organisatie hoog en laag scoort. Dat geldt op vier plekken, met dezelfde schaal en dezelfde leesrichting:

| Weergave | Vraag | Niveau in `benchmark.md` | Wie ziet het |
|---|---|---|---|
| A. Eén meting | Waar scoren we hoog en laag? | Geen benchmark, de Organisatie-resultaten (`beheerpagina.md`) | Admin, Consultant, Lead |
| B. Spreiding | Zijn de respondenten het eens? | Niveau 3, binnen een Meting | Admin, Lead met toewijzing |
| C. Tussen metingen | Wat is er veranderd sinds de vorige Meting? | Trend in de tijd (`backlog.md`), valt buiten niveau 2 | Admin, Consultant, Lead |
| D. Tussen organisaties | Waar zitten we boven of onder de groep? | Niveau 1, de view per organisatie | Admin, Lead met toewijzing |
| E. Matrix | Welke Metingen wijken af, op welk bouwblok? | Niveau 2, binnen een organisatie | Alleen Admin |

## Gedeelde regels

Deze regels gelden voor alle vijf de weergaven.

**Schaal en banden.** De horizontale as loopt van 1 tot 5. De positie van een score is `(score − 1) / 4` van de breedte. Achter elke rij staan drie banden die de classificatie van `CLAUDE.md` (sectie 1) volgen: onder 2,5 (Basis op Orde, 37,5% van de breedte), 2,5 tot en met 3,49 (Uitbouwen, 25%) en vanaf 3,5 (Sterk punt, 37,5%). Boven de eerste rij staan de drie namen. Bij D en E vervalt de bandachtergrond, zie daar.

**Volgorde en groepering.** Bouwblokken staan in de volgorde van het model: Overkoepelend (1 en 2), Organisatie, Proces & Tech, Mens, Fundament (15). Boven elke groep staat de categorienaam als klein label. Links van de bouwblokknaam staat het volgnummer en een accentrand van 4px in de categoriekleur (zelfde patroon als `bouwstenenmodel-visual.md`). De categoriekleur wordt nergens als vulling gebruikt. Bij AI-volwassenheid, dat geen categorielaag heeft, vervallen de groepslabels en staan de acht domeinen op volgorde.

**Getallen.** Eén decimaal, met komma. Bouwblokscores zijn ongewogen, zoals overal (`CLAUDE.md`, sectie 1). Een totaalscore komt uit de gedeelde scorefunctie met `Bouwblok.gewicht` en niet uit het gemiddelde van de getoonde bouwblokscores. Heeft een bouwblok een gewicht ongelijk aan 1, dan staat de factor ("2×") achter de naam. Scores worden berekend en nooit opgeslagen (`datamodel.md`, Scoreberekening).

**Kleur nooit alleen.** Elke stip, cel of lijn heeft een getal of label erbij. Rood en groen komen alleen samen voor als klassekleur, met het getal ernaast. Voor richting (stijging en daling) en positie (boven en onder de groep) gebruiken C en D blauw en oranje.

**Bovenaan** staat een rij met vier tegels met kerncijfers. Welke vier staat per weergave.

**Alleen desktop**, zoals de rest van de app.

**Lege en onvolledige toestand.** Een bouwblok zonder afgeronde scan toont een streepje en geen stip. Een weergave zonder enige afgeronde scan toont de bestaande lege-toestand van de resultaatcomponenten.

## A. Eén meting

**Plek.** De aggregatieweergave van een Meting (`beheerpagina.md`, Organisatie-resultaten), als aanvulling op of vervanging van wat daar nu staat. Dezelfde component wordt hergebruikt voor de Lead op zijn pagina.

**Data.** Per bouwblok het gemiddelde antwoord per vraag over de afgeronde scans van de Meting, daarop de gedeelde scorefunctie (zoals bij `benchmark.md`, Gedeelde regels, met de scans als leden).

**Opbouw.** Per bouwblok een rij met:

- Een stip op de gemiddelde score, gekleurd naar de klasse. Kleuren: `--stat-red` (Basis op Orde), `--stat-amber` (Uitbouwen) en `--stat-green` (Sterk punt). Dit is een klasse van drie stappen en dus een bewuste keuze naast de vijf scorekleuren van `stylesheet.md` (zie Open punten).
- Een dunne lijn van de laagste tot de hoogste bouwblokscore van een afgeronde scan.
- Rechts het gemiddelde als getal, vet.

**Tegels.** Totaalscore met de klasse, hoogste bouwblok (score en naam), laagste bouwblok (score en naam), en de verdeling van de bouwblokken over de drie klassen.

**Drempel.** De lijn van laagste tot hoogste toont de score van één scan en is bij weinig scans herleidbaar. Voor een Admin staat de lijn altijd aan. Voor een Lead staat de lijn pas aan vanaf `benchmarkMinRespondenten` (voorstel, startwaarde 5, zie `benchmark.md`, Niveau 3).

## B. Spreiding binnen een Meting (niveau 3)

Dit vult het onderdeel "Nog te ontwerpen" van `benchmark.md`, niveau 3.

**Plek.** De view van niveau 3, en daarnaast als verdieping onder weergave A voor een Admin.

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

**Plek.** De Metingen van één organisatie. De Admin of Consultant kiest twee Metingen van hetzelfde Assessment, een Lead ziet de vergelijking van zijn eigen Meting met de vorige Meting van hetzelfde bereik. Dit is het item "Trend tussen Metingen van dezelfde organisatie" uit `backlog.md`. Het is niet hetzelfde als niveau 2 van de benchmark.

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

## E. Matrix voor Metingen binnen een organisatie (niveau 2)

**Plek.** De weergave van niveau 2 (`benchmark.md`, Niveau 2, Weergave), per Assessment, naast het gemiddelde van alle gekozen Metingen. Alleen voor een Admin, omdat de kolomkoppen de labels van de Metingen tonen en een Lead die van andere Metingen niet mag zien (`benchmark.md`, Toewijzen aan een Lead op alle niveaus). Een Lead krijgt de view van zijn Meting tegenover de rest, in de opbouw van D.

**Data.** Per bouwblok het gemiddelde van elke gekozen Meting. Elke Meting telt even zwaar mee, ongeacht het aantal respondenten.

**Opbouw.** Rijen zijn bouwblokken, kolommen zijn de Metingen met hun label en het aantal afgeronde scans eronder. Elke cel is gevuld naar de klasse, met het getal erin. Rechts staan het gemiddelde van de rij en het bereik (laagste tot hoogste). Onderaan staat een rij Totaalscore, gekleurd op dezelfde manier. Een cel die 0,5 of meer afwijkt van het gemiddelde van de rij krijgt een zwarte rand van 2px.

**Tegels.** Hoogste Meting en laagste Meting (totaalscore en label), bouwblok met het grootste verschil tussen Metingen, aantal cellen met een zwarte rand.

**Andere kolommen.** Dezelfde matrix kan opeenvolgende Metingen in de tijd of organisaties tonen. Voor organisaties geldt dan de privacyregel van D en zijn de kolomkoppen anoniem. Dit is nu geen besluit en vraagt eerst een uitwerking.

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
- Of A en B samen één scherm zijn (met B als uitklapbare verdieping) of twee schermen.
- Een extra uitsplitsing van B naar Rol, bijvoorbeeld management tegenover medewerkers. Zie `backlog.md`.
- Meer dan twee Metingen in C.
- Export van deze weergaven naar PDF, CSV en InDesign.
