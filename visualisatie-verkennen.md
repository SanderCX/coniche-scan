# Coniche Scan: Verkennen

Spec voor het Admin-scherm Verkennen, waar je alle Organisaties van één Assessment door elkaar kunt filteren, groeperen en naast elkaar zetten.

**Status: Voorstel van 15 oktober 2026, gebouwd op 15 oktober 2026.** Er is een visual design (Claude Design, "Coniche Scan Verkennen") met voorbeelddata. Dat design (versie 6) toont ook het gedrag van Kenmerken en Groeperen op zoals hieronder beschreven (besloten op 15 oktober 2026), met een gedeeltelijke kenmerkenlijst: Sector, CRM-pakket, LLM-oplossing, Ingezette kanalen, AHT, NPS en FTR. De keuzes bij het bouwen staan onder Gebouwd. De korte namen, de pilvormige groep en de celtinten zijn gebouwd op 15 oktober 2026 (zie Gebouwd). Kenmerken en Groeperen op zijn gebouwd op 15 oktober 2026 naar versie 6 van het visual design. De vijf instelbare drempels (zie Drempels) zijn voorstel van 15 oktober 2026 en nog niet gebouwd, op de eerste twee na. Wat in dit document staat als "Besloten" komt uit het gesprek van 15 oktober 2026.

## Wat het is

Verkennen is bedoeld om vragen te beantwoorden als "scoren Organisaties met pakket X anders dan de rest?" en "hoe verschillend zijn de Organisaties die pakket X gebruiken onderling?". Het werkt op de hele pool van een Assessment, met kenmerken waarop je tijdens het kijken filtert en groepeert.

Het verschilt van de benchmark tussen Organisaties (`benchmark.md`, niveau 1):

- Een benchmark is een samengestelde groep die de Admin opslaat, bedoeld om aan een Lead te laten zien. Verkennen slaat niets op.
- Bij een benchmark kiest de Admin eerst de leden. Bij Verkennen is de hele pool het uitgangspunt en maken de gekozen waarden bij de kenmerken die kleiner.
- Verkennen is voor de Admin. Een Lead ziet het nooit.

De rekenregels van de benchmark gelden ook hier (`benchmark.md`, Gedeelde regels). Dat zijn één Meting per Organisatie en een gelijk gewicht voor elke Organisatie.

**Besloten.** Admin eerst. Een versie voor de Consultant volgt later (zie Later).

## Plek in beheer

De tab Verkennen onder de hoofdlink Resultaten, naast Metingen en Benchmarks, alleen zichtbaar voor een Admin (`beheerpagina.md`, punt 7 en 15). Kruimelpad Resultaten › Verkennen. Bovenaan staat de keuze van het Assessment. Alles daaronder werkt binnen dat ene Assessment.

## Pool

**Besloten.** De pool is per Assessment. Scores van verschillende Assessments worden niet door elkaar gezet.

- In de pool zitten Organisaties met `benchmarkToegestaan` die een Meting van het gekozen Assessment hebben met minstens `benchmarkMinScans` afgeronde scans.
- Per Organisatie telt de meest recente Meting die aan die eis voldoet, net als bij het samenstellen van een benchmark. Bij een samengestelde Meting (`benchmark.md`, Onderdeel en samengestelde Meting) telt die.
- De Admin ziet de namen van de Organisaties.
- De Zorgscan en de Klantcontact Volwassenheidsscan hebben dezelfde 15 bouwblokken, maar zijn aparte Assessments en dus aparte pools. De Zorgscan weegt bouwblok 4, 10 en 11 dubbel. Binnen een pool speelt dat niet, omdat bouwblokscores ongewogen zijn en de overall scoring van het Assessment volgt (`CLAUDE.md`, sectie 1).

**Teller.** Onderaan de kaart Kenmerken staat "X van Y Organisaties in de pool". Y is het aantal Organisaties dat voor het Assessment in aanmerking komt, X het aantal na de filters. Eronder staat een balk, en een regel met hoeveel Organisaties niet beschikbaar zijn omdat ze geen toestemming hebben gegeven voor benchmark. Dit volgt het patroon van de redenen onder de lijst bij het samenstellen van een benchmark.

## Drempels

**Besloten (15 oktober 2026).** Geen enkele groepsgrootte of grens in Verkennen is vast in de code. Alle vijf zijn instellingen, door een Admin aan te passen in het formulier Verkennen bij Instellingen, Drempels en termijnen (`beheerpagina.md`, punt 10, Formulier Verkennen). Het scherm leest ze en toont ze in zijn teksten, zodat een melding "Minder dan 6 Organisaties in de pool" met de instelling meeverandert.

