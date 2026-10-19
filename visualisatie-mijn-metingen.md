# Coniche Scan: Mijn metingen

Spec voor de landingspagina "Mijn metingen", die een Respondent, een Lead of iemand met beide rollen ziet na het openen van de persoonlijke link.

**Status: Voorstel van 15 oktober 2026, gebouwd op 15 oktober 2026.** Er is een visual design (Claude Design, "Coniche Scan Mijn metingen", versie 11) met drie borden: Respondent, Lead en respondent, en Lead. Het ontwerp is door Joost goedgekeurd als richting ("veel mooier"). De bouw staat onder Gebouwd. Dit document vervangt de opmaak van de bestaande lijst in `CLAUDE.md` (schermflow punt 4) en de beschrijving van de kaarten in `beheerpagina.md` (punt 6a). Wat daar over routing en rechten staat, blijft gelden.

## Doel

De pagina beantwoordt drie vragen, in deze volgorde: Wat moet ik nog doen, wat heb ik al gedaan, en wat zie ik van de hele meting als ik Lead ben. Een afgeronde scan toont daarom meteen een korte teaser van de uitkomst, zodat de respondent niet eerst hoeft door te klikken om te zien dat het de moeite waard was.

## Opbouw

Van boven naar beneden:

1. **Kop.** Boven de titel het label "Mijn metingen" (12 px, hoofdletters, `--or`). Daaronder "Welkom terug, <voornaam>" als h1 van 48 px. Heeft de gebruiker geen voornaam, dan staat er "Welkom terug". Daaronder de naam van de Organisatie met een gebouwicon, en de introtekst uit `mijnMetingenIntro` (`datamodel.md`, Algemene teksten). De introtekst is beheerbaar en staat niet vast in de code. Het ontwerp toont per rol een andere tekst, dat is voorbeeldtekst.
2. **Secties.** Welke secties er zijn hangt af van de rol (zie Varianten). Elke sectie heeft een label in `.lbl`-stijl met het aantal erachter: "Nog te doen, 2".
3. **Kaarten** in een raster. Twee kaarten naast elkaar vanaf 1120 px breedte, daaronder onder elkaar. Een kaart met een teaser mag de volle breedte nemen.

De vier vaste content-links blijven in de header staan, zoals in `CLAUDE.md` beschreven. Op deze pagina is er geen terugknop.

## Varianten

### Respondent

- **Nog te doen.** Kaarten met status Uitgenodigd of Bezig, op uitnodigingsdatum, de oudste bovenaan (wie het langst wacht, staat bovenaan).
- **Afgerond.** Kaarten met status Afgerond, op afrondingsdatum, de nieuwste bovenaan. Deze kaarten zijn volle breedte en hebben een teaser.
- Heeft de respondent maar één scan, dan is er maar één sectie.

### Lead (geen respondent)

- **Metingen.** Eén kaart per Meting waarvoor de Admin minstens één weergave heeft aangevinkt (`beheerpagina.md`, punt 6a), op meetdatum, de nieuwste bovenaan.
- **Vergelijkingen.** Een kaart per benchmark die aan staat. Zie Benchmarkkaart.
- Een Lead zonder Metingen maar met een benchmark ziet alleen de sectie Vergelijkingen.

### Lead en respondent

Dezelfde secties als een Lead. Valt een eigen scan samen met een Meting op zijn pagina, dan is het één kaart met twee blokken (zie Kaart Lead en respondent). Eigen scans zonder bijbehorende Meting op de pagina staan als gewone respondentkaarten in de sectie Nog te doen of Afgerond, boven de sectie Metingen.

### Lege staat

"Er staat nog niets voor je klaar. Neem contact op met Coniche als je dit niet verwacht." Alleen deze melding, zonder illustratie.

## Kaart: Algemene opbouw

Elke kaart (`.k`) heeft wit vlak, rand `--border`, hoekstraal 10 px, padding 24 px en 24 px tussenruimte tussen de onderdelen.

**Kop van de kaart**, van links naar rechts:

- **Assessment-icoon.** Rond vlak van 48 px in `--or-faint`, icoon in `--or`, zoals in `stylesheet.md` (Assessment-icoon). Het icoon komt uit `Assessment.icoon` via `ASSESSMENT_ICONS`, dezelfde bestanden als op de openbare pagina (`afbeeldingen/assessment-icoon-*.svg`). Is er geen icoon ingesteld, dan het standaardicoon.
- **Titel** (18 px, vet) en daaronder een regel van 14 px in `--ink-s`. Die regel is "Meting <maand jaar>" (de meetdatum). Bij een afgeronde scan staat er achter: ", afgerond op <datum>". Een samengestelde Meting toont dezelfde regel.
- **Rechts** een statuschip (zie Statussen) of, bij Lead, een rolchip.

**Rolchips.** Heeft de gebruiker beide rollen in dezelfde Meting, dan staan er twee grijze chips "Respondent" en "Lead" rechtsboven (24 px hoog, hoekstraal 4 px, `--bg-mid`). Heeft hij maar één rol op de pagina, dan is de chip er alleen op de Lead-kaarten ("Lead"), en niet op respondentkaarten.

## Statussen

Chips zijn pillen van 24 px met een bolletje en kleine vette tekst.

| Status | Chip | Kleur | Hoofdactie |
|---|---|---|---|
| `uitgenodigd` | Uitgenodigd | blauw (`#ebf1fb` / `#1b4a85`) | "Start de scan" |
| `bezig` | Bezig | amber (`#fdf2e3` / `#6b3a00`) | "Ga verder" |
| `afgerond` | Afgerond | groen (`#e7f6ef` / `#0e4d30`) | "Bekijk jouw resultaten" |

De knopnamen zijn gewijzigd ten opzichte van `beheerpagina.md` punt 6a ("Start de intake", "Ga verder met de scan"). Het design geeft de voorkeur aan de korte namen omdat de knoppen smaller kunnen. De routing is ongewijzigd: Uitgenodigd gaat naar de intake, Bezig naar de doorloopflow op de plek waar de respondent bleef, Afgerond naar de resultaten van die `ScanInvulling`.

### Inhoud per status

- **Uitgenodigd.** Een zin: "Je bent op <datum uitgenodigd> uitgenodigd voor deze scan. Je antwoorden worden tussentijds bewaard, dus je kunt later verder." De datum komt uit `ScanInvulling.uitgenodigdOp`.
- **Bezig.** Een voortgangsregel "<n> van <totaal> vragen" in vet, rechts "Laatst opgeslagen <relatief>" in `--ink-s`, en daaronder een balk van 8 px in `--or` op `--bg-mid`. Het aantal is het aantal beantwoorde vragen. Het totaal is het aantal vragen van het Assessment. "Laatst opgeslagen" staat in dagen ("vandaag", "gisteren", "3 dagen geleden") en daarna als datum. Zie Open punten voor het veld daarvoor.
- **Afgerond.** De teaser (zie hieronder) en de knop.

## Teaser van een afgeronde scan

De teaser is een samenvatting en geen tweede resultatenpagina. Hij toont alleen wat in één oogopslag te lezen is. Details, spreiding en antwoorden staan op de resultatenpagina.

### Volwassenheidsscan (en andere Assessments met categorieën)

