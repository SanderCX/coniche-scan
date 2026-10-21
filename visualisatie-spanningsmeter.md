# Coniche Scan: Visualisaties Digitale Spanningsmeter

Spec voor wat een gebruiker van de Digitale Spanningsmeter ziet: het beeld in de cirkel op scherm 1, de doorloopflow, Mijn metingen, het resultaat van een respondent en van een groep, en de film Wat krijg ik. De inhoud staat in `content-spanningsmeter.md`, het rekenen in `datamodel.md` (Scoreberekening, Spanningsmeter), de schermen in `CLAUDE.md` en de gedeelde opmaak in `stylesheet.md`.

**Status: Voorstel van 21 oktober 2026, gebouwd op 21 oktober 2026 (zie Zo gebouwd onderaan).** Besloten door Joost in het ontwerp: De plek in de cirkel op scherm 1, het beeld, de iconen en de kleuren ("goed voor nu"), en dat de toegang gelijk is aan die van de andere scans. Besloten is ook de volgorde van de delen in de cirkel (variant E2, `CLAUDE.md`, scherm 1). Nog niet besloten zijn de punten onder Open punten, en de teksten moeten nog geverifieerd worden. De bron (het PDF van Martijn) is een bron en geen voorschrift: Waar de app een algemene wijze voor Assessments heeft (gemiddelde met spreiding, Onderdeel in plaats van afdeling), geldt die. Het ontwerp staat in het Design-artifact "Digitale Spanningsmeter: home en schermen", met de borden Main en Gekozen (de cirkel), Beeld, Vraag, Lead, Rapport, Profiel en Landing.

## Uitgangspunten

- **Geen totaalscore.** De Spanningsmeter meet het verschil tussen velden. Waar één getal staat (de ring), is dat het Gemiddeld niveau en een weergave. Het is geen score en wordt nergens als resultaat van de meter gepresenteerd (`datamodel.md`, Scoreberekening).
- **Eerst je eigen profiel.** Een respondent ziet na het invullen direct zijn eigen profiel. Het beeld van de groep komt daarna en is er alleen als een Admin het aanzet (`beheerpagina.md`, punt 6a) en de drempel is gehaald.
- **Dezelfde bouwstenen als de andere scans.** Resultaatkop, Totaalkaart met `.score-ring`, de pilvormige groep, de balklijst, de kaart met cirkel op Mijn metingen en de Toelichtingsmodal zijn dezelfde componenten (`stylesheet.md`). Wat hier anders is, staat hieronder.
- **Anonimiteit.** Een groepsweergave toont nooit een antwoord of profiel van één persoon (Anonimiteit).
- **Tekst.** Een veld heet "veld" of "spanningsveld", nooit "bouwblok". Getallen hebben een decimale komma en een min-teken is `−`, geen koppelteken.

## Veldkleuren

Zes kleuren, in de volgorde van de velden (`content-spanningsmeter.md`):

| # | Veld | Kleur |
|---|---|---|
| 1 | Verhaal & leiderschap | `--or` (`#ff671f`) |
| 2 | Governance, regie & control | `--bl` (`#225ba0`) |
| 3 | Mensen & gedrag | `--gr` (`#197f4e`) |
| 4 | Data | turquoise (`#1f9aa0`) |
| 5 | Processen | `--pu` (`#392944`) |
| 6 | Technologie | `--ye` (`#ffc043`) |

Tekst in of op een veldkleur is wit, behalve bij 6 waar het `--ink` is (zoals bij Fundament, `stylesheet.md`, Categoriekleuren). Een stip of rondje in geel krijgt de witte rand van 2px die alle stippen hebben. De kleuren staan in `stylesheet.md`, Veldkleuren Spanningsmeter. De veldkleur is een vulling en een accent, nooit de kleur van een score: Een score krijgt de scorekleur van zijn niveau (`stylesheet.md`, Scorekleuren).

## Het beeld (scherm 1)

Ontwerp: Bord Beeld. Het deel van de Spanningsmeter in de cirkel op scherm 1 is een radar met de band van de groep. De geometrie van de cirkel staat in `CLAUDE.md`, scherm 1. Specifiek voor dit deel:

- **Wedges.** Drie wedges van 24° in `--bl`, turquoise en `--ye` (`#225ba0`, `#1f9aa0`, `#ffc043`), met de opmaak van de andere radardelen (30% dekking, witte rand van 1,2px). Er zijn er bewust drie en geen zes: Zes velden in één deel oogt te druk, en de kleuren zijn een selectie van de velden, net zoals bij de AI-domeinen.
- **Lijn.** De oranje lijn van de cirkel loopt door dit deel, op de scherpe hoeken en met de vulling van 14% zoals in de andere delen. De lijn wordt niet voor dit deel aangepast.
- **Band.** Dit deel heeft als enige een band om de lijn: Een vlak van 0,75 punt onder en boven de lijn (`#ff671f`, 10% dekking, geen rand), met aan beide randen een streepjeslijn (`#ff671f`, 60%, 1,2px, patroon `4 3`). De band laat de spreiding van de groep zien.
- **Stip.** De stip van het gekozen deel volgt de regel van scherm 1 (op een hoekpunt van de lijn, het verst van de pil af).
- **Icoon.** Sleutel `gauge`: Een halve meter met een wijzer (`M6 19a8.5 8.5 0 1 1 12 0 M12 13l3.6-3.6`, lijndikte 1,75, met een gevuld punt op `M12 11.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z`), in de stijl van de andere Assessment-iconen (`stylesheet.md`, Assessment-icoon).

## Doorloopflow (scherm 5)

Ontwerp: Bord Vraag, het veld Verhaal & leiderschap. De doorloopflow is die van `CLAUDE.md`, scherm 5, met deze afwijkingen.

- **Nav.** "← Terug naar Mijn metingen" en "Mijn gegevens", zoals bij elke respondentscherm.
- **Sidebar** (300px): De naam van de respondent, de voortgangsbalk (8px) en "x van 30 vragen", en daaronder de zes velden zonder categoriekoppen. Per veld een rij met het nummer in een bolletje in de veldkleur, de naam en rechts de status ("n/5" bij bezig, een vinkje bij afgerond). Het actieve veld is gemarkeerd. De open vraag telt niet mee in "x van 30" en niet in "n/5".
- **Veldkop.** Een balk van 4px in de veldkleur links, de veldnaam (24px, gewicht 800) met een Info-icoon (`stylesheet.md`, Info-icoon) dat de Toelichtingsmodal opent (de `omschrijving`, de ijkpunten en de basis), en onder de naam de `omschrijving` (16px, `--ink-m`).
- **Instructievlak.** Een vlak in `--bg-mid` (10px radius, padding 20px 24px) met de instructieregel ("Beantwoord elke vraag vanuit wat jij zelf ziet in de organisatie. Kies een score van 1 tot 5 op de Spanningsmeter van dit veld. Kun je een vraag niet beoordelen, kies dan 0. Die vraag telt dan niet mee.", uit `Assessment.instructieregel`) en daaronder de kop "Spanningsmeter voor <veld>" met de vijf ijkpunten naast elkaar in witte kaarten (8px radius, padding 14px 16px, 12px ertussen). Elke kaart heeft boven elkaar een nummercirkel (22px, `--or-faint`, tekst `#c2570c`), de niveaunaam (14px, gewicht 700) en de tekst van het ijkpunt (14px, `--ink-m`). Tekst breekt binnen de kaart af en loopt nooit tegen de rand of een andere kaart.
- **Vraagkaart.** Per vraag een kaart (10px radius, 24px padding): Linksboven de ID als badge (12px, `--bg-mid`) en de invalshoek in 12px hoofdletters (`--ink-s`), daaronder de vraag (18px, regelhoogte 28px, gewicht 600, hoogstens 640px breed), rechts een Info-knop "Waar je op let". De knop klapt een vlak open (`--bg-mid`, 8px radius) met het label "WAAR JE OP LET" en de toelichting. Is er geen `aandachtspunt`, dan ontbreekt de knop.
- **Antwoordkeuze.** Vijf ronde knoppen met het cijfer 1 tot en met 5, elk met de niveaunaam eronder (100px breed, 12px ertussen). Een scheidingslijn van 1px en daarachter een aparte pilknop "0 · Kan ik niet beoordelen". Gekozen is massief oranje (`stylesheet.md`, Keuzepil en pilvormige groep). Onder de keuze staat een regel (14px, `--ink-m`) met de gekozen score en het ijkpunt van het veld, bijvoorbeeld "3 · Georganiseerd: Het verhaal is helder, maar blijft vooral communicatie." Bij 0 staat er "0 · Kan ik niet beoordelen: Deze vraag telt niet mee."
- **Open vraag.** Onder de vijf vragen een kaart met de ID (VL6), het label "VOORBEELD · NIET VERPLICHT", de vraag (18px, gewicht 600), een tekstvak (4 regels, `.field`) met als placeholder "Typ hier je voorbeeld", en een regel (14px, `--ink-s`): "Dit voorbeeld krijgt geen score. In de sessie bespreken we ook tegenvoorbeelden." Een veld is afgerond als de vijf vragen een antwoord hebben, ook als dat 0 is. De open vraag is nooit verplicht.
- **Onderaan.** "← Vorig veld" en "Volgend veld →" (48px hoog, 10px radius). Op het laatste veld wordt "Volgend veld →" de knop "Bekijk resultaten".
- **Intake.** De intake heeft één extra veld als `Assessment.rolgroepen` gevuld is: Rolgroep (keuzelijst, `content-spanningsmeter.md`, Achtergrondvragen), met in een Info-icoon de uitleg dat antwoorden in groepsweergaven anoniem blijven. Er is geen vraag naar een afdeling. Dit scherm is nog niet ontworpen.

