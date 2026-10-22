# Coniche Scan: Mijn metingen

Spec voor de landingspagina "Mijn metingen", die een Respondent, een Lead of iemand met beide rollen ziet na het openen van de persoonlijke link.

Ontwerp: Claude Design, "Coniche Scan Mijn metingen", met drie borden: Respondent, Lead en respondent, en Lead. Dit document vervangt de opmaak van de bestaande lijst in `schermen.md` (Mijn metingen) en de beschrijving van de kaarten in `beheerpagina.md` (punt 6a). Wat daar over routing en rechten staat, blijft gelden.

## Doel

De pagina beantwoordt drie vragen, in deze volgorde: Wat moet ik nog doen, wat heb ik al gedaan, en wat zie ik van de hele meting als ik Lead ben. Een afgeronde scan toont daarom meteen de uitkomst, zodat de respondent niet eerst hoeft door te klikken om te zien dat het de moeite waard was.

## Opbouw

Van boven naar beneden:

1. **Kop.** Boven de titel het label "Mijn metingen" (12 px, hoofdletters, `--or`). Daaronder "Welkom terug, <voornaam>" als h1 van 48 px. Heeft de gebruiker geen voornaam, dan staat er "Welkom terug". Daaronder de naam van de Organisatie met een gebouwicon, en de introtekst uit `mijnMetingenIntro` (`datamodel.md`, Algemene teksten). De introtekst is beheerbaar en staat niet vast in de code. Het ontwerp toont per rol een andere tekst, dat is voorbeeldtekst.
2. **Secties.** Welke secties er zijn hangt af van de rol (zie Varianten). Elke sectie heeft een label in `.lbl`-stijl met het aantal erachter: "Nog te doen, 2".
3. **Kaarten** in een raster. Een kaart met een paneel met cirkel (Kaart met cirkel) heeft altijd de volle breedte, ook als hij alleen een Lead-weergave heeft.

Op deze pagina is er geen terugknop.

## Varianten

### Respondent

- **Nog te doen.** Kaarten met status Uitgenodigd of Bezig, op uitnodigingsdatum, de oudste bovenaan (wie het langst wacht, staat bovenaan).
- **Afgerond.** Kaarten met status Afgerond, op afrondingsdatum, de nieuwste bovenaan. Deze kaarten zijn volle breedte en tonen het paneel met de uitkomst.
- Heeft de respondent maar één scan, dan is er maar één sectie.

### Lead (geen respondent)

- **Metingen.** Eén kaart per Meting waarvoor de Admin minstens één weergave heeft aangevinkt (`beheerpagina.md`, punt 6a), op meetdatum, de nieuwste bovenaan.
- **Vergelijkingen.** Een kaart per benchmark die aan staat. Zie Benchmarkkaart.
- **Dossier.** Eén kaart, onder Vergelijkingen (of onder Metingen als er geen Vergelijkingen zijn), als de Consultant het Dossier van de Organisatie zichtbaar heeft gemaakt voor de Lead en er minstens één item zichtbaar is. Zie Dossierkaart.
- Een Lead zonder Metingen maar met een benchmark ziet alleen de sectie Vergelijkingen. Een Lead zonder Metingen en zonder benchmark, maar met een Dossier, ziet alleen de sectie Dossier.

### Lead en respondent

Dezelfde secties als een Lead. Valt een eigen scan samen met een Meting op zijn pagina, dan is het één kaart (zie Kaart met cirkel). Eigen scans zonder bijbehorende Meting op de pagina staan als gewone respondentkaarten in de sectie Nog te doen of Afgerond, boven de sectie Metingen.

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

De knopnamen zijn kort, omdat de knoppen smal kunnen zijn. De routing: Uitgenodigd gaat naar de intake, Bezig naar de doorloopflow op de plek waar de respondent bleef, Afgerond naar de resultaten van die `ScanInvulling`.

### Inhoud per status

