# Coniche Scan: Benchmark

**Status: Voorstel.** Besproken met Sander op 8 oktober 2026, nog niet
gebouwd. De records staan in `datamodel.md` deel 3, de schermen in
`beheerpagina.md` punt 14 en de privacytekst in `privacy-pagina.md`
sectie 3a. Dit bestand beschrijft het gedrag. Per onderdeel staat of het
besloten is of een voorstel dat nog bevestiging vraagt.

## Wat het is

Een benchmark zet de scores van een zelf gekozen groep organisaties naast elkaar. Een Admin stelt hem samen. Daarna kan een Admin voor één deelnemende organisatie een view toewijzen aan een Lead van die organisatie. De Lead ziet dan, naast zijn eigen resultaten, hoe zijn organisatie scoort ten opzichte van de rest van de groep. In die view staan geen namen van andere organisaties.

Een benchmark kan één of meer Assessments omvatten, bijvoorbeeld de Klantcontact Volwassenheidsscan en de AI-volwassenheidsscan. De resultaten van elk Assessment staan in een eigen sectie. Scores van verschillende Assessments worden niet samengevoegd, omdat de bouwblokken verschillen.

Scores worden berekend en nooit opgeslagen (`datamodel.md`, Scoreberekening). Dat geldt ook hier.

## Plek in beheer

**Voorstel.** Een tab "Benchmark" op het hoogste niveau van `.nav-right` voor een Admin, naast Applicatie, Assessments en Organisaties. Een benchmark hoort bij een groep organisaties en dus niet onder één organisatie.

**Besloten.** Vooralsnog kan alleen een Admin erbij. Er komt een eigen permissie `benchmark.beheren`, alleen voor Admin, zodat een Consultant er later bij kan zonder dat de rechtenmatrix om moet. De schermen staan in `beheerpagina.md`, punt 14.

## Datamodel

De records staan in `datamodel.md`, deel 3. Het zijn `Benchmark`,
`BenchmarkLid` (een organisatie met een Assessment en een Meting) en
`BenchmarkToewijzing` (een view voor een Lead), plus het veld
`Organisatie.benchmarkToegestaan`. De twee instellingen
`benchmarkMinOrganisaties` (startwaarde 5) en `benchmarkMinScans`
(startwaarde 3) staan in `beheerpagina.md`, punt 10. Zie Drempels
hieronder.

Per Assessment heeft een organisatie hoogstens één lid in een benchmark.
Het sectorfilter bij het samenstellen wordt niet opgeslagen, het is een
zoekhulp.

## Samenstellen

**Besloten.** De Admin doorloopt drie keuzes, de laatste twee in dezelfde lijst.

1. Assessments kiezen, minstens één.
2. Organisaties kiezen. De lijst toont alleen organisaties met `benchmarkToegestaan` die minstens één meting hebben van een gekozen Assessment, met minimaal `benchmarkMinScans` afgeronde scans. Per organisatie staat welke van de gekozen Assessments ze heeft en hoeveel afgeronde scans. Optioneel kan de lijst gefilterd worden op Sector en Subsector (`sbi-indeling.md`), met meerdere keuzes tegelijk. Het filter is een hulp en geen eis. De groep mag dus uit meerdere sectoren bestaan.
3. Metingen kiezen. Vinkt de Admin een organisatie aan, dan verschijnt eronder per gekozen Assessment één regel met de Meting die meedoet. Voorgekozen is de meest recente Meting met genoeg afgeronde scans. Alleen bij meerdere metingen van hetzelfde Assessment is er iets te kiezen.

Naast elk gekozen Assessment loopt tijdens het samenstellen de teller "X van Y organisaties" mee (zie Teller).

Valt een lid weg doordat de Meting of de Organisatie is verwijderd, of doordat de vlag `benchmarkToegestaan` is ingetrokken, dan verdwijnt het lid uit de benchmark en meldt de beheerweergave dat.

**Voorstel.** Heeft een organisatie een meting voor maar een deel van de gekozen Assessments, dan doet ze mee bij de Assessments waarvoor ze wel een meting heeft. Het aantal organisaties kan dus per Assessment verschillen.