## Mijn metingen

Ontwerp: Bord Lead (Lead die ook respondent is). De kaart volgt "Kaart met cirkel" in `visualisatie-mijn-metingen.md`, met deze afwijkingen.

- **Icoon en titel.** De Meting-kaart heeft het icoon `gauge` en de titel "Digitale Spanningsmeter". De regel eronder is "Meting oktober 2026, afgerond op 20 oktober 2026". Rolchips "Respondent" en "Lead" staan rechtsboven.
- **Cirkel.** De `.score-ring` van 156px toont het Gemiddeld niveau (`datamodel.md`, Scoreberekening). De vulling is `(niveau − 1) / 4`, de kleur de volle kleur van het afgeronde niveau, het getal staat erin in 36px, gewicht 800, met "NIVEAU" in 12px hoofdletters eronder (in plaats van "Totaalscore"). Daaronder de chip met de niveaunaam in de celkleur (24px hoog, "Georganiseerd").
- **Stip op de cirkel (Lead met eigen scan en zichtbare groep).** Het groepsgemiddelde staat ook op de ring, als stip van 14px met een witte rand van 2px (`--ink-m`), op de hoek `(gemiddelde − 1) / 4 × 360°` vanaf boven met de klok mee, zoals in `visualisatie-mijn-metingen.md`, Stip op de cirkel. De stip heeft geen eigen uitleg links: De legenda rechts ("Gemiddelde van de groep") geldt ook voor hem. Onder de drempel, bij een Respondent zonder Resultaten en bij een Lead zonder eigen scan is er geen stip.
- **Groep (alleen Lead met Resultaten aan).** Onder een lijn van 1px "GROEP, 12 SCANS" (12px, hoofdletters) en daaronder "3,1 Georganiseerd" (14px, het getal vet). Met de stip van het groepsgemiddelde op de cirkel (volgende punt).
- **Rijen.** Eén rij per spanningsveld (40px hoog), in de volgorde van de velden. Links een nummerbolletje (22px, veldkleur) en de korte naam (190px breed, 14px, `--ink-m`), dan het spoor van 1 tot 5, rechts twee getalkolommen van 44px: Jij (14px, vet) en Groep (14px, `--ink-m`). Boven de rijen het label "PER SPANNINGSVELD" met de kolomkoppen "Jij" en "Groep". Jij is een balk van 8px in de veldkleur. Groep is een stip van 14px in de veldkleur met een witte rand van 2px op het gemiddelde, en een lijn van 2px (`#b3b0a8`) van de laagste tot de hoogste score van een afgeronde scan in dat veld. Onder de laatste rij de ankers "1" en "5".
- **Legenda.** Alleen bij een Lead met zichtbare groep: "Jouw score" (balk), "Gemiddelde van de groep" (stip) en "Laagste tot hoogste score" (lijn).
- **Grootste spanning.** Onder de legenda één regel (14px, `--ink-m`): "Grootste spanning: Technologie loopt 1,8 voor op Mensen & gedrag." met "Grootste spanning:" vet in `#6b3a00`. Bij een Lead zonder eigen scan gaat de regel over de groep. Bij een Respondent zonder Resultaten en bij een groep onder de drempel is er geen regel over de groep.
- **Respons, knoppen, drempel.** Zoals in `visualisatie-mijn-metingen.md`, met de knoppen "Bekijk jouw resultaten", "Resultaten hele meting" en "Respondenten uitnodigen". Onder `benchmarkMinRespondenten` toont het paneel alleen de eigen balken.
- **Over deze scan.** De link op de Meting-kaart heet "Over deze scan: spanningsvelden en visie" en gaat naar de Assessment-pagina (`CLAUDE.md`, scherm 2).

