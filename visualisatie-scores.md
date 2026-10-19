# Coniche Scan: Visualisatie van hoge en lage scores

**Status.** Ontwerprichting besloten door Joost op 12 oktober 2026. Gebouwd op 13 oktober 2026 (A tot en met E en G, de navigatie en de schakelaar), met de afwijkingen en wat nog niet is gebouwd onder Gebouwd. Wat een voorstel is dat nog bevestiging vraagt, staat per onderdeel aangegeven. Dit bestand beschrijft wat getoond wordt en hoe het berekend wordt. De precieze opmaak (maten, kleuren, lettergrootte) volgt `stylesheet.md`. Waar dit bestand daar iets aan toevoegt, staat dat onder Nieuwe stijlwaarden.

**Quickscan Ziekenhuis.** Dit bestand gaat uit van scores op de schaal van 1 tot 5. De visualisaties van de Quickscan, die met punten en percentages rekent, staan in `visualisatie-quickscan.md`. Daar geldt de opbouw van A, B, D en G in een eigen vorm.

**Visueel referentieontwerp.** Het canvas "Coniche Scan – visualisatie van scores" (vijf borden, voorbeeldgegevens) is een ontwerpschets en geen code. Waar schets en tekst verschillen, geldt de tekst. De borden staan ook als afbeelding in de map `afbeeldingen` (`visualisatie-a-een-meting.png`, `visualisatie-b-spreiding.png`, `visualisatie-c-tussen-metingen.png`, `visualisatie-d-tussen-organisaties.png` en `visualisatie-e-matrix.png`), plus `visualisatie-f-navigatie.png` met de schakelaar en de knop op de resultatenpagina's (Navigatie). Het canvas zelf is privé en moet door Joost gedeeld worden voordat Sander het kan openen.

## Wat het oplost

Een resultaat moet in één blik laten zien waar een organisatie hoog en laag scoort. Dat geldt op meerdere plekken, met dezelfde schaal en dezelfde leesrichting. G is het laagste niveau, de antwoorden per vraag, dat Sander eerder in Excel maakte.

| Weergave | Vraag | Niveau in `benchmark.md` | Wie ziet het |
|---|---|---|---|
| A. Eén meting | Waar scoren we hoog en laag? | Geen benchmark, de Organisatie-resultaten (`beheerpagina.md`) | Admin, Consultant, Lead |
| B. Spreiding | Zijn de respondenten het eens? | Niveau 3, binnen een Meting | Admin, Lead met vinkje (zonder ring) |
| C. Ontwikkeling tussen metingen | Wat is er veranderd tussen twee meetmomenten van hetzelfde onderdeel? | Niveau 2, binnen een organisatie, lezing Ontwikkeling over tijd, bij twee Metingen | Admin, Lead met vinkje |
| D. Tussen organisaties | Waar zitten we boven of onder de groep? | Niveau 1, de view per organisatie | Admin, Lead met vinkje |
| E. Matrix | Hoe verschillen de Metingen of organisaties per bouwblok? | Niveau 2, binnen een organisatie, en niveau 1, tussen organisaties | Alleen Admin |
| G. Antwoorden per vraag | Wie antwoordde wat, per vraag en per bouwblok? | Het laagste niveau, binnen een Meting | Admin, Consultant, en een Lead met vinkje |
| H. Metingen naast elkaar | Hoe scoren twee onderdelen of samenstellingen ten opzichte van elkaar? | Niveau 2, binnen een organisatie, lezing Naast elkaar, bij twee Metingen | Admin, Lead met vinkje |
| I. Samengestelde Meting en vergelijking | Dezelfde opties als bij één Meting, met onderdelen als eenheid | Een samengestelde Meting, en niveau 2 | Admin, Lead met vinkje |

## Gedeelde regels

Deze regels gelden voor alle weergaven. G wijkt af in de kleuren en heeft geen banden, zie daar.

**Schaal en banden.** De horizontale as loopt van 1 tot 5. De positie van een score is `(score − 1) / 4` van de breedte. Achter elke rij staan drie banden die de classificatie van `CLAUDE.md` (sectie 1) volgen: onder 2,5 (Basis op Orde, 37,5% van de breedte), 2,5 tot en met 3,49 (Uitbouwen, 25%) en vanaf 3,5 (Sterk punt, 37,5%). Boven de eerste rij staan de drie namen. Bij D en E vervalt de bandachtergrond, zie daar. De band is ook de achtergrond in Verkennen (weergaven 1 en 2 en het spreidingsdiagram, `visualisatie-verkennen.md`) en hoort volgens `stylesheet.md` (Drie niveaus van scorekleur) overal waar een score op een schaal staat.

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

- Onder de kop staat de schakelaar met drie weergaven: Overzicht, Per bouwblok en Spreiding. Een Admin en een Consultant zien daarnaast Antwoorden (weergave G), en een Lead alleen als dat vinkje in het Leads-venster aan staat. Overzicht is de standaard en is de huidige pagina (classificatiecirkel, radar, staafdiagram per categorie, top 3, legenda). Per bouwblok is weergave A, Spreiding is weergave B zonder ring.
- Rechts van de schakelaar staat de knop "Vergelijking". Hij is alleen actief als de Meting lid is van een benchmark binnen een organisatie (`benchmark.md`, Niveau 2) en opent die benchmark. Zit ze in meer dan één, dan wordt het een dropdown-knop met de benchmarks op naam en de lezing erbij ("ontwikkeling" of "naast elkaar"). Zit ze in geen enkele, dan staat de knop uitgeschakeld, met de reden in een Info-icoon (`info.vergelijkMetingen`): Een Admin moet eerst een vergelijking aanmaken. De pagina maakt zelf geen vergelijking, ook niet met een eerdere Meting.
- De vergelijking zelf (weergave C) staat in de benchmark en niet op de resultatenpagina. Er is dus geen "Vergelijking sluiten" en geen eyebrow op deze pagina.
- Een Admin ziet onder de weergave de link "Bekijk in benchmark" als de organisatie (niveau 1) lid is van een benchmark. Zit ze in meer dan één, dan is het een keuzelijst.

