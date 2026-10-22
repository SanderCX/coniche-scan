# Schermen

De schermen van de Coniche Scan-app aan de respondent- en leadkant, met de navigatie die ze delen. Elk scherm heeft een naam; andere specs verwijzen met die naam. De beheerschermen staan in `beheerpagina.md`.

| Scherm | Voor wie | Toegang |
|---|---|---|
| Kies jouw assessment | Iedereen | Publiek |
| Assessment-pagina | Iedereen; met een persoonlijke link ook de Respondent en de Lead | Publiek |
| Voorbeeld-output | Iedereen | Publiek |
| Toegang | Respondent en Lead zonder link bij de hand | Publiek |
| Mijn metingen | Respondent en Lead | Persoonlijke link |
| Intake | Respondent | Persoonlijke link |
| Doorloopflow | Respondent | Persoonlijke link |
| Resultatenpagina | Respondent en Lead | Persoonlijke link |
| Mijn gegevens-menu | Respondent en Lead | Onderdeel van de nav |

## Globale layout

Eén gedeelde navigatiebalk en footer op elk scherm, als één component, vormgegeven volgens `stylesheet.md`. Alle schermen gebruiken de tokens uit `stylesheet.md`. De nav bevat geen links naar content (Visie, Bouwblokken, AI, 2030): Die staat op de Assessment-pagina, bij het Assessment waar ze bij hoort.

De nav heeft een vast deel links (het logo) en een contextueel deel rechts (`.nav-right`) met acties voor het scherm waar je bent. De volgorde binnen `.nav-right` is overal gelijk:

1. **Scherm-specifieke acties**, uiterst links, indien aanwezig. Voorbeelden: "Naar resultaten →" op de Doorloopflow zodra de scan afgerond is; "← Terug naar de scan" samen met "Exporteren" op de Resultatenpagina, zonder scheidingslijn tussen die twee; in beheer "Assessments", "Organisaties" en "Resultaten" voor een Admin en "Organisaties" en "Resultaten" voor een Consultant ("Instellingen" staat in het Accountmenu, `beheerpagina.md`, Wat beheerbaar is). Een terug- en een vooruit-actie staan beide hier, uiterst links, ongeacht de richting.
2. **Scheidingslijn**, alleen als punt 1 iets bevat en er rechts ervan nog iets staat (punt 3 of 5).
3. **Exit-actie**: De link om de sectie te verlaten, met een `←` ervoor (bijvoorbeeld "← Terug naar Mijn metingen" op de Doorloopflow, de Resultatenpagina en de Assessment-pagina met een persoonlijke link). Op de Assessment-pagina staat deze link alleen bij een herkende gebruiker; zonder sessie staat er alleen "Inloggen" en gaat terug via het logo. Beheer heeft geen exit-actie: Uitloggen in het Accountmenu is de enige manier om beheer te verlaten.
4. **Scheidingslijn**, alleen als punt 5 iets bevat.
5. **Identiteitsmenu**, helemaal uiterst rechts, voorbij de exit-actie: Het Accountmenu (`beheerpagina.md`) aan de beheerkant, het Mijn gegevens-menu (zie Mijn gegevens-menu) aan de respondentkant. Op elk scherm zonder ingelogde of herkende gebruiker (Kies jouw assessment, de andere publieke schermen en de Assessment-pagina zonder sessie) staat hier "Inloggen": De uitgelogde variant van hetzelfde slot, zonder dropdown en zonder pijltje. Het slot is dus nooit leeg. Een account- of profielmenu staat altijd als allerlaatste element in de nav, niet ervoor.

**Geen scheidingslijn zonder inhoud aan beide kanten.** Op Mijn metingen staat bijvoorbeeld alleen het Mijn gegevens-menu, zonder scheidingslijn: Er is op dat scherm geen scherm-specifieke actie (punt 1) en geen exit-actie (punt 3).

**"Terug naar" is niet automatisch de exit-actie.** Op de Resultatenpagina is "Terug naar de scan" een scherm-specifieke actie (punt 1, je blijft binnen dezelfde scan) en "Terug naar Mijn metingen" de exit-actie (punt 3, je verlaat de scan). Beide staan er naast elkaar.

**Logo, contextafhankelijk.** Op de publieke schermen (Kies jouw assessment, Assessment-pagina zonder sessie, Voorbeeld-output) gaat het logo naar `#/`. Zodra een Respondent binnen zijn persoonlijke link zit (Intake, Doorloopflow, Resultatenpagina, Mijn metingen en de Assessment-pagina met een persoonlijke link), gaat het logo naar Mijn metingen.


## Kies jouw assessment

Het eerste scherm van de publieke kant. Eén cirkel is verdeeld in vijf gelijke delen en elk deel is een Assessment. Een klik op een deel zet dat Assessment naast de cirkel in detail. Bouw naar het blok De cirkel hieronder: Het is de volledige beschrijving van de geometrie.

**`.nav-right`**: "Inloggen" in het slot van het identiteitsmenu (Globale layout, punt 5) gaat naar Toegang, voor een Respondent of Lead die al een account heeft maar zijn persoonlijke link niet bij de hand heeft. Er is geen scherm-specifieke actie (punt 1 leeg), dus geen scheidingslijn ervoor.