## Resultaat

Ontwerp: Bord Rapport (groep) en bord Profiel (respondent). Eén pagina in twee weergaven.

### Kop en schakelaar

De Resultaatkop is die van `stylesheet.md`, Resultaatkop: Eyebrow ("JOUW RESULTAAT" bij een respondent, "RESULTAAT VAN DE METING" bij een groep), `.page-title` "Digitale Spanningsmeter" en de subregel (14px, `--ink-s`). Bij een respondent "Joost · Meting oktober 2026 · afgerond op 20 oktober 2026", bij een groep "Meting oktober 2026 · Bedrijf A · Gemiddelde van 12 afgeronde scans". De navigatie is die van de respondentkant (scherm 6) of van een Meting in beheer (`beheerpagina.md`).

Onder de kop staat de schakelaar Jouw profiel | Groep als pilvormige groep (`stylesheet.md`, Keuzepil en pilvormige groep: 34px, gekozen massief `--or`). Hij staat alleen waar beide weergaven er zijn: Bij een Lead met eigen scan en zichtbare groep. Een respondent zonder groepsweergave ziet geen schakelaar en alleen Jouw profiel. Een Lead zonder eigen scan ziet alleen Groep.

### Totaalkaart (Ring)

Dezelfde kaart als bij de andere scans (`stylesheet.md`, Resultaatkop): De `.score-ring` van 128px met het Gemiddeld niveau erin (32px, "NIVEAU" in 12px eronder), rechts de chip met de niveaunaam (28px hoog, in de celkleur), de betekenis van het niveau uit het boek (14px, `--ink-m`) en de feiten (14px, `--ink-s`): Bij een respondent "30 van 30 vragen beantwoord", bij een groep "Gemiddelde van 12 afgeronde scans", daaronder "Gemiddelde van de zes velden. De Spanningsmeter kent geen totaalscore." De ring is een weergave (Uitgangspunten) en de tekst zegt dat ook.

### Twee kaarten met de belangrijkste spanning

Twee kaarten naast elkaar (24px ertussen, 10px radius, padding 24px) met een label in 12px hoofdletters (`--ink-s`), een titel (18px, gewicht 700) en een tekst (14px, `--ink-m`).

- **Groep**: "Meest uiteenlopend" (Mensen & gedrag, scores van 1,4 tot 4,0) en "Grootste spanning" (Technologie loopt voor op Processen, 3,9 tegen 2,5, een verschil van 1,4).
- **Respondent**: "Grootste spanning" (Technologie loopt 1,8 voor op Mensen & gedrag, 4,0 tegen 2,2) en "Daarna" (het groepsbeeld volgt in de sessie, jouw antwoorden blijven anoniem).

De titels en teksten komen uit de berekening. Is er geen grootste spanning (minder dan twee velden met een score), dan staat de kaart er niet.

### Radar en score per veld, naast elkaar

Twee kaarten naast elkaar op één rij (24px ertussen): Links "Spanningsprofiel" (de radar, 460px breed), rechts "Score per veld" (de rest van de breedte). Onder 1000px schermbreedte staan ze onder elkaar.

**Radar.** Een zeshoek met zes wedges van 60° in de veldkleur (12% dekking, witte rand van 1px), vier hulpcirkels op 2, 3, 4 en 5 en zes assen. De score loopt van 1 in het midden (straal 20 van de 250) tot 5 aan de rand. Op elke as staat buiten de radar een knooppunt: een cirkel van 28px in de veldkleur met het nummer van het veld erin (14px, gewicht 700, bij veld 6 `--ink`). De namen staan niet in de radar maar in de rij rechts.
- **Respondent**: De eigen lijn (`--or`, 2,5px, scherpe hoeken) met een vulling van 14% en op elk hoekpunt een stip van 9px met een witte rand van 2px.
- **Groep**: Een band van de laagste tot de hoogste score per veld (`--or`, 12% dekking, `evenodd`) en de lijn van het groepsgemiddelde (`--or`, 2,5px, geen vulling) met stippen.
- **Grootste spanning**: Een ring van 2px in `#c2570c` om het hoekpunt van het veld met de grootste spanning.
- **Legenda** onder de radar (12px, `--ink-m`): Bij een groep "Gemiddelde van de groep" (lijn), "Laagste tot hoogste score in de groep" (vlak) en "Grootste spanning" (ring), bij een respondent "Jouw profiel" en "Grootste spanning".