**Resultatenpagina van één scan** (beheer, kruimelpad … › Resultaten van {Respondent})

- Een tweede schakelaar met Scores van deze scan en Positie in de Meting. Positie in de Meting is weergave B met de ring op deze scan (`?focus=<scanId>`). Dit is de view van niveau 3.
- Is het aantal afgeronde scans in de Meting kleiner dan `benchmarkMinRespondenten`, dan is "Positie in de Meting" uitgeschakeld, met de reden in een Info-icoon (`info.positieMeting`).
- Het Scan-overzicht (modal) krijgt bij "Resultaten bekijken" geen extra knop. De schakelaar staat op de resultatenpagina zelf.
- De respondent zelf ziet op het resultatenscherm (`CLAUDE.md`, scherm 6) geen schakelaar. Er verandert niets aan scherm 6 en aan de PDF-export.

**Benchmark** (Admin)

- Weergave D staat in de view per organisatie en weergave E in het detail van een benchmark op niveau 2, onder het kruimelpad Resultaten › Benchmarks › {naam} (`beheerpagina.md`, punt 14). Er komt geen schakelaar bij.

**Lead**

- Op zijn eigen resultaten ziet een Lead de schakelaar met Overzicht en Per bouwblok, de knop Vergelijking (als hij de benchmark aangevinkt heeft en Resultaten op beide Metingen), en Spreiding en Antwoorden als die vinkjes in het Leads-venster aan staan (`beheerpagina.md`, punt 6a). Spreiding is er voor een Lead zonder ring (gebouwd op 14 oktober 2026). Positie in de Meting is er niet voor een Lead. Benchmarkviews staan als kaart op zijn pagina "Mijn metingen", zoals nu al gespecificeerd.

## A. Eén meting

**Plek.** De weergave Per bouwblok op de resultatenpagina van een Meting (`beheerpagina.md`, Organisatie-resultaten), naast het bestaande Overzicht dat ongewijzigd blijft. Dezelfde component wordt hergebruikt voor de Lead op zijn pagina. Zie Navigatie.

**Data.** Per bouwblok het gemiddelde antwoord per vraag over de afgeronde scans van de Meting, daarop de gedeelde scorefunctie (zoals bij `benchmark.md`, Gedeelde regels, met de scans als leden).

**Opbouw.** Per bouwblok een rij met:

- Een stip op de gemiddelde score, gekleurd naar de klasse. Kleuren: `--stat-red` (Basis op Orde), `--stat-amber` (Uitbouwen) en `--stat-green` (Sterk punt). Dit is een klasse van drie stappen en dus een bewuste keuze naast de vijf scorekleuren van `stylesheet.md` (zie Open punten).
- Een dunne lijn van de laagste tot de hoogste bouwblokscore van een afgeronde scan.
- Rechts het gemiddelde als getal, vet.

**Staafdiagram per categorie in het Overzicht** (gebouwd op 19 oktober 2026). De balken krijgen de categoriekleuren in plaats van de klassekleur, met de klassegrenzen als stippellijn en het getal boven elke balk (`stylesheet.md`, Categoriekleuren). Dit geldt voor het Overzicht van een Meting, van een samengestelde Meting en van het groepsgemiddelde in een benchmark, en voor het scherm van de respondent (`CLAUDE.md`, scherm 6). De PDF-export blijft zoals beschreven in de exportspecs.

**Tegels.** Totaalscore met de klasse, hoogste bouwblok (score en naam), laagste bouwblok (score en naam), en de verdeling van de bouwblokken over de drie klassen.

**Drempel.** De lijn van laagste tot hoogste toont de score van één scan en is bij weinig scans herleidbaar. Voor een Admin staat de lijn altijd aan. Voor een Lead staat de lijn pas aan vanaf `benchmarkMinRespondenten` (voorstel, startwaarde 5, zie `benchmark.md`, Niveau 3).

## B. Spreiding binnen een Meting (niveau 3)

Dit vult het onderdeel "Nog te ontwerpen" van `benchmark.md`, niveau 3.

**Plek.** De weergave Spreiding op de resultatenpagina van een Meting (zonder ring, voor een Admin en voor een Lead met het vinkje Spreiding) en de weergave Positie in de Meting op de resultatenpagina van één scan (met ring). Dat tweede is de view van niveau 3. Zie Navigatie.

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

## C. Ontwikkeling tussen metingen

**Plek.** De view van een benchmark binnen een organisatie met de lezing Ontwikkeling over tijd (`benchmark.md`, Niveau 2, Lezing), voor een Admin en, bij een aangevinkte benchmark en Resultaten op beide Metingen, voor een Lead. Er is geen knop die op de resultatenpagina zelf een vergelijking maakt. Dit vervangt het item "Trend tussen Metingen van dezelfde organisatie" uit `backlog.md`.

**Data.** Het gemiddelde per bouwblok van beide Metingen, berekend als bij A. De nieuwere Meting is die met de latere meetdatum. Beide Metingen hebben hetzelfde onderdeel, want de lezing dwingt dat af. Het verschil is de getoonde waarde van de nieuwere Meting min de getoonde waarde van de oudere, zodat wat de lezer ziet optelt. Alleen Metingen van hetzelfde Assessment zijn te vergelijken. Beide Metingen moeten voldoen aan `benchmarkMinScans`.

