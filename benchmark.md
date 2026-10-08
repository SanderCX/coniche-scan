# Coniche Scan: Benchmark

**Status.** Niveau 1 (tussen organisaties) is gebouwd (PR 61, 8 oktober 2026). Niveau 2 (binnen een organisatie, tussen Metingen) en niveau 3 (binnen een Meting) zijn besproken met Joost en Sander en nog niet gebouwd. De records staan in `datamodel.md` deel 3, de schermen in `beheerpagina.md` punt 14 en de privacytekst in `privacy-pagina.md` sectie 3a. Dit bestand beschrijft het gedrag. Per onderdeel staat of het besloten, gebouwd of een voorstel is dat nog bevestiging vraagt.

## Wat het is

Een benchmark zet de scores van een zelf gekozen groep naast elkaar. Een Admin stelt hem samen, op één plek in beheer (de tab Benchmark). Er zijn drie niveaus, met dezelfde rekenregel en dezelfde opbouw van de weergave.

| Niveau | Wat wordt vergeleken | Een lid is | Status |
|---|---|---|---|
| 1. Tussen organisaties | Een groep organisaties | Een organisatie met één Meting per Assessment | Gebouwd |
| 2. Binnen een organisatie | De Metingen van één organisatie, bijvoorbeeld een Meting per bedrijfsonderdeel | Een Meting | Voorstel |
| 3. Binnen een Meting | De scans in één Meting | Een afgeronde scan | Voorstel, ontwerp volgt |

Een benchmark kan één of meer Assessments omvatten, bijvoorbeeld de Klantcontact Volwassenheidsscan en de AI-volwassenheidsscan. De resultaten van elk Assessment staan in een eigen sectie. Scores van verschillende Assessments worden niet samengevoegd, omdat de bouwblokken verschillen.

Scores worden berekend en nooit opgeslagen (`datamodel.md`, Scoreberekening). Dat geldt voor alle niveaus.

## Plek in beheer

**Gebouwd.** Een hoofdlink "Benchmark" in `.nav-right` voor een Admin, naast Applicatie, Assessments en Organisaties. Een benchmark hoort bij een groep en dus niet onder één organisatie. Ook de niveaus 2 en 3 komen hier te staan, zodat alle vergelijkingen op één plek zitten. Bij het aanmaken kiest de Admin eerst het niveau.

**Besloten.** Vooralsnog kan alleen een Admin erbij. Er is een eigen permissie `benchmark.beheren`, alleen voor Admin, zodat een Consultant er later bij kan zonder dat de rechtenmatrix om moet. De schermen staan in `beheerpagina.md`, punt 14.

## Datamodel

De records staan in `datamodel.md`, deel 3. Het zijn `Benchmark`, `BenchmarkLid` (een organisatie met een Assessment en een Meting) en `BenchmarkToewijzing` (een view voor een Lead), plus het veld `Organisatie.benchmarkToegestaan`. De twee instellingen `benchmarkMinOrganisaties` (startwaarde 5) en `benchmarkMinScans` (startwaarde 3) staan in `beheerpagina.md`, punt 10. Zie Drempels hieronder.

Het niveau staat als veld op de benchmark (voorstel, zie `datamodel.md`). Een benchmark zonder niveau is een benchmark tussen organisaties. Het sectorfilter bij het samenstellen wordt niet opgeslagen, het is een zoekhulp.

## Gedeelde regels

Deze regels gelden op alle niveaus.

**Besloten.** Elk lid telt even zwaar mee, ongeacht het aantal respondenten daaronder. Bij vijf leden telt elk lid voor een vijfde. Per lid:

- Het gemiddelde antwoord per vraag over de afgeronde scans van dat lid.
- De gedeelde scorefunctie op die gemiddelden, met `Bouwblok.gewicht`, geeft de bouwblokscore, categoriescore en overall van het lid.