- **Opbouw van de pagina**: Onder de nav, met de container van de pagina (Layout, Container): De eyebrow "Coniche Scan" (12px, hoofdletters, `--or`), de titel "Kies jouw assessment" (h1) en een inleiding van twee zinnen (18px, regelhoogte 28px, `--ink-m`, hoogstens 640px breed). De inleiding: "Coniche Scan laat zien hoe volwassen jouw klantcontact is en waar de grootste kansen liggen. Je collega's vullen een korte vragenlijst in, jij krijgt een radar met concrete vervolgstappen." Daaronder, op 40px, twee kolommen: Links de cirkel (568px, zie **De cirkel** hieronder), rechts het detailpaneel (de rest van de breedte), 56px ertussen en verticaal gecentreerd ten opzichte van elkaar.
- **De cirkel** (alle maten voor een cirkel van 568px breed en hoog, viewBox 568 × 568 met het middelpunt op 284/284; op een andere breedte schalen ze mee. Hoeken zijn in graden vanaf 12 uur met de klok mee):
  - **Delen en volgorde (variant E2).** Vijf delen van 72° met de klok mee vanaf links: Klantcontact Volwassenheid (middenlijn 270°), Zorg (342°), AI-Volwassenheid (54°), Quickscan (126°) en Spanningsmeter (198°). Een deel loopt 36° naar weerszijden van zijn middenlijn. De plek is vast per Assessment en volgt dus niet de volgorde van de Assessments in de data. De Volwassenheid-delen liggen links bij elkaar en de Quickscan breekt met zijn bogen de rechterhelft.
  - **Achtergrond en randen.** Elk deel is een taartpunt tot straal 284px in `#faf8f5`. Rond elk deel loopt een witte rand van 8px (afgeronde hoeken), zodat de delen los van elkaar liggen.
  - **Midden.** Een witte cirkel van 80px met een lichte schaduw (`0 2px 12px rgba(28,28,26,.12)`) boven de delen, met daarin het favicon van Coniche (`afbeeldingen/coniche-icoon.svg`, 46px). Het midden reageert niet op de muis.
  - **Kleuren per deel.** Elk deel met een radar heeft precies drie gekleurde wedges van 24° tot straal 262px, met 30% dekking en een witte rand van 1,2px, met de klok mee binnen het deel. Het is een selectie van de kleuren van het Assessment en niet alle categorieën of alle domeinen. Klantcontact Volwassenheid en Zorg: `#ff671f` (Overkoepelend), `#225ba0` (Organisatie), `#197f4e` (Mens). AI-Volwassenheid: `#ff671f`, `#1f9aa0`, `#d1467f` (domeinen). Spanningsmeter: `#225ba0`, `#1f9aa0`, `#ffc043`.
  - **Hulpcirkels en schaal.** Per deel lopen vier witte bogen (75% dekking, 1,2px) over de 72° van het deel, op de scores 2, 3, 4 en 5. De straal volgt één schaal: Straal = 48 + (score − 1) × 50 px. Dat geeft score 2 = 98px, 2,5 = 123px, 3 = 148px, 3,5 = 173px, 3,9 = 193px, 4 = 198px en 5 = 248px. Het midden (score 1, 48px) blijft vrij.
  - **De lijn.** Eén oranje lijn (`#ff671f`, 2,5px, scherpe hoeken met `stroke-linejoin: miter`, geen afronding, geen tweede of dikkere lijn) loopt in één stuk door de vier delen met een radar, met een vulling van `#ff671f` met 14% dekking (een vlak van het middelpunt naar de hoekpunten van het deel). Een echte meting heeft pieken en dalen, en daarom liggen alle hoekpunten tussen score 2,5 en 3,9: Een dal gaat nooit onder 2,5 (123px) en een piek komt niet boven 3,9 (193px), dus nooit op of tegen de hulpcirkels van 4 en 5. De lijn heeft **13 hoekpunten, 24° van elkaar**, van 162° tot en met 90° (450°) met de klok mee. Dalen liggen op de grenzen tussen de delen en pieken binnen een deel. Een deel tekent zijn eigen vier hoekpunten, waarvan de eerste en de laatste gedeeld zijn met het buurdeel, zodat de lijn precies aansluit. In de Quickscan loopt de lijn niet door. In de delen die niet gekozen zijn, dimt het hele deel naar 38% dekking en daarmee ook de lijn.
    Hoekpunten (nummer: Hoek, score, straal): 1: 162°, 2,6, 128px. 2: 186°, 3,7, 183px. 3: 210°, 2,9, 143px. 4: 234°, 2,5, 123px. 5: 258°, 3,3, 163px. 6: 282°, 3,9, 193px. 7: 306°, 2,7, 133px. 8: 330°, 2,8, 138px. 9: 354°, 3,6, 178px. 10: 18°, 2,5, 123px. 11: 42°, 3,8, 188px. 12: 66°, 3,0, 148px. 13: 90°, 2,6, 128px.
    Per deel: Spanningsmeter hoekpunt 1 tot en met 4 (162° tot 234°, drie wedges van 24°). Klantcontact Volwassenheid 4 tot en met 7 (234° tot 306°). Zorg 7 tot en met 10 (306° tot 18°). AI-Volwassenheid 10 tot en met 13 (18° tot 90°). De grenzen (hoekpunt 1, 4, 7, 10 en 13) zijn allemaal dalen. Een dal ligt dus op de grens tussen twee delen en nooit op een piek.
  - **Band van de Spanningsmeter.** Alleen het deel van de Spanningsmeter heeft een band die de spreiding van de groep laat zien: 0,75 punt onder en boven de lijn (straal volgens de schaal, op dezelfde hoeken), `#ff671f` met 10% dekking. De rand van de band is één dunne grijze lijn (`#a3a19b`, 1px, doorgetrokken, gesloten) en geen oranje streepjesranden. De lijn zelf blijft oranje. Andere delen hebben geen band.
  - **Quickscan.** Geen radar maar vier concentrische bogen over 56° (de middenlijn plus en min 28°), met straal 56, 90, 124 en 158px, 14px dik en ronde uiteinden. Baan `#e9e6df`, gekleurd deel 84%, 62%, 48% en 71% van de 56° in `#22a06b`, `#e8871e`, `#dc2626` en `#e8871e` (de kleuren van de Quickscan-klassen, grenzen 50% en 80%).
  - **Label per deel.** Een witte pil (94% dekking, afronding 14px, padding 10px 14px, lichte schaduw) langs de middenlijn van het deel, op 235px van het middelpunt (Zorg 240px; Quickscan 200px) en bij Klantcontact Volwassenheid 16px lager, zodat de pil de stip niet raakt, met het Assessment-icoon (30px, `#ff671f`) en de korte naam in twee regels (14px, regelhoogte 18px, gewicht 700): "Klantcontact / Volwassenheid" (icoon `target`), "Volwassenheid / Zorg" (`heart`), "AI-Volwassenheid / in Klantcontact" (`sparkle`), "Quickscan / Ziekenhuis" (`cross`) en "Spanningsmeter" op één regel (`gauge`, `visualisatie-spanningsmeter.md`, Het beeld). De pil wordt niet afgeknipt en reageert niet op de muis.
  - **Gedrag.** Zonder selectie staat rechts "Vijf assessments in één cirkel. Klik op een deel voor de details." (kop 24px, gewicht 800). Bij hover wordt een deel 2,5% groter (0,35s). Een klik kiest het deel: Het schuift 10px naar buiten langs zijn middenlijn, wordt 2% groter en krijgt een schaduw (`0 10px 30px rgba(28,28,26,.18)`), de andere vier gaan naar 38% dekking en er verschijnt een stip. Rechts verschijnt het detailpaneel met een zachte overgang (0,4s, 6px omhoog). Een tweede klik op het gekozen deel heft de keuze op: Het deel schuift terug, de andere delen krijgen hun dekking terug, de stip verdwijnt en rechts staat weer de tekst van het begin ("Vijf assessments in één cirkel. Klik op een deel voor de details."), met een zachte overgang van 0,4s. Een klik op een ander deel wisselt de keuze direct. Er is steeds precies één deel gekozen of geen, en Escape heft de keuze ook op. De delen zijn bedienbaar met toetsenbord en schermlezer (een keuzegroep met vijf opties, pijltoetsen wisselen, de naam van het Assessment is de label).
  - **De stip.** Een oranje stip van 18px met een witte rand van 3px op het gekozen deel, met een gloed die hem laat oplichten: Een vaste gloed van oranje licht rondom (`0 0 12px 3px rgba(255,103,31,.55)`) en daarbovenop een pulse, een ring die in 1,8s tot 16px groeit en vervaagt. De gloed is oranje en niet grijs of beige. Het midden van de stip ligt precies op een hoekpunt van de lijn, en wel de hoogste van de twee binnenste hoekpunten van het deel: Spanningsmeter hoekpunt 2, Klantcontact Volwassenheid hoekpunt 6, Zorg hoekpunt 9 en AI-Volwassenheid hoekpunt 12. **De stip staat nooit in of tegen een label**: Hij ligt minstens 8px buiten de pil (ongeveer 210 × 56px). Valt de hoogste piek van het deel onder de pil, dan neemt de stip de andere binnenste hoekpunt (bij AI-Volwassenheid is dat hoekpunt 12 in plaats van 11). Bij de Quickscan staat hij in het midden van de rode boog (straal 124px, halverwege het gekleurde deel). Hij laat zien waar je op de visual kijkt. Als er later gemiddelde scores van de branche zijn, kan de stip daar het gemiddelde ten opzichte van de eigen score tonen (`backlog.md`).