## Berekening

**Besloten.** Elke organisatie telt per Assessment even zwaar mee, ongeacht het aantal respondenten. Bij vijf organisaties telt elke organisatie voor een vijfde.

Per lid:

- Het gemiddelde antwoord per vraag over alle afgeronde scans in de gekozen Meting.
- De gedeelde scorefunctie op die gemiddelden, met `Bouwblok.gewicht`, geeft de bouwblokscore, categoriescore en overall van de organisatie.

De benchmark is het gemiddelde over de leden van dat Assessment, per vraag, bouwblok, categorie en overall. De berekening is lineair, dus dit komt uit op hetzelfde als het gemiddelde van de scores van de organisaties. Er komt geen tweede rekenmethode bij. Gearchiveerde content rekent mee zoals bij de andere weergaven (`datamodel.md`, Content bewerken).

**Voorstel.** De cijfers worden live berekend. De samenstelling staat vast, dus de lijst met organisaties en gekozen metingen verandert alleen als de Admin hem wijzigt. De cijfers bewegen mee als er nog scans binnenkomen, als een scan wordt verwijderd of als een gewicht verandert. Een gewichtswijziging werkt voor alle leden tegelijk door. De weergave toont een peildatum en per organisatie het aantal scans. Is later een stabiele versie nodig, dan kan die een kopie worden die op het toewijzingsrecord vastligt.

Omdat een organisatie met één respondent even zwaar telt als een organisatie met veertig, bewaakt `benchmarkMinScans` de ondergrens.

## Teller

**Besloten.** Boven elke Assessment-sectie staat "X van Y organisaties". Y is het aantal organisaties in de benchmark. X is het aantal daarvan met een lid voor dat Assessment.

- De Admin ziet daarnaast welke organisaties ontbreken en per organisatie het aantal afgeronde scans.
- De Lead ziet alleen het aantal organisaties in de vergelijking, dus zonder Y. Y bevat organisaties die bij dat Assessment niet meedoen, en dat is voor de Lead geen informatie die iets toevoegt.
- Tijdens het samenstellen krijgt de teller een waarschuwingskleur zodra een Assessment onder de drempel zakt.

## Weergave voor de Admin

**Besloten.** Per Assessment een sectie met de gemiddelden van de groep, per vraag, per bouwblok, per categorie en overall. De Admin ziet de namen van de organisaties. De resultaatcomponenten van het resultatenscherm (`CLAUDE.md`, schermflow punt 6) worden hergebruikt waar dat kan. Elke sectie is een zelfstandig onderdeel, zodat een latere PDF per Assessment een eigen deel kan krijgen.

## View per organisatie

**Voorstel.** Vanuit de benchmark opent de Admin voor elke deelnemende organisatie X een view. Per Assessment waar X lid van is, staat de Meting van X naast het gemiddelde van de rest van de groep, zonder X zelf. Zou X meetellen, dan trekt ze het gemiddelde naar zichzelf toe en kan ze bij een kleine groep de scores van de anderen terugrekenen.

Opbouw van de view:

- Een radar met twee reeksen, X en de rest van de groep.
- Het staafdiagram per categorie, met het groepsgemiddelde als markering.
- Het verschil per bouwblok.
- Eventueel de range van de groep (laagste tot hoogste score) als band, zonder namen. Dit is nog te besluiten.
- Onder de view de tekst "Vergelijkgroep van n organisaties, samengesteld door Coniche", met de peildatum.

De view toont nooit de namen van andere organisaties. De Admin bekijkt de view eerst zelf.

## Toewijzen aan een Lead

**Besloten.** De Admin kan de view van organisatie X toewijzen aan een bestaande Lead van die organisatie. De Lead ziet de view naast zijn eigen resultaten op zijn pagina. Intrekken kan ook, door een Admin.

**Voorstel.**