De benchmark is het gemiddelde over de leden van dat Assessment, per vraag, bouwblok, categorie en overall. De berekening is lineair, dus dit komt uit op hetzelfde als het gemiddelde van de scores van de leden. Er komt geen tweede rekenmethode bij (`datamodel.md`, Scoreberekening). Gearchiveerde content rekent mee zoals bij de andere weergaven (`datamodel.md`, Content bewerken). Een lid zonder afgeronde scan telt niet mee.

**Gebouwd.** De cijfers worden live berekend (`lib/benchmark.ts`). De samenstelling staat vast, dus de lijst met leden verandert alleen als de Admin hem wijzigt. De cijfers bewegen mee als er nog scans binnenkomen, als een scan wordt verwijderd of als een gewicht verandert. Een gewichtswijziging werkt voor alle leden tegelijk door.

De weergave toont een peildatum (gebouwd) en per lid het aantal scans. Is later een stabiele versie nodig, dan kan die een kopie worden die op het toewijzingsrecord vastligt (voorstel).

Omdat een lid met één respondent even zwaar telt als een lid met veertig, bewaakt `benchmarkMinScans` de ondergrens.

Een benchmark wordt altijd per Assessment berekend. Metingen en organisaties van verschillende Assessments worden niet gemengd.

## Niveau 1: Tussen organisaties

### Samenstellen

**Gebouwd.** De Admin doorloopt drie keuzes, de laatste twee in dezelfde lijst.

1. Assessments kiezen, minstens één.
2. Organisaties kiezen. De lijst toont alleen organisaties met `benchmarkToegestaan` die minstens één Meting hebben van een gekozen Assessment, met minimaal `benchmarkMinScans` afgeronde scans. Per organisatie staat welke van de gekozen Assessments ze heeft en hoeveel afgeronde scans. Optioneel kan de lijst gefilterd worden op Sector en Subsector (`sbi-indeling.md`), met meerdere keuzes tegelijk. Het filter is een hulp en geen eis. De groep mag dus uit meerdere sectoren bestaan. Een organisatie met de vlag die niet in de lijst staat, komt met de reden onder de lijst (geen Meting van dat Assessment, of te weinig afgeronde scans).
3. Metingen kiezen. Vinkt de Admin een organisatie aan, dan verschijnt eronder per gekozen Assessment één regel met de Meting die meedoet. Voorgekozen is de meest recente Meting met genoeg afgeronde scans. Alleen bij meerdere Metingen van hetzelfde Assessment is er iets te kiezen.

Naast elk gekozen Assessment loopt tijdens het samenstellen de teller "X van Y organisaties" mee (zie Teller).

Per Assessment heeft een organisatie hoogstens één lid in een benchmark.

Valt een lid weg doordat de Meting of de Organisatie is verwijderd, of doordat de vlag `benchmarkToegestaan` is ingetrokken, dan verdwijnt het lid uit de benchmark. De beheerweergave toont daarvan een melding (`Benchmark.meldingen`), die de Admin kan wegklikken. De melding wordt bewaard bij de benchmark, tot ze is weggeklikt of tot de samenstelling wordt gewijzigd.

**Gebouwd.** Heeft een organisatie een Meting voor maar een deel van de gekozen Assessments, dan doet ze mee bij de Assessments waarvoor ze wel een Meting heeft. Het aantal organisaties kan dus per Assessment verschillen.

### Teller

**Gebouwd.** Boven elke Assessment-sectie staat "X van Y organisaties". Y is het aantal organisaties in de benchmark. X is het aantal daarvan met een lid voor dat Assessment.

- De Admin ziet daarnaast welke organisaties ontbreken en per organisatie het aantal afgeronde scans.
- De Lead ziet alleen het aantal organisaties in de vergelijking, dus zonder Y. Y bevat organisaties die bij dat Assessment niet meedoen, en dat is voor de Lead geen informatie die iets toevoegt.
- Tijdens het samenstellen krijgt de teller een waarschuwingskleur zodra een Assessment onder de drempel zakt.