- **Uitgenodigd.** Een zin: "Je bent op <datum uitgenodigd> uitgenodigd voor deze scan. Je antwoorden worden tussentijds bewaard, dus je kunt later verder." De datum komt uit `ScanInvulling.uitgenodigdOp`.
- **Bezig.** Een voortgangsregel "<n> van <totaal> vragen" in vet, rechts "Laatst opgeslagen <relatief>" in `--ink-s`, en daaronder een balk van 8 px in `--or` op `--bg-mid`. Het aantal is het aantal beantwoorde vragen. Het totaal is het aantal vragen van het Assessment. "Laatst opgeslagen" staat in dagen ("vandaag", "gisteren", "3 dagen geleden") en daarna als datum. Zie Open punten voor het veld daarvoor.
- **Afgerond.** Het paneel met de uitkomst (Kaart met cirkel) en de knop.

## Assessments zonder categorieën, afdelingen of domeinen

Een Assessment zonder categorieën, afdelingen of domeinen toont op een afgeronde scan alleen het totaal met de klassenpil (32 px, in de celkleur van de klasse). Alle andere Assessments tonen de Kaart met cirkel.

## Voorwaarden voor de groep (Lead)

Een Lead ziet op elke Meting-kaart waarvoor Resultaten is aangevinkt de groep, ook als hij geen respondent is. De groep verschijnt alleen als aan beide is voldaan:

1. Voor deze Lead staat Resultaten aan voor deze Meting (`beheerpagina.md`, punt 6a). Zonder vinkje toont de kaart alleen respons en de knoppen die wel aan staan.
2. Er zijn minstens `benchmarkMinRespondenten` afgeronde scans in de Meting (`benchmark.md`, Niveau 3, startwaarde 5). Daaronder staat "Resultaten volgen bij minstens <n> afgeronde scans" met de teller, bijvoorbeeld "2 van 5". De gemiddelden zelf staan er dan niet. Dit voorkomt dat een Lead met een gemiddelde van twee scans toch afleidt wat een persoon heeft ingevuld.

## Respons

Een Lead-kaart toont onder de kop de respons:

- Links in vet "<afgerond> van <uitgenodigd> respondenten afgerond", rechts het percentage in `--ink-s`.
- Daaronder een balk van 8 px in `--or` (op een Lead-kaart met paneel op `--border` in plaats van `--bg-mid`, omdat het blok warm van achtergrond is).
- Is iedereen klaar, dan vervangt de chip "Compleet" (groen) het percentage.
- "Uitgenodigd" is het aantal `ScanInvulling`-records van de Meting, ongeacht status. Verwijderde of geblokkeerde respondenten tellen niet mee. Dit sluit aan bij de telling in de resultaten.

Het aantal respondenten is voor een Lead altijd zichtbaar, ook onder de drempel van `benchmarkMinRespondenten`. Het zegt iets over de voortgang en niet over personen.

## Kaart: Lead met een eigen scan die nog niet is afgerond

Heeft de gebruiker voor dezelfde Meting een eigen scan en Resultaten, dan is dat één kaart (`beheerpagina.md`, punt 6a). Is de eigen scan afgerond, dan toont de kaart het paneel met de eigen balken en de groep (Kaart met cirkel). Is de eigen scan Uitgenodigd of Bezig, dan staat onder de kop de inhoud per status van de eigen scan (Inhoud per status), met daaronder het paneel van een Lead zonder eigen scan. De eerste knop is de hoofdactie van de eigen scan, daarnaast staan "Resultaten hele meting" en "Respondenten uitnodigen".

## Kaart met cirkel

Ontwerp: "Coniche Scan Mijn metingen", borden "Kaart met cirkel" (Volwassenheidsscan) en "Quickscan met cirkel" (Quickscan). Dit geldt voor alle Assessments met categorieën, afdelingen of domeinen. Hieronder staat eerst de kaart voor Assessments met categorieën, daarna de afwijkingen voor Assessments met afdelingen (Quickscan) en voor Assessments met domeinen zonder categorieën (de AI-scan). Twee blokken van 500 px met een cirkel erbij passen niet naast elkaar, en Jij en Groep op één spoor laten het verschil per categorie direct zien.