**Opbouw.** Per bouwblok een rij met:

- Een holle ring op de vorige Meting (grijs).
- Een gevulde stip op de huidige Meting, gekleurd naar de klasse zoals bij A.
- Een lijn ertussen: blauw (`--bl`) bij een stijging, donkeroranje (`--dal`) bij een daling, grijs bij geen verandering.
- Rechts het verschil met een driehoekje en een teken ("▲ +0,3", "▼ −0,3"), en als het bouwblok van klasse wisselt een label zoals "Basis op orde → Uitbouwen".

**Tegels.** Totaalscore van de vorige en huidige Meting ("2,9 → 3,1"), aantal bouwblokken gestegen, aantal gedaald, aantal van klasse gewisseld.

**Meetdatum en onderdeel (gebouwd op 14 oktober 2026, ter vervanging van de eerdere waarschuwing bij een ander onderdeel).** De volgorde komt uit de meetdatum (`datamodel.md`, Meting). De Admin kiest zelf welke twee Metingen een vergelijking vormen, dus er is geen automatisch voorgestelde vorige Meting. Twee Metingen met een ander onderdeel komen hier niet voor: Die zijn te vergelijken met de lezing Naast elkaar (weergave H). Een samengestelde Meting is te vergelijken met een andere samengestelde Meting, zodat "Hele organisatie 2025" naast "Hele organisatie 2026" kan staan.

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

**Plek.** De weergave van niveau 2 (`benchmark.md`, Niveau 2, Weergave), per Assessment. Op niveau 1 staat dezelfde matrix per Assessment onder de gemiddelden van de groep (`benchmark.md`, Niveau 1, Weergave voor de Admin), met organisaties als kolommen. Alleen voor een Admin, omdat de kolomkoppen de labels van de Metingen tonen en een Lead die van andere Metingen niet mag zien (`benchmark.md`, View voor een Lead). Een Lead krijgt op niveau 2 de vergelijking van zijn eigen Metingen in weergave C. Op niveau 1 krijgt hij de view van zijn organisatie tegenover de groep, in de opbouw van D.

**Data.** Per bouwblok het gemiddelde van elke gekozen Meting. Elke Meting telt even zwaar mee, ongeacht het aantal respondenten. De kop boven de rijen is "Bouwblok" en niet "Bouwsteen".

**Opbouw.** Rijen zijn bouwblokken, kolommen zijn de Metingen met hun label en het aantal afgeronde scans eronder. Elke cel is gevuld naar de klasse, met het getal erin. Rechts staan het gemiddelde van de rij en het bereik (laagste tot hoogste). Onderaan staat een rij Totaalscore, gekleurd op dezelfde manier. Op niveau 2 vervallen het gemiddelde van de rij, het bereik en de markering voor afwijking, want er is geen groep om van af te wijken. In plaats daarvan komt er bij twee Metingen een kolom Verschil (zie Volgorde van de kolommen). Op niveau 1 krijgt een cel die 0,5 of meer afwijkt van het gemiddelde van de rij een driehoek van 8px in de linkerbovenhoek, blauw (`--bl`) bij boven en donkeroranje (`--dal`) bij onder (voorstel van 15 oktober 2026, voorheen een zwarte rand van 2px, `stylesheet.md`, Verschil en afwijking).

**Tegels.** Hoogste Meting en laagste Meting (totaalscore en daaronder het onderdeel en de meetdatum, zoals in de kolomkop, en niet alleen de naam van de Meting), bouwblok met het grootste verschil tussen Metingen, aantal cellen met een markering voor afwijking.

**Niveau 1, kolommen met organisaties.** Besloten op 13 oktober 2026, gebouwd op 13 oktober 2026. De opbouw, de kleuren, de markering voor afwijking, de rij Totaalscore en de tegels zijn gelijk aan niveau 2. Wat anders is:

- De kolomkop is de korte naam van de organisatie (`Organisatie.korteNaam`, anders de naam) op één regel, met daaronder "n = 5" voor het aantal afgeronde scans (voorstel van 15 oktober 2026, voorheen drie regels). Het label van de Meting en de volledige naam staan in een tooltip. De kolom is 96px breed (`stylesheet.md`, Kolomkop en rijkop). Op niveau 2 is de kop het label van de Meting, op dezelfde manier ingekort.
- De tegels heten Hoogste organisatie en Laagste organisatie, met de totaalscore en de organisatienaam.
- Organisaties zonder lid bij dit Assessment hebben geen kolom.
- De matrix is alleen voor de Admin. De privacyregel van D geldt voor een Lead en verandert daar niets aan, omdat een Lead de matrix niet ziet.
- Een Lead met een aangevinkte benchmark krijgt nooit de kolommen van andere organisaties, ook niet anoniem.

**Samengestelde Meting (gebouwd op 13 oktober 2026).** De matrix onder een samengestelde Meting (`benchmark.md`, Onderdeel en samengestelde Meting) heeft de onderliggende Metingen als kolommen. Alleen voor de Admin, om dezelfde reden als op niveau 2.

