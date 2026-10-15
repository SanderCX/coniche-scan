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

## Gedeelde regels

Deze regels gelden voor alle weergaven. G wijkt af in de kleuren en heeft geen banden, zie daar.

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
- Een lijn ertussen: blauw (`--bl`) bij een stijging, donkeroranje bij een daling, grijs bij geen verandering.
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

**Data.** Per bouwblok het gemiddelde van elke gekozen Meting. Elke Meting telt even zwaar mee, ongeacht het aantal respondenten.

**Opbouw.** Rijen zijn bouwblokken, kolommen zijn de Metingen met hun label en het aantal afgeronde scans eronder. Elke cel is gevuld naar de klasse, met het getal erin. Rechts staan het gemiddelde van de rij en het bereik (laagste tot hoogste). Onderaan staat een rij Totaalscore, gekleurd op dezelfde manier. Op niveau 2 vervallen het gemiddelde van de rij, het bereik en de zwarte rand, want er is geen groep om van af te wijken. In plaats daarvan komt er bij twee Metingen een kolom Verschil (zie Volgorde van de kolommen). Op niveau 1 krijgt een cel die 0,5 of meer afwijkt van het gemiddelde van de rij een zwarte rand van 2px.

**Tegels.** Hoogste Meting en laagste Meting (totaalscore en label), bouwblok met het grootste verschil tussen Metingen, aantal cellen met een zwarte rand.

**Niveau 1, kolommen met organisaties.** Besloten op 13 oktober 2026, gebouwd op 13 oktober 2026. De opbouw, de kleuren, de zwarte rand, de rij Totaalscore en de tegels zijn gelijk aan niveau 2. Wat anders is:

- De kolomkop is de organisatienaam, met daaronder het label van de Meting en het aantal afgeronde scans. Op niveau 2 is de kop het label van de Meting.
- De tegels heten Hoogste organisatie en Laagste organisatie, met de totaalscore en de organisatienaam.
- Organisaties zonder lid bij dit Assessment hebben geen kolom.
- De matrix is alleen voor de Admin. De privacyregel van D geldt voor een Lead en verandert daar niets aan, omdat een Lead de matrix niet ziet.
- Een Lead met een aangevinkte benchmark krijgt nooit de kolommen van andere organisaties, ook niet anoniem.

**Samengestelde Meting (gebouwd op 13 oktober 2026).** De matrix onder een samengestelde Meting (`benchmark.md`, Onderdeel en samengestelde Meting) heeft de onderliggende Metingen als kolommen. Alleen voor de Admin, om dezelfde reden als op niveau 2.

**Volgorde van de kolommen (gebouwd op 14 oktober 2026, ter vervanging van de groepering per onderdeel, met de kolom Verschil bij Ontwikkeling over tijd en de kolom Hoogste bij Naast elkaar).** De kolommen staan op meetdatum, de oudste links. De kolomkop toont de naam van de Meting en haar meetdatum. Bij precies twee Metingen komt er rechts een kolom bij, afhankelijk van de lezing. Bij Ontwikkeling over tijd is dat Verschil, de nieuwere min de oudere, met dezelfde opbouw als weergave C. Bij Naast elkaar staan de kolommen op de naam van de Meting in plaats van op meetdatum, en is de extra kolom Hoogste, met het symbool of de naam van de Meting die op die rij hoger scoort en "Gelijk" bij gelijke getoonde waarden. Bij meer dan twee Metingen is er nog geen extra kolom.

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

**Kleur.** Elke cel krijgt de scorekleur van de afgeronde waarde, met de vijf stappen van `stylesheet.md`: 1 `--score-1` (rood) tot 5 `--score-5` (donkergroen). Afronden gaat half-away-from-zero, dus 2,5 krijgt de kleur van 3. Tekst is wit op 1 en 5 en donker op 2, 3 en 4. Dit wijkt af van de PDF, waar de tekst op oranje wit is, omdat wit op `--score-2` een te laag contrast geeft. Een lege cel is wit met een rand van 1px (`--border`). Deze weergave gebruikt dus de vijf scorekleuren en niet de drie klassekleuren van A tot en met E, omdat hier losse antwoorden staan en geen gemiddelden over een groep.

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
- Meer dan twee Metingen in C en H.
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
| Daling | `#c2570c` (nieuw) |
| Positielabel boven de groep | vulling `#e8f1fb`, tekst `#174473`, rand `#bcd3ee` |
| Positielabel onder de groep | vulling `#fdf2e3`, tekst `#8a4a00`, rand `#f2cf9b` |
| Spreiding, stip van een respondent | `#5d6a78` met 75% dekking |
| G, cel met een antwoord of score | `--score-1` tot `--score-5`, tekst wit op 1 en 5, `--ink` op 2 tot en met 4 (gebouwd) |
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