- **Breedte.** Elke kaart met een paneel is op volle breedte van de pagina, dus ook de kaart van een Lead zonder eigen scan en de kaart van een Lead die ook respondent is. Alle kaarten met een paneel zijn zo even breed en staan onder elkaar. Het paneel heeft minstens ongeveer 720 px nodig (zijblok 200 px, tussenruimte 40 px, rijen minstens 420 px en padding 64 px). In een halve kolom breken de responsregel, de datum en de as ("1" en "5") af.
- **Paneel.** Onder de kop een paneel met achtergrond `--bg-warm`, rand `--border`, hoekstraal 10 px en padding 28 px 32 px. Links staat een zijblok van 200 px, rechts staan de rijen, met 40 px ertussen.
- **Cirkel.** 156 px, spoor `--bg-mid`, 14 px dik, afgeronde uiteinden, beginnend bovenaan en met de klok mee. De vulling is `(score − 1) / 4` van de omtrek, dus 3,0 is de helft. De kleur is de volle kleur van de afgeronde score (`stylesheet.md`, Drie niveaus van scorekleur, Vol): 3,0 is geel `--score-3` (`#eab308`). In de cirkel staat het getal in 36 px, gewicht 800, en daaronder "Totaalscore" in 12 px hoofdletters in `--ink-s`.
- **Klassenchip.** Onder de cirkel, 24 px hoog, horizontale padding 12 px, 12 px vet, in de celkleur van de afgeronde score (`stylesheet.md`, tabel Cel). Bij 3,0 is dat "Uitbouwen" in `#fbf0b8` met tekst `#5c4800`.
- **Groep (alleen Lead met Resultaten aan).** Onder de chip staat na een lijn van 1 px `--border` het label "Groep, <n> scans" in 12 px hoofdletters en daaronder "<gemiddelde> <klasse>" in 14 px, waarin het getal vet is, bijvoorbeeld "2,8 Uitbouwen". De klasse van de groep volgt dezelfde regels als die van de eigen score.
- **Stip op de cirkel (alleen Lead met zichtbare groep).** Het groepsgemiddelde staat ook op de cirkel, als stip van 14 px met een witte rand van 2 px in `--ink-m`, op de plek van het gemiddelde. De hoek is `(gemiddelde − 1) / 4 × 360°`, vanaf boven met de klok mee, dus 2,8 ligt iets voorbij de helft. De stip heeft geen categoriekleur en is niet in de ringkleur, omdat hij dan wegvalt tegen de vulling. Er is geen boog voor de laagste tot hoogste score, want die is op een cirkel moeilijk te lezen. Die spreiding blijft in de rijen. Onder de drempel van `benchmarkMinRespondenten` en bij een Respondent zonder Resultaten is er geen stip.
- **Lead zonder eigen scan.** Zonder kolom Jij staat de groep als gevulde balk van 8 px in de categoriekleur, die op het gemiddelde eindigt, in plaats van een stip op een leeg spoor. Het getal staat in de ene kolom Groep. Bij meer dan één scan staat de spreiding erbij als lijn van 2 px (`#b3b0a8`) van de laagste tot de hoogste score, met een eindstreepje van 2 px breed en 12 px hoog op beide uiteinden, zodat de lijn ook zichtbaar is waar hij over de balk loopt. Er is dan geen stip. Bij één scan is er alleen de balk. De legenda noemt "Gemiddelde van de groep" (balk) en, bij meer dan één scan, "Laagste tot hoogste score" (lijn). De ring toont het gemiddelde van de groep zonder stip.
- **Respondent zonder Resultaten.** Onder de chip staat "Afgerond op <datum>" in 14 px `--ink-s`. Er is geen groepsregel en geen tweede kolom.
- **Rijen.** Eén rij per categorie, 40 px hoog, in de vaste volgorde. Links de naam (120 px, 14 px, `--ink-m`), dan het spoor, en rechts één getalkolom van 44 px (bij een Lead twee), rechts uitgelijnd. Boven de rijen staat het label "Per categorie" in 12 px hoofdletters, met aan de rechterkant de kolomkoppen "Jij" en, bij een Lead, "Groep". Het spoor is een schaal van 1 tot 5, met onder de laatste rij de ankers "1" en "5" (12 px, `--ink-s`). Alle sporen zijn even lang en even hoog (`stylesheet.md`, Balklijst).
- **Jij.** Een balk van 8 px in de categoriekleur. Het getal is 14 px vet.
- **Groep.** Een stip van 14 px in de categoriekleur met een witte rand van 2 px, op het gemiddelde, en een lijn van 2 px (`#b3b0a8`) van de laagste tot de hoogste score van een afgeronde scan in die categorie, op hetzelfde spoor. Het getal is 14 px gewoon in `--ink-m`. Zijn laagste en hoogste score gelijk, dan staat er alleen een stip en geen lijn.
- **Categoriekleur en klassekleur.** Een rij is een categorie en heeft dus de categoriekleur (`stylesheet.md`, Categoriekleuren). De klassekleur staat in de cirkel en de chip. Onderdeel A in `visualisatie-scores.md` (Per bouwblok) heeft rijen met bouwblokken en houdt de klassekleur voor de stip.
- **Legenda.** Alleen bij een Lead met zichtbare groep, onder de rijen, 12 px: "Jouw score" (balk), "Gemiddelde van de groep" (stip, ook op de cirkel) en "Laagste tot hoogste score" (lijn).
- **Respons (alleen Lead).** Onderin het paneel, onder een lijn van 1 px `--border` en met 16 px ruimte. Een regel in 14 px `--ink-m`, "<n> van <m> respondenten afgerond". Rechts staat de chip "Compleet" (groen) als iedereen klaar is, met links ervan de datum van de laatst afgeronde scan in 14 px `--ink-s`, bijvoorbeeld "14 oktober 2026". Is niet iedereen klaar, dan staat rechts "Bijgewerkt <datum> · <percentage>" in 14 px `--ink-s`, met dezelfde datum. Daaronder een balk van 4 px met spoor `--border` en vulling `#b3b0a8`. De balk is niet oranje, want oranje is voor acties en categorieën. Het aantal respondenten en de datum staan er ook onder de drempel (Respons hierboven).
- **Onder de drempel van `benchmarkMinRespondenten`.** Het paneel toont alleen de eigen balken en een regel "Resultaten van de groep volgen bij minstens <n> afgeronde scans" met de teller "<k> van <n>". Er is geen groepskolom, geen stip, geen lijn, geen groepsregel en geen legenda (Voorwaarden).
- **Knoppen.** Onder het paneel, volgens Knoppen hierboven (40 px hoog, bij meer dan één knop 232 px breed, naast elkaar op één rij): Lead met eigen scan "Bekijk jouw resultaten" en "Resultaten hele meting" (hoofdacties) en "Respondenten uitnodigen" (nevenactie), een respondent alleen "Bekijk jouw resultaten".
- **Over deze scan.** Op elke Meting-kaart van een Respondent staat naast "Bekijk jouw resultaten" de link "Over deze scan" naar de Assessment-pagina, in dezelfde stijl als de knoppen maar als tekstlink (`--or`, 14 px, gewicht 700). De linktekst hangt af van het type: "Over deze scan: Visie en bouwblokken" bij de Volwassenheidsscan en de Zorgscan, "Over deze scan: AI-domeinen en 2030" bij de AI-scan en "Over deze scan: Spanningsvelden en visie" bij de Spanningsmeter. Bij de Quickscan staat de link er niet. Een Lead die geen Respondent is, ziet hem niet. Zie `schermen.md`, Mijn metingen.
- **Geen chip Tussenstand of Eindstand.** In deze kaart vervalt die chip. Compleet of het percentage in de responsregel zegt al of de meting klaar is, en de datum staat daarnaast.
- **Zelfde ring op het resultatenscherm.** De cirkel is de `.score-ring` van `stylesheet.md` (Resultaten) en wordt ook gebruikt in de totaalkaart van het resultatenscherm, voor de Volwassenheidsscan en de Quickscan. Voor de Quickscan staat de opbouw in `content-ziekenhuis-quickscan.md`, Resultaten.
- **Typografie.** Maten uit de schaal van `stylesheet.md` (12, 14, 18 en 36 px) en twee gewichten (400 en 700), met 800 alleen voor het getal in de cirkel.
- **Toegankelijkheid.** De cirkel heeft een tekstalternatief ("Totaalscore 3,0, Uitbouwen"). Per rij een tekstalternatief, bijvoorbeeld "Overkoepelend, gemiddelde 2,7, laagste 2,0, hoogste 3,6", en voor de eigen balk "Overkoepelend, jouw score 2,6".