| Instelling | Startwaarde | Waar |
|---|---|---|
| `verkennenMinGroep` | 3 | Een groep met minder Organisaties is gestreept getekend en krijgt in de heatmap geen cijfers ("n<3"). Ook het minimum voor het verband in weergave 4 ("Te weinig data"). |
| `verkennenMinVergelijking` | 5 | Heeft de focus of de rest minder Organisaties, dan staat er een waarschuwing dat verschillen voorzichtig gelezen moeten worden. |
| `verkennenMinPool` | 6 | Bij minder Organisaties in de pool kan er niet gegroepeerd worden. |
| `verkennenMaxGroepen` | 12 | Een select-kenmerk met meer verschillende waarden in de pool kan niet groeperen. |
| `verkennenMinIngevuldPct` | 40 | Een kenmerk dat bij minder dan dit percentage van de Organisaties in het Assessment is ingevuld, kan niet groeperen en staat grijs in het menu Kenmerk toevoegen. |

Alle vijf zijn gehele getallen van minstens 1, het percentage tot en met 100. De instellingen gelden voor alle Assessments. De startwaarden zijn de norm vanuit het ontwerp en een Admin past ze in de praktijk aan. De eerste twee staan op 15 oktober 2026 al in de app, door Joost op 2 en 2 gezet om te proberen. Het visual design toont het formulier onderaan, zoals het bij Instellingen staat, om te zien wat een andere waarde doet. De waarden gelden daar na Opslaan.

## Kenmerken en filters

**Besloten (15 oktober 2026).** Een kenmerk is een organisatieveld dat de Admin aan het scherm toevoegt. Een toegevoegd kenmerk is automatisch een filter en een mogelijke groepering. Wil je alleen filteren, dan kies je geen groepering. Wil je alleen groeperen, dan kies je bij het kenmerk geen waarden. Een kenmerk zonder gekozen waarde filtert niets.

De kenmerken komen uit de organisatievelden (`datamodel.md`, `VeldDefinitie`) en niet uit een vaste lijst in de code. Een nieuw veld is vanzelf een kenmerk. Het veldtype bepaalt het bedieningselement en of er op gegroepeerd kan worden.

- **Geen standaardkenmerken.** Het scherm begint leeg. Er staat geen sector of CRM-pakket vooraf, want de Admin bepaalt zelf waar de vraag over gaat.
- **De kaart Kenmerken.** Links of boven de kaart Vergelijken (op smalle schermen boven). Titel Kenmerken met een Info-icoon (`info.verkennenKenmerken`, `beheerpagina.md`, register), per kenmerk een rij, de knop "Kenmerk toevoegen", "Wis filters" en onderaan de teller.
- **Lege kaart.** De tekst "Nog geen kenmerken. Voeg een kenmerk toe om te filteren en te vergelijken." en daaronder een regel "Snel beginnen:" met losse keuzepillen voor CRM-pakket, Sector en AHT. Een pil voegt alleen dat kenmerk toe, hij kiest geen waarde. De drie zijn een snelkoppeling en geen vaste kenmerken. Zodra er een kenmerk staat, verdwijnt de regel.
- **Kenmerk toevoegen.** Een knop met een menu van alle organisatievelden van het type keuzelijst, getal en percentage. Het menu heeft een zoekveld en koppen per groep van velden, zoals Sector en subsector, Volume en klantbasis, Digitalisering, Techstack, FTE en KPI's. Onder een kop staat alleen de korte naam van het veld (zie Korte namen), met het volledige pad in een tooltip. Achter elk veld staat hoeveel Organisaties het hebben ingevuld, bijvoorbeeld "37 van 50". Velden die bij minder dan `verkennenMinIngevuldPct` van de Organisaties in het Assessment zijn ingevuld, staan grijs maar blijven te kiezen (zie Drempels). Een veld dat al is toegevoegd, staat uitgeschakeld met "toegevoegd" erachter. Een gekozen veld sluit het menu en verschijnt als rij.
- **Een kenmerkrij.** Bovenaan de korte naam van het kenmerk (potlood voor de korte namen van dat veld, zie Korte namen) en een kruisje om het kenmerk te verwijderen. Het kruisje haalt ook het filter weg. Daaronder het bedieningselement:
  - **Select en select-afhankelijk** (sector, subsector, leverancier per techstackcategorie, ondersteuner, deploymentmodel, cloudleverancier): Losse keuzepillen met de korte naam en het aantal Organisaties erachter. Meerdere pillen binnen één kenmerk werken als "of".
  - **Getal en percentage** (AHT, NPS, CSAT, SLA, FTR, FTE, contacten per kanaal, digitaliseringspercentage): Er is nog geen filter op bereik. De rij toont de tekst "Getal, 37 van 50 ingevuld. Te gebruiken bij Groeperen op." Het filter op bereik (twee handvatten, histogram) volgt later, zie Later.
  - **Ingezette kanalen**: Afgeleid uit de contacten per jaar per kanaal. Een kanaal telt als ingezet bij een waarde boven 0. Een leeg veld is onbekend en telt niet als "niet ingezet". Een Organisatie met "niet van toepassing" bij een kanaal telt als niet ingezet. Meerdere gekozen kanalen werken als "en": De Organisatie moet ze allemaal inzetten. Dit kenmerk is alleen een filter en geen groepering.