**Volgorde van de kolommen (gebouwd op 14 oktober 2026, ter vervanging van de groepering per onderdeel, met de kolom Verschil bij Ontwikkeling over tijd en de kolom Hoogste bij Naast elkaar).** De kolommen staan op meetdatum, de oudste links. De kolom is 96px breed (`stylesheet.md`, Kolomkop en rijkop). De kolomkop heeft twee regels van vaste hoogte. De eerste regel is het onderdeel van de Meting (de korte naam, in 14px gewicht 700), want dat onderscheidt de Metingen. Veel Metingen heten gelijk, bijvoorbeeld "0-meting", en een kop met alleen die naam zegt dan niets. De tweede regel is de meetdatum in 12px. Heeft een Meting geen onderdeel, dan staat op de eerste regel de naam van de Meting. Een lange naam wordt afgekapt. De naam van de Meting, het onderdeel, de meetdatum en het aantal afgeronde scans staan volledig in de tooltip. Tekst loopt nooit buiten de kolom en over de kop ernaast. Bij precies twee Metingen komt er rechts een kolom bij, afhankelijk van de lezing. Bij Ontwikkeling over tijd is dat Verschil, de nieuwere min de oudere, met dezelfde opbouw als weergave C. Bij Naast elkaar staan de kolommen op de naam van de Meting in plaats van op meetdatum, en is de extra kolom Hoogste, met het symbool of de naam van de Meting die op die rij hoger scoort en "Gelijk" bij gelijke getoonde waarden. Bij meer dan twee Metingen is er nog geen extra kolom.

**Overzicht van een ronde (gebouwd op 13 oktober 2026, vervalt met de ronde).** Dit overzicht en de knop in de rondekop vervallen. Voor het zien van meerdere onderdelen naast elkaar maakt de Admin een vergelijking tussen Metingen.

**Andere kolommen.** Alleen opeenvolgende Metingen in de tijd in dezelfde matrix, zonder groepering, is nu geen besluit en vraagt eerst een uitwerking.

## G. Antwoorden per vraag

**Status.** Voorstel van 13 oktober 2026, gebouwd op 13 oktober 2026 (zie Gebouwd).

**Plek.** De weergave Antwoorden op de resultatenpagina van een Meting (zie Navigatie), voor een Admin, een Consultant met bereik op de organisatie en een Lead met het vinkje Antwoorden voor deze Meting. Dit is het laagste niveau en vervangt het Excel-overzicht van Sander.

**Data.** Eén kolom per afgeronde scan in de Meting. Rijen zijn de bouwblokken, elk uitklapbaar tot zijn vragen.

- Een vraagrij toont links de echte vraagtekst uit de content van het Assessment, volledig en niet ingekort, en dus in de vorm die de respondent zag (`content-klantcontact-volwassenheid.md` en de andere contentbestanden). Bij een Zorgscan zijn dat de sectorvarianten. De teksten in het canvas zijn voorbeelden. Rechts daarvan staat het antwoord van elke respondent als geheel getal van 1 tot 5. Een onbeantwoorde vraag is een lege cel.
- Is de content van een vraag later gewijzigd of gearchiveerd, dan toont de rij de tekst zoals die bij deze Meting hoort, in lijn met hoe gearchiveerde content elders meetelt (`datamodel.md`, Content bewerken).
- Een bouwblokrij toont per respondent de bouwblokscore, het gemiddelde van de beantwoorde vragen van die respondent, op één decimaal.
- Rechts staat per rij het gemiddelde (Gem.) en het aantal beantwoorde antwoorden (N). Gem. bij een vraag is het gemiddelde antwoord over de respondenten. Gem. bij een bouwblok is het gemiddelde van de vraaggemiddelden, zoals bij weergave A.
- Onderaan staat een rij Totaalscore per respondent, uit de gedeelde scorefunctie met `Bouwblok.gewicht`. Gem. is de totaalscore van de Meting. N is het aantal beantwoorde antwoorden.

**Kleur.** Elke cel krijgt de scorekleur van de afgeronde waarde, met de vijf stappen van `stylesheet.md`: 1 `--score-1` (rood) tot 5 `--score-5` (donkergroen). Afronden gaat half-away-from-zero, dus 2,5 krijgt de kleur van 3. Een lege cel is wit met een rand van 1px (`--border`). Deze weergave gebruikt dus de vijf stappen en niet de drie klassekleuren van A tot en met E, omdat hier losse antwoorden staan en geen gemiddelden over een groep.

**Zachtere kleur (voorstel van 15 oktober 2026, wijziging op wat gebouwd is).** De cel gebruikt de celtint van de stap (`--score-1-cel` tot `--score-5-cel`, met tekst `--score-N-cel-tekst`, `stylesheet.md`, Drie niveaus van scorekleur) en niet de volle scorekleur. De volle kleuren, met wit op 1 en 5, waren in de praktijk te hard voor een tabel vol cijfers. De tekst in elke cel is donker en wijkt daarmee ook af van de PDF, waar de tekst op oranje wit is.

**Opbouw.**

- Kolomkop met de initialen van de respondent. De volledige naam staat in een tooltip. Het voorbeeld toont R1 tot R14. Voor een Lead zonder namen (`Organisatie.antwoordenMetNamen` uit) staat er R1 tot en met Rn en is er geen tooltip met een naam.
- Een blokrij heeft een achtergrond van `--bg-warm`, de accentrand van 4px in de categoriekleur, het volgnummer, de naam en een pijltje dat de rij open- en dichtklapt. Een vraagrij heeft de vraagtekst op één tot drie regels. Vraagrijen zijn hoger dan blokrijen (50px tegenover 30px per cel).
- Alle bouwblokken staan standaard ingeklapt. Boven de kaart staan de knoppen "Alles uitklappen" en "Alles inklappen". De open of dichte stand wordt niet in de adresbalk bewaard.
- De kolomkop blijft staan bij het scrollen. Bij meer dan 14 respondenten scrolt de kaart horizontaal, met de linkerkolom (bouwblok en vraag) vast.

**Tegels.** Aantal respondenten, percentage beantwoorde vragen (met het totaal), laagste vraag (score, bouwblok en vraagnummer) en hoogste vraag.