- Links "Jouw overall score" (label), het getal in 48 px vet (bijvoorbeeld "3,4"), met daarnaast een klassenpil van 32 px in de celkleur van de klasse (bijvoorbeeld "Uitbouwen" in `#fbf0b8` met tekst `#5c4800`). Kleuren en klassenamen komen uit de bestaande scorevisualisatie (`visualisatie-scores.md`), niet uit deze spec.
- Rechts vijf rijen, één per categorie, in de vaste volgorde Overkoepelend, Organisatie, Proces & Tech, Mens, Fundament. Elke rij heeft naam, een spoor en rechts het gemiddelde met één decimaal. Naam en getal hebben in het blok Jouw scan en het blok Hele meting dezelfde breedte, zodat de sporen op één lijn staan. Alle sporen en balken zijn even lang en even hoog, volgens `stylesheet.md`, Balklijst.
- **Schaal.** Het spoor is een schaal van 1 tot 5, zoals overal in de scorevisualisaties (`visualisatie-scores.md`, Gedeelde regels). Een gemiddelde van 3,4 staat dus op 60% van het spoor. (Eerder stond hier 68%, want een schaal van 0 tot 5. Dat is vervallen.) Onder de onderste rij staan de ankers "1" en "5" in 12 px `--ink-s`.
- **Eigen scan (links).** Een balk van 8 px in de categoriekleur op een spoor van `--bg-mid`.
- **Hele meting (rechts, gebouwd op 19 oktober 2026).** Een stip van 14 px in de categoriekleur op het gemiddelde, met een witte rand van 2 px, en een grijze lijn van 2 px (`#b3b0a8`) van de laagste tot de hoogste score van een afgeronde scan in die categorie, op hetzelfde spoor. Zo ziet de Lead in één blik het gemiddelde en het bereik, en kan hij zijn eigen balk ervoor houden. De lijn volgt dezelfde drempel als de rest van de Lead-weergaven: Het blok bestaat alleen bij minstens `benchmarkMinRespondenten` afgeronde scans (zie Voorwaarden), dus de lijn kan nooit bij een te kleine groep staan.
- **Zo gebouwd.** De fractie van een rij is (score − 1) / 4 (`schaalFractie` in `lib/mijn-metingen.ts`). De lijn komt uit de categoriescore van elke afgeronde scan. Bij een samengestelde Meting is er geen lijn: Haar scores worden berekend uit gemiddelden van Metingen en er is geen scan om een laagste en hoogste uit te halen, dus alleen de stip. Naam en getal hebben bij een schaal in beide blokken dezelfde breedte (170 px en 3 rem).
- **Tekstalternatief.** Per rij bijvoorbeeld "Overkoepelend, gemiddelde 2,7, laagste 2,0, hoogste 3,6". De eigen balk: "Overkoepelend, jouw score 2,6".
- Categoriekleuren: De kleuren per categorie (`stylesheet.md`, Categoriekleuren). Fundament is het merkgeel (gebouwd op 19 oktober 2026). Het getal staat in `--ink`.

### Quickscan (en andere Assessments met afdelingen)

Vervangen door Kaart met cirkel, Quickscan hieronder. Onderstaande beschrijving geldt alleen nog als achtergrond.

- Links het totaal als percentage in 48 px vet, gekleurd in de kleur van de klasse, met daaronder de klassenaam in 14 px vet ("Gemiddeld ontwikkeld") en daaronder "<punten> van <maximum> punten" in 12 px (bijvoorbeeld "35 van 60 punten").
- Rechts één rij per afdeling, in de volgorde van het Assessment. Elke rij heeft naam, balk van 6 px en rechts "<punten>/<maximum> · <percentage>". Een afdeling die in deze scan niet is ingevuld, wordt weggelaten.
- Balkkleur per afdeling volgt de statuskleuren van de Quickscan (`visualisatie-quickscan.md`): Groen vanaf 80%, oranje van 50 tot 80%, rood onder 50%. De kleur van het totaal volgt de klasse.

Voor een nieuw Assessment geldt: Heeft het categorieën, dan de eerste vorm. Heeft het afdelingen, dan de tweede. Heeft het geen van beide, dan alleen het totaal met klassenpil.

## Teaser van de hele meting (Lead)

Een Lead ziet op elke Meting-kaart waarvoor Resultaten is aangevinkt een blok "Hele meting". Dat geldt ook voor een Lead die geen respondent is. Het blok heeft dezelfde vorm als de teaser van een eigen scan, met drie verschillen:

- Het getal is het gemiddelde van alle afgeronde scans van de Meting. De regel eronder is "Gemiddelde van <n> afgeronde scans" in plaats van punten.
- De rijen tonen het gemiddelde met stip en lijn, zonder "x/15" (zie Kaart met cirkel, voor de Quickscan in percentages).
- Rechtsboven staat een chip. "Tussenstand" (amber) zolang de Meting open is, "Eindstand" (groen) zodra hij is afgesloten.

**Voorwaarden.** Het blok verschijnt alleen als aan alle drie is voldaan:

1. Voor deze Lead staat Resultaten aan voor deze Meting (`beheerpagina.md`, punt 6a). Zonder vinkje toont de kaart alleen respons en de knoppen die wel aan staan.
2. Er zijn minstens `benchmarkMinRespondenten` afgeronde scans in de Meting (`benchmark.md`, Niveau 3, voorstel 5). Daaronder staat in het blok "Resultaten volgen bij minstens <n> afgeronde scans" met de teller, bijvoorbeeld "2 van 5". De gemiddelden zelf staan er dan niet. Dit voorkomt dat een Lead met een gemiddelde van twee scans toch afleidt wat een persoon heeft ingevuld.
3. De Meting heeft minstens één afgeronde scan. Dit is door voorwaarde 2 gedekt.


## Respons

Een Lead-kaart toont onder de kop de respons:

- Links in vet "<afgerond> van <uitgenodigd> respondenten afgerond", rechts het percentage in `--ink-s`.
- Daaronder een balk van 8 px in `--or` (op een Lead-kaart met teaser op `--border` in plaats van `--bg-mid`, omdat het blok warm van achtergrond is).
- Is iedereen klaar, dan vervangt de chip "Compleet" (groen) het percentage.
- "Uitgenodigd" is het aantal `ScanInvulling`-records van de Meting, ongeacht status. Verwijderde of geblokkeerde respondenten tellen niet mee. Dit sluit aan bij de telling in de resultaten.

Het aantal respondenten is voor een Lead altijd zichtbaar, ook onder de drempel van `benchmarkMinRespondenten`. Het zegt iets over de voortgang en niet over personen.

## Kaart: Lead en respondent

Heeft de gebruiker voor dezelfde Meting zowel een eigen scan als Resultaten, dan is dat één kaart (`beheerpagina.md`, punt 6a). Onder de kop staat een kader (rand `--border`, hoekstraal 10 px) met twee blokken naast elkaar. Onder 920 px breedte staan ze onder elkaar.

- **Links "Jouw scan"**, witte achtergrond. Rechtsboven de statuschip van de eigen scan, bijvoorbeeld "Afgerond op 12 oktober 2026". Daaronder per status wat hierboven staat: Teaser bij Afgerond, voortgang bij Bezig, uitnodigingszin bij Uitgenodigd. Onderaan de hoofdknop.
- **Rechts "Hele meting"**, achtergrond `--bg-warm` en een linkerrand van 1 px. Rechtsboven de chip Tussenstand of Eindstand. Daaronder de teaser van de hele meting, de respons en twee knoppen.

De eerste knop in het linkerblok is de hoofdactie van de eigen scan. In het rechterblok is "Resultaten hele meting" de hoofdactie en "Respondenten uitnodigen" de nevenactie.

## Kaart met cirkel (voorstel van 19 oktober 2026)

Ontworpen in "Coniche Scan Mijn metingen", borden "Kaart met cirkel, voorstel (19 oktober)" (Volwassenheidsscan) en "Quickscan met cirkel, voorstel (19 oktober)" (Quickscan), nog niet gebouwd. Dit geldt voor alle Assessments met categorieën of afdelingen en vervangt voor hen de teaser "Jouw overall score" en de twee blokken naast elkaar uit Kaart: Lead en respondent. Hieronder staat eerst de kaart voor Assessments met categorieën, daarna de afwijkingen voor Assessments met afdelingen (Quickscan). Twee blokken van 500 px met een cirkel erbij passen niet naast elkaar, en Jij en Groep op één spoor laten het verschil per categorie direct zien.

