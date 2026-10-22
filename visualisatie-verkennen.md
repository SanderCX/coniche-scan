# Coniche Scan: Verkennen

Spec voor het Admin-scherm Verkennen, waar je alle Organisaties van één Assessment door elkaar kunt filteren, groeperen en naast elkaar zetten.

Ontwerp: Claude Design, "Coniche Scan Verkennen", met voorbeelddata (versie 6, en versie 14 voor de eenheid Onderdelen en Opslaan als benchmark). Het design toont het gedrag van Kenmerken en Groeperen op zoals hieronder beschreven, met een gedeeltelijke kenmerkenlijst: Sector, CRM-pakket, LLM-oplossing, Ingezette kanalen, AHT, NPS en FTR.

## Wat het is

Verkennen is bedoeld om vragen te beantwoorden als "scoren Organisaties met pakket X anders dan de rest?" en "hoe verschillend zijn de Organisaties die pakket X gebruiken onderling?". Het werkt op de hele pool van een Assessment, met kenmerken waarop je tijdens het kijken filtert en groepeert.

Het verschilt van de benchmark tussen Organisaties (`benchmark.md`, niveau 1):

- Een benchmark is een samengestelde groep die de Admin opslaat, bedoeld om aan een Lead te laten zien. Verkennen slaat zelf niets op. Wel kan de Admin de filters opslaan als benchmark (Opslaan als benchmark), en dan is dat een Verkenning-benchmark met de leden die uit de filters volgen.
- Bij een benchmark kiest de Admin eerst de leden. Bij Verkennen is de hele pool het uitgangspunt en maken de gekozen waarden bij de kenmerken die kleiner.
- Verkennen is voor de Admin. Een Lead ziet het scherm nooit. Een Lead kan wel een opgeslagen verkenning als benchmark krijgen (`benchmark.md`, Niveau 1, Opgeslagen verkenning).

De rekenregels van de benchmark gelden ook hier (`benchmark.md`, Gedeelde regels). Dat zijn één Meting per Organisatie en een gelijk gewicht voor elke Organisatie.

Admin eerst. Een versie voor de Consultant volgt later (zie Later).

## Plek in beheer

De tab Verkennen onder de hoofdlink Resultaten, naast Metingen en Benchmarks, alleen zichtbaar voor een Admin (`beheerpagina.md`, punt 7 en 15). Kruimelpad Resultaten › Verkennen. Bovenaan staat de keuze van het Assessment. Alles daaronder werkt binnen dat ene Assessment.

## Eenheid

Boven de kaart Kenmerken staat een pilvormige groep Eenheid met Organisaties en Onderdelen, naast een Info-icoon. Organisaties is de standaard en is wat hierboven staat.

- **Organisaties.** Elke Organisatie telt één keer mee, met de Meting die telt volgens de Meetperiode (Meetperiode). Dat mag een gewone of een samengestelde Meting zijn.
- **Onderdelen.** Elke gewone Meting met een onderdeel is een eenheid (`benchmark.md`, Welke Meting telt waar). Een samengestelde Meting telt nooit mee, want haar onderdelen zijn de onderliggende Metingen zelf. Een Organisatie met alleen een samengestelde Meting heeft dus geen onderdelen en doet niet mee. Een Organisatie met drie onderdelen telt drie keer. Een Organisatie met één Meting zonder onderdeel heet in de lijst "Hele organisatie". Per onderdeel telt de laatste Meting binnen de Meetperiode die aan `benchmarkMinScans` voldoet. De pool, de teller en de balk, de drempels, de groepen en de teksten gaan over onderdelen en gebruiken het woord "onderdelen". Een regel onder de teller noemt uit hoeveel Organisaties de pool bestaat, bijvoorbeeld "3 onderdelen van 1 Organisatie".
- **Gelijk gewicht.** Elk onderdeel telt even zwaar, ook als een Organisatie er meer heeft dan een andere (`benchmark.md`, Gedeelde regels). Een Organisatie met vier onderdelen telt dus vier keer zwaar in het gemiddelde. De voettekst zegt dat.
- **Drempels.** Dezelfde vijf instellingen (Drempels) gelden voor onderdelen, met de eenheid onderdelen in de tekst. Er komen geen aparte instellingen bij.
- **Nieuwe kenmerken.** Alleen bij Onderdelen staan er twee kenmerken bij in het menu, in de groep "Organisatie en onderdeel".
  - **Organisatie.** De pillen zijn de Organisaties die meer dan één onderdeel hebben, want een Organisatie met één onderdeel heeft niets om naast elkaar te zetten. Dit kenmerk kan filteren en groeperen. Groeperen op Organisatie geeft de Organisaties als groepen van onderdelen.
  - **Onderdeel.** De pillen zijn de namen van de onderdelen. Namen verschillen per Organisatie ("Particulier" bij de ene, "Retail" bij de andere), dus Onderdeel kan alleen groeperen als de filters op één Organisatie staan. Anders staat de pil uitgeschakeld, met de reden "Onderdelen heten per Organisatie anders. Filter eerst op één Organisatie".