### Weergave voor de Admin

**Gebouwd.** Per Assessment een sectie met de gemiddelden van de groep, per vraag, per bouwblok, per categorie en overall. De Admin ziet de namen van de organisaties. De resultaatcomponenten van het resultatenscherm (`CLAUDE.md`, schermflow punt 6) worden hergebruikt waar dat kan. Elke sectie is een zelfstandig onderdeel, zodat een latere PDF per Assessment een eigen deel kan krijgen.

### View per organisatie

**Gebouwd.** Vanuit de benchmark opent de Admin voor elke deelnemende organisatie X een view. Per Assessment waar X lid van is, staat de Meting van X naast het gemiddelde van de rest van de groep, zonder X zelf. Zou X meetellen, dan trekt ze het gemiddelde naar zichzelf toe en kan ze bij een kleine groep de scores van de anderen terugrekenen.

Opbouw van de view:

- Een radar met twee reeksen, X en de rest van de groep.
- Het staafdiagram per categorie, met het groepsgemiddelde als tweede, neutraal gekleurde balk naast die van X. Eerder stond hier een markering. De tweede balk is gebouwd en leest beter, dus de spec volgt de code.
- Het verschil per bouwblok (X min de rest, op één decimaal).
- Onder de view de tekst "Vergelijkgroep van n organisaties, samengesteld door Coniche", met de peildatum.

**Voorstel.** Eventueel de range van de groep (laagste tot hoogste score) als band, zonder namen. Dit is nog te besluiten.

De view toont nooit de namen van andere organisaties. De Admin bekijkt de view eerst zelf.

### Toewijzen aan een Lead

**Gebouwd.** De Admin kan de view van organisatie X toewijzen aan een bestaande Lead van die organisatie (`BenchmarkToewijzing`). De Lead ziet de view naast zijn eigen resultaten op zijn pagina. Intrekken kan ook, door een Admin. De Admin ziet bij de toewijzingen per Lead een knop "Bekijk" en "Intrekken" (zie Toewijzen aan een Lead op alle niveaus). Wat de Lead ziet:

- Geen automatische toegang. De Lead krijgt de view alleen als een Admin die toewijst, per benchmark en per organisatie.
- Een sectie alleen voor Assessments waarvan hij de Meting van zijn organisatie mag inzien (`leadMetingIds`, afgeleid van `RespondentRolMeting`). Anders ziet hij een vergelijking met resultaten die hij zelf niet mag openen.
- Een sectie alleen als het Assessment aan de drempel voldoet. Toewijzen kan pas als minstens één Assessment aan de drempel voldoet. De Lead ziet alleen de secties die eraan voldoen.
- Wijzigt de samenstelling zodat de organisatie niet meer meedoet, of verdwijnt de Lead-respondent, dan vervalt de toewijzing.

**Rechten.** In de rechtenmatrix staat `benchmark.inzien` voor de Lead, met het bereik "toegewezen benchmarkviews" (`datamodel.md` deel 2). Het prototype kent dit recht nog niet als aparte regel in `lib/rechten.ts`. Daar loopt de toegang van de Lead via de toewijzing en `leadMetingIds`, zoals `export.uitvoeren` ook nog niet in de code staat. Het recht in de matrix is het doel voor de rolrechten die met de database komen.

### Drempels

**Gebouwd.** Twee instellingen, door een Admin aan te passen (Applicatie, Instellingen).

- `benchmarkMinOrganisaties` (startwaarde 5). Minimale groepsgrootte per Assessment, inclusief de organisatie van de view. Bij 5 ziet een Lead het gemiddelde van minstens 4 anderen. De drempel is een afweging op privacy. Bij minder anderen kan een deelnemer uit het groepsgemiddelde en zijn eigen score vrij precies afleiden wat de rest scoort. De Admin ziet de benchmark altijd, ook onder de drempel.
- `benchmarkMinScans` (startwaarde 3). Minimaal aantal afgeronde scans in een Meting om gekozen te mogen worden. Dit gaat over betrouwbaarheid, omdat een score uit één of twee scans te weinig zegt, zeker met gelijk gewicht per lid.