- **Verschillende kenmerken werken als "en".** Het kenmerk sector en het kenmerk kanalen beperken de pool dus allebei.
- **Organisaties zonder waarde** voor een kenmerk met een gekozen waarde vallen bij dat filter weg. Bij een getal staat erbij hoeveel Organisaties het hebben ingevuld (bijvoorbeeld "37 van 50"), omdat de organisatievelden nog niet overal gevuld zijn.
- **Wis filters** wist de gekozen waarden en laat de kenmerken staan. Het kruisje bij een kenmerk haalt het kenmerk zelf weg.

## Korte namen

**Gebouwd op 15 oktober 2026.** Namen als "Activiteiten op het gebied van financiële dienstverlening en verzekeringen" of "Volume en klantbasis › Totaal aantal contacten per jaar, per kanaal › Call" zijn te lang voor een pil, een menuregel of een kolomkop. Een korte naam is een weergavenaam naast het origineel. Hij kan bij veldnamen en bij waarden.

- **Waar hij staat.** Overal in Verkennen waar een veld of waarde getoond wordt: Het menu Kenmerk toevoegen, de pillen, de groepsnamen, de kolomkoppen van de heatmap en de assen en tooltips van het spreidingsdiagram. Bij hover op een pil of menuregel staat het origineel in een tooltip.
- **Waar hij niet staat.** In het organisatie-detail, de exports en de import. Daar blijft het origineel staan. De Organisatie bewaart altijd het origineel, zodat er geen twee namen voor één waarde in de data komen.
- **Beheer.** Een Admin vult ze in bij Organisatievelden, op de tab Korte namen (`beheerpagina.md`, punt 3). Ook op de plek zelf: Een potlood naast de naam van een kenmerk opent een modal met de waarden van dat ene veld. Het recht is `content.beheren`, dus alleen een Admin.
- **Uitleg.** De uitleg bij de tabel staat in een Info-icoon (`info.korteNamen`, `beheerpagina.md`, punt 2a). Het visual design toont hem als vaste tekst.
- **Regels.** Hoogstens 30 tekens en uniek binnen een veld, zonder verschil tussen hoofdletters en kleine letters. Een lege korte naam betekent het origineel. Twee waarden onder dezelfde naam samenvoegen kan dus niet.
- **Wat de Admin invult.** Waarden die in gebruik zijn en nog geen korte naam hebben, staan in de tabel bovenaan. Waarden die Organisaties zelf invullen via "Anders…" komen daar vanzelf bij, met een lege korte naam. Voor de SBI-sectoren zijn beginwaarden voorgesteld (`sbi-indeling.md`, Korte namen).
- **Opslag.** `VeldDefinitie.korteNaam` voor veldnamen en `KorteNaam` voor waarden (`datamodel.md`).
- **Benchmark.** Het sectorfilter bij het samenstellen van een benchmark (`benchmark.md`) kan dezelfde korte namen gebruiken. Dat vraagt nog bevestiging.

## Groeperen en focus

**Besloten (15 oktober 2026).** Groeperen verdeelt de pool (na de filters) in groepen. Eén groep is de focus. De rest zijn de Organisaties van de andere groepen. Wie voor het gekozen kenmerk geen waarde heeft, zit in geen groep en telt niet mee in de rest. Welke groepering er kan, volgt uit de kenmerken: Wat de Admin heeft toegevoegd en bruikbaar is, staat bij Groeperen op.