- **Wisselen van eenheid.** Wisselt de Admin van Onderdelen naar Organisaties, dan vervallen de kenmerken Organisatie en Onderdeel en hun filters. Was een van beide de groepering, dan geldt de terugval (Groeperen en focus), met de reden "Organisatie en Onderdeel bestaan alleen bij Eenheid Onderdelen".
- **Snel beginnen.** De pillen bij Snel beginnen volgen de eenheid. Bij Onderdelen is Organisatie er een van.
- **Weergaven.** Ongewijzigd. De naam in de heatmap en in de lijsten is bij Onderdelen "{Organisatie}, {onderdeel}", of de naam van de Organisatie bij "Hele organisatie".
- **KPI's per onderdeel.** Een KPI als kenmerk gebruikt bij Onderdelen de waarde van dat onderdeel, en bij "Hele organisatie" de waarde Algemeen van de Organisatie (KPI's als kenmerk). De andere kenmerken, zoals Sector en CRM-pakket, komen van de Organisatie en zijn dus gelijk voor alle onderdelen van die Organisatie.

## Meetperiode

Naast Assessment en Eenheid staat de keuze Meetperiode, op een eigen regel eronder, als pilvormige groep met "Meest recente" en "Periode". De volgorde bovenaan is Assessment, Eenheid, Meetperiode. De pillen zijn even hoog als de keuzelijst van het Assessment.

- **Meest recente.** De standaard. Per Organisatie, bij de eenheid Onderdelen per onderdeel, telt de meest recente Meting. Onder de keuze staat "Per organisatie telt de meest recente Meting."
- **Periode.** Twee datumvelden, "tot en met" ertussen. Per Organisatie (of onderdeel) telt de laatste Meting met een meetdatum in die periode. Zo blijft een eerdere meting te vergelijken, ook als een nieuwe al deels binnen is. Het gebruik is bijvoorbeeld half januari tot begin februari voor de eerste meting en een periode in oktober voor de volgende.
- **Zonder Meting in de periode.** Die Organisatie of dat onderdeel doet niet mee. Onder de keuze staat hoeveel er afvallen: "Per organisatie telt de laatste Meting tussen 12-01-2026 en 10-02-2026. 6 organisaties hebben geen Meting in deze periode en doen niet mee."
- **Pool en drempels.** De pool, de teller, de drempels en de groepen gaan over wat na de periode overblijft. Datums staan als dd-mm-jjjj.
- **Info-icoon.** "Per Organisatie telt de laatste Meting met een meetdatum in deze periode. Zo kun je de eerste meting blijven vergelijken, ook als de volgende al deels binnen is. Zonder periode telt de meest recente Meting. Een Organisatie zonder Meting in de periode doet niet mee."
- **Opslaan.** De periode wordt meegenomen bij Opslaan als benchmark (Opslaan als benchmark). Een periode die meeschuift, zoals de laatste twaalf maanden, is er niet.
- **Bij een lege periode.** Valt alles weg, dan geldt de bestaande melding over een te kleine pool.

## Pool

De pool is per Assessment. Scores van verschillende Assessments worden niet door elkaar gezet.

- In de pool zitten Organisaties met `benchmarkToegestaan` die een Meting van het gekozen Assessment hebben met minstens `benchmarkMinScans` afgeronde scans.
- Per Organisatie telt de Meting die volgens de Meetperiode telt en aan die eis voldoet (Meetperiode). Bij de eenheid Organisaties mag dat een samengestelde Meting zijn (`benchmark.md`, Welke Meting telt waar). Bij de eenheid Onderdelen nooit.
- De Admin ziet de namen van de Organisaties.
- De Zorgscan en de Klantcontact Volwassenheidsscan hebben dezelfde 15 bouwblokken, maar zijn aparte Assessments en dus aparte pools. De Zorgscan weegt bouwblok 4, 10 en 11 dubbel. Binnen een pool speelt dat niet, omdat bouwblokscores ongewogen zijn en de totaalscore scoring van het Assessment volgt (`CLAUDE.md`, Scoringslogica).

**Teller.** Onderaan de kaart Kenmerken staat "X van Y Organisaties in de pool". Y is het aantal Organisaties dat voor het Assessment in aanmerking komt, X het aantal na de filters. Eronder staat een balk, en een regel met hoeveel Organisaties niet beschikbaar zijn omdat ze geen toestemming hebben gegeven voor benchmark. Dit volgt het patroon van de redenen onder de lijst bij het samenstellen van een benchmark.

## Drempels

Geen enkele groepsgrootte of grens in Verkennen is vast in de code. Alle vijf zijn instellingen, door een Admin aan te passen in het formulier Verkennen bij Instellingen, Drempels en termijnen (`beheerpagina.md`, punt 10, Formulier Verkennen). Het scherm leest ze en toont ze in zijn teksten, zodat een melding "Minder dan 6 Organisaties in de pool" met de instelling meeverandert.

| Instelling | Startwaarde | Waar |
|---|---|---|
| `verkennenMinGroep` | 3 | Een groep met minder Organisaties is gestreept getekend en krijgt in de heatmap geen cijfers ("n<3"). Ook het minimum voor het verband in weergave 4 ("Te weinig data"). |
| `verkennenMinVergelijking` | 5 | Heeft de focus of de rest minder Organisaties, dan staat er een waarschuwing dat verschillen voorzichtig gelezen moeten worden. |
| `verkennenMinPool` | 6 | Bij minder Organisaties in de pool kan er niet gegroepeerd worden. |
| `verkennenMaxGroepen` | 12 | Een select-kenmerk met meer verschillende waarden in de pool kan niet groeperen. |
| `verkennenMinIngevuldPct` | 40 | Een kenmerk dat bij minder dan dit percentage van de Organisaties in het Assessment is ingevuld, kan niet groeperen en staat grijs in het menu Kenmerk toevoegen. Bij 0 geldt geen ondergrens. |