**Score per veld.** Een tabel met de kolommen Veld (190px), "Schaal 1 tot 5" (de rest), "Jouw score" of "Gemiddelde" (170px) en Spanning (64px, rechts uitgelijnd). Per veld een rij (padding 8px, 8px radius) met het nummerbolletje (22px) en de naam, bij een groep daaronder "n van 12 beoordeeld" in 12px `--ink-s` als minder scans het veld beoordeelden. Het spoor is een balk van 8px in de veldkleur (respondent) of een stip van 14px met de laagste tot hoogste score als lijn van 2px (`#b3b0a8`, groep). De chip in de derde kolom toont de score en het niveau ("3,8 · Geïntegreerd") in de celkleur van het niveau (`stylesheet.md`, Drie niveaus van scorekleur). De spanning staat in 14px, vet: Positief in `--bl`, negatief in `#c2570c`, het eerste veld "–". De grootste spanning staat in een pil met een rand van 2px in `#c2570c`. Onder de tabel een regel (12px, `--ink-s`) met die pil en de uitleg "Grootste spanning. Het verschil met het laagste veld dat eerder in de volgorde staat. Positief is voorlopen op het fundament."

**Hover en focus tussen radar en tabel (voorstel, naar het patroon van `stylesheet.md`, Radar en staafdiagram op het resultaatscherm).** De radar en de tabel lichten elkaar op, in beide richtingen. Hover of focus op een wedge of een knooppunt: De wedge gaat naar 34% dekking (de andere naar 6%), het knooppunt wordt 4px groter en krijgt een donkere rand (2px, `--ink`), en de rij van het veld krijgt de achtergrond `--or-faint` (overgang 200 ms). Hover op een rij: Dezelfde wedge en hetzelfde knooppunt lichten op. Wedges en knooppunten zijn met Tab bereikbaar en hebben een `aria-label` zoals "3, Mensen en gedrag, 2,2, Gefragmenteerd".

### Gemiddelde per rol (alleen groep)

Een kaart met de kop "Gemiddelde per rol" en rechts de regel "Een rol met minder dan 3 deelnemers staat niet in de tabel, zodat antwoorden anoniem blijven." (12px, `--ink-s`; het getal is `Instellingen.spanningMinPerRol`). Een matrix met links de velden (220px, nummerbolletje en naam), per zichtbare rolgroep een kolom met de naam en "n deelnemers" erboven, en rechts een kolom Verschil (110px). Een cel is 40px hoog, 6px radius, met het gemiddelde in de celkleur van het niveau (`stylesheet.md`, Drie niveaus van scorekleur). Het grootste Verschil staat in `#c2570c`, gewicht 800. De kolomkoppen volgen `stylesheet.md`, Kolomkop en rijkop. Bij minder dan twee zichtbare rolgroepen staat de kaart er niet.

### Voorbeelden uit de groep (alleen groep)

Een kaart "Voorbeelden uit de groep" met twee kaartjes naast elkaar (achtergrond `--bg-warm`, 8px radius, padding 16px 20px): Een label (12px, hoofdletters, `--ink-s`) zoals "Direct met klanten · Mensen & gedrag" en de tekst (14px, `--ink`). Het zijn antwoorden op de open vraag (`ScanInvulling.opmerkingenPerBouwblok`), zonder naam, zonder afdeling en zonder score, bij het veld waar ze bij horen. Onder de kaarten staat "Voorbeelden zijn anoniem en staan bij het veld waar ze bij horen. Ze krijgen geen score." Een voorbeeld verschijnt alleen als de rolgroep boven de drempel zit en de tekst door de Consultant of Admin is vrijgegeven (Open punten).

### De vijf niveaus