- **Paneel.** Onder de kop een paneel met achtergrond `--bg-warm`, rand `--border`, hoekstraal 10 px en padding 28 px 32 px. Links staat een zijblok van 200 px, rechts staan de rijen, met 40 px ertussen. Onder 720 px komt het zijblok boven de rijen.
- **Cirkel.** 156 px, spoor `--bg-mid`, 14 px dik, afgeronde uiteinden, beginnend bovenaan en met de klok mee. De vulling is `(score − 1) / 4` van de omtrek, dus 3,0 is de helft. De kleur is de volle kleur van de afgeronde score (`stylesheet.md`, Drie niveaus van scorekleur, Vol): 3,0 is geel `--score-3` (`#eab308`). In de cirkel staat het getal in 36 px, gewicht 800, en daaronder "Totaalscore" in 12 px hoofdletters in `--ink-s`.
- **Klassenchip.** Onder de cirkel, 24 px hoog, horizontale padding 12 px, 12 px vet, in de celkleur van de afgeronde score (`stylesheet.md`, tabel Cel). Bij 3,0 is dat "Uitbouwen" in `#fbf0b8` met tekst `#5c4800`. De chip is geen 32 px pil meer.
- **Groep (alleen Lead met Resultaten aan).** Onder de chip staat na een lijn van 1 px `--border` het label "Groep, <n> scans" in 12 px hoofdletters en daaronder "<gemiddelde> <klasse>" in 14 px, waarin het getal vet is, bijvoorbeeld "2,8 Uitbouwen". De klasse van de groep volgt dezelfde regels als die van de eigen score.
- **Stip op de cirkel (alleen Lead met zichtbare groep).** Het groepsgemiddelde staat ook op de cirkel, als stip van 14 px met een witte rand van 2 px in `--ink-m`, op de plek van het gemiddelde. De hoek is `(gemiddelde − 1) / 4 × 360°`, vanaf boven met de klok mee, dus 2,8 ligt iets voorbij de helft. De stip heeft geen categoriekleur en is niet in de ringkleur, omdat hij dan wegvalt tegen de vulling. Er is geen boog voor de laagste tot hoogste score, want die is op een cirkel moeilijk te lezen. Die spreiding blijft in de rijen. Onder de drempel van `benchmarkMinRespondenten` en bij een Respondent zonder Resultaten is er geen stip.
- **Respondent zonder Resultaten.** Onder de chip staat "Afgerond op <datum>" in 14 px `--ink-s`. Er is geen groepsregel en geen tweede kolom.
- **Rijen.** Eén rij per categorie, 40 px hoog, in de vaste volgorde. Links de naam (120 px, 14 px, `--ink-m`), dan het spoor, en rechts één getalkolom van 44 px (bij een Lead twee), rechts uitgelijnd. Boven de rijen staat het label "Per categorie" in 12 px hoofdletters, met aan de rechterkant de kolomkoppen "Jij" en, bij een Lead, "Groep". Het spoor is een schaal van 1 tot 5, met onder de laatste rij de ankers "1" en "5" (12 px, `--ink-s`). Alle sporen zijn even lang en even hoog (`stylesheet.md`, Balklijst).
- **Jij.** Een balk van 8 px in de categoriekleur. Het getal is 14 px vet.
- **Groep.** Een stip van 14 px in de categoriekleur met een witte rand van 2 px, op het gemiddelde, en een lijn van 2 px (`#b3b0a8`) van de laagste tot de hoogste score van een afgeronde scan in die categorie, op hetzelfde spoor. Het getal is 14 px gewoon in `--ink-m`. Zijn laagste en hoogste score gelijk, dan staat er alleen een stip en geen lijn.
- **Categoriekleur en klassekleur.** Een rij is een categorie en heeft dus de categoriekleur (`stylesheet.md`, Categoriekleuren). De klassekleur staat in de cirkel en de chip. Onderdeel A in `visualisatie-scores.md` (Per bouwblok) heeft rijen met bouwblokken en houdt de klassekleur voor de stip.
- **Legenda.** Alleen bij een Lead met zichtbare groep, onder de rijen, 12 px: "Jouw score" (balk), "Gemiddelde van de groep" (stip, ook op de cirkel) en "Laagste tot hoogste score" (lijn).
- **Respons (alleen Lead).** Onderin het paneel, onder een lijn van 1 px `--border` en met 16 px ruimte. Een regel in 14 px `--ink-m`, "<n> van <m> respondenten afgerond". Rechts staat de chip "Compleet" (groen) als iedereen klaar is, met links ervan de datum van de laatst afgeronde scan in 14 px `--ink-s`, bijvoorbeeld "14 oktober 2026". Is niet iedereen klaar, dan staat rechts "Bijgewerkt <datum> · <percentage>" in 14 px `--ink-s`, met dezelfde datum. Daaronder een balk van 4 px met spoor `--border` en vulling `#b3b0a8`. De balk is niet oranje, want oranje is voor acties en categorieën. Het aantal respondenten en de datum staan er ook onder de drempel (Respons hierboven).
- **Onder de drempel van `benchmarkMinRespondenten`.** Het paneel toont alleen de eigen balken en een regel "Resultaten van de groep volgen bij minstens <n> afgeronde scans" met de teller "<k> van <n>". Er is geen groepskolom, geen stip, geen lijn, geen groepsregel en geen legenda (Voorwaarden).
- **Knoppen.** Onder het paneel, volgens Knoppen hierboven (40 px hoog, bij meer dan één knop 232 px breed, naast elkaar op één rij): Lead met eigen scan "Bekijk jouw resultaten" en "Resultaten hele meting" (hoofdacties) en "Respondenten uitnodigen" (nevenactie), een respondent alleen "Bekijk jouw resultaten".
- **Geen chip Tussenstand of Eindstand.** In deze kaart vervalt die chip. Compleet of het percentage in de responsregel zegt al of de meting klaar is, en de datum staat daarnaast.
- **Typografie.** Vier groottes (12, 14, 18 en 36 px) en twee gewichten (400 en 700), met 800 alleen voor het getal in de cirkel. De labels "Jouw overall score" en "Gemiddelde score · <n> scans" vervallen, omdat de cirkel en de kolomkoppen hetzelfde zeggen.
- **Toegankelijkheid.** De cirkel heeft een tekstalternatief ("Totaalscore 3,0, Uitbouwen"). Per rij staat het tekstalternatief uit Volwassenheidsscan hierboven.