- **Groeperen op** is een pilvormige groep (`stylesheet.md`, Keuzepil en pilvormige groep) met één pil per kenmerk dat kan groeperen, met precies één gekozen pil. Naast het label staat een Info-icoon (`info.verkennenGroeperen`, `beheerpagina.md`, register).
- **Geen kenmerk.** Is er nog geen kenmerk toegevoegd, dan staat er in plaats van de groep één losse, grijze, uitgeschakelde pil "Geen kenmerk", 32px hoog zoals de andere pillen en zonder houder eromheen. Het Info-icoon geeft dan de tekst "Er is nog geen kenmerk om op te groeperen. Voeg bij Kenmerken een kenmerk toe, dan kun je de Organisaties erop in groepen verdelen." Onder de pil staat "Voeg bij Kenmerken een kenmerk toe om te beginnen." Er is dan ook geen resultaat, zie Zonder groepering voor de pool die er wel is.
- **Het eerste bruikbare kenmerk** dat de Admin toevoegt, wordt automatisch de groepering. Daarna verandert de groepering alleen als de Admin een andere pil kiest, of door de terugval hieronder.
- **Wanneer een kenmerk kan groeperen.** Een kenmerk is een pil, maar die is uitgeschakeld (50% dekking, `not-allowed`, nooit gekozen) in deze gevallen. De reden staat in een tooltip en als regel van 12px in grijs onder de groep:
  - De pool heeft minder dan `verkennenMinPool` Organisaties (nu 6): Alle pillen zijn uitgeschakeld. Reden: "Minder dan 6 Organisaties in de pool".
  - Het kenmerk is bij minder dan `verkennenMinIngevuldPct` (nu 40%) van de Organisaties in het Assessment ingevuld (bij 50 Organisaties dus minder dan 20). Reden: "Minder dan 20 ingevulde waarden".
  - Een select-kenmerk waarvan na de filters nog één waarde over is. Reden: "Het filter laat één waarde over".
  - Een select-kenmerk met meer dan `verkennenMaxGroepen` (nu 12) verschillende waarden in de pool. Reden: "Meer dan 12 verschillende waarden".
  - Ingezette kanalen kan niet groeperen.
- **Terugval.** Wordt het gekozen kenmerk onbruikbaar (door een filter) of verwijdert de Admin het, dan gaat de groepering naar de eerste pil die wel kan, met een melding in de stijl van `--stat-amber-faint`: "<Reden>. De groepering staat nu op <kenmerk>." Kan geen enkele pil meer, dan is er geen pil gekozen en staat er een melding: "Er is geen kenmerk meer om op te groeperen." of, als de pool te klein is, "Met deze filters zit er 1 Organisatie in de pool. Dat is te weinig om te vergelijken. Haal een filter weg." (met het werkelijke aantal). De resultaten tonen dan de hele pool, zie Zonder groepering.
- **Groeperen op een select-kenmerk** (CRM-pakket, sector): Eén groep per waarde die in de pool voorkomt. Organisaties zonder waarde horen bij geen groep en staan als "n zonder waarde" onder de groepen.
- **Groeperen op een getal-kenmerk** (AHT, NPS, FTR): Een drempel met twee groepen, "≤ drempel" en "> drempel". De pil heet "<korte naam>-drempel". De slider loopt van het laagste tot het hoogste getal in de pool, met de eenheid van het veld (`VeldDefinitie.eenheid`). De startwaarde is de mediaan van de pool. Boven de slider staat een histogram, waarin de staven van de focusgroep oranje zijn. Onder de slider staat hoeveel Organisaties aan elke kant zitten. De groepen krijgen neutrale namen ("≤ 420 s" en "> 420 s"), geen oordeel als "snel" of "langzaam". Er is een apart drempelfilter niet nodig: De drempel is de groepering.
- **Focusgroep**: Losse keuzepillen met de groepsnaam en het aantal. De gekozen pil is massief oranje. Bij het wisselen van groepering wordt de grootste groep de focus.
- **Kleine groepen.** Een groep met minder dan `verkennenMinGroep` Organisaties (nu 3) is gestreept getekend en krijgt in de heatmap geen cijfers. Heeft de focus of de rest minder dan `verkennenMinVergelijking` (nu 5), dan staat er een waarschuwing dat verschillen voorzichtig gelezen moeten worden. Het is geen blokkade, want de Admin mag de namen zien. Beide zijn instellingen (zie Drempels).
- Is de focus of de rest leeg, dan staat er een melding en geen grafiek.

