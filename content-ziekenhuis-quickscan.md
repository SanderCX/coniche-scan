# Content: Klantcontact Quickscan – Ziekenhuis

Vragen en resultaatopbouw voor het `Assessment`-object "Klantcontact
Quickscan – Ziekenhuis" (`id: "quickscan-ziekenhuis"`, `kortLabel:
"Quickscan Ziekenhuis"`): 4 categorieën (de afdelingen), daaronder 10
bouwblokken (de dimensies, per afdeling 2 of 3) en 60 vragen, 15 per
afdeling. Elke vraag wordt beantwoord met Ja, Nee of Weet ik niet.
Standalone Assessment (`afgeleidVanAssessmentId: null`), dus geen
sector-variant van de Zorgscan. Het antwoordtype en de score in punten
staan in `datamodel.md` (Antwoordtype, Scoreberekening). De classificatie
staat in `CLAUDE.md`, sectie 1.

**Status**: Gebouwd op 14 oktober 2026, zie Gebouwd onderaan.

**Bron**: Joost, aangeleverd als PDF-resultaat van een ingevulde
proefscan voor een fictief ziekenhuis in de oude tool, plus twee
schermafbeeldingen van het resultaatscherm van de oude tool. De PDF
bestaat alleen uit afbeeldingen. De 60 vragen en hun dimensie zijn
daaruit overgenomen; er is geen aparte brontekst of CSV met de vragen.
De CSV-export van de oude tool (overzicht van scans) bevat geen vragen
en geen antwoorden en is niet gebruikt.

## Besloten

Door Joost, 14 oktober 2026.

- **Indeling over de dimensies.** De indeling uit de PDF is juist.
  Receptie / Centrale en Patiëntenservice hebben dus geen bouwblok
  Mensen, en Poliklinieken heeft er één met 1 vraag. De eerste
  schermafbeelding uit de oude tool, met Mensen-vragen bij elke afdeling,
  geldt niet.
- **Namen van de klassen.** Bij een afdeling en een dimensie: "Goed op
  orde", "Gemiddeld inzicht" en "Ontwikkelruimte". Bij de totaalscore,
  met dezelfde grenzen: "Sterk ontwikkeld", "Gemiddeld ontwikkeld" en
  "Aanzienlijke ontwikkelruimte" (`CLAUDE.md`, sectie 1, Classificatie).
  De legenda van de oude tool noemt het midden "Gemiddeld / Aandacht
  nodig" en toont 13–15 en 8–12 punten; die puntenrange is hier
  gecorrigeerd naar 12–15 en 8–11, want 12 van 15 is 80%.
- **Definities van de afdelingen.** Die van Verpleegafdelingen,
  Receptie / Centrale en Patiëntenservice zijn voorlopig goed. Ze zijn
  zelf geschreven en kunnen worden vervangen door de teksten uit de
  oude tool.

## Open punten, terug te leggen bij Joost

1. **Minimaal 3 vragen voor "Relatief sterkste basis".** In de oude tool
   telde een dimensie met 2 vragen (Mensen, 2/2) wel mee als sterkste
   basis. Deze spec vraagt er minstens 3, zodat een bouwblok met één of
   twee vragen niet vanzelf 100% scoort en de chip bepaalt. Het
   minimum is één waarde in de code.
2. **Radar, top 3 en staafdiagram per categorie vervallen** voor dit
   Assessment. Een radar met 4 assen zegt weinig, en de oude tool
   toonde in plaats daarvan "Sterkste onderdeel" en "Meeste
   ontwikkelruimte". Voorstel, graag bevestigen.
3. **Namen van bouwblokken komen vier keer terug.** "Organisatie" staat bij
   elke afdeling. In de wegingskaart en bij de factor ("2×") is dan niet
   te zien om welke afdeling het gaat. Voorstel: Bij dit Assessment
   tonen die plekken "Afdeling · Dimensie", bijvoorbeeld "Poliklinieken ·
   Organisatie (2×)".
4. **Alle teksten die hieronder als voorstel staan** (de zin bij de
   dimensie Mensen, subtitel, beschrijving, doelgroep, feature-cards,
   instructieregel, icoon, categoriekleur) zijn nieuw geschreven en niet
   uit de oude tool overgenomen. De definitie van Poliklinieken en de
   relevantievraag zijn wel uit de oude tool, de relevantievraag met
   "afdeling" in plaats van "organisatieonderdeel".
5. **De scan zelf heeft rework nodig.** Zie `backlog.md`, Quickscan
   Ziekenhuis, Rework. Deze spec legt de scan vast zoals hij nu is.

## Verschillen met de Klantcontact Volwassenheidsscan

- **Categorie is een afdeling, bouwblok is een dimensie.** De 4
  afdelingen zijn de categorieën. Daaronder staan per afdeling 2 of 3
  bouwblokken: Organisatie, Processen en techniek en Mensen. De vragen
  staan in die bouwblokken, dus in de volgorde van de PDF gegroepeerd per
  dimensie.
- **Geen 1–5-schaal.** Elke vraag heeft de antwoorden Ja, Nee en Weet ik
  niet. De score loopt in punten en procenten (`datamodel.md`,
  Scoreberekening).
- **Afdelingsscore uit de punten.** De categoriescore is het aantal Ja
  van de hele afdeling gedeeld door het aantal vragen (15). Het is dus
  geen gemiddelde van de bouwblokpercentages, anders telt het bouwblok
  Mensen van de poliklinieken (1 vraag) even zwaar als Processen en
  techniek (10 vragen).
- **Geen tags, geen toelichting.** De bouwblokken hebben geen tags, geen
  `toelichting` en geen `centraleVraag`. Zijn alle drie leeg, dan heeft
  de Toelichtingsmodal niets te tonen en verschijnt het icoon naast de
  titel niet. Sander controleert dat de bestaande regel "leeg = dat
  onderdeel ontbreekt" ook geldt als alles leeg is.
- **Eén invuller.** Eén Respondent vult de hele scan in.
- **Afdelingen kunnen niet van toepassing zijn.** De Respondent beantwoordt
  per afdeling eerst of die relevant is voor zijn situatie. Bij Nee
  worden de vragen van die afdeling overgeslagen en telt ze niet mee in
  de score. Alle vier de afdelingen zijn daarvoor `optioneel`
  (`datamodel.md`, Antwoordtype, Optionele categorieën).
- **Weging kan.** `Bouwblok.gewicht` werkt zoals bij de Zorgscan en
  staat nu overal op 1. Een afdeling zwaarder laten wegen betekent hetzelfde
  gewicht op al haar bouwblokken. De wegingskaart verschijnt pas als een
  bouwblok een ander gewicht krijgt (`CLAUDE.md`, scherm 4).
- **Eigen resultatenscherm**, zie Resultaten hieronder.
- **Buiten scope voor nu**: PDF-export, CSV-export, InDesign-export,
  import, managementsamenvatting, spreiding, benchmark en de matrix over
  Metingen (`backlog.md`).

## Assessment-gegevens

- Naam: "Klantcontact Quickscan – Ziekenhuis"
- `kortLabel`: "Quickscan Ziekenhuis" (voorstel)
- `icoon`: `cross`, een plusteken als omtrek in dezelfde lijnstijl als
  de andere drie (`stylesheet.md`, Assessment-icoon). Gebouwd op 14
  oktober 2026, op verzoek van Sander; de tijdelijke emoji 🏥 vervalt.
- `antwoordType`: `"ja-nee-weetniet"`, `schaal`: `null`
- `relevantieVraag`: "Is deze afdeling relevant voor uw situatie?" (in de
  oude tool "Is dit organisatieonderdeel relevant voor uw situatie?")
- `categorieen`: De 4 afdelingen, elk met `optioneel: true` en een
  `omschrijving` (de definitie, zie De 4 afdelingen), `bouwblokken`:
  `null`. `Categorie.kleur`
  voorstel: Voor alle vier de oranje van de AI-volwassenheidsscan, want de
  afdelingen hebben geen eigen betekenis in kleur. De resultaten gebruiken
  de klassekleuren, geen categoriekleur.
- `Bouwblok.volgnummer` loopt door over de afdelingen, 1 tot en met 10.
- `scoresPerGroepGesorteerd`: `false`; de afdelingen staan in de volgorde
  van de lijst hieronder.
- `bouwblokLabel`: "Dimensie", `bouwblokEenheidEnkelvoud`: "dimensie",
  `bouwblokEenheidMeervoud`: "dimensies".
- Subtitel (voorstel): "±15 minuten. Snel inzicht in waar het ziekenhuis
  staat."
- Beschrijving (voorstel): "Deze quickscan geeft inzicht in hoe goed
  klantcontact in jouw ziekenhuis is geregeld, per afdeling:
  Poliklinieken, verpleegafdelingen, receptie en centrale, en
  patiëntenservice. Je beantwoordt 60 vragen met Ja, Nee of Weet ik niet
  en ziet daarna per afdeling waar de basis op orde is en waar
  ontwikkelruimte zit."
- Doelgroep (voorstel): "Ziekenhuizen die willen weten hoe het
  telefonisch klantcontact per afdeling is geregeld en waar ze het
  eerst moeten verbeteren."
- Geschatte duur: ±15 minuten.
- Feature-cards (voorstel): "4 afdelingen", "Resultaat per dimensie",
  "Direct resultaat".
- Instructieregel (`Assessment.instructieregel`, voorstel): "Kies Ja als
  dit aantoonbaar geregeld is. Is het niet geregeld, kies Nee. Weet je
  het niet, kies Weet ik niet; dat telt voor de score als Nee."
- Weging: `wegingTitel` en `wegingToelichting` leeg (standaardtekst
  geldt zodra een gewicht afwijkt).

## Dimensies en de aandachtZin

De drie dimensies komen als bouwblok terug in elke afdeling waar ze
vragen hebben. De `aandachtZin` staat op `Bouwblok.aandachtZin` en is
voor alle bouwblokken met dezelfde naam gelijk. Het is de zin die onder
de afdelingskaart staat als dit bouwblok het grootste aandachtspunt van
de afdeling is.

1. **Organisatie**: "Binnen deze afdeling lijkt de organisatorische
   borging van klantcontact nog beperkt ontwikkeld."
2. **Processen en techniek**: "Binnen deze afdeling lijkt de grootste
   ontwikkelruimte te zitten in processen, werkwijzen en ondersteunende
   techniek."
3. **Mensen** (voorstel, de oude tool liet deze zin niet zien): "Binnen
   deze afdeling lijkt de grootste ontwikkelruimte te zitten bij de
   mensen, in kennis, bevoegdheden en de belasting door telefonie."

De zinnen zijn per bouwblok aan te passen in beheer. De oude tool sprak
van "onderdeel" in plaats van "afdeling"; die woorden zijn hier aan de
tekst van deze spec aangepast.

## Doorloop per afdeling

Elke afdeling begint in de doorloopflow met twee kaarten boven de vragen
(`CLAUDE.md`, scherm 5):

1. Een kaart met de naam van de afdeling, een oranje balk links ervan en
   daaronder de definitie (`Categorie.omschrijving`).
2. Een kaart met `Assessment.relevantieVraag` en de keuzes Ja en Nee.

Pas na Ja volgen de bouwblokken van de afdeling. Bij Nee gaat
"Volgende" naar de volgende afdeling. In de sidebar staat een afdeling
die niet van toepassing is grijs met "n.v.t." (voorstel). De Respondent
kan zijn keuze later wijzigen; de regels voor voortgang, afronden en
bewaarde antwoorden staan in `datamodel.md`, Antwoordtype, Optionele
categorieën.

## Resultaten

Dit Assessment heeft een eigen opbouw van het resultatenscherm
(scherm 6 in `CLAUDE.md`). Alle onderdelen gebruiken de bestaande
componenten en tokens uit `stylesheet.md` (kaart, badge, voortgangsbalk,
scorekleuren). Klassen en grenzen: `CLAUDE.md`, sectie 1,
Classificatie. Van boven naar beneden:

1. **Totaalkaart.** Links het label "OVERALL VOLWASSENHEID", het
   totaalpercentage groot met "({punten}/{maximum})" ernaast en daaronder
   de klassenaam van de totaalscore in klassekleur. Rechts
   een cirkel met het percentage, "{x} van 4 afdelingen beoordeeld" en
   "{punten} van {maximum} punten". Alleen de afdelingen die van
   toepassing zijn tellen mee, dus bij één afdeling met 14 Ja staat er
   "93%", "(14/15)" en "1 van 4 afdelingen beoordeeld". Met weging staan
   hier de gewogen punten (`datamodel.md`, Scoreberekening).
2. **Scores per afdeling.** Een kaart per categorie, twee kolommen, in
   de volgorde van de afdelingen. Een afdeling die niet van toepassing is
   krijgt een grijze kaart met de naam doorgestreept, de tekst "Niet van
   toepassing" en geen score. Per kaart van een afdeling die wel van
   toepassing is:
   - Linkerrand en badge in de klassekleur van de afdeling; de badge
     toont de klassenaam.
   - De naam van de afdeling, daaronder "{punten}" groot met "/ {aantal
     vragen}" en het percentage, en een voortgangsbalk in klassekleur.
   - De tellingen "Ja: 10", "Nee: 3", "Weet niet: 2", in de kleuren
     groen, rood en grijs.
   - Het blok "Verdieping op dimensies": Per bouwblok van de afdeling de
     naam, een balk in de klassekleur van dat bouwblok en "x/y (z%)", in
     de volgorde van de bouwblokken.
   - Onder de balken de `aandachtZin` en twee chips, zie Regels
     hieronder.
3. **Sterkste afdeling en Meeste ontwikkelruimte.** Twee kaarten naast
   elkaar. "Sterkste afdeling" (groen) toont de afdeling met het hoogste
   percentage, "Meeste ontwikkelruimte" (rood) die met het laagste, elk
   met "x/y (z%)". Afdelingen die niet van toepassing zijn doen niet mee.
   Bij gelijkstand staan alle gelijke afdelingen in de kaart. Is er maar
   één afdeling van toepassing, of zijn alle gelijk, dan verdwijnen beide
   kaarten.
4. **Classificatie.** Een legenda met de drie klassen: Naam,
   percentagegrens en, omdat alle afdelingen hier 15 vragen hebben, de
   punten per afdeling. Zijn de aantallen vragen per afdeling ooit
   ongelijk, dan toont de legenda alleen percentages.

De radar, het staafdiagram per categorie, de top 3 en "Scores per
Domein" vervallen voor dit Assessment (open punt 2). Ter vervanging
komt er een tweede stand Overzicht met alle afdelingen en bouwblokken
in één blik. Die en de weergaven voor de groep, de antwoorden per
vraag en de benchmark staan in `visualisatie-quickscan.md`.

### Regels voor de bouwblokken per afdeling

- **Bouwblokscore.** Aantal Ja gedeeld door het aantal vragen van het
  bouwblok, getoond als "x/y (z%)". Het percentage is afgerond op hele
  procenten, half-away-from-zero. Klasse en kleur volgen de afgeronde
  waarde, dus 50% is Gemiddeld inzicht (oranje) en 80% is Goed op orde
  (groen).
- **Chips.** Er komen alleen chips en een `aandachtZin` als de afdeling
  minstens 2 bouwblokken heeft. Vergelijken gebeurt op de exacte
  verhouding, niet op het afgeronde percentage.
  - "Grootste aandachtspunt: {bouwblok}." hoort bij het bouwblok met de
    laagste score, rood omrand. De `aandachtZin` van dat bouwblok staat
    erboven.
  - "Relatief sterkste basis: {bouwblok}." hoort bij het bouwblok met de
    hoogste score onder de bouwblokken met minstens 3 vragen, groen
    omrand.
  - Delen twee of meer bouwblokken de laagste score, dan komt er geen
    aandachtspunt en geen `aandachtZin`. Delen ze de hoogste, dan komt
    er geen sterkste basis.
  - De chips verschijnen ook als de afdeling zelf Goed op orde is.

## De 4 afdelingen

De vraagteksten zijn letterlijk uit de PDF overgenomen, inclusief
"terugbel-lijsten" bij vraag 10 van de poliklinieken. Achter elk
bouwblok staan de nummers van de vragen in de PDF, zodat de indeling na
te lopen is. Binnen een bouwblok blijft de volgorde van de
PDF.

### 1. Poliklinieken

Definitie (`Categorie.omschrijving`, uit de oude tool): "Polikliniek =
een patiënt komt hier, alleen op afspraak, voor medische consulten,
onderzoeken of kleine behandelingen door een arts-specialist, zonder
opname"

**Organisatie** (4 vragen, PDF 1, 11, 13, 15)
1. Is duidelijk wie op de polikliniek verantwoordelijk is voor het
   beheer van telefonie en bereikbaarheid?
2. Zijn rapportages beschikbaar over bereikbaarheid (bijv. wachttijd in
   seconden, % beantwoord)?
3. Is aantoonbaar dat telefonische informatie de uitkomsten beïnvloedt
   in afsprakenplanning?
4. Wordt de patiënttevredenheid over telefonische bereikbaarheid
   gemeten en gebruikt voor verbeteringen?

**Processen en techniek** (10 vragen, PDF 2, 3, 4, 5, 6, 7, 8, 10, 12, 14)
1. Bestaat er een vaste werkinstructie voor het opnemen, afhandelen en
   registreren van telefoontjes?
2. Wordt binnen de polikliniek gewerkt met één primair systeem voor
   telefoonregistratie (bijv. EPD-taken, tickets, bellijsten)?
3. Is er een standaard procedure voor doorverbinden en
   terugbelverzoeken?
4. Zijn wachttijdafspraken richting patiënten (bijv. max. X keer
   overgaan) bekend bij de medewerkers?
5. Zijn telefonische contactredenen eenduidig vastgelegd in het EPD of
   een ander systeem?
6. Wordt vastgelegd hoeveel belverzoeken per dag/week binnenkomen én
   worden afgehandeld?
7. Is er inzicht in de piekmomenten van het telefonieverkeer op de
   poli?
8. Worden actuele wachtrijen/achterstanden (bijv. terugbel-lijsten)
   structureel gemonitord?
9. Worden volumes en benodigde capaciteit voorspeld op basis van
   historische data?
10. Worden telefonische escalaties (bijv. medicatie, klachten,
    spoedvragen) systematisch geregistreerd en geanalyseerd?

**Mensen** (1 vraag, PDF 9)
1. Is er een actueel overzicht van welke medewerkers bevoegd zijn
   medische vragen telefonisch te beantwoorden?

### 2. Verpleegafdelingen

Definitie (voorstel): "Verpleegafdeling = een patiënt verblijft hier met
opname, voor behandeling en zorg door verpleegkundigen en artsen"

**Organisatie** (2 vragen, PDF 12, 14)
1. Worden trends in telefonische escalaties (bijv. acute
   verslechtering) geanalyseerd?
2. Worden telefoonlogs van nachtdiensten en weekenden gemonitord om te
   bepalen of extra ondersteuning nodig is?

**Processen en techniek** (7 vragen, PDF 1, 2, 3, 4, 8, 9, 13)
1. Is vastgelegd welke telefoonnummers de afdeling gebruikt voor
   patiënten, mantelzorgers en andere zorgverleners?
2. Is er een standaard werkwijze voor het aannemen van telefoontjes van
   familie?
3. Is duidelijk wie verantwoordelijk is voor het beantwoorden van de
   afdelingstelefoon tijdens drukte (verdeling binnen shifts)?
4. Is er een protocol voor hoe verpleegkundigen berichten of
   terugbelverzoeken tussen collega's vastleggen?
5. Bestaat er een overzicht van oproepsystemen (DECT, smartphone,
   pieper) en bijbehorende workflows?
6. Wordt informatie over belangrijke patiëntsituaties (bijv. ontslag,
   complicaties) systematisch doorgegeven via vaste belprotocollen?
7. Is er een analyse van onveilige situaties veroorzaakt door gemiste
   of vertraagde telefoontjes?

**Mensen** (6 vragen, PDF 5, 6, 7, 10, 11, 15)
1. Is bekend welke medische vragen wél/niet telefonisch beantwoord
   mogen worden door de afdeling?
2. Worden telefoontjes van familieleden geregistreerd in het EPD (bijv.
   afspraken, zorgen, updates)?
3. Is er inzicht in hoeveel onderbrekingen verpleegkundigen dagelijks
   ervaren door telefoonverkeer?
4. Is er een schaal of lijst beschikbaar voor triage van telefonische
   vragen van mantelzorgers?
5. Is aantoonbaar hoeveel tijd verpleegkundigen kwijt zijn aan
   telefonische communicatie per dienst?
6. Wordt patiënt- en familie-ervaring over telefonische communicatie
   structureel gemeten?

### 3. Receptie / Centrale

Definitie (voorstel): "Receptie / Centrale = de balie en de
telefooncentrale waar bezoekers en bellers als eerste terechtkomen en
worden doorverbonden"

**Organisatie** (3 vragen, PDF 9, 13, 15)
1. Wordt inzichtelijk gemaakt hoeveel gesprekken worden gemist of
   afgebroken?
2. Zijn kosten en capaciteit van de centrale inzichtelijk gemaakt
   (FTE, kosten per gesprek)?
3. Worden rapportages actief gebruikt om routering te verbeteren of
   afdelingen te adviseren?

**Processen en techniek** (12 vragen, PDF 1 t/m 8, 10, 11, 12, 14)
1. Is er een actuele lijst van alle interne telefoonnummers en
   overplaatsingsregels?
2. Zijn er duidelijke richtlijnen voor begroeting, identificatie en
   doorverbinden?
3. Wordt gewerkt met een vast script voor veelvoorkomende vragen
   (route, bezoektijden, parkeren)?
4. Is duidelijk bij welke situaties niet mag worden doorverbonden
   (bijv. spoedlijnen)?
5. Is bekend welk telefoonplatform/centralesysteem de receptie
   gebruikt?
6. Zijn cijfers beschikbaar over het aantal binnenkomende telefoontjes
   per dag/maand?
7. Wordt de gemiddelde verwerkingstijd (AHT) per gesprek gemeten?
8. Zijn routeringsregels voor afdelingen (bijv. triage, prioriteit)
   vastgelegd?
9. Is er zicht op wachttijden in de telefonische wachtrij en
   piekbelastingpatronen?
10. Wordt er CTI-koppeling gebruikt om gegevens automatisch mee te
    geven bij doorverbinden?
11. Wordt kanaaleffectiviteit (telefoon vs. selfservice) geanalyseerd?
12. Wordt kwaliteit periodiek gemeten (bijv. mystery calling,
    QA-formulieren)?

### 4. Patiëntenservice

Definitie (voorstel): "Patiëntenservice = het team dat vragen, verzoeken
en klachten van patiënten afhandelt, buiten de directe behandeling om"

**Organisatie** (5 vragen, PDF 8, 11, 12, 13, 14)
1. Wordt de naleving van doorlooptijden (bijv. binnen 24 uur
   terugbellen) gemonitord?
2. Worden selfservice-alternatieven (FAQ, portaal, chatbot) actief
   bijgehouden en gemonitord?
3. Is er inzicht in hoeveel telefonische vragen door digitalisering
   kunnen worden voorkomen?
4. Worden trends/tijdslijnen van klachten of herhaalverzoeken
   geanalyseerd?
5. Is er een integrale rapportage die laat zien hoe telefonische
   contacten door de keten bewegen (service → poli → arts)?

**Processen en techniek** (10 vragen, PDF 1 t/m 7, 9, 10, 15)
1. Is er een duidelijke taakomschrijving van het team (bijv.
   afspraken, algemene informatie, klachtenmeldpunt)?
2. Zijn scripts of standaardantwoorden beschikbaar voor de meest
   gestelde vragen?
3. Is er een vaste procedure voor het escaleren van medische vragen
   naar de juiste afdeling?
4. Wordt informatie die patiënten telefonisch delen correct vastgelegd
   in het betreffende systeem?
5. Is duidelijk wie verantwoordelijk is voor het actueel houden van
   informatie (protocollen, Q&A)?
6. Worden volumes per vraagtype vastgelegd (bijv. afspraken,
   wachtlijstvragen, klachten, portaalvragen)?
7. Kan het team zien of een patiënt al eerder contact heeft opgenomen
   en wat er toen besproken is?
8. Zijn er afspraken met poliklinieken over wachttijden, urgentie en
   terugkoppeling?
9. Wordt de kwaliteit van afhandeling gemeten via QA of
   tevredenheidsmetingen?
10. Worden resultaten (bijv. wachttijd, volumes, succes selfservice)
    gebruikt om de organisatie te adviseren of beleid aan te passen?

## Gebouwd

Gebouwd op 14 oktober 2026. De scoring staat in `lib/quickscan.ts` (met tests in
`lib/quickscan.test.ts`), de content in `data/ziekenhuis-quickscan-assessment.ts`, de demo-antwoorden voor de
voorbeeld-output in `data/demo-antwoorden-quickscan.ts`, de kaarten in `components/AfdelingKaarten.tsx`,
`components/JaNeeRadio.tsx` en `components/QuickscanResultaten.tsx`.

**De open punten bovenaan, zoals gebouwd**

1. Het minimum van 3 vragen voor "Relatief sterkste basis" staat als één constante (`MIN_VRAGEN_STERKSTE_BASIS`).
   "Grootste aandachtspunt" en "Relatief sterkste basis" komen alleen bij minstens twee dimensies in een afdeling en
   alleen als er één laagste respectievelijk hoogste is. Bij gelijkstand staat er geen chip.
2. Radar, top 3 en staafdiagram per categorie vervallen voor dit Assessment. In plaats daarvan staan "Sterkste afdeling" en
   "Meeste ontwikkelruimte" (alle gelijke afdelingen bij gelijkstand, geen van beide bij één afdeling of als alles gelijk is).
3. De wegingskaart toont de naam als "Afdeling · Dimensie", bijvoorbeeld "Poliklinieken · Organisatie (2×)". De factor in de
   doorloopflow en in de sidebar staat al binnen de afdeling en blijft "2×".
4. De voorgestelde teksten staan zoals in dit bestand en zijn te wijzigen in beheer: Bij het Assessment de instructieregel en
   de relevantievraag, bij een afdeling de omschrijving en het vinkje Optioneel, bij een dimensie de zin bij het grootste
   aandachtspunt (`aandachtZin`).

**Keuzes bij het bouwen**

- **Opslag.** De antwoorden staan als `"ja"`, `"nee"` of `"weet-niet"` in `ScanInvulling.antwoorden`, de relevantie per
  afdeling in `ScanInvulling.relevantie`. Een Assessment met dit type heeft `schaal: []` in de code in plaats van `null`, zodat
  bestaande schermen die de schaal doorlopen niet breken. Alle schaalfuncties negeren een antwoord dat geen getal is.
- **Toelichtingsicoon.** De dimensies hebben geen toelichting, centrale vraag of tags. Het ⓘ naast de titel van een bouwblok
  verschijnt daarom alleen als er een toelichting of centrale vraag is, bij elk Assessment.
- **Bestaande data.** Een browser of serverkopie met opgeslagen Assessments krijgt de Quickscan er één keer bij. Een Admin die
  het Assessment verwijdert, ziet het niet terugkomen (per browser onthouden).
- **Schermen die niet uitgewerkt zijn voor dit type** (besloten bij het bouwen, zie ook `backlog.md`):
  - Resultaten van een Meting in beheer en voor een Lead: Een melding dat het gemiddelde nog niet is uitgewerkt. Het
    resultaat van elke scan staat bij de scan zelf.
  - Leads-venster: Alleen Uitnodigen is te kiezen, de andere vinkjes zijn grijs met de reden.
  - Benchmark en samengestelde Meting: Het Assessment staat niet in de keuzelijst.
  - Exporteren: De dropdown ontbreekt op de resultatenpagina en in het Meting-overzicht. De CSV-bulkexport slaat deze scans
    over en meldt dat.
  - Het testknopje in de doorloopflow vult voor dit type Ja, Nee en Weet ik niet, waarbij het gekozen cijfer bepaalt hoeveel
    vragen Ja krijgen.