Een kaart met de kop "De vijf niveaus" en vijf kolommen: Een rondje van 22px in de volle scorekleur met het nummer 1 tot en met 5 erin (12px, gewicht 700, wit, bij 3 `--ink`), de niveaunaam (14px, vet), de grenzen (12px, `--ink-s`: Onder 1,5, 1,5 tot en met 2,49, 2,5 tot en met 3,49, 3,5 tot en met 4,49, vanaf 4,5) en de betekenis uit het boek (14px, `--ink-m`).

## Anonimiteit

- Een groepsweergave toont nooit het antwoord, de score of het profiel van één persoon. Een rol met minder afgeronde scans dan `spanningMinPerRol` is niet te zien, ook niet in de gemiddelden of in "n deelnemers".
- De groepsweergave voor een Lead volgt `benchmarkMinRespondenten` (`datamodel.md`, Instellingen). Eronder toont het scherm geen gemiddelde, geen laagste en hoogste score, geen uitsplitsing per rol en geen voorbeelden.
- De open voorbeelden kunnen een persoon verraden. Daarom worden ze alleen getoond na vrijgave (Open punten).

## Landingspagina en film Wat krijg ik

Ontwerp: Bord Landing. De pagina volgt `CLAUDE.md`, scherm 2: De kop (icoon `gauge` in een witte cirkel van 56px en de titel in 48px), de sticky sub-nav en de secties, in deze volgorde: "De 6 spanningsvelden", "Praktisch", "Wat krijg ik" en "Visie", met achtergronden die wisselen beginnend met wit.

- **De 6 spanningsvelden.** Kop "De 6 spanningsvelden", een inleiding ("Elk veld heeft vijf vragen met een eigen schaal van 1 tot 5. Klik op een veld voor de uitleg.") en zes kaarten in drie kolommen (10px radius, padding 20px 24px, 24px ertussen). Elke kaart is een knop met het nummer in een bolletje in de veldkleur (28px), de naam (16px, gewicht 700) en de `omschrijving` (14px, `--ink-m`). Een klik opent de Toelichtingsmodal van het veld (de `omschrijving`, de ijkpunten en de basis). Er is geen interactief overzicht met een radar (anders dan bij `bouwstenenmodel-visual.md`).
- **Praktisch.** Kop "Wat je kunt verwachten", als inleiding "Bedoeld voor ..." (de doelgroep van het Assessment), drie kaarten (invultijd "±10 tot 15 minuten voor 30 vragen", direct resultaat "je eigen profiel, het groepsbeeld volgt als de resultaten zijn opengezet", privacy "antwoorden in groepsweergaven zijn anoniem") en de rij met de uitgeschakelde knop "Start assessment", het Info-icoon en de toelichting over de persoonlijke link, zoals bij de andere Assessments.
- **Visie.** Een korte inleiding en drie kaarten met "Lees verder" dat de volledige tekst op dezelfde pagina uitklapt. De teksten zijn voorstel en komen niet uit de bron: "Zes velden naast elkaar" (verhaal, regie, gedrag, data, processen en technologie krijgen elk een score op dezelfde schaal), "Spanning is een verschil" (loopt het ene veld ver voor op het andere, dan ontstaat wrijving en dat verschil wordt gemeten) en "Eerst jij, dan de groep" (eerst het eigen profiel, daarna het beeld van de groep, met ruimte voor verschillen in kijk). De definitieve tekst volgt uit het boek (Open punten).
- **Wat krijg ik.** Kop "Zo ziet je resultaat eruit", een inleiding ("Je krijgt direct je eigen Spanningsprofiel. Daarna leggen we de profielen van de groep naast elkaar. Alle cijfers hieronder zijn voorbeelddata.") en de film in een kaart met drie stapkaarten en daaronder de knop "Bekijk de voorbeeld-output" (naar scherm 3, de weergave Groep van het resultaat met demodata). Een tweede film "Het dossier, de radar voor de Lead" ontbreekt: Het Dossier is er niet voor dit Assessment (`backlog.md`).

**Film Wat krijg ik, variant Spanningsmeter** (voorstel, naar het patroon van `help.md`, Films, Varianten van Wat krijg ik). Drie stapkaarten naast elkaar (witte kaart, 1px `--border`, 10px radius, padding 24px, 24px ertussen) op een vlak in `--bg-warm`. Elke kaart heeft een nummerbolletje (24px, `--or`, wit), een titel (16px, gewicht 700), een beeld (200px hoog, `--bg-warm`) en een regel (14px, `--ink-m`). Het geheel loopt in een lus van 9 seconden, met CSS (`@keyframes`) en zonder script. Is "verminderde beweging" aan, dan staan de beelden stil in hun eindstand.