Alle vijf zijn gehele getallen van minstens 1. Alleen het percentage mag 0 zijn (geen ondergrens) en gaat tot en met 100. De instellingen gelden voor alle Assessments. De startwaarden kan een Admin aanpassen.

## Kenmerken en filters

Een kenmerk is een organisatieveld dat de Admin aan het scherm toevoegt. Een toegevoegd kenmerk is automatisch een filter en een mogelijke groepering. Wil je alleen filteren, dan kies je geen groepering. Wil je alleen groeperen, dan kies je bij het kenmerk geen waarden. Een kenmerk zonder gekozen waarde filtert niets.

De kenmerken komen uit de organisatievelden (`datamodel.md`, `VeldDefinitie`) en niet uit een vaste lijst in de code. Een nieuw veld is vanzelf een kenmerk. Het veldtype bepaalt het bedieningselement en of er op gegroepeerd kan worden.

- **Geen standaardkenmerken.** Het scherm begint leeg. Er staat geen sector of CRM-pakket vooraf, want de Admin bepaalt zelf waar de vraag over gaat.
- **De kaart Kenmerken.** Links of boven de kaart Vergelijken. Titel Kenmerken met een Info-icoon (`info.verkennenKenmerken`, `beheerpagina.md`, register), per kenmerk een rij, de knop "Kenmerk toevoegen", "Wis filters" en onderaan de teller.
- **Lege kaart.** De tekst "Nog geen kenmerken. Voeg een kenmerk toe om te filteren en te vergelijken." en daaronder een regel "Snel beginnen:" met losse keuzepillen voor CRM-pakket, Sector en AHT. Een pil voegt alleen dat kenmerk toe, hij kiest geen waarde. De drie zijn een snelkoppeling en geen vaste kenmerken. Zodra er een kenmerk staat, verdwijnt de regel.
- **Kenmerk toevoegen.** Een knop met een menu van alle organisatievelden van het type keuzelijst, getal en percentage. Het menu heeft een zoekveld en koppen per groep van velden, zoals Sector en subsector, Volume en klantbasis, Digitalisering, Techstack, FTE en KPI's (Één regel per KPI, zie KPI's als kenmerk). Onder een kop staat alleen de korte naam van het veld (zie Korte namen), met het volledige pad in een tooltip. Achter elk veld staat hoeveel Organisaties het hebben ingevuld, bijvoorbeeld "37 van 50". Velden die bij minder dan `verkennenMinIngevuldPct` van de Organisaties in het Assessment zijn ingevuld, staan grijs maar blijven te kiezen (zie Drempels). Velden die alleen kunnen filteren en niet kunnen groeperen (Ingezette kanalen), hebben achter de naam in grijs "alleen filteren". Zo is vooraf te zien wat een veld kan. Velden die wegens te weinig ingevulde waarden niet kunnen groeperen, tonen dat bij de telling (zie Drempels). Een veld dat al is toegevoegd, staat uitgeschakeld met "toegevoegd" erachter. Een gekozen veld sluit het menu en verschijnt als rij.
- **Een kenmerkrij.** Bovenaan de korte naam van het kenmerk (potlood voor de korte namen van dat veld, zie Korte namen) en een kruisje om het kenmerk te verwijderen. Het kruisje haalt ook het filter weg. Daaronder het bedieningselement:
  - **Select en select-afhankelijk** (sector, subsector, leverancier per techstackcategorie, ondersteuner, deploymentmodel, cloudleverancier): Losse keuzepillen met de korte naam en het aantal Organisaties erachter. Meerdere pillen binnen één kenmerk werken als "of".
  - **Getal en percentage** (FTE, digitaliseringspercentage en, de KPI's, waarbij een KPI een kanaal kiest, zie KPI's als kenmerk): Er is nog geen filter op bereik. De rij toont de tekst "Getal, 37 van 50 ingevuld. Te gebruiken bij Groeperen op." Het filter op bereik (twee handvatten, histogram) volgt later, zie Later.
  - **Ingezette kanalen**: Afgeleid uit de KPI Contacten per jaar per kanaal, bij de plek van de eenheid: Algemeen bij Organisaties, het onderdeel bij Onderdelen. Een kanaal telt als ingezet bij een waarde boven 0. Een leeg veld is onbekend en telt niet als "niet ingezet". Een waarde 0 telt als niet ingezet. Meerdere gekozen kanalen werken als "en": De Organisatie moet ze allemaal inzetten. Dit kenmerk is alleen een filter en geen groepering.
- **Verschillende kenmerken werken als "en".** Het kenmerk sector en het kenmerk kanalen beperken de pool dus allebei.
- **Organisaties zonder waarde** voor een kenmerk met een gekozen waarde vallen bij dat filter weg. Bij een getal staat erbij hoeveel Organisaties het hebben ingevuld (bijvoorbeeld "37 van 50"), omdat de organisatievelden nog niet overal gevuld zijn.
- **Wis filters** wist de gekozen waarden en laat de kenmerken staan. Het kruisje bij een kenmerk haalt het kenmerk zelf weg.

## KPI's als kenmerk

De KPI's zijn geen organisatievelden maar `KpiDefinitie`s met waarden per plek en per kanaal (`datamodel.md`, KPI's en kanalen). Verkennen gebruikt ze als filter, als groepering en als as, met de volgende regels erbij.