- **Detailpaneel**: Van boven naar beneden: De titel van het Assessment (24px, regelhoogte 28px, gewicht 800), de samenvattende zin (16px, regelhoogte 26px, `--ink-m`), de drie punten met grijs lijnicoon (14px, regelhoogte 20px, iconen 20px, `--ink-s`, zelfde stijl als op de Assessment-pagina), 12px ertussen, en de knop "Bekijk dit assessment" (48px hoog, `--or`, 10px afronding, 28px padding) op 24px eronder, die naar de Assessment-pagina gaat. Alleen de knop is klikbaar.  De titel is de volledige naam van het Assessment ("Klantcontact Volwassenheid – Zorg"), het label op de cirkel is de korte naam.
- **Smal scherm**: Onder 768px staat de cirkel bovenaan op de volle breedte (hij schaalt mee) en het detailpaneel eronder. Bij het kiezen van een deel scrolt de pagina naar het paneel.
- **Teksten in het detailpaneel**: De samenvattende zin en de drie punten zijn per Assessment concreet en komen niet in elke kaart hetzelfde terug. Het eerste punt noemt het aantal vragen en de invultijd, het tweede de opbouw van het Assessment en het derde wat je in het resultaat terugziet. De aantallen komen waar het kan uit het Assessment.
  - **Klantcontact Volwassenheid**: "Breng in kaart hoe volwassen jouw klantcontactorganisatie is." Punten: "60 vragen, ±30 minuten" (klok), "15 bouwblokken in 5 categorieën" (lagen), "Concrete stappen op basis van je scores" (vlag).
  - **Klantcontact Volwassenheid – Zorg**: "Breng in kaart hoe volwassen het patiënt- of cliëntcontact van jouw zorg- of welzijnsorganisatie is." Punten: "60 vragen, ±30 minuten", "15 bouwblokken in 5 categorieën", "Scores gewogen voor de zorg, met concrete stappen".
  - **AI-Volwassenheid in Klantcontact**: "Zie hoe ver jouw organisatie is met AI in klantcontact." Punten: "40 vragen, ±20 minuten", "8 AI-domeinen", "Concrete stappen per domein".
  - **Klantcontact Quickscan – Ziekenhuis**: "Zie snel waar jouw ziekenhuis staat in klantcontact." Punten: "60 vragen, ±15 minuten", "10 dimensies", "Gemiddelde en spreiding per afdeling" (staafjes).
  - **Spanningsmeter**: "Zie waar de spanning zit tussen verhaal, regie, gedrag, data, processen en technologie." Punten: "30 vragen, ±10 tot 15 minuten", "6 spanningsvelden", "Je eigen Spanningsprofiel, daarna de groep naast elkaar".