## Weergaven

Vier weergaven (met groepering, zie Zonder groepering voor de pool zonder), gekozen met de weergave-schakelaar boven de resultaten, een pilvormige groep (`stylesheet.md`, Keuzepil en pilvormige groep). Het visual design toont ze nog als tabs met een onderstreping en dat is niet de bedoeling: Bij het bouwen geldt de pilvormige groep, net als op elke andere resultatenpagina. De rijen zijn de bouwblokken, gegroepeerd per categorie met de categoriekleur (`stylesheet.md`, Categoriekleuren). Bij een Assessment zonder categorielaag (de AI-scan) zijn de rijen de domeinen, zonder kopregels.

### 1. Groep tegenover de rest

Per bouwblok een rij met een schaal van 1 tot 5. Elke Organisatie in de pool is een stip: De focus oranje en iets groter, de rest grijs. Een staande streep markeert het gemiddelde van de focus (oranje) en van de rest (donkergrijs), met een lijn ertussen. Aan de rechterkant staan het gemiddelde van de focus, het gemiddelde van de rest en het verschil als staafje met een getal. Een verschil boven 0 is blauw (`--bl`) en onder 0 donkeroranje (`--dal`). Achter elke rij staan de drie banden van de klassen in de lichte klassekleuren (`stylesheet.md`, Drie niveaus van scorekleur), zoals in `visualisatie-scores.md`, onderdeel A. Hover op een stip toont de naam van de Organisatie en de score.

Boven de rijen staan vier kaarten: Het gemiddelde van de focus (overall), het gemiddelde van de rest, de grootste plus en de grootste min per bouwblok.

### 2. Spreiding binnen de groep

Dezelfde rijen, maar alleen de stippen van de focus. Daarachter staan het bereik (laagste tot hoogste score) als dunne lijn, de middelste helft van de focus als oranje balk en de mediaan als staande streep. De middelste helft van de rest staat als grijze balk op de achtergrond, ter vergelijking, boven dezelfde klassebanden als in weergave 1. Rechts staan de mediaan, de spreiding (standaarddeviatie) en het bereik als tekst. Dezelfde vier kaarten staan erboven.

### 3. Alle groepen naast elkaar

Een heatmap met de bouwblokken als rijen en de groepen als kolommen. De eerste kolom toont de hele pool met het gemiddelde in de celtinten (`stylesheet.md`, Drie niveaus van scorekleur) en niet in de volle scorekleuren. De andere kolommen tonen per groep het verschil met het gemiddelde van de hele pool, blauw (`--bl`) voor boven en donkeroranje (`--dal`) voor onder, met een dekking die meegroeit tot maximaal 35% bij een verschil van 1,0 of meer. Elke kolom is 96px breed. De kolomkop is de korte naam van de groep op één regel, met "n = 11" in een tweede regel van 12px, en de volledige naam in een tooltip (`stylesheet.md`, Kolomkop en rijkop). Een kop wordt niet hoger of breder voor een lange naam. Een groep met minder dan `verkennenMinGroep` Organisaties is grijs met "n<3" (het getal volgt de instelling). Hover toont het gemiddelde van de groep en dat van de pool. Een klik op een kolomkop maakt die groep de focus en opent weergave 1.

### 4. Verband met een kenmerk

Een spreidingsdiagram van 780 bij 380 pixels. Horizontaal staat een numeriek organisatieveld (nu AHT, FTR of NPS), verticaal de overall score of de score van één bouwblok. De focus is oranje, de rest grijs. Een rechte lijn (kleinste kwadraten) laat de richting zien. Naast het diagram staan de correlatiecoëfficiënt r, het aantal Organisaties en een woord bij de sterkte (onder 0,2 nauwelijks, onder 0,4 zwak, onder 0,6 matig, daarboven sterk, met de richting erbij). Bij minder dan `verkennenMinGroep` Organisaties met een waarde staat er "Te weinig data". Onder de coëfficiënt staat een korte zin dat scores zelfrapportage zijn en dat sector en kanaalmix meespelen, zodat een verband geen oorzaak is. Achter het diagram staan horizontale banden op de overall score (onder 2,5, 2,5 tot 3,5 en vanaf 3,5) in de lichte klassekleuren.