- **Menu.** Onder de kop KPI's in het menu Kenmerk toevoegen staat één regel per KPI, met de korte naam (Korte namen). Achter de naam staat hoeveel eenheden de KPI hebben ingevuld bij het kanaal Algemeen, bijvoorbeeld "37 van 50".
- **Een KPI-rij.** De rij heeft de korte naam, het potlood voor de korte namen en het kruisje zoals elk kenmerk. Heeft de KPI `perKanaal`, dan staat eronder een pilvormige groep Kanaal (`.pil-groep`) met Algemeen en de kanalen waarvoor minstens één eenheid in de pool een waarde heeft. Algemeen staat gekozen. Een KPI zonder `perKanaal` heeft geen groep.
- **Waarde van een eenheid.** Bij de eenheid Organisaties is dat de waarde van de Organisatie bij Algemeen (`onderdeelId: null`), bij het gekozen kanaal. Bij de eenheid Onderdelen is het de waarde van dat onderdeel bij het gekozen kanaal, en bij "Hele organisatie" die van Algemeen.
- **Geen terugval.** Heeft een eenheid geen waarde voor de gekozen KPI en het gekozen kanaal, dan valt ze bij dit kenmerk af. Dat geldt ook als de Organisatie van een onderdeel wel een Algemeen-waarde heeft. Algemeen is een gewone waarde en geen standaard voor de onderdelen (`datamodel.md`, KPI's en kanalen).
- **Tellingen.** "37 van 50 ingevuld" telt voor het gekozen kanaal. Wisselt de Admin van kanaal, dan verandert de telling mee.
- **Groeperen op een KPI met een kanaal.** De regels van Groeperen op een getal-kenmerk gelden. De pil heet "<korte naam> <kanaal>-drempel" bij een kanaal anders dan Algemeen, bijvoorbeeld "AHT Call-drempel". Wisselt de Admin van kanaal bij de KPI waarop gegroepeerd wordt, dan keert de drempel terug naar de mediaan van de nieuwe waarden.
- **Eenheid bij de drempel.** `KpiDefinitie.eenheid`. Is de eenheid leeg of "aantal", dan staat er geen eenheid achter de drempel.
- **Opslaan als benchmark.** Een filter op een KPI bewaart de KPI en het kanaal (`kpiId`, `kanaalId`). Een eerder opgeslagen verkenning met een KPI-veld krijgt het kanaal Algemeen (`datamodel.md`, KPI's en kanalen).
- **AHT per kanaal.** AHT per kanaal werkt zo: Het filter Ingezette kanalen samen met het kenmerk AHT en het kanaal Call geeft "Organisaties die Call inzetten, gegroepeerd op AHT bij Call".

## Korte namen

Namen als "Activiteiten op het gebied van financiële dienstverlening en verzekeringen" of "Volume en klantbasis › Totaal aantal contacten per jaar, per kanaal › Call" zijn te lang voor een pil, een menuregel of een kolomkop. Een korte naam is een weergavenaam naast het origineel. Hij kan bij veldnamen en bij waarden.

- **Waar hij staat.** Overal in Verkennen waar een veld of waarde getoond wordt: Het menu Kenmerk toevoegen, de pillen, de groepsnamen, de kolomkoppen van de heatmap en de assen en tooltips van het spreidingsdiagram. Bij hover op een pil of menuregel staat het origineel in een tooltip.
- **Waar hij niet staat.** In het organisatie-detail, de exports en de import. Daar blijft het origineel staan. De Organisatie bewaart altijd het origineel, zodat er geen twee namen voor één waarde in de data komen.
- **Beheer.** Een Admin vult ze in bij Organisatievelden, op de tab Korte namen (`beheerpagina.md`, punt 3). Ook op de plek zelf: Een potlood naast de naam van een kenmerk opent een modal met de waarden van dat ene veld. Het recht is `content.beheren`, dus alleen een Admin.
- **Uitleg.** De uitleg bij de tabel staat in een Info-icoon (`info.korteNamen`, `beheerpagina.md`, punt 2a). Het visual design toont hem als vaste tekst.
- **Regels.** Hoogstens 30 tekens en uniek binnen een veld, zonder verschil tussen hoofdletters en kleine letters. Een lege korte naam betekent het origineel. Twee waarden onder dezelfde naam samenvoegen kan dus niet.
- **Wat de Admin invult.** Waarden die in gebruik zijn en nog geen korte naam hebben, staan in de tabel bovenaan. Waarden die Organisaties zelf invullen via "Anders…" komen daar vanzelf bij, met een lege korte naam. Voor de SBI-sectoren zijn beginwaarden voorgesteld (`sbi-indeling.md`, Korte namen).
- **Opslag.** `VeldDefinitie.korteNaam` voor veldnamen en `KorteNaam` voor waarden (`datamodel.md`).
- **Benchmark.** Het sectorfilter bij het samenstellen van een benchmark (`benchmark.md`) kan dezelfde korte namen gebruiken. Dat vraagt nog bevestiging.

## Groeperen en focus

Groeperen verdeelt de pool (na de filters) in groepen. Eén groep is de focus. De rest zijn de Organisaties van de andere groepen. Wie voor het gekozen kenmerk geen waarde heeft, zit in geen groep en telt niet mee in de rest. Welke groepering er kan, volgt uit de kenmerken: Wat de Admin heeft toegevoegd en bruikbaar is, staat bij Groeperen op.

- **Groeperen op** is een pilvormige groep (`stylesheet.md`, Keuzepil en pilvormige groep) met één pil per kenmerk dat kan groeperen, met precies één gekozen pil. Naast het label staat een Info-icoon (`info.verkennenGroeperen`, `beheerpagina.md`, register).
- **Alleen kenmerken die niet kunnen groeperen.** Is er wel een kenmerk toegevoegd, maar kan geen enkel kenmerk groeperen (bijvoorbeeld alleen Ingezette kanalen), dan staat er geen "Geen kenmerk". Elk toegevoegd kenmerk staat dan als uitgeschakelde pil in de groep, met de reden eronder. De melding "Er is geen kenmerk meer om op te groeperen" hoort alleen bij een terugval.
- **Geen kenmerk.** Is er nog geen kenmerk toegevoegd, dan staat er in plaats van de groep één losse, grijze, uitgeschakelde pil "Geen kenmerk", 32px hoog zoals de andere pillen en zonder houder eromheen. Het Info-icoon geeft dan de tekst "Er is nog geen kenmerk om op te groeperen. Voeg bij Kenmerken een kenmerk toe, dan kun je de Organisaties erop in groepen verdelen." Onder de pil staat "Voeg bij Kenmerken een kenmerk toe om te beginnen." Er is dan ook geen resultaat, zie Zonder groepering voor de pool die er wel is.
- **Het eerste bruikbare kenmerk** dat de Admin toevoegt, wordt automatisch de groepering. Daarna verandert de groepering alleen als de Admin een andere pil kiest, of door de terugval hieronder.
- **Wanneer een kenmerk kan groeperen.** Een kenmerk is een pil, maar die is uitgeschakeld (50% dekking, `not-allowed`, nooit gekozen) in deze gevallen. De reden staat in een tooltip en als regel van 12px in grijs onder de groep:
  - De pool heeft minder dan `verkennenMinPool` Organisaties (nu 6): Alle pillen zijn uitgeschakeld. Reden: "Minder dan 6 Organisaties in de pool (instelling Organisaties in de pool, minimum)".
  - Het kenmerk is bij minder dan `verkennenMinIngevuldPct` (nu 40%) van de Organisaties in het Assessment ingevuld (bij 50 Organisaties dus minder dan 20). Reden: "Minder dan 20 ingevulde waarden (instelling Kenmerk ingevuld, minimum)".
  - Een select-kenmerk waarvan na de filters nog één waarde over is. Reden: "Het filter laat één waarde over".
  - Een select-kenmerk met meer dan `verkennenMaxGroepen` (nu 12) verschillende waarden in de pool. Reden: "Meer dan 12 waarden (instelling Waarden per kenmerk, maximum)". Het getal is steeds de huidige waarde van de instelling.
  - Ingezette kanalen kan niet groeperen, want een Organisatie zet meerdere kanalen tegelijk in en valt dan in meer dan één groep. Reden: "Kan niet groeperen: Een Organisatie kan meerdere kanalen hebben". Het kenmerk is wel te gebruiken als filter.
  - De tekst van de reden noemt waar mogelijk de instelling die erachter zit, zodat een Admin die een drempel vergeten is (bijvoorbeeld een maximum van 1) meteen ziet waar hij hem aanpast.
- **Terugval.** Wordt het gekozen kenmerk onbruikbaar (door een filter) of verwijdert de Admin het, dan gaat de groepering naar de eerste pil die wel kan, met een melding in de stijl van `--stat-amber-faint`: "<Reden>. De groepering staat nu op <kenmerk>." Kan geen enkele pil meer, dan is er geen pil gekozen en staat er een melding: "Er is geen kenmerk meer om op te groeperen." of, als de pool te klein is, "Met deze filters zit er 1 Organisatie in de pool. Dat is te weinig om te vergelijken. Haal een filter weg." (met het werkelijke aantal). De resultaten tonen dan de hele pool, zie Zonder groepering.
- **Levensduur van een melding.** Een melding bij de terugval beschrijft één gebeurtenis en blijft alleen staan tot de volgende wijziging van kenmerken, filters of groepering. Daarna verdwijnt hij, ook als een nieuwe gebeurtenis zich voordoet (die krijgt dan zijn eigen melding). Een melding komt nooit terug door een latere stand te herstellen.
- **Herstel.** Is er geen pil gekozen en kan een kenmerk door een wijziging in de filters weer groeperen, dan wordt de eerste pil die kan automatisch gekozen, zoals bij het eerste bruikbare kenmerk. Daarbij staat geen melding. De melding "Er is geen kenmerk meer om op te groeperen" verdwijnt dan ook.
- **Groeperen op een select-kenmerk** (CRM-pakket, sector): Eén groep per waarde die in de pool voorkomt. Organisaties zonder waarde horen bij geen groep en staan als "n zonder waarde" onder de groepen.
- **Groeperen op een getal-kenmerk** (AHT, NPS, FTR): Een drempel met twee groepen, "≤ drempel" en "> drempel". De pil heet "<korte naam>-drempel". De slider loopt van het laagste tot het hoogste getal in de pool, met de eenheid van het veld (`VeldDefinitie.eenheid`). De startwaarde is de mediaan van de pool. Boven de slider staat een histogram, waarin de staven van de focusgroep oranje zijn. Onder de slider staat hoeveel Organisaties aan elke kant zitten. De groepen krijgen neutrale namen ("≤ 420 s" en "> 420 s"), geen oordeel als "snel" of "langzaam". Er is een apart drempelfilter niet nodig: De drempel is de groepering.
- **De drempel instellen.** Bij grote getallen is een slider alleen te onnauwkeurig, dus de drempel heeft vier manieren om te kiezen, die elkaar bijwerken:
  - **De slider** loopt in afgeronde stappen van 1, 2 of 5 keer een macht van tien, zo gekozen dat er ongeveer 100 standen zijn (bij een bereik tot 5.000.000 is de stap 50.000). De pijltoetsen verschuiven één stap, met Shift tien stappen.
  - **Een invoerveld** naast de slider met de exacte waarde en de eenheid. Typ je een waarde, dan springt de slider ernaartoe. Een waarde buiten het bereik van de pool wordt teruggezet naar de dichtstbijzijnde grens, met de regel "Dit kenmerk loopt in de pool van <laagste> tot <hoogste>." Het veld accepteert geen letters.
  - **Snelknoppen** "Mediaan" en "Gemiddelde", elk met de waarde erachter. Mediaan is de startwaarde.
  - **Klikken op een staaf** van het histogram zet de drempel op de bovengrens van die staaf.
  Getallen krijgen punten als duizendtalscheiding, zoals in het Nederlands gebruikelijk ("3.932.600"), ook in de groepsnamen ("≤ 3.932.600" en "> 3.932.600") en onder de slider. Decimalen staan met een komma. De drempel is inclusief: "≤ drempel" bevat de Organisaties met precies die waarde.
- **Focusgroep**: Losse keuzepillen met de groepsnaam en het aantal. De gekozen pil is massief oranje. Bij het wisselen van groepering wordt de grootste groep de focus.
- **Kleine groepen.** Een groep met minder dan `verkennenMinGroep` Organisaties (nu 3) is gestreept getekend en krijgt in de heatmap geen cijfers. Heeft de focus of de rest minder dan `verkennenMinVergelijking` (nu 5), dan staat er een waarschuwing dat verschillen voorzichtig gelezen moeten worden. Het is geen blokkade, want de Admin mag de namen zien. Beide zijn instellingen (zie Drempels).
- Is de focus of de rest leeg, dan staat er een melding en geen grafiek.

## Weergaven

Vier weergaven (met groepering, zie Zonder groepering voor de pool zonder), gekozen met de weergave-schakelaar boven de resultaten, een pilvormige groep (`stylesheet.md`, Keuzepil en pilvormige groep). Het visual design toont ze als tabs met een onderstreping, maar de pilvormige groep geldt, net als op elke andere resultatenpagina. De rijen zijn de bouwblokken, gegroepeerd per categorie met de categoriekleur (`stylesheet.md`, Categoriekleuren). Bij een Assessment zonder categorielaag (de AI-scan) zijn de rijen de domeinen, zonder kopregels.

### 1. Groep tegenover de rest

Per bouwblok een rij met een schaal van 1 tot 5. Elke Organisatie in de pool is een stip: De focus oranje en iets groter, de rest grijs. Een staande streep markeert het gemiddelde van de focus (oranje) en van de rest (donkergrijs), met een lijn ertussen. Aan de rechterkant staan het gemiddelde van de focus, het gemiddelde van de rest en het verschil als staafje met een getal. Een verschil boven 0 is blauw (`--bl`) en onder 0 donkeroranje (`--dal`). Achter elke rij staan de drie banden van de klassen in de lichte klassekleuren (`stylesheet.md`, Drie niveaus van scorekleur), zoals in `visualisatie-scores.md`, onderdeel A. Hover op een stip toont de naam van de Organisatie en de score.

Boven de rijen staan vier kaarten: Het gemiddelde van de focus (totaalscore), het gemiddelde van de rest, de grootste plus en de grootste min per bouwblok.

### 2. Spreiding binnen de groep

Dezelfde rijen, maar alleen de stippen van de focus. Daarachter staan het bereik (laagste tot hoogste score) als dunne lijn, de middelste helft van de focus als oranje balk en de mediaan als staande streep. De middelste helft van de rest staat als grijze balk op de achtergrond, ter vergelijking, boven dezelfde klassebanden als in weergave 1. Rechts staan de mediaan, de spreiding (standaarddeviatie) en het bereik als tekst. Dezelfde vier kaarten staan erboven.

### 3. Alle groepen naast elkaar

Een heatmap met de bouwblokken als rijen en de groepen als kolommen. De eerste kolom toont de hele pool met het gemiddelde in de celtinten (`stylesheet.md`, Drie niveaus van scorekleur) en niet in de volle scorekleuren. De andere kolommen tonen per groep het verschil met het gemiddelde van de hele pool, blauw (`--bl`) voor boven en donkeroranje (`--dal`) voor onder, met een dekking die meegroeit tot maximaal 35% bij een verschil van 1,0 of meer. Elke kolom is 96px breed. De kolomkop is de korte naam van de groep op één regel, met "n = 11" in een tweede regel van 12px, en de volledige naam in een tooltip (`stylesheet.md`, Kolomkop en rijkop). Een kop wordt niet hoger of breder voor een lange naam. Een groep met minder dan `verkennenMinGroep` Organisaties is grijs met "n<3" (het getal volgt de instelling). Hover toont het gemiddelde van de groep en dat van de pool. Een klik op een kolomkop maakt die groep de focus en opent weergave 1.

### 4. Verband met een kenmerk

Een spreidingsdiagram van 780 bij 380 pixels. Horizontaal staat een numeriek organisatieveld (nu AHT, FTR of NPS), verticaal de totaalscore of de score van één bouwblok. De focus is oranje, de rest grijs. Een rechte lijn (kleinste kwadraten) laat de richting zien. Naast het diagram staan de correlatiecoëfficiënt r, het aantal Organisaties en een woord bij de sterkte (onder 0,2 nauwelijks, onder 0,4 zwak, onder 0,6 matig, daarboven sterk, met de richting erbij). Bij minder dan `verkennenMinGroep` Organisaties met een waarde staat er "Te weinig data". Onder de coëfficiënt staat een korte zin dat scores zelfrapportage zijn en dat sector en kanaalmix meespelen, zodat een verband geen oorzaak is. Achter het diagram staan horizontale banden op de totaalscore (onder 2,5, 2,5 tot 3,5 en vanaf 3,5) in de lichte klassekleuren.

### Zonder groepering

Is er geen groepering, omdat er nog geen kenmerk is of er geen meer kan, dan is de hele pool de focus en is er geen rest. Alle weergaven blijven werken. De pool is dan nog niet gefilterd of heeft alleen filters.

- **1. Groep tegenover de rest.** Alle stippen zijn oranje, met één streep op het gemiddelde van de pool. De kolommen Rest en Verschil vervallen. De vier kaarten zijn het gemiddelde van de pool (totaalscore), het aantal Organisaties, het hoogste bouwblok en het laagste bouwblok.
- **2. Spreiding binnen de groep.** Alleen de pool. De grijze achtergrondbalk van de rest vervalt.
- **3. Alle groepen naast elkaar.** Alleen de kolom Hele pool, met de hint "Kies een kenmerk om groepen naast elkaar te zetten".
- **4. Verband met een kenmerk.** Alle stippen oranje, de lijn en r over de hele pool.

## Sorteren

Bij weergave 1 en 2 kan de Admin kiezen tussen de volgorde van het model (met kopregels per categorie) en sorteren op grootste verschil (weergave 1) of grootste spreiding (weergave 2). Zonder groepering is Grootste verschil uitgeschakeld. Bij sorteren vervallen de kopregels, de categoriekleur blijft als streepje voor de naam.

## Rekenregels

- Per Organisatie telt de bouwblokscore van haar Meting (`CLAUDE.md`, Scoringslogica).
- Het gemiddelde van een groep is het gemiddelde van de scores van haar Organisaties, dus elke Organisatie telt even zwaar. Het aantal scans binnen een Meting speelt geen rol.
- De totaalscore van een Organisatie volgt de Totaalscore van het Assessment (met weging waar die geldt). Het gemiddelde van een groep is het gemiddelde van die totaalscores.
- Het verschil is het gemiddelde van de focus min dat van de rest, op één decimaal. Het teken is een plus of een min (−), en bij een verschil van minder dan 0,05 staat er geen teken.
- Kwartielen en mediaan gebruiken lineaire interpolatie. De spreiding is de standaarddeviatie met n−1, en blijft leeg bij minder dan 2 Organisaties.
- In de heatmap telt de groep zelf mee in het gemiddelde van de hele pool.
- Afronding volgt `CLAUDE.md`, Scoringslogica, en geldt alleen voor getoonde waarden.

## Opmaak

Alle opmaak staat in `stylesheet.md`. Het ontwerp gebruikt de bestaande tokens, Epilogue, kaarten met 10px radius en de eyebrow in oranje. De pilvormige groep (`.weergave-wissel`) dient voor de vier weergaven, voor Groeperen op en voor Sorteren. De waarden bij een kenmerk, de Snel beginnen-pillen, de pil Geen kenmerk en de focusgroepen zijn losse keuzepillen, en een gekozen pil is overal massief oranje (`stylesheet.md`, Keuzepil en pilvormige groep). Nieuw zijn de kaart Kenmerken, de slider met histogram, de uitgeschakelde pil in een groep, de melding bij de terugval, de waarschuwing bij een kleine groep, het menu Kenmerk toevoegen en de modal Korte namen. Die staan in `stylesheet.md`, onder Filterchip, focuschip en slider (Verkennen) en de onderdelen daarna.

Kleuren in de grafieken: Focus oranje (`--or`), rest grijs (`rgba(136,136,132,.5)`), gemiddelde van de rest `--ink-m`, verschil boven 0 blauw (`--bl`) en onder 0 donkeroranje (`--dal`). De scorekleuren staan alleen op absolute scores, zoals de eerste kolom van de heatmap, en daar als celtint. Er is geen zwarte vulling of rand. Lettergroottes komen uit de schaal van acht maten (`stylesheet.md`, Lettergroottes), ook in de grafieken (minimaal 12px).

## Opslaan als benchmark

Zo wordt een verkenning een benchmark op niveau 1 die een Lead kan krijgen (`benchmark.md`, Niveau 1, Opgeslagen verkenning). Dit is de enige plek waar Verkennen iets bewaart.

- **Knop.** Onder de teller en de balk in de kaart Kenmerken staat "Opslaan als benchmark" met een Info-icoon (`info.verkennenOpslaan`). De Admin heeft hiervoor `benchmark.beheren` nodig.
- **Uitgeschakeld.** Zonder filter, met de reden "Zet eerst een filter, anders is de groep de hele pool". En als de pool kleiner is dan `verkennenMinPool`, met de reden "Minder dan {n} {Organisaties of onderdelen} in de pool". De reden staat naast de knop.
- **Paneel.** De knop opent onder zich een paneel met het veld Naam (maximaal 60 tekens, "zichtbaar voor de Lead"), de filters die worden opgeslagen als regels ("CRM-pakket is Salesforce", bij meerdere waarden "of", bij Ingezette kanalen "alle van"), bij een Meetperiode de regel "Meetperiode 12-01-2026 tot en met 10-02-2026", en de zin "Nu {n} {eenheid} in de groep. De Lead ziet de eigen scores tegenover de rest van de groep. Alleen de eigen Organisatie en haar onderdelen staan met naam in beeld." Daaronder "Opslaan" en "Annuleren". Opslaan is uitgeschakeld zolang de naam leeg is.
- **Voorgestelde naam.** Is er één filter met één waarde, dan staat er "Organisaties met {waarde}" voorgevuld. In andere gevallen is het veld leeg. De Admin kiest een naam die voor een Lead logisch leest.
- **Na Opslaan.** Een groene regel: "Opgeslagen als {naam}. Wijs hem toe in het Leads-venster van een Organisatie die erin zit." De stand in Verkennen blijft zoals hij was.
- **Wat er wordt bewaard.** De naam, het Assessment, de eenheid, de Meetperiode en de filters. Niet de groepering, de focus, de drempel van een getalkenmerk of de uitkomst.
- **Toewijzen.** Gebeurt niet hier maar in het Leads-venster van de Organisatie (`beheerpagina.md`, punt 6a). Daar staat een kolom met de badge Verkenning en het aantal Organisaties (visual design, bord "Leads-venster").
- **Terugvinden en wijzigen.** In de tab Benchmarks (`beheerpagina.md`, punt 14). Een opgeslagen verkenning opent niet terug in Verkennen. Dat staat bij Later.

## Privacy en rechten

- Alleen een Admin ziet Verkennen, met de permissie `verkennen.inzien` (`datamodel-rollen.md`, Rechtenmatrix). Dat sluit aan op de benchmark, waar de Admin de namen van de Organisaties ook ziet (`benchmark.md`, Weergave voor de Admin).
- Er is geen minimale groepsgrootte voor het tonen van cijfers aan de Admin. Wel geldt de waarschuwing bij kleine groepen.
- Het scherm slaat zelf niets op. De kenmerken, de gekozen waarden en de groepering verdwijnen als de Admin het scherm verlaat. Alleen Opslaan als benchmark bewaart de filters, voor een Admin met `benchmark.beheren`.
- Een opgeslagen verkenning is voor een Lead een benchmark op niveau 1. De drempels van het scherm Verkennen gelden niet voor de Lead. Voor hem geldt `benchmarkMinOrganisaties` (`benchmark.md`, Opgeslagen verkenning).

## Later

- **Consultant.** Een Consultant mag de namen van Organisaties die niet de zijne zijn niet zien. Dan gelden `benchmarkMinOrganisaties` voor beide kanten van elke splitsing (focus en rest) en de regel dat een filter dat een kant onder de drempel brengt niets toont. Anders is een Organisatie terug te rekenen uit het verschil tussen groep en rest. Voor de eigen klanten van de Consultant kan een uitzondering gelden, die moet nog besloten worden.
- **Operationele KPI's als kenmerk.** Dit werkt vanzelf zodra ze een KPI-definitie zijn (`datamodel.md`, KPI's en kanalen, en KPI's als kenmerk hierboven).
- **Filter op bereik bij getallen** (twee handvatten met histogram, of één drempel). Nu is een getal alleen te gebruiken bij Groeperen op.
- **AHT per kanaal.** Uitgewerkt (KPI's als kenmerk, en `datamodel.md`, KPI's en kanalen). Wat nog ontbreekt is het filter op bereik, hierboven.
- **Een opgeslagen verkenning weer openen in Verkennen.** Nu staan de filters als regels in de tab Benchmarks. Terug openen in Verkennen om verder te kijken staat nog open.
- **Export** van de gefilterde pool als CSV (`export-csv.md`).
- **Quickscan Ziekenhuis.** De antwoorden zijn percentages (`visualisatie-quickscan.md`), dus de schaal wordt 0 tot 100%, met de classificatiekleuren van de Quickscan.
- **Meetperiode die meeschuift.** Nu is de periode een vaste begin- en einddatum. Een periode als de laatste twaalf maanden is er niet.

## Open punten

- Of een Meetperiode die meeschuift nodig is (Later).
- Eenheid Onderdelen: Of een Organisatie met vele onderdelen te zwaar meetelt in het gemiddelde. Nu telt elk onderdeel even zwaar, de voettekst zegt het.
- Werken meerdere gekozen kanalen als "en" of als "of"? Het ontwerp gebruikt "en".
- Zijn 3, 5, 6, 12 en 40% de juiste startwaarden voor de vijf drempels (zie Drempels)? Met ongeveer 10 Organisaties per branche vallen combinaties van sector en pakket snel onder 5.
- Welke drie pillen staan bij Snel beginnen? Nu CRM-pakket, Sector en AHT. Het kunnen er ook meer of andere zijn.
- Groeperen op is een pilvormige groep die met elk kenmerk groeit. Mogelijke oplossing: Boven ongeveer vijf pillen gaan de overige achter een pil "Ander kenmerk…" met hetzelfde menu met zoekveld.
- Moet een getalkenmerk naast Groeperen op ook een filter op bereik krijgen?
- Komt er naast SBI een eigen veld Branche (`backlog.md`)? Korte namen blijven dan nodig voor de andere lijsten, het sectorfilter wordt er mogelijk minder belangrijk door.
- Gebruikt het sectorfilter bij het samenstellen van een benchmark ook de korte namen?
