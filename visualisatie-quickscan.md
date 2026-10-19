# Coniche Scan: Visualisaties van de Quickscan Ziekenhuis

**Status.** Voorstel van 15 oktober 2026. Joost heeft de vijf weergaven als richting aangenomen. Gebouwd op 15 oktober 2026, met de keuzes onder Gebouwd. Dit bestand beschrijft wat getoond wordt en hoe het berekend wordt voor de Klantcontact Quickscan – Ziekenhuis (`content-ziekenhuis-quickscan.md`). Het vult `visualisatie-scores.md` aan en vervangt het niet: De weergaven daar rekenen met scores op de schaal van 1 tot 5, de Quickscan rekent met punten en percentages (`datamodel.md`, Scoreberekening). De precieze opmaak volgt `stylesheet.md`. Waar dit bestand daar iets aan toevoegt, staat dat onder Nieuwe stijlwaarden.

**Visueel referentieontwerp.** Het canvas "Quickscan Ziekenhuis – voorstellen voor visualisaties" (vijf borden, voorbeeldgegevens van een fictief ziekenhuis) is een ontwerpschets en geen code. Waar schets en tekst verschillen, geldt de tekst. Het canvas is privé en moet door Joost gedeeld worden voordat Sander het kan openen.

## Welke weergave waar

| Weergave | Vraag | Plek | Wie ziet het |
|---|---|---|---|
| 1. Per afdeling | Wat is mijn resultaat per afdeling? | Resultatenscherm (scherm 6), standaardweergave | Respondent, en de eigen scan in beheer |
| 2. Overzicht | Waar scoor ik hoog en laag, over alle afdelingen heen? | Zelfde scherm, tweede stand van een schakelaar | Respondent, en de eigen scan in beheer |
| 3. Gemiddelde en spreiding | Wat is het gemiddelde van de groep en zijn de respondenten het eens? | Resultatenpagina van een Meting | Admin, Consultant, Lead met vinkje |
| 4. Antwoorden per vraag | Wie antwoordde wat, per vraag? | Resultatenpagina van een Meting | Admin, Consultant, Lead met vinkje |
| 5. Benchmark | Waar zitten we boven of onder de groep? | De view per organisatie (`benchmark.md`, Niveau 1) | Admin, Lead met vinkje |

De volgorde is de volgorde van het verhaal: Eerst het eigen resultaat (1 en 2), dan de groep (3), dan de antwoorden achter de scores (4), dan de vergelijking met andere ziekenhuizen (5).

## Gedeelde regels

**Percentages.** Een bouwblok, afdeling of totaal toont punten, maximum en percentage, bijvoorbeeld "9/15 (60%)". Het percentage is afgerond op hele procenten, half-away-from-zero. Klasse en kleur volgen de afgeronde waarde. Berekening en weging: `datamodel.md`, Scoreberekening.

**Klassekleuren.** Goed op orde (vanaf 80%) is `--stat-green`, Gemiddeld inzicht (50 tot en met 79%) is `--stat-amber` en Ontwikkelruimte (onder 50%) is `--stat-red`. Voor de totaalscore gelden de namen Sterk ontwikkeld, Gemiddeld ontwikkeld en Aanzienlijke ontwikkelruimte, in dezelfde kleuren (`CLAUDE.md`, sectie 1). Deze weergaven gebruiken dus de drie klassekleuren en niet de vijf scorekleuren.

**Antwoordkleuren.** Ja is `--stat-green`, Nee is `--stat-red` en Weet ik niet is grijs (`#d4d1ca`). Weet ik niet telt als Nee voor de score, maar staat nooit in de kleur van Nee.

**Schaal.** Waar een percentage op een as staat, loopt die van 0 tot 100%, met hulplijnen of banden op 50% en 80%.

**Bouwblok met afdeling.** Een bouwblok heet in lijsten waar de afdeling niet uit de kop blijkt "Afdeling · Dimensie", bijvoorbeeld "Verpleegafdelingen · Mensen" (`content-ziekenhuis-quickscan.md`, open punt 3).