Het privacy statement belooft een minimale groepsgrootte. Die belofte moet overeenkomen met de ingestelde waarde.

**Voorstel.** Bevestigen van de startwaarden 5 en 3.

### Toestemming en privacy

**Besloten.** Het privacy statement krijgt een disclaimer, gebaseerd op de formulering van Vlirdens. De inhoud is dat deelname betekent dat geaggregeerde en anonieme gegevens in een benchmark kunnen komen.

**Gebouwd.** De vlag `benchmarkToegestaan` per organisatie, door een Admin gezet nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Zonder vlag staat de organisatie niet in de keuzelijst. De toestemming in de intake wordt per respondent gegeven en gaat over delen met Coniche. Geïmporteerde scans uit de oude tool en eerdere invullingen hebben de nieuwe tekst nooit gezien. De vlag legt vast dat de organisatie als geheel heeft ingestemd. Uitzetten van de vlag haalt de organisatie, na een bevestiging, uit alle benchmarks.

**Voorstel, nog niet gebouwd.**

- `privacy-pagina.md` (sectie 3a) vermeldt dat er alleen geaggregeerde gegevens in een benchmark komen, dat er nooit een organisatienaam bij staat, welke minimale groepsgrootte geldt, en dat het verwijderen van een scan die scan ook uit de benchmark haalt, omdat alles wordt berekend. De tekst staat in de spec en nog niet op de publieke privacypagina.
- Het toestemmingsvakje in de intake (`CLAUDE.md`, schermflow punt 4) krijgt een aangepaste tekst. Die geldt voor nieuwe respondenten.

## Niveau 2: Binnen een organisatie

**Voorstel.** Een benchmark van de Metingen van één organisatie, bijvoorbeeld een grote organisatie die per bedrijfsonderdeel een eigen Meting heeft. De vraag die de Admin ermee beantwoordt is hoe de ene Meting scoort ten opzichte van de andere. Het is niet hetzelfde als een trend in de tijd (`backlog.md`, Trend tussen Metingen).

- **Samenstellen.** De Admin kiest bij het aanmaken het niveau "Binnen een organisatie", daarna één organisatie, de Assessments en de Metingen. Er geldt geen vlag `benchmarkToegestaan`, omdat de gegevens de organisatie niet verlaten. Een Meting moet minimaal `benchmarkMinScans` afgeronde scans hebben, om dezelfde reden als op niveau 1. Een benchmark heeft minstens twee Metingen per Assessment. De labels van de Metingen zijn de namen in de weergave.
- **Leden.** Een lid is een Meting (`BenchmarkLid`, met overal dezelfde `organisatieId`). In tegenstelling tot niveau 1 mag een organisatie meerdere leden per Assessment hebben, maar een Meting hoogstens één keer.
- **Berekening.** Zie Gedeelde regels. Elke Meting telt even zwaar mee, ongeacht het aantal respondenten.
- **Teller.** "N Metingen" per Assessment. Er is geen Y, want de Admin kiest de Metingen zelf.
- **Weergave.** Per Assessment een sectie met het gemiddelde van alle gekozen Metingen en per Meting haar eigen scores ernaast. Daarnaast een view per Meting, met de Meting X naast het gemiddelde van de overige Metingen, zonder X, in dezelfde opbouw als de view per organisatie. Binnen één organisatie is anonimiteit geen probleem voor de Admin, dus de namen van de Metingen staan erbij.
- **Toewijzen aan een Lead.** Een Admin kan de view van een Meting toewijzen aan een Lead op die Meting (zie Toewijzen aan een Lead op alle niveaus).
- **Verwijderen.** Valt een Meting weg, dan verdwijnt het lid, zoals op niveau 1. Een benchmark met minder dan twee leden per Assessment geeft een melding.