**Privacy.** Dit zijn de antwoorden van individuele personen. Een Lead ziet deze weergave alleen als een Admin in het Leads-venster het vinkje Antwoorden voor die Meting heeft aangevinkt (gebouwd op 14 oktober 2026, `beheerpagina.md`, punt 6a). Of hij daarbij namen ziet, bepaalt `Organisatie.antwoordenMetNamen`. Staat die uit, dan heten de kolommen R1 tot en met Rn, zonder tooltip met een naam, in een vaste volgorde die niet de naam of het moment van afronden volgt. Bij anonieme namen is de weergave voor een Lead pas aan te vinken vanaf `benchmarkMinRespondenten` afgeronde scans in de Meting. Een samengestelde Meting heeft geen Antwoorden. De opmerkingen per bouwblok staan niet in deze weergave.

## H. Metingen naast elkaar (niveau 2)

**Gebouwd op 14 oktober 2026.** Weergave voor een benchmark binnen een organisatie met de lezing Naast elkaar (`benchmark.md`, Niveau 2, Lezing). Ze beantwoordt de vraag hoe twee onderdelen of samenstellingen scoren ten opzichte van elkaar, op een vergelijkbaar meetmoment. Ze is geen ontwikkeling en toont dus geen richting.

**Plek.** De view van de benchmark, voor een Admin en, bij een aangevinkte benchmark en Resultaten op beide Metingen, voor een Lead. Onder de weergave staat dezelfde matrix als bij C (onderdeel E).

**Data.** Het gemiddelde per bouwblok van beide Metingen, berekend als bij A. De volgorde is op de naam van de Meting. Het verschil is de getoonde waarde van de eerste Meting min die van de tweede, als getal zonder teken. Beide Metingen moeten voldoen aan `benchmarkMinScans`.

**Opbouw.** Boven de weergave staat een legenda met per Meting het symbool, de naam en de meetdatum. Per bouwblok een rij met:

- Een gevulde cirkel voor de eerste Meting en een gevulde ruit voor de tweede, beide gekleurd naar de klasse zoals bij A. De vorm onderscheidt de twee, niet de kleur.
- Een dunne grijze lijn ertussen, zonder pijlpunt en zonder blauw of oranje (die kleuren staan bij C voor richting).
- Rechts het verschil als getal met het symbool van de Meting die hoger scoort ("● 0,3" of "◆ 0,3"), en "Gelijk" bij 0,0.

**Tegels.** De totaalscore van beide Metingen naast elkaar, gescheiden door een streep en zonder pijl ("2,9 | 3,1"), het aantal bouwblokken waar de cirkel hoger scoort, het aantal waar de ruit hoger scoort en het aantal gelijke.

**Meer dan twee Metingen.** Hier is nog geen ontwerp voor. Voorstel voor later is een eigen symbool per Meting.

## I. Dezelfde opties voor een samengestelde Meting en een vergelijking

**Voorstel van 16 oktober 2026, ontworpen in "Coniche Scan Resultaten en onderdelen" (versie 3), gebouwd op 19 oktober 2026.** Een Meting, een samengestelde Meting en een vergelijking binnen een organisatie krijgen dezelfde schakelaar en dezelfde weergaven. Joost wilde alle opties op alle drie de resultaatschermen. Wat anders is, volgt uit de eenheid: Bij een Meting is de eenheid een afgeronde scan, bij een samengestelde Meting en een vergelijking is het een onderdeel (een Meting).

**Schakelaar.** Overzicht, Per bouwblok, Spreiding en Antwoorden (Navigatie). Antwoorden is er alleen bij één Meting, want een samengestelde Meting heeft geen scans en een vergelijking mengt Metingen. Bij de andere twee staat Antwoorden uitgeschakeld.

**Toon als.** Alleen bij een samengestelde Meting en een vergelijking staat rechts van de schakelaar "Toon als" met Gemiddeld en Naast elkaar, naast een Info-icoon. De balk heeft twee groepen met ruimte ertussen. Links staat de schakelaar met haar Info-icoon. Rechts staat het label "Toon als", het Info-icoon daarvan en de pil, als één groep. Tussen de twee groepen zit minstens 32 pixels, zodat de twee Info-iconen niet naast elkaar staan en het label niet tegen de schakelaar plakt. Op een smal scherm komt "Toon als" onder de schakelaar.

- **Gemiddeld.** Elk onderdeel telt even zwaar, ongeacht het aantal scans (`benchmark.md`, Samengestelde Meting). Het scherm laat niet zien welk onderdeel waar zit. Dit is de standaard bij een samengestelde Meting.
- **Naast elkaar.** Elk onderdeel heeft een eigen vorm (cirkel, ruit, vierkant, driehoek omhoog, driehoek omlaag, plus), gekleurd naar de klasse zoals bij A. Boven de weergave staat een legenda met de vormen en de namen. De vorm onderscheidt de onderdelen, niet de kleur (zelfde principe als H). Dit is de standaard bij een vergelijking, omdat de Admin de Metingen daar zelf heeft gekozen. Er zijn zes vormen, dus Naast elkaar is er bij hoogstens zes onderdelen. Bij meer staat de keuze uitgeschakeld, met de reden in het Info-icoon.

**Per bouwblok (A).**

- Gemiddeld: Een stip op het gemiddelde van de onderdelen en een lijn van het laagste tot het hoogste onderdeel.
- Naast elkaar: Een vorm per onderdeel op zijn eigen score en de streep op het gemiddelde. Onderdelen met dezelfde score staan onder elkaar gestapeld, zoals bij B.

**Spreiding tussen onderdelen (B).** Dezelfde weergave als B, met een stip per onderdeel in plaats van een stip per scan, en de streep op het gemiddelde. Het spreidingslabel gebruikt dezelfde grenzen als bij B. De weergave is er vanaf drie onderdelen, want bij twee zegt een standaardafwijking weinig. Bij minder dan drie staat de zin "Spreiding tussen onderdelen is er vanaf 3 onderdelen". Bij Naast elkaar krijgen de stippen de vorm van hun onderdeel.