**Niet van toepassing.** Een afdeling die de respondent niet relevant vond, krijgt een grijze kaart of rij met de naam doorgestreept en de tekst "Niet van toepassing". Ze heeft geen score en doet nergens mee in vergelijkingen of gemiddelden.

**Weging.** Heeft een bouwblok een gewicht ongelijk aan 1, dan staat de factor ("2×") achter de naam. De bouwblokscore blijft ongewogen, afdelingsscore en totaal zijn gewogen.

**Kleur nooit alleen.** Elke bol, balk en cel heeft een getal of label erbij.

**Balken.** Alle balken in de weergaven volgen `stylesheet.md`, Balklijst. Een rij heeft een label, een spoor en een waarde in kolommen met een vaste breedte, en het spoor is in elke rij even lang. Een aanvulling als "1 vraag" of "2 vragen" heeft een eigen kolom. De balken in een lijst zijn even hoog: 12px in de lijsten met afdelingen en bouwblokken en 16px in de gestapelde balk bij Antwoorden. Een lang label ("Verpleegafdelingen · Mensen") wordt afgekapt, met de volledige naam in een tooltip, en maakt het spoor niet korter.

**Alleen desktop**, zoals de rest van de app.

## 1. Per afdeling

**Plek.** Het resultatenscherm van de Respondent (`CLAUDE.md`, scherm 6) en dezelfde weergave voor een scan in beheer. Dit is de opbouw die al in `content-ziekenhuis-quickscan.md`, Resultaten, staat: Totaalkaart, een kaart per afdeling, Sterkste afdeling en Meeste ontwikkelruimte, en de legenda. Hier staat alleen wat het canvas daaraan toevoegt.

**Aanscherpingen.**

- De totaalkaart noemt de afdelingen die niet meetellen bij naam ("Vragen over Patiëntenservice zijn niet beantwoord. De afdeling telt niet mee in het totaal").
- De ring in de totaalkaart is de `.score-ring` van `stylesheet.md` (Resultaten): Een boog die voor `percentage / 100` gevuld is, in de klassekleur van het totaal, met het percentage in de ring en de klassenaam als chip eronder. Ze is dezelfde als op Mijn metingen (besloten op 19 oktober 2026).
- De kaart "Niet van toepassing" zegt dat de antwoorden bewaard blijven als de respondent de keuze later wijzigt.
- De legenda toont per klasse de grens in procenten en de punten per afdeling (12 tot en met 15, 8 tot en met 11, 0 tot en met 7 van 15).
- De chips "Grootste aandachtspunt" en "Relatief sterkste basis" staan onder elkaar, rood en groen omrand, met de `aandachtZin` erboven.

## 2. Overzicht

**Plek.** Hetzelfde scherm als weergave 1, als tweede stand van een schakelaar (`stylesheet.md`, Weergave-schakelaar, een pilvormige groep) met de pillen Per afdeling en Overzicht. Per afdeling is de standaard. De keuze staat in de adresbalk (`?weergave=overzicht`). Dit wijkt af van `visualisatie-scores.md`, Navigatie, waar de respondent op scherm 6 geen schakelaar ziet: Voor de Quickscan is de schakelaar er wel, omdat beide standen het eigen resultaat tonen.

**Opbouw.** Drie kaarten onder elkaar.

1. **Afdelingen op één schaal.** Een rij per afdeling met een balk van 0 tot 100%. De achtergrond heeft drie banden (onder 50%, 50 tot 80%, vanaf 80%) in de lichte klassekleuren, met de klassenamen erboven. Een bol in de klassekleur staat op het percentage van de afdeling. Een gestreepte verticale lijn staat op het totaal. Rechts staat "60% · 9/15". Een afdeling die niet van toepassing is, krijgt een grijze rij zonder bol.
2. **Afdeling × dimensie.** Een matrix met de afdelingen als rijen en de kolommen Organisatie, Processen en techniek, Mensen en Afdeling. Elke cel is gevuld in de klasse, met het percentage groot en "x/y" klein. De kolom Afdeling heeft een rand van 2px in de tekstkleur van de klasse. Een dimensie die een afdeling niet heeft (Receptie / Centrale en Patiëntenservice hebben geen Mensen) is een gearceerde cel met "Geen dimensie". Een afdeling die niet van toepassing is, heeft één grijze cel over vier kolommen.
3. **Alle bouwblokken, van laag naar hoog.** Een balk per bouwblok in de klassekleur, met "Afdeling · Dimensie", "x/y" en het percentage. Bij een bouwblok met één of twee vragen staat daarachter "1 vraag" of "2 vragen". Gesorteerd op de exacte verhouding, bij gelijkspel in de volgorde van het model. Dit vervangt de top 3, die voor de Quickscan vervalt (`content-ziekenhuis-quickscan.md`, open punt 2).