### Quickscan (en andere Assessments met afdelingen)

Dezelfde kaart, in percentages en met klassekleuren. Alles hierboven geldt, behalve de volgende punten.

- **Cirkel.** Loopt van 0 tot 100%, dus de vulling is `percentage / 100` van de omtrek. In de cirkel staat het totaalpercentage, bijvoorbeeld "45%", in 36 px gewicht 800 met "Totaalscore" eronder. De kleur is de klassekleur van het totaal (`visualisatie-quickscan.md`, Klassekleuren): `--stat-red` onder 50%, `--stat-amber` van 50 tot en met 79% en `--stat-green` vanaf 80%. De score voor de kleur en de klasse is het afgeronde percentage.
- **Chip.** De klassenaam van het totaal in de celkleur van die klasse (`visualisatie-quickscan.md`, Stijlwaarden): "Aanzienlijke ontwikkelruimte" (`#fdecec`, tekst `#7f1d1d`), "Gemiddeld ontwikkeld" (`#fdf2e3`, tekst `#6b3a00`) of "Sterk ontwikkeld" (`#e7f6ef`, tekst `#0e4d30`). Het zijblok is 220 px breed in plaats van 200 px, omdat de langste naam anders niet past.
- **Stip op de cirkel.** Zoals hierboven, met de hoek `percentage / 100 × 360°`. De groepsregel luidt "<percentage> <klassenaam>", bijvoorbeeld "58% Gemiddeld ontwikkeld".
- **Rijen.** Eén rij per afdeling in de volgorde van het Assessment, met de naam in 136 px (afgekapt met `…` en de volledige naam in de tooltip), en daarachter hetzelfde spoor en dezelfde getalkolommen. Een afdeling die in deze scan niet is ingevuld, wordt weggelaten. De getallen zijn percentages ("53%"), afgerond op hele procenten. De punten ("8/15") staan niet meer in de rij en komen in de tooltip van de rij en in de resultaten.
- **Afdeling niet beantwoord.** Een afdeling waarvan de vragen in deze scan niet zijn beantwoord, blijft als rij staan, zodat de volgorde gelijk blijft. De tekst zegt wat er is gebeurd en niet dat de afdeling niet relevant is, omdat iemand van die afdeling het kan lezen. De naam staat in `--ink-s`, het spoor is leeg en in de kolom Jij staat een streepje ("–", 14 px gewoon, `--ink-s`) in plaats van een percentage. De tooltip van de rij luidt "Niet beantwoord". Onder de rijen staat een regel in 12 px `--ink-s`: "– Niet beantwoord. Het totaal telt alleen de beantwoorde afdelingen." De afdeling telt niet mee in het totaal en in de ring. Bij een Lead blijven stip, lijn en groepspercentage van die afdeling staan als andere scans de afdeling wel hebben. Heeft geen enkele scan een waarde, dan is er ook geen groepskolom voor die rij en staat er een streepje in beide kolommen.
- **Schaal.** Van 0 tot 100%, met de ankers "0" en "100%" onder de laatste rij.
- **Kleur van balk en stip.** De afdelingen hebben geen eigen kleur. De balk heeft de klassekleur van het eigen percentage van die afdeling, en de stip de klassekleur van het gemiddelde van de groep voor die afdeling. De lijn is `#b3b0a8`, zoals hierboven.
- **Lijn.** Van de laagste tot de hoogste afdelingsscore van een afgeronde scan. Zijn die gelijk, dan alleen een stip.
- **Kolomkop.** Het label boven de rijen is "Per afdeling".
- **Respons, datum, knoppen, drempel.** Identiek aan de kaart hierboven.
- **Zonder categorieën, afdelingen en domeinen** staat alleen het totaal met de klassenchip, zonder cirkel en rijen.