## Assessment-pagina

Het publieke scherm per Assessment: Wat het Assessment is, de content die erbij hoort en de film Wat krijg ik. Het is één lange pagina met een sticky sub-nav (geen tabs). Ontwerp: `Herontwerp-Volwassenheid`, `Herontwerp-AI`, `Herontwerp-Quickscan` en `Landing` (Spanningsmeter) in het Design-artifact; een klikbaar voorbeeld van het scrollen staat in `Proef-Sticky`.

**Kop.** Een compacte kop van één regel: Het Assessment-icoon in een witte cirkel van 56px (schaduw `0 4px 16px rgba(28,28,26,.08)`, icoon 28px, lijndikte 1,8, `--or`) en op 20px ernaast de titel (48px, regelhoogte 56px, gewicht 800), links uitgelijnd met de container, met 56px ruimte erboven en 40px eronder (`stylesheet.md`, Kop van de Assessment-pagina en sectie-inleiding). Er staan geen eyebrow, geen uitlegzin, geen rij kenmerken en geen knop "Start assessment" in de kop. De knop staat in de sub-nav en in de sectie Praktisch, voor alle Assessments.

- **Opbouw van boven naar beneden**: De kop (zie hierboven), de sticky sub-nav, de inhoudssectie van het Assessment (bij Volwassenheid en Zorg "De 15 bouwblokken", bij de AI-scan "AI in klantcontact", bij de Spanningsmeter "De 6 spanningsvelden", bij de Quickscan "De 4 afdelingen"), "Praktisch", "Wat krijg ik", de sectie met de visie (bij Volwassenheid, Zorg en de Spanningsmeter "Visie", bij de AI-scan "Klantcontact richting 2030") en de footer. De hoofd-nav blijft bovenaan staan en de sub-nav zit eronder. Secties wisselen af tussen wit en `--bg-warm`, beginnend met wit.
- **Sticky sub-nav**: Een balk van 64px hoog met een boven- en onderrand, direct onder de hoofd-nav (`position: sticky; top: var(--nav-h)`), met links één omlijnde capsule met de pillen (pil 34px hoog, 14px, gewicht 700, de actieve pil gevuld met `--or` en witte tekst, `stylesheet.md`, Sub-nav) en rechts de uitgeschakelde knop "Start assessment". Een klik op een pil scrolt zacht naar de sectie, met ruimte erboven voor de balken (`scroll-margin-top`). Als sectie geldt de laatste sectie waarvan de bovenkant minder dan 90px onder de balk staat. De pillen werken ook als gewone ankerlinks (`#bouwblokken`, `#ai`, `#velden`, `#afdelingen`, `#praktisch`, `#wat`, `#visie`, `#2030`). Staat in het systeem verminderde beweging aan, dan scrolt de pagina niet zacht.
- **Secties per Assessment**:
  - Klantcontact Volwassenheid en Zorg: "De 15 bouwblokken", "Praktisch", "Wat krijg ik", "Visie". De Zorgscan gebruikt dezelfde teksten (zorgspecifieke teksten staan in `backlog.md`).
  - AI-volwassenheid: "AI in klantcontact", "Praktisch", "Wat krijg ik", "Klantcontact richting 2030".
  - Spanningsmeter (ontwerp `Landing` in het Design-artifact): "De 6 spanningsvelden", "Praktisch", "Wat krijg ik", "Visie". De uitwerking staat in `visualisatie-spanningsmeter.md`, Landingspagina en film Wat krijg ik.
  - Quickscan Ziekenhuis (ontwerp `Herontwerp-Quickscan` in het Design-artifact): Dezelfde kop en opbouw als de andere Assessments: De compacte kop met het icoon `cross` en de titel "Klantcontact Quickscan – Ziekenhuis", de sticky sub-nav met "De 4 afdelingen" (`#afdelingen`), "Praktisch", "Wat krijg ik" en "Visie", en de secties in die volgorde. **De 4 afdelingen** (voor de Quickscan, in de plaats van de bouwblokken): De kop "Vier afdelingen die samen het klantcontact van het ziekenhuis bepalen", een inleiding ("Je beantwoordt 60 vragen met Ja, Nee of Weet ik niet, 15 per afdeling. Daarna zie je per afdeling waar de basis op orde is en waar ontwikkelruimte zit.") en vier kaarten naast elkaar, één per afdeling: Een nummercirkel (oranje rand) met de naam, de definitie uit `content-ziekenhuis-quickscan.md` (De 4 afdelingen, in een zin zonder "X =") en onderaan de vragen per dimensie (Organisatie, Processen en techniek, Mensen; alleen de dimensies die de afdeling heeft, samen 15). Eronder een regel dat een afdeling die niet relevant is, wordt overgeslagen. Er is geen radar of spin, want de Quickscan toont percentages en bogen. De kaarten zijn niet klikbaar. **Praktisch**: Zoals bij de andere Assessments, met "±15 minuten" en "Direct resultaat" ("score per afdeling"). **Wat krijg ik**: Alleen de film Wat krijg ik van de Quickscan (`Film-Quickscan`), zonder de film Het dossier, want de Quickscan heeft geen bouwblokken met een radar. **Visie**: Dezelfde sectie als bij Volwassenheid.