**Bouwblokken met weinig vragen.** Ze staan in de matrix en de lijst, maar tellen niet mee voor "Relatief sterkste basis" (minstens 3 vragen), in lijn met de chipregels.

## 3. Gemiddelde en spreiding

**Plek.** De resultatenpagina van een Meting, als knop "Gemiddelde en spreiding" in de bestaande schakelaar (`visualisatie-scores.md`, Navigatie). Voor een Meting van de Quickscan vervangen deze weergave en Antwoorden de knoppen Per bouwblok en Spreiding. Overzicht blijft de huidige pagina van de Meting, met in elke kaart het gemiddelde van de Meting in plaats van de score van één scan. Voor Admin, Consultant en een Lead met het vinkje Spreiding (`beheerpagina.md`, punt 6a).

**Data.** Per afdeling tellen alleen de afgeronde scans waarin de afdeling relevant is. Per scan en bouwblok is de score het aantal Ja gedeeld door het aantal vragen. Het gemiddelde van een bouwblok is het gemiddelde van die scores over de relevante scans. Het gemiddelde van een afdeling komt op dezelfde manier uit de afdelingsscores (punten gedeeld door 15). Het totaal van de Meting is alle punten van alle relevante afdelingen gedeeld door alle mogelijke punten (open punt 2).

**Tegels.** Afgeronde scans (met het aantal uitgenodigden) en Totaal van de Meting met de klasse. Sterkste afdeling en Meeste ontwikkelruimte zijn geen tegels meer (voorstel van 19 oktober 2026, gebouwd op 19 oktober 2026): Ze staan als twee kolommen met rijen, zoals Top 3 bij de andere scans (`content-ziekenhuis-quickscan.md`, Resultaten, punt 3), elk met het gemiddelde, onder de afdelingskaarten. De Resultaatkop (`stylesheet.md`) staat bovenaan met het gemiddelde van de Meting in de ring.

**Opbouw per afdeling.** Een kaart met de naam, "Relevant voor x van y respondenten", het gemiddelde van de afdeling en de klasse. Bij een afdeling die voor een deel van de respondenten niet van toepassing is, staat erbij hoeveel dat er zijn. Daaronder een rij per dimensie met:

- Een balk van 0 tot 100% met de drie banden, zoals in weergave 2.
- Per voorkomende score een bol met het aantal respondenten erin. Eén respondent is een kleine stip zonder getal. De bollen zijn grijs (`rgba(93, 106, 120, .82)`), zonder naam en zonder tooltip.
- Een verticale streep van 2px in `--ink-m` op het gemiddelde.
- Rechts het gemiddelde als percentage en het spreidingslabel.

**Ruimte en lagen** (voorstel van 19 oktober 2026, gebouwd op 19 oktober 2026, na een schermafbeelding van de gebouwde weergave). Op de gebouwde kaart staan de kolommen te krap: Labels breken af over twee regels, het label "Te weinig antwoorden" steekt buiten de kaart en de bollen en de streep op het gemiddelde lopen door elkaar. De regels hieronder maken de kaart ruim genoeg, voor elke afdeling en elke Meting.