### Zonder groepering

**Besloten (15 oktober 2026).** Is er geen groepering, omdat er nog geen kenmerk is of er geen meer kan, dan is de hele pool de focus en is er geen rest. Alle weergaven blijven werken. De pool is dan nog niet gefilterd of heeft alleen filters.

- **1. Groep tegenover de rest.** Alle stippen zijn oranje, met één streep op het gemiddelde van de pool. De kolommen Rest en Verschil vervallen. De vier kaarten zijn het gemiddelde van de pool (overall), het aantal Organisaties, het hoogste bouwblok en het laagste bouwblok.
- **2. Spreiding binnen de groep.** Alleen de pool. De grijze achtergrondbalk van de rest vervalt.
- **3. Alle groepen naast elkaar.** Alleen de kolom Hele pool, met de hint "Kies een kenmerk om groepen naast elkaar te zetten".
- **4. Verband met een kenmerk.** Alle stippen oranje, de lijn en r over de hele pool.

## Sorteren

Bij weergave 1 en 2 kan de Admin kiezen tussen de volgorde van het model (met kopregels per categorie) en sorteren op grootste verschil (weergave 1) of grootste spreiding (weergave 2). Zonder groepering is Grootste verschil uitgeschakeld. Bij sorteren vervallen de kopregels, de categoriekleur blijft als streepje voor de naam.

## Rekenregels

- Per Organisatie telt de bouwblokscore van haar Meting (`CLAUDE.md`, sectie 1).
- Het gemiddelde van een groep is het gemiddelde van de scores van haar Organisaties, dus elke Organisatie telt even zwaar. Het aantal scans binnen een Meting speelt geen rol.
- De overall van een Organisatie volgt de Overall score van het Assessment (met weging waar die geldt). Het gemiddelde van een groep is het gemiddelde van die overalls.
- Het verschil is het gemiddelde van de focus min dat van de rest, op één decimaal. Het teken is een plus of een min (−), en bij een verschil van minder dan 0,05 staat er geen teken.
- Kwartielen en mediaan gebruiken lineaire interpolatie. De spreiding is de standaarddeviatie met n−1, en blijft leeg bij minder dan 2 Organisaties.
- In de heatmap telt de groep zelf mee in het gemiddelde van de hele pool.
- Afronding volgt `CLAUDE.md`, sectie 1, en geldt alleen voor getoonde waarden.

## Opmaak

Alle opmaak staat in `stylesheet.md`. Het ontwerp gebruikt de bestaande tokens, Epilogue, kaarten met 10px radius en de eyebrow in oranje. De pilvormige groep (`.weergave-wissel`) dient voor de vier weergaven, voor Groeperen op en voor Sorteren. De waarden bij een kenmerk, de Snel beginnen-pillen, de pil Geen kenmerk en de focusgroepen zijn losse keuzepillen, en een gekozen pil is overal massief oranje (`stylesheet.md`, Keuzepil en pilvormige groep). Nieuw zijn de kaart Kenmerken, de slider met histogram, de uitgeschakelde pil in een groep, de melding bij de terugval, de waarschuwing bij een kleine groep, het menu Kenmerk toevoegen en de modal Korte namen. Die staan als voorstel in `stylesheet.md`, onder Filterchip, focuschip en slider (Verkennen) en de onderdelen daarna.

Kleuren in de grafieken: Focus oranje (`--or`), rest grijs (`rgba(136,136,132,.5)`), gemiddelde van de rest `--ink-m`, verschil boven 0 blauw (`--bl`) en onder 0 donkeroranje (`--dal`). De scorekleuren staan alleen op absolute scores, zoals de eerste kolom van de heatmap, en daar als celtint. Er is geen zwarte vulling of rand. Lettergroottes komen uit de schaal van acht maten (`stylesheet.md`, Lettergroottes), ook in de grafieken (minimaal 12px).

## Privacy en rechten

- Alleen een Admin ziet Verkennen, met de permissie `verkennen.inzien` (`datamodel.md` deel 2, Rechtenmatrix). Dat sluit aan op de benchmark, waar de Admin de namen van de Organisaties ook ziet (`benchmark.md`, Weergave voor de Admin).
- Er is geen minimale groepsgrootte voor het tonen van cijfers aan de Admin. Wel geldt de waarschuwing bij kleine groepen.
- Het scherm slaat niets op. De kenmerken, de gekozen waarden en de groepering verdwijnen als de Admin het scherm verlaat.