- Toegang volgt de redenering van `datamodel.md` deel 2, Rollen. Er is geen automatische toegang. De Lead krijgt de view alleen als een Admin die toewijst, en per toewijzing van een benchmark en een organisatie.
- Een Lead ziet een sectie alleen voor Assessments waarvan hij de Meting mag inzien (`RespondentRolMeting`). Anders ziet hij een vergelijking met resultaten die hij zelf niet mag openen.
- Een sectie is voor een Lead alleen zichtbaar als het Assessment aan de drempel voldoet. Zit een Assessment eronder, dan kan de Admin die sectie niet toewijzen.
- Nieuwe permissie `benchmark.inzien`, voor de Lead met bereik "toegewezen benchmarkviews". Dat is een nieuwe waarde bij `RolPermissie.bereik`.

## Drempels

**Voorstel.** Twee instellingen, door een Admin aan te passen.

- `benchmarkMinOrganisaties` (startwaarde 5). Minimale groepsgrootte per Assessment, inclusief de organisatie van de view. Bij 5 ziet een Lead het gemiddelde van minstens 4 anderen. De drempel is een afweging op privacy. Bij minder anderen kan een deelnemer uit het groepsgemiddelde en zijn eigen score vrij precies afleiden wat de rest scoort. De Admin ziet de benchmark altijd, ook onder de drempel.
- `benchmarkMinScans` (startwaarde 3). Minimaal aantal afgeronde scans in een Meting om gekozen te mogen worden. Dit gaat over betrouwbaarheid, omdat een organisatiescore uit één of twee scans te weinig zegt, zeker met gelijk gewicht per organisatie.

Het privacy statement belooft een minimale groepsgrootte. Die belofte moet overeenkomen met de ingestelde waarde.

## Toestemming en privacy

**Besloten.** Het privacy statement krijgt een disclaimer, gebaseerd op de formulering van Vlirdens. De inhoud is dat deelname betekent dat geaggregeerde en anonieme gegevens in een benchmark kunnen komen.

**Voorstel.**

- Een vlag `benchmarkToegestaan` per organisatie, door een Admin gezet nadat dit met de organisatie is afgesproken, bijvoorbeeld via contract of mail. Zonder vlag staat de organisatie niet in de keuzelijst. De toestemming in de intake wordt per respondent gegeven en gaat over delen met Coniche. Geïmporteerde scans uit de oude tool en eerdere invullingen hebben de nieuwe tekst nooit gezien. De vlag legt vast dat de organisatie als geheel heeft ingestemd.
- `privacy-pagina.md` (sectie 3a) vermeldt dat er alleen geaggregeerde gegevens in een benchmark komen, dat er nooit een organisatienaam bij staat, welke minimale groepsgrootte geldt, en dat het verwijderen van een scan die scan ook uit de benchmark haalt, omdat alles wordt berekend.
- Het toestemmingsvakje in de intake (`CLAUDE.md`, schermflow punt 4) krijgt een aangepaste tekst. Die geldt voor nieuwe respondenten.

## Audit en verwijderen

De gebeurtenissen staan in `datamodel.md`, Audit, onder Benchmark. Wat een
verwijderactie in andere records voor een benchmark betekent, staat in
`datamodel.md`, Verwijderen en datakoppelingen. Een benchmark verwijderen
verwijdert ook zijn toewijzingen. Organisaties, Metingen en scans blijven
bestaan.

## Nog niet gedekt

- Export (PDF, CSV, InDesign) van een benchmark. Dat is een derde soort naast de export van één scan en van een organisatieresultaat.
- Spreiding tussen respondenten binnen één organisatie.
- Ontwikkeling tussen twee metingen van dezelfde organisatie.
- Rechten van een Consultant op de benchmark.

## Open punten

- Bevestigen van de startwaarden 5 en 3.
- Deelname van een organisatie aan een deel van de gekozen Assessments (voorstel bij Samenstellen).
- Live berekenen met peildatum, of een vastgezette versie bij het toewijzen.
- De range van de groep als band in de view per organisatie.
- Of de tab Benchmark op het hoogste niveau staat.
- De exacte tekst van de disclaimer en het toestemmingsvakje.