- **Kolommen.** Elke rij heeft vier kolommen met een vaste breedte, naast een spoor dat de rest van de ruimte krijgt: Label 280px, spoor (minimaal 360px), gemiddelde 64px en spreidingslabel 176px, met 24px tussen de kolommen. De kaart heeft 24px padding aan alle kanten, en niets in de rij steekt buiten die padding. De kolomkoppen (de drie klassen boven het spoor, "Gemiddelde" boven de waarde) staan in dezelfde kolommen en op één regel.
- **Label op één regel.** De naam van de dimensie staat in `--fs-14` en het aantal vragen erachter in `--fs-12`, in `--ink-s` ("Processen en techniek · 10 vragen"), met `white-space: nowrap`. Past het niet, dan wordt het afgekapt met een tooltip met de volledige naam, zoals bij Balken. Bij een bouwblok met minder dan 3 vragen staat het aantal alleen in het spreidingslabel en niet ook achter de naam, zodat "1 vraag" niet twee keer staat.
- **Labels op één regel.** Het gemiddelde ("63%") en het spreidingslabel (Eensgezind, Wisselend, Verdeeld, "Te weinig antwoorden", "1 vraag" en "2 vragen") hebben `white-space: nowrap`. Het gemiddelde staat rechts uitgelijnd in `--fs-16`, gewicht 700, en het label links uitgelijnd in zijn kolom.
- **Rijhoogte.** Elke rij is minstens 48px hoog, met het spoor (12px) in het midden, zodat een bol van 24px 12px lucht boven en onder heeft en bollen van naastgelegen rijen elkaar niet raken. Tussen twee rijen staat geen lijn.
- **Lagen in het spoor.** Van onder naar boven: de drie banden, de stippellijnen op 50% en 80%, de streep op het gemiddelde en de bollen. De stippellijnen lopen alleen over de hoogte van het spoor. De streep is 32px hoog, gecentreerd op het spoor, en staat achter de bollen, zodat een bol de streep afdekt en de streep er boven en onder uitsteekt. Zo is altijd te zien waar het gemiddelde ligt, ook onder een bol.
- **Bollen aan de rand.** Een bol op 0% of op 100% blijft helemaal binnen het spoor: Het midden van de bol staat minstens op de halve breedte van de bol (12px, of 7px bij één respondent) van de rand. De bol kan dus niet worden afgekapt. De streep op het gemiddelde blijft eveneens minstens 1px van de rand.
- **Zo gebouwd.** `DimensieRij` in `components/quickscan/QuickscanGemiddeldeSpreiding.tsx` en `.qv-rij--spreiding` in `app/styles/visualisatie.css`: Kolommen van 280, minstens 360, 64 en 176 px met 24 px ertussen, rijen van 48 px (gemeten in de browser), spoor van 12 px, een streep van 32 px (`z-index` 1) achter de bollen (`z-index` 2), en bollen en streep die met `clamp()` binnen het spoor blijven. Bij minder dan 3 vragen staat het aantal alleen in het spreidingslabel. Op een kaart smaller dan ongeveer 1000 px scrolt de kaart horizontaal, omdat het spoor minstens 360 px krijgt. De namen van de banden boven het spoor passen pas bij een spoor van ongeveer 450 px of meer.
- **Bollen die overlappen.** Bollen met bijna dezelfde score (minder dan 24px uit elkaar) liggen over elkaar. Het getal in de bol staat dan op de bovenste. Is het onderscheid gering, dan is de totale spreiding ook gering en zegt het label Eensgezind het al.

**Spreidingslabel.** Op basis van de standaardafwijking (steekproef, n − 1) van de percentages in de relevante scans, in procentpunten. Voorstel: Onder 14 is Eensgezind, van 14 tot 20 is Wisselend en vanaf 20 is Verdeeld. Dit zijn de grenzen van `visualisatie-scores.md` (0,55 en 0,8 op een schaal van vier) omgerekend. Verdeeld is het enige label met een volle vulling. Een bouwblok met minder dan 3 vragen krijgt geen label maar "1 vraag" of "2 vragen" (gestreepte rand), omdat de uitkomsten dan te grof zijn. Bij minder dan 3 relevante scans voor de afdeling staat er "Te weinig antwoorden".