### AI-scan (en andere Assessments met domeinen zonder categorieën)

De AI-scan heeft dezelfde kaart met cirkel, met rijen per AI-domein. Alles hierboven geldt, behalve de volgende punten.

- **Paneel, cirkel, chip, Groep, stip, respons en knoppen.** Identiek aan de Volwassenheidsscan: Zijblok van 200 px, ring van 156 px met het totaal (schaal 1 tot 5, vulling `(score − 1) / 4`), klassenchip van 24 px in de celkleur van de afgeronde score (bijvoorbeeld "Basis op orde" in `#fbe1e1` met tekst `#a32426`), de regel "Groep, <n> scans" en de stip van het groepsgemiddelde op de ring, de responsregel en de knoppen van 232 px.
- **Rijen.** Eén rij per AI-domein, 40 px hoog, in de vaste volgorde 1 tot en met 8 (niet gesorteerd op score, zoals rond de radar). Links een nummerbolletje van 22 px in de domeinkleur (`stylesheet.md`, Groepskleuren) met het nummer in 12 px, gewicht 700, wit; bij de domeinen 5, 6 en 8 in `--ink`. Daarnaast de domeinnaam in 14 px `--ink-m`, 190 px breed. Past een naam niet op één regel ("Performance, monitoring en kwaliteit"), dan loopt hij door op een tweede regel (regelhoogte 18 px) en blijft de rij 40 px. Daarna het spoor van 1 tot 5 en rechts de kolommen Jij en, bij een Lead, Groep van 44 px. Dit is dezelfde opbouw als de zes velden van de Spanningsmeter.
- **Jij en Groep.** Zoals bij de Volwassenheidsscan, met de domeinkleur in plaats van de categoriekleur: Jij is een balk van 8 px, Groep een stip van 14 px met een witte rand van 2 px op het gemiddelde en een lijn van 2 px (`#b3b0a8`) van de laagste tot de hoogste score van een afgeronde scan in dat domein.
- **Kolomkop.** Het label boven de rijen is "Per domein" (het meervoud van `Assessment.bouwblokLabel` in kleine letters, zoals in "Scores per domein" op het resultatenscherm). Er zijn geen categorielabels, want de AI-scan heeft geen categorielaag.
- **Breedte.** Het paneel heeft minstens ongeveer 780 px nodig (zijblok 200 px, tussenruimte 40 px, nummerbolletje en naam 220 px, spoor minstens 160 px, twee getalkolommen 88 px en padding 64 px). De kaart is op volle breedte, zoals alle kaarten met een paneel.
- **Tekstalternatief.** Per rij bijvoorbeeld "Domein 3, Use-cases en automatisering, jouw score 2,0, gemiddelde 3,4, laagste 2,0, hoogste 4,2". De cirkel heeft "Totaalscore 2,4, Basis op orde".
- **Lead zonder eigen scan, respondent zonder Resultaten en onder de drempel.** Zoals bij de Volwassenheidsscan.