### Quickscan (en andere Assessments met afdelingen)

Dezelfde kaart, in percentages en met klassekleuren. Alles hierboven geldt, behalve de volgende punten.

- **Cirkel.** Loopt van 0 tot 100%, dus de vulling is `percentage / 100` van de omtrek. In de cirkel staat het totaalpercentage, bijvoorbeeld "45%", in 36 px gewicht 800 met "Totaalscore" eronder. De kleur is de klassekleur van het totaal (`visualisatie-quickscan.md`, Klassekleuren): `--stat-red` onder 50%, `--stat-amber` van 50 tot en met 79% en `--stat-green` vanaf 80%. De score voor de kleur en de klasse is het afgeronde percentage.
- **Chip.** De klassenaam van het totaal in de celkleur van die klasse (`visualisatie-quickscan.md`, Nieuwe stijlwaarden): "Aanzienlijke ontwikkelruimte" (`#fdecec`, tekst `#7f1d1d`), "Gemiddeld ontwikkeld" (`#fdf2e3`, tekst `#6b3a00`) of "Sterk ontwikkeld" (`#e7f6ef`, tekst `#0e4d30`). Het zijblok is 220 px breed in plaats van 200 px, omdat de langste naam anders niet past.
- **Stip op de cirkel.** Zoals hierboven, met de hoek `percentage / 100 × 360°`. De groepsregel luidt "<percentage> <klassenaam>", bijvoorbeeld "58% Gemiddeld ontwikkeld".
- **Rijen.** Eén rij per afdeling in de volgorde van het Assessment, met de naam in 136 px (afgekapt met `…` en de volledige naam in de tooltip), en daarachter hetzelfde spoor en dezelfde getalkolommen. Een afdeling die in deze scan niet is ingevuld, wordt weggelaten. De getallen zijn percentages ("53%"), afgerond op hele procenten. De punten ("8/15") staan niet meer in de rij en komen in de tooltip van de rij en in de resultaten.
- **Schaal.** Van 0 tot 100%, met de ankers "0" en "100%" onder de laatste rij.
- **Kleur van balk en stip.** De afdelingen hebben geen eigen kleur. De balk heeft de klassekleur van het eigen percentage van die afdeling, en de stip de klassekleur van het gemiddelde van de groep voor die afdeling. De lijn is `#b3b0a8`, zoals hierboven.
- **Lijn.** Van de laagste tot de hoogste afdelingsscore van een afgeronde scan. Zijn die gelijk, dan alleen een stip.
- **Kolomkop.** Het label boven de rijen is "Per afdeling".
- **Respons, datum, knoppen, drempel.** Identiek aan de kaart hierboven.
- **Zonder categorieën of afdelingen** (de AI-scan) staat alleen het totaal met de klassenchip, zonder cirkel en rijen.

## Knoppen