**Tegels.** Bij Spreiding drie kaarten naast elkaar, zoals ook bij een Meting. Het getal staat groot en de naam van het bouwblok eronder.

- De eerste kaart is Respondenten (afgeronde scans) bij een Meting en Onderdelen bij een samengestelde Meting ("Metingen in deze samenstelling") en bij een vergelijking ("onderdelen in deze vergelijking").
- De tweede kaart is Meest verdeeld: De standaardafwijking van het bouwblok met de grootste spreiding, met de naam eronder.
- De derde kaart is Meest eensgezind: Dezelfde berekening voor het bouwblok met de kleinste spreiding.

Zo blijft de rij tegels gelijk aan die van een Meting (gebouwd). De eerdere tekstregel met "(sd 0,86)" is vervallen.

**Overzicht.** Bij een samengestelde Meting en een vergelijking staat onder het Overzicht een kaart per onderdeel met de vorm, de naam, de meetdatum en de totaalscore in de klassekleur.

**Wie ziet het.** Dezelfde regels als bij de bestaande weergaven. Een Lead ziet een samengestelde Meting alleen als hij Resultaten heeft (`benchmark.md`, View voor een Lead). Voor een vergelijking geldt wat bij Niveau 2 staat. Een samengestelde Meting heeft in het Leads-venster alleen de kolom Resultaten. Gemiddeld, Naast elkaar en Spreiding tussen onderdelen vallen daar voorlopig onder. Zo gebouwd op 19 oktober 2026 (Gebouwd op 19 oktober 2026: I en J): Een Lead krijgt Gemiddeld en Spreiding, zonder Naast elkaar en zonder kaarten per onderdeel, omdat die de namen van de onderliggende Metingen tonen en `benchmark.md` die voor een Lead verbergt.

**Open.** Of Spreiding tussen onderdelen een eigen vinkje voor een Lead krijgt. De stippen zijn onderdelen van zijn eigen Organisatie, dus anonimiteit speelt niet, maar het Leads-venster kent bij een samengestelde Meting nu alleen Resultaten. Daarnaast of Naast elkaar bij meer dan zes onderdelen een andere vormentaal nodig heeft.

## J. Dekking per scherm en de gaten in de bouw

**Voorstel van 19 oktober 2026, gebouwd op 19 oktober 2026.** Joost liep de gebouwde app na met twaalf screenshots en zag dat de weergaven van de Meting niet overal terugkomen. Het gaat om de benchmark op niveau 1, het perspectief per lid, de opgeslagen verkenning en de hoofdpagina van een Meting met scans. Deze sectie zegt wat elk scherm moet tonen. Elk scherm met scores krijgt dezelfde schakelaar (Navigatie en onderdeel I), met de weergaven die bij zijn eenheid horen.

**Niveau 1, detail van een benchmark.** De schakelaar staat boven de weergave, met de samenvatting van de groep bovenaan (het groepsgemiddelde, zoals een Respondent zijn eigen scan ziet). De volgorde is Overzicht, Per bouwblok, Spreiding tussen Organisaties en de matrix (E).

- **Overzicht.** Het staafdiagram per categorie en de totaalscore van de groep, met de leden als kaarten of lijst.
- **Per bouwblok.** Weergave D: Per bouwblok een stip op het groepsgemiddelde en de band van laagste tot hoogste lid.
- **Spreiding tussen Organisaties.** Weergave B met een stip per lid. De namen blijven uit beeld voor een Lead.
- **Matrix.** Weergave E, bij Eenheid Onderdelen met de onderdelen als kolommen.

**Perspectief van een lid (niveau 1).** Een Organisatie tegenover de rest van de groep, met dezelfde schakelaar. Bij een opgeslagen verkenning op één Organisatie is er geen rest. Dan staat het onderdeel tegenover de overige onderdelen (`benchmark.md`, Opgeslagen verkenning, Detail en perspectief).

**Niveau 3, de hoofdpagina van een Meting met scans.** Boven de lijst met scans staan Overzicht en Spreiding, zonder de positie-ring die bij het perspectief van één scan hoort. Alleen de namen in de lijst was te kaal. Kiest de gebruiker een scan, dan volgt de samenvatting van die Respondent met daaronder de positie ten opzichte van de groep.

**Labels volgen de eenheid.** Bij Eenheid Onderdelen staat "Hoogste onderdeel" en "Laagste onderdeel" in plaats van Organisatie, "Per bouwblok en per onderdeel" als kop, en de teller "3 onderdelen van 1 Organisatie". In elke tekst staat "Bouwblok" en niet "Bouwsteen".

**Getallen.** Overal een decimale komma, dus 3,8 en niet 3.8. Dat geldt ook voor de tegels en de tooltips.

**Dekking.** Per scherm staat welke weergave erin hoort en wat de stand is.

| Scherm | Overzicht | Per bouwblok | Spreiding | Antwoorden | Stand |
|---|---|---|---|---|---|
| Meting met scans (niveau 3) | Ja | Ja (A) | Ja (B) | Ja (G) | Gebouwd: De hoofdpagina in een benchmark heeft Overzicht en Spreiding boven de lijst |
| Samengestelde Meting | Ja | Ja | Ja vanaf 3 onderdelen | Uitgeschakeld | Gebouwd |
| Vergelijking binnen een organisatie (niveau 2) | Ja | Ja (C of H, Gemiddeld, of Naast elkaar met vormen) | Ja vanaf 3 Metingen | Uitgeschakeld | Gebouwd |
| Benchmark tussen organisaties (niveau 1) | Ja | Ja (stip op het groepsgemiddelde met de lijn van laagste tot hoogste lid) | Ja vanaf 3 leden | Nee | Gebouwd, met de matrix als vierde weergave |
| Perspectief van een lid (niveau 1) | Ja | Ja (D) | Ja vanaf 3 leden, met de ring op het lid | Nee | Gebouwd |
| Opgeslagen verkenning, Organisaties | Ja | Ja | Ja | Nee | Gebouwd, valt onder niveau 1 |
| Opgeslagen verkenning, Onderdelen op één Organisatie | Ja | Ja | Ja vanaf 3 onderdelen | Uitgeschakeld | Gebouwd: Het detail is weergave I met Toon als |