- **Visie** (bron `visie-coniche.md`, deel 1): Een sectiekop met een korte inleiding en drie kaarten naast elkaar (Beloften waarmaken, Kwaliteit zit in het geheel, Van meten naar verbeteren), elk met een korte tekst en "Lees verder". "Lees verder" klapt de volledige tekst op dezelfde pagina uit; er is geen aparte pagina.
- **De 15 bouwblokken** (bron `visie-coniche.md`, deel 2, component `visual-bouwblokken-en-domeinen.md`): De interactieve visual staat hier als sectie, vijf kolommen (de categorieën) met de bouwblokken als pillen met een nummercirkel in de categoriekleur. Een klik opent de Toelichtingsmodal zoals nu.
- **AI in klantcontact** (bron `visie-ai-klantcontact.md`, component `visual-bouwblokken-en-domeinen.md`): De acht domeinen als radar met acht taartpunten en rijen in de domeinkleur (`stylesheet.md`, Groepskleuren). Een klik opent de Toelichtingsmodal.
- **Klantcontact richting 2030** (bron `content-2030.md`): De vijf ontwerpkeuzes als vijf kaarten naast elkaar (nummer, titel, één zin), daaronder pillen met de overige onderdelen van het stuk en "Lees het hele stuk", dat het volledige stuk op dezelfde pagina uitklapt.
- **Wat krijg ik**: Kop "Zo ziet je resultaat eruit" met een inleidende zin die bij het type past. Daaronder de film Wat krijg ik van het type (`help.md`, Films, met de knop "Bekijk de voorbeeld-output") en daaronder de film "Het dossier, de radar voor de Lead" (`help.md`, Films, ontwerp `Film-Dossier`), zonder knop. Beide staan in een kaart met drie stapkaarten.
- **Praktisch**: Sectiekop "Wat je kunt verwachten" met als inleiding "Bedoeld voor ..." (de doelgroep van het Assessment), de drie kaarten van Praktische informatie (invultijd, direct resultaat, privacy) en daaronder de uitgeschakelde knop "Start assessment" met het Info-icoon en de regel "Toegang loopt via een persoonlijke link van Coniche. Heb je die niet, neem dan contact op."
- **Routes**: De losse pagina's `/visie`, `/bouwblokken`, `/ai-scan` en de 2030-pagina vervallen. Een oud adres stuurt door naar de Assessment-pagina waar de content nu staat (Visie en Bouwblokken naar Klantcontact Volwassenheid, AI en 2030 naar de AI-scan).
- **Bereikbaarheid**: Een bezoeker zonder sessie komt hier via Kies jouw assessment, met alleen "Inloggen" in de nav. Een gebruiker met een persoonlijke link komt hier via "Over deze scan" op de Meting-kaart op Mijn metingen; de nav toont dan "← Terug naar Mijn metingen" en "Mijn gegevens" en het logo gaat naar Mijn metingen.- **Iconen**: De drie kaarten van Praktisch hebben grijze lijniconen (`--ink-s`, op het raster van de Assessment-iconen).


## Voorbeeld-output

Dezelfde resultaatcomponenten als de Resultatenpagina, met
vaste demodata. De resultaatcomponent wordt één keer gebouwd. Voor
elk Assessment, dus ook voor de AI-scan, de Zorgscan en de Quickscan,
staat bovenaan dezelfde kop:
- Links een eyebrow "Voorbeeld-output" (`stylesheet.md`, Label/eyebrow,
  oranje en in hoofdletters), daaronder als paginatitel (`.page-title`, 32px,
  `stylesheet.md`, Koppen en lopende tekst) de naam van het Assessment. Een
  h1 van 48px past hier niet naast de knop en breekt over twee regels.
- Rechts naast de h1, verticaal uitgelijnd met de h1, een knop
  "← Terug" (`.btn.btn-outline.btn-compact`, `stylesheet.md`, Knoptekst
  staat op één regel) naar de Assessment-pagina.
  Pijl en tekst staan op één regel en de knop heeft de hoogte
  `--control-h`.
- De kop is één component voor alle Assessments. Een afwijking per
  Assessment (andere kleur, andere knop) is een fout.
- De nav toont hier alleen "Inloggen" (Globale
  layout, punt 5). "← Terug" staat in de kop en niet ook in de nav.
Onder die kop staat bij de Spanningsmeter de weergave Groep van het resultaat met demodata (`visualisatie-spanningsmeter.md`, Resultaat). Bij de Klantcontact Volwassenheidsscan, de
AI-volwassenheidsscan en de Zorgscan de weergave Per bouwblok
van een Meting met zes demo-respondenten (`visualisatie-scores.md`, A), met
de uitleg dat de tool bij meerdere respondenten van dezelfde Meting en
organisatie ook het gemiddelde en de afwijking daarop toont.

## Toegang

Publiek scherm, geen inlog nodig. Het is de bestemming van "Uitloggen" in het Mijn gegevens-menu en van "Inloggen" op Kies jouw assessment, en de eerste stap van de e-mailverificatie-flow uit `datamodel-rollen.md` (`VerificatieCode`):