- Hoogte 40 px, hoekstraal 6 px, lettergrootte 14 px vet, horizontale padding 20 px.
- **Hoofdactie** is massief oranje (`--or`) met witte tekst, over de hele pagina. Dat geldt ook voor "Bekijk jouw resultaten", op elke kaart. Hover `--or-l`.
- **Nevenactie** is wit met oranje rand en oranje tekst. Hover `--or-faint`.
- Staan er twee knoppen onder elkaar of naast elkaar in dezelfde kaart, dan hebben ze dezelfde breedte van 232 px. Een enkele knop is zo breed als zijn tekst. Knoppen worden nooit over de volle kaartbreedte getrokken.
- Op smalle schermen mogen de knoppen onder elkaar staan en dan op 100% breedte.
- Een Lead-kaart heeft de knoppen die aan staan: "Resultaten" (hoofdactie) en "Respondenten uitnodigen" (nevenactie). Spreiding, Antwoorden en Exporteren zitten niet op de kaart (zie `beheerpagina.md`, punt 6a). Staat alleen Uitnodigen aan, dan is dat de hoofdactie.
- Op de kaart "Lead en respondent" heet de knop naar de hele meting "Resultaten hele meting". Op een kaart van een Lead zonder eigen scan heet die "Resultaten".

## Benchmarkkaart

Een benchmark die voor deze Lead aan staat, is een kaart in de sectie Vergelijkingen, volle breedte, achtergrond `--bg-warm`.

- Links een rond icoon van 48 px in `#ebf1fb` met een blauw staafdiagram.
- Daarnaast het label "Benchmark" (12 px, hoofdletters, `--bl`), de naam van de benchmark (18 px, vet) en een regel van 14 px: "Vergelijking van <n> organisaties, <Assessment>".
- Rechts de knop "Bekijk vergelijking" (hoofdactie).
- Het aantal organisaties staat er alleen als de benchmark ten minste `benchmarkMinOrganisaties` heeft (`benchmark.md`). Anders vervalt het aantal uit de regel. Wat de Lead in de vergelijking ziet, staat in `benchmark.md`, View voor een Lead.

## Kleur en typografie

Alles volgt `stylesheet.md`. Voor deze pagina in het bijzonder:

- Lettergroottes: 12, 14, 18, 40 (teaser van de hele meting op de smalle variant) en 48 px (h1 en teaser-getal).
- Teasergetallen hebben tabelcijfers (`font-variant-numeric: tabular-nums`).
- Kleur van een score of klasse is nooit het enige signaal: De klassenaam staat er altijd bij.
- Zwart is geen vlak. De statuskleuren zijn de bestaande kleuren, niet nieuw.

## Responsive

- Vanaf 1120 px: Twee kaarten naast elkaar, teaser-kaarten volle breedte.
- Onder 920 px: Kaarten onder elkaar, de blokken Jouw scan en Hele meting onder elkaar, de teaser-rijen smaller (naam 130 px, waarde 40 px).
- Onder 640 px: De h1 is 32 px, knoppen op 100% breedte, de teaser-balken onder het getal.

## Toegankelijkheid

- Elke kaart is een `article` met de titel als `h2`.
- Statuschips hebben tekst en geen alleen-kleur betekenis.
- Balken hebben een tekstalternatief: "23 van 60 vragen beantwoord", "8 van 12 respondenten afgerond". De balken van de teaser hebben geen eigen alternatief omdat de waarde er in tekst naast staat.
- Knoppen zijn echte links naar de bijbehorende pagina.

## Gedrag

- De pagina laadt alle kaarten in één keer. Teasers worden uit dezelfde berekening gehaald als de resultatenpagina, zodat de getallen overeenkomen. Er is geen aparte opslag van teaserwaarden.
- Wijzigt een Admin een vinkje voor een Lead, dan geldt dat bij de eerstvolgende keer laden.
- Een scan die wordt heropend (`afgerond` naar `bezig`) valt terug in de sectie Nog te doen en verliest zijn teaser.
- De pagina is voor één rol van één Organisatie. Heeft iemand scans bij meerdere Organisaties, dan blijft dat zoals nu geregeld (`datamodel.md`, deel 2, Toegang voor respondenten) en is de naam van de Organisatie in de kop de enige scheiding.