Antwoorden per vraag is er alleen bij één Meting. Voor de andere schermen is dat uitgesteld.

## Gebouwd op 19 oktober 2026: I en J

Gebouwd (`lib/visualisatie.ts`, `components/visualisatie/OnderdelenWeergaven.tsx`, `WeergaveMeerdere.tsx`, `VormTeken.tsx`). De
weergaven A en B rekenen met eenheden alsof het scans zijn (`eenhedenGemiddeld`, `eenhedenSpreiding`): Elk onderdeel of lid
is een pseudo-scan met haar gemiddelde antwoord per vraag, dus er is geen tweede rekenmethode. Naast elkaar met zes vormen
(`eenhedenNaastElkaar`, `VORMEN`, met clip-path in `visualisatie.css`) en de stapeling van gelijke scores (`stapelStappen`).

**Plekken**

- **Samengestelde Meting** (`MetingWeergaven` met `onderdelen`): De schakelaar met Overzicht, Per bouwblok, Spreiding en Antwoorden
  (uitgeschakeld, `info.antwoordenGeenScans`), "Toon als" met Gemiddeld (standaard) en Naast elkaar (`?toon=naast`), en onder het
  Overzicht een kaart per onderdeel (`OnderdelenKaarten`) met vorm, naam, meetdatum en totaalscore.
- **Vergelijking binnen een organisatie** (`MetingenVergelijkingView`): Dezelfde schakelaar met eigen stand (niet in de
  adresbalk), Naast elkaar als standaard. Bij precies twee Metingen is Naast elkaar weergave C of H naar de lezing, bij drie tot en
  met zes Metingen staan de vormen er, wat ook de eerdere beperking tot twee Metingen in C en H opheft voor Naast elkaar.
- **Benchmark tussen organisaties** (`BenchmarkGroepSectie`): De samenvatting van de groep bovenaan, daaronder de schakelaar
  Overzicht, Per bouwblok, Spreiding en Matrix. Bij een opgeslagen verkenning op één Organisatie met de eenheid Onderdelen is het
  detail weergave I, met Toon als en Antwoorden uitgeschakeld.
- **Perspectief van een lid** (`BenchmarkOrganisatieView`): Overzicht, Per bouwblok (D) en Spreiding (B met de ring op het lid, de
  overige leden zijn de vergelijkgroep: `VergelijkingsView.spreidingLeden`). De Admin ziet het perspectief van een onderdeel
  ook op `/beheer/benchmark/[id]/organisatie/[id]` (`leadViewsOnderdelen`).
- **Hoofdpagina van een Meting met scans** (`BenchmarkScanSectie`, niveau 3): Overzicht en Spreiding boven de lijst. De view van
  één scan houdt de samenvatting van de Respondent met daaronder de positie ten opzichte van de groep, zonder schakelaar.
- **Labels en getallen**: `bouwblokWoorden` geeft "bouwblok" waar de Assessment "bouwsteen" zegt, in de weergaven van de
  resultaten, de benchmark en Verkennen, en "onderdeel" als eenheid (de matrix heeft de tegels Hoogste en Laagste onderdeel, de
  kop "Per bouwblok en per onderdeel"). Scores staan overal met een decimale komma (`formatScore`, ook op het scherm van de
  respondent).

**Afwijkingen en keuzes**

- Spreiding is er vanaf drie eenheden, ook bij organisaties (in I stond dat alleen voor onderdelen). De uitgeschakelde pil heeft een
  tooltip, bij onderdelen ook `info.spreidingOnderdelen`.
- Een Lead op een samengestelde Meting ziet de namen van de onderliggende Metingen niet (`benchmark.md`, Onderdeel en samengestelde
  Meting, wint van de regel "vallen daar voorlopig onder" in I): Voor hem staan Overzicht, Per bouwblok met Gemiddeld en Spreiding,
  zonder Toon als en zonder kaarten per onderdeel. De stippen in Spreiding hebben geen naam.
- Naast elkaar is er bij twee tot en met zes onderdelen (`info.toonAlsTeVeel` bij meer). Bij één onderdeel valt er niets te vergelijken.
- Bij een benchmark tussen organisaties heeft Per bouwblok geen Toon als: Het is het gemiddelde met de lijn van laagste tot hoogste
  lid. De kwartielbanden van D staan alleen in het perspectief van een lid.
- Voor de Admin op `/beheer/benchmark/[id]/organisatie/[id]` bij de eenheid Onderdelen tonen alleen onderdelen die voldoen aan
  `benchmarkMinOrganisaties` (of de uitzondering bij één Organisatie) een view, zoals voor een Lead.

## Gebouwd

Gebouwd op 13 oktober 2026. De berekeningen staan in `lib/visualisatie.ts` (met tests), de weergaven in
`components/visualisatie/`, de schakelaar is `WeergaveWissel`.

**Plekken**

- A en B: `MetingWeergaven` op de resultatenpagina van een Meting in beheer en voor de Lead
  (`/s/[code]/resultaten/[scanUitvoeringId]`). B op niveau 3 staat ook in de view van een scan (benchmark) en in
  "Positie in de Meting" op de resultatenpagina van één scan.