### Wanneer het paneel er staat

- **Paneel of totaal.** Het paneel staat bij een afgeronde eigen scan, bij een Lead met Resultaten en genoeg afgeronde scans, en bij beide, voor een Assessment met categorieën, afdelingen of domeinen. Een Assessment zonder die lagen houdt het totaal met de klassenpil.
- **Samengestelde Meting.** Geen respons en geen lijn, want haar scores komen uit gemiddelden van Metingen. De chip "Gemiddelde" blijft staan.

### Spanningsmeter

Dezelfde kaart met cirkel, met een zijblok en zes rijen, een per spanningsveld in de veldkleur, en de ring met het Gemiddeld niveau (label "Gemiddeld niveau"). De stip van het groepsgemiddelde staat ook op de ring. Onder de legenda staat de regel "Grootste spanning". Volledig in `visualisatie-spanningsmeter.md`, Mijn metingen.

## Knoppen

- Hoogte 40 px, hoekstraal 6 px, lettergrootte 14 px vet, horizontale padding 20 px.
- **Hoofdactie** is massief oranje (`--or`) met witte tekst, over de hele pagina. Dat geldt ook voor "Bekijk jouw resultaten", op elke kaart. Hover `--or-l`.
- **Nevenactie** is wit met oranje rand en oranje tekst. Hover `--or-faint`.
- Staan er twee knoppen onder elkaar of naast elkaar in dezelfde kaart, dan hebben ze dezelfde breedte van 232 px. Een enkele knop is zo breed als zijn tekst, met één uitzondering: De knoppen "Bekijk vergelijking" op de benchmarkkaart en "Bekijk dossier" op de Dossierkaart hebben dezelfde vaste breedte (184 px in het ontwerp), zodat ze onder elkaar op één lijn staan. Knoppen worden nooit over de volle kaartbreedte getrokken.
- Een Lead-kaart heeft de knoppen die aan staan: "Resultaten" (hoofdactie) en "Respondenten uitnodigen" (nevenactie). Spreiding, Antwoorden en Exporteren zitten niet op de kaart (zie `beheerpagina.md`, punt 6a). Staat alleen Uitnodigen aan, dan is dat de hoofdactie.
- Op de kaart "Lead en respondent" heet de knop naar de hele meting "Resultaten hele meting". Op een kaart van een Lead zonder eigen scan heet die "Resultaten".