## Open punten


- **Laatst opgeslagen.** `ScanInvulling` heeft geen veld voor het laatste opslagmoment. Voorstel: `laatstOpgeslagenOp` (datum en tijd), gezet bij elk opslaan van een antwoord. Zonder dat veld vervalt de rechterhelft van de voortgangsregel.
- **Tussenstand en eindstand.** Voorstel: Een Meting is open zolang er geen sluitingsdatum is gepasseerd en niet alle uitgenodigde scans zijn afgerond. Er is nog geen gedefinieerde "afgesloten Meting". Bevestigen of er een Admin-actie komt, of dat het automatisch uit de status volgt.
- **Teaser in de PDF-export.** Niet bedoeld. De export blijft zoals beschreven in de exportspecs.
- **Staten in het ontwerp.** "Te weinig scans" en "geen Resultaten" zitten nog niet in het design.
- **Meerdere Metingen van hetzelfde Assessment.** Op een Lead-pagina met veel Metingen (bijvoorbeeld 8 in vier jaar) wordt de lijst lang. Voorstel: De nieuwste drie tonen en de rest achter "Oudere metingen tonen". Pas oppakken als het voorkomt.

## Gebouwd

Gebouwd op 15 oktober 2026. De pagina is `app/s/[code]/page.tsx`, de kaarten staan in
`components/mijn-metingen/MijnMetingenOnderdelen.tsx`, de rekenregels in `lib/mijn-metingen.ts` (met tests) en de opmaak in
`app/styles/mijn-metingen.css`.

**Keuzes waar de spec open liet**

- **Laatst opgeslagen.** `ScanInvulling.laatstOpgeslagenOp` is gezet bij elke wijziging van de antwoorden (`updateScanInvulling`).
  Bij data van vóór het veld ontbreekt het en vervalt de rechterhelft van de voortgangsregel. In dagen staat het tot en met 6 dagen
  geleden, vanaf 7 dagen als datum.
- **Tussenstand en eindstand.** Er is nog geen sluitingsdatum, dus "Eindstand" staat er zodra alle uitgenodigde scans van de
  Meting zijn afgerond en anders "Tussenstand". Een samengestelde Meting heeft de chip "Gemiddelde".
- **Quickscan-teaser voor een Lead.** Dezelfde regels als bij de eigen scan, met het gemiddelde van de Meting
  (`quickscanMeting`) en alleen percentages in de rijen.
- **Zonder categorieën of afdelingen** (de AI-scan) staat alleen het totaal met de klassenpil.
- **"Respondenten uitnodigen"** opent onder de knoppen het invoerveld voor een e-mailadres.
- **Benchmarkkaart.** Titel is `Benchmark.naam`. De regel noemt het aantal organisaties alleen bij `benchmarkMinOrganisaties`. Bij
  niveau 2 staat "Vergelijking van Metingen".
- **Smalle blokken.** In een kaart of blok smaller dan 560px staat het getal boven de rijen (container query), zodat de balken
  breed genoeg blijven naast een tweede blok.
- **Een Lead is altijd als Lead herkenbaar** (op verzoek van Sander): Naast de naam van de Organisatie in de kop staat de
  rolchip "Lead", ook als er geen Meting of vergelijking voor hem aanstaat. Zijn er geen Lead-kaarten, dan staat er een korte
  melding "Je bent Lead van <Organisatie>. Een beheerder bepaalt welke resultaten je hier ziet. Er staat nu nog niets voor je
  klaar." boven zijn eigen scans. Dit is een aanvulling op de spec, die de rolchip alleen op kaarten noemt.
- **Aantal scans achter de titel.** Bij de teaser van de hele meting staat het aantal niet als regel "Gemiddelde van n afgeronde
  scans" onder het getal, maar achter de titel ("Gemiddelde score · 6 scans"). Zo hebben het blok Jouw scan en het blok Hele
  meting dezelfde regels en staan de rijen op dezelfde hoogte (op verzoek van Sander, wijkt af van de spec).
- Nog niet: De staten "te weinig scans" en "geen Resultaten" als apart ontwerp, "Oudere metingen tonen" en de lege staat per
  sectie.