## Niveau 3: Binnen een Meting

**Voorstel, ontwerp volgt.** De vraag is hoe een scan scoort ten opzichte van alle andere scans in dezelfde Meting. Het ontwerp van de spreiding en van hoge en lage scores volgt later. Wat nu vastligt:

- **Lid.** Een afgeronde scan. De vergelijkgroep van een scan is alle andere afgeronde scans in dezelfde Meting, zonder de scan zelf. Dat is dezelfde reden als op niveau 1.
- **Berekening.** Elke scan telt even zwaar mee. Per vraag het gemiddelde antwoord van de andere scans, daarop de gedeelde scorefunctie.
- **Ondergrens.** Bij weinig scans is de vergelijking te herleiden naar personen. Daarom geldt een eigen instelling voor niveau 3, `benchmarkMinRespondenten` (voorstel, startwaarde 5): Het minimale aantal afgeronde scans in de Meting, inclusief de scan van de view. Een Admin past hem aan in Instellingen. Te bevestigen.
- **Wie ziet het.** De Admin, die de namen van de Respondenten al ziet, en een Lead aan wie de Admin de view heeft toegewezen (zie Toewijzen aan een Lead op alle niveaus).
- **Opslag.** Omdat een view toewijsbaar is, is er een `Benchmark` met niveau "scans" en één lid, de Meting. De scan waar de view over gaat, staat op de toewijzing (`BenchmarkToewijzing.onderwerpRespondentId`).
- **Nog te ontwerpen.** Spreiding per bouwblok (bijvoorbeeld de verdeling van de antwoorden of de laagste tot hoogste score), de plek van een scan in die spreiding, en het zichtbaar maken van hoge en lage scores. Zie `backlog.md`.

## Toewijzen aan een Lead op alle niveaus

**Besloten.** Op elk niveau kan een Admin een view toewijzen aan een Lead. Een view is steeds één lid tegenover de rest van de groep, zonder dat lid zelf (zie View per organisatie). Op niveau 1 is dit gebouwd. Niveau 2 en 3 zijn voorstel.

| Niveau | De view gaat over | De Lead is | Vergelijkt met |
|---|---|---|---|
| 1 | Organisatie X | Een Lead van X, die de Meting van X mag inzien | De overige organisaties |
| 2 | Meting M | Een Lead op M (`RespondentRolMeting`) | De overige Metingen in de benchmark |
| 3 | De scan van Respondent R in Meting M | Een Lead op M | De overige scans in M |

**Voorstel.** De regels van niveau 1 gelden op alle niveaus.

- Er is geen automatische toegang. De Lead krijgt de view alleen als een Admin die toewijst, per benchmark en per onderwerp (organisatie, Meting of scan).
- De Lead ziet nooit de namen van andere leden. Op niveau 2 staan dus geen namen van andere Metingen in zijn view, ook al ziet de Admin ze wel.
- Een Lead ziet een sectie alleen voor een Assessment waarvan hij de Meting mag inzien, en alleen als de groep aan de drempel voldoet.
- **Drempels.** Elk niveau heeft een eigen instelling, door een Admin aan te passen in Instellingen. Niveau 1: `benchmarkMinOrganisaties` (gebouwd, startwaarde 5). Niveau 2: `benchmarkMinMetingen` (voorstel, startwaarde 3): Het minimale aantal Metingen in de groep per Assessment, inclusief de Meting van de view. Niveau 3: `benchmarkMinRespondenten` (voorstel, startwaarde 5, zie Niveau 3). De startwaarden van niveau 2 en 3 moeten nog worden bevestigd. Een view kan alleen worden toegewezen als de groep aan de drempel van zijn niveau voldoet. De Admin ziet de benchmark altijd, ook onder de drempel.
- **Niveau 3 en privacy.** Een view van de scan van R laat de scores van die ene Respondent zien. Een Lead ziet standaard alleen geaggregeerde resultaten (`beheerpagina.md`, punt 6a), en dat blijft zo. De toewijzing is het expliciete besluit van een Admin om één Lead deze view te geven, op één Respondent. Daar is geen extra bevestiging voor nodig. De knop "Toewijzen" noemt wel dat de Lead hiermee de scores van deze Respondent ziet. Hoge en lage scores en spreiding komen later in deze view.