## Later

- **Consultant.** Een Consultant mag de namen van Organisaties die niet de zijne zijn niet zien. Dan gelden `benchmarkMinOrganisaties` voor beide kanten van elke splitsing (focus en rest) en de regel dat een filter dat een kant onder de drempel brengt niets toont. Anders is een Organisatie terug te rekenen uit het verschil tussen groep en rest. Voor de eigen klanten van de Consultant kan een uitzondering gelden, die moet nog besloten worden.
- **Operationele KPI's als kenmerk.** Dit werkt vanzelf zodra ze organisatievelden zijn.
- **Filter op bereik bij getallen** (twee handvatten met histogram, of één drempel). Nu is een getal alleen te gebruiken bij Groeperen op.
- **AHT per kanaal.** Dit is een wijziging in het datamodel: AHT wordt een subveld bij elk kanaal in plaats van één los KPI-veld. Het filter combineert dan "kanaal ingezet" met een AHT-slider voor dat kanaal. Dit moet Sander inpassen in `datamodel.md`.
- **Bewaren als benchmark.** Een filterstand kan een benchmark worden (`benchmark.md`, Samenstellen), en dat is ook de route om het resultaat aan een Lead te tonen.
- **Export** van de gefilterde pool als CSV (`export-csv.md`).
- **Quickscan Ziekenhuis.** De antwoorden zijn percentages (`visualisatie-quickscan.md`), dus de schaal wordt 0 tot 100%, met de classificatiekleuren van de Quickscan.
- **Meerdere Metingen per Organisatie.** Nu telt de meest recente. Een tijdsdimensie hoort bij niveau 2 van de benchmark.

## Open punten

- Werken meerdere gekozen kanalen als "en" of als "of"? Het ontwerp gebruikt "en".
- Zijn 3, 5, 6, 12 en 40% de juiste startwaarden voor de vijf drempels (zie Drempels)? Met ongeveer 10 Organisaties per branche vallen combinaties van sector en pakket snel onder 5.
- Welke drie pillen staan bij Snel beginnen? Nu CRM-pakket, Sector en AHT. Het kunnen er ook meer of andere zijn.
- Groeperen op is een pilvormige groep die met elk kenmerk groeit. Voorstel: Boven ongeveer vijf pillen gaan de overige achter een pil "Ander kenmerk…" met hetzelfde menu met zoekveld.
- Moet een getalkenmerk naast Groeperen op ook een filter op bereik krijgen?
- Komt er naast SBI een eigen veld Branche (`backlog.md`)? Korte namen blijven dan nodig voor de andere lijsten, het sectorfilter wordt er mogelijk minder belangrijk door.
- Gebruikt het sectorfilter bij het samenstellen van een benchmark ook de korte namen?

## Gebouwd

Gebouwd op 15 oktober 2026. De berekeningen staan in `lib/verkennen.ts` (met tests in `lib/verkennen.test.ts`), het scherm in
`app/beheer/verkennen/page.tsx` en de onderdelen in `components/verkennen/`.

**Kenmerken en Groeperen op** (gebouwd op 15 oktober 2026, vervangt de eerste versie met Sector en kanalen als standaard)

- Het scherm begint leeg. `components/verkennen/KenmerkenKaart.tsx` is de kaart Kenmerken, `FilterMenu.tsx` het menu Kenmerk
  toevoegen, `Vergelijken.tsx` Groeperen op en de focusgroep. De stand (kenmerken, gekozen waarden, groepering, drempel) staat in
  de pagina `app/beheer/verkennen/page.tsx` en wordt niet opgeslagen.
- Of een kenmerk kan groeperen staat in `kanGroeperen` (`lib/verkennen.ts`, met tests). De drempels zijn constanten met de
  startwaarden uit de spec: `MIN_POOL_GROEPEREN` (6), `MAX_WAARDEN_GROEPEREN` (12) en `MIN_INGEVULD_AANDEEL` (40%). Een getal
  kan niet groeperen als er geen twee verschillende waarden zijn.
- Het eerste bruikbare kenmerk dat de Admin toevoegt wordt de groepering. De terugval gebeurt zodra de gekozen groepering niet meer
  kan: De groepering staat dan op het eerste kenmerk dat wel kan, met de melding. Wordt de eerder gekozen groepering weer
  bruikbaar (bijvoorbeeld na "Wis filters"), dan keert de groepering daarnaar terug.