**Sortering.** Standaard in de volgorde van het model. De schakelaar "Sorteer op spreiding" uit `visualisatie-scores.md` werkt ook hier.

**Privacy.** Geldt `benchmarkMinRespondenten` (`benchmark.md`, Niveau 3). Een Lead ziet een afdeling pas als er minstens zoveel relevante scans zijn, anders staat er "Te weinig antwoorden". De bollen zijn voor niemand aanklikbaar.

## 4. Antwoorden per vraag

**Plek.** De weergave Antwoorden op de resultatenpagina van een Meting (`visualisatie-scores.md`, onderdeel G), voor Admin, Consultant en een Lead met het vinkje Antwoorden. Bij de Quickscan heeft die weergave twee standen in een kleine pilvormige groep: Verdeling (standaard, hieronder) en Per respondent. Per respondent is onderdeel G met kolommen per scan, waarbij een cel J (groen), N (rood) of ? (grijs) toont in plaats van een cijfer 1 tot 5. Privacyregels, namen en initialen zijn die van G.

**Opbouw van Verdeling.**

- Boven de kaart een keuze van de afdeling, als losse keuzepillen (`stylesheet.md`, Keuzepil en pilvormige groep), omdat de afdelingen uit de content komen en hun aantal en lengte wisselen. De gekozen pil is massief oranje, de andere zijn wit met grijze rand. Tussen de pillen staat 8px en tot de tegels eronder 24px. Een afdeling zonder relevante scans is uitgeschakeld.
- Tegels: Respondenten (die de afdeling relevant vonden), Alle antwoorden (Ja, Nee en Weet niet als percentages, met een gestapelde balk), Minst vaak Ja (bouwblok, vraagnummer en aantal) en Vaakst Weet ik niet.
- Een legenda met Ja, Nee en Weet ik niet, en de opmerking dat de getallen in de balken aantallen respondenten zijn.
- Per dimensie een kopregel (naam, aantal vragen, gemiddeld percentage) en daaronder een rij per vraag.
- Een vraagrij heeft het vraagnummer, de volledige vraagtekst zoals de respondent die zag, een gestapelde balk en rechts "x% Ja". De balk is Ja, Nee en Weet ik niet naast elkaar, elk met het aantal erin en met een breedte naar verhouding. Een antwoord dat niemand gaf, ontbreekt. De kleur van "x% Ja" volgt de klasse van het afgeronde percentage.
- Heeft minstens 40% van de respondenten (en minstens drie) Weet ik niet gekozen, dan staat onder de vraagtekst een label "Onbekend bij x van y". Dat is een signaal dat de afdeling het niet weet, en iets anders dan Nee.

**Volgorde.** Vragen en dimensies staan in de volgorde van de content. De volgorde is niet instelbaar in deze eerste versie.

**Privacy.** Een verdeling bevat geen namen. Voor een Lead geldt dezelfde ondergrens als bij Per respondent: Bij anonieme namen is de weergave pas aan te vinken vanaf `benchmarkMinRespondenten` afgeronde scans in de Meting.

## 5. Benchmark

**Plek.** De view per organisatie (`benchmark.md`, Niveau 1, View per organisatie), voor een Admin en voor een Lead met het vinkje. Het is weergave D uit `visualisatie-scores.md`, in percentages en zonder klassebanden. Radar en staafdiagram per categorie bestaan voor de Quickscan niet, dus deze weergave is de enige plek voor de vergelijking.

**Data.** Per rij het percentage van de organisatie X en de percentages van de overige leden van de benchmark (zonder X, per Assessment, elk lid even zwaar). Daaruit het groepsgemiddelde, minimum, maximum en het eerste en derde kwartiel (lineair geïnterpoleerd, zoals `KWARTIEL.INC` in Excel). De rijen zijn Totaal, de vier afdelingen, en daaronder per afdeling de dimensies. Een lid dat een afdeling niet van toepassing vond, doet voor die afdeling en haar dimensies niet mee in de groep.

**Opbouw.** Per rij:

- Een lichte band van het minimum tot het maximum van de groep.
- Een donkerder band van het eerste tot het derde kwartiel.
- Een blauwe streep op het groepsgemiddelde.
- Een oranje bol met witte rand op het percentage van X.
- Rechts het percentage van X, het verschil met het groepsgemiddelde in procentpunten (getoonde waarde min getoonde waarde, met teken) en het positielabel.

**Positielabel.** Zoals bij D: Bovenste kwart als X boven het derde kwartiel ligt, Onderste kwart als X onder het eerste kwartiel ligt, anders Middenmoot. Bovenste kwart in blauw, Onderste kwart in oranje, Middenmoot zonder kleur.

**Schaal.** Van 0 tot 100%, met dunne hulplijnen op 50% en 80% en geen klassebanden, omdat de weergave de positie ten opzichte van de groep toont en niet de klasse.

**Tegels.** Grootte van de vergelijkgroep (X inbegrepen), aantal bouwblokken boven het groepsgemiddelde (van het aantal bouwblokken waarvoor X een score heeft), aantal in het bovenste kwart en aantal in het onderste kwart.

**Niet van toepassing en kleine groepen.** Vond X een afdeling niet van toepassing, dan is de rij grijs en zonder vergelijking. Is de groep voor een rij kleiner dan `benchmarkMinOrganisaties`, dan staat er "Te weinig ziekenhuizen" en geen band.

**Onderschrift.** "Vergelijkgroep van n ziekenhuizen, samengesteld door Coniche" en de peildatum, onder de weergave. De view toont nooit namen van andere organisaties.

**Privacy.** Het minimum en het maximum zijn de score van één organisatie, ook zonder naam. Zie `visualisatie-scores.md`, Open punten, over een eigen drempel voor band en kwartielen.

## Weergaven die in de schets ontbreken

De weergaven C (ontwikkeling tussen Metingen), E (matrix) en H (Metingen naast elkaar) uit `visualisatie-scores.md` gelden ook voor de Quickscan, in percentages en met de klassekleuren van dit bestand. De rijen zijn dan de dimensies, gegroepeerd per afdeling, met een rij Totaal. Er is geen eigen schets voor gemaakt.

## Nieuwe stijlwaarden

Voorstel, op te nemen in `stylesheet.md` zodra ze zijn bevestigd:

| Gebruik | Waarde |
|---|---|
| Klassekleur, Goed op orde | `--stat-green`, vulling `#e7f6ef`, tekst `#0e4d30`, rand `#c3e6d2` |
| Klassekleur, Gemiddeld inzicht | `--stat-amber`, vulling `#fdf2e3`, tekst `#6b3a00`, rand `#f2cf9b` |
| Klassekleur, Ontwikkelruimte | `--stat-red`, vulling `#fdecec`, tekst `#7f1d1d`, rand `#f7c6c1` |
| Matrixcel | `#c3e6d2`, `#fde9c8`, `#f7c6c1` (zelfde tekstkleuren als hierboven) |
| Matrixcel zonder dimensie of n.v.t. | Gearceerd `#faf9f7` en `#f2f0eb`, rand `1px dashed #d4d1ca` |
| Weet ik niet | `#d4d1ca`, tekst `--ink` |
| Bol in Gemiddelde en spreiding | `rgba(93, 106, 120, .82)`, witte rand, 24px (14px bij één respondent) |
| Benchmark, band minimum tot maximum | `#ebf1fb` |
| Benchmark, band eerste tot derde kwartiel | `#b9cde8` |
| Benchmark, groepsgemiddelde | `#225ba0` |
| Benchmark, bol van X | `--or` met witte rand |
| Positielabel | Zoals in `visualisatie-scores.md`, Nieuwe stijlwaarden |

## Open punten