**Het scherm.** Op elke view staat een blok "Toewijzen aan een Lead", gelijk op alle niveaus.

- Een lijst van de Leads aan wie de view is toegewezen, met de datum en twee knoppen: "Bekijk" en "Intrekken".
- "Bekijk" opent het Respondent-overzicht (modal) van die Lead (`beheerpagina.md`, punt 6b), over de benchmarkpagina heen. De Admin ziet daarin het blok Toegang en de Metingen waarop de Lead Lead is, en kan er de persoonlijke link kopiëren. Sluiten brengt de Admin terug op de view. Op niveau 1 is de knop "Bekijk" nog niet gebouwd.
- Onder de lijst een keuzelijst met de Leads die in aanmerking komen en de view nog niet hebben, met de knop "Toewijzen". Zijn er geen Leads meer, dan staat er "Alle Leads hebben deze view al". Heeft het onderwerp geen enkele Lead, dan staat er "Geen Lead beschikbaar" met de reden (de organisatie of Meting heeft nog geen Lead), en de knop is uitgeschakeld (`info.benchmarkToewijzen`).

**Verwijderen en intrekken.** Een toewijzing vervalt als de Meting wordt verwijderd, als de Respondent van de view of de Lead wordt verwijderd, als de scan wordt verwijderd, of als de Lead de Lead-rol op de Meting verliest. Een organisatie of Meting die uit de benchmark valt, haalt haar toewijzingen weg (`datamodel.md`, Verwijderen en datakoppelingen).

**Audit.** Dezelfde events als nu (`benchmark.toegewezen`, `benchmark.toewijzingIngetrokken`), met in `details` het niveau en het onderwerp (organisatie of Meting, bij niveau 3 de Meting en geen Respondentnaam). Een Bekijk-actie is geen aparte gebeurtenis.

## Audit en verwijderen

De gebeurtenissen staan in `datamodel.md`, Audit, onder Benchmark. Wat een verwijderactie in andere records voor een benchmark betekent, staat in `datamodel.md`, Verwijderen en datakoppelingen. Een benchmark verwijderen verwijdert ook zijn toewijzingen. Organisaties, Metingen en scans blijven bestaan.

## Nog niet gedekt

- Export (PDF, CSV, InDesign) van een benchmark. Dat is een derde soort naast de export van één scan en van een organisatieresultaat.
- Rechten van een Consultant op de benchmark.
- Een vastgezette versie in plaats van live cijfers.
- De range van de groep als band in de view.
- De berekening op de server (`backlog.md`, Fase 2). Nu draait ze in de browser, dus de privacyregels voor een Lead worden alleen in de schermen bewaakt.
- Een samengestelde Meting, zodat een organisatie met meerdere delen als één deelnemer meedoet aan niveau 1 (`backlog.md`).
- Ontwikkeling in de tijd binnen een benchmark.
- De spreiding en de hoge en lage scores op niveau 2 en 3.
- De privacytekst en het toestemmingsvakje in de intake in de code.

## Open punten

- Bevestigen van de startwaarden 5 en 3.
- Of de tab Benchmark op het hoogste niveau blijft staan.
- De exacte tekst van de disclaimer en het toestemmingsvakje.
- Niveau 2 en 3: De startwaarden van `benchmarkMinMetingen` (3) en `benchmarkMinRespondenten` (5).
- Niveau 2: Of voor het privacy statement iets nodig is, nu de gegevens binnen de organisatie blijven.
- Niveau 3: Het ontwerp van de spreiding en de hoge en lage scores.