- De rest zijn de Organisaties van de andere groepen (`splitsFocus`). Wie het kenmerk niet heeft, zit in geen groep en staat als
  "n zonder waarde" onder de focusgroep.
- Zonder groepering is de hele pool de focus: Weergave 1 en 2 tonen alleen de pool met de kaarten Gemiddelde van de pool,
  Organisaties, Hoogste en Laagste bouwblok, de heatmap alleen de kolom Hele pool met de hint, en Grootste verschil is
  uitgeschakeld (met een tooltip).
- De drempel bij een getal gebruikt `VeldDefinitie.eenheid`: Alleen AHT heeft "s", bij een percentage is het "%". Groepsnamen
  zijn "≤ 420 s" en "> 420 s".
- Ingezette kanalen staat als kenmerk in het menu (groep Volume en klantbasis), alleen als filter en niet als groepering.
- Nog niet: De pil "Ander kenmerk…" boven ongeveer vijf pillen (open punt), en een filter op bereik bij getallen (Later).
- De pool-eis van 6 Organisaties betekent dat Groeperen op bij de seed (3 Organisaties met toestemming) niet kan: De pool
  verschijnt dan zonder groepering, met de reden onder Groeperen op.

**Keuzes waar de spec open liet** (de open punten hierboven, met de gebouwde waarde)

- Meerdere gekozen kanalen werken als "en", zoals in het ontwerp. Een Organisatie met een leeg veld voor een gekozen kanaal valt weg.
- De drempels zijn instellingen bij Drempels en termijnen, nu vijf (zie Drempels hieronder, gebouwd op 15 oktober 2026): Het
  formulier Verkennen, `info.verkennenInstellingen`. `verkennenWaarschuwingGroep` heet `verkennenMinVergelijking`. Het scherm
  leest ze en toont ze in zijn meldingen, ook de grens voor grijs in het menu Kenmerk toevoegen en het minimum voor het verband.
- Groeperen kan op CRM-pakket (`techstack.techstack-crm.leverancier`), sector en de AHT-drempel. De AHT-drempel begint op de
  mediaan van de gefilterde pool, afgerond.
- Filters: Sector staat er standaard en de ingezette kanalen. "Filter toevoegen" biedt elk select- of getalveld uit de
  organisatievelden dat in de pool minstens één waarde heeft. Een getalfilter is een bereik met twee schuiven (geen losse drempel).
  De chips tonen de aantallen in de hele pool, de teller "X van Y" volgt de filters.
- Een groep zonder waarde voor het groeperingsveld hoort bij geen groep, maar telt wel mee in de rest.
- Het verband (weergave 4) neemt de Organisaties na de filters, met AHT, FTR of NPS horizontaal. De lijn en r komen bij minstens
  3 Organisaties met een waarde.
- Het Assessment-keuzeveld toont geen Assessment met Ja / Nee / Weet ik niet (Later).

**Korte namen en opmaakronde** (gebouwd op 15 oktober 2026)

- De korte namen staan bij de instellingen (`Instellingen.korteNamen`, server-sleutel `instellingen`), met pure functies in
  `lib/korte-namen.ts` (met tests). Voor de Secties van de SBI gelden de beginwaarden uit `sbi-indeling.md` zolang er geen
  opgeslagen korte naam is. Een lege opgeslagen korte naam betekent bewust het origineel.
- Het filtermenu (`components/verkennen/FilterMenu.tsx`) biedt elk select- of getalveld, ook als de pool er geen waarden voor heeft:
  Zo'n veld staat grijs. De grens voor grijs is 40% van de Organisaties in de pool en staat nu als constante in de code.
- Het potlood naast de kop van een filter staat bij select-velden en opent de modal met de waarden van dat veld, op volgorde van
  "in gebruik zonder korte naam" eerst.
- De groepsnaam (chip, heatmapkolom) is de korte naam van de waarde, het origineel staat in de tooltip. De kenmerken bij Verband
  gebruiken de korte naam van het veld.
- Het info-icoon bij Groeperen op is `info.verkennenGroeperen`. Groeperen kent altijd een keuze (startwaarde CRM-pakket).
- Nog niet: Het sectorfilter bij het samenstellen van een benchmark gebruikt de korte namen niet (open punt hieronder), en een
  opgeslagen korte naam voor een waarde die nergens meer voorkomt wordt niet opgeruimd in Data-integriteit.

**Nog niet gebouwd**: Wat onder Later staat.