## Benchmarkkaart

Een benchmark die voor deze Lead aan staat, is een kaart in de sectie Vergelijkingen, volle breedte, achtergrond `--bg-warm`.

- Links een rond icoon van 48 px in `#ebf1fb` met een blauw staafdiagram.
- Daarnaast het label "Benchmark" (12 px, hoofdletters, `--bl`), de naam van de benchmark (18 px, vet) en een regel van 14 px: "Vergelijking van <n> organisaties, <Assessment>".
- Rechts de knop "Bekijk vergelijking" (hoofdactie).
- Het aantal organisaties staat er alleen als de benchmark ten minste `benchmarkMinOrganisaties` heeft (`benchmark.md`). Anders vervalt het aantal uit de regel. Wat de Lead in de vergelijking ziet, staat in `benchmark.md`, View voor een Lead.

## Dossierkaart

Ontwerp: "Coniche Scan Dossier", bord 6. Een Dossier dat zichtbaar is voor deze Lead, is een kaart in de sectie Dossier, volle breedte, achtergrond `--bg-warm`. Het is één kaart: De Cases, het Nieuws, de Events en de Blogs staan niet los in het overzicht maar op de Dossierpagina (`dossier.md`, Dossier lezen), die de knop opent.

- Links een rond icoon van 48px in `--or-faint` met een oranje mapje.
- Daarnaast de eyebrow "Dossier" (12px, hoofdletters, `--or`), eventueel de tag "Nieuw" (12px, gewicht 700, `--bl` op `--bl-faint`), de titel {naam voor de Lead} (standaard "Dossier {Organisatie}", 18px, vet) en de regel "Gedeeld door je consultant op {datum}" (14px, `--ink-s`).
- Onder de regel een voorproef met ten hoogste drie titels als chips (12px, gewicht 600, wit met 1px `--border`, afgerond, met een stip in oranje voor een Case, blauw voor Nieuws, groen voor een Event en amber voor een Blog), eerst de Cases, dan Nieuws, Events en Blogs. Een verlopen Event staat er niet bij. Zijn er meer items, dan staat er "+ n meer". Daaronder "2 cases · 2 nieuwsberichten · 2 events · 1 blog" in 12px `--ink-s`. Een soort zonder items valt weg en een verlopen Event telt niet mee.
- Rechts de knop "Bekijk dossier" (hoofdactie), even breed als "Bekijk vergelijking".
- De tag "Nieuw" staat er zolang de Lead de Dossierpagina niet heeft geopend na de laatste wijziging (`OrganisatieLid.dossierGezienOp`, `datamodel.md`, Dossieritem).
- Het label "Dossier" is oranje. Benchmark is blauw, en de Meting heeft het oranje van het Assessment-icoon. De sectielabels zijn grijs en tellen mee: "Dossier, 1".