1. **Je beoordeelt zes velden.** Zes rijen met een nummerbolletje in de veldkleur en een balk met stip. Na elkaar (0,35s vertraging per rij) vult elke balk van 0 tot de score van dat veld (14% van de lus), blijft staan en loopt aan het eind terug. Regel: "Per veld vijf vragen op een schaal van 1 tot 5. Kun je een vraag niet beoordelen, dan kies je 0."
2. **Je profiel verschijnt.** De radar met wedges en hulpcirkels, daarop de eigen lijn met stippen die vanuit het midden uitgroeit (schaal 0 naar 1, daarna staan, daarna weg). Regel: "Je krijgt een score en een niveau per veld, van Reactief tot Adaptief. Meteen na afronden."
3. **De spanning wordt zichtbaar.** Dezelfde radar met de band en de lijn van het groepsgemiddelde die invagen (opacity), daarna een ring van `#c2570c` om het hoekpunt van de grootste spanning die inzoomt en pulseert, en een chip linksonder ("Technologie +1,4 op Processen"). Regel: "Het groepsbeeld toont het gemiddelde, de spreiding en de grootste spanning. Antwoorden blijven anoniem."

Alle cijfers in de film zijn voorbeelddata (de fictieve deelnemer en groep uit `datamodel.md`, Scoreberekening).

## Toegankelijkheid

- De radar heeft een tekstalternatief met de zes velden en scores ("Spanningsprofiel: Verhaal 3,8, Regie 2,6, Gedrag 2,2, Data 3,4, Processen 2,4, Technologie 4,0"). De tabel Score per veld is dezelfde informatie in tekst.
- Kleur is nooit de enige drager: Niveau, score en spanning staan als tekst en getal, en de grootste spanning heeft een ring én een pil.
- De ring heeft een tekstalternatief ("Gemiddeld niveau 3,1, Georganiseerd").
- De antwoordknoppen zijn een keuzegroep met `aria-pressed`, bereikbaar met Tab en bedienbaar met pijltoetsen. De Info-knop bij een vraag heeft `aria-expanded`.
- Een tekst op een veldkleur voldoet aan het contrast (`--ink` op geel).

## Open punten

1. **Intake.** De intake met Rolgroep is niet ontworpen. Vraag: Verplicht of niet.
2. **Vrijgave van open voorbeelden.** Wie geeft voorbeelden vrij voor de groepsweergave, en hoe? Zonder vrijgave staat de kaart er niet.
3. **Gemiddeld niveau in de ring.** De ring en de rij "Groep" tonen een gemiddelde van de zes veldscores. Dat is een nieuw getal dat de bron niet kent. Alternatief: De ring toont de grootste spanning, of de kaart heeft geen ring. De ring is gekozen voor uniformiteit met de andere scans.
4. **Validatie zichtbaar.** Zolang de vragen niet getest zijn (`content-spanningsmeter.md`, Validatie), kan het resultaat een label "pilot" of een korte vermelding krijgen. Niet besloten.
5. **Teksten.** De drie kaarten van de Visie, de omschrijvingen op de Landingspagina en de teksten van de film zijn voor nu akkoord en moeten nog geverifieerd worden.
6. **Veldnamen.** De drie veldnamen met een ampersand ("Verhaal & leiderschap", "Governance, regie & control", "Mensen & gedrag") staan zo in de bron. In koppen en tooltips staat de volledige naam, in rijen en op de radar de korte naam of het nummer.

## Zo gebouwd

Gebouwd op 21 oktober 2026. De onderdelen en de plek in de code:

- **Rekenen.** `lib/spanning.ts` (veldscore, niveau, spanning, grootste spanning, gemiddeld niveau, groep, rolgroepen, `groepZichtbaar`) met `lib/spanning.test.ts`, waarin het rekenvoorbeeld uit `datamodel.md` staat. `lib/spanning-radar.ts` is de meetkunde van de radar.
- **Doorloopflow.** `components/spanning/SpanningVeldForm.tsx`, `Antwoordkeuze.tsx`, `SpanningSidebar.tsx` en `VeldToelichting.tsx` (de Toelichtingsmodal met omschrijving, ijkpunten en basis, `ToelichtingModal` heeft daarvoor `ijkpunten` en `basis`). De hoofdkolom van de flow is bij dit type breder (`.flow-main--spanning`, 1000px) omdat de antwoordkeuze zes keuzes naast elkaar heeft.
- **Resultaat.** `components/spanning/SpanningResultaat.tsx` voor Jouw profiel en Groep, aangeroepen door `ResultsView` (één scan), de resultatenpagina van een respondent (met schakelaar voor een Lead), de Lead-pagina van een Meting, de Rapportage in beheer en de voorbeeld-output.
- **Mijn metingen.** De bestaande Kaart met cirkel (`CirkelPaneel`) met een teaser van dit type (`spanningTeaser` in `lib/mijn-metingen.ts`).
- **Cirkel, Assessment-pagina en film.** `lib/assessmentcirkel.ts` (vijf delen), `components/assessment/SpanningVeldenSectie.tsx`, `SpanningVisieSectie.tsx` en `components/spanning/SpanningFilm.tsx` (de film heeft een eigen opbouw met drie stapkaarten met elk een beeld, geen podium met stappen eronder).
- **Overig.** De instelling `spanningMinPerRol` (Drempels en termijnen), `heeftEigenResultaat` (`lib/assessment-structuur.ts`) houdt dit type uit export, benchmark, Verkennen en de samengestelde Meting, en de help is bijgewerkt.

**Afwijkingen en interpretaties (te beoordelen door Joost):**

- **Niveaurondjes.** De tekst in het rondje van niveau 3 én 4 is `--ink` (de spec noemt alleen 3). Dat volgt de regel in `stylesheet.md`, Scorekleuren, dat tekst op geel en lichtgroen `--ink` is.
- **Veldkleur 4 (turkoois).** Witte tekst, zoals de spec bij Veldkleuren zegt (bij de AI-domeinen is dezelfde kleur `--ink`).
- **Rolgroep** staat niet verplicht in de intake (open punt 1), met "Kies een rolgroep" als lege keuze. Een scan zonder rolgroep telt mee in de groep maar staat in geen rol.
- **Voorbeelden uit de groep** zijn niet gebouwd: De vrijgave is niet besloten (open punt 2), en zonder vrijgave staat de kaart er niet.
- **Hover.** De wedges, knooppunten en rijen lichten elkaar op in beide richtingen. De tooltip van de radar is de eigen naam in een `title` (de spec noemt geen opmaak ervoor), en de knooppunten zijn met Tab bereikbaar maar geen knoppen.
- **Namen.** In kaarten met een kop staat de volledige veldnaam, in rijen en tabellen de korte naam (open punt 6). De zin over de grootste spanning noemt beide volledige namen.
- **Ring.** De vulling is `(gemiddeld niveau − 1) / 4`, zoals bij de andere scans, en de feiten zeggen "30 van 30 vragen beantwoord" (een 0 telt als beantwoord).
- **Demodata.** De groep van de voorbeeld-output en de film heeft per rol verschillende scores (bijvoorbeeld Verhaal 3,0, 3,6 en 4,6), zodat de uitsplitsing per rol iets laat zien. De groepsgemiddelden, de spreiding en de spanningen zijn die van het rekenvoorbeeld.
- **Lead.** Een Lead ziet de groep pas vanaf `benchmarkMinRespondenten` afgeronde scans (daaronder een melding, of alleen het eigen profiel). De vinkjes Spreiding, Antwoorden, Exporteren en benchmark zijn voor dit type grijs in het Leads-venster, want die weergaven bestaan er niet.
- **Beheer.** De Rapportage van een Meting toont de weergave Groep zonder de schakelaars van de andere scans. Bij de content van het Assessment zijn de open vraag en de rolgroepen te bewerken en staat de weging niet; ijkpunten, invalshoeken, "Waar je op let" en korte namen zijn nog niet in beheer te bewerken (`backlog.md`).
- **Testknop.** De tijdelijke testknop van de doorloopflow ("Vul alle vragen automatisch in") staat ook bij dit type en vult scores van 2 tot 4.
- **Film.** De lus is 9 seconden, de chip is "Technologie +1,4 op Processen" uit dezelfde demodata, en de feature-kaarten (Volledig beeld, Direct inzicht, Concreet en toepasbaar) staan voor dit type niet op de pagina omdat het ontwerp er geen plek voor heeft.