- Eén e-mailveld en een knop "Versturen".
- Na versturen: Een vaste, neutrale bevestigingstekst, ongeacht of
  het adres bestaat (bijv. "Als dit e-mailadres bekend is, ontvang
  je een nieuwe toegangslink"). Geen daadwerkelijke code of link
  wordt verstuurd: Dat vraagt de Coniche-mailserver, die er nog
  niet is (`backlog.md`). Zolang er geen mailserver is, is dit scherm een niet-functionele voorkant van de echte flow en belooft het niet meer dan het kan.
- **Met de backend**: Dit scherm wordt gevolgd door een
  code-invoerstap (`VerificatieCode`, 15 minuten geldig,
  `datamodel-rollen.md`). De link naar deze pagina blijft hetzelfde.

## Mijn metingen

De startpagina van een Respondent of Lead binnen zijn persoonlijke link.

**Openen van de persoonlijke link.** De link gaat altijd eerst naar Mijn metingen, ook als de respondent maar één
invulling heeft. Van daaruit door naar de intake (bij
`"uitgenodigd"`), de doorloopflow (bij `"bezig"`) of de resultaten
(bij `"afgerond"`), per invulling. Bij meerdere invullingen toont de
pagina ze allemaal met hun status. Bovenaan, boven de lijst, een
introtekst uit `mijnMetingenIntro` (`datamodel.md`, Algemene
teksten); beheerbaar, geen vaste tekst in de code.

**Opmaak.** Kaarten per Meting met Assessment-icoon,
statuschip, voortgang en, bij een afgeronde scan, een teaser van de
uitkomst. Een Lead ziet ook een teaser van de hele meting (alleen met
Resultaten aan en minstens `benchmarkMinRespondenten` afgeronde scans).
Volledig in `visualisatie-mijn-metingen.md`.
Knoppen: "Start de scan", "Ga verder", "Bekijk jouw resultaten".

**Bij een Lead-rol** (`datamodel-rollen.md`) toont de pagina alleen wat een
Admin voor deze Lead heeft aangevinkt (`beheerpagina.md`, punt 6a).
Bovenaan staat de naam van de organisatie. Daaronder staat één kaart per
Meting waarvoor minstens één weergave aan staat, op meetdatum, de nieuwste bovenaan, met
de nieuwste bovenaan, met alleen de knoppen Resultaten en Uitnodigen, voor zover ze aan staan
(Spreiding en Antwoorden zitten in de schakelaar op de resultatenpagina). Daaronder staat een
kaart per benchmark die aan staat. Een Lead kan alleen een benchmark
hebben, en dan bestaat de pagina alleen uit die kaart. Is de Lead ook
respondent, dan komen zijn eigen scans erbij. Een Lead die geen respondent
is, ziet geen intake, geen vragenlijst en geen lijst met eigen scans. Heeft
een Lead niets aan staan en geen scans, dan staat er een korte melding dat
er nog niets voor hem klaarstaat (`beheerpagina.md`, punt 6a).

**Over deze scan.** De content (Visie, Bouwblokken, AI en 2030) staat op de Assessment-pagina en niet in de nav. Op elke Meting-kaart van een Respondent staat een link "Over deze scan" naar de Assessment-pagina van het Assessment van die Meting, met de persoonlijke code (`?code=`). De linktekst hangt af van het type: "Over deze scan: Visie en bouwblokken" bij Klantcontact Volwassenheid en Zorg, "Over deze scan: AI-domeinen en 2030" bij de AI-scan. Bij de Quickscan staat de link er niet zolang daar geen extra content is. De link staat naast "Bekijk resultaten" (zelfde stijl, `--or`, 14px, gewicht 700). Een Lead die geen Respondent is en alleen een benchmark heeft, ziet de link niet.

## Intake

Naam, rol/functie, team en notities. Verplicht
toestemmingsvakje ("Ik geef toestemming om mijn antwoorden te delen
met Coniche"), met een link naar `privacy-pagina.md`. Alleen
client-side verplicht: Er wordt geen aparte toestemmingsstatus
opgeslagen, geen nieuw datamodel-veld. De tekst van het vakje bevat ook de toestemming voor de benchmark (`benchmark.md`, Toestemming en privacy).

**Bij de Spanningsmeter** heeft de intake geen extra velden. Een deel van een organisatie is een Onderdeel (geen afdeling en geen rolgroep). Op Mijn metingen heet de link "Over deze scan: Spanningsvelden en visie".

**Wegingskaart**: Heeft het Assessment minstens één bouwblok met een
gewicht ongelijk aan 1, dan staat bovenaan de intake (boven het
formulier) een kaart (`stylesheet.md`, Wegingskaart) met een
weegschaalicoon, met:
`Assessment.wegingTitel`, `Assessment.wegingToelichting` en daaronder
een chip per bouwblok met gewicht ongelijk aan 1, bijvoorbeeld
"Kanaalmanagement (2×)". De chips staan op volgorde van het
bouwblok-nummer. Zijn titel of toelichting leeg, dan geldt de
standaardtitel "Gewogen scoring" en de standaardtekst "Binnen dit
assessment wegen niet alle bouwblokken even zwaar mee in de
totaalscore. De volgende bouwblokken tellen extra mee:". Heeft geen
enkel bouwblok een afwijkend gewicht, dan verschijnt de kaart niet.
Gewicht 1 is de normale situatie en wordt nergens getoond. De tekst
is per Assessment aanpasbaar in beheer (`beheerpagina.md`).

## Mijn gegevens-menu

Niet te verwarren met het Accountmenu uit
`beheerpagina.md` (dat is voor beheerders, dit is voor
respondenten): Een dropdown-knop, zelfde patroon als de Dropdown-knop
uit `stylesheet.md`. Zichtbaar op elk scherm waar een respondent-
identiteit bestaat: "Mijn metingen", de doorloopflow, de
resultatenpagina en de Assessment-pagina, wanneer bereikt via een
persoonlijke link. Niet op de 3 publieke schermen en niet op de
intake zelf (daar is nog geen opgeslagen identiteit om te tonen).

Positie in `.nav-right`: Punt 5 van de navigatieregel (Globale layout), helemaal uiterst rechts, voorbij de exit-actie
"← Terug naar Mijn metingen" (niet ervoor).

- **Knop**: Label "Mijn gegevens", met het pijltje van de
  dropdown-knop. Geen naam/e-mail in de knop zelf: Die staan al in
  de dropdown-inhoud.
- **Dropdown-inhoud, rij 1, klikbaar**: "Gegevens bekijken/bewerken"
  → opent een modal (dezelfde basismodal uit
  `stylesheet.md`, "Modal en Toelichtingsmodal"), niet een
  losse pagina. In die modal hetzelfde formulier als de intake (naam,
  rol/functie, team, notities), vooringevuld met de huidige waarden
  van `Respondent`. Hergebruik van het intake-formulier, geen nieuw
  formulier bouwen. Opslaan schrijft direct naar `Respondent`, geen
  aparte bevestigingsstap.
- **Dropdown-inhoud, rij 2, klikbaar**: "Help" → opent de helppagina
  voor Respondent en Lead (`help.md`).
  "Uitloggen" schuift daardoor naar rij 3.
- **Dropdown-inhoud, laatste rij, klikbaar**: "Uitloggen" → navigeert naar
  het scherm Toegang en wist de lokale
  respondent-sessie in deze browser (de `code` die aan deze sessie
  gekoppeld is, zie `datamodel.md`, Toegangscode). Respondenten
  hebben geen account om echt op af te melden, dit is het verlaten
  van de lokale sessie, niet een serverside logout.

## Doorloopflow

Sidebar met naam respondent, voortgang, categorieën
met genummerde bouwblokken, actief bouwblok gemarkeerd met een lijn langs de actieve categorie en drie
statussen. De sidebar blijft staan als de inhoud rechts scrolt (zie
`stylesheet.md`). Per bouwblok: Een kop met een accentbalk in de
categoriekleur met de eyebrow, de titel, de centrale vraag en de
toelichting, direct zichtbaar (er is geen i-icoon en geen modal meer, en de omschrijving en de tags staan niet meer in de doorloopflow, `stylesheet.md`, Doorloopflow), de instructieregel "Beantwoord op basis van
wat aantoonbaar geregeld is (documenten, ritmes, tooling,
afspraken).", de vragen met 5-puntsschaal en één opmerkingenveld per
bouwblok. Heeft een bouwblok een gewicht ongelijk aan 1, dan staat
naast de titel een kleine chip met de factor ("2×") en in de sidebar
achter het bouwblok dezelfde marker. Bij gewicht 1 staat er niets. Op het laatste bouwblok wordt "Volgende" de knop "Bekijk
resultaten".

**Bij de Spanningsmeter** (antwoordType `spanning`) heeft de doorloopflow zes velden zonder categorieën. Per vraag staan vijf ronde knoppen 1 tot en met 5 met de niveaunaam eronder en een aparte pil "0 · Kan ik niet beoordelen"; boven de vragen staan de vijf ijkpunten van het veld, bij elke vraag een Info-knop "Waar je op let", en onder de vragen een open voorbeeldvraag die niet verplicht is en geen score krijgt. De voortgang telt de 30 gescoorde vragen (`visualisatie-spanningsmeter.md`, Doorloopflow).

**Bij Ja / Nee / Weet ik niet (Quickscan).** Bij elke vraag staan drie
knoppen, "Ja", "Nee" en "Weet ik niet", in plaats van de 5-puntsschaal.
De instructieregel komt uit `Assessment.instructieregel`. De sidebar
werkt zoals bij de andere scans: De afdelingen zijn de categorieën, met
daaronder de genummerde bouwblokken (de dimensies) en per bouwblok het
aantal beantwoorde vragen. Een bouwblok kan maar één vraag hebben
(Mensen bij de poliklinieken). Eén persoon vult de hele scan in. Elke
afdeling begint met haar definitie en de vraag of ze relevant is voor
de situatie van de respondent (Ja of Nee). Bij Nee worden haar vragen
overgeslagen en telt ze niet mee in de score (`datamodel.md`,
Antwoordtype, Optionele categorieën, en
`content-ziekenhuis-quickscan.md`, Doorloop per afdeling).

**Bron voor de toelichting.** De bouwblokbeschrijvingen in `visie-coniche.md` deel 2. Zolang die op `concept` staan (zie `inhoudelijk-fundament.md`), blijft de huidige tekst in de app staan.

**Eén persoon tegelijk per scan.** Een scan die iemand invult, is
voor anderen vergrendeld (`datamodel.md`, Bewerkslot). Opent een tweede
persoon dezelfde scan, dan krijgt die een melding dat de scan nu in
gebruik is en kan hij hem op dat moment niet openen. De scan opent
zodra het slot vrij is.

**`.nav-right`**: "Naar resultaten →" als scherm-specifieke actie,
uiterst links (met een pijl naar rechts, niet links: Dit is een
voorwaartse actie, geen terug-actie. Alleen zichtbaar zodra deze
ScanInvulling `"afgerond"` is, gaat rechtstreeks naar de Resultatenpagina zonder
opnieuw door de bouwblokken te hoeven klikken). Is deze actie
zichtbaar, dan volgt een scheidingslijn, dan "← Terug naar Mijn metingen";
is de invulling nog niet afgerond, dan staat er alleen "← Terug naar Mijn
metingen", zonder scheidingslijn.

## Resultatenpagina

Het resultaat van één ingevulde scan. Bovenaan de Resultaatkop met eyebrow, titel, subregel en totaalkaart (`stylesheet.md`, Resultaatkop, voor elke scan dezelfde). De totaalscore staat daarin in de ring (`.score-ring`, `stylesheet.md`, Resultaten), met de voortgang. Daaronder staan de radar van alle bouwblokken en het staafdiagram per categorie naast elkaar, in twee kaarten. De radar heeft genummerde knooppunten met de namen in een tooltip. Het staafdiagram staat in de categoriekleuren, zonder getallen in de balken, met de klassegrenzen als stippellijn (`stylesheet.md`, Radar en staafdiagram op het resultaatscherm). Verder staan er de top 3 sterktes, de top 3 verbeterkansen en de legenda.

**Bij AI-volwassenheid** (geen categorielaag, `content-ai-scan.md`)
vervalt het staafdiagram per categorie: In plaats daarvan "Scores per
domein", een staand kolomdiagram met een kolom per domein in volgorde 1 tot en met 8
(een eigen kleur per domein, nummercirkels onder de kolommen en de namen in de tooltip; `stylesheet.md`, Radar en staafdiagram op het resultaatscherm, Domeinen). Het staat niet meer gesorteerd op score en scrolt niet.

**Bij de Spanningsmeter** heeft het scherm geen totaalscore. Onder de Resultaatkop staan de Totaalkaart met het Gemiddeld niveau in de ring (een weergave, geen score), twee kaarten met de grootste spanning, de radar en de tabel Score per veld naast elkaar (hover in beide richtingen, zonder scroll), en bij een groep de voorbeelden uit de groep (alleen voor Leads, anoniem). Een respondent ziet Jouw profiel, een Lead met zichtbare groep kan schakelen naar Groep (`visualisatie-spanningsmeter.md`, Resultaat). Radar, staafdiagram per categorie en top 3 van de andere scans vervallen.

**Bij Ja / Nee / Weet ik niet (Quickscan)** heeft het scherm een eigen
opbouw: Een totaalkaart (met de ring, `content-ziekenhuis-quickscan.md`,
Resultaten), een kaart per afdeling (categorie) met
verdieping op de bouwblokken (dimensies), "Sterkste afdeling" en
"Meeste ontwikkelruimte", en de legenda van de drie klassen. Radar,
staafdiagram per categorie en top 3 vervallen. Een afdeling die niet
van toepassing is staat er grijs en doorgestreept, en doet niet mee in
de totaalscore of in "Sterkste afdeling" en "Meeste ontwikkelruimte". Uitwerking in `content-ziekenhuis-quickscan.md`,
Resultaten. De Exporteren-dropdown toont alleen de opties
die voor dit type bestaan. Het scherm heeft de schakelaar
Per afdeling en Overzicht (`visualisatie-quickscan.md`, 1 en 2). De
resultatenpagina van een Meting heeft voor dit type de weergaven Overzicht
(het gemiddelde van de Meting), Spreiding en Antwoorden
(`visualisatie-quickscan.md`, 3 en 4). Een benchmark tussen organisaties
heeft weergave 5. Een samengestelde Meting, een
benchmark binnen een organisatie of een Meting en Exporteren bestaan voor dit type niet.

**Weging in de resultaten**: Een bouwblok met een gewicht ongelijk
aan 1 toont zijn factor ("2×") bij de naam, in de tooltip van de radar en in de
lijst per bouwblok, en in de top 3 als het daarin staat. De getoonde
bouwblokscore zelf blijft ongewogen. Categoriescore en totaalscore zijn
gewogen (zie Scoringslogica). Geen factor bij gewicht 1. Dezelfde
markering komt terug in de PDF en staat als `gewicht` per bouwblok in
de JSON-kolom `groepsScores` van de CSV (`export-csv.md`). De
InDesign-export krijgt alleen de gewogen scores
(`export-indesign.md`, Weging).

**`.nav-right`**: "← Terug naar de scan" samen met één knop
"Exporteren" met een dropdown (opties "Als PDF", "Als CSV" en "Voor
InDesign (XML)", zie `stylesheet.md`, niet losse knoppen), als
scherm-specifieke acties, uiterst links, geen scheidingslijn tussen
die twee onderling. Dan de scheidingslijn,
dan "← Terug naar Mijn metingen". Eén gedeelde exportfunctie, zie
`beheerpagina.md` en `export-indesign.md`.

## Open punten

- De zin en de drie punten in het detailpaneel van de cirkel: Of ze beheerbaar zijn of in de code staan, en of "Concrete stappen" klopt met wat het resultaat toont (`stylesheet.md`, Vervolgstappen).
- De cirkel bij meer dan vijf Assessments, en of de stip later het gemiddelde van de branche toont (`backlog.md`).
- De tekst "Wat is goed klantcontact?" uit `visie-coniche.md` deel 1 staat in het ontwerp niet apart in de sectie Visie.
- Welke teksten bij de Zorgscan komen op de Assessment-pagina.
- De film "De radar in je resultaten" staat niet op de Assessment-pagina's, alleen Wat krijg ik en Het dossier.
- Of de teksten van Visie, Bouwblokken, AI en 2030 beheerbaar blijven zoals in `beheerpagina.md`, punt 11.
- De teksten van de Visie en van de velden van de Spanningsmeter moeten nog geverifieerd worden (`visualisatie-spanningsmeter.md`).
- Rol/functie bij de Respondent in de Intake: Vrij tekstveld of vaste lijst.
- Focus- en error-states in formulieren (`stylesheet.md`).