- C: De view van een benchmark binnen een organisatie (niveau 2) met de lezing Ontwikkeling over tijd bij twee Metingen.
- H: Dezelfde view met de lezing Naast elkaar bij twee Metingen (`naastElkaarUitAntwoorden`, `WeergaveNaastElkaar`). De matrix
  eronder heeft dan de kolom Hoogste. Een benchmark die van vóór de lezing is, volgt haar lezing uit de leden
  (`datamodel.md`, Benchmark, `lezing`).
- D: De view per organisatie (niveau 1) van de benchmark, ook voor een Lead.
- E: de matrix in de sectie van een benchmark op niveau 2 (kolommen met Metingen) en op niveau 1 (kolommen met organisaties,
  met het label van de Meting en het aantal scans onder de naam), alleen voor de Admin. Bij veel kolommen scrolt de matrix
  horizontaal met een vaste eerste kolom.
- G: de vierde knop "Antwoorden" in de schakelaar op de resultatenpagina van een Meting in beheer (`?weergave=antwoorden`),
  alleen voor een Admin en Consultant (`antwoordenToegestaan`), nooit voor een Lead en niet bij een samengestelde Meting
  (die heeft geen scans). `antwoordenPerVraag` (`lib/visualisatie.ts`), `WeergaveAntwoorden`.

**Afwijkingen en keuzes**

- De waarde van "Sorteer op spreiding" staat niet in de adresbalk.
- De kleuren van de stip zijn de drie klassekleuren (`--stat-red`, `--stat-amber`, `--stat-green`), zoals voorgesteld. De
  vijf scorekleuren van `stylesheet.md` zijn niet gebruikt (zie Open punten).
- De spreidingsgrenzen staan als constante (`SPREIDING_GRENZEN`, 0,55 en 0,8) en zijn nog niet instelbaar.
- Is een Lead voor een Meting een Lead met `benchmarkMinRespondenten` nog niet gehaald, dan staat de lijn van laagste tot
  hoogste score uit. Voor een Admin en een Consultant staat hij altijd aan.
- Zonder categorielaag (AI-volwassenheid) vervallen de groepslabels. Bij "Sorteer op spreiding" vervallen ze ook.
- Een Admin kan in B geen naam bij een stip zien (zie Open punten).
- G, kolomvolgorde: Alfabetisch op het laatste woord van de naam, daarna de hele naam. Een Respondent heeft één veld `naam`,
  dus "achternaam" is het laatste woord ("Jan de Vries" staat onder V).
- G, initialen: De eerste letter van het eerste en het laatste woord, of de eerste twee letters van één woord. Gelijke
  initialen krijgen een volgnummer ("JV", "JV2"). De volledige naam staat in de tooltip.
- G, een gearchiveerde vraag die niemand beantwoordde, heeft geen rij. Wie haar wel beantwoordde, ziet haar met de tekst van de
  content zoals die nu is (er is geen versiegeschiedenis van een vraagtekst).
- G, de kleur volgt de afgeronde waarde op één decimaal (2,45 wordt 2,5 en dus de kleur van 3).
- Elke Meting in de matrix telt even zwaar mee. Met twee kolommen wijkt elke cel precies 0,5 of meer af van het
  rijgemiddelde en krijgt dus een rand. De regel is zo bedoeld, maar bij twee Metingen is de markering daardoor weinig
  onderscheidend.

**Nog niet gebouwd**

- Export van deze weergaven naar PDF, CSV en InDesign.
- Meer dan twee Metingen in C en H zelf (Naast elkaar met vormen bij drie tot en met zes Metingen is er sinds 19 oktober 2026).
- Een kolom met het verschil binnen een groep per onderdeel in E (open, zie Volgorde van de kolommen).
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
| Daling | `--dal` (`#c2570c`) |
| Positielabel boven de groep | vulling `#e8f1fb`, tekst `#174473`, rand `#bcd3ee` |
| Positielabel onder de groep | vulling `#fdf2e3`, tekst `#8a4a00`, rand `#f2cf9b` |
| Spreiding, stip van een respondent | `#5d6a78` met 75% dekking |
| G, cel met een antwoord of score | `--score-1-cel` tot `--score-5-cel` met tekst `--score-N-cel-tekst` (voorstel van 15 oktober 2026, gebouwd met de volle `--score-1` tot `--score-5`) |
| G, lege cel | wit, rand `1px solid var(--border)` |

## Open punten

- Klassekleur met drie stappen (A, C, E) of de vijf scorekleuren van `stylesheet.md`. Het ontwerp gebruikt drie stappen omdat de weergave bij de classificatie hoort. Te bevestigen met Sander.
- De grenzen voor het spreidingslabel (0,55 en 0,8).
- Of de band en de kwartielen in D een eigen, hogere drempel krijgen dan `benchmarkMinOrganisaties`. Bij vijf leden in totaal bestaat de rest uit vier organisaties en zijn minimum en maximum dan vrij herleidbaar.
- Of een Admin in B de naam van een respondent bij een stip kan zien.
- Een extra uitsplitsing van B naar Rol, bijvoorbeeld management tegenover medewerkers. Zie `backlog.md`.
- Meer dan twee Metingen in C en H.
- H: Of de symbolen cirkel en ruit genoeg onderscheid geven.
- G: De volgorde van de kolommen (gebouwd op het laatste woord van de naam), sorteren of filteren op bouwblok, en een CSV-export van deze matrix naast de bestaande export per scan (`export-csv.md`).
- G: Of de initialen in de kolomkop genoeg zijn bij respondenten met dezelfde initialen.
- Export van deze weergaven naar PDF, CSV en InDesign.