- De grenzen van het spreidingslabel in procentpunten (14 en 20), en of de ondergrens van 3 vragen voor het label klopt.
- Het totaal van een Meting met afdelingen die niet voor iedereen relevant zijn: Alle punten gedeeld door alle mogelijke punten (hier gekozen) of het gemiddelde van de totalen per scan. Hetzelfde geldt voor de benchmark. Zie ook `backlog.md`, Quickscan Ziekenhuis, gemiddelde en benchmark met n.v.t. afdelingen.
- Of de respondent op scherm 6 de schakelaar tussen Per afdeling en Overzicht krijgt (hier voorgesteld), of dat Overzicht alleen in beheer staat.
- De drempel "Onbekend bij x van y" (40% en minstens drie).
- Of de stand Per respondent in Antwoorden nodig is, naast het archiefexport per scan (`backlog.md`).
- Of een Admin in Gemiddelde en spreiding een naam bij een bol kan zien (open punt in `visualisatie-scores.md`).
- Het minimum en maximum in de benchmark van één organisatie (zie D).
- Export van deze weergaven naar PDF, CSV en InDesign (PDF-spec volgt later).

## Gebouwd

Gebouwd op 15 oktober 2026. De berekeningen staan in `lib/quickscan-groep.ts` (met tests in `lib/quickscan-groep.test.ts`), de
weergaven in `components/quickscan/` en `components/QuickscanResultaten.tsx`.

**Plekken**

- 1 en 2: `QuickscanResultaten` met de schakelaar Per afdeling en Overzicht (`?weergave=overzicht`), op het resultaatscherm van de
  respondent, de voorbeeld-output en de scan in beheer. "Positie in de Meting" (weergave B op niveau 3) is er voor dit type niet.
- 3 en 4: `MetingWeergaven` op de resultatenpagina van een Meting, in beheer en voor een Lead. De schakelaar heeft Overzicht
  (het gemiddelde van de Meting in dezelfde kaarten), "Gemiddelde en spreiding" en Antwoorden. Per bouwblok vervalt. De knop
  Spreiding in het Leads-venster opent weergave 3.
- 5: De view per organisatie van een benchmark tussen organisaties (`BenchmarkOrganisatieView`), voor een Admin en een Lead. In
  de lijst van de benchmark staat per organisatie het totaal met de klasse.

**Keuzes waar de spec open liet** (de open punten hierboven, met de gebouwde waarde)

- De grenzen van het spreidingslabel staan als constante: 14 en 20 procentpunten, minstens 3 vragen en minstens 3 relevante scans
  (`QS_SPREIDING_GRENZEN`).
- Het totaal van een Meting is alle punten gedeeld door alle mogelijke punten van de relevante afdelingen, over alle scans. In de
  kaart van de Meting staat bij het totaal geen aantal punten, omdat het maximum per scan verschilt als een afdeling niet
  voor iedereen relevant is. Hetzelfde geldt voor de benchmark: Elk lid telt even zwaar met zijn totaal.
- De respondent krijgt op scherm 6 de schakelaar Per afdeling en Overzicht.
- "Onbekend bij x van y" staat vanaf 40% Weet ik niet en minstens drie respondenten (`QS_ONBEKEND_AANDEEL`, `QS_ONBEKEND_MIN`).
- De stand Per respondent bij Antwoorden is gebouwd: Cellen J, N of ? met de namen en initialen van weergave G, voor een Lead
  zonder namen R1 tot en met Rn.
- Een Admin ziet in Gemiddelde en spreiding geen naam bij een bol (geen tooltip, niet aanklikbaar).
- Het minimum en het maximum in de benchmark staan er zoals in de spec. Het risico dat één organisatie herleidbaar is, geldt
  zoals bij weergave D (`visualisatie-scores.md`, Open punten).
- Bij gelijkstand tonen de tegels "Minst vaak Ja" en "Vaakst Weet ik niet" de eerste vraag in de volgorde van het model.
- De groep voor een rij in de benchmark telt alleen de leden met een afgeronde scan. Is de groep (X inbegrepen) kleiner dan
  `benchmarkMinOrganisaties`, dan staat bij die rij "Te weinig ziekenhuizen" en geen band.

**Nog niet gebouwd**

- De weergaven C, E en H voor dit type (vergelijking tussen Metingen in percentages) en de samengestelde Meting.
- De benchmark binnen een organisatie en binnen een Meting voor dit type.
- Export van deze weergaven naar PDF, CSV en InDesign.