## Kleur en typografie

Alles volgt `stylesheet.md`. Voor deze pagina in het bijzonder:

- Lettergroottes: 12, 14, 18, 36 (het getal in de ring) en 48 px (h1).
- Getallen hebben tabelcijfers (`font-variant-numeric: tabular-nums`).
- Kleur van een score of klasse is nooit het enige signaal: De klassenaam staat er altijd bij.
- Zwart is geen vlak. De statuskleuren zijn de bestaande kleuren, niet nieuw.

## Toegankelijkheid

- Elke kaart is een `article` met de titel als `h2`.
- Statuschips hebben tekst en geen alleen-kleur betekenis.
- Balken hebben een tekstalternatief: "23 van 60 vragen beantwoord", "8 van 12 respondenten afgerond". De balken in het paneel hebben geen eigen alternatief omdat de waarde er in tekst naast staat.
- Knoppen zijn echte links naar de bijbehorende pagina.

## Gedrag

- De pagina laadt alle kaarten in één keer. De waarden in het paneel worden uit dezelfde berekening gehaald als de resultatenpagina, zodat de getallen overeenkomen. Er is geen aparte opslag van teaserwaarden.
- Wijzigt een Admin een vinkje voor een Lead, dan geldt dat bij de eerstvolgende keer laden.
- Een scan die wordt heropend (`afgerond` naar `bezig`) valt terug in de sectie Nog te doen en verliest zijn paneel.
- De pagina is voor één rol van één Organisatie. Heeft iemand scans bij meerdere Organisaties, dan blijft dat zoals nu geregeld (`datamodel-rollen.md`, Toegang voor respondenten) en is de naam van de Organisatie in de kop de enige scheiding.

## Open punten

- **Laatst opgeslagen.** `ScanInvulling.laatstOpgeslagenOp` (datum en tijd) wordt bij elk opslaan van een antwoord gezet (`datamodel.md`). Zonder dat veld vervalt de rechterhelft van de voortgangsregel.
- **Paneel in de PDF-export.** Niet bedoeld. De export blijft zoals beschreven in de exportspecs.
- **Staten in het ontwerp.** "Te weinig scans" en "geen Resultaten" zitten nog niet in het design.
- **Meerdere Metingen van hetzelfde Assessment.** Op een Lead-pagina met veel Metingen (bijvoorbeeld 8 in vier jaar) wordt de lijst lang. Een mogelijke oplossing: De nieuwste drie tonen en de rest achter "Oudere metingen tonen". Pas oppakken als het voorkomt.
